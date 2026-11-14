const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), THREE = require('../assets/vendor/three-r128.min.js');
const window = {};
for (const f of ['world/earth-regions', 'fauna/earth-fauna-catalog']) vm.runInNewContext(fs.readFileSync('js/' + f + '.js', 'utf8'), { window, THREE });
const ocean = window.EarthFaunaCatalog.catalog.filter(s => s.habitat === 'Océano');
assert(ocean.length >= 8, 'varied ocean roster: ' + ocean.length);
for (const type of ['dolphin', 'whale', 'shark', 'fish']) assert(ocean.some(s => s.type === type), type + ' present');
assert(ocean.filter(s => s.type === 'fish').length >= 4, 'several schooling fish');
assert(new Set(ocean.map(s => s.file)).size >= 7, 'distinct GLB meshes');
for (const s of ocean) {
  assert(s.aquatic, s.name + ' marked aquatic');
  assert(fs.existsSync(s.path || 'assets/models/wildlife/' + s.file + '.glb'), s.name + ' asset exists');
}
console.log(`PASS: ${ocean.length} ocean species with dolphins, whales, sharks and ${ocean.filter(s => s.type === 'fish').length} fish schools, all GLB-backed.`);
