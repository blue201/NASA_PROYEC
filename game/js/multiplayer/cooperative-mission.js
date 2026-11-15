/* Cooperative mineral expeditions. Loaded only when the URL contains ?multi=1. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('multi') !== '1') return;

  const SESSION_KEY = 'odyssey_multiplayer_v1';
  const planetNames = { moon: 'Luna', mars: 'Marte', mercury: 'Mercurio', venus: 'Venus' };
  const strategies = {
    direct: { name: 'Directa', speed: 31, altitude: 24, description: 'Ruta recta y rápida.' },
    efficient: { name: 'Eficiente', speed: 23, altitude: 28, description: 'Visita primero los depósitos más cercanos.' },
    safe: { name: 'Segura', speed: 16, altitude: 46, description: 'Vuelo lento y elevado sobre el terreno.' },
  };
  let session = null, roomState = null, dialog, lobbyStatus, lobbyContent, flightPanel, planetData = null;
  let resourcesPromise = null, depositsPlanet = '', pollBusy = false, lastResourceOptions = '', lastSent = 0, frame = 0;
  const drones = new Map();
  try { session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch {}

  const apiBase = params.get('api') || `${location.protocol}//${location.hostname}:8787`;
  const apiPlanet = key => `${apiBase.replace(/\/$/, '')}/api/planets/${encodeURIComponent(key)}`;
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const persist = () => { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {} };
  const labelStrategy = key => strategies[key]?.name || key;

  const style = document.createElement('style');
  style.textContent = `
    #multi-menu-button{border:1px solid #64c9e8;background:#102b3b;color:#e9faff}
    #multi-lobby{box-sizing:border-box;width:min(640px,calc(100vw - 28px));max-height:88vh;overflow:auto;padding:22px;border:1px solid #69cddd;border-radius:14px;background:#071522f5;color:#e9f3f8;font:14px/1.5 system-ui;box-shadow:0 20px 80px #000b}
    #multi-lobby::backdrop{background:#020810d9;backdrop-filter:blur(5px)}
    #multi-lobby h2,#multi-lobby h3{margin:0 0 10px}#multi-lobby label{display:grid;gap:5px;margin:10px 0;color:#bcd5df;font-size:12px}
    #multi-lobby input,#multi-lobby select{box-sizing:border-box;width:100%;min-height:42px;padding:8px 10px;border:1px solid #547788;border-radius:7px;background:#07121c;color:#f2fbff;font:inherit}
    .multi-lobby-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.multi-lobby-head button,#multi-lobby button{min-height:40px;padding:8px 12px;border:1px solid #668a99;border-radius:7px;background:#102b3b;color:#eaf8ff;cursor:pointer}.multi-lobby-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.multi-divider{height:1px;margin:18px 0;border:0;background:#8fc6d033}
    .multi-room-code{padding:10px;border:1px dashed #67d9ef;border-radius:8px;color:#a9f0ff;font:700 24px ui-monospace,monospace;letter-spacing:4px;text-align:center}.multi-roster{display:grid;gap:7px;margin:12px 0;padding:0;list-style:none}.multi-roster li{display:flex;justify-content:space-between;gap:10px;padding:9px 11px;border:1px solid #ffffff20;border-radius:7px;background:#0a1d29}.multi-roster small{color:#9fb4c0}.multi-status{min-height:1.4em;color:#9ce4d2}.multi-error{color:#ff9b9e!important}
    #cooperative-mission-panel{position:fixed;top:20px;left:20px;z-index:1200;box-sizing:border-box;width:min(360px,calc(100vw - 40px));max-height:75vh;overflow:auto;padding:14px;border:1px solid #67c9dd;border-radius:12px;background:#071522ed;color:#e9f3f8;box-shadow:0 8px 30px #0008;font:12px/1.45 system-ui}
    #cooperative-mission-panel h2{margin:0 0 6px;font-size:15px}#cooperative-mission-panel p{margin:6px 0;color:#b9cdd7}#cooperative-mission-panel label{display:grid;gap:4px;margin:9px 0;color:#aee4ef}#cooperative-mission-panel select,#cooperative-mission-panel button{box-sizing:border-box;width:100%;min-height:38px;padding:7px 9px;border:1px solid #587b8c;border-radius:6px;color:#f0fbff;background:#0b2230}
    .multi-team-list{display:grid;gap:5px;margin:10px 0;padding:0;list-style:none}.multi-team-list li{padding:6px 8px;border-radius:5px;background:#0d2634}.multi-manifest{padding:8px;border:1px solid #78d9bc55;border-radius:6px;color:#b7f1d7}.multi-pill{float:right;color:#8de6c3}
    @media(max-width:650px){#cooperative-mission-panel{top:auto;bottom:16px;left:12px;width:min(340px,calc(100vw - 24px));max-height:42vh}#multi-lobby{padding:16px}}
  `;
  document.head.append(style);

  function request(action, extra = {}) {
    const data = { action, ...extra };
    if (session) { data.code = session.code; data.playerId = session.playerId; }
    return fetch('/api/multiplayer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), cache: 'no-store', keepalive: action === 'leave',
    }).then(async response => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Error ${response.status}`);
      return payload;
    });
  }

  async function loadScript(src) {
    if (window.ResourceDeposits) return;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
  }

  function ensureLobby() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.id = 'multi-lobby';
    dialog.setAttribute('aria-labelledby', 'multi-lobby-title');
    dialog.innerHTML = '<div class="multi-lobby-head"><div><small>ODYSSEY · COOPERATIVO</small><h2 id="multi-lobby-title">Partida multijugador</h2></div><button type="button" data-multi-close aria-label="Cerrar">Cerrar</button></div><div id="multi-lobby-content"></div><p id="multi-lobby-status" class="multi-status" role="status"></p>';
    document.body.append(dialog);
    lobbyContent = dialog.querySelector('#multi-lobby-content'); lobbyStatus = dialog.querySelector('#multi-lobby-status');
    dialog.addEventListener('click', event => {
      if (event.target.closest('[data-multi-close]')) dialog.close();
      const action = event.target.closest('[data-multi-action]')?.dataset.multiAction;
      if (action === 'create') createRoom();
      if (action === 'join') joinRoom();
      if (action === 'start') startRoom();
      if (action === 'enter') enterMission();
      if (action === 'leave') leaveRoom();
    });
    dialog.addEventListener('close', () => { document.getElementById('multi-menu-button')?.focus(); });
  }

  function showLobbyMessage(text, error = false) {
    if (!lobbyStatus) return;
    lobbyStatus.textContent = text; lobbyStatus.classList.toggle('multi-error', error);
  }

  function showEntry() {
    ensureLobby();
    lobbyContent.innerHTML = `<div class="multi-room-forms">
      <section><h3>Crear partida</h3><label>Nombre de comandante<input id="multi-create-name" maxlength="24" autocomplete="nickname" value="Comandante"></label>
      <label>Planeta objetivo<select id="multi-create-planet">${Object.entries(planetNames).map(([id, name]) => `<option value="${id}"${id === 'moon' ? ' selected' : ''}>${escapeHTML(name)}</option>`).join('')}</select></label>
      <button type="button" data-multi-action="create">Crear partida</button></section><hr class="multi-divider">
      <section><h3>Unirse a partida</h3><label>Nombre de comandante<input id="multi-join-name" maxlength="24" autocomplete="nickname" placeholder="Tu nombre"></label>
      <label>Código de partida<input id="multi-join-code" maxlength="6" autocomplete="off" placeholder="ABC123" style="text-transform:uppercase"></label>
      <button type="button" data-multi-action="join">Unirse</button></section></div>`;
    showLobbyMessage('Reúne de 2 a 4 jugadores. El anfitrión selecciona el planeta de la misión.');
  }

  function drawLobby() {
    if (!dialog?.open || !session || !roomState) return;
    const current = roomState.players.find(player => player.id === session.playerId);
    const isHost = session.playerId === roomState.hostId;
    const roomPlayers = roomState.players.map(player => `<li><span>${escapeHTML(player.name)}${player.host ? ' · anfitrión' : ''}</span><small>${escapeHTML(player.status === 'waiting' ? 'En espera' : player.status === 'deposited' ? 'Carga depositada' : player.status === 'assigned' ? 'Dron preparado' : 'Dron en operación')}</small></li>`).join('');
    const started = roomState.phase !== 'lobby';
    lobbyContent.innerHTML = `<div class="multi-room-code" aria-label="Código de partida">${escapeHTML(roomState.code)}</div>
      <p>Misión principal: recolectar minerales en <strong>${escapeHTML(planetNames[roomState.planetKey] || roomState.planetKey)}</strong>. Comparte el código con tu equipo.</p>
      <ul class="multi-roster">${roomPlayers}</ul>
      <div class="multi-lobby-actions">
        ${started ? '<button type="button" data-multi-action="enter">Entrar a la misión</button>' : isHost ? `<button type="button" data-multi-action="start"${roomState.players.length < 2 ? ' disabled' : ''}>Iniciar misión</button>` : '<small>Esperando que el anfitrión inicie la misión…</small>'}
        <button type="button" data-multi-action="leave">Salir de la partida</button>
      </div>`;
    if (!current) showLobbyMessage('Tu conexión con la partida terminó. Vuelve a unirte.', true);
    else if (!started && isHost && roomState.players.length < 2) showLobbyMessage(`Esperando jugadores · ${roomState.players.length}/4. Se necesitan 2 para iniciar.`);
    else if (started) showLobbyMessage('Partida iniciada. Cada comandante puede entrar cuando esté listo.');
    else showLobbyMessage('Esperando al anfitrión.');
  }

  async function createRoom() {
    try {
      const name = document.getElementById('multi-create-name')?.value;
      const planetKey = document.getElementById('multi-create-planet')?.value;
      const result = await request('create', { name, planetKey });
      session = { code: result.room.code, playerId: result.playerId, planetKey: result.room.planetKey, started: false }; persist(); roomState = result.room; drawLobby();
    } catch (error) { showLobbyMessage(error.message, true); }
  }

  async function joinRoom() {
    try {
      const code = document.getElementById('multi-join-code')?.value.trim().toUpperCase();
      const name = document.getElementById('multi-join-name')?.value;
      const result = await request('join', { code, name });
      session = { code: result.room.code, playerId: result.playerId, planetKey: result.room.planetKey, started: false }; persist(); roomState = result.room; drawLobby();
    } catch (error) { showLobbyMessage(error.message, true); }
  }

  async function startRoom() {
    try { roomState = await request('start'); if (session) { session.started = true; persist(); } drawLobby(); }
    catch (error) { showLobbyMessage(error.message, true); }
  }

  function enterMission() {
    if (!roomState || roomState.phase === 'lobby') return;
    const target = new URL(location.href);
    target.searchParams.set('mission', 'new'); target.searchParams.set('multi', '1');
    location.assign(target.toString());
  }

  async function leaveRoom() {
    try { if (session) await request('leave'); } catch {}
    session = null; roomState = null;
    if (flightPanel) flightPanel.hidden = true;
    for (const drone of drones.values()) drone.group?.parent?.remove(drone.group);
    drones.clear();
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    showEntry(); showLobbyMessage('Saliste de la partida.');
  }

  function installMenuButton() {
    const actions = document.getElementById('start-menu-actions');
    if (!actions || document.getElementById('multi-menu-button')) return;
    const button = document.createElement('button'); button.id = 'multi-menu-button'; button.type = 'button'; button.textContent = 'Unirse a partida';
    button.addEventListener('click', () => {
      ensureLobby(); if (!dialog.open) dialog.showModal();
      if (session) { drawLobby(); poll(); } else showEntry();
    });
    actions.append(button);
  }

  async function fetchState() {
    if (!session || pollBusy) return;
    pollBusy = true;
    try {
      const response = await fetch(`/api/multiplayer?room=${encodeURIComponent(session.code)}&player=${encodeURIComponent(session.playerId)}`, { cache: 'no-store' });
      const next = await response.json();
      if (!response.ok) throw new Error(next.error || 'Partida desconectada.');
      roomState = next;
      if (session && (session.planetKey !== next.planetKey || session.started !== (next.phase !== 'lobby'))) {
        session.planetKey = next.planetKey; session.started = next.phase !== 'lobby'; persist();
      }
      drawLobby();
      syncFlightPanel();
    } catch (error) {
      if (dialog?.open) showLobbyMessage(error.message + ' Vuelve a unirte con el código.', true);
      if (error.message.includes('no encontrado')) {
        session = null; roomState = null;
        try { sessionStorage.removeItem(SESSION_KEY); } catch {}
        if (dialog?.open) { showEntry(); showLobbyMessage(error.message, true); }
      } else if (!roomState && dialog?.open) {
        showEntry(); showLobbyMessage(error.message + ' Revisa la conexión e inténtalo de nuevo.', true);
      }
    } finally { pollBusy = false; }
  }

  function ensureFlightPanel() {
    if (flightPanel) return;
    flightPanel = document.createElement('aside'); flightPanel.id = 'cooperative-mission-panel'; flightPanel.hidden = true;
    flightPanel.innerHTML = '<h2>Operación minera del equipo</h2><p id="multi-objective"></p><div id="multi-assignment"></div><ul id="multi-team" class="multi-team-list"></ul><div id="multi-manifest" class="multi-manifest"></div><p id="multi-flight-status" role="status"></p><button type="button" id="multi-flight-leave">Salir de la partida</button>';
    document.body.append(flightPanel);
    flightPanel.addEventListener('click', event => {
      if (event.target.closest('#multi-flight-leave')) { leaveRoom(); return; }
      if (!event.target.closest('#multi-deploy')) return;
      reserveAndDeploy();
    });
  }

  async function loadMinerals(key, explorer) {
    if (resourcesPromise && depositsPlanet === key) return resourcesPromise;
    depositsPlanet = key;
    resourcesPromise = (async () => {
      try {
        await loadScript('js/surface/resource-deposits.js');
        window.ResourceDeposits?.install?.();
        let data = key === 'moon' ? window.MoonData?.planet : null;
        if (!data) { const response = await fetch(apiPlanet(key), { cache: 'no-store' }); if (response.ok) data = await response.json(); }
        if (!data) throw new Error('No se pudieron cargar los recursos de este planeta.');
        planetData = data;
        if (explorer && (!window.ResourceDeposits?.list?.length || depositsPlanet !== key)) window.ResourceDeposits?.build(explorer, data);
        return (window.ResourceDeposits?.surfaceResources?.(data) || []).filter(resource => resource.id !== 'no-surface' && !/sin superficie s[oó]lida|atm[oó]sfera|nubes/i.test(resource.location || ''));
      } catch (error) { throw error; }
    })();
    return resourcesPromise;
  }

  function lockSummary(resourceId) {
    const player = roomState?.players.find(item => item.id === session?.playerId);
    const occupant = roomState?.players.find(item => item.id !== player?.id && item.resourceId === resourceId && item.status !== 'waiting');
    return occupant || null;
  }

  function renderFlightPanel(resources) {
    if (!flightPanel || !roomState || !session) return;
    const explorer = window.surfaceExplorer;
    const me = roomState.players.find(player => player.id === session.playerId);
    if (!explorer?.isActive || explorer.planetKey !== roomState.planetKey) { flightPanel.hidden = true; return; }
    flightPanel.hidden = false;
    document.getElementById('multi-objective').textContent = `Planeta objetivo: ${planetNames[roomState.planetKey] || roomState.planetKey} · jugadores ${roomState.players.length}/4`;
    const team = document.getElementById('multi-team');
    team.innerHTML = roomState.players.map(player => `<li><strong>${escapeHTML(player.name)}</strong> · ${escapeHTML(player.resourceName || 'sin mineral')} · ${escapeHTML(player.strategy ? labelStrategy(player.strategy) : 'sin estrategia')} · ${escapeHTML(player.status === 'deposited' ? `depositó ${player.deposited}` : player.status === 'returning' ? `regresa con ${player.cargo}` : player.status === 'outbound' || player.status === 'collecting' ? `recolecta ${player.cargo}` : player.status === 'assigned' ? 'listo para desplegar' : 'elige asignación')}</li>`).join('');
    document.getElementById('multi-manifest').textContent = 'Depósito compartido: ' + (Object.entries(roomState.manifest || {}).map(([id, count]) => `${id} × ${count}`).join(' · ') || 'vacío');
    const assignment = document.getElementById('multi-assignment');
    if (!me) { assignment.innerHTML = '<p>Tu acceso a la partida caducó. Regresa al menú para unirte de nuevo.</p>'; return; }
    if (me.status === 'waiting') {
      const lockKey = roomState.players.map(player => `${player.id}:${player.resourceId}:${player.status}`).join('|') + '|' + resources.map(resource => resource.id).join(',');
      if (lastResourceOptions !== lockKey || !assignment.querySelector('select')) {
        lastResourceOptions = lockKey;
        assignment.innerHTML = `<p>Estás en la nave principal. Selecciona un mineral libre y una estrategia; cada mineral queda reservado para un solo dron.</p>
          <label>Mineral a recolectar<select id="multi-resource-select"><option value="">Selecciona un mineral</option>${resources.map(resource => { const occupant = lockSummary(resource.id); return `<option value="${escapeHTML(resource.id)}"${occupant ? ' disabled' : ''}>${escapeHTML(resource.name || resource.id)}${occupant ? ` · ocupado por ${escapeHTML(occupant.name)}` : ''}</option>`; }).join('')}</select></label>
          <label>Estrategia de navegación<select id="multi-strategy-select"><option value="efficient">Eficiente · menor distancia total</option><option value="direct">Directa · máxima velocidad</option><option value="safe">Segura · mayor altura y control</option></select></label>
          <button type="button" id="multi-deploy"${resources.length ? '' : ' disabled'}>Reservar mineral y desplegar mi dron</button>`;
      }
      document.getElementById('multi-flight-status').textContent = resources.length ? 'Los otros jugadores ven los minerales reservados en tiempo real.' : 'Cargando depósitos minerales de este planeta…';
    } else {
      assignment.innerHTML = `<p>Tu dron: <strong>${escapeHTML(me.resourceName)}</strong> · estrategia ${escapeHTML(labelStrategy(me.strategy))}.</p>`;
      const msg = { assigned: 'Preparando despliegue desde la nave principal…', outbound: 'Dron en ruta al depósito.', collecting: 'Recolectando muestras.', returning: 'Carga asegurada; regresando a la nave principal.', deposited: `Misión de dron completada · ${me.deposited} unidades depositadas.` };
      document.getElementById('multi-flight-status').textContent = roomState.missionComplete ? 'Objetivo cooperativo completado. Todos los drones depositaron su carga.' : msg[me.status] || 'Operación en curso.';
    }
  }

  async function reserveAndDeploy() {
    const resourceId = document.getElementById('multi-resource-select')?.value;
    const strategy = document.getElementById('multi-strategy-select')?.value || 'efficient';
    const resource = planetData?.resources?.find(item => item.id === resourceId);
    if (!resourceId || !resource) { document.getElementById('multi-flight-status').textContent = 'Selecciona un mineral disponible.'; return; }
    const deposits = (window.ResourceDeposits?.list || []).filter(deposit => deposit.id === resourceId);
    if (!deposits.length) { document.getElementById('multi-flight-status').textContent = 'No hay depósitos superficiales disponibles para ese recurso en este planeta.'; return; }
    try {
      const response = await request('assign', { resourceId, resourceName: resource.name || resourceId, strategy });
      roomState = response; lastResourceOptions = '';
      prepareDrone(session.playerId, roomState.players.find(player => player.id === session.playerId), deposits);
      drawLobby(); syncFlightPanel();
    } catch (error) { document.getElementById('multi-flight-status').textContent = error.message; }
  }

  function createDroneModel(explorer, player) {
    const THREE = window.THREE;
    if (!THREE || !explorer?.scene) return null;
    const group = new THREE.Group(); group.name = 'Dron cooperativo · ' + player.name;
    const hue = Array.from(player.id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${hue},78%,58%)`), metalness: 0.35, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 9), material); body.castShadow = true; group.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 6), new THREE.MeshStandardMaterial({ color: 0xdaf8ff, emissive: 0x2f8aa1, emissiveIntensity: 0.5 })); nose.rotation.x = Math.PI / 2; nose.position.z = -7; group.add(nose);
    for (const [x, z] of [[-10,-8],[10,-8],[-10,8],[10,8]]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(9, 1.5, 2), material); arm.position.set(x * 0.65, 0, z * 0.65); group.add(arm);
      const rotor = new THREE.Mesh(new THREE.TorusGeometry(4, .5, 5, 12), new THREE.MeshBasicMaterial({ color: 0x9be8ff })); rotor.rotation.x = Math.PI / 2; rotor.position.set(x, 2, z); group.add(rotor);
    }
    explorer.scene.add(group);
    return group;
  }

  function routeOrder(explorer, deposits, strategy) {
    const targets = deposits.slice();
    if (strategy !== 'efficient') return targets;
    const ordered = []; let pos = explorer.shipGroup.position.clone();
    while (targets.length) {
      let nearestIndex = 0, nearestDistance = Infinity;
      targets.forEach((deposit, index) => { const distance = pos.distanceTo(new window.THREE.Vector3(deposit.position.x, deposit.position.y, deposit.position.z)); if (distance < nearestDistance) { nearestDistance = distance; nearestIndex = index; } });
      const next = targets.splice(nearestIndex, 1)[0]; ordered.push(next); pos.set(next.position.x, next.position.y, next.position.z);
    }
    return ordered;
  }

  function prepareDrone(playerId, player, deposits) {
    const explorer = window.surfaceExplorer;
    if (!explorer?.isActive || !player || !deposits.length) return;
    const old = drones.get(playerId); if (old?.group) old.group.parent?.remove(old.group);
    const targets = routeOrder(explorer, deposits, player.strategy);
    const group = createDroneModel(explorer, player);
    if (!group) return;
    group.position.copy(explorer.shipGroup.position);
    drones.set(playerId, { group, targets, targetIndex: 0, status: 'outbound', cargo: 0, strategy: player.strategy, lastSent: 0, local: true, playerId });
    postProgress(drones.get(playerId), explorer, 'outbound');
  }

  function ensureRemoteDrone(player, explorer) {
    let drone = drones.get(player.id);
    if (!drone) {
      const group = createDroneModel(explorer, player);
      if (!group) return null;
      drone = { group, local: player.id === session?.playerId, playerId: player.id, status: player.status };
      drones.set(player.id, drone);
    }
    return drone;
  }

  function postProgress(drone, explorer, status) {
    const now = performance.now();
    if (now - drone.lastSent < 750 && status === drone.status) return;
    drone.lastSent = now; drone.status = status;
    request('progress', { status, cargo: drone.cargo || 0, x: drone.group.position.x, z: drone.group.position.z }).catch(() => {});
  }

  function setDroneTarget(drone, explorer, position, status, altitude) {
    const current = drone.group.position, dx = position.x - current.x, dz = position.z - current.z, distance = Math.hypot(dx, dz);
    if (distance < 10) return true;
    const step = Math.min(distance, (strategies[drone.strategy]?.speed || 20) * Math.min(.05, Math.max(.001, (performance.now() - (drone.moveAt || performance.now())) / 1000)));
    drone.moveAt = performance.now();
    const x = current.x + dx / distance * step, z = current.z + dz / distance * step;
    const terrain = window.SurfaceNavigation?.heightAt?.(x, z, explorer.planetKey) || 0;
    drone.group.position.set(x, terrain + altitude, z);
    drone.group.rotation.y = Math.atan2(dx, dz);
    postProgress(drone, explorer, status);
    return false;
  }

  function updateDrone(drone, explorer) {
    if (!drone.local || !drone.group || !explorer?.isActive) return;
    if (drone.deposited) return;
    if (drone.targetIndex < drone.targets.length) {
      const target = drone.targets[drone.targetIndex];
      if (drone.strategy === 'safe' && !drone.safeWaypointDone) {
        const home = explorer.shipGroup.position, midX = (home.x + target.position.x) / 2, midZ = (home.z + target.position.z) / 2;
        if (!setDroneTarget(drone, explorer, { x: midX + 60, z: midZ - 60 }, 'outbound', strategies.safe.altitude)) return;
        drone.safeWaypointDone = true;
      }
      if (!setDroneTarget(drone, explorer, target.position, 'outbound', strategies[drone.strategy].altitude)) {
        if (Math.hypot(drone.group.position.x - target.position.x, drone.group.position.z - target.position.z) > 18) return;
      }
      drone.cargo += 1; drone.targetIndex += 1; drone.safeWaypointDone = false;
      postProgress(drone, explorer, 'collecting');
      return;
    }
    drone.status = 'returning';
    const base = explorer.shipGroup.position;
    if (!setDroneTarget(drone, explorer, base, 'returning', strategies[drone.strategy].altitude)) {
      if (Math.hypot(drone.group.position.x - base.x, drone.group.position.z - base.z) > 20) return;
    }
    if (!drone.deposited) {
      drone.deposited = true;
      request('deposit', { x: drone.group.position.x, z: drone.group.position.z, baseX: base.x, baseZ: base.z }).then(state => { roomState = state; syncFlightPanel(); }).catch(error => { drone.deposited = false; document.getElementById('multi-flight-status').textContent = error.message; });
    }
  }

  function syncDrones(explorer) {
    const activeIds = new Set(roomState?.players.map(player => player.id) || []);
    for (const [id, drone] of drones) if (!activeIds.has(id)) { drone.group?.parent?.remove(drone.group); drones.delete(id); }
    for (const player of roomState?.players || []) {
      if (!player.resourceId || !['assigned', 'outbound', 'collecting', 'returning', 'deposited'].includes(player.status)) continue;
      const local = player.id === session?.playerId;
      let drone = drones.get(player.id);
      if (!drone && !local) drone = ensureRemoteDrone(player, explorer);
      if (!drone) continue;
      if (local) {
        if (player.status === 'deposited') { drone.deposited = true; drone.group.position.copy(explorer.shipGroup.position); }
        updateDrone(drone, explorer); continue;
      }
      if (player.position) {
        const terrain = window.SurfaceNavigation?.heightAt?.(player.position.x, player.position.z, explorer.planetKey) || 0;
        drone.group.position.set(player.position.x, terrain + (strategies[player.strategy]?.altitude || 28), player.position.z);
      } else if (player.status === 'deposited') drone.group.position.copy(explorer.shipGroup.position);
    }
  }

  async function syncFlightPanel() {
    ensureFlightPanel();
    const explorer = window.surfaceExplorer;
    if (!session || roomState?.phase === 'lobby' || !explorer?.isActive || explorer.planetKey !== roomState?.planetKey) { flightPanel.hidden = true; return; }
    if (!resourcesPromise) {
      resourcesPromise = loadMinerals(explorer.planetKey, explorer);
      try { const resources = await resourcesPromise; if (roomState && explorer.isActive) renderFlightPanel(resources); }
      catch (error) { document.getElementById('multi-flight-status').textContent = error.message + ' Revisa que la API de planetas esté activa.'; flightPanel.hidden = false; }
    } else {
      try { renderFlightPanel(await resourcesPromise); } catch {}
    }
  }

  function animationLoop() {
    if (session && roomState) {
      const explorer = window.surfaceExplorer;
      if (explorer?.isActive && explorer.planetKey === roomState.planetKey) syncDrones(explorer);
      else for (const [id, drone] of drones) { drone.group?.parent?.remove(drone.group); drones.delete(id); }
    }
    frame = requestAnimationFrame(animationLoop);
  }

  function wrapNavigation() {
    const navigation = window.PlanetNavigation;
    if (!navigation || navigation.__multiLocked) return;
    const original = navigation.go;
    navigation.go = function (engine, planetKey) {
      if (session?.started && planetKey !== session.planetKey) {
        const message = `Esta partida tiene como destino ${planetNames[session.planetKey] || session.planetKey}.`;
        const status = document.getElementById('multi-flight-status'); if (status) status.textContent = message;
        else window.ExplorationUpgrades?.message('Cooperativo · ' + message);
        return false;
      }
      return original.apply(this, arguments);
    };
    navigation.__multiLocked = true;
  }

  function bootstrap() {
    installMenuButton(); ensureLobby(); wrapNavigation();
    window.setInterval(poll, 900);
    window.setInterval(syncFlightPanel, 1200);
    if (session) poll();
    requestAnimationFrame(animationLoop);
  }

  async function poll() {
    if (!session) return;
    await fetchState();
    wrapNavigation();
    if (roomState) syncFlightPanel();
  }

  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  window.CooperativeMission = {
    get session() { return session; }, get state() { return roomState; }, get active() { return !!session?.started; },
    leave: leaveRoom, poll,
  };
})();
