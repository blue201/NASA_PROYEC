const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), THREE = require('../assets/vendor/three-r128.min.js');
const window = {}, context = { window, THREE, document: {} };
for (const f of ['world/earth-regions', 'world/surface-explorer', 'fauna/cretaceous-fauna', 'fauna/earth-fauna-catalog', 'fauna/living-earth']) vm.runInNewContext(fs.readFileSync('js/' + f + '.js', 'utf8'), context);

const catalog = window.EarthFaunaCatalog.catalog;
assert(catalog.length >= 30, 'at least 30 asset-backed species');
assert.equal(new Set(catalog.map(s => s.name)).size, catalog.length, 'unique names');
for (const h of ['Pradera', 'Selva', 'Desierto', 'Glaciar', 'Costa', 'Océano']) assert(catalog.some(s => s.habitat === h), h);
for (const s of catalog) {
  assert(s.asset === undefined, 'catalog entries carry metadata, not geometry');
  assert(fs.existsSync(s.path || 'assets/models/wildlife/' + s.file + '.glb'), s.name + ' model exists');
}

const e = { scene: new THREE.Scene(), shipGroup: new THREE.Group(), rockBodies: [] };
const w = new window.LivingEarth(e, window.SurfaceNavigation.heightAt);
assert(w.animals.length >= 180, 'rich population: ' + w.animals.length);
assert(!w.animals.some(a => a.procedural), 'no procedural fauna');
assert(w.animals.every(a => a.asset && a.asset.file), 'every animal has a GLB asset');

const species = new Set(w.animals.map(a => a.species));
assert(species.size >= 36, 'most species found a valid habitat: ' + species.size);
for (const a of w.animals) {
  const h = window.SurfaceNavigation.heightAt(a.x, a.z, 'earth');
  const b = window.EarthRegions.habitat(a.x, a.z, h);
  assert.equal(b, a.habitat, a.species + ' habitat');
  assert(!window.EarthRegions.cityAt(a.x, a.z, 100), a.species + ' outside city');
}

for (let i = 0; i < 300; i++) w.update(1 / 30);
for (const a of w.animals) assert(a.g.position.toArray().every(Number.isFinite), a.species + ' finite');

const ancient = new window.LivingEarth(e, window.SurfaceNavigation.heightAt, true);
assert(ancient.animals.length > 60, 'Cretaceous herds');
assert(ancient.animals.every(a => a.type === 'dinosaur'), 'only dinosaurs in the Cretaceous');
assert(!ancient.animals.some(a => a.procedural), 'no procedural dinosaurs');
ancient.dispose();
w.dispose();
assert.equal(e.scene.children.length, 0);
console.log(`PASS: ${catalog.length} asset-backed Earth species, ${species.size} placed in their own biomes (${w.animals.length} individuals), finite animation, GLB-only fauna, cleanup.`);
