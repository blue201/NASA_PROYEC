const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/flight/ship-controller.js'),'utf8'),sandbox);
const Controller = sandbox.window.ArwingShipController;
let emitted = 0, particles = 0, debris = 0;
const state = {isStrandedOffline:true,isDerelict:true,
  position:{x:0,y:0,z:0,addScaledVector(v,d){this.x+=v.x*d;this.y+=v.y*d;this.z+=v.z*d;}},
  driftVelocity:{x:1,y:2,z:3},driftRotSpeed:{x:0.1,y:0.2,z:0.3},
  shipGroup:{position:{copy(){}},rotation:{x:0,y:0,z:0}},arwingModel:null,
  emitDamageParticles(){emitted++;},updateParticles(){particles++;},updateDerelictDebris(){debris++;}
};
assert.equal(typeof Controller.prototype.emitDamageParticles,'function');
for(let n=0;n<60;n++) Controller.prototype.update.call(state,1/60);
assert.equal(emitted,60);assert.equal(particles,60);assert.equal(debris,60);
assert.ok(Math.abs(state.position.z-3)<1e-9);
assert.ok(Math.abs(state.shipGroup.rotation.z-0.3)<1e-9);
console.log('PASS: damaged stranded ship advances drift, smoke/sparks and debris without calling a missing method.');
