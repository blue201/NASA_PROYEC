/* Pantalla del hangar de diseño. Usa window.MissionDesign (mission-design.js).
   Expone window.Hangar = { open(options), close(), ready, catalog, design, totals() }.
   Zona común: cambios con revisión. */
(function () {
  const MD = window.MissionDesign;
  const CATALOG_URL = 'js/design/catalog.json';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const state = { catalog: null, design: MD.load(window.localStorage), opts: null, root: null };

  const ready = fetch(CATALOG_URL)
    .then((r) => r.json())
    .then((c) => { state.catalog = c; return c; })
    .catch((e) => { console.error('Hangar: no se pudo leer el catálogo', e); });

  function meter(label, value, max, unit, fmt) {
    fmt = fmt || ((v) => v.toFixed(1));
    const pct = Math.min(100, (value / Math.max(max, 1e-9)) * 100);
    const over = value > max;
    return '<div class="hg-meter' + (over ? ' over' : '') + '"><div class="hg-meter-label"><span>' + label + '</span><span>' +
      fmt(value) + ' / ' + fmt(max) + (unit ? ' ' + unit : '') + '</span></div><div class="hg-track"><div class="hg-fill" style="width:' + pct + '%"></div></div></div>';
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

  function render() {
    const c = state.catalog, d = state.design, t = MD.totals(c, d);
    const lv = (o) => o.blurb + ' Hasta ' + o.maxVolumeU + 'U y ' + o.maxMassKg + ' kg · ' + MD.usd(o.costUsd);
    const orb = (o) => o.blurb + ' Necesita ' + o.requiredDeltaVms + ' m/s · contacto ' + o.contactMin + ' min por pase';
    const st = (o) => 'hasta ' + o.maxMassKg + ' kg · ' + o.volumeU + ' U · ' + MD.usd(o.costUsd);
    const subs = MD.SUBSYSTEMS.map((k, i) => group(i + 5, c.subsystems[k].label, k, c.subsystems[k].options, (o) => stats(o, t.objective, k))).join('');
    state.root.innerHTML =
      '<div class="hg-panel" role="dialog" aria-modal="true" aria-labelledby="hg-title">' +
      '<header class="hg-head"><div><p class="hg-eyebrow">HANGAR DE DISEÑO · ANTES DEL DESPEGUE</p><h1 id="hg-title">Diseña tu misión lunar</h1>' +
      '<p class="hg-sub">Cada decisión cambia la masa, la energía y el presupuesto. No hay una única respuesta correcta.</p></div>' +
      '<button type="button" class="hg-close" data-hg="close" aria-label="Cerrar hangar">✕</button></header>' +
      '<div class="hg-body"><div class="hg-choices">' +
      group(1, 'Objetivo de la misión', 'objective', c.objectives, (o) => o.blurb) +
      group(2, 'Lanzador', 'launcher', c.launchers, lv) +
      group(3, 'Órbita lunar', 'orbit', c.orbits, orb) +
      group(4, 'Estructura', 'structure', c.structures, st) + subs +
      '</div><aside class="hg-summary"><h2>Tu nave ' + esc(t.structure.id) + '</h2>' +
      meter('Masa', t.massKg, t.structure.maxMassKg, 'kg') +
      meter('Volumen', t.volumeU, t.structure.volumeU, 'U') +
      meter('Presupuesto', t.costUsd, t.budgetUsd, '', MD.usd) +
      meter('Energía: consumo vs generación', t.drawW, Math.max(t.generationW, 1), 'W', (v) => v.toFixed(0)) +
      '<p class="hg-hint">Δv: ' + t.deltaVms + ' m/s' + (t.requiredDeltaVms ? ' (tu órbita necesita ' + t.requiredDeltaVms + ')' : '') + '</p>' +
      t.warnings.map((w) => '<p class="hg-warn">' + esc(w) + '</p>').join('') +
      (t.ok ? '<p class="hg-ok">Diseño válido. Lista para despegar.</p>' : '<ul class="hg-problems">' + t.problems.map((p) => '<li>' + esc(p) + '</li>').join('') + '</ul>') +
      '<button type="button" class="hg-launch" data-hg="launch"' + (t.ok ? '' : ' disabled') + '>' +
      (state.opts && state.opts.onLaunch ? 'Despegar' : 'Guardar diseño') + '</button>' +
      '<p class="hg-source">Masas y tamaños: CubeSat 101 (NASA CSLI). Costos y potencias: balance de juego.</p>' +
      '</aside></div></div>';
  }

  function onChange(e) {
    if (e.target.type !== 'radio') return;
    state.design[e.target.name] = e.target.value;
    MD.save(window.localStorage, state.design);
    const scroll = state.root.querySelector('.hg-choices').scrollTop;
    render();
    state.root.querySelector('.hg-choices').scrollTop = scroll;
  }

  function onClick(e) {
    const action = e.target.closest('[data-hg]') && e.target.closest('[data-hg]').dataset.hg;
    if (action === 'close') close(false);
    if (action === 'launch') {
      const t = MD.totals(state.catalog, state.design);
      if (!t.ok) return;
      close(true);
    }
  }

  function onKey(e) {
    e.stopPropagation(); // que las teclas no muevan la nave mientras se diseña
    if (e.key === 'Escape') close(false);
  }

  function close(launched) {
    if (!state.root) return;
    state.root.remove();
    state.root = null;
    const opts = state.opts;
    state.opts = null;
    if (launched && opts && opts.onLaunch) opts.onLaunch(MD.totals(state.catalog, state.design));
    if (!launched && opts && opts.onCancel) opts.onCancel();
  }

  async function open(opts) {
    await ready;
    if (!state.catalog) return;
    if (state.root) close(false);
    state.opts = opts || null;
    state.root = document.createElement('div');
    state.root.className = 'hg-overlay';
    state.root.addEventListener('change', onChange);
    state.root.addEventListener('click', onClick);
    state.root.addEventListener('keydown', onKey);
    state.root.addEventListener('keyup', (e) => e.stopPropagation());
    document.body.appendChild(state.root);
    render();
    state.root.querySelector('input,button').focus();
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
          window.Hangar.lastLaunch = { totals: t, design: Object.assign({}, state.design), at: Date.now() };
          document.dispatchEvent(new CustomEvent('hangar:launch', { detail: window.Hangar.lastLaunch }));
          bypass = true;
          btn.disabled = false;
          btn.click();
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
    totals: () => (state.catalog ? MD.totals(state.catalog, state.design) : null),
  };
})();
