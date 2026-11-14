const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/flight/adaptive-tutorial.js'), 'utf8');

function setup(saved = null, blocked = false) {
  const elements = Object.fromEntries(['adaptive-tutorial', 'tutorial-title', 'tutorial-message', 'tutorial-dismiss']
    .map(id => [id, Object.assign(new EventTarget(), { hidden: true, textContent: '', blur() { document.activeElement = null; } })]));
  const document = { getElementById: id => elements[id], activeElement: null };
  let now = 0;
  let timerId = 0;
  const timers = new Map();
  const writes = [];
  const window = {
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); }
  };
  const localStorage = {
    getItem() { if (blocked) throw Error('Storage blocked'); return saved; },
    setItem(key, value) { if (blocked) throw Error('Storage blocked'); writes.push([key, value]); }
  };
  vm.runInNewContext(source, { window, document, localStorage, performance: { now: () => now } });
  return { tutorial: window.adaptiveTutorial, elements, document, writes, timers, time(value) { now = value; } };
}

const s = setup();
s.tutorial.enter('flight');
assert.equal(s.elements['adaptive-tutorial'].hidden, false);
assert.equal(s.elements['tutorial-title'].textContent, 'Primer vuelo');
assert.equal(s.writes.length, 1);
s.tutorial.enter('flight');
assert.equal(s.writes.length, 1);
assert.equal(s.timers.size, 1);
s.elements['tutorial-dismiss'].dispatchEvent(new Event('click'));
assert.equal(s.elements['adaptive-tutorial'].hidden, true);
assert.equal(s.timers.size, 0);
s.tutorial.failure('flight');
assert.equal(s.elements['adaptive-tutorial'].hidden, true);
s.time(100); // Continuous collision must not generate repeated teaching events.
s.tutorial.failure('flight');
assert.equal(s.elements['adaptive-tutorial'].hidden, true);
s.time(2000);
s.tutorial.failure('flight');
assert.equal(s.elements['adaptive-tutorial'].hidden, true); // Repeated-failure hints were removed at the player's request.
s.tutorial.hide();
s.time(4000); s.tutorial.failure('flight');
s.time(6000); s.tutorial.failure('flight');
assert.equal(s.elements['adaptive-tutorial'].hidden, true); // Reminder cooldown.
s.time(33000); s.tutorial.failure('flight');
assert.equal(s.elements['adaptive-tutorial'].hidden, true);

s.tutorial.introduce('docking');
assert.equal(s.elements['tutorial-title'].textContent, 'Acople y suministros');
s.tutorial.hide();
s.tutorial.failure('docking');
s.tutorial.success('docking');
s.time(35000); s.tutorial.failure('docking');
assert.equal(s.elements['adaptive-tutorial'].hidden, true); // Success resets the error streak.
s.tutorial.enter('landing');
assert.equal(s.elements['tutorial-title'].textContent, 'Descenso al cañón');
s.tutorial.hide();
s.time(37000); s.tutorial.failure('docking');
assert.equal(s.elements['adaptive-tutorial'].hidden, true); // Stale activity ignored.
s.tutorial.enter(null);
assert.equal(s.timers.size, 0);
s.tutorial.enter('flight');
assert.equal(s.elements['adaptive-tutorial'].hidden, true); // First-time help stays dismissed.

for (const saved of ['{invalid', '{"version":1,"seen":"invalid"}', '{"version":2,"seen":["flight"]}']) {
  const c = setup(saved);
  c.tutorial.enter('flight');
  assert.equal(c.elements['adaptive-tutorial'].hidden, false);
}
const restored = setup('{"version":1,"seen":["flight","unknown","__proto__"]}');
restored.tutorial.enter('flight');
assert.equal(restored.elements['adaptive-tutorial'].hidden, true);
assert.equal(restored.tutorial.seen.size, 1);
const unavailable = setup(null, true);
unavailable.tutorial.enter('exploration');
assert.equal(unavailable.elements['adaptive-tutorial'].hidden, false);
unavailable.document.activeElement = unavailable.elements['tutorial-dismiss'];
unavailable.tutorial.hide();
assert.equal(unavailable.document.activeElement, null);
unavailable.tutorial.show('Ayuda', 'Mensaje');
[...unavailable.timers.values()][0]();
assert.equal(unavailable.elements['adaptive-tutorial'].hidden, true);
assert.ok(s.writes.every(([key]) => key === 'odyssey_tutorial_v1'));
console.log('PASS: first activity, persistence, repeated errors, contact deduplication, cooldown, success reset, context changes, dismissal, timer, invalid/blocked storage and focus.');
