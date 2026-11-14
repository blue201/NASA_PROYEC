/* Paso c: los valores del hangar llegan a la cabina.
   - Al iniciar la misión, el combustible inicial sale del margen de Δv del diseño.
   - Una pantalla de cabina (MFD) muestra energía, combustible, masa, Δv y presupuesto restante.
   - La batería se simula con la generación y el consumo elegidos en el hangar.
   Se carga después de flight-game.js. Zona común: cambios con revisión. */
(function () {
  const Engine = window.FlightGameEngine;
  if (!Engine || !window.MissionDesign) return;

  const SUNLIT_FRACTION = 0.4; // polo sur: el sol pasa rasante, poca generación (balance de juego)
  const GAME_MIN_PER_S = 1; // 1 s real = 1 min de misión para la batería

  const cockpit = { active: false, engine: null, start: null, batteryWh: 0, safeMode: false };
  window.MissionCockpit = cockpit;

  const original = Engine.prototype.startMission;
  Engine.prototype.startMission = function (planetKey, minDockings) {
    const result = original.apply(this, arguments);
    const launch = window.Hangar && window.Hangar.lastLaunch;
    if (launch) {
      const start = window.MissionDesign.cockpitStart(launch.totals);
      this.fuel = start.fuelPct;
      Object.assign(cockpit, { active: true, engine: this, start, totals: launch.totals, batteryWh: start.storageWh, safeMode: false });
      ensurePanel();
    }
    return result;
  };

  // Odyssey restaura el combustible guardado justo después de startMission
  // (ExpeditionSystems.state). En un despegue nuevo desde el hangar, el tanque
  // se llena según el diseño.
  document.addEventListener('hangar:launch', (ev) => {
    const exp = window.ExpeditionSystems && window.ExpeditionSystems.state;
    if (!exp) return;
    exp.fuel = window.MissionDesign.cockpitStart(ev.detail.totals).fuelPct;
    if (typeof exp.save === 'function') exp.save();
  });

  let panel = null;
  function ensurePanel() {
    if (panel) return;
    const host = document.getElementById('flight-hud-screen') || document.body;
    panel = document.createElement('section');
    panel.className = 'hg-mfd';
    panel.setAttribute('aria-label', 'Pantallas de cabina');
    host.appendChild(panel);
  }

  function row(label, value, pct, tone) {
    const p = Math.max(0, Math.min(100, pct == null ? 100 : pct));
    return '<div class="hg-mfd-row ' + (tone || '') + '"><span>' + label + '</span><b>' + value + '</b>' +
      (pct == null ? '' : '<i style="--p:' + p + '%"></i>') + '</div>';
  }

  let last = performance.now();
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (!cockpit.active || !panel) return;
    const e = cockpit.engine, s = cockpit.start, t = cockpit.totals;
    const flying = e.isFlying || e.isLaunching;
    panel.hidden = !document.getElementById('flight-hud-screen')?.classList.contains('active');
    if (flying && !window.partialPause?.isPaused) {
      const netW = s.generationW * SUNLIT_FRACTION - s.drawW;
      cockpit.batteryWh = Math.max(0, Math.min(s.storageWh, cockpit.batteryWh + (netW * dt * GAME_MIN_PER_S) / 60));
      cockpit.safeMode = cockpit.batteryWh <= 0;
    }
    const batPct = s.storageWh ? (cockpit.batteryWh / s.storageWh) * 100 : 0;
    const fuel = Math.max(0, Number(e.fuel) || 0);
    const usd = window.MissionDesign.usd;
    panel.innerHTML =
      '<header>CABINA · ' + t.structure.id + ' · ' + (t.objective ? t.objective.name : '') + '</header>' +
      row('Energía', cockpit.safeMode ? 'MODO SEGURO' : Math.round(batPct) + '% · ' + cockpit.batteryWh.toFixed(0) + ' Wh', batPct, batPct < 25 ? 'bad' : batPct < 50 ? 'warn' : '') +
      row('Gen / consumo', Math.round(s.generationW * SUNLIT_FRACTION) + ' / ' + s.drawW + ' W', null, s.generationW * SUNLIT_FRACTION < s.drawW ? 'warn' : '') +
      row('Combustible', Math.round(fuel) + '%', fuel, fuel < 25 ? 'bad' : fuel < 50 ? 'warn' : '') +
      row('Δv', t.deltaVms + ' / ' + t.requiredDeltaVms + ' m/s', null) +
      row('Masa', s.massKg + ' kg', null) +
      row('Presupuesto restante', usd(s.budgetLeftUsd), (s.budgetLeftUsd / t.budgetUsd) * 100);
  }
  requestAnimationFrame(tick);
})();
