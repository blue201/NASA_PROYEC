/* Cooperative mineral expeditions. Lobby is available from the main menu; gameplay requires ?multi=1. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);

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
  let session = null, roomState = null, dialog, lobbyStatus, lobbyContent, flightPanel, soloPanel = null, planetData = null, missionDraft = null;
  let soloCatalog = [], soloManifest = Object.create(null), soloMineral = '', soloMessage = '', soloMissionPlanet = '', soloMissionComplete = false, droneModelPromise = null, followingCaptainTravel = false, captainTravelVersion = 0, captainTravelPending = false, missionResultShown = '';
  const planetCatalogs = new Map();
  let resourcesPromise = null, depositsPlanet = '', pollBusy = false, lastResourceOptions = '', lastLobbySignature = '', lastSent = 0, frame = 0, multiPlacementObserver = null, hangarPlacementObserver = null;
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
    #cooperative-mission-panel{top:auto;right:0;bottom:calc(100% + 64px);left:auto;width:min(300px,calc(100vw - 32px));max-height:none;overflow:visible;padding:0;border:0;background:transparent;box-shadow:none;pointer-events:auto}
    #multi-panel-toggle{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:42px;padding:9px 13px;border:1px solid #67c9dd;border-radius:9px;background:#071522ed;color:#e9f3f8;font:600 12px/1.3 system-ui;box-shadow:0 5px 16px #0006;cursor:pointer}
    #multi-panel-content{display:none;max-height:min(65vh,540px);overflow:auto;margin-top:7px;padding:12px;border:1px solid #67c9dd66;border-radius:10px;background:#071522f2;box-shadow:0 8px 24px #0007}
    #cooperative-mission-panel.is-open #multi-panel-content{display:block}
    #cooperative-mission-panel .multi-team-list{max-height:130px;overflow:auto}
    #cooperative-mission-panel .multi-panel-progress{color:#8de6c3;font-variant-numeric:tabular-nums}
    #mining-mission-complete{position:fixed;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:min(480px,calc(100vw - 32px));padding:28px;border:1px solid #78e4c1;border-radius:16px;background:#061721f5;color:#eafff7;text-align:center;box-shadow:0 18px 70px #000b;z-index:3000;animation:mining-complete-in .45s cubic-bezier(.16,1,.3,1)}#mining-mission-complete::backdrop{background:#020912d9;backdrop-filter:blur(6px)}#mining-mission-complete h2{margin:0 0 10px;color:#9af0cb;font-size:clamp(22px,5vw,32px)}#mining-mission-complete p{color:#c3d9dc;line-height:1.55}#mining-mission-complete .mining-complete-emblem{display:grid;place-items:center;width:62px;height:62px;margin:0 auto 16px;border:1px solid #76e4bd;border-radius:50%;color:#a7f5d2;font-size:28px;animation:mining-emblem-pulse 1.8s ease-in-out infinite}#mining-mission-complete button,#surface-success .surface-miner-deploy{min-height:42px;padding:9px 18px;border:1px solid #76e4bd;border-radius:8px;background:#123d39;color:#edfff8;font-weight:700;cursor:pointer}
    @keyframes mining-complete-in{from{opacity:0;transform:translate(-50%,-46%) scale(.92);filter:blur(4px)}to{opacity:1;transform:translate(-50%,-50%) scale(1);filter:blur(0)}}@keyframes mining-emblem-pulse{50%{box-shadow:0 0 28px #67e8b655;transform:scale(1.06)}}
    body #supply-bars #star-map-toggle{z-index:306}
    #mission-navigation{display:none!important}
    #space-exploration-screen .exploration-radar-panel{display:none!important}
    body #flight-tools{display:none!important}
    body #partial-pause-dialog #flight-tools{display:block!important}
    #flight-hud-screen .planet-approach-hud{top:12px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:min(620px,calc(100vw - 32px))!important;box-sizing:border-box}
    #flight-hud-screen .hud-topbar{top:78px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:min(900px,calc(100vw - 32px))!important;justify-content:center!important}
    #expedition-approach{top:50%!important;left:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:min(360px,calc(100vw - 28px))!important;z-index:1250}
    #quick-nasa-live-btn,#topbar-nasa-live-btn,#card-nasa-live-btn,#space-nasa-live-btn,#surface-nasa-live-btn,#pause-nasa-btn,#nasa-live-modal{display:none!important;visibility:hidden!important;pointer-events:none!important}
    #partial-pause-dialog .hg-open{position:static;display:block;width:100%;min-height:42px;margin:12px 0;transform:none;padding:10px 14px;border:1px solid #64869b;border-radius:8px;background:#152e43;color:#edf7ff;font:600 13px Inter,system-ui,sans-serif;cursor:pointer}
    #solo-drone-panel{position:fixed;right:20px;bottom:20px;z-index:1200;box-sizing:border-box;width:min(340px,calc(100vw - 32px));padding:14px;border:1px solid #67c9dd;border-radius:12px;background:#071522ed;color:#e9f3f8;box-shadow:0 8px 30px #0008;font:12px/1.5 system-ui}#solo-drone-panel h2{margin:0 0 6px;font-size:15px}#solo-drone-panel label{display:grid;gap:4px;margin:9px 0}#solo-drone-panel select,#solo-drone-panel button{box-sizing:border-box;width:100%;min-height:38px;padding:7px 9px;border:1px solid #587b8c;border-radius:6px;color:#f0fbff;background:#0b2230}
    #solo-drone-panel{left:50%;right:auto;bottom:82px;transform:translateX(-50%);max-height:min(34vh,280px);overflow:auto}
    body #vertical-flight-controls{top:auto!important;right:auto!important;bottom:16px!important;left:50%!important;transform:translateX(-50%)!important;flex-direction:row!important;gap:10px!important}
    body #vertical-flight-controls button{width:58px!important;height:50px!important}
    .game-panel-minimize-toggle{position:absolute;top:5px;right:5px;z-index:20;display:grid;place-items:center;width:32px;height:32px;padding:0;border:1px solid #8bb5c477;border-radius:8px;background:#071522e8;color:#eafaff;font:700 18px/1 system-ui;cursor:pointer;pointer-events:auto}
    .game-panel-minimize-toggle:hover{background:#174158;border-color:#8bdcf1}
    [data-game-panel-minimized="true"]{width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;max-width:44px!important;max-height:44px!important;box-sizing:border-box!important;padding:5px!important;overflow:hidden!important}
    [data-game-panel-minimized="true"]>:not(.game-panel-minimize-toggle){display:none!important}
    [data-game-panel-minimized="true"]>.game-panel-minimize-toggle{top:5px;right:5px}
    .multi-team-list{display:grid;gap:5px;margin:10px 0;padding:0;list-style:none}.multi-team-list li{padding:6px 8px;border-radius:5px;background:#0d2634}.multi-manifest{padding:8px;border:1px solid #78d9bc55;border-radius:6px;color:#b7f1d7}.multi-pill{float:right;color:#8de6c3}
    @media(max-width:650px){#cooperative-mission-panel{bottom:calc(100% + 62px);width:min(280px,calc(100vw - 24px))}#multi-panel-content{max-height:48vh}.multi-lobby-surface{padding:16px}#flight-hud-screen .planet-approach-hud{top:8px!important;width:calc(100vw - 20px)!important;padding:8px 10px!important}#flight-hud-screen .hud-topbar{top:88px!important;width:calc(100vw - 20px)!important;gap:5px!important}#expedition-approach{top:50%!important;width:calc(100vw - 24px)!important}#solo-drone-panel{bottom:76px;width:min(420px,calc(100vw - 24px));max-height:32vh;padding:12px}body #vertical-flight-controls{bottom:12px!important;gap:8px!important}body #vertical-flight-controls button{width:54px!important;height:46px!important}}
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
      <section><h3>Crear partida</h3><label>Capitana al mando<select id="multi-create-character">${characterOptions(true)}</select></label>
      <button type="button" data-multi-action="create">Crear partida</button></section><hr class="multi-divider">
      <section><h3>Unirse a partida</h3><label>Tripulante<select id="multi-join-character">${characterOptions(false)}</select></label>
      <label>Codigo de partida<input id="multi-join-code" maxlength="6" autocomplete="off" placeholder="ABC123" style="text-transform:uppercase"></label>
      <button type="button" data-multi-action="join">Unirse</button></section></div>`;
    showLobbyMessage('Reune de 2 a 4 jugadores. El anfitrion define planeta y un mineral distinto por jugador.');
  }

  function characterOptions(captain) { return Object.entries(characters).filter(([id]) => captain ? id === 'sofia' : id !== 'sofia').map(([id, name]) => `<option value="${id}">${escapeHTML(name)}</option>`).join(''); }

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
      ? `<section class="multi-mission-config"><h3>Preparar proyecto cooperativo</h3><label>Proyecto<select id="multi-lobby-project">${Object.entries(projectTypes).map(([id, item]) => `<option value="${id}"${id === missionDraft.projectId ? ' selected' : ''}>${escapeHTML(item.name)}</option>`).join('')}</select></label>${projectTypes[missionDraft.projectId]?.conditions ? `<label>Condición ficticia a tratar<select id="multi-lobby-condition">${Object.entries(projectTypes[missionDraft.projectId].conditions).map(([id, name]) => `<option value="${id}"${id === missionDraft.conditionId ? ' selected' : ''}>${escapeHTML(name)}</option>`).join('')}</select></label>` : ''}<label>Planeta de la misión<select id="multi-lobby-planet">${Object.entries(planetNames).map(([id, name]) => `<option value="${id}"${id === draftKey ? ' selected' : ''}>${escapeHTML(name)}</option>`).join('')}</select></label><p>Receta: selecciona cuatro minerales distintos. Los jugadores pueden repetir despliegues; un mineral ocupado queda bloqueado hasta su depósito.</p><p class="multi-mineral-requirement" role="status">Debes seleccionar un minimo de 4 minerales para guardar la mision. Seleccionados: ${missionDraft.resourceIds.length}/4.</p><div class="multi-objective-list">${catalog.map(item => { const color = mineralColor(item.id); const checked = missionDraft.resourceIds.includes(item.id); return `<label class="multi-objective-choice" style="--mineral-color:${color}"><input class="multi-objective-checkbox" type="checkbox" value="${escapeHTML(item.id)}"${checked ? ' checked' : ''}${!checked && missionDraft.resourceIds.length >= 4 ? ' disabled' : ''}><i class="multi-mineral-dot"></i><span>${escapeHTML(item.name || item.id)}</span></label>`; }).join('') || '<small>Cargando minerales del planeta...</small>'}</div><button type="button" data-multi-action="configure"${roomState.players.length < 2 || missionDraft.resourceIds.length !== 4 ? ' disabled' : ''}>Guardar proyecto</button></section>`
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
      if (next.missionComplete) showMiningMissionComplete({ projectName: next.projectName, conditionName: next.conditionName, planetKey: next.planetKey, unlockedPlanet: next.unlockedPlanet });
      if (session && (session.planetKey !== next.planetKey || session.started !== (next.phase !== 'lobby'))) {
        session.planetKey = next.planetKey; session.started = next.phase !== 'lobby'; persist();
      }
      if ((next.travelVersion || 0) > captainTravelVersion) {
        const me = next.players.find(player => player.id === session.playerId);
        if (me?.host) captainTravelVersion = next.travelVersion;
        else if (followCaptainTravel(next)) captainTravelVersion = next.travelVersion;
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
    flightPanel.innerHTML = '<button type="button" id="multi-panel-toggle" aria-controls="multi-panel-content" aria-expanded="false"><span>Operación minera del equipo</span><span id="multi-panel-progress" class="multi-panel-progress"></span></button><div id="multi-panel-content"><p id="multi-objective"></p><div id="multi-objectives"></div><div id="multi-assignment"></div><ul id="multi-team" class="multi-team-list"></ul><div id="multi-manifest" class="multi-manifest"></div><p id="multi-flight-status" role="status"></p><button type="button" id="multi-flight-leave">Salir de la partida</button></div>';
    document.body.append(flightPanel);
    placeFlightPanel();
    if (!document.getElementById('star-map-toggle') && !multiPlacementObserver) {
      multiPlacementObserver = new MutationObserver(() => { if (placeFlightPanel()) { multiPlacementObserver.disconnect(); multiPlacementObserver = null; } });
      multiPlacementObserver.observe(document.body, { childList: true, subtree: true });
    }
    flightPanel.addEventListener('click', event => {
      if (event.target.closest('#multi-panel-toggle')) { const open = flightPanel.classList.toggle('is-open'); event.target.closest('#multi-panel-toggle').setAttribute('aria-expanded', String(open)); return; }
      if (event.target.closest('#multi-flight-leave')) { leaveRoom(); return; }
      if (event.target.closest('#multi-drone-collect')) { collectDroneResource(drones.get(session?.playerId), window.surfaceExplorer); return; }
      if (!event.target.closest('#multi-deploy')) return;
      reserveAndDeploy();
    });
    flightPanel.addEventListener('change', event => {
      if (event.target.id === 'multi-resource-select') reserveMineral();
    });
  }

  function placeFlightPanel() {
    const panel = flightPanel, map = document.getElementById('star-map-toggle'), supply = document.getElementById('supply-bars');
    if (!panel || !map || !supply) return false;
    if (map.parentElement !== supply) supply.insertBefore(map, supply.firstChild);
    if (panel.parentElement !== supply || panel.nextElementSibling !== map) supply.insertBefore(panel, map);
    return true;
  }

  function placeHangarButton() {
    const button = document.querySelector('.hg-open'), pause = document.getElementById('partial-pause-dialog'), before = document.getElementById('pause-return-menu');
    if (!button || !pause) return false;
    if (button.parentElement !== pause) pause.insertBefore(button, before || null);
    return true;
  }

  function nextPlanetAfterMining(planetKey) {
    return ({ earth: 'moon', moon: 'mars', mars: 'mercury', mercury: 'venus' })[planetKey] || null;
  }

  function unlockPlanet(planetKey) {
    if (!planetKey) return false;
    const state = window.ExpeditionSystems?.state;
    if (!state?.canLand?.(planetKey)) state?.unlock?.(planetKey);
    return true;
  }

  function showMiningMissionComplete({ projectName = 'Misión de recolección', conditionName = '', planetKey = '', unlockedPlanet = null } = {}) {
    const roomKey = session?.code || `solo:${planetKey}`;
    if (missionResultShown === roomKey) return;
    missionResultShown = roomKey;
    const nextPlanet = unlockedPlanet || nextPlanetAfterMining(planetKey);
    unlockPlanet(nextPlanet);
    let dialog = document.getElementById('mining-mission-complete');
    if (!dialog) { dialog = document.createElement('dialog'); dialog.id = 'mining-mission-complete'; document.body.append(dialog); }
    const nextName = nextPlanet ? planetNames[nextPlanet] || nextPlanet : 'Nuevos proyectos cooperativos';
    dialog.innerHTML = `<div class="mining-complete-emblem" aria-hidden="true">✓</div><h2>Misión completada</h2><p>El equipo depositó los materiales necesarios para <strong>${escapeHTML(projectName)}</strong>${conditionName ? ` y avanzar en ${escapeHTML(conditionName)}` : ''}.</p><p><strong>${nextPlanet ? `Nuevo planeta desbloqueado: ${escapeHTML(nextName)}` : `Nuevas misiones desbloqueadas: ${escapeHTML(nextName)}`}</strong></p><button type="button" data-mining-complete-close>Continuar</button>`;
    dialog.querySelector('[data-mining-complete-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); }, { once: true });
    if (!dialog.open) dialog.showModal();
    window.dispatchEvent(new CustomEvent('odyssey-mining-mission-complete', { detail: { planetKey, unlockedPlanet: nextPlanet } }));
  }

  async function deploySurfaceMiner() {
    const success = document.getElementById('surface-success');
    success?.close();
    if (session) {
      await poll();
      await syncFlightPanel();
      if (!flightPanel) return;
      flightPanel.hidden = false; flightPanel.classList.add('is-open');
      document.getElementById('multi-panel-toggle')?.setAttribute('aria-expanded', 'true');
      const me = roomState?.players.find(player => player.id === session.playerId);
      if (me?.status === 'reserved') reserveAndDeploy();
      else document.getElementById('multi-resource-select')?.focus();
      return;
    }
    await refreshSoloPanel();
    const explorer = window.surfaceExplorer;
    if (explorer?.planetKey !== soloMissionPlanet) { soloMissionPlanet = explorer?.planetKey || ''; soloManifest = Object.create(null); soloMissionComplete = false; }
    if (!drones.has('solo')) launchSoloDrone();
    soloPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function ensureSurfaceDeployButton() {
    const panel = document.getElementById('surface-success');
    if (!panel || panel.querySelector('[data-action="deploy-miner"]')) return;
    const title = panel.querySelector('h2'), copy = panel.querySelector('p');
    if (title?.textContent?.includes('Misión completada')) title.textContent = 'Aterrizaje completado';
    if (copy) copy.textContent = 'La nave principal está en tierra. Despliega el dron recolector para llevar los minerales a bordo.';
    const actions = panel.querySelector('div') || panel;
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.action = 'deploy-miner'; button.className = 'surface-miner-deploy'; button.textContent = 'Desplegar dron recolector';
    button.addEventListener('click', deploySurfaceMiner);
    actions.prepend(button);
  }

  function installInterfaceLayout() {
    if (placeHangarButton()) return;
    hangarPlacementObserver = new MutationObserver(() => { if (placeHangarButton()) { hangarPlacementObserver.disconnect(); hangarPlacementObserver = null; } });
    hangarPlacementObserver.observe(document.body, { childList: true, subtree: true });
  }

  function installPanelMinimizers() {
    const selector = '.glass-panel, .surface-toolbar, .surface-instruments, #expedition-console, #solo-drone-panel, #cooperative-mission-panel';
    const decorate = root => {
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const panels = [];
      if (root.matches?.(selector)) panels.push(root);
      panels.push(...root.querySelectorAll?.(selector) || []);
      panels.forEach(panel => {
        if (panel.matches('button, input, select, textarea, dialog') || panel.closest('dialog')) return;
        if (panel.closest('[data-game-panel]') || panel.hasAttribute('data-existing-collapse') || panel.classList.contains('collapsed')) return;
        if (panel.id === 'supply-bars' || panel.id === 'flight-math-panel' || panel.id === 'cooperative-mission-panel' && panel.querySelector('#multi-panel-toggle')) return;
        panel.setAttribute('data-game-panel', 'true');
        if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'game-panel-minimize-toggle';
        button.textContent = '−'; button.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-label', 'Minimizar panel'); button.title = 'Minimizar panel';
        button.addEventListener('click', event => {
          event.preventDefault(); event.stopPropagation();
          const minimized = panel.dataset.gamePanelMinimized !== 'true';
          panel.dataset.gamePanelMinimized = String(minimized);
          button.textContent = minimized ? '+' : '−';
          button.setAttribute('aria-expanded', String(!minimized));
          button.setAttribute('aria-label', minimized ? 'Restaurar panel' : 'Minimizar panel');
          button.title = minimized ? 'Restaurar panel' : 'Minimizar panel';
        });
        panel.append(button);
      });
    };
    decorate(document.body);
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(decorate)));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function installSurfaceDeployAction() {
    const touchdownAction = document.getElementById('touchdown-continue-btn');
    if (touchdownAction) touchdownAction.textContent = 'Desplegar dron recolector';
    ensureSurfaceDeployButton();
    const observer = new MutationObserver(records => {
      if (records.some(record => Array.from(record.addedNodes).some(node => node.id === 'surface-success' || node.querySelector?.('#surface-success')))) ensureSurfaceDeployButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function ensureSoloPanel() {
    if (soloPanel) return;
    soloPanel = document.createElement('aside'); soloPanel.id = 'solo-drone-panel'; soloPanel.hidden = true;
    soloPanel.innerHTML = '<h2>Control de dron</h2><div id="solo-drone-content"></div><p id="solo-drone-status" role="status"></p>';
    document.body.append(soloPanel);
    soloPanel.addEventListener('change', event => { if (event.target.id === 'solo-mineral-select') soloMineral = event.target.value; });
    soloPanel.addEventListener('click', event => {
      if (event.target.closest('#solo-drone-deploy')) launchSoloDrone();
      if (event.target.closest('#solo-drone-collect')) collectDroneResource(drones.get('solo'), window.surfaceExplorer);
    });
  }

  async function refreshSoloPanel() {
    ensureSoloPanel();
    const explorer = window.surfaceExplorer;
    if (session || !explorer?.isActive) { soloPanel.hidden = true; return; }
    if (soloMissionPlanet && soloMissionPlanet !== explorer.planetKey) { soloManifest = Object.create(null); soloMissionComplete = false; soloMessage = ''; missionResultShown = ''; }
    soloMissionPlanet = explorer.planetKey;
    soloPanel.hidden = false;
    try { soloCatalog = await loadMinerals(explorer.planetKey, explorer); }
    catch (error) { soloMessage = error.message; }
    const content = soloPanel.querySelector('#solo-drone-content'), status = soloPanel.querySelector('#solo-drone-status');
    const drone = drones.get('solo');
    if (drone && !drone.deposited) {
      const near = nearestDroneDeposit(drone);
      content.innerHTML = `<p>Dron con <strong>${escapeHTML(drone.resourceName)}</strong> · carga ${drone.cargo || 0}.</p><p><kbd>W/S</kbd> avanzar · <kbd>A/D</kbd> girar · <kbd>Q/E</kbd> altura · <kbd>Shift</kbd> acelerar · <kbd>Espacio</kbd> frenar · <kbd>F</kbd> recolectar</p>${near && !drone.returning ? '<button type="button" id="solo-drone-collect">Recolectar depósito</button>' : ''}${drone.returning ? '<p>Mineral a bordo. Regresando a la nave automáticamente.</p>' : ''}`;
      status.textContent = soloMessage || (near ? `Depósito cercano: ${near.name}.` : 'Pilota el dron hasta un depósito del mineral seleccionado.');
      return;
    }
    const delivered = Object.keys(soloManifest);
    const objectiveCount = Math.min(4, soloCatalog.length);
    if (soloMissionComplete) {
      content.innerHTML = `<p>Expedición minera terminada: se depositaron ${objectiveCount} minerales distintos.</p>`;
      status.textContent = 'Misión completada. El siguiente destino ya está disponible.';
      return;
    }
    const available = soloCatalog.filter(resource => !delivered.includes(resource.id));
    const signature = soloCatalog.map(resource => resource.id).join('|') + '|delivered:' + delivered.sort().join(',');
    let select = content.querySelector('#solo-mineral-select');
    if (!select || select.dataset.signature !== signature) {
      const selected = available.some(resource => resource.id === soloMineral) ? soloMineral : available[0]?.id || '';
      content.innerHTML = `<label for="solo-mineral-select">Mineral disponible en ${escapeHTML(planetNames[explorer.planetKey] || explorer.planetKey)}</label><select id="solo-mineral-select" data-signature="${escapeHTML(signature)}">${available.map(resource => `<option value="${escapeHTML(resource.id)}"${resource.id === selected ? ' selected' : ''}>${escapeHTML(resource.name || resource.id)}</option>`).join('')}</select><button type="button" id="solo-drone-deploy"${available.length ? '' : ' disabled'}>Desplegar dron recolector</button><p>Minerales distintos entregados: ${delivered.length}/${objectiveCount}</p>`;
      soloMineral = selected;
      select = content.querySelector('#solo-mineral-select');
    }
    status.textContent = soloMessage || 'La nave permanece en el planeta. Pilota el dron y vuelve para depositar.';
  }

  function launchSoloDrone() {
    const explorer = window.surfaceExplorer;
    if (!explorer?.isActive || session || soloMissionComplete || drones.get('solo') || !soloMineral) return;
    const targets = (window.ResourceDeposits?.list || []).filter(deposit => deposit.id === soloMineral);
    if (!targets.length) { soloMessage = 'No hay depósitos disponibles para ese mineral en este planeta.'; refreshSoloPanel(); return; }
    const resource = soloCatalog.find(item => item.id === soloMineral);
    const group = createDroneModel(explorer, { id: 'solo', name: 'Dron local', resourceId: soloMineral });
    if (!group) return;
    group.position.copy(explorer.shipGroup.position);
    drones.set('solo', { group, targets, collected: new Set(), cargo: 0, status: 'outbound', strategy: 'direct', local: true, userControlled: true, playerId: 'solo', resourceId: soloMineral, resourceName: resource?.name || soloMineral, keys: {}, lastSent: 0, returning: false, deposited: false });
    soloMessage = 'Dron desplegado. Pilotaje manual activado.';
    refreshSoloPanel();
  }

  function nearestDroneDeposit(drone) {
    if (!drone?.group || drone.returning) return null;
    let nearest = null, distance = 30;
    for (const deposit of drone.targets || []) {
      if (drone.collected?.has(deposit)) continue;
      const gap = Math.hypot(deposit.position.x - drone.group.position.x, deposit.position.z - drone.group.position.z);
      if (gap < distance) { distance = gap; nearest = deposit; }
    }
    drone.nearDeposit = nearest;
    return nearest;
  }

  function collectDroneResource(drone, explorer) {
    if (!drone || !explorer?.isActive || drone.returning) return;
    const deposit = nearestDroneDeposit(drone);
    if (!deposit) { if (!session) { soloMessage = 'Acércate a un depósito para recolectar.'; refreshSoloPanel(); } return; }
    drone.collected ||= new Set(); drone.collected.add(deposit);
    if (deposit.mesh) deposit.mesh.visible = false;
    drone.cargo = (drone.cargo || 0) + 1;
    drone.status = 'returning'; drone.returning = true;
    if (session) postProgress(drone, explorer, 'returning');
    else { soloMessage = `${drone.resourceName} recolectado. Regresando a la nave.`; refreshSoloPanel(); }
  }

  function installDroneKeyboard() {
    const movement = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
    const navigationKeys = new Set([...movement, 'KeyF', 'KeyM', 'KeyV']);
    const guestLocked = drone => session?.started && roomState?.players.some(player => player.id === session.playerId && !player.host) && !drone?.userControlled;
    document.addEventListener('keydown', event => {
      const explorer = window.surfaceExplorer, drone = session ? drones.get(session.playerId) : drones.get('solo');
      if (event.target?.closest?.('input,select,textarea,button,dialog')) return;
      if (guestLocked(drone) && navigationKeys.has(event.code)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      if (!explorer?.isActive || !drone?.userControlled || drone.deposited) return;
      if (movement.has(event.code)) { drone.keys[event.code] = true; event.preventDefault(); event.stopPropagation(); }
      else if (event.code === 'KeyF') { event.preventDefault(); event.stopPropagation(); if (!event.repeat) collectDroneResource(drone, explorer); }
    }, true);
    document.addEventListener('keyup', event => {
      const drone = session ? drones.get(session.playerId) : drones.get('solo');
      if (guestLocked(drone) && navigationKeys.has(event.code)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      if (!drone?.keys) return;
      if (drone.keys[event.code]) { drone.keys[event.code] = false; event.preventDefault(); event.stopPropagation(); }
    }, true);
    const altitudeControl = event => {
      const control = event.target.closest?.('#explorer-up,#explorer-down');
      if (!control) return;
      const explorer = window.surfaceExplorer, drone = session ? drones.get(session.playerId) : drones.get('solo');
      if (!explorer?.isActive || !drone?.userControlled || drone.deposited) return;
      const code = control.id === 'explorer-up' ? 'KeyQ' : 'KeyE';
      event.preventDefault(); event.stopImmediatePropagation();
      if (event.type === 'pointerdown') { drone.keys[code] = true; control.setPointerCapture?.(event.pointerId); }
      else drone.keys[code] = false;
    };
    ['pointerdown', 'pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => document.addEventListener(type, altitudeControl, true));
    const blockGuestPointer = event => {
      const drone = session ? drones.get(session.playerId) : null;
      if (!guestLocked(drone) || !event.target?.closest?.('#flight-hud-screen canvas,#exploration-canvas-container canvas,#landing-simulation-screen canvas')) return;
      event.preventDefault(); event.stopImmediatePropagation();
    };
    ['pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'].forEach(type => document.addEventListener(type, blockGuestPointer, true));
    document.addEventListener('click', event => {
      const drone = session ? drones.get(session.playerId) : null;
      const routeControl = event.target.closest?.('#star-map-toggle,#map-travel,#exploration-map-toggle,#flight-free-explore,#explore-space-btn,#surface-menu-toggle,#surface-enter');
      if (event.isTrusted && guestLocked(drone) && routeControl) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
    window.addEventListener('blur', () => { for (const drone of drones.values()) drone.keys = {}; });
  }

  function installDroneCamera(explorer) {
    const renderer = explorer?.renderer;
    if (!renderer || renderer.__droneCameraHook) return;
    const render = renderer.render.bind(renderer);
    renderer.render = function (scene, camera) {
      const drone = session ? drones.get(session.playerId) : drones.get('solo');
      if (scene === explorer.scene && drone?.userControlled && drone.group && !drone.deposited) {
        const yaw = drone.group.rotation.y;
        const target = drone.group.position.clone().add(new window.THREE.Vector3(Math.sin(yaw) * 38, 22, Math.cos(yaw) * 38));
        camera.position.copy(target);
        camera.lookAt(drone.group.position);
        renderer.__droneCameraFollowing = true;
      } else if (scene === explorer.scene && renderer.__droneCameraFollowing) {
        const ship = explorer.shipGroup.position;
        camera.position.copy(ship).add(new window.THREE.Vector3(0, 34, 58));
        camera.lookAt(ship);
        renderer.__droneCameraFollowing = false;
      }
      return render(scene, camera);
    };
    renderer.__droneCameraHook = true;
  }

  async function loadMinerals(key, explorer) {
    const planetChanged = depositsPlanet !== key;
    if (resourcesPromise && !planetChanged) return resourcesPromise;
    depositsPlanet = key;
    resourcesPromise = (async () => {
      try {
        await loadScript('js/surface/resource-deposits.js');
        window.ResourceDeposits?.install?.();
        let data = key === 'moon' ? window.MoonData?.planet : null;
        if (!data) { const response = await fetch(apiPlanet(key), { cache: 'no-store' }); if (response.ok) data = await response.json(); }
        if (!data) throw new Error('No se pudieron cargar los recursos de este planeta.');
        planetData = data;
        if (explorer && (!window.ResourceDeposits?.list?.length || planetChanged)) window.ResourceDeposits?.build(explorer, data);
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
    document.getElementById('multi-panel-progress').textContent = `${Object.values(roomState.manifest || {}).reduce((sum, count) => sum + Number(count || 0), 0)}/${roomState.objectives.length}`;
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
      const drone = drones.get(session.playerId), nearby = nearestDroneDeposit(drone);
      const returning = me.status === 'returning';
      assignment.innerHTML = `<p>Tripulas el modelo <strong>Assault Drone</strong> para recolectar <strong>${escapeHTML(me.resourceName)}</strong>.</p><p>Vuelo: <kbd>WASD</kbd> · altura: <kbd>Q/E</kbd> · recolectar: <kbd>F</kbd></p><p>${nearby ? `Depósito cercano: ${escapeHTML(nearby.name)}.` : returning ? 'Carga a bordo; retorno automático a la nave.' : 'Acércate a un depósito y pulsa F para recolectar.'}</p>${nearby && !returning ? '<button type="button" id="multi-drone-collect">Recolectar depósito</button>' : ''}`;
      const msg = { assigned: 'Preparando el dron en la nave principal.', outbound: 'Dron listo para pilotaje manual.', collecting: 'Muestra recolectada.', returning: 'Carga asegurada; regreso automático a la nave principal.', deposited: `Misión de dron completada · ${me.deposited} unidades depositadas.` };
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
    const objective = roomState?.objectives?.find(item => item.resourceId === player.resourceId);
    const color = safeColor(objective?.color || mineralColor(player.resourceId));
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), new THREE.MeshBasicMaterial({ color }));
    beacon.position.set(0, 12, 0); group.add(beacon); group.userData.beacon = beacon;
    explorer.scene.add(group);
    if (!droneModelPromise) droneModelPromise = new Promise(resolve => {
      if (!THREE.GLTFLoader) { resolve(null); return; }
      new THREE.GLTFLoader().load('assets/Assault_Drone_Concept.glb', gltf => resolve(gltf.scene), undefined, () => resolve(null));
    });
    droneModelPromise.then(source => {
      if (!source || !group.parent) return;
      const model = source.clone(true);
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model), size = bounds.getSize(new THREE.Vector3());
      const scale = 22 / Math.max(size.x, size.y, size.z, 1);
      model.scale.setScalar(scale);
      const center = bounds.getCenter(new THREE.Vector3()).multiplyScalar(scale);
      model.position.sub(center);
      model.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
      group.add(model);
      group.userData.modelLoaded = true;
    }).catch(() => {});
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
    drones.set(playerId, { group, targets, collected: new Set(), status: 'outbound', cargo: 0, strategy: player.strategy, lastSent: 0, local: true, userControlled: true, playerId, resourceId: player.resourceId, resourceName: player.resourceName, keys: {}, returning: false, deposited: false });
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
    if (!session) return;
    const now = performance.now();
    if (now - drone.lastSent < 750 && status === drone.lastPostedStatus) return;
    drone.lastSent = now; drone.lastPostedStatus = status; drone.status = status;
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
    installDroneCamera(explorer);
    if (!drone.returning) { pilotManualDrone(drone, explorer); return; }
    const base = explorer.shipGroup.position;
    if (!setDroneTarget(drone, explorer, base, 'returning', strategies[drone.strategy]?.altitude || 28)) return;
    if (Math.hypot(drone.group.position.x - base.x, drone.group.position.z - base.z) > 24) return;
    drone.deposited = true;
    if (!session) { completeSoloDelivery(drone); return; }
    request('deposit', { x: drone.group.position.x, z: drone.group.position.z, baseX: base.x, baseZ: base.z }).then(state => { roomState = state; syncFlightPanel(); }).catch(error => { drone.deposited = false; document.getElementById('multi-flight-status').textContent = error.message; });
  }

  function pilotManualDrone(drone, explorer) {
    const now = performance.now(), dt = Math.min(.05, Math.max(.001, (now - (drone.moveAt || now)) / 1000));
    drone.moveAt = now;
    const keys = drone.keys || {}, turn = Number(!!(keys.KeyD || keys.ArrowRight)) - Number(!!(keys.KeyA || keys.ArrowLeft));
    drone.group.rotation.y += turn * dt * 1.7;
    const yaw = drone.group.rotation.y, forward = Number(!!keys.KeyW) - Number(!!keys.KeyS);
    const speed = keys.Space ? 0 : keys.ShiftLeft || keys.ShiftRight ? 115 : 65;
    let x = drone.group.position.x - Math.sin(yaw) * forward * speed * dt;
    let z = drone.group.position.z - Math.cos(yaw) * forward * speed * dt;
    x = Math.max(-7000, Math.min(7000, x)); z = Math.max(-7000, Math.min(7000, z));
    const ground = window.SurfaceNavigation?.heightAt?.(x, z, explorer.planetKey) || 0;
    const oldGround = window.SurfaceNavigation?.heightAt?.(drone.group.position.x, drone.group.position.z, explorer.planetKey) || 0;
    let altitude = Math.max(16, Math.min(90, drone.group.position.y - oldGround));
    altitude += (Number(!!(keys.KeyQ || keys.ArrowUp)) - Number(!!(keys.KeyE || keys.ArrowDown))) * speed * dt;
    altitude = Math.max(16, Math.min(90, altitude));
    let y = ground + altitude;
    const activeStatuses = ['assigned', 'outbound', 'collecting', 'returning'];
    const contact = roomState?.players.find(player => player.id !== drone.playerId && player.resourceId && activeStatuses.includes(player.status) && drones.get(player.id)?.group && Math.hypot(x - drones.get(player.id).group.position.x, y - drones.get(player.id).group.position.y, z - drones.get(player.id).group.position.z) < 24);
    if (contact) {
      const otherDrone = drones.get(contact.id), other = otherDrone.group.position;
      let nx = x - other.x, nz = z - other.z, length = Math.hypot(nx, nz);
      if (length < .01) { nx = drone.playerId < contact.id ? 1 : -1; nz = 0; length = 1; }
      nx /= length; nz /= length;
      x = other.x + nx * 28; z = other.z + nz * 28;
      other.x -= nx * 8; other.z -= nz * 8;
      drone.group.rotation.z = .34; otherDrone.group.rotation.z = -.28;
    } else if (Math.abs(drone.group.rotation.z) > .01) drone.group.rotation.z *= .82;
    const correctedGround = window.SurfaceNavigation?.heightAt?.(x, z, explorer.planetKey) || 0;
    drone.group.position.set(x, Math.max(y, correctedGround + 16), z);
    drone.status = drone.cargo ? 'collecting' : 'outbound';
    postProgress(drone, explorer, drone.status);
  }

  function completeSoloDelivery(drone) {
    soloManifest[drone.resourceId] = (soloManifest[drone.resourceId] || 0) + drone.cargo;
    drone.group?.parent?.remove(drone.group);
    drones.delete('solo');
    soloMineral = '';
    soloMessage = `${drone.cargo} unidad de ${drone.resourceName} depositada en la nave. Puedes elegir otro mineral.`;
    const objectiveCount = Math.min(4, soloCatalog.length);
    if (Object.keys(soloManifest).length >= objectiveCount && objectiveCount > 0) {
      soloMissionComplete = true;
      soloMessage = 'Misión minera completada. Recursos entregados a la nave principal.';
      showMiningMissionComplete({ projectName: 'la misión de recolección mineral', planetKey: soloMissionPlanet });
    }
    refreshSoloPanel();
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

  function captainNavigationState() {
    const surface = window.surfaceExplorer, navigation = window.PlanetNavigation?.getEngine?.();
    if (surface?.isActive && surface.shipGroup?.position) return { engine: surface, scene: 'surface', position: surface.shipGroup.position, rotation: surface.shipGroup.rotation, yaw: surface.cameraYaw || 0, pitch: surface.cameraPitch || 0, speed: surface.shipSpeed || 0, progress: 1, distance: 0, planetKey: surface.planetKey || session?.planetKey };
    if (navigation?.isActive && navigation.shipGroup?.position) return { engine: navigation, scene: 'exploration', position: navigation.shipGroup.position, rotation: navigation.shipGroup.rotation, yaw: navigation.cameraYaw || 0, pitch: navigation.cameraPitch || 0, speed: navigation.shipSpeed || 0, progress: 1, distance: 0, planetKey: navigation.travelShot?.planetKey || navigation.navigationTarget || session?.planetKey };
    const flight = window.partialPause?.getEngine?.();
    if ((flight?.isActive || flight?.isTouchdownAnimation) && flight.ship?.position) return { engine: flight, scene: 'landing', position: flight.ship.position, rotation: flight.ship.shipGroup?.rotation || { x: 0, y: 0, z: 0 }, yaw: 0, pitch: 0, speed: flight.flightSpeed || 0, progress: 1 - Math.max(0, flight.canyonDistance || 0) / 3000, distance: flight.canyonDistance || 0, planetKey: flight.planetKey || session?.planetKey };
    if (flight?.isFlying && flight.ship?.position) return { engine: flight, scene: 'flight', position: flight.ship.position, rotation: flight.ship.shipGroup?.rotation || flight.ship.mesh?.rotation || { x: 0, y: 0, z: 0 }, yaw: 0, pitch: 0, speed: flight.currentSpeedKm || 0, progress: flight.progress || 0, distance: flight.currentDistanceKm || 0, planetKey: flight.activePlanetKey || session?.planetKey };
    return null;
  }

  function broadcastCaptainNavigation() {
    if (!session?.started || roomState?.phase !== 'active' || !roomState?.players.some(player => player.id === session.playerId && player.host)) return;
    const current = captainNavigationState();
    if (!current) return;
    const position = current.position, rotation = current.rotation || { x: 0, y: 0, z: 0 };
    request('navigation', { state: {
      scene: current.scene,
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x || 0, y: rotation.y || 0, z: rotation.z || 0 },
      yaw: current.yaw, pitch: current.pitch, speed: current.speed,
      progress: current.progress, distance: current.distance, planetKey: current.planetKey,
    } }).catch(() => {});
  }

  let requestedExplorationFollow = false;
  function applyCaptainNavigation() {
    const snapshot = roomState?.navigationState;
    if (!session?.started || !snapshot || roomState?.players.some(player => player.id === session.playerId && player.host)) return;
    if (Date.now() - (snapshot.updatedAt || 0) > 8000) return;
    let engine = null, localScene = '';
    if (snapshot.scene === 'surface') {
      engine = window.surfaceExplorer;
      if (!engine?.isActive) {
        const touchdown = document.getElementById('touchdown-success-modal');
        if (touchdown?.classList.contains('active')) { document.getElementById('touchdown-continue-btn')?.click(); return; }
        const state = window.ExpeditionSystems?.state, selector = document.getElementById('surface-planet');
        if (!window.surfaceExplorer?.isActive && snapshot.planetKey && state?.canLand?.(snapshot.planetKey) && selector) {
          selector.value = snapshot.planetKey;
          document.getElementById('surface-enter')?.click();
        }
        return;
      }
      localScene = 'surface';
    } else if (snapshot.scene === 'exploration') {
      engine = window.PlanetNavigation?.getEngine?.();
      if (!engine?.isActive) {
        if (!requestedExplorationFollow) { requestedExplorationFollow = true; document.getElementById('explore-space-btn')?.click(); }
        return;
      }
      requestedExplorationFollow = false; localScene = 'exploration';
    } else if (snapshot.scene === 'landing') {
      engine = window.partialPause?.getEngine?.();
      if (!(engine?.isActive || engine?.isTouchdownAnimation) || !engine.ship?.position) return;
      localScene = 'landing';
    } else {
      engine = window.partialPause?.getEngine?.();
      if (!engine?.isFlying || !engine.ship?.position) return;
      localScene = 'flight';
    }
    if (snapshot.scene !== localScene) return;
    const p = snapshot.position;
    if (engine.shipGroup?.position) engine.shipGroup.position.lerp(new window.THREE.Vector3(p.x, p.y, p.z), 0.28);
    else if (engine.ship?.position) {
      engine.ship.position.lerp(new window.THREE.Vector3(p.x, p.y, p.z), 0.28);
      engine.ship.shipGroup?.position.copy(engine.ship.position);
    }
    const r = snapshot.rotation || { x: 0, y: 0, z: 0 };
    if (engine.shipGroup?.rotation) engine.shipGroup.rotation.set(r.x, r.y, r.z);
    else engine.ship?.shipGroup?.rotation.set(r.x, r.y, r.z);
    if (snapshot.scene === 'landing') {
      engine.lateralPos = p.x;
      engine.altitude = p.y / 0.28;
      engine.canyonDistance = snapshot.distance;
      engine.flightSpeed = snapshot.speed;
      engine.hull = Math.min(engine.hull, snapshot.hull ?? engine.hull);
    }
    if ('cameraYaw' in engine) { engine.cameraYaw = snapshot.yaw; engine.cameraPitch = snapshot.pitch; }
    if ('shipSpeed' in engine) engine.shipSpeed = snapshot.speed;
    if ('progress' in engine && snapshot.scene === 'flight') engine.progress = snapshot.progress;
    if ('currentDistanceKm' in engine && snapshot.scene === 'flight') engine.currentDistanceKm = snapshot.distance;
    if (snapshot.scene === 'flight') engine.activePlanetKey = snapshot.planetKey;
    else if (snapshot.scene === 'landing') {
      const touchdown = document.getElementById('touchdown-success-modal');
      if (touchdown?.classList.contains('active')) document.getElementById('touchdown-continue-btn')?.click();
    }
    else engine.navigationTarget = snapshot.planetKey;
  }

  function animationLoop() {
    applyCaptainNavigation();
    if (session && roomState) {
      const explorer = window.surfaceExplorer;
      if (explorer?.isActive && explorer.planetKey === roomState.planetKey) syncDrones(explorer);
      else for (const [id, drone] of drones) { drone.group?.parent?.remove(drone.group); drones.delete(id); }
    } else if (!session) {
      const explorer = window.surfaceExplorer;
      if (explorer?.isActive && drones.has('solo')) updateDrone(drones.get('solo'), explorer);
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
      if (session?.started) {
        const me = roomState?.players.find(player => player.id === session.playerId);
        if (!me?.host && !followingCaptainTravel) {
          const message = 'La Capitana Sofía pilota la nave principal. Espera su llegada al planeta asignado.';
          const status = document.getElementById('multi-flight-status'); if (status) status.textContent = message;
          else window.ExplorationUpgrades?.message(message);
          return false;
        }
      }
      const initiated = original.apply(this, arguments);
      const me = roomState?.players.find(player => player.id === session?.playerId);
      if (initiated && session?.started && me?.host && !followingCaptainTravel && !captainTravelPending && !captainTravelVersion) {
        captainTravelPending = true;
        request('travel', { planetKey }).then(state => { roomState = state; captainTravelVersion = state.travelVersion || 0; syncFlightPanel(); }).catch(error => window.ExplorationUpgrades?.message(error.message)).finally(() => { captainTravelPending = false; });
      }
      return initiated;
    };
    navigation.__multiLocked = true;
  }

  function followCaptainTravel(state) {
    const navigation = window.PlanetNavigation, engine = navigation?.getEngine?.();
    if (!navigation || !engine || !state?.planetKey) return false;
    if (engine.travelShot?.planetKey === state.planetKey || engine.navigationTarget === state.planetKey) return true;
    followingCaptainTravel = true;
    let followed = false;
    try { followed = navigation.go(engine, state.planetKey) !== false; }
    finally { followingCaptainTravel = false; }
    return followed;
  }

  function bootstrap() {
    installMenuButton(); ensureLobby(); wrapNavigation(); installDroneKeyboard(); ensureSoloPanel(); installInterfaceLayout(); installPanelMinimizers();
    installSurfaceDeployAction();
    window.setInterval(() => { if (session) poll(); }, 300);
    window.setInterval(() => { if (session) syncFlightPanel(); }, 1200);
    window.setInterval(broadcastCaptainNavigation, 250);
    window.setInterval(() => { if (!session) refreshSoloPanel(); }, 800);
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
