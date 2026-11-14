// Estado global mínimo compartido entre módulos.
// Cada módulo lee/escribe aquí; ningún módulo importa a otro directamente.
import catalog from './data/cubesat.json';

export const state = {
  catalog,
  design: {
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

export function pick(subsystem, id) {
  return catalog.subsystems[subsystem]?.options.find((o) => o.id === id) ?? null;
}

export function designTotals(design = state.design) {
  const s = catalog.structures.find((x) => x.id === design.structure);
  const parts = SUBSYSTEMS.map((k) => pick(k, design[k])).filter(Boolean);
  const all = [AVIONICS, ...parts];
  const sum = (key) => all.reduce((a, p) => a + (p[key] ?? 0), 0);
  const power = pick('power', design.power);
  const prop = pick('propulsion', design.propulsion);
  const totals = {
    structure: s,
    massKg: s.massKg + sum('massKg'),
    volumeU: sum('volumeU'),
    costUsd: s.costUsd + sum('costUsd'),
    drawW: sum('drawW'),
    generationW: power?.generationW ?? 0,
    storageWh: power?.storageWh ?? 0,
    deltaVms: prop?.deltaVms ?? 0,
  };
  const req = catalog.mission.requiredDeltaVms;
  totals.problems = [
    ...SUBSYSTEMS.filter((k) => !design[k]).map((k) => `Falta elegir ${catalog.subsystems[k].label.toLowerCase()}.`),
    totals.massKg > s.maxMassKg && `Sobrepeso: ${totals.massKg.toFixed(1)} kg de ${s.maxMassKg} kg permitidos en un ${s.id}.`,
    totals.volumeU > s.volumeU && `No cabe: ${totals.volumeU} U de ${s.volumeU} U disponibles.`,
    totals.costUsd > catalog.startingBudget &&
      `Presupuesto excedido por $${(totals.costUsd - catalog.startingBudget).toLocaleString('en-US')}.`,
    prop && totals.deltaVms < req && `La propulsión da ${totals.deltaVms} m/s y entrar en órbita lunar necesita ${req} m/s.`,
  ].filter(Boolean);
  totals.ok = totals.problems.length === 0;
  return totals;
}
