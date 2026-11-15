'use strict';

// In-memory, authoritative room state for cooperative mineral expeditions.
const { randomBytes, randomUUID } = require('node:crypto');
const rooms = new Map();
const MAX_PLAYERS = 4;
const ROOM_TTL_MS = 3 * 60 * 60 * 1000;
const PLAYER_TTL_MS = 30 * 1000;
const PLANETS = new Set(['moon', 'mars', 'mercury', 'venus']);
const STRATEGIES = new Set(['direct', 'efficient', 'safe']);

function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from(randomBytes(6), byte => alphabet[byte % alphabet.length]).join('');
  } while (rooms.has(code));
  return code;
}

function cleanName(value) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 24) || 'Explorador';
}

function publicRoom(room) {
  return {
    code: room.code,
    planetKey: room.planetKey,
    phase: room.phase,
    hostId: room.hostId,
    missionComplete: room.missionComplete,
    manifest: { ...room.manifest },
    players: [...room.players.values()].map(player => ({
      id: player.id,
      name: player.name,
      host: player.id === room.hostId,
      resourceId: player.resourceId,
      resourceName: player.resourceName,
      strategy: player.strategy,
      status: player.status,
      cargo: player.cargo,
      deposited: player.deposited,
      position: player.position,
    })),
  };
}

function fail(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ error: message }));
}

