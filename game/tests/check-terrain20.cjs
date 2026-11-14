const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),THREE=require('../assets/vendor/three-r128.min.js');
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/flight/landing-game.js'),'utf8'),{window,THREE});
for(const key of ['moon','mercury','mars','earth','venus']){
 const e=Object.create(window.PlanetaryLandingEngine.prototype);Object.assign(e,{scene:new THREE.Scene(),planetKey:key,planetData:{skyColor:0x785044},obstacles:[]});
 e.buildPlanetaryCanyon();const airless=['moon','mercury'].includes(key);assert.equal(e.scene.fog===null,airless);assert.equal(e.canyonDustMesh.geometry.attributes.position.count===0,airless);assert.equal(e.spiresGroup.children.length,0);
 e.spawnCanyonObstacle();assert(e.obstacles.length===1);if(airless)assert.equal(e.obstacles[0].mesh.geometry.type,'DodecahedronGeometry');
 assert(e.canyonFloor.geometry.attributes.position.array.every(Number.isFinite));
}
console.log('PASS: all five landing terrains build; Moon/Mercury have no atmospheric fog, floating snow or spires, use boulders and finite crater terrain.');
