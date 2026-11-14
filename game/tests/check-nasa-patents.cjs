const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const mockStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; }
};

const window = {
  localStorage: mockStorage,
  dispatchEvent() {}
};

// 1. Run nasa-patents.js
const patentsSrc = fs.readFileSync(path.join(__dirname, '../js/core/nasa-patents.js'), 'utf8');
vm.runInNewContext(patentsSrc, { window, localStorage: mockStorage, CustomEvent: class {} });

assert(window.NasaPatents, 'NasaPatents should be exposed on window');
assert.equal(window.NasaPatents.has('NASA-PAT-9418291'), false);

// 2. Mock ExplorationUpgrades credits
window.ExplorationUpgrades = {
  state: { credits: 100 },
  level: () => 0,
  save() {}
};

// Install Hall thruster
const installed = window.NasaPatents.install('NASA-PAT-9418291', 40);
assert.equal(installed, true, 'Should successfully install patent');
assert.equal(window.NasaPatents.has('NASA-PAT-9418291'), true, 'Patent should be marked as installed');
assert.equal(window.ExplorationUpgrades.state.credits, 60, 'Credits should be deducted');

// Reinstalling should fail
assert.equal(window.NasaPatents.install('NASA-PAT-9418291', 40), false);

// 3. Test functional benefit in ExpeditionState
const expeditionSrc = fs.readFileSync(path.join(__dirname, '../js/world/expedition-systems.js'), 'utf8');
const expContext = { window, THREE: { Vector3: class { set() {} clone() { return this; } } }, localStorage: mockStorage };
vm.runInNewContext(expeditionSrc, expContext);

const ExpeditionState = window.ExpeditionSystems.ExpeditionState;
const state = new ExpeditionState(mockStorage);

// Test fuel consumption with Hall thruster (0.6x)
const fuelBefore = state.fuel;
state.tick(1, { moving: true, speed: 100 });
const fuelUsedWithPatent = fuelBefore - state.fuel;

// Uninstall patent and compare
window.NasaPatents.uninstall('NASA-PAT-9418291', 40);
assert.equal(window.NasaPatents.has('NASA-PAT-9418291'), false);
assert.equal(window.ExplorationUpgrades.state.credits, 100, 'Credits should be refunded');

state.fuel = fuelBefore;
state.tick(1, { moving: true, speed: 100 });
const fuelUsedWithoutPatent = fuelBefore - state.fuel;

assert(fuelUsedWithPatent < fuelUsedWithoutPatent, 'Patent should reduce fuel burn');

// Test Aerogel damage factor
window.NasaPatents.install('NASA-PAT-8815124', 40);
const damageWithAerogel = state.damageFactor;
window.NasaPatents.uninstall('NASA-PAT-8815124', 40);
const damageWithoutAerogel = state.damageFactor;
assert(damageWithAerogel < damageWithoutAerogel, 'Aerogel should reduce damage factor');

// Test ECLSS life support
window.NasaPatents.install('NASA-PAT-7928341', 40);
state.oxygen = 100;
state.tick(1, { moving: true });
const o2UsedWithEclss = 100 - state.oxygen;

window.NasaPatents.uninstall('NASA-PAT-7928341', 40);
state.oxygen = 100;
state.tick(1, { moving: true });
const o2UsedWithoutEclss = 100 - state.oxygen;
assert(o2UsedWithEclss < o2UsedWithoutEclss, 'ECLSS should reduce oxygen burn');

console.log('PASS: NASA Patents functional installation, credit integration and ship enhancements verified.');
