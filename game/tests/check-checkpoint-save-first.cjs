const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const data = new Map();
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/flight/mission-checkpoints.js'), 'utf8'), {
  window, localStorage: {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value)
  }
});
const make = () => new window.MissionCheckpointStore(['earth', 'mars']);
const state = planet => ({ phase: 'menu', planet, scanned: [] });
const first = make();
assert.equal(first.save(state('earth')), true);
assert.equal(first.save(state('earth')), true);
const previous = [...data.entries()].find(([, raw]) => JSON.parse(raw).sequence === 2);
const fresh = make();
assert.equal(fresh.save(state('mars')), true); // No explicit read on this instance.
assert.equal(make().read().planet, 'mars');
assert.equal(data.get(previous[0]), previous[1]); // Preserve the previous valid copy.
assert.equal(Math.max(...[...data.values()].map(raw => JSON.parse(raw).sequence)), 3);
const original = JSON.stringify([...data]);
const cyclic = state('earth'); cyclic.extra = cyclic;
assert.equal(fresh.save(cyclic), false);
assert.equal(JSON.stringify([...data]), original);
const transformed = state('earth');
transformed.toJSON = () => ({ phase: 'menu', planet: 'unknown', scanned: [] });
assert.equal(fresh.save(transformed), false);
assert.equal(JSON.stringify([...data]), original);
assert.equal(fresh.read().planet, 'mars');
console.log('PASS: save before read preserves sequence and backup; cyclic and transformed invalid states preserve disk and memory.');
