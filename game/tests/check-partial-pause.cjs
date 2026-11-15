const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const project = path.join(__dirname, '..');
const source = name => fs.readFileSync(path.join(project, 'js', name), 'utf8');
let now = 0;
let nextTimer = 0;
const timers = new Map();
const frames = new Map();
const elements = new Map();
const document = { activeElement: null, getElementById(id) {
  if (!elements.has(id)) {
    const value = Object.assign(new EventTarget(), {
      open: false, hidden: false, style: {}, isConnected: true, contains(target) { return target === this; },
      classList: { add() {}, remove() {} },
      focus() { document.activeElement = this; },
      showModal() { if (this.failOpening) throw Error('Failed'); this.open = true; },
      close() { this.open = false; this.dispatchEvent(new Event('close')); }
    });
    elements.set(id, value);
  }
  return elements.get(id);
}, querySelector() { return [...elements.values()].find(e => e.open) || null; } };
const window = new EventTarget();
const context = { window, document, Event, console: { error() {} },
  performance: { now: () => now },
  setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
  clearTimeout(id) { timers.delete(id); },
  requestAnimationFrame(callback) { const id = ++nextTimer; frames.set(id, callback); return id; },
  cancelAnimationFrame(id) { frames.delete(id); }
};
vm.runInNewContext(source('flight/qte-system.js'), context);
vm.runInNewContext(source('core/partial-pause.js'), context);
const outcomes = [];
const qte = new window.QuickTimeEventSystem(result => outcomes.push(result));
qte.start('Estación');
now = 800; qte.runTimer();
const ringBefore = document.getElementById('qte-timer-ring').style.strokeDashoffset;
qte.pause(); now = 10800; qte.runTimer();
assert.equal(document.getElementById('qte-timer-ring').style.strokeDashoffset, ringBefore);
qte.resolveQTE(true); assert.equal(qte.isActive, true);
qte.resume();
assert.equal(document.getElementById('qte-timer-ring').style.strokeDashoffset, ringBefore);
assert.equal(outcomes.length, 0);
qte.resolveQTE(false);
now = 11000; qte.pause();
assert.equal(qte.resultRemaining, 500);
assert.equal(timers.size, 0);
now = 25000; qte.resume();
assert.equal([...timers.values()][0].delay, 500);
const pending = [...timers.values()][0].callback; timers.clear(); pending();
assert.deepEqual(outcomes, [false]);
qte.start('Otra estación'); qte.pause(); qte.cancel();
assert.equal(qte.isPaused, false);
qte.resume(); assert.equal(timers.size, 0);

let paused = 0; let resumed = 0; let saved = 0; let drained = 0;
let engine = { keys: { KeyW: true }, ship: { keys: { boost: true } }, mouse: { isDown: true },
  isDragging: true, isDirectDragging: true, dragPointerId: 9, dragVelocityX: 2, dragVelocityY: 3,
  isBrakingPedal: true, isThrottlingPedal: true,
  clock: { getDelta() { drained++; } }, qteSystem: { pause() { paused++; }, resume() { resumed++; } } };
const controller = new window.PartialPauseController({ getEngine: () => engine,
  beforePause() { saved++; }, onResume() {} });
const key = (code, repeat = false) => Object.assign(new Event('keydown', { cancelable: true }), { code, repeat });
window.dispatchEvent(key('Escape'));
assert.equal(controller.isPaused, true);
assert.equal(engine.keys.KeyW, false);
assert.equal(engine.ship.keys.boost, false);
assert.equal(engine.mouse.isDown, false);
assert.equal(engine.isDragging, false);
assert.equal(engine.isDirectDragging, false);
assert.equal(engine.dragPointerId, undefined);
assert.equal(engine.dragVelocityX, 0);
assert.equal(engine.dragVelocityY, 0);
assert.equal(engine.isBrakingPedal, false);
assert.equal(saved, 1); assert.equal(paused, 1);
window.dispatchEvent(key('Escape', true));
assert.equal(controller.isPaused, true);
let gameplayInput = 0;
window.addEventListener('keydown', () => gameplayInput++);
window.addEventListener('mousemove', () => gameplayInput++);
window.dispatchEvent(key('KeyW'));
window.dispatchEvent(new Event('mousemove'));
assert.equal(gameplayInput, 0);
window.dispatchEvent(key('Escape'));
assert.equal(controller.isPaused, false);
assert.equal(resumed, 1); assert.equal(drained, 1);
document.getElementById('partial-pause-button').dispatchEvent(new Event('click'));
assert.equal(controller.isPaused, true);
document.getElementById('partial-pause-resume').dispatchEvent(new Event('click'));
assert.equal(controller.isPaused, false);
const otherDialog = document.getElementById('other-dialog'); otherDialog.open = true;
controller.pause(); assert.equal(controller.isPaused, false);
otherDialog.open = false;
controller.pause(); controller.reset();
assert.equal(controller.isPaused, false);
assert.equal(document.getElementById('partial-pause-dialog').open, false);
const resumesBeforeReset = resumed;
controller.reset(); assert.equal(resumed, resumesBeforeReset);
document.getElementById('partial-pause-dialog').failOpening = true;
controller.pause(); assert.equal(controller.isPaused, false);
document.getElementById('partial-pause-dialog').failOpening = false;
document.getElementById('partial-pause-button').focus();
window.dispatchEvent(key('Space'));
assert.equal(controller.isPaused, true);
controller.resume();
engine = null; controller.sync();
assert.equal(document.getElementById('partial-pause-button').hidden, true);
engine = { keys: {}, clock: { getDelta() {} } };
controller.pause();
engine = { keys: {}, clock: { getDelta() {} } };
controller.sync();
assert.equal(controller.isPaused, false, 'a changed engine cannot leave the pause controller stuck');
controller.pause();
document.getElementById('partial-pause-dialog').open = false;
controller.sync();
assert.equal(controller.isPaused, false, 'sync recovers a closed dialog even if its close event was missed');
const cleanHud = fs.readFileSync(path.join(project, 'css/clean-hud.css'), 'utf8');
assert(!cleanHud.includes('body #partial-pause-button{display:none!important}'), 'CSS must allow the visible pause button');

