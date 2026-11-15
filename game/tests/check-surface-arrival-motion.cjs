const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),THREE=require('../assets/vendor/three-r128.min.js');const window={},document={getElementById(){return {textContent:''};}};vm.runInNewContext(fs.readFileSync('js/world/surface-explorer.js','utf8'),{window,document,THREE});
for(const fps of [30,60,144]){const e=Object.create(window.PlanetSurfaceExplorer.prototype);e.arrival={time:0,end:new THREE.Vector3(0,180,0),clouded:false};Object.assign(e,{planetKey:'moon',shipGroup:new THREE.Group(),camera:new THREE.PerspectiveCamera(),ship:{update(){}},renderer:{render(){}},clock:{getDelta(){}},clearArrivalGlobe(){}});let previous=Infinity,steps=0;while(e.arrival&&steps++<fps*17){e.updateArrival(1/fps);assert(e.shipGroup.position.y<=previous+.001);assert(e.shipGroup.position.toArray().every(Number.isFinite));previous=e.shipGroup.position.y;}assert.equal(e.arrival,null);assert(e.shipGroup.position.distanceTo(new THREE.Vector3(0,180,0))<.001);}

const loadTexture = THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load = () => new THREE.Texture();
try {
  let pixelRatio = 2;
  const explorer = Object.create(window.PlanetSurfaceExplorer.prototype);
  Object.assign(explorer, {
    planetKey: 'moon', scene: new THREE.Scene(), shipGroup: new THREE.Group(),
    camera: new THREE.PerspectiveCamera(), ship: { update() {} },
    terrain: new THREE.Group(), ecosystem: new THREE.Group(),
    livingEarth: { group: new THREE.Group() }, worldDetails: { group: new THREE.Group() },
    stars: new THREE.Points(), clock: { getDelta() {} },
    renderer: { shadowMap: { autoUpdate: true }, getPixelRatio: () => pixelRatio, setPixelRatio(value) { pixelRatio = value; }, render() {} }
  });
  explorer.scene.background = new THREE.Color();
  explorer.scene.fog = new THREE.FogExp2();
  explorer.beginArrival();
  assert.equal(pixelRatio, 1);
  assert.equal(explorer.renderer.shadowMap.autoUpdate, false);
  explorer.beginArrival();
  for (let frame = 0; explorer.arrival && frame < 1000; frame++) explorer.updateArrival(1 / 60);
  assert.equal(explorer.arrival, null);
  assert.equal(pixelRatio, 2, 'finishing restores the original renderer resolution');
  assert.equal(explorer.renderer.shadowMap.autoUpdate, true);
  explorer.beginArrival();
  explorer.arrival.departure = true;
  explorer.arrival.sky = new THREE.Color();
  explorer.updateDeparture(4);
  assert.equal(explorer.livingEarth.group.visible, false);
  assert.equal(explorer.worldDetails.group.visible, false);
  explorer.clearArrivalGlobe();
  assert.equal(pixelRatio, 2, 'cancelling restores the original renderer resolution');
  assert.equal(explorer.renderer.shadowMap.autoUpdate, true);
  assert.equal(explorer.livingEarth.group.visible, true);
  assert.equal(explorer.worldDetails.group.visible, true);
  let externalTrips = 0;
  explorer.ancientEarth = true;
  explorer.showCretaceousTravel = () => { externalTrips++; };
  explorer.beginArrival({ departure: true });
  assert.equal(externalTrips, 0, 'departure does not replay the incoming trip');
  explorer.beginArrival();
  assert.equal(externalTrips, 1, 'ancient Earth entry opens the requested animation');
  explorer.clearArrivalGlobe();
} finally {
  THREE.TextureLoader.prototype.load = loadTexture;
}
console.log('PASS: finite arrivals at 30/60/144 FPS, bounded transition resolution, repeated entry, restoration and distant-detail culling during departure.');
