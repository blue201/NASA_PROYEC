const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const project = require('node:path').join(__dirname, '..');
const data = new Map();
let blocked = false;
const localStorage = {
  getItem(key) { if (blocked) throw Error('blocked'); return data.get(key) ?? null; },
  setItem(key, value) { if (blocked) throw Error('quota'); data.set(key, value); }
};
const window = {};
vm.runInNewContext(fs.readFileSync(project + '/js/flight/mission-checkpoints.js', 'utf8'), { window, localStorage });
const notices = [];
const make = () => new window.MissionCheckpointStore(['mars', 'earth'], text => notices.push(text));
const flight = () => ({ phase: 'flight', planet: 'mars', scanned: ['earth'], flight: {
  hull: 80, fuel: 70, oxygen: 60, progress: 25, dockings: 1, camera: 'chase',
  position: [1, 2, 0], velocity: [0, 1, 0], speed: 1000
} });
const a = make();
assert.equal(a.read(), null);
assert.equal(a.save(flight()), true);
const updated = flight(); updated.flight.progress = 50;
assert.equal(a.save(updated), true);
assert.equal(data.size, 2);
assert.equal(make().read().flight.progress, 50);
data.set('odyssey_checkpoint_v1_b', '{corrupt');
const fallback = make();
assert.equal(fallback.read().flight.progress, 25);
const original = data.get('odyssey_checkpoint_v1_a');
const bad = flight(); bad.flight.hull = 0;
assert.equal(fallback.save(bad), false);
assert.equal(data.get('odyssey_checkpoint_v1_a'), original);
for (const change of [
  s => { s.flight.fuel = NaN; }, s => { s.flight.oxygen = 0; },
  s => { s.flight.progress = 100; }, s => { s.flight.dockings = 1.5; },
  s => { s.flight.position = [0]; }, s => { s.flight.camera = 'unknown'; },
  s => { s.planet = 'unknown'; }, s => { s.scanned = ['unknown']; }
]) {
  const state = flight(); change(state); assert.equal(fallback.save(state), false);
}
blocked = true;
const memoryOnly = flight(); memoryOnly.flight.progress = 65;
assert.equal(fallback.save(memoryOnly), false);
assert.equal(fallback.read().flight.progress, 65);
assert.equal(data.get('odyssey_checkpoint_v1_a'), original);
assert.equal(fallback.save(flight()), false);
blocked = false;
assert.equal(fallback.save({ phase: 'landing', planet: 'mars', scanned: ['earth'], hull: 55 }), true);
assert.equal(make().read().phase, 'landing');
assert.equal(fallback.save({ phase: 'exploration', planet: 'earth', scanned: ['earth'],
  exploration: { position: [0, 0, 2600], yaw: 0, pitch: 0, speed: 60 } }), true);
assert.equal(make().read().phase, 'exploration');
assert.equal(fallback.save({ phase: 'menu', planet: 'earth', scanned: ['earth'] }), true);
assert.equal(make().read().phase, 'menu');
const newestKey = [...data.entries()].sort((a,b) => JSON.parse(b[1]).sequence - JSON.parse(a[1]).sequence)[0][0];
const malformed = JSON.parse(data.get(newestKey)); malformed.version = 99;
data.set(newestKey, JSON.stringify(malformed));
assert.equal(make().read().phase, 'exploration');
assert.ok(notices.length > 0);

// Exercise the real QTE class: cancelled results cannot affect a reconstructed mission.
const timers = new Map();
let next = 0;
const elements = new Map();
const document = { getElementById(id) {
  if (!elements.has(id)) elements.set(id, { style: {}, classList: { add() {}, remove() {} } });
  return elements.get(id);
} };
const qteWindow = new EventTarget();
let results = 0;
vm.runInNewContext(fs.readFileSync(project + '/js/flight/qte-system.js', 'utf8'), {
  window: qteWindow, document, performance: { now: () => 0 },
  requestAnimationFrame: () => 1, cancelAnimationFrame() {},
  setTimeout(callback) { timers.set(++next, callback); return next; },
  clearTimeout(id) { timers.delete(id); }
});
const qte = new qteWindow.QuickTimeEventSystem(() => results++);
qte.start('Test');
qte.resolveQTE(true);
assert.equal(timers.size, 1);
qte.cancel();
assert.equal(timers.size, 0);
assert.equal(results, 0);
assert.equal(qte.isActive, false);
assert.equal(qte.resultTimer, null);
console.log('PASS: alternating copies, reload, corrupted-copy fallback, invalid states, blocked storage, memory recovery, all phases, schema versions and cancellation of pending QTE results.');
