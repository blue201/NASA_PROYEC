/* Pantalla del hangar de diseño. Usa window.MissionDesign (mission-design.js).
   Expone window.Hangar = { open(options), close(), ready, catalog, design, totals() }.
   Zona común: cambios con revisión. */
(function () {
  const MD = window.MissionDesign;
  const CATALOG_URL = 'js/design/catalog.json';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const DRONE_WEIGHTS = [
    { id: 'light', name: 'Ligero', massKg: 1.2, volumeU: 0.7, costUsd: 150000, score: 100 },
    { id: 'balanced', name: 'Equilibrado', massKg: 2.2, volumeU: 1.1, costUsd: 260000, score: 82 },
    { id: 'heavy', name: 'Pesado', massKg: 3.6, volumeU: 1.6, costUsd: 390000, score: 62 },
  ];
  const DRONE_RESISTANCE = [
    { id: 'coating', name: 'Recubrimiento térmico', massKg: 0.4, volumeU: 0.2, costUsd: 100000, score: 62 },
    { id: 'composite', name: 'Blindaje compuesto', massKg: 0.8, volumeU: 0.4, costUsd: 250000, score: 80 },
    { id: 'reinforced', name: 'Aleación reforzada', massKg: 1.4, volumeU: 0.6, costUsd: 550000, score: 95 },
  ];

  let storage;
  try { storage = window.localStorage; } catch (e) { /* El diseño funciona sin almacenamiento. */ }
  const state = { catalog: null, design: MD.load(storage), opts: null, root: null, previouslyFocused: null };

  let catalogRequest;
  function loadCatalog() {
    if (state.catalog) return Promise.resolve(state.catalog);
    if (catalogRequest) return catalogRequest;
    catalogRequest = fetch(CATALOG_URL)
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then((c) => { state.catalog = c; return c; })
    .catch((e) => { console.error('Hangar: no se pudo leer el catálogo', e); })
    .finally(() => { catalogRequest = null; });
    return catalogRequest;
  }
  const ready = loadCatalog();

  function verification(label, ok, detail) {
    return '<li class="hg-verification ' + (ok ? 'is-ready' : 'needs-review') + '"><span class="hg-verification-state">' +
      (ok ? 'Verificado' : 'Revisar') + '</span><strong>' + label + '</strong><small>' + esc(detail) + '</small></li>';
  }

  function stats(o, obj, key) {
    const b = [];
    if (o.generationW) b.push(o.generationW + ' W');
    if (o.storageWh) b.push(o.storageWh + ' Wh');
    if (o.downlinkKbps) b.push(o.downlinkKbps + ' kbps');
    if (o.dataMbPerPass) b.push(o.dataMbPerPass + ' MB/pase');
    if (o.deltaVms) b.push(o.deltaVms + ' m/s Δv');
    if (o.drawW) b.push('consume ' + o.drawW + ' W');
    b.push(o.massKg + ' kg', o.volumeU + ' U', MD.usd(o.costUsd));
    if (key === 'instrument' && obj) b.push('valor para tu objetivo ×' + obj.value[o.id]);
    return b.join(' · ');
  }

  function group(step, title, name, list, describe) {
    const d = state.design;
    return '<fieldset class="hg-group"><legend><span class="hg-step">' + step + '</span>' + title + '</legend>' +
      list.map((o) =>
        '<label class="hg-choice' + (d[name] === o.id ? ' on' : '') + '"><input type="radio" name="' + name + '" value="' + esc(o.id) + '"' +
        (d[name] === o.id ? ' checked' : '') + '><strong>' + esc(o.name) + '</strong><small>' + esc(describe(o)) + '</small></label>'
      ).join('') + '</fieldset>';
  }

  function ensureDefaults(catalog) {
    Object.assign(state.design, {
      objective: 'ice', launcher: 'dedicated', orbit: 'elliptic-polar', structure: '12U',
      comms: 'uhf', instrument: 'ir', propulsion: 'cold-gas',
    });
    if (!catalog.subsystems.power.options.some((option) => option.id === state.design.power)) state.design.power = catalog.subsystems.power.options[0].id;
    if (!DRONE_WEIGHTS.some((option) => option.id === state.design.droneWeight)) state.design.droneWeight = 'balanced';
    if (!DRONE_RESISTANCE.some((option) => option.id === state.design.resistance)) state.design.resistance = 'composite';
    MD.save(storage, state.design);
  }

  function designTotals(catalog, design) {
    const t = MD.totals(catalog, design);
    const weight = DRONE_WEIGHTS.find((option) => option.id === design.droneWeight) || DRONE_WEIGHTS[1];
    const resistance = DRONE_RESISTANCE.find((option) => option.id === design.resistance) || DRONE_RESISTANCE[1];
    t.droneWeight = weight;
    t.droneResistance = resistance;
    t.massKg += weight.massKg + resistance.massKg;
    t.volumeU += weight.volumeU + resistance.volumeU;
    t.costUsd += weight.costUsd + resistance.costUsd;
    t.problems = t.problems.filter((problem) => !/^(Sobrepeso:|No cabe:|El .* solo acepta naves de hasta|El lanzador solo lleva|Presupuesto excedido)/.test(problem));
    if (t.massKg > t.structure.maxMassKg && !t.problems.some((problem) => problem.startsWith('Sobrepeso:'))) t.problems.push('Sobrepeso: ' + t.massKg.toFixed(1) + ' kg de ' + t.structure.maxMassKg + ' kg permitidos en un ' + t.structure.id + '.');
    if (t.volumeU > t.structure.volumeU && !t.problems.some((problem) => problem.startsWith('No cabe:'))) t.problems.push('No cabe: ' + t.volumeU.toFixed(1) + ' U de ' + t.structure.volumeU + ' U disponibles.');
    if (t.launcher && t.structure.volumeU > t.launcher.maxVolumeU) t.problems.push('El ' + t.launcher.name.toLowerCase() + ' solo acepta naves de hasta ' + t.launcher.maxVolumeU + 'U.');
    if (t.launcher && t.volumeU > t.launcher.maxVolumeU) t.problems.push('La carga ocupa ' + t.volumeU.toFixed(1) + ' U y el lanzador admite ' + t.launcher.maxVolumeU + ' U.');
    if (t.launcher && t.massKg > t.launcher.maxMassKg && !t.problems.some((problem) => problem.startsWith('El lanzador solo lleva'))) t.problems.push('El lanzador solo lleva ' + t.launcher.maxMassKg + ' kg.');
    if (t.costUsd > t.budgetUsd && !t.problems.some((problem) => problem.startsWith('Presupuesto excedido'))) t.problems.push('Presupuesto excedido por ' + MD.usd(t.costUsd - t.budgetUsd) + '.');
    t.droneEnergyScore = Math.max(0, Math.min(100, Math.round((t.generationW / Math.max(t.drawW, 1)) * 100)));
    t.droneWeightScore = weight.score;
    t.droneDurabilityPct = Math.max(1, Math.min(100, Math.round(resistance.score * 0.55 + t.droneEnergyScore * 0.25 + weight.score * 0.20)));
    t.ok = t.problems.length === 0;
    return t;
  }

  function render() {
    const focused = state.root.contains(document.activeElement) ? document.activeElement : null;
    const focusedName = focused && focused.name;
    const focusedValue = focused && focused.value;
    const scrollPositions = ['.hg-body', '.hg-choices', '.hg-summary'].map((selector) => {
      const element = state.root.querySelector(selector);
      return [selector, element ? element.scrollTop : 0];
    });
    const c = state.catalog, d = state.design, t = designTotals(c, d);
    const structureProblems = t.problems.filter((p) => /Sobrepeso|No cabe|solo acepta naves|El lanzador solo lleva|La carga ocupa|Falta elegir (el lanzador|una estructura)/i.test(p));
    const energyProblems = t.problems.filter((p) => /La propulsión da|Falta elegir (la propulsión|energía)/i.test(p));
    const energyWarning = t.warnings.length > 0;
    const checks = '<section class="hg-checks" aria-label="Verificaciones previas al despliegue"><h3>Verificaciones del dron</h3><ul>' +
      verification('Energía', energyProblems.length === 0 && !energyWarning, energyProblems[0] || t.warnings[0] || (t.generationW + ' W generados · ' + t.drawW + ' W consumidos · aporte ' + t.droneEnergyScore + '/100')) +
      verification('Peso', structureProblems.length === 0, structureProblems[0] || ('Dron ' + t.droneWeight.massKg.toFixed(1) + ' kg · carga total ' + t.massKg.toFixed(1) + ' kg · ' + t.volumeU.toFixed(1) + ' U')) +
      verification('Resistencia', true, t.droneResistance.name + ' · ' + t.droneResistance.score + '/100 · durabilidad base ' + t.droneDurabilityPct + '%') +
      '</ul></section>';
    state.root.innerHTML =
      '<div class="hg-panel">' +
      '<header class="hg-head"><div><p class="hg-eyebrow">HANGAR DE DISEÑO · ANTES DEL DESPEGUE</p><h1 id="hg-title">Diseña tu misión lunar</h1>' +
      '<p class="hg-sub">Cada decisión cambia la masa, la energía y el presupuesto. No hay una única respuesta correcta.</p></div>' +
      '<button type="button" class="hg-close" data-hg="close" aria-label="Cerrar hangar">✕</button></header>' +
      '<div class="hg-body"><div class="hg-choices">' +
      group(1, 'Energía', 'power', c.subsystems.power.options, (o) => stats(o, t.objective, 'power')) +
      group(2, 'Peso del dron', 'droneWeight', DRONE_WEIGHTS, (o) => o.massKg.toFixed(1) + ' kg · ' + o.volumeU.toFixed(1) + ' U · ' + MD.usd(o.costUsd)) +
      group(3, 'Resistencia del dron', 'resistance', DRONE_RESISTANCE, (o) => o.score + '/100 · ' + o.massKg.toFixed(1) + ' kg · ' + MD.usd(o.costUsd)) +
      '</div><aside class="hg-summary"><h2>Configuración del dron</h2>' +
      checks +
      '<p class="hg-hint">Durabilidad = 55% resistencia + 25% energía + 20% peso. Presupuesto: ' + MD.usd(t.costUsd) + ' / ' + MD.usd(t.budgetUsd) + '.</p>' +
      (t.ok ? '<p class="hg-ok">Diseño válido. Lista para despegar.</p>' : '<ul class="hg-problems">' + t.problems.map((p) => '<li>' + esc(p) + '</li>').join('') + '</ul>') +
      '<button type="button" class="hg-launch" data-hg="launch"' + (t.ok ? '' : ' disabled') + '>' +
      (state.opts && state.opts.onLaunch ? 'Despegar' : 'Guardar diseño') + '</button>' +
      '<p class="hg-source">La durabilidad, resistencia, masas y costos del dron son valores de balance de juego. Límites de la plataforma: CubeSat 101 (NASA CSLI).</p>' +
      moonCard() +
      '</aside></div></div>';
    if (focusedName) {
      const replacement = Array.from(state.root.querySelectorAll('input')).find((input) =>
        input.name === focusedName && input.value === focusedValue);
      if (replacement) replacement.focus({ preventScroll: true });
    }
    scrollPositions.forEach(([selector, scrollTop]) => {
      state.root.querySelector(selector).scrollTop = scrollTop;
    });
  }

  // Ficha del destino con datos reales (window.MoonData, paso d). Cada dato enlaza a su fuente.
  function moonCard() {
    const m = window.MoonData;
    if (!m || !m.planet) return '<section class="hg-moon"><h3>Destino: Luna</h3><p class="hg-hint">Cargando datos…</p></section>';
    const p = m.planet, ph = p.physical || {};
    const link = (v, text) => (v && v.source_url ? '<a href="' + esc(v.source_url) + '" target="_blank" rel="noopener">' + text + '</a>' : text);
    const val = (v) => (v && v.value != null ? esc(v.value) + ' ' + esc(v.unit) : '—');
    const ice = (p.resources || []).find((r) => r.id === 'water-ice');
    const img = (m.images || []).find((i) => /south pol/i.test(i.title || '')) || (m.images || [])[0];
    return '<section class="hg-moon"><h3>Destino: Luna · polo sur</h3>' +
      (img && img.thumb ? '<a class="hg-moon-img" href="' + esc(img.source_url) + '" target="_blank" rel="noopener"><img src="' + esc(img.thumb) + '" alt="' + esc(img.title) + '" loading="lazy"><small>' + esc(img.title) + ' · ' + esc(img.nasa_id) + '</small></a>' : '') +
      '<dl>' +
      '<div><dt>Gravedad</dt><dd>' + link(ph.gravity, val(ph.gravity)) + '</dd></div>' +
      '<div><dt>Cráteres en sombra</dt><dd>' + link(ph.temperature_polar_crater, val(ph.temperature_polar_crater)) + '</dd></div>' +
      (ice ? '<div><dt>Hielo de agua</dt><dd>' + link(ice.abundance, val(ice.abundance)) + '</dd></div>' : '') +
      (m.distance ? '<div><dt>Distancia hoy</dt><dd><a href="' + esc(m.distance.source_url) + '" target="_blank" rel="noopener">' + Math.round(m.distance.km).toLocaleString('es') + ' km</a></dd></div>' : '') +
      '</dl>' +
      '<p class="hg-hint">Peligros: ' + (p.hazards || []).map((h) => esc(h.name)).join(', ') + '.</p>' +
      '<p class="hg-source">' + (m.source === 'api' ? 'Datos en vivo de la API del equipo' : 'Datos guardados (API sin conexión)') +
      ' · NASA NSSDC, NASA Science, LCROSS, JPL Horizons, NASA Image and Video Library.</p></section>';
  }

  // Si los datos llegan con el hangar abierto, se redibuja la ficha.
  document.addEventListener('moondata:ready', () => {
    const card = state.root && state.root.querySelector('.hg-moon');
    if (card) card.outerHTML = moonCard();
  });

  function onChange(e) {
    if (e.target.type !== 'radio') return;
    state.design[e.target.name] = e.target.value;
    MD.save(storage, state.design);
    render();
  }

  function onClick(e) {
    const action = e.target.closest('[data-hg]') && e.target.closest('[data-hg]').dataset.hg;
    if (action === 'close') close(false);
    if (action === 'retry') loadAndRender(state.root);
    if (action === 'launch') {
      const t = designTotals(state.catalog, state.design);
      if (!t.ok) return;
      close(true);
    }
  }

  function onKey(e) {
    e.stopPropagation(); // que las teclas no muevan la nave mientras se diseña
  }

  function close(launched) {
    if (!state.root) return;
    state.root.close();
    state.root.remove();
    state.root = null;
    const opts = state.opts;
    state.opts = null;
    if (state.previouslyFocused && state.previouslyFocused.isConnected) state.previouslyFocused.focus();
    state.previouslyFocused = null;
    if (launched && opts && opts.onLaunch) opts.onLaunch(designTotals(state.catalog, state.design));
    if (!launched && opts && opts.onCancel) opts.onCancel();
  }

  async function loadAndRender(root) {
    root.innerHTML = '<div class="hg-panel"><header class="hg-head"><h1 id="hg-title">Cargando hangar…</h1>' +
      '<button type="button" class="hg-close" data-hg="close">Cerrar</button></header></div>';
    root.querySelector('button').focus();
    await loadCatalog();
    if (state.root !== root) return;
    if (state.catalog) { ensureDefaults(state.catalog); render(); }
    else root.innerHTML = '<div class="hg-panel"><header class="hg-head"><h1 id="hg-title">No se pudo cargar el hangar</h1>' +
      '<button type="button" class="hg-close" data-hg="close">Cerrar</button></header>' +
      '<p class="hg-hint" role="alert">Comprueba la conexión y vuelve a intentarlo.</p>' +
      '<button type="button" class="hg-launch" data-hg="retry">Reintentar</button></div>';
    root.querySelector('input,button').focus();
  }

  async function open(opts) {
    if (state.root) {
      state.root.querySelector('input:checked,button').focus();
      return;
    }
    state.opts = opts || null;
    state.previouslyFocused = document.activeElement;
    state.root = document.createElement('dialog');
    state.root.className = 'hg-overlay';
    state.root.setAttribute('aria-labelledby', 'hg-title');
    state.root.addEventListener('cancel', (e) => { e.preventDefault(); close(false); });
    state.root.addEventListener('change', onChange);
    state.root.addEventListener('click', onClick);
    state.root.addEventListener('keydown', onKey);
    state.root.addEventListener('keyup', (e) => e.stopPropagation());
    document.body.appendChild(state.root);
    state.root.showModal();
    await loadAndRender(state.root);
  }

  // Botón fijo para abrir el hangar en cualquier momento.
  function addButton() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hg-open';
    b.textContent = '🛠 Hangar';
    b.title = 'Abrir el hangar de diseño';
    b.addEventListener('click', () => open());
    document.body.appendChild(b);
  }
  // Paso b: todo despegue nuevo pasa por el hangar. El botón "Lanzar misión" de Odyssey
  // dispara #execute-flight-plan-btn; lo interceptamos en fase de captura, antes que main.js.
  // Reintentos, rescates y partidas guardadas no pasan por aquí (ya despegaron con un diseño).
  let bypass = false;
  function installLaunchGate() {
    const btn = document.getElementById('execute-flight-plan-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      if (bypass) { bypass = false; return; }
      e.preventDefault();
      e.stopImmediatePropagation();
      open({
        onLaunch: (t) => {
          window.Hangar.lastLaunch = { totals: t, design: Object.assign({}, state.design), droneDurabilityPct: t.droneDurabilityPct, at: Date.now() };
          document.dispatchEvent(new CustomEvent('hangar:launch', { detail: window.Hangar.lastLaunch }));
          bypass = true;
          try { btn.click(); } finally { bypass = false; }
        },
      });
    }, true);
  }

  function init() { addButton(); installLaunchGate(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.Hangar = {
    open, close: () => close(false), ready, lastLaunch: null,
    get catalog() { return state.catalog; },
    get design() { return state.design; },
    totals: () => (state.catalog ? designTotals(state.catalog, state.design) : null),
  };
})();