// Call the production ambient methods: mission counters and ship position stay unchanged.
for (const [file, exported] of [['flight/flight-game.js','FlightGameEngine'], ['flight/landing-game.js','PlanetaryLandingEngine'], ['world/space-explorer.js','SpaceExplorationEngine']]) {
  const sandbox = { window: {}, Date, document: { getElementById(){ return null; } } };
  vm.runInNewContext(source(file), sandbox);
  let renders = 0; let ambient = 0;
  const disk = { rotation: { z: 0 } };
  const dust = { array: new Float32Array([0,0,-10]), needsUpdate: false };
  const state = { hull: 75, fuel: 50, oxygen: 60, progress: 35, canyonDistance: 1500,
    altitude: 40, touchdownTimer: 2, shipSpeed: 100, ship: { position: { x: 1, y: 2, z: 3 } },
    clock: { getDelta: () => 0.05 }, updateDeepSpaceBackground() { ambient++; }, updateGroundDust() { ambient++; },
    canyonDustMesh: { geometry: { attributes: { position: dust } } }, rabbitLights: [{ visible: false }],
    landmarks: [{ meshGroup: { userData: { disk } } }], skyDome: { rotation: { y: 0 } },
    renderer: { render() { renders++; } }, scene: {}, camera: {} };
  const before = JSON.stringify([state.hull,state.fuel,state.oxygen,state.progress,state.canyonDistance,
    state.altitude,state.touchdownTimer,state.shipSpeed,state.ship.position]);
  state.updateDestinationRotation = sandbox.window[exported].prototype.updateDestinationRotation;
  state.updateLandmarkAnimations = sandbox.window[exported].prototype.updateLandmarkAnimations;
  sandbox.window[exported].prototype.updatePaused.call(state);
  assert.equal(JSON.stringify([state.hull,state.fuel,state.oxygen,state.progress,state.canyonDistance,
    state.altitude,state.touchdownTimer,state.shipSpeed,state.ship.position]), before);
  assert.equal(renders, 1);
  assert.ok(ambient > 0 || disk.rotation.z !== 0);
}

// The real main loop takes only the ambient path while paused.
const main = source('core/main.js');
const loopStart = main.indexOf('  function gameLoop(');
const loopEnd = main.lastIndexOf('\n  requestAnimationFrame(gameLoop);');
let ambientFrames = 0; let normalFrames = 0; let writes = 0;
const loopContext = { window: { partialPause: { isPaused: true, sync() {}, engine: { updatePaused() { ambientFrames++; } } } },
  requestAnimationFrame() {}, renderPaused: false, lostCanvases: new Set(), watchGraphicsContexts() {},
  spaceExplorationEngine: { isActive: true, update() { normalFrames++; } },
  saveExpedition() { writes++; }, recoverExpedition(error) { throw error; } };
vm.runInNewContext(main.slice(loopStart, loopEnd) + '\ngameLoop();', loopContext);
assert.equal(ambientFrames, 1); assert.equal(normalFrames, 0); assert.equal(writes, 0);
console.log('PASS: Escape/button pause, repeated keys, keyboard/pointer isolation, cleared controls, QTE countdown/result timing, reset, opening failure, ambient rendering and frozen simulation.');
