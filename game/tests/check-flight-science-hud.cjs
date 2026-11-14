const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const project = path.join(__dirname, '..');
const nodes = new Map();
const document = { activeElement: null, getElementById(id) {
  if (!nodes.has(id)) nodes.set(id, Object.assign(new EventTarget(), {
    hidden: true, open: false, textContent: '', dataset: {},
    contains(target) { return !!target?.insidePanel; },
    blur() { document.activeElement = null; }
  }));
  return nodes.get(id);
} };
const window = new EventTarget();
let now = 0;
vm.runInNewContext(fs.readFileSync(path.join(project, 'js/flight/flight-science-hud.js'), 'utf8'),
  { window, document, performance: { now: () => now } });
let context = null;
const hud = new window.FlightScienceHUD(() => context);
const text = id => document.getElementById(id).textContent;
hud.update();
assert.equal(hud.panel.hidden, true);
assert.equal(hud.notice.hidden, true);
const engine = {
  hull: 100, fuel: 100, oxygen: 100, progress: 5, currentDistanceKm: 123456,
  dockingSuccessCount: 0, isQTEActive: false, isDragging: true,
  ship: { keys: { up: true, boost: true } }, mathModel: { fuelBurnRate: 1.15, oxygenBurnRate: 0.8 }
};
context = { engine, planet: 'mars', scanned: false, paused: false,
  plan: { dv_total: '5.7', min_dockings: 3 }, data: { name: 'Marte',
    gravity: '3.71 m/s²', equatorialDiameterKm: '6,779 km', atmosphereComposition: 'CO₂', moonCount: 2 } };
hud.update();
assert.equal(hud.panel.hidden, false);
assert.equal(hud.panel.open, false);
assert.equal(text('science-destination'), 'Marte');
assert.equal(text('science-gravity'), 'Requiere escaneo');
assert.equal(text('science-moons'), 'Requiere escaneo');
assert.equal(text('science-deltav'), '5.7 km/s');
assert.match(text('science-distance'), /km$/);
assert.match(text('science-dockings'), /3 pendiente/);
context.scanned = true;
hud.update(); // A scan update bypasses the normal display throttle.
assert.equal(text('science-gravity'), '3.71 m/s²');
assert.equal(text('science-moons'), '2');
assert.equal(text('science-class'), 'No disponible en el catálogo');
context.data.moonCount = 0;
now = 250; hud.update(); assert.equal(text('science-moons'), '0');
engine.dockingSuccessCount = 3;
now = 500; hud.update(); assert.match(text('science-dockings'), /Plan de acoples cumplido/);
engine.fuel = 10;
now = 750; hud.update(); assert.match(hud.notice.textContent, /Suministros bajos/);
assert.equal(hud.notice.dataset.level, 'warning');
engine.hull = 20;
now = 1000; hud.update(); assert.match(hud.notice.textContent, /Casco crítico/);
context.paused = true;
hud.update(); assert.match(hud.notice.textContent, /en pausa/);
context.paused = false; engine.isQTEActive = true;
hud.panel.open = true;
hud.update(); assert.equal(hud.panel.hidden, true); assert.equal(hud.panel.open, false);
assert.match(hud.notice.textContent, /Acople en curso/);
engine.isQTEActive = false; engine.hull = 100; engine.fuel = 100; engine.progress = 90;
now = 1250; hud.update(); assert.match(hud.notice.textContent, /Aproximación final/);
context.planet = 'earth'; context.data = { name: 'Tierra', gravity: '<img onerror=alert(1)>' };
hud.panel.open = true;
hud.update(); assert.equal(hud.panel.open, false);
assert.equal(text('science-destination'), 'Tierra');
assert.equal(text('science-gravity'), '<img onerror=alert(1)>'); // Stored as text, never HTML.
const focus = document.getElementById('test-summary'); focus.insidePanel = true;
document.activeElement = focus;
hud.panel.dispatchEvent(new Event('focusin'));
assert.equal(engine.ship.keys.up, false); assert.equal(engine.ship.keys.boost, false);
assert.equal(engine.isDragging, false);
let gameplayKeys = 0;
window.addEventListener('keydown', () => gameplayKeys++);
window.dispatchEvent(Object.assign(new Event('keydown'), { code: 'Space' }));
assert.equal(gameplayKeys, 0);
window.dispatchEvent(Object.assign(new Event('keydown'), { code: 'Escape' }));
assert.equal(gameplayKeys, 1); // Escape remains available to the pause controller.
context = null; hud.update();
assert.equal(hud.panel.hidden, true); assert.equal(hud.notice.hidden, true);
assert.equal(document.activeElement, null);
// The older telemetry label must also reach zero rather than inventing one more acople.
const dockingLabel = { textContent: '', className: '' };
const legacy = { window: {}, document: { getElementById: id => id === 'live-math-docking' ? dockingLabel : null } };
vm.runInNewContext(fs.readFileSync(path.join(project, 'js/flight/flight-game.js'), 'utf8'), legacy);
legacy.window.FlightGameEngine.prototype.updateHUD.call({
  hull:100, fuel:100, oxygen:100, currentDistanceKm:1000, currentSpeedKm:1000,
  dockingSuccessCount:3, mathModel:{ minDockingsRequired:3 }
});
assert.match(dockingLabel.textContent, /REQUISITO CUMPLIDO/);
console.log('PASS: collapsed science panel, essential notices, scan gating, missing/zero values, route/docking telemetry, pause, QTE priority, destination changes, safe text and keyboard controls.');
