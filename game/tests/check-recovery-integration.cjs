const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const project = require('node:path').join(__dirname, '..');
const storage = new Map();
let now = 0;
function element() {
  const value = new EventTarget();
  const classes = new Set();
  value.classList = { add: x => classes.add(x), remove: x => classes.delete(x),
    contains: x => classes.has(x), toggle(x, on) { if (on) classes.add(x); else classes.delete(x); } };
  return value;
}
function vec() {
  return { values: [0,0,0], toArray() { return [...this.values]; },
    fromArray(a) { this.values = [...a]; }, copy(v) { this.values = [...v.values]; } };
}
const elements = new Map();
const document = new EventTarget();
document.getElementById = id => {
  if (!elements.has(id)) elements.set(id, element());
  return elements.get(id);
};
const canvas = element();
const renderer = { domElement: canvas };
const flight = { renderer, ship: { position: vec(), velocity: vec(), shipGroup: { position: vec() }, setDamage() {} },
  qteSystem: { resultTimer: null, cancel() { this.resultTimer = null; } },
  mathModel: { orbitalDistanceKm: 1000 },
  startMission(key) { Object.assign(this, { isFlying: true, isStrandedCinematic: false, isQTEActive: false,
    activePlanetKey: key, hull: 100, fuel: 100, oxygen: 100, progress: 0, dockingSuccessCount: 0,
    currentCameraMode: 'chase', currentSpeedKm: 1000 }); },
  stop() { this.isFlying = false; }, cycleCameraMode(value) { this.currentCameraMode = value; }, updateHUD() {} };
const landing = { stop() { this.isActive = false; this.isTouchdownAnimation = false; },
  startDescent(key, hull) { this.isActive = true; this.planetKey = key; this.hull = hull; } };
const viewer = { renderer, pause() {}, resume() {}, loadPlanet() {} };
const window = new EventTarget();
const context = { window, document, Event, console: { error() {} },
  localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v) },
  performance: { now: () => now }, setTimeout: () => 1, clearTimeout() {}, queueMicrotask: fn => fn(),
  NASA_PLANETARY_DATABASE: { mars: { name: 'Marte' }, earth: { name: 'Tierra' } },
  selectedPlanetKey: 'earth', scannedPlanets: { earth: true }, planetTabs: [], flightEngine: flight,
  landingEngine: landing, planetViewer: viewer, spaceExplorationEngine: null,
  renderPlanetaryTelemetry() {}, computeOrbitalTelemetry: () => ({ distanceDisplay: '1000 km', dv_total: 5, min_dockings: 2 }),
  navTargetName: element()
};
for (const id of ['selectionScreen','flightScreen','landingScreen','spaceExplorationScreen','completeModal',
  'touchdownModal','gameOverModal','strandedOverlay','orbitalMathModal']) context[id] = element();
context.exploreSpaceBtn = { click() {
  context.spaceExplorationEngine = { renderer, isActive: true, shipGroup: { position: vec() },
    cameraYaw: 0, cameraPitch: 0, shipSpeed: 60, stopExploration() { this.isActive = false; } };
} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(project + '/js/flight/mission-checkpoints.js', 'utf8'), context);
const seed = new window.MissionCheckpointStore(['mars','earth']);
seed.read();
seed.save({ phase: 'flight', planet: 'mars', scanned: ['mars','earth'], flight: {
  hull: 75, fuel: 61, oxygen: 72, progress: 35, dockings: 2, camera: 'cockpit',
  position: [2,3,0], velocity: [1,0,0], speed: 1200
} });
const main = fs.readFileSync(project + '/js/core/main.js', 'utf8');
const start = main.indexOf('  // Checkpoints contain');
const end = main.indexOf('  // 19. Loop', start);
assert.ok(start > 0 && end > start);
vm.runInContext(main.slice(start, end) + `
  window.integration = { saveExpedition, captureExpedition, restoreExpedition, recoverExpedition,
    watchGraphicsContexts, get paused() { return renderPaused; } };
`, context);
const api = window.integration;
assert.equal(context.selectedPlanetKey, 'mars');
assert.equal(flight.progress, 35);
assert.equal(flight.hull, 75);
assert.equal(flight.currentDistanceKm, 650);
assert.equal(flight.currentCameraMode, 'cockpit');
assert.deepEqual(flight.ship.position.toArray(), [2,3,0]);
assert.equal(context.flightScreen.classList.contains('active'), true);
const sequence = () => Math.max(...[...storage.values()].map(v => JSON.parse(v).sequence));
const initialSequence = sequence();
flight.progress = 45;
now = 14999; api.saveExpedition(); assert.equal(sequence(), initialSequence);
now = 15000; api.saveExpedition(); assert.equal(sequence(), initialSequence + 1);
flight.isQTEActive = true;
api.saveExpedition(true); assert.equal(sequence(), initialSequence + 1);
flight.isQTEActive = false; flight.qteSystem.resultTimer = 9;
api.saveExpedition(true); assert.equal(sequence(), initialSequence + 1);
flight.qteSystem.resultTimer = null;
flight.fuel = 100; flight.oxygen = 100; flight.dockingSuccessCount++;
window.dispatchEvent(new Event('odyssey-checkpoint'));
assert.equal(sequence(), initialSequence + 2);
flight.stop(); landing.startDescent('mars', 65);
api.saveExpedition(); assert.equal(sequence(), initialSequence + 3);
assert.equal(api.captureExpedition().phase, 'landing');
api.restoreExpedition({ phase:'landing', planet:'mars', scanned:['earth'], hull:65 });
assert.equal(landing.hull, 65);
api.restoreExpedition({ phase:'exploration', planet:'earth', scanned:['earth'],
  exploration: { position:[1,2,3000], yaw:1, pitch:0.3, speed:90 } });
