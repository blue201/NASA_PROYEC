const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const project = path.join(__dirname, '..');const THREE=require('../assets/vendor/three-r128.min.js');
class Vec {
  constructor(x=0,y=0,z=0) { Object.assign(this,{x,y,z}); }
  set(x,y,z) { Object.assign(this,{x,y,z}); return this; }
  copy(v) { return this.set(v.x,v.y,v.z); }
  lerpVectors(a,b,t) { return this.set(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t); }
}
const sandbox = { window:{}, NASA_PLANETARY_DATABASE:{ earth:{ rotationPeriodHours:24 } },
  THREE };
vm.runInNewContext(fs.readFileSync(path.join(project,'js/world/planet-viewer.js'),'utf8'),sandbox);
const proto = sandbox.window.PlanetViewer.prototype;
const mesh = () => ({rotation:{x:0,y:0,z:0},position:new Vec(),scale:new THREE.Vector3(1,1,1),lookAt() {}});
function make(fps, cinematic = false) {
  const state = { isPaused:false, currentPlanetKey:'earth', dragVelocityX:0, dragVelocityY:0,
    isDirectDragging:false, planetContainer:new THREE.Object3D(),rotatePlanet:proto.rotatePlanet, cloudsMesh:mesh(), cloudShadowMesh:mesh(), ringsMesh:mesh(),
    asteroidDustMesh:mesh(), accretionDiskMesh:mesh(), photonRingMesh:mesh(),
    moons:[{angle:0,speed:0.01,distance:5,inclination:0.1,spinSpeed:0.02,mesh:mesh()}],
    orbitingAsteroids:[{angle:0,speed:0.02,distance:7,inclination:0.2,rotX:0.01,rotY:0.02,rotZ:0.03,mesh:mesh()}],
    activeDrones:[{angle:0,speed:0.03,distance:8,inclination:0.1,group:mesh()}],
    orbitalShipAngle:0, orbitalShipRadius:13, orbitalTime:0,
    clock:{running:true, stops:0, starts:0, getDelta:()=>1/fps,
      stop() {this.stops++;this.running=false;},start() {this.starts++;this.running=true;}},
    isCinematicTourActive:cinematic,cinematicWaypoints:null,currentWaypointIdx:0,cinematicTime:0,
    camera:{quaternion:new THREE.Quaternion(),position:new Vec(),fov:45,lookAt(){},updateProjectionMatrix(){}},
    renderer:{render(){}},scene:{},controls:null,
    updateCinematicTour:proto.updateCinematicTour };
  state.orbitalShip={mesh:mesh(),update(delta){state.orbitalTime+=delta;}};
  return state;
}
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
function run(fps,seconds,cinematic=false,drag=false) {
  const s=make(fps,cinematic);
  if(drag) {s.dragVelocityX=0.1;s.dragVelocityY=0.05;}
  for(let n=0;n<fps*seconds;n++) proto.update.call(s);
  return s;
}
const reference=run(60,2);
for(const fps of [30,144]) {
  const s=run(fps,2);
  for(const [object,axis] of [['planetContainer','y'],['cloudsMesh','y'],['ringsMesh','z'],
    ['asteroidDustMesh','y'],['accretionDiskMesh','z'],['photonRingMesh','z']]) {
    close(s[object].rotation[axis],reference[object].rotation[axis]);
  }
  close(s.moons[0].angle,reference.moons[0].angle);
  close(s.moons[0].mesh.position.x,reference.moons[0].mesh.position.x);
  close(s.orbitingAsteroids[0].angle,reference.orbitingAsteroids[0].angle);
  close(s.orbitingAsteroids[0].mesh.rotation.z,reference.orbitingAsteroids[0].mesh.rotation.z);
  close(s.activeDrones[0].angle,reference.activeDrones[0].angle);
  close(s.orbitalShipAngle,reference.orbitalShipAngle);
  close(s.orbitalTime,2);
}
const drag=run(60,1,false,true);
for(const fps of [30,144]) {
  const s=run(fps,1,false,true);
  close(s.dragVelocityX,drag.dragVelocityX);
  close(s.planetContainer.rotation.x,drag.planetContainer.rotation.x);
  close(s.planetContainer.rotation.y,drag.planetContainer.rotation.y);
}
const tour=run(60,40,true);
for(const fps of [30,144]) {
  const s=run(fps,40,true);
  assert.equal(s.currentWaypointIdx,tour.currentWaypointIdx);
  close(s.cinematicTime,tour.cinematicTime);
  close(s.camera.position.x,tour.camera.position.x);
  close(s.camera.position.y,tour.camera.position.y);
}
const paused=make(60);
proto.pause.call(paused);proto.update.call(paused);
close(paused.planetContainer.rotation.y,0);
assert.equal(paused.clock.stops,1);
proto.resume.call(paused);proto.update.call(paused);
assert.equal(paused.clock.starts,1);
assert.ok(paused.planetContainer.rotation.y>0);

for(const [file,name,method] of [['flight/flight-game.js','FlightGameEngine','updateDestinationRotation'],
  ['world/space-explorer.js','SpaceExplorationEngine','updateLandmarkAnimations']]) {
  const local={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(project,'js',file),'utf8'),local);
  const results=[];
  for(const fps of [30,60,144]) {
    const s={destinationPlanetMesh:mesh(),destinationCloudsMesh:mesh(),destinationRingsMesh:mesh(),
      destinationAccretionDiskMesh:mesh(),landmarks:[{meshGroup:{userData:{disk:mesh(),galaxy:mesh()}}}]};
    for(let n=0;n<fps*2;n++) local.window[name].prototype[method].call(s,1/fps);
    results.push([s.destinationPlanetMesh.rotation.y,s.destinationCloudsMesh.rotation.y,
      s.destinationRingsMesh.rotation.z,s.destinationAccretionDiskMesh.rotation.z,
      s.landmarks[0].meshGroup.userData.disk.rotation.z,s.landmarks[0].meshGroup.userData.galaxy.rotation.z]);
  }
  results[0].forEach((value,index)=>{close(value,results[1][index]);close(value,results[2][index]);});
}
console.log('PASS: production animation methods at simulated 30/60/144 FPS, drag damping, complete cinematic cycle, orbital timing, pause/resume clocks and ambient rotation. Not a measured FPS benchmark.');
