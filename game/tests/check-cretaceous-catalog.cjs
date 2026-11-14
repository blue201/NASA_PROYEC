const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), THREE = require('../assets/vendor/three-r128.min.js');
const window = {};
vm.runInNewContext(fs.readFileSync('js/fauna/cretaceous-fauna.js', 'utf8'), { window, THREE });
const lib = window.CretaceousFauna;
assert.equal(lib.catalog.length, 14, 'fourteen real Cretaceous species');
assert.equal(new Set(lib.catalog.map(s => s.name)).size, 14, 'unique names');
assert.equal(typeof lib.build, 'undefined', 'no procedural builders remain');
for (const spec of lib.catalog) {
  assert(spec.file, spec.name + ' uses a downloaded GLB');
  assert(spec.path, spec.name + ' declares its model path explicitly');
  assert(fs.existsSync(spec.path), spec.name + ' model exists');
  assert(!spec.path.includes('wildlife/') || spec.name.includes('Archaeopteryx') || spec.name.includes('Cretoxyrhina'), 'los dinosaurios cargan desde assets/models/cretaceous');
  assert(['land', 'air', 'water'].includes(spec.kind), spec.name + ' kind');
  assert(spec.size > 0 && spec.size < 100, spec.name + ' game-visible size');
}
assert(lib.catalog.some(s => s.kind === 'water'), 'marine Cretaceous animal');
assert(lib.catalog.some(s => s.kind === 'air'), 'flying Cretaceous animal');
assert(lib.catalog.some(s => s.carnivore), 'predators present');
console.log('PASS: 14 unique Cretaceous species, all backed by downloaded GLBs, land/air/water roles and no procedural rigs.');
