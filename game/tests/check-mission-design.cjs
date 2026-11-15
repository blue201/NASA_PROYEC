// Hangar de diseño: reglas que bloquean el despegue.
const assert = require('node:assert');
const MD = require('../js/design/mission-design.js');
const catalog = require('../js/design/catalog.json');

const base = { objective: 'ice', launcher: 'rideshare', orbit: 'elliptic-polar', structure: '6U',
  power: 'deploy-panels', comms: 'sband', instrument: 'neutron', propulsion: 'cold-gas' };

let t = MD.totals(catalog, MD.emptyDesign());
assert.ok(!t.ok && t.problems.length === 7, 'diseño vacío: 7 elecciones pendientes');

t = MD.totals(catalog, base);
assert.ok(t.ok, 'diseño base válido: ' + t.problems.join(' | '));

t = MD.totals(catalog, { ...base, propulsion: 'green' });
assert.ok(t.problems.some((p) => p.startsWith('Sobrepeso')), 'propulsión verde en 6U = sobrepeso');

t = MD.totals(catalog, { ...base, structure: '12U' });
assert.ok(t.problems.some((p) => p.includes('solo acepta naves de hasta 6U')), '12U no cabe en viaje compartido');

t = MD.totals(catalog, { ...base, orbit: 'low-polar' });
assert.ok(t.problems.some((p) => p.includes('necesita 140 m/s')), 'gas frío no alcanza la órbita baja');

t = MD.totals(catalog, { ...base, launcher: 'dedicated', structure: '12U', orbit: 'low-polar', propulsion: 'green', instrument: 'ir' });
assert.ok(t.problems.some((p) => p.startsWith('Presupuesto excedido')), 'combo premium excede presupuesto');

const c = MD.cockpitStart(MD.totals(catalog, base));
assert.ok(c.budgetLeftUsd >= 0 && c.fuelPct > 0 && c.massKg > 0, 'valores iniciales de cabina');

console.log('PASS: hangar de diseño valida objetivo, lanzador, órbita, masa, volumen, presupuesto y Δv.');
