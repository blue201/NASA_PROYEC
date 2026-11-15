'use strict';

// In-memory, authoritative room state for cooperative mineral expeditions.
const { randomBytes, randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const rooms = new Map();
const MAX_PLAYERS = 4;
const NEXT_PLANET_AFTER_MINING = { earth: 'moon', moon: 'mars', mars: 'mercury', mercury: 'venus' };
const CHARACTERS = {
  sofia: { name: 'Capitana Sofía Parker', role: 'Comandante de misión y astrobióloga' },
  leo: { name: 'Ing. Leo Chen', role: 'Jefe de propulsión y núcleo Warp' },
  marcus: { name: 'Oficial Marcus Vance', role: 'Navegación táctica y muestras' },
  arthur: { name: 'Dr. Arthur Vance (Houston)', role: 'Director de vuelo en Tierra' },
};
const ROOM_TTL_MS = 3 * 60 * 60 * 1000;
const PLAYER_TTL_MS = 30 * 1000;
const PLANETS = new Set(['moon', 'mars', 'mercury', 'venus']);
const STRATEGIES = new Set(['direct', 'efficient', 'safe']);
const OBJECTIVE_COLORS = ['#43d9c3', '#f3c84b', '#ff826e', '#ae91ff'];
const MINERAL_COLORS = {
  'water-ice': '#5cc8ff', ilmenite: '#ad7d37', plagioclase: '#d8d5c8', pyroxene: '#5a8c54',
  olivine: '#89b843', 'iron-bearing-minerals': '#b65348', perchlorate: '#d0bd8d',
  'mid-latitude-ice': '#83dff2', sulfur: '#f3dd4d', enstatite: '#a78bc2', oldhamite: '#ff9a57',
  basalt: '#777b82', orthopyroxene: '#6a9c84', anorthite: '#e8e3d7',
};
const PROJECTS = {
  medical: { name: 'Unidad médica portátil', conditions: { orbital_fever: 'Fiebre orbital', lunar_adaptation: 'Síndrome de adaptación lunar', habitat_fatigue: 'Fatiga de hábitat' } },
  navigation: { name: 'Equipo especializado de navegación', conditions: null },
  eldercare: { name: 'Robot asistente para personas mayores', conditions: null },
};
function mineralColor(resourceId) {
  if (MINERAL_COLORS[resourceId]) return MINERAL_COLORS[resourceId];
  const hash = Array.from(String(resourceId)).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  return OBJECTIVE_COLORS[hash % OBJECTIVE_COLORS.length];
}

function collectibleResources(planet) {
  return (planet?.resources || []).filter(resource => {
    const location = String(resource.location || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return !!location && resource.id !== 'no-surface' && !['regolith-oxygen', 'helium-3', 'co2-atmosphere'].includes(resource.id) && !/atmosfera|nubes|sin superficie solida/.test(location);
  });
}

async function resourceCatalog(planetKey) {
  const roots = [process.env.PLANETS_DIR, path.resolve(__dirname, '../../../data/planets'), '/data/planets'].filter(Boolean);
  for (const root of roots) {
    try { return collectibleResources(JSON.parse(fs.readFileSync(path.join(root, planetKey + '.json'), 'utf8'))); }
    catch {}
  }
  try {
    const apiBase = (process.env.API_URL || 'http://127.0.0.1:8787').replace(/\/$/, '');
    const response = await fetch(`${apiBase}/api/planets/${encodeURIComponent(planetKey)}`, { signal: AbortSignal.timeout(5000) });
    if (response.ok) return collectibleResources(await response.json());
  } catch {}
  return [];
}

function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from(randomBytes(6), byte => alphabet[byte % alphabet.length]).join('');
  } while (rooms.has(code));
  return code;
}

function selectedCharacter(value) {
  const id = String(value || '');
  return CHARACTERS[id] ? { id, ...CHARACTERS[id] } : null;
}

function cleanName(value) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 64) || 'Mineral';
}

