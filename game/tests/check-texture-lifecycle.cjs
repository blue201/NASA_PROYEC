const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path'), assert=require('node:assert/strict');
const loads=[];
const sandbox={window:{},console,THREE:{TextureLoader:class {
  setCrossOrigin(){}
  load(url,done,progress,error){loads.push({url,done,error});}
}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/world/planet-viewer.js'),'utf8'),sandbox);
const proto=sandbox.window.PlanetViewer.prototype;
const original={};
const state={activePlanetMesh:{material:{map:original}},renderer:{capabilities:{getMaxAnisotropy:()=>4}},showToastNotification(){}};
const texture=()=>({disposed:false,dispose(){this.disposed=true;}});
proto.applyCustomTexture.call(state,'first');
proto.applyCustomTexture.call(state,'second');
const older=texture(); loads[0].done(older);
assert.equal(older.disposed,true);
assert.equal(state.activePlanetMesh.material.map,original);
const current=texture(); loads[1].done(current);
assert.equal(state.activePlanetMesh.material.map,current);
assert.equal(current.anisotropy,4);
proto.applyCustomTexture.call(state,'third');
proto.resetDefaultTexture.call(state);
const afterReset=texture(); loads[2].done(afterReset);
assert.equal(afterReset.disposed,true);
assert.equal(current.disposed,true);
assert.equal(state.activePlanetMesh.material.map,original);
proto.applyCustomTexture.call(state,'fourth');
state.activePlanetMesh={material:{map:{}}};
const wrongPlanet=texture(); loads[3].done(wrongPlanet);
assert.equal(wrongPlanet.disposed,true);
console.log('PASS: out-of-order texture loads, planet switching, reset cancellation, disposal and GPU anisotropy limit.');