function send(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function expireRooms(now = Date.now()) {
  for (const [code, room] of rooms) {
    for (const [id, player] of room.players) {
      if (now - player.lastSeen > PLAYER_TTL_MS) room.players.delete(id);
    }
    if (room.players.size && !room.players.has(room.hostId)) room.hostId = room.players.keys().next().value;
    if (room.phase === 'active') updateMissionComplete(room);
    if (!room.players.size || now - room.updatedAt > ROOM_TTL_MS) rooms.delete(code);
  }
}

function playerFor(room, token) {
  return room?.players.get(String(token || '')) || null;
}

function updateMissionComplete(room) {
  const players = [...room.players.values()];
  room.missionComplete = players.length > 0 && players.every(player => player.status === 'deposited');
  if (room.missionComplete) room.phase = 'complete';
}

function handle(req, res) {
  expireRooms();
  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const room = rooms.get((url.searchParams.get('room') || '').toUpperCase());
    const player = playerFor(room, url.searchParams.get('player'));
    if (!room || !player) return fail(res, 404, 'Partida o jugador no encontrado.');
    player.lastSeen = Date.now();
    room.updatedAt = Date.now();
    return send(res, 200, publicRoom(room));
  }
  if (req.method !== 'POST') return fail(res, 405, 'Usa GET o POST.');
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 16_384) req.destroy();
  });
  req.on('end', () => {
    let data;
    try { data = JSON.parse(body || '{}'); } catch { return fail(res, 400, 'Solicitud JSON no válida.'); }
    const action = String(data.action || '');
    const now = Date.now();

    if (action === 'create') {
      const planetKey = String(data.planetKey || 'moon').toLowerCase();
      if (!PLANETS.has(planetKey)) return fail(res, 400, 'Planeta de misión no válido.');
      const code = roomCode();
      const playerId = randomUUID();
      const player = { id: playerId, name: cleanName(data.name), lastSeen: now, resourceId: null, resourceName: null, strategy: null, status: 'waiting', cargo: 0, deposited: 0, position: null };
      const room = { code, planetKey, phase: 'lobby', hostId: playerId, players: new Map([[playerId, player]]), manifest: Object.create(null), missionComplete: false, updatedAt: now };
      rooms.set(code, room);
      return send(res, 201, { room: publicRoom(room), playerId });
    }

    const code = String(data.code || '').toUpperCase();
    const room = rooms.get(code);
    if (action === 'join') {
      if (!room || room.phase !== 'lobby') return fail(res, 404, 'La partida no existe o ya comenzó.');
      if (room.players.size >= MAX_PLAYERS) return fail(res, 409, 'La partida ya tiene cuatro jugadores.');
      const playerId = randomUUID();
      room.players.set(playerId, { id: playerId, name: cleanName(data.name), lastSeen: now, resourceId: null, resourceName: null, strategy: null, status: 'waiting', cargo: 0, deposited: 0, position: null });
      room.updatedAt = now;
      return send(res, 201, { room: publicRoom(room), playerId });
    }

    const player = playerFor(room, data.playerId);
    if (!room || !player) return fail(res, 404, 'Partida o jugador no encontrado.');
    player.lastSeen = now;
    room.updatedAt = now;

    if (action === 'leave') {
      room.players.delete(player.id);
      if (!room.players.size) rooms.delete(room.code);
      else if (room.hostId === player.id) room.hostId = room.players.keys().next().value;
      if (rooms.has(room.code) && room.phase === 'active') updateMissionComplete(room);
      return send(res, 200, { left: true });
    }
    if (action === 'start') {
      if (player.id !== room.hostId) return fail(res, 403, 'Solo quien creó la partida puede iniciarla.');
      if (room.phase !== 'lobby' || room.players.size < 2) return fail(res, 409, 'Se necesitan al menos dos jugadores para iniciar.');
      room.phase = 'active';
      return send(res, 200, publicRoom(room));
    }
    if (action === 'assign') {
      if (room.phase !== 'active' || player.status !== 'waiting' && player.status !== 'assigned') return fail(res, 409, 'Este dron ya fue desplegado.');
      const resourceId = String(data.resourceId || '').slice(0, 64);
      const strategy = String(data.strategy || '');
      if (!/^[a-z0-9-]+$/i.test(resourceId) || !STRATEGIES.has(strategy)) return fail(res, 400, 'Mineral o estrategia no válidos.');
      const occupied = [...room.players.values()].find(other => other.id !== player.id && other.resourceId === resourceId && other.status !== 'waiting');
      if (occupied) return fail(res, 409, 'Ese mineral ya está reservado por ' + occupied.name + '.');
      player.resourceId = resourceId;
      player.resourceName = cleanName(data.resourceName);
      player.strategy = strategy;
      player.status = 'assigned';
      player.cargo = 0;
      return send(res, 200, publicRoom(room));
    }
    if (action === 'progress') {
      if (!player.resourceId || !['assigned', 'outbound', 'collecting', 'returning'].includes(player.status)) return fail(res, 409, 'Asigna un mineral antes de desplegar el dron.');
      const x = Number(data.x), z = Number(data.z), cargo = Number(data.cargo);
      const status = String(data.status || '');
      if (![x, z, cargo].every(Number.isFinite) || Math.abs(x) > 100_000 || Math.abs(z) > 100_000 || !Number.isInteger(cargo) || cargo < player.cargo || cargo > 100 || !['outbound', 'collecting', 'returning'].includes(status)) return fail(res, 400, 'Telemetría de dron no válida.');
      player.position = { x, z };
      player.cargo = cargo;
      player.status = status;
      return send(res, 200, { accepted: true });
    }
    if (action === 'deposit') {
      if (player.status !== 'returning' || !player.resourceId || player.cargo < 1) return fail(res, 409, 'El dron no tiene una carga lista para depositar.');
      const x = Number(data.x), z = Number(data.z), baseX = Number(data.baseX), baseZ = Number(data.baseZ);
      if (![x, z, baseX, baseZ].every(Number.isFinite) || Math.hypot(x - baseX, z - baseZ) > 45) return fail(res, 409, 'El dron debe volver junto a la nave principal.');
      player.position = { x, z };
      player.deposited += player.cargo;
      room.manifest[player.resourceId] = (room.manifest[player.resourceId] || 0) + player.cargo;
      player.cargo = 0;
      player.status = 'deposited';
      updateMissionComplete(room);
      return send(res, 200, publicRoom(room));
    }
    return fail(res, 400, 'Acción multijugador desconocida.');
  });
}

module.exports = { handle, rooms, expireRooms };
