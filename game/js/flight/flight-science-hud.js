/* Read-only HUD: catalog discoveries and simulation telemetry remain distinct. */
(() => {
  const fields = {
    'science-class': 'planetTypeDesc', 'science-diameter': 'equatorialDiameterKm',
    'science-gravity': 'gravity', 'science-temperature': 'temperatureRange',
    'science-atmosphere': 'atmosphereComposition', 'science-pressure': 'atmospherePressure',
    'science-radiation': 'radiationLevel', 'science-moons': 'moonCount',
    'science-spectrum': 'spectralSignature'
  };
  const text = value => value === undefined || value === null || value === ''
    ? 'No disponible en el catálogo' : String(value);
  const unit = (value, suffix) => Number.isFinite(Number(value)) && value !== null && value !== ''
    ? `${value} ${suffix}` : 'No disponible';

  class FlightScienceHUD {
    constructor(getContext) {
      this.getContext = getContext;
      this.panel = document.getElementById('flight-science-panel');
      this.notice = document.getElementById('flight-context-notice');
      this.nextUpdate = 0;
      this.lastToken = '';
      this.lastPlanet = null;
      this.nodes = new Map();
      this.panel.addEventListener('toggle', () => { if (this.panel.open) this.update(true); });
      this.panel.addEventListener('focusin', () => {
        const engine = this.getContext()?.engine;
        if (!engine) return;
        [engine.keys, engine.ship?.keys].filter(Boolean).forEach(keys => {
          Object.keys(keys).forEach(key => { keys[key] = false; });
        });
        engine.isDragging = false;
      });
      ['keydown', 'keyup'].forEach(type => {
        window.addEventListener(type, event => {
          if (event.code === 'Escape' || !this.panel.contains(document.activeElement)) return;
          // Keep native details/Tab activation, without also steering the ship.
          event.stopImmediatePropagation();
        }, true);
      });
    }

    set(id, value) {
      if (!this.nodes.has(id)) this.nodes.set(id, document.getElementById(id));
      const node = this.nodes.get(id);
      const next = text(value);
      if (node.textContent !== next) node.textContent = next;
    }

    update(force = false) {
      const context = this.getContext();
      if (!context) {
        if (this.panel.contains(document.activeElement)) document.activeElement.blur();
        this.panel.hidden = true;
        this.panel.open = false;
        this.notice.hidden = true;
        this.lastPlanet = null;
        return;
      }
      const { engine, planet, data, plan, scanned, paused } = context;
      const token = `${planet}:${scanned}:${paused}:${engine.isQTEActive}`;
      const now = performance.now();
      if (!force && token === this.lastToken && now < this.nextUpdate) return;
      this.lastToken = token;
      this.nextUpdate = now + 250;
      const hidden = !!engine.isQTEActive;
      if (hidden || planet !== this.lastPlanet) {
        if (this.panel.contains(document.activeElement)) document.activeElement.blur();
        this.panel.open = false;
      }
      this.lastPlanet = planet;
      this.panel.hidden = hidden;
      this.notice.hidden = false;
      this.set('science-destination', data.name);
      this.set('science-scan-status', scanned ? 'Reconocimiento completado' : 'Pendiente de reconocimiento: despliega los drones con R.');
      Object.entries(fields).forEach(([id, key]) => {
        this.set(id, scanned ? data[key] : 'Requiere escaneo');
      });
      this.set('science-distance', `${Math.round(engine.currentDistanceKm).toLocaleString()} km`);
      this.set('science-deltav', unit(plan.dv_total, 'km/s'));
      const remaining = Math.max(0, plan.min_dockings - engine.dockingSuccessCount);
      this.set('science-dockings', remaining > 0
        ? `${remaining} pendiente(s) · ${engine.dockingSuccessCount} completado(s)`
        : `Plan de acoples cumplido · ${engine.dockingSuccessCount} completado(s)`);
      this.set('science-fuel-rate', unit(engine.mathModel.fuelBurnRate.toFixed(2), '%/s'));
      this.set('science-oxygen-rate', unit(engine.mathModel.oxygenBurnRate.toFixed(2), '%/s'));

      let message = 'Vuelo en curso. Mantén a la vista los suministros y la navegación.';
      let level = 'normal';
      if (paused) message = 'Expedición en pausa. El consumo y el avance están detenidos.';
      else if (engine.isQTEActive) message = 'Acople en curso: atiende la tecla indicada.';
      else if (engine.hull < 30) { message = 'Casco crítico. Prioriza evitar nuevas colisiones.'; level = 'warning'; }
      else if (engine.fuel < 25 || engine.oxygen < 25) { message = 'Suministros bajos. Busca el próximo acople de reabastecimiento.'; level = 'warning'; }
      else if (engine.progress >= 85) message = 'Aproximación final. Revisa las opciones disponibles de llegada.';
      if (this.notice.textContent !== message) this.notice.textContent = message;
      this.notice.dataset.level = level;
    }
  }
  window.FlightScienceHUD = FlightScienceHUD;
})();
