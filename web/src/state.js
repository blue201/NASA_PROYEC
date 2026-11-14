// Estado global mínimo compartido entre módulos.
// Cada módulo lee/escribe aquí; ningún módulo importa a otro directamente.
import catalog from './data/cubesat.json';

export const state = {
  catalog,
  design: {
    objective: null,
    launcher: null,
    orbit: null,
    structure: '6U',
    power: null,
    comms: null,
    instrument: null,
    propulsion: null,
  },
  mission: null, // lo llena el módulo de misión
  data: null, // { images, horizons } desde el backend o el caché (ver data/load.js)
};

const listeners = new Set();
export const onChange = (fn) => listeners.add(fn);
export const emit = () => listeners.forEach((fn) => fn(state));

// Aviónica fija (computadora + control de actitud) que todo CubeSat lleva.
export const AVIONICS = { name: 'Aviónica y control de actitud', massKg: 0.8, volumeU: 1, costUsd: 300000, drawW: 8 };

export const SUBSYSTEMS = ['power', 'comms', 'instrument', 'propulsion'];

const byId = (list, id) => list.find((x) => x.id === id) ?? null;
export const objective = (d = state.design) => byId(catalog.objectives, d.objective);
export const launcher = (d = state.design) => byId(catalog.launchers, d.launcher);
export const orbit = (d = state.design) => byId(catalog.orbits, d.orbit);

export function pick(subsystem, id) {
  return byId(catalog.subsystems[subsystem]?.options ?? [], id);
}

export function designTotals(design = state.design) {
  const s = byId(catalog.structures, design.structure);
  const lv = launcher(design);
  const orb = orbit(design);
  const parts = SUBSYSTEMS.map((k) => pick(k, design[k])).filter(Boolean);
  const all = [AVIONICS, ...parts];
  const sum = (key) => all.reduce((a, p) => a + (p[key] ?? 0), 0);
  const power = pick('power', design.power);
  const prop = pick('propulsion', design.propulsion);
  const totals = {
    structure: s,
    massKg: s.massKg + sum('massKg'),
    volumeU: sum('volumeU'),
    costUsd: s.costUsd + sum('costUsd') + (lv?.costUsd ?? 0),
    drawW: sum('drawW'),
    generationW: power?.generationW ?? 0,
    storageWh: power?.storageWh ?? 0,
    deltaVms: prop?.deltaVms ?? 0,
    requiredDeltaVms: orb?.requiredDeltaVms ?? 0,
  };
  const usd = (n) => `$${n.toLocaleString('en-US')}`;
  totals.problems = [
    !design.objective && 'Falta elegir el objetivo de la misión.',
    !lv && 'Falta elegir el lanzador.',
    !orb && 'Falta elegir la órbita.',
    ...SUBSYSTEMS.filter((k) => !design[k]).map((k) => `Falta elegir ${catalog.subsystems[k].label.toLowerCase()}.`),
    totals.massKg > s.maxMassKg && `Sobrepeso: ${totals.massKg.toFixed(1)} kg de ${s.maxMassKg} kg permitidos en un ${s.id}.`,
    totals.volumeU > s.volumeU && `No cabe: ${totals.volumeU} U de ${s.volumeU} U disponibles.`,
    lv && s.volumeU > lv.maxVolumeU && `El ${lv.name.toLowerCase()} solo acepta naves de hasta ${lv.maxVolumeU}U.`,
    lv && totals.massKg > lv.maxMassKg && `El lanzador solo lleva ${lv.maxMassKg} kg.`,
    totals.costUsd > catalog.startingBudget && `Presupuesto excedido por ${usd(totals.costUsd - catalog.startingBudget)}.`,
    prop && orb && totals.deltaVms < orb.requiredDeltaVms &&
      `La propulsión da ${totals.deltaVms} m/s y entrar en la ${orb.name.toLowerCase()} necesita ${orb.requiredDeltaVms} m/s.`,
  ].filter(Boolean);
  totals.ok = totals.problems.length === 0;
  return totals;
}
