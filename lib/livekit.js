const { RoomServiceClient } = require('livekit-server-sdk');

const ROOM_CATALOG = Object.freeze({
  'MJ-D5-Vigilia': { label: 'Transmisión D5', campus: 'Distrito D5', proxima: 'Consulta el calendario para ver los próximos encuentros publicados.' },
  'MJ-D5-Univalle': { label: 'Universidad del Valle', campus: 'Univalle', proxima: 'Consulta el calendario para ver los próximos encuentros publicados.' },
  'MJ-D5-ICESI': { label: 'Universidad Icesi', campus: 'ICESI', proxima: 'Consulta el calendario para ver los próximos encuentros publicados.' },
  'MJ-D5-USC': { label: 'Universidad Santiago de Cali', campus: 'USC', proxima: 'Consulta el calendario para ver los próximos encuentros publicados.' },
  'MJ-D5-SENA': { label: 'SENA', campus: 'SENA', proxima: 'Consulta el calendario para ver los próximos encuentros publicados.' },
  'MJ-D5-UAO': { label: 'Universidad Autónoma', campus: 'UAO', proxima: 'Consulta el calendario para ver los próximos encuentros publicados.' },
  'MJ-D5-Javeriana': { label: 'Pontificia Universidad Javeriana', campus: 'Javeriana', proxima: 'Consulta el calendario para ver los próximos encuentros publicados.' },
});

function livekitConfig() {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) return null;

  const httpUrl = url.replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:');
  return { url, apiKey, apiSecret, httpUrl };
}

function roomService(config) {
  return new RoomServiceClient(config.httpUrl, config.apiKey, config.apiSecret);
}

function cleanName(value, fallback, maxLength) {
  const result = String(value || '')
    .replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .\-_]/g, '')
    .trim()
    .slice(0, maxLength || 32);
  return result || fallback;
}

function parseParticipantMetadata(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function getHostRole(room, suppliedCode) {
  if (!suppliedCode) return null;
  const safeEqual = require('crypto').timingSafeEqual;
  const equal = (a, b) => {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));
    return left.length === right.length && safeEqual(left, right);
  };

  if (process.env.LIVEKIT_ADMIN_CODE && equal(suppliedCode, process.env.LIVEKIT_ADMIN_CODE)) {
    return 'admin';
  }

  let roomCodes = {};
  try {
    roomCodes = JSON.parse(process.env.LIVEKIT_ROOM_HOST_CODES || '{}');
  } catch (_) {
    return null;
  }
  return typeof roomCodes[room] === 'string' && equal(suppliedCode, roomCodes[room]) ? 'host' : null;
}

function getRoomJoinCodeStatus(room, suppliedCode) {
  const required = String(process.env.LIVEKIT_REQUIRE_ROOM_JOIN_CODE || '').toLowerCase() === 'true';
  let codes = {};
  try { codes = JSON.parse(process.env.LIVEKIT_ROOM_JOIN_CODES || '{}'); }
  catch (_) { return { ok: false, configurationError: true }; }
  const expected = typeof codes[room] === 'string' ? codes[room] : '';
  if (!expected) return required ? { ok: false, configurationError: true } : { ok: true, required: false };
  const left = Buffer.from(String(suppliedCode || ''));
  const right = Buffer.from(expected);
  const match = left.length === right.length && require('crypto').timingSafeEqual(left, right);
  return { ok: match, required: true };
}

function setApiHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

module.exports = {
  ROOM_CATALOG,
  cleanName,
  getHostRole,
  getRoomJoinCodeStatus,
  livekitConfig,
  parseParticipantMetadata,
  roomService,
  setApiHeaders,
};
