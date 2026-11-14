const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const base = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(base, rel), 'utf8');

const flight = read('js/flight/flight-game.js');
const space = read('js/world/space-explorer.js');
const surface = read('js/world/surface-explorer.js');
const html = read('index.html');
const fluidity = read('js/core/fluidity.js');

// 1. La tecla F ya no dispara aterrizajes ni expediciones en ningún motor
assert.ok(!flight.includes("code === 'KeyF'"), 'flight-game no debe enlazar la tecla F');
assert.ok(!space.includes("e.code==='KeyF'"), 'space-explorer no debe enlazar la tecla F');
assert.ok(flight.includes('attemptLanding()'), 'el aterrizaje sigue disponible mediante botón');

// 2. Los textos de la interfaz ya no ordenan pulsar F para descender
assert.ok(!/\[F para descender\]/.test(flight), 'el aviso de escaneo no debe mencionar la tecla F');
assert.ok(!html.includes('Drones · F'), 'el botón de drones no debe anunciar la tecla F');
assert.ok(!space.includes('pulsa F cuando esté disponible'), 'la guía de JARVIS no debe mencionar pulsar F');

// 3. Módulo de fluidez: resolución dinámica adaptativa cargada y conectada
assert.ok(html.includes('<script src="js/core/fluidity.js">'), 'index.html debe cargar fluidity.js antes de los motores');
assert.ok(fluidity.includes('setPixelRatio'), 'fluidity ajusta el pixelRatio del renderer');
for (const [name, code] of [['space-explorer', space], ['surface-explorer', surface], ['flight-game', flight]]) {
  assert.ok(code.includes('Fluidity?.register('), `${name} debe registrar su renderer en Fluidity`);
  assert.ok(code.includes('Fluidity?.frame('), `${name} debe reportar su delta a Fluidity`);
}

// 4. La resolución dinámica nunca baja de 1.0 ni sube por encima del valor base
assert.ok(fluidity.includes('Math.max(1,r.current-STEP)'), 'el pixelRatio mínimo es 1');
assert.ok(fluidity.includes('Math.min(r.base,r.current+STEP)'), 'el pixelRatio nunca excede el valor base');

// 5. Telemetría de superficie con escritura limitada (fluidez DOM)
assert.ok(surface.includes('telemetryTimer'), 'surface-explorer debe limitar la escritura de telemetría');
assert.ok(surface.includes('activeLandmark'), 'la telemetría debe mostrar el sitio de exploración activo');

console.log('PASS: sin tecla F funcional, fluididad adaptativa conectada y telemetría limitada.');
