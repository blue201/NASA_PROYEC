// "Explorar otros planetas" tras completar la misión: pulsar el botón real del cuadro
// debe despegar aunque quede poco combustible, y dejar reserva para un viaje más.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const THREE = require('../assets/vendor/three-r128.min.js');

// Estado con 'operational' de solo lectura, igual que ExpeditionState real.
class State {
  constructor() { this.fuel = 3; this.oxygen = 40; this.hull = 80; this.saves = 0; }
  get operational() { return this.fuel > 0 && this.oxygen > 0 && this.hull > 0; }
  save() { this.saves++; }
  unlock() {}
}
const state = new State();

// Cuadro de diálogo mínimo que guarda los botones para poder pulsarlos.
const buttons = {};
let dialogClosed = false;
const panel = {
  set innerHTML(html) { for (const m of html.matchAll(/data-action="([a-z]+)"/g)) buttons[m[1]] = { onclick: null }; },
  querySelector(sel) { const a = sel.match(/data-action="([a-z]+)"/); return a ? buttons[a[1]] : { textContent: '' }; },
  showModal() {}, close() { dialogClosed = true; }, remove() {},
};
const elements = {};
const document = {
  getElementById: (id) => (id === 'surface-success' ? null : elements[id] || (elements[id] = { hidden: false })),
  createElement: () => panel,
  body: { append() {} },
};
const window = { ExpeditionSystems: { state }, dispatchEvent() {}, planetNarrator: null };
vm.runInNewContext(fs.readFileSync('js/world/surface-explorer.js', 'utf8'), { window, document, THREE, CustomEvent: class {} });

const e = Object.create(window.PlanetSurfaceExplorer.prototype);
Object.assign(e, {
  isActive: true, planetKey: 'moon', landingComplete: true,
  // banderas que a veces quedaban colgadas tras aterrizar
  arrival: { time: 1, end: new THREE.Vector3(), clouded: false }, autoLanding: { stale: true },
  shipGroup: new THREE.Group(), camera: new THREE.PerspectiveCamera(), cameraYaw: 0,
  scene: { background: new THREE.Color() }, landingGuide: { textContent: '' },
  beginArrival() { this.arrival = { time: 0, end: new THREE.Vector3(), clouded: false }; },
  beginSurfaceLift() {},
});

e.showLandingSuccess();
assert.ok(buttons.travel && typeof buttons.travel.onclick === 'function', 'el cuadro tiene el botón Explorar otros planetas');
assert.doesNotThrow(() => buttons.travel.onclick(), 'pulsar el botón no debe lanzar errores');
assert.equal(e.arrival.departure, true, 'debe empezar el despegue');
assert.equal(dialogClosed, true, 'el cuadro se cierra');
assert.equal(e.returnToSelection, true, 'al terminar el despegue se abre el mapa');
assert.ok(state.fuel >= 5, 'queda combustible para un viaje más desde el mapa');
assert.ok(state.operational, 'la nave queda operativa');
console.log('PASS: Explorar otros planetas despega con poco combustible, cierra el cuadro y deja reserva para viajar.');
