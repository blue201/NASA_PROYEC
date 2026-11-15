/* Cooperative mineral expeditions. Lobby is available from the main menu; gameplay requires ?multi=1. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const multiMode = params.get('multi') === '1';

  const SESSION_KEY = 'odyssey_multiplayer_v1';
  const characters = { sofia: 'Capitana Sofía Parker', leo: 'Ing. Leo Chen', marcus: 'Oficial Marcus Vance', arthur: 'Dr. Arthur Vance (Houston)' };
  const characterAvatars = { sofia: 'assets/sofia_parker.jpg', leo: 'assets/leo_chen.jpg', marcus: 'assets/marcus_vance.jpg', arthur: 'assets/houston_director.jpg' };
  const planetNames = { moon: 'Luna', mars: 'Marte', mercury: 'Mercurio', venus: 'Venus' };
  const projectTypes = {
    medical: { name: 'Unidad médica portátil', conditions: { orbital_fever: 'Fiebre orbital', lunar_adaptation: 'Síndrome de adaptación lunar', habitat_fatigue: 'Fatiga de hábitat' } },
    navigation: { name: 'Equipo especializado de navegación', conditions: null },
    eldercare: { name: 'Robot asistente para personas mayores', conditions: null },
  };
  const strategies = {
    direct: { name: 'Directa', speed: 31, altitude: 24, description: 'Ruta recta y rápida.' },
    efficient: { name: 'Eficiente', speed: 23, altitude: 28, description: 'Visita primero los depósitos más cercanos.' },
    safe: { name: 'Segura', speed: 16, altitude: 46, description: 'Vuelo lento y elevado sobre el terreno.' },
  };
  let session = null, roomState = null, dialog, lobbyStatus, lobbyContent, flightPanel, planetData = null, missionDraft = null;
  const planetCatalogs = new Map();
  let resourcesPromise = null, depositsPlanet = '', pollBusy = false, lastResourceOptions = '', lastLobbySignature = '', lastSent = 0, frame = 0;
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
    #multi-lobby{position:fixed;inset:50% auto auto 50%;transform:translate(-50%,-50%);margin:0;box-sizing:border-box;width:min(760px,calc(100vw - 28px));max-height:88vh;overflow:auto;padding:0;border:1px solid #69cddd;border-radius:14px;background:#071522f5;color:#e9f3f8;font:14px/1.5 system-ui;box-shadow:0 20px 80px #000b;isolation:isolate}
    .multi-lobby-background{position:absolute;inset:0;z-index:0;opacity:.2;background:center/cover no-repeat;pointer-events:none}
    #multi-lobby::before{content:"";position:absolute;inset:0;z-index:1;background:#07152299;pointer-events:none}
    .multi-lobby-surface{position:relative;z-index:2;padding:22px;background:transparent}
    #multi-lobby::backdrop{background:#020810d9;backdrop-filter:blur(5px)}
    #multi-lobby h2,#multi-lobby h3{margin:0 0 10px}#multi-lobby label{display:grid;gap:5px;margin:10px 0;color:#bcd5df;font-size:12px}
    #multi-lobby input,#multi-lobby select{box-sizing:border-box;width:100%;min-height:42px;padding:8px 10px;border:1px solid #547788;border-radius:7px;background:#07121c;color:#f2fbff;font:inherit}
    .multi-lobby-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.multi-lobby-head button,#multi-lobby button{min-height:40px;padding:8px 12px;border:1px solid #668a99;border-radius:7px;background:#102b3b;color:#eaf8ff;cursor:pointer}.multi-lobby-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.multi-divider{height:1px;margin:18px 0;border:0;background:#8fc6d033}
    .multi-waiting-room{margin-top:14px;padding:14px;border:1px solid #69cddd66;border-radius:10px;background:#07152299}.multi-waiting-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin:12px 0}.multi-waiting-card{display:flex;align-items:center;gap:11px;min-width:0;padding:10px;border:1px solid #ffffff24;border-radius:9px;background:#0a1d29d9}.multi-waiting-avatar{width:54px;height:54px;flex:none;object-fit:cover;border-radius:50%;border:2px solid #69cddd;box-shadow:0 0 14px #39b9cf44}.multi-waiting-info{min-width:0}.multi-waiting-info strong,.multi-waiting-info small{display:block;overflow:hidden;text-overflow:ellipsis}.multi-waiting-info small{color:#a9c2ce}.multi-waiting-mineral{margin-top:4px;color:#8de6c3;font-size:12px}.multi-waiting-mineral.is-pending{color:#f3c84b}
    .multi-room-code{padding:10px;border:1px dashed #67d9ef;border-radius:8px;color:#a9f0ff;font:700 24px ui-monospace,monospace;letter-spacing:4px;text-align:center}.multi-roster{display:grid;gap:7px;margin:12px 0;padding:0;list-style:none}.multi-roster li{display:flex;justify-content:space-between;gap:10px;padding:9px 11px;border:1px solid #ffffff20;border-radius:7px;background:#0a1d29}.multi-roster small{color:#9fb4c0}.multi-status{min-height:1.4em;color:#9ce4d2}.multi-error{color:#ff9b9e!important}
    .multi-objective-list{display:grid;gap:6px;margin:8px 0}.multi-objective-choice{display:flex!important;grid-template-columns:18px 12px 1fr;align-items:center;gap:8px!important;margin:0!important;padding:8px;border:1px solid #ffffff20;border-radius:6px;background:#0a1d29}.multi-objective-choice input{width:16px!important;min-height:16px!important;margin:0;accent-color:var(--mineral-color)}.multi-mineral-dot{width:10px;height:10px;border-radius:50%;background:var(--mineral-color);box-shadow:0 0 9px var(--mineral-color)}.multi-objective-chip{display:inline-flex;align-items:center;gap:6px;margin:3px 5px 3px 0;padding:4px 8px;border:1px solid color-mix(in srgb,var(--mineral-color),transparent 55%);border-radius:999px;color:#eaf8ff;background:#0a1d29;font-size:11px}.multi-objective-chip i{width:8px;height:8px;border-radius:50%;background:var(--mineral-color);box-shadow:0 0 8px var(--mineral-color)}
    .multi-waiting-room{margin-top:14px;padding:14px;border:1px solid #69cddd66;border-radius:10px;background:#07152299}.multi-waiting-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin:12px 0}.multi-waiting-card{display:flex;align-items:center;gap:11px;min-width:0;padding:10px;border:1px solid #ffffff24;border-radius:9px;background:#0a1d29d9}.multi-waiting-avatar{width:54px;height:54px;flex:none;object-fit:cover;border-radius:50%;border:2px solid #69cddd;box-shadow:0 0 14px #39b9cf44}.multi-waiting-info{min-width:0}.multi-waiting-info strong,.multi-waiting-info small{display:block;overflow:hidden;text-overflow:ellipsis}.multi-waiting-info small{color:#a9c2ce}.multi-waiting-mineral{margin-top:4px;color:#8de6c3;font-size:12px}.multi-waiting-mineral.is-pending{color:#f3c84b}
    #cooperative-mission-panel{position:fixed;top:20px;left:20px;z-index:1200;box-sizing:border-box;width:min(360px,calc(100vw - 40px));max-height:75vh;overflow:auto;padding:14px;border:1px solid #67c9dd;border-radius:12px;background:#071522ed;color:#e9f3f8;box-shadow:0 8px 30px #0008;font:12px/1.45 system-ui}
    #cooperative-mission-panel h2{margin:0 0 6px;font-size:15px}#cooperative-mission-panel p{margin:6px 0;color:#b9cdd7}#cooperative-mission-panel label{display:grid;gap:4px;margin:9px 0;color:#aee4ef}#cooperative-mission-panel select,#cooperative-mission-panel button{box-sizing:border-box;width:100%;min-height:38px;padding:7px 9px;border:1px solid #587b8c;border-radius:6px;color:#f0fbff;background:#0b2230}
    .multi-team-list{display:grid;gap:5px;margin:10px 0;padding:0;list-style:none}.multi-team-list li{padding:6px 8px;border-radius:5px;background:#0d2634}.multi-manifest{padding:8px;border:1px solid #78d9bc55;border-radius:6px;color:#b7f1d7}.multi-pill{float:right;color:#8de6c3}
    @media(max-width:650px){#cooperative-mission-panel{top:auto;bottom:16px;left:12px;width:min(340px,calc(100vw - 24px));max-height:42vh}.multi-lobby-surface{padding:16px}}
  `;
  document.head.append(style);

  function request(action, extra = {}) {
    const data = { action, ...extra };
    if (session && !['create', 'join'].includes(action)) { data.code = session.code; data.playerId = session.playerId; }
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
    dialog.innerHTML = '<div class="multi-lobby-background" aria-hidden="true"></div><div class="multi-lobby-surface"><div class="multi-lobby-head"><div><small>ODYSSEY · COOPERATIVO</small><h2 id="multi-lobby-title">Partida multijugador</h2></div><button type="button" data-multi-close aria-label="Cerrar">Cerrar</button></div><div id="multi-lobby-content"></div><p id="multi-lobby-status" class="multi-status" role="status"></p></div>';
    document.body.append(dialog);
    lobbyContent = dialog.querySelector('#multi-lobby-content'); lobbyStatus = dialog.querySelector('#multi-lobby-status');
    dialog.addEventListener('click', event => {
      if (event.target.closest('[data-multi-close]')) dialog.close();
      const action = event.target.closest('[data-multi-action]')?.dataset.multiAction;
      if (action === 'create') createRoom();
      if (action === 'join') joinRoom();
      if (action === 'start') startRoom();
      if (action === 'configure') configureMission();
      if (action === 'enter') enterMission();
      if (action === 'leave') leaveRoom();
    });
    dialog.addEventListener('change', event => {
      if (event.target.id === 'multi-lobby-planet') {
        missionDraft.planetKey = event.target.value;
        missionDraft.resourceIds = [];
        drawLobby(); loadLobbyCatalog(missionDraft.planetKey);
      } else if (event.target.id === 'multi-lobby-project') {
        missionDraft.projectId = event.target.value;
        missionDraft.conditionId = projectTypes[missionDraft.projectId].conditions ? Object.keys(projectTypes[missionDraft.projectId].conditions)[0] : '';
        drawLobby();
      } else if (event.target.id === 'multi-lobby-condition') {
        missionDraft.conditionId = event.target.value;
        drawLobby();
      } else if (event.target.id === 'multi-lobby-mineral-select') {
        reserveMineral(true);
      } else if (event.target.matches('.multi-objective-checkbox')) {
        const input = event.target;
        if (!missionDraft) return;
        if (input.checked && missionDraft.resourceIds.length >= 4) input.checked = false;
        else if (input.checked) missionDraft.resourceIds.push(input.value);
        else missionDraft.resourceIds = missionDraft.resourceIds.filter(id => id !== input.value);
        drawLobby();
      }
    });
    loadLobbyBackdrop();
    dialog.addEventListener('close', () => { document.getElementById('multi-menu-button')?.focus(); });
  }

  async function loadLobbyBackdrop() {
    try {
      const response = await fetch('/api/apod', { cache: 'force-cache' });
      if (!response.ok) throw new Error('APOD unavailable');
      const apod = await response.json();
      const image = apod.media_type === 'image' ? (apod.url || apod.hdurl) : '';
      const url = new URL(image || 'assets/milky-way-eso.jpg', location.href);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid APOD URL');
      const layer = dialog?.querySelector('.multi-lobby-background');
      if (layer) layer.style.backgroundImage = `url("${url.href}")`;
    } catch {
      const layer = dialog?.querySelector('.multi-lobby-background');
      if (layer) layer.style.backgroundImage = 'url("assets/milky-way-eso.jpg")';
    }
  }

  function showLobbyMessage(text, error = false) {
    if (!lobbyStatus) return;
    lobbyStatus.textContent = text; lobbyStatus.classList.toggle('multi-error', error);
  }

  function showEntry() {
    ensureLobby();
    dialog.querySelector('#multi-lobby-title').textContent = 'Partida multijugador';
    lobbyContent.innerHTML = `<div class="multi-room-forms">
      <section><h3>Crear partida</h3><label>Personaje de la historia<select id="multi-create-character">${characterOptions()}</select></label>
      <button type="button" data-multi-action="create">Crear partida</button></section><hr class="multi-divider">
      <section><h3>Unirse a partida</h3><label>Personaje de la historia<select id="multi-join-character">${characterOptions()}</select></label>
      <label>Codigo de partida<input id="multi-join-code" maxlength="6" autocomplete="off" placeholder="ABC123" style="text-transform:uppercase"></label>
      <button type="button" data-multi-action="join">Unirse</button></section></div>`;
    showLobbyMessage('Reune de 2 a 4 jugadores. El anfitrion define planeta y un mineral distinto por jugador.');
  }

  function characterOptions() { return Object.entries(characters).map(([id, name]) => `<option value="${id}">${escapeHTML(name)}</option>`).join(''); }

  async function loadLobbyCatalog(key) {
    if (planetCatalogs.has(key)) return planetCatalogs.get(key);
    if (key === 'moon' && !window.MoonData?.planet) await window.MoonData?.ready?.catch(() => {});
    let data = key === 'moon' ? window.MoonData?.planet : null;
    if (!data) {
      const response = await fetch(apiPlanet(key), { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo cargar el catalogo del planeta.');
      data = await response.json();
    }
    const resources = (data.resources || []).filter(resource => {
      const location = String(resource.location || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return location && resource.id !== 'no-surface' && !['regolith-oxygen', 'helium-3', 'co2-atmosphere'].includes(resource.id) && !/atmosfera|nubes|sin superficie solida/.test(location);
    });
    planetCatalogs.set(key, resources);
    return resources;
  }

  function safeColor(color) { return /^#[0-9a-f]{6}$/i.test(color || '') ? color : '#43d9c3'; }
  const mineralPalette = ['#43d9c3', '#f3c84b', '#ff826e', '#ae91ff'];
  const mineralColors = {
    'water-ice': '#5cc8ff', ilmenite: '#ad7d37', plagioclase: '#d8d5c8', pyroxene: '#5a8c54',
    olivine: '#89b843', 'iron-bearing-minerals': '#b65348', perchlorate: '#d0bd8d',
    'mid-latitude-ice': '#83dff2', sulfur: '#f3dd4d', enstatite: '#a78bc2', oldhamite: '#ff9a57',
    basalt: '#777b82', orthopyroxene: '#6a9c84', anorthite: '#e8e3d7',
  };
  function mineralColor(resourceId) {
    if (mineralColors[resourceId]) return mineralColors[resourceId];
    const hash = Array.from(String(resourceId)).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
    return mineralPalette[hash % mineralPalette.length];
  }
  function objectiveChips(objectives = []) {
    return objectives.map(item => { const count = Math.min(item.required || 1, roomState?.manifest?.[item.resourceId] || 0); return `<span class="multi-objective-chip" style="--mineral-color:${safeColor(item.color)}"><i></i>${escapeHTML(item.name)} ${count}/${item.required || 1}</span>`; }).join('');
  }

  async function configureMission() {
    if (!session || !missionDraft) return;
    try {
      roomState = await request('configure', { planetKey: missionDraft.planetKey, projectId: missionDraft.projectId, conditionId: missionDraft.conditionId, resourceIds: missionDraft.resourceIds });
      lastLobbySignature = '';
      missionDraft = { planetKey: roomState.planetKey, projectId: roomState.projectId, conditionId: roomState.conditionId || '', resourceIds: roomState.objectives.map(item => item.resourceId) };
      session.planetKey = roomState.planetKey; persist(); drawLobby();
      showLobbyMessage('Proyecto configurado. Cada mineral queda reservado mientras un dron lo recolecta.');
    } catch (error) { showLobbyMessage(error.message, true); }
  }

  function drawLobby() {
    if (!dialog?.open || !session || !roomState) return;
    const current = roomState.players.find(player => player.id === session.playerId);
    const isHost = current?.host === true && current.id === roomState.hostId;
    const roomPlayers = roomState.players.map(player => `<li><span>${escapeHTML(player.name)}${player.host ? ' / anfitrión' : ''}${player.resourceName ? ` · ${escapeHTML(player.resourceName)}` : ''}</span><small>${escapeHTML(player.status === 'waiting' ? 'En espera' : player.status === 'reserved' ? 'Mineral reservado' : player.status === 'deposited' ? 'Carga depositada' : player.status === 'assigned' ? 'Dron listo' : 'Dron operando')}</small></li>`).join('');
    const started = roomState.phase !== 'lobby';
    if (isHost && !started && !missionDraft) missionDraft = { planetKey: roomState.planetKey, projectId: roomState.projectId || 'medical', conditionId: roomState.conditionId || 'orbital_fever', resourceIds: (roomState.objectives || []).map(item => item.resourceId) };
    const draftKey = missionDraft?.planetKey || roomState.planetKey;
    const catalog = planetCatalogs.get(draftKey) || [];
    const isConfigured = roomState.objectives.length === 4;
    const title = dialog.querySelector('#multi-lobby-title');
    if (title) title.textContent = isConfigured && !started ? 'Sala de espera' : 'Partida multijugador';
    const selection = !started && isHost && !isConfigured
      ? `<section class="multi-mission-config"><h3>Preparar proyecto cooperativo</h3><label>Proyecto<select id="multi-lobby-project">${Object.entries(projectTypes).map(([id, item]) => `<option value="${id}"${id === missionDraft.projectId ? ' selected' : ''}>${escapeHTML(item.name)}</option>`).join('')}</select></label>${projectTypes[missionDraft.projectId]?.conditions ? `<label>Condición ficticia a tratar<select id="multi-lobby-condition">${Object.entries(projectTypes[missionDraft.projectId].conditions).map(([id, name]) => `<option value="${id}"${id === missionDraft.conditionId ? ' selected' : ''}>${escapeHTML(name)}</option>`).join('')}</select></label>` : ''}<label>Planeta de la misión<select id="multi-lobby-planet">${Object.entries(planetNames).map(([id, name]) => `<option value="${id}"${id === draftKey ? ' selected' : ''}>${escapeHTML(name)}</option>`).join('')}</select></label><p>Receta: selecciona cuatro minerales distintos. Los jugadores pueden repetir despliegues; un mineral ocupado queda bloqueado hasta su depósito.</p><div class="multi-objective-list">${catalog.map(item => { const color = mineralColor(item.id); const checked = missionDraft.resourceIds.includes(item.id); return `<label class="multi-objective-choice" style="--mineral-color:${color}"><input class="multi-objective-checkbox" type="checkbox" value="${escapeHTML(item.id)}"${checked ? ' checked' : ''}${!checked && missionDraft.resourceIds.length >= 4 ? ' disabled' : ''}><i class="multi-mineral-dot"></i><span>${escapeHTML(item.name || item.id)}</span></label>`; }).join('') || '<small>Cargando minerales del planeta...</small>'}</div><button type="button" data-multi-action="configure"${roomState.players.length < 2 || missionDraft.resourceIds.length !== 4 ? ' disabled' : ''}>Guardar proyecto</button></section>`
      : `<section><h3>${escapeHTML(roomState.projectName || 'Proyecto sin definir')}${roomState.conditionName ? ` · ${escapeHTML(roomState.conditionName)}` : ''}</h3><p>Materiales requeridos</p><div>${objectiveChips(roomState.objectives)}</div></section>`;
    const availabilityNotice = !started && isHost && !isConfigured
      ? `<p role="status">${catalog.length ? `${catalog.length} minerales recolectables disponibles en ${escapeHTML(planetNames[draftKey] || draftKey)}.` : 'Cargando los minerales recolectables de este planeta…'}</p>`
      : '';
    const waitingRoom = !started && isConfigured
      ? `<section class="multi-waiting-room"><h3>Sala de espera</h3><p>Tripulación y minerales elegidos para ${escapeHTML(planetNames[roomState.planetKey] || roomState.planetKey)}:</p><div class="multi-objective-list">${objectiveChips(roomState.objectives)}</div><div class="multi-waiting-grid">${roomState.players.map(player => `<article class="multi-waiting-card"><img class="multi-waiting-avatar" src="${escapeHTML(characterAvatars[player.characterId] || characterAvatars.sofia)}" alt="Retrato de ${escapeHTML(player.name)}"><div class="multi-waiting-info"><strong>${escapeHTML(characters[player.characterId] || player.name)}${player.host ? ' · Anfitrión' : ''}</strong><small>${escapeHTML(player.role || 'Tripulación Odyssey')}</small><div class="multi-waiting-mineral${player.resourceName ? '' : ' is-pending'}">${player.resourceName ? `Mineral: ${escapeHTML(player.resourceName)}` : 'Esperando selección de mineral'}</div></div></article>`).join('')}</div>${renderLobbyMineralPicker(current)}</section>`
      : '';
    lobbyContent.innerHTML = `<div class="multi-room-code" aria-label="Codigo de partida">${escapeHTML(roomState.code)}</div>
      <p>El equipo construirá <strong>${escapeHTML(roomState.projectName || 'un proyecto cooperativo')}</strong>${roomState.conditionName ? ` para tratar ${escapeHTML(roomState.conditionName)}` : ''} con minerales de <strong>${escapeHTML(planetNames[roomState.planetKey] || roomState.planetKey)}</strong>. Comparte el código con tu equipo.</p>
      ${waitingRoom || `<ul class="multi-roster">${roomPlayers}</ul>${availabilityNotice}${selection}${!started ? renderLobbyMineralPicker(current) : ''}`}
      <div class="multi-lobby-actions">
        ${started ? '<button type="button" data-multi-action="enter">Entrar a la misión</button>' : isHost ? `<button type="button" data-multi-action="start"${roomState.players.length < 2 || roomState.objectives.length !== 4 || roomState.players.some(player => !player.resourceId) ? ' disabled' : ''}>Iniciar misión</button>` : '<small>Esperando que todos elijan un mineral y el anfitrión inicie.</small>'}
        <button type="button" data-multi-action="leave">Salir de la partida</button>
      </div>`;
    if (!current) showLobbyMessage('Se perdio la conexion. Vuelve a unirte a la sala.', true);
    else if (!started && roomState.players.length < 2) showLobbyMessage(`Esperando jugadores: ${roomState.players.length}/4. Se necesitan al menos 2.`);
    else if (!started && roomState.objectives.length !== 4) showLobbyMessage(isHost ? 'Configura y guarda los cuatro minerales de la misión.' : 'Esperando que el anfitrión configure la misión.');
    else if (!started && !current?.resourceId) showLobbyMessage('Elige un mineral de la receta; queda bloqueado para los demás participantes.');
    else if (!started) showLobbyMessage(`Mineral asignado: ${current.resourceName}. El anfitrión puede iniciar la misión.`);
    else if (!started && roomState.players.some(player => !player.resourceId)) showLobbyMessage(isHost ? 'Esperando a que la tripulacion elija su mineral antes de iniciar.' : 'Esperando que el resto de la tripulacion elija su mineral.');
    else if (started) showLobbyMessage('Mision iniciada. Cada jugador puede entrar cuando este listo.');
    else showLobbyMessage('Esperando la configuracion del anfitrion.');
    if (!started && isHost && !catalog.length) loadLobbyCatalog(draftKey).then(drawLobby).catch(error => showLobbyMessage(error.message, true));
  }

  function renderLobbyMineralPicker(current) {
    if (!current || roomState.objectives.length !== 4) return '';
    const options = roomState.objectives.map(item => {
      const occupant = roomState.players.find(player => player.id !== current.id && player.resourceId === item.resourceId && player.status !== 'waiting');
      const complete = (roomState.manifest?.[item.resourceId] || 0) >= (item.required || 1);
      const disabled = !!occupant || complete;
      const owner = occupant ? (characters[occupant.characterId] || occupant.name) : '';
      return `<option value="${escapeHTML(item.resourceId)}"${item.resourceId === current.resourceId ? ' selected' : ''}${disabled && item.resourceId !== current.resourceId ? ' disabled' : ''}>${escapeHTML(item.name)}${occupant ? ` — seleccionado por ${escapeHTML(owner)}; bloqueado` : complete ? ' — completado' : ''}</option>`;
    }).join('');
    return `<section class="multi-lobby-assignment"><h3>Tu mineral de recolección</h3><label>Selecciona un material<select id="multi-lobby-mineral-select"><option value="">${current.resourceId ? 'Quitar selección' : 'Elige un mineral'}</option>${options}</select></label><p>La elección queda visible y bloqueada para el resto del equipo.</p></section>`;
  }

  async function createRoom() {
    try {
      const characterId = document.getElementById('multi-create-character')?.value;
      const result = await request('create', { characterId });
      session = { code: result.room.code, playerId: result.playerId, planetKey: result.room.planetKey, started: false }; persist(); roomState = result.room; missionDraft = { planetKey: result.room.planetKey, projectId: 'medical', conditionId: 'orbital_fever', resourceIds: [] }; drawLobby();
    } catch (error) { showLobbyMessage(error.message, true); }
  }

  async function joinRoom() {
    try {
      const code = document.getElementById('multi-join-code')?.value.trim().toUpperCase();
      const characterId = document.getElementById('multi-join-character')?.value;
      const result = await request('join', { code, characterId });
      session = { code: result.room.code, playerId: result.playerId, planetKey: result.room.planetKey, started: false }; persist(); roomState = result.room; missionDraft = null; drawLobby();
    } catch (error) { showLobbyMessage(error.message, true); }
  }

  async function startRoom() {
    try { roomState = await request('start'); if (session) { session.started = true; persist(); } drawLobby(); }
    catch (error) { showLobbyMessage(error.message.includes('anfitri') ? `${error.message} Anfitrión identificado: ${roomState?.players.find(player => player.host)?.name || 'ninguno'}.` : error.message, true); }
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
    const button = document.createElement('button'); button.id = 'multi-menu-button'; button.type = 'button'; button.textContent = 'Jugar multijugador';
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
      const signature = JSON.stringify({ phase: next.phase, hostId: next.hostId, planetKey: next.planetKey, projectId: next.projectId, conditionId: next.conditionId, objectives: next.objectives, players: next.players.map(({ id, name, host, characterId, resourceId, resourceName, strategy, status }) => ({ id, name, host, characterId, resourceId, resourceName, strategy, status })), manifest: next.manifest });
      if (signature !== lastLobbySignature) { lastLobbySignature = signature; drawLobby(); }
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
    flightPanel.innerHTML = '<h2>Operación minera del equipo</h2><p id="multi-objective"></p><div id="multi-objectives"></div><div id="multi-assignment"></div><ul id="multi-team" class="multi-team-list"></ul><div id="multi-manifest" class="multi-manifest"></div><p id="multi-flight-status" role="status"></p><button type="button" id="multi-flight-leave">Salir de la partida</button>';
    document.body.append(flightPanel);
    flightPanel.addEventListener('click', event => {
      if (event.target.closest('#multi-flight-leave')) { leaveRoom(); return; }
      if (!event.target.closest('#multi-deploy')) return;
      reserveAndDeploy();
    });
    flightPanel.addEventListener('change', event => {
      if (event.target.id === 'multi-resource-select') reserveMineral();
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
    document.getElementById('multi-objective').textContent = `${roomState.projectName || 'Proyecto cooperativo'}${roomState.conditionName ? ` · ${roomState.conditionName}` : ''} · ${planetNames[roomState.planetKey] || roomState.planetKey} · ${roomState.players.length}/4 jugadores`;
    document.getElementById('multi-objectives').innerHTML = objectiveChips(roomState.objectives);
    const team = document.getElementById('multi-team');
    team.innerHTML = roomState.players.map(player => {
      const color = safeColor(roomState.objectives.find(item => item.resourceId === player.resourceId)?.color);
      const activity = player.status === 'deposited' ? `deposito ${player.deposited}` : player.status === 'returning' ? `regresa con ${player.cargo}` : player.status === 'outbound' || player.status === 'collecting' ? `recolecta ${player.cargo}` : player.status === 'assigned' ? 'listo para desplegar' : player.status === 'reserved' ? 'mineral reservado' : 'elige asignacion';
      return `<li><strong><span aria-hidden="true" style="color:${color}">●</span> ${escapeHTML(player.name)}</strong> - ${escapeHTML(player.resourceName || 'sin mineral')} - ${escapeHTML(player.strategy ? labelStrategy(player.strategy) : 'sin estrategia')} - ${activity}</li>`;
    }).join('');
    document.getElementById('multi-manifest').textContent = 'Receta: ' + roomState.objectives.map(item => `${item.name} ${Math.min(item.required || 1, roomState.manifest?.[item.resourceId] || 0)}/${item.required || 1}`).join(' · ');
    const assignment = document.getElementById('multi-assignment');
    if (!me) { assignment.innerHTML = '<p>Tu acceso a la partida caducó. Regresa al menú para unirte de nuevo.</p>'; return; }
    if (roomState.missionComplete) {
      assignment.innerHTML = `<p>Proyecto terminado: <strong>${escapeHTML(roomState.projectName || 'construcción cooperativa')}</strong>${roomState.conditionName ? ` para ${escapeHTML(roomState.conditionName)}` : ''}. Los cuatro materiales llegaron a la nave.</p>`;
      document.getElementById('multi-flight-status').textContent = 'Receta completada. El equipo construyó el proyecto cooperativo.';
      return;
    }
    if (me.status === 'waiting' || me.status === 'reserved') {
      resources = resources.filter(resource => roomState.objectives.some(item => item.resourceId === resource.id && (roomState.manifest[item.resourceId] || 0) < (item.required || 1)));
      const lockKey = roomState.players.map(player => `${player.id}:${player.resourceId}:${player.status}`).join('|') + '|' + resources.map(resource => resource.id).join(',');
      if (lastResourceOptions !== lockKey || !assignment.querySelector('select')) {
        lastResourceOptions = lockKey;
        assignment.innerHTML = `<p>Selecciona un material; al reservarlo quedara bloqueado para el resto. Despues elige la estrategia del dron.</p>
          <label>Mineral a recolectar<select id="multi-resource-select"><option value=""${me.status === 'waiting' ? ' selected' : ''}>Selecciona un mineral</option>${resources.map(resource => { const occupant = lockSummary(resource.id); return `<option value="${escapeHTML(resource.id)}" style="color:${mineralColor(resource.id)}"${resource.id === me.resourceId ? ' selected' : ''}${occupant ? ' disabled' : ''}>${escapeHTML(resource.name || resource.id)}${occupant ? ` - ocupado por ${escapeHTML(occupant.name)}` : ''}</option>`; }).join('')}</select></label>
          <label>Estrategia de navegacion<select id="multi-strategy-select"><option value="efficient"${!me.strategy || me.strategy === 'efficient' ? ' selected' : ''}>Eficiente - menor distancia total</option><option value="direct"${me.strategy === 'direct' ? ' selected' : ''}>Directa - maxima velocidad</option><option value="safe"${me.strategy === 'safe' ? ' selected' : ''}>Segura - mayor altura y control</option></select></label>
          <button type="button" id="multi-deploy"${resources.length && me.status === 'reserved' ? '' : ' disabled'}>Desplegar dron recolector</button>`;
      }
      document.getElementById('multi-flight-status').textContent = me.status === 'reserved' ? 'Material reservado para tu dron. Los demas ya lo ven bloqueado.' : resources.length ? 'Selecciona un material para reservarlo en la sala.' : 'No quedan materiales pendientes en esta receta.';
    } else {
      assignment.innerHTML = `<p>Tu dron: <strong>${escapeHTML(me.resourceName)}</strong> · estrategia ${escapeHTML(labelStrategy(me.strategy))}.</p>`;
      const msg = { assigned: 'Preparando despliegue desde la nave principal…', outbound: 'Dron en ruta al depósito.', collecting: 'Recolectando muestras.', returning: 'Carga asegurada; regresando a la nave principal.', deposited: `Misión de dron completada · ${me.deposited} unidades depositadas.` };
      document.getElementById('multi-flight-status').textContent = roomState.missionComplete ? 'Receta completada. El equipo construyó el proyecto cooperativo.' : msg[me.status] || 'Operación en curso.';
    }
  }

  async function reserveMineral(fromLobby = false) {
    const selectId = fromLobby ? 'multi-lobby-mineral-select' : 'multi-resource-select';
    const resourceId = document.getElementById(selectId)?.value;
    const me = roomState?.players.find(player => player.id === session?.playerId);
    if (!me) return;
    try {
      roomState = resourceId ? await request('reserve', { resourceId, strategy: document.getElementById('multi-strategy-select')?.value || 'efficient' }) : me.status === 'reserved' ? await request('unreserve') : roomState;
      lastResourceOptions = '';
      if (fromLobby) { lastLobbySignature = ''; drawLobby(); }
      await syncFlightPanel();
    } catch (error) {
      if (fromLobby) { showLobbyMessage(error.message, true); lastLobbySignature = ''; drawLobby(); }
      else { document.getElementById('multi-flight-status').textContent = error.message; poll(); }
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
    const objective = roomState?.objectives?.find(item => item.resourceId === player.resourceId);
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(safeColor(objective?.color)), metalness: 0.35, roughness: 0.4 });
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
      group.position.copy(explorer.shipGroup.position);
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
    let x = current.x + dx / distance * step, z = current.z + dz / distance * step;
    const activeStatuses = ['assigned', 'outbound', 'collecting', 'returning'];
    const candidateY = (window.SurfaceNavigation?.heightAt?.(x, z, explorer.planetKey) || 0) + altitude;
    const nearbyPlayer = roomState?.players.find(player => {
      if (player.id === drone.playerId || !player.resourceId || !activeStatuses.includes(player.status)) return false;
      const other = drones.get(player.id)?.group?.position;
      return !!other && Math.hypot(x - other.x, candidateY - other.y, z - other.z) < 24;
    });
    if (nearbyPlayer) {
      const otherDrone = drones.get(nearbyPlayer.id), other = otherDrone.group.position;
      let nx = x - other.x, nz = z - other.z, separation = Math.hypot(nx, nz);
      if (separation < 0.01) { nx = drone.playerId < nearbyPlayer.id ? 1 : -1; nz = 0; separation = 1; }
      nx /= separation; nz /= separation;
      const side = drone.playerId < nearbyPlayer.id ? 1 : -1;
      const tangentX = -nz * side, tangentZ = nx * side;
      x = other.x + nx * 27 + tangentX * 9;
      z = other.z + nz * 27 + tangentZ * 9;
      drone.collisionUntil = performance.now() + 180;
      drone.group.rotation.z = side * 0.38;
      otherDrone.collisionUntil = drone.collisionUntil;
      otherDrone.group.position.x -= nx * 7;
      otherDrone.group.position.z -= nz * 7;
      otherDrone.group.rotation.z = -side * 0.3;
    } else if (drone.collisionUntil < performance.now()) drone.group.rotation.z *= 0.7;
    const terrain = candidateY - altitude;
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
      drone.status = player.status;
      if (local) {
        if (player.status === 'deposited') { drone.deposited = true; drone.group.position.copy(explorer.shipGroup.position); }
        updateDrone(drone, explorer); continue;
      }
      if (player.position) {
        const terrain = window.SurfaceNavigation?.heightAt?.(player.position.x, player.position.z, explorer.planetKey) || 0;
        drone.targetPosition ||= new window.THREE.Vector3();
        drone.targetPosition.set(player.position.x, terrain + (strategies[player.strategy]?.altitude || 28), player.position.z);
        drone.group.position.lerp(drone.targetPosition, 0.38);
        drone.group.rotation.y = Math.atan2(player.position.x - drone.group.position.x, player.position.z - drone.group.position.z);
      } else if (player.status === 'assigned' || player.status === 'deposited') drone.group.position.lerp(explorer.shipGroup.position, 0.38);
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
    window.setInterval(() => { if (session) poll(); }, 900);
    window.setInterval(() => { if (session) syncFlightPanel(); }, 1200);
    if (session) poll();
    if (multiMode && session) requestAnimationFrame(animationLoop);
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
