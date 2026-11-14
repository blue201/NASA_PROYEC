const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
class Vec {
  constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}
  clone(){return new Vec(this.x,this.y,this.z);}
  copy(v){Object.assign(this,{x:v.x,y:v.y,z:v.z});return this;}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
  multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
  normalize(){return this.multiplyScalar(1/(Math.hypot(this.x,this.y,this.z)||1));}
  lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this;}
  lerpVectors(a,b,t){return this.copy(a).lerp(b,t);}
  applyQuaternion(){return this;}
}
const classes=new Set(),window={matchMedia:()=>({matches:false})};
const context={window,THREE:{Vector3:Vec},document:{getElementById:()=>({style:{}}),body:{classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/world/space-explorer.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/flight/cinema-director.js'),'utf8'),context);
const proto=window.SpaceExplorationEngine.prototype;
function make(){
 const e=Object.create(proto);Object.assign(e,{isActive:true,landmarks:[{id:'test',position:new Vec(0,0,-100),observationOffset:new Vec(0,10,30)}],
 shipGroup:{position:new Vec(),quaternion:{},rotation:{set(){}}},camera:{aspect:1,position:new Vec(),lookAt(){}},
 renderer:{render(){}},updateLandmarkAnimations(){},updateLandmarkDetection(){this.detected=true;}});return e;
}
const e=make();e.warpJumpToLandmark('missing',true);assert.equal(e.travelShot,undefined);
e.warpJumpToLandmark('test',true);assert.ok(e.travelShot);assert.ok(classes.has('cinematic-shot'));
e.updateTravelShot(2.75);assert.equal(e.shipGroup.position.z,-35);assert.equal(e.travelShot.elapsed,2.75);
// Paused rendering must not advance the travel clock or ship position.
e.clock={getDelta:()=>.1};e.scene={};e.landmarks=[];const before=e.travelShot.elapsed;
e.updatePaused();assert.equal(e.travelShot.elapsed,before);assert.equal(e.shipGroup.position.z,-35);
e.finishTravelShot();assert.equal(e.travelShot,null);assert.equal(e.shipGroup.position.z,-70);assert.equal(e.shipSpeed,0);assert.equal(e.detected,true);assert.equal(classes.size,0);
const auto=make();auto.warpJumpToLandmark('test',true);for(let n=0;n<60 && auto.travelShot;n++)auto.updateTravelShot(.1);
assert.equal(auto.travelShot,null);assert.equal(auto.shipGroup.position.z,-70);
const film=make();film.camera.fov=52;film.camera.updateProjectionMatrix=()=>{};film.shipGroup.visible=false;
film.cinemaShot={focus:new Vec(0,0,-1000),radius:400,elapsed:0,cameraPosition:new Vec(1,2,3),fov:52,shipVisible:true};
film.updateCinema(3);assert.equal(film.cinemaShot.elapsed,3);assert.equal(film.shipGroup.position.z,0);
film.clock={getDelta:()=>.1};film.updatePaused();assert.equal(film.cinemaShot.elapsed,3);
film.finishCinema();assert.equal(film.cinemaShot,null);assert.equal(film.shipGroup.visible,true);assert.equal(film.camera.fov,52);assert.equal(film.camera.position.z,3);
window.matchMedia=()=>({matches:true});const reduced=make();reduced.warpJumpToLandmark('test',true);assert.equal(reduced.travelShot,null);assert.equal(reduced.shipGroup.position.z,-70);
console.log('PASS: cinematic travel interpolation, pause isolation, skip, final pose, automatic completion and reduced-motion alternative. Camera appearance requires browser review.');

