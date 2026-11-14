const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), THREE = { ...require('../assets/vendor/three-r128.min.js') };
// Lightweight stand-ins for GLB decoding; real asset files are checked separately.
THREE.GLTFLoader = class { load(url, done) { const scene = new THREE.Group(); scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial())); done({ scene, animations: [] }); } };
THREE.SkeletonUtils = { clone: root => root.clone(true) };
const window = {}, context = { window, THREE, document: {} };
for (const name of ['world/earth-regions', 'world/surface-explorer', 'fauna/cretaceous-fauna', 'fauna/earth-fauna-catalog', 'fauna/earth-assets', 'fauna/living-earth']) vm.runInNewContext(fs.readFileSync('js/' + name + '.js', 'utf8'), context);
(async () => {
  const engine = { scene: new THREE.Scene(), shipGroup: new THREE.Group(), rockBodies: [] };
  const world = new window.LivingEarth(engine, window.SurfaceNavigation.heightAt, true);
  await world.ready;
  assert.equal(world.assetErrors, 0);
  const species = new Set(world.animals.map(a => a.species));
  assert.equal(species.size, 14, 'all fourteen species assigned: ' + species.size);
  assert(world.animals.every(a => a.type === 'dinosaur'));
  assert(world.animals.length > 60, 'herds, not a token pair');
  for (let n = 0; n < 20; n++) world.update(.1);
  assert(world.animals.every(a => a.g.position.toArray().every(Number.isFinite)));
  world.dispose();
  console.log(`PASS: all 14 GLB dinosaur species present in a ${world.animals.length}-individual Cretaceous population, no rejected builds, finite positions.`);
})().catch(e => { console.error(e); process.exitCode = 1; });
