const {
  ROOM_CATALOG,
  livekitConfig,
  parseParticipantMetadata,
  roomService,
  setApiHeaders,
} = require('../lib/livekit');

module.exports = async (req, res) => {
  setApiHeaders(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  const config = livekitConfig();
  if (!config) return res.status(503).json({ error: 'LIVEKIT_NO_CONFIGURADO' });

  try {
    const service = roomService(config);
    const names = Object.keys(ROOM_CATALOG);
    const activeRooms = await service.listRooms(names);
    const byName = new Map(activeRooms.map((room) => [room.name, room]));
    const rooms = await Promise.all(names.map(async (name) => {
      const info = ROOM_CATALOG[name];
      const room = byName.get(name);
      const count = room ? Number(room.numParticipants || 0) : 0;
      // La vista pública necesita nombres solo para el auditorio principal.
      // Consultar la lista completa de cada campus en cada sondeo no escala.
      const participants = name === 'MJ-D5-Vigilia' && count > 0
        ? await service.listParticipants(name)
        : [];
      return {
        name,
        label: info.label,
        campus: info.campus,
        proxima: info.proxima || '',
        active: count > 0,
        count: name === 'MJ-D5-Vigilia' && participants.length ? participants.length : count,
        participants: participants.map((participant) => {
          const metadata = parseParticipantMetadata(participant.metadata);
          return {
            name: String(participant.name || 'Joven D5').slice(0, 32),
            role: String(metadata.role || 'attendee'),
          };
        }),
      };
    }));
    return res.status(200).json({ configured: true, rooms });
  } catch (error) {
    console.error('[LiveKit] no se pudo consultar el estado:', error && error.message);
    return res.status(502).json({ error: 'LIVEKIT_NO_DISPONIBLE' });
  }
};
