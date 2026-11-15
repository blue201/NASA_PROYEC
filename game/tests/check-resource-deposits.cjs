// Depósitos de recursos reales: se dibujan solo los recursos con ubicación en el suelo,
// cada uno con nombre y fuente, en posiciones finitas, y se limpian al salir.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const THREE = require('../assets/vendor/three-r128.min.js');
const window = { THREE, SurfaceNavigation: { heightAt: () => 12 } };
vm.runInNewContext(fs.readFileSync('js/surface/resource-deposits.js', 'utf8'), { window, THREE, URLSearchParams, globalThis: { THREE } });
const RD = window.ResourceDeposits;
const scene = new THREE.Scene();
const explorer = { planetKey: 'moon', scene, landingPad: { position: { x: 0, z: -650 } }, isActive: true, shipGroup: new THREE.Group() };

for (const key of ['moon', 'mars', 'mercury', 'venus', 'jupiter']) {
  const planet = JSON.parse(fs.readFileSync(`../data/planets/${key}.json`, 'utf8'));
  explorer.planetKey = key;
  const expected = RD.surfaceResources(planet).length;
  const deposits = RD.build(explorer, planet);
  assert.equal(deposits.length, expected * 5, `${key}: 5 depósitos por recurso de superficie`);
  for (const d of deposits) {
    assert.ok(d.name && d.source_url, `${key}: cada depósito con nombre y fuente`);
    assert.ok([d.position.x, d.position.y, d.position.z].every(Number.isFinite), `${key}: posición finita`);
    assert.ok(Math.hypot(d.position.x, d.position.z + 650) > 200, `${key}: lejos de la plataforma`);
  }
  if (key === 'jupiter') assert.equal(deposits.length, 0, 'Júpiter no tiene suelo: nada tirado');
  if (key === 'moon') assert.ok(deposits.some((d) => d.id === 'water-ice'), 'la Luna muestra hielo de agua');
  RD.dispose();
  assert.equal(scene.children.length, 0, `${key}: se limpian al salir`);
}
const moon = JSON.parse(fs.readFileSync('../data/planets/moon.json', 'utf8'));
explorer.planetKey = 'moon'; RD.build(explorer, moon);
const n = RD.nearest(RD.list[0].position, 5);
assert.ok(n && n.deposit.id === RD.list[0].id, 'nearest encuentra el depósito más cercano');
console.log('PASS: depósitos reales por planeta con nombre y fuente, nada en gigantes gaseosos y limpieza al salir.');
