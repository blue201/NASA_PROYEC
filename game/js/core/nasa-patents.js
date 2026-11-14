/* ==========================================================================
   NASA ODYSSEY // SISTEMA DE PATENTES TECNOLÓGICAS DE LA NASA
   Convierte las patentes de NASA TechTransfer en mejoras funcionales para la nave.
   ========================================================================== */
(()=>{
  const STORAGE_KEY = 'odyssey_nasa_patents_v1';
  const installed = new Set();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(id => {
          if (typeof id === 'string') installed.add(id);
        });
      }
    }
  } catch {}

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...installed]));
    } catch {}
    window.dispatchEvent(new CustomEvent('odyssey-patents-updated', {
      detail: { installed: [...installed] }
    }));
  }

  const NasaPatents = {
    has(patentId) {
      return installed.has(patentId);
    },
    list() {
      return [...installed];
    },
    install(patentId, cost = 40) {
      if (installed.has(patentId)) return false;
      const upgrades = window.ExplorationUpgrades;
      if (upgrades && upgrades.state) {
        if ((upgrades.state.credits || 0) < cost) return false;
        upgrades.state.credits -= cost;
        if (typeof upgrades.state.save === 'function') upgrades.state.save();
        try { localStorage.setItem('odyssey_upgrades_v1', JSON.stringify(upgrades.state)); } catch {}
      }
      installed.add(patentId);
      save();
      return true;
    },
    uninstall(patentId, refund = 40) {
      if (!installed.has(patentId)) return false;
      installed.delete(patentId);
      const upgrades = window.ExplorationUpgrades;
      if (upgrades && upgrades.state) {
        upgrades.state.credits = (upgrades.state.credits || 0) + refund;
        if (typeof upgrades.state.save === 'function') upgrades.state.save();
        try { localStorage.setItem('odyssey_upgrades_v1', JSON.stringify(upgrades.state)); } catch {}
      }
      save();
      return true;
    },
    toggle(patentId, cost = 40) {
      if (installed.has(patentId)) {
        return this.uninstall(patentId, cost);
      }
      return this.install(patentId, cost);
    }
  };

  window.NasaPatents = NasaPatents;
})();

