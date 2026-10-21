/** LiveKit access tokens. Room keys and API secrets stay in server env vars. */
const { AccessToken, TrackSource } = require('livekit-server-sdk');
const {
  ROOM_CATALOG, cleanName, getHostRole, getRoomJoinCodeStatus, livekitConfig, roomService, setApiHeaders,
} = require('../lib/livekit');

module.exports = async (req, res) => {
  setApiHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  const config = livekitConfig();
  if (!config) return res.status(503).json({ error: 'LIVEKIT_NO_CONFIGURADO' });

  try {
    const body = req.body || {};
    const room = String(body.room || '');
    const info = ROOM_CATALOG[room];
    if (!info) return res.status(400).json({ error: 'SALA_NO_PERMITIDA' });
    const action = body.action === 'start' ? 'start' : 'join';
    const hostRole = action === 'start' ? getHostRole(room, body.hostCode) : null;
    if (action === 'start' && !hostRole) return res.status(403).json({ error: 'CLAVE_ANFITRION_INVALIDA' });
    if (action === 'join') {
      const access = getRoomJoinCodeStatus(room, body.joinCode);
      if (access.configurationError) return res.status(503).json({ error: 'CLAVE_SALA_NO_CONFIGURADA' });
      if (!access.ok) return res.status(403).json({ error: 'CLAVE_SALA_INVALIDA' });
    }

    const service = roomService(config);
    let [existing] = await service.listRooms([room]);
    if (!existing && hostRole) {
      existing = await service.createRoom({
        name: room,
        maxParticipants: 100,
        emptyTimeout: 300,
        departureTimeout: 30,
        metadata: JSON.stringify({ campus: info.campus, label: info.label }),
      });
    }
    if (!existing) return res.status(409).json({ error: 'SALA_INACTIVA' });
    const connected = await service.listParticipants(room);
    if (action === 'join' && !connected.length && !hostRole) {
      return res.status(409).json({ error: 'SALA_INACTIVA' });
    }

    const name = cleanName(body.name, 'Joven D5', 32);
    const identity = 'd5-' + require('crypto').randomBytes(12).toString('hex');
    const role = hostRole || 'attendee';
    const token = new AccessToken(config.apiKey, config.apiSecret, {
      identity,
      name,
      ttl: '4h',
      metadata: JSON.stringify({ role, campus: info.campus, room }),
    });
    const grant = {
      roomJoin: true,
      room,
      canPublish: role === 'host' || role === 'admin',
      canSubscribe: true,
      canPublishData: true,
    };
    if (role === 'host' || role === 'admin') {
      grant.roomAdmin = true;
      grant.canPublishSources = [TrackSource.MICROPHONE, TrackSource.CAMERA, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO];
    }
    token.addGrant(grant);
    return res.status(200).json({ token: await token.toJwt(), url: config.url, room, role, name, campus: info.campus });
  } catch (error) {
    console.error('[LiveKit] no se pudo crear el acceso:', error && error.message);
    return res.status(502).json({ error: 'LIVEKIT_NO_DISPONIBLE' });
  }
};
