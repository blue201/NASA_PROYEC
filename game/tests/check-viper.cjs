// VIPER: solo en la Luna, cerca de la plataforma, con ficha y fuente, y se limpia al salir.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const THREE = require('../assets/vendor/three-r128.min.js');
const window = { THREE, SurfaceNavigation: { heightAt: () => 5 } };
vm.runInNewContext(fs.readFileSync('js/surface/viper.js', 'utf8'), { window, THREE, globalThis: { THREE } });
const V = window.ViperRover;
const scene = new THREE.Scene();
const e = { planetKey: 'moon', scene, landingPad: { position: { x: 0, z: -650 } } };
const rover = V.build(e);
assert.ok(rover && scene.children.includes(rover), 'VIPER aparece en la Luna');
assert.ok(Math.hypot(rover.position.x, rover.position.z + 650) > 100, 'lejos de la plataforma');
assert.match(V.info.source_url, /^https:\/\/science\.nasa\.gov\//, 'con fuente real');
assert.match(V.info.name, /2024/, 'la ficha dice que se canceló en 2024');
V.dispose(); assert.equal(scene.children.length, 0, 'se limpia al salir');
assert.equal(V.build({ ...e, planetKey: 'mars' }), null, 'no aparece fuera de la Luna');
console.log('PASS: VIPER solo en la Luna, con ficha y fuente, y limpieza al salir.');
