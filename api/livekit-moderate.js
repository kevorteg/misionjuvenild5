const {
  AccessToken,
  DataPacket_Kind,
  TokenVerifier,
  TrackSource,
} = require('livekit-server-sdk');
const {
  ROOM_CATALOG,
  parseParticipantMetadata,
  livekitConfig,
  roomService,
  setApiHeaders,
} = require('../lib/livekit');

function bearer(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

module.exports = async (req, res) => {
  setApiHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  const config = livekitConfig();
  if (!config) return res.status(503).json({ error: 'LIVEKIT_NO_CONFIGURADO' });

  try {
    const claims = await new TokenVerifier(config.apiKey, config.apiSecret).verify(bearer(req));
    const body = req.body || {};
    const room = String(body.room || '');
    const action = String(body.action || '');
    if (!ROOM_CATALOG[room] || claims.video?.room !== room || !claims.video?.roomAdmin || !claims.sub) {
      return res.status(403).json({ error: 'PERMISO_INSUFICIENTE' });
    }

    const service = roomService(config);
    const actor = await service.getParticipant(room, claims.sub);
    const actorMetadata = parseParticipantMetadata(actor.metadata);
    const actorRole = actorMetadata.role;
    if (!['admin', 'host', 'moderator'].includes(actorRole)) {
      return res.status(403).json({ error: 'PERMISO_INSUFICIENTE' });
    }

    const targetIdentity = String(body.targetIdentity || '').slice(0, 80);
    const target = targetIdentity ? await service.getParticipant(room, targetIdentity) : null;
    const targetMetadata = target ? parseParticipantMetadata(target.metadata) : {};
    const targetRole = targetMetadata.role || 'attendee';
    const actorIsHost = actorRole === 'admin' || actorRole === 'host';

    // Asignar el encargo de un líder (oración, alabanza, prédica…). Solo el
    // anfitrión/admin puede hacerlo, y no pasa por las reglas de moderación
    // porque no expulsa ni silencia: solo etiqueta a un líder de la mesa.
    if (action === 'set-encargo') {
      if (!actorIsHost) return res.status(403).json({ error: 'SOLO_ANFITRION' });
      if (!target) return res.status(404).json({ error: 'PARTICIPANTE_NO_ENCONTRADO' });
      const encargo = String(body.encargo || '').replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ \.\-]/g, '').trim().slice(0, 40);
      if (!encargo) return res.status(400).json({ error: 'ENCARGO_VACIO' });
      await service.updateParticipant(room, targetIdentity, {
        metadata: JSON.stringify({ ...targetMetadata, encargo }),
      });
      return res.status(200).json({ ok: true, action, targetIdentity, encargo });
    }

    if (!actorIsHost && target && ['moderator', 'host', 'admin'].includes(targetRole)) {
      return res.status(403).json({ error: 'MODERADOR_SOLO_PUEDE_MODERAR_ASISTENTES' });
    }
    if (!actorIsHost && ['make-moderator', 'revoke-moderator', 'end-room'].includes(action)) {
      return res.status(403).json({ error: 'SOLO_ANFITRION' });
    }
    if (target && ['admin', 'host'].includes(targetRole)) {
      return res.status(403).json({ error: 'NO_SE_PUEDE_MODERAR_AL_ANFITRION' });
    }

    if (action === 'kick' && target) {
      await service.removeParticipant(room, targetIdentity, { revokeTokenTs: BigInt(Math.floor(Date.now() / 1000)) });
    } else if (action === 'mute' && target) {
      if (targetRole === 'moderator') return res.status(400).json({ error: 'USA_REVOCAR_MODERADOR' });
      const microphoneTracks = (target.tracks || []).filter((track) => track.source === TrackSource.MICROPHONE);
      await Promise.all(microphoneTracks.map((track) => service.mutePublishedTrack(room, targetIdentity, track.sid, true)));
      await service.updateParticipant(room, targetIdentity, {
        metadata: JSON.stringify({ ...targetMetadata, role: 'muted' }),
        permission: {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canPublishSources: [TrackSource.CAMERA],
        },
      });
    } else if (action === 'give-floor' && target) {
      await service.updateParticipant(room, targetIdentity, {
        metadata: JSON.stringify({ ...targetMetadata, role: 'speaker' }),
        permission: {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canPublishSources: [TrackSource.MICROPHONE, TrackSource.CAMERA],
        },
      });
    } else if (action === 'make-moderator' && target) {
      const expires = new AccessToken(config.apiKey, config.apiSecret, {
        identity: targetIdentity,
        name: target.name || 'Moderador D5',
        metadata: JSON.stringify({ ...targetMetadata, role: 'moderator', room }),
        ttl: '1h',
      });
      expires.addGrant({ roomJoin: true, room, roomAdmin: true, canPublish: true, canSubscribe: true, canPublishData: true });
      const moderatorToken = await expires.toJwt();
      await service.updateParticipant(room, targetIdentity, {
        metadata: JSON.stringify({ ...targetMetadata, role: 'moderator' }),
        permission: {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canPublishSources: [TrackSource.MICROPHONE, TrackSource.CAMERA, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO],
        },
      });
      await service.sendData(room, Buffer.from(JSON.stringify({ k: 'role', role: 'moderator', token: moderatorToken })), DataPacket_Kind.RELIABLE, {
        destinationIdentities: [targetIdentity],
        topic: 'd5-admin',
      });
    } else if (action === 'revoke-moderator' && target && targetRole === 'moderator') {
      // Desconecta y revoca el token roomAdmin actual; al volver a entrar recibe rol de asistente.
      await service.removeParticipant(room, targetIdentity, { revokeTokenTs: BigInt(Math.floor(Date.now() / 1000)) });
    } else if (action === 'end-room' && actorIsHost) {
      await service.deleteRoom(room);
    } else {
      return res.status(400).json({ error: 'ACCION_NO_VALIDA' });
    }

    return res.status(200).json({ ok: true, action, targetIdentity: targetIdentity || undefined });
  } catch (error) {
    // Distinguir "no existe" (404) de "token/acción inválidos" (403) y de una
    // falla real del servidor (502). Antes todo caía en 403 y una avería del
    // servidor se veía como un problema de permisos del usuario.
    if (error && error.status === 404) {
      return res.status(404).json({ error: 'PARTICIPANTE_NO_ENCONTRADO' });
    }
    // Un token ausente, vacío o mal formado es un error del cliente (403), no
    // una avería del servidor. jose (la librería que usa LiveKit) marca estos
    // fallos con códigos ERR_JWS_* / ERR_JWT_* y `name` JWSInvalid/JWTInvalid.
    if (error && (
      error.name === 'TokenVerificationError' ||
      error.status === 401 || error.status === 403 ||
      /^ERR_JW[ST]_/.test(String(error.code || '')) ||
      /^(JWS|JWT)/.test(String(error.name || ''))
    )) {
      return res.status(403).json({ error: 'TOKEN_O_ACCION_INVALIDOS' });
    }
    console.error('[LiveKit] la moderación falló:', error && error.message);
    return res.status(502).json({ error: 'MODERACION_NO_DISPONIBLE' });
  }
};
