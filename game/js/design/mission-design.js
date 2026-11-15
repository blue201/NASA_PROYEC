/* Lógica del hangar de diseño (portada de web/src/state.js).
   Sin DOM: se puede probar en Node. Expone window.MissionDesign (navegador)
   o module.exports (Node). Zona común: cambios con revisión. */
(function (root) {
  // Aviónica fija (computadora + control de actitud) que toda nave lleva.
  const AVIONICS = { name: 'Aviónica y control de actitud', massKg: 0.8, volumeU: 1, costUsd: 300000, drawW: 8 };
  const SUBSYSTEMS = ['power', 'comms', 'instrument', 'propulsion'];
  const STORAGE_KEY = 'trhn_mission_design_v1';

  const byId = (list, id) => (list || []).find((x) => x.id === id) || null;
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

  function emptyDesign() {
    return { objective: null, launcher: null, orbit: null, structure: '6U', power: null, comms: null, instrument: null, propulsion: null };
  }

  function pick(catalog, subsystem, id) {
    return byId(catalog.subsystems[subsystem] && catalog.subsystems[subsystem].options, id);
  }

  // Calcula totales y la lista de problemas que impiden despegar.
  function totals(catalog, design) {
    const s = byId(catalog.structures, design.structure) || catalog.structures[0];
    const lv = byId(catalog.launchers, design.launcher);
    const orb = byId(catalog.orbits, design.orbit);
    const obj = byId(catalog.objectives, design.objective);
    const parts = SUBSYSTEMS.map((k) => pick(catalog, k, design[k])).filter(Boolean);
    const all = [AVIONICS].concat(parts);
    const sum = (key) => all.reduce((a, p) => a + (p[key] || 0), 0);
    const power = pick(catalog, 'power', design.power);
    const prop = pick(catalog, 'propulsion', design.propulsion);
    const instrument = pick(catalog, 'instrument', design.instrument);
    const t = {
      structure: s, launcher: lv, orbit: orb, objective: obj,
      massKg: s.massKg + sum('massKg'),
      volumeU: sum('volumeU'),
      costUsd: s.costUsd + sum('costUsd') + (lv ? lv.costUsd : 0),
      budgetUsd: catalog.startingBudget,
      drawW: sum('drawW'),
      generationW: power ? power.generationW : 0,
      storageWh: power ? power.storageWh : 0,
      deltaVms: prop ? prop.deltaVms : 0,
      requiredDeltaVms: orb ? orb.requiredDeltaVms : 0,
      scienceFit: obj && instrument ? obj.value[instrument.id] : 0,
    };
    t.problems = [
      !obj && 'Falta elegir el objetivo de la misión.',
      !lv && 'Falta elegir el lanzador.',
      !orb && 'Falta elegir la órbita.',
      !byId(catalog.structures, design.structure) && 'Falta elegir una estructura válida.',
    ]
      .concat(SUBSYSTEMS.filter((k) => !pick(catalog, k, design[k])).map((k) => 'Falta elegir ' + catalog.subsystems[k].label.toLowerCase() + '.'))
      .concat([
        t.massKg > s.maxMassKg && 'Sobrepeso: ' + t.massKg.toFixed(1) + ' kg de ' + s.maxMassKg + ' kg permitidos en un ' + s.id + '.',
        t.volumeU > s.volumeU && 'No cabe: ' + t.volumeU + ' U de ' + s.volumeU + ' U disponibles.',
        lv && s.volumeU > lv.maxVolumeU && 'El ' + lv.name.toLowerCase() + ' solo acepta naves de hasta ' + lv.maxVolumeU + 'U.',
        lv && t.massKg > lv.maxMassKg && 'El lanzador solo lleva ' + lv.maxMassKg + ' kg.',
        t.costUsd > t.budgetUsd && 'Presupuesto excedido por ' + usd(t.costUsd - t.budgetUsd) + '.',
        prop && orb && t.deltaVms < orb.requiredDeltaVms &&
          'La propulsión da ' + t.deltaVms + ' m/s y entrar en la ' + orb.name.toLowerCase() + ' necesita ' + orb.requiredDeltaVms + ' m/s.',
      ])
      .filter(Boolean);
    t.warnings = [
      power && t.drawW > t.generationW && 'Consumes ' + t.drawW + ' W y generas ' + t.generationW + ' W: tendrás que apagar sistemas en la Luna.',
    ].filter(Boolean);
    t.ok = t.problems.length === 0;
    return t;
  }

  // Valores iniciales de la cabina a partir del diseño (paso c).
  function cockpitStart(t) {
    return {
      fuelPct: t.requiredDeltaVms ? Math.min(100, Math.round((t.deltaVms / t.requiredDeltaVms) * 60)) : 100,
      powerPct: 100,
      generationW: t.generationW,
      drawW: t.drawW,
      storageWh: t.storageWh,
      massKg: +t.massKg.toFixed(1),
      budgetLeftUsd: t.budgetUsd - t.costUsd,
    };
  }

  function load(storage) {
    try {
      const raw = storage && storage.getItem(STORAGE_KEY);
      return raw ? Object.assign(emptyDesign(), JSON.parse(raw)) : emptyDesign();
    } catch (e) {
      return emptyDesign();
    }
  }
  function save(storage, design) {
    try { storage && storage.setItem(STORAGE_KEY, JSON.stringify(design)); } catch (e) { /* sin almacenamiento */ }
  }

  const api = { AVIONICS, SUBSYSTEMS, emptyDesign, pick, totals, cockpitStart, load, save, usd };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MissionDesign = api;
})(typeof window !== 'undefined' ? window : globalThis);