function publicRoom(room) {
  return {
    code: room.code,
    planetKey: room.planetKey,
    projectId: room.projectId,
    conditionId: room.conditionId,
    projectName: PROJECTS[room.projectId]?.name || null,
    conditionName: PROJECTS[room.projectId]?.conditions?.[room.conditionId] || null,
    phase: room.phase,
    hostId: room.hostId,
    missionComplete: room.missionComplete,
    unlockedPlanet: room.unlockedPlanet || null,
    objectives: room.objectives.map(objective => ({ ...objective })),
    travelVersion: room.travelVersion || 0,
    navigationState: room.navigationState || null,
    manifest: { ...room.manifest },
    players: [...room.players.values()].map(player => ({
      id: player.id,
      name: player.name,
      characterId: player.characterId,
      role: player.role,
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
  room.missionComplete = room.objectives.length === 4 && room.objectives.every(objective => (room.manifest[objective.resourceId] || 0) >= objective.required);
  if (room.missionComplete) {
    room.phase = 'complete';
    room.unlockedPlanet ||= NEXT_PLANET_AFTER_MINING[room.planetKey] || null;
  }
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
  req.on('end', async () => {
    let data;
    try { data = JSON.parse(body || '{}'); } catch { return fail(res, 400, 'Solicitud JSON no válida.'); }
    const action = String(data.action || '');
    const now = Date.now();

    if (action === 'create') {
      const planetKey = String(data.planetKey || 'moon').toLowerCase();
      if (!PLANETS.has(planetKey)) return fail(res, 400, 'Planeta de misión no válido.');
      const character = selectedCharacter(data.characterId);
      if (!character) return fail(res, 400, 'Selecciona un personaje de la tripulación de la historia.');
      if (character.id !== 'sofia') return fail(res, 400, 'La Capitana Sofía debe crear la sala y pilotar la nave principal.');
      const code = roomCode();
      const playerId = randomUUID();
      const player = { id: playerId, characterId: character.id, name: character.name, role: character.role, lastSeen: now, resourceId: null, resourceName: null, strategy: null, status: 'waiting', cargo: 0, deposited: 0, position: null };
      const room = { code, planetKey, projectId: null, conditionId: null, phase: 'lobby', hostId: playerId, travelVersion: 0, navigationState: null, unlockedPlanet: null, players: new Map([[playerId, player]]), objectives: [], manifest: Object.create(null), missionComplete: false, updatedAt: now };
      rooms.set(code, room);
      return send(res, 201, { room: publicRoom(room), playerId });
    }

    const code = String(data.code || '').toUpperCase();
    const room = rooms.get(code);
    if (action === 'join') {
      if (!room || room.phase !== 'lobby') return fail(res, 404, 'La partida no existe o ya comenzó.');
      if (room.players.size >= MAX_PLAYERS) return fail(res, 409, 'La partida ya tiene cuatro jugadores.');
      const character = selectedCharacter(data.characterId);
      if (!character) return fail(res, 400, 'Selecciona un personaje de la tripulación de la historia.');
      if (character.id === 'sofia') return fail(res, 409, 'La Capitana Sofía ya está al mando. Selecciona otro tripulante.');
      if ([...room.players.values()].some(player => player.characterId === character.id)) return fail(res, 409, 'Ese personaje ya está elegido por otro participante. Selecciona otro.');
      const playerId = randomUUID();
      room.players.set(playerId, { id: playerId, characterId: character.id, name: character.name, role: character.role, lastSeen: now, resourceId: null, resourceName: null, strategy: null, status: 'waiting', cargo: 0, deposited: 0, position: null });
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
    if (action === 'configure') {
      if (player.id !== room.hostId) return fail(res, 403, 'Solo el anfitrión puede definir la misión.');
      if (room.phase !== 'lobby') return fail(res, 409, 'La misión ya comenzó.');
      const planetKey = String(data.planetKey || '').toLowerCase();
      const projectId = String(data.projectId || '');
      const conditionId = String(data.conditionId || '');
      const resourceIds = Array.isArray(data.resourceIds) ? data.resourceIds.map(id => String(id).slice(0, 64)) : [];
      if (!PLANETS.has(planetKey)) return fail(res, 400, 'Planeta de misión no válido.');
      const project = PROJECTS[projectId];
      if (!project || (project.conditions && !Object.prototype.hasOwnProperty.call(project.conditions, conditionId)) || (!project.conditions && conditionId)) return fail(res, 400, 'Selecciona un proyecto y una condición válidos.');
      if (resourceIds.length !== 4 || new Set(resourceIds).size !== 4) return fail(res, 409, 'Selecciona exactamente cuatro minerales distintos para fabricar el proyecto.');
      const catalog = await resourceCatalog(planetKey);
      if (!catalog.length) return fail(res, 503, 'No se pudo consultar la disponibilidad de minerales de este planeta.');
      const objectives = resourceIds.map(id => {
        const resource = catalog.find(item => item.id === id);
        return resource ? { resourceId: resource.id, name: cleanName(resource.name || resource.id), color: mineralColor(resource.id), required: 1 } : null;
      });
      if (objectives.some(objective => !objective)) return fail(res, 400, 'Uno de los minerales no está disponible en el catálogo del planeta.');
      room.planetKey = planetKey;
      room.projectId = projectId;
      room.conditionId = project.conditions ? conditionId : null;
      for (const participant of room.players.values()) {
        participant.resourceId = null;
        participant.resourceName = null;
        participant.strategy = null;
        participant.status = 'waiting';
      }
      room.objectives = objectives;
      room.updatedAt = now;
      return send(res, 200, publicRoom(room));
    }
    if (action === 'start') {
      if (player.id !== room.hostId) return fail(res, 403, 'Solo quien creó la partida puede iniciarla.');
      if (room.phase !== 'lobby' || room.players.size < 2) return fail(res, 409, 'Se necesitan al menos dos jugadores para iniciar.');
      if (!room.projectId || room.objectives.length !== 4) return fail(res, 409, 'Configura un proyecto con cuatro minerales antes de iniciar.');
      if ([...room.players.values()].some(participant => !participant.resourceId || participant.status !== 'reserved')) return fail(res, 409, 'Cada participante debe elegir un mineral disponible antes de iniciar.');
      room.phase = 'active';
      return send(res, 200, publicRoom(room));
    }
    if (action === 'travel') {
      if (player.id !== room.hostId) return fail(res, 403, 'Solo la Capitana puede pilotar la nave principal.');
      if (room.phase !== 'active' || String(data.planetKey || '') !== room.planetKey) return fail(res, 409, 'El destino no coincide con el planeta de la misión activa.');
      room.travelVersion = (room.travelVersion || 0) + 1;
      return send(res, 200, publicRoom(room));
    }
    if (action === 'navigation') {
      if (player.id !== room.hostId) return fail(res, 403, 'Solo el comandante puede sincronizar la navegacion.');
      if (room.phase !== 'active') return fail(res, 409, 'La mision aun no esta activa.');
      const state = data.state || {}, position = state.position || {}, rotation = state.rotation || {};
      const scene = String(state.scene || '');
      const numbers = [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, state.yaw, state.pitch, state.speed, state.progress, state.distance];
      if (!['flight', 'landing', 'exploration', 'surface'].includes(scene) || !numbers.every(Number.isFinite)
        || numbers.some(value => Math.abs(value) > 1_000_000_000)) return fail(res, 400, 'Estado de navegacion no valido.');
      if (now - (player.navigationAt || 0) < 120) return send(res, 200, { accepted: true });
      player.navigationAt = now;
      room.navigationState = {
        scene,
        position: { x: position.x, y: position.y, z: position.z },
        rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
        yaw: state.yaw,
        pitch: state.pitch,
        speed: state.speed,
        progress: Math.max(0, Math.min(1, state.progress)),
        distance: Math.max(0, state.distance),
        planetKey: String(state.planetKey || room.planetKey).slice(0, 32),
        updatedAt: now,
      };
      return send(res, 200, { accepted: true });
    }
    if (action === 'unreserve') {
      if (!['lobby', 'active'].includes(room.phase)) return fail(res, 409, 'La sala ya no permite cambiar reservas.');
      if (player.status !== 'reserved') return fail(res, 409, 'No tienes un material reservado.');
      player.resourceId = null;
      player.resourceName = null;
      player.strategy = null;
      player.status = 'waiting';
      return send(res, 200, publicRoom(room));
    }
    if (action === 'reserve') {
      if (!['lobby', 'active'].includes(room.phase) || !room.objectives.length || !['waiting', 'reserved'].includes(player.status)) return fail(res, 409, 'Espera a que el anfitrión configure la misión para reservar un material.');
      const resourceId = String(data.resourceId || '').slice(0, 64);
      const objective = room.objectives.find(item => item.resourceId === resourceId);
      if (!objective) return fail(res, 409, 'Ese material no forma parte de la receta.');
      if ((room.manifest[resourceId] || 0) >= objective.required) return fail(res, 409, 'Ese material ya se recolectó para la receta.');
      const occupied = [...room.players.values()].find(other => other.id !== player.id && other.resourceId === resourceId && ['reserved', 'assigned', 'outbound', 'collecting', 'returning'].includes(other.status));
      if (occupied) return fail(res, 409, 'Ese mineral ya está reservado por ' + occupied.name + '.');
      const strategy = String(data.strategy || 'efficient');
      if (!STRATEGIES.has(strategy)) return fail(res, 400, 'Estrategia de navegación no válida.');
      player.resourceId = resourceId;
      player.resourceName = objective.name;
      player.strategy = strategy;
      player.status = 'reserved';
      player.cargo = 0;
      return send(res, 200, publicRoom(room));
    }
    if (action === 'assign') {
      if (room.phase !== 'active' || !['waiting', 'reserved', 'assigned'].includes(player.status)) return fail(res, 409, 'Este dron ya fue desplegado.');
      const resourceId = String(data.resourceId || '').slice(0, 64);
      const strategy = String(data.strategy || '');
      if (!/^[a-z0-9-]+$/i.test(resourceId) || !STRATEGIES.has(strategy)) return fail(res, 400, 'Mineral o estrategia no válidos.');
      const objective = room.objectives.find(item => item.resourceId === resourceId);
      if (!objective) return fail(res, 409, 'Ese mineral no forma parte de los objetivos de esta partida.');
      const occupied = [...room.players.values()].find(other => other.id !== player.id && other.resourceId === resourceId && ['reserved', 'assigned', 'outbound', 'collecting', 'returning'].includes(other.status));
      if (occupied) return fail(res, 409, 'Ese mineral ya está reservado por ' + occupied.name + '.');
      if ((room.manifest[resourceId] || 0) >= objective.required) return fail(res, 409, 'Ese material ya se recolectó para la receta.');
      player.resourceId = resourceId;
      player.resourceName = objective.name;
      player.strategy = strategy;
      player.status = 'assigned';
      player.cargo = 0;
      player.position = null;
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
      if (!room.missionComplete) {
        player.resourceId = null;
        player.resourceName = null;
        player.strategy = null;
        player.status = 'waiting';
      }
      return send(res, 200, publicRoom(room));
    }
    return fail(res, 400, 'Acción multijugador desconocida.');
  });
}

module.exports = { handle, rooms, expireRooms };
