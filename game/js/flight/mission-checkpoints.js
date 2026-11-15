/* Alternating records preserve the previous checkpoint if a write or record fails. */
(() => {
  const keys = ['odyssey_checkpoint_v1_a', 'odyssey_checkpoint_v1_b'];
  const finite = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
  const vector = (value, limit) => Array.isArray(value) && value.length === 3
    && value.every(n => finite(n, -limit, limit));
  const cameras = ['chase', 'top', 'bottom', 'cockpit', 'far'];

  class MissionCheckpointStore {
    constructor(planetKeys, notify = () => {}) {
      this.planets = new Set(planetKeys);
      this.notify = notify;
      this.memory = null;
      this.activeKey = null;
      this.warned = false;
      this.loaded = false;
    }

    valid(record) {
      if (!record || record.version !== 1 || !Number.isSafeInteger(record.sequence)
        || record.sequence < 1 || !finite(record.savedAt, 0, Number.MAX_SAFE_INTEGER)) return false;
      const state = record.state;
      if (!state || !['menu', 'flight', 'landing', 'exploration', 'surface'].includes(state.phase)
        || !this.planets.has(state.planet) || !Array.isArray(state.scanned)
        || state.scanned.length > this.planets.size || !state.scanned.every(id => this.planets.has(id))) return false;
      if (state.phase === 'flight') {
        const f = state.flight;
        return !!f && finite(f.hull, Number.MIN_VALUE, 100)
          && finite(f.fuel, Number.MIN_VALUE, 100) && finite(f.oxygen, Number.MIN_VALUE, 100)
          && finite(f.progress, 0, 99.999999) && Number.isSafeInteger(f.dockings)
          && finite(f.dockings, 0, 100000) && cameras.includes(f.camera)
          && vector(f.position, 1000) && vector(f.velocity, 10000)
          && finite(f.speed, 0, 10000);
      }
      if (state.phase === 'landing') return finite(state.hull, Number.MIN_VALUE, 100);
      if (state.phase === 'surface') {
        const surface = state.surface;
        return !!surface && ['earth', 'moon', 'mars', 'venus', 'mercury', 'uranus', 'saturn', 'jupiter', 'neptune'].includes(state.planet)
          && vector(surface.position, 20000)
          && finite(surface.yaw, -1e9, 1e9) && finite(surface.pitch, -1, 1)
          && ['chase', 'cockpit', 'far'].includes(surface.camera)
          && typeof surface.landed === 'boolean' && typeof surface.ancient === 'boolean'
          && (!surface.ancient || state.planet === 'earth')
          && finite(state.hull, Number.MIN_VALUE, 100);
      }
      if (state.phase === 'exploration') {
        const e = state.exploration;
        return !!e && vector(e.position, 1e12) && finite(e.yaw, -1e9, 1e9)
          && finite(e.pitch, -1e9, 1e9) && finite(e.speed, 0, 1e9);
      }
      return true;
    }

    read() {
      this.loaded = true;
      let best = this.memory;
      let damaged = false;
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const record = JSON.parse(raw);
          if (!this.valid(record)) { damaged = true; continue; }
          if (!best || record.sequence > best.sequence) {
            best = record;
            this.activeKey = key;
          }
        } catch (error) {
          damaged = true;
        }
      }
      this.memory = best;
      if (damaged && !this.warned) {
        this.warned = true;
        this.notify(best ? 'Se usará la última copia válida del progreso.'
          : 'No hay un guardado legible. Puedes iniciar una nueva expedición.');
      }
      return best ? JSON.parse(JSON.stringify(best.state)) : null;
    }

    save(state) {
      // Discover the last sequence and active copy even when a caller saves first.
      if (!this.loaded) this.read();
      // Refuse invalid input before touching either saved record.
      const record = { version: 1, sequence: (this.memory?.sequence || 0) + 1,
        savedAt: Date.now(), state };
      if (!this.valid(record)) return false;
      let raw;
      try { raw = JSON.stringify(record); }
      catch (error) { return false; }
      // Serialization can change values through toJSON; validate the stored form.
      const snapshot = JSON.parse(raw);
      if (!this.valid(snapshot)) return false;
      const key = this.activeKey === keys[0] ? keys[1] : keys[0];
      this.memory = snapshot;
      try {
        localStorage.setItem(key, raw);
        if (localStorage.getItem(key) !== raw) throw new Error('Checkpoint verification failed');
        this.activeKey = key;
        return true;
      } catch (error) {
        if (!this.warned) {
          this.warned = true;
          this.notify('El navegador no pudo guardar en disco. La recuperación sigue disponible durante esta sesión.');
        }
        return false;
      }
    }
  }

  window.MissionCheckpointStore = MissionCheckpointStore;
})();