assert.equal(context.spaceExplorationEngine.cameraYaw, 1);
assert.deepEqual(context.spaceExplorationEngine.shipGroup.position.toArray(), [1,2,3000]);
api.saveExpedition();
const explorationSequence = sequence();
context.spaceExplorationEngine.shipGroup.position.fromArray([4,5,3500]);
now += 14999; api.saveExpedition(); assert.equal(sequence(), explorationSequence);
now += 1; api.saveExpedition(); assert.equal(sequence(), explorationSequence + 1);
assert.deepEqual(Array.from(new window.MissionCheckpointStore(['mars','earth']).read().exploration.position), [4,5,3500]);
// Surface checkpoints restore through the same entry point without replaying entry.
const THREE = require('../assets/vendor/three-r128.min.js');
context.THREE = THREE;
window.ExpeditionSystems = { state: { hull: 82, save() {} } };
window.SurfaceNavigation = { constrain: position => position };
let restoredSurface = false;
context.openSurface = (planet, _landing, _hull, ancient, restoring) => {
  restoredSurface = restoring;
  window.surfaceExplorer = { isActive: true, planetKey: planet, ancientEarth: ancient,
    shipGroup: new THREE.Group(), landingPad: { position: new THREE.Vector3(5, 10, -10) },
    camera: new THREE.PerspectiveCamera(), clock: { getDelta() {} },
    cameraYaw: 0, cameraPitch: 0, currentCameraMode: 'chase',
    stop() { this.isActive = false; } };
};
context.openSurface('earth', true, 82, true, false);
window.surfaceExplorer.shipGroup.position.set(80, 200, -600);
api.saveExpedition(true);
const surfaceSave = new window.MissionCheckpointStore(['mars','earth']).read();
assert.equal(surfaceSave.phase, 'surface');
window.surfaceExplorer.arrival = {};
assert.equal(api.captureExpedition(), null, 'a transitional frame cannot overwrite a stable save');
api.restoreExpedition(surfaceSave);
assert.equal(restoredSurface, true);
assert.equal(window.surfaceExplorer.ancientEarth, true);
assert.deepEqual(window.surfaceExplorer.shipGroup.position.toArray(), [80,200,-600]);
surfaceSave.surface.landed = true;
api.restoreExpedition(surfaceSave);
assert.equal(window.surfaceExplorer.landingComplete, true);
assert.deepEqual(window.surfaceExplorer.shipGroup.position.toArray(), [5,29,-10]);
// Leave a persisted landing record for the graphics recovery assertions below.
api.restoreExpedition({ phase:'landing', planet:'mars', scanned:['earth'], hull:65 });
api.saveExpedition(true);
api.restoreExpedition({ phase:'menu', planet:'mars', scanned:['earth','mars'] });
assert.equal(context.selectionScreen.classList.contains('active'), true);

api.watchGraphicsContexts();
canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
const beforeLost = sequence(); api.saveExpedition(true); assert.equal(sequence(), beforeLost);
canvas.dispatchEvent(new Event('webglcontextrestored'));
assert.equal(landing.isActive, true); // Latest persisted phase reconstructed.
api.recoverExpedition(Error('repeat'));
api.recoverExpedition(Error('repeat again'));
assert.equal(api.paused, true);
const preserved = sequence(); api.saveExpedition(true); assert.equal(sequence(), preserved);
console.log('PASS: automatic resume, restored flight values, 15-second schedule, QTE exclusion, acople and phase saves, phase restoration, context loss and bounded recovery preserving checkpoints.');

let startOptions;
const menuWindow = new EventTarget();
menuWindow.MissionCheckpointStore = window.MissionCheckpointStore;
menuWindow.StartMenu = { awaitingChoice: true, initialize(options) { startOptions = options; } };
const menuContext = { ...context, window: menuWindow, selectedPlanetKey: 'earth' };
vm.createContext(menuContext);
vm.runInContext(main.slice(start, end), menuContext);
assert.equal(menuContext.selectedPlanetKey, 'earth', 'the start menu defers restoration until the user chooses Load');
assert.equal(startOptions.hasSave, true);
startOptions.onLoad();
assert.equal(menuContext.selectedPlanetKey, 'mars');
