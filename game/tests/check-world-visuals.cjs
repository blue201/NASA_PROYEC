const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
class Ring {
  constructor(inner,outer) {
    const points=[[inner,0],[outer,0],[0,inner],[0,outer],[-inner,0],[-outer,0]];
    this.uvs=[];
    this.attributes={position:{count:points.length,getX:i=>points[i][0],getY:i=>points[i][1]},uv:{setXY:(i,u,v)=>this.uvs[i]=[u,v]}};
  }
  rotateX(angle) { this.angle=angle; }
}
const sandbox={window:{}, THREE:{RingGeometry:Ring}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/world/world-visuals.js'),'utf8'),sandbox);
for (const scale of [1,10,70]) {
  const ring=sandbox.window.WorldVisuals.createRings(1.35*scale,2.35*scale);
  ring.uvs.forEach(([u,v],i)=>{
    assert.ok(Math.abs(Math.hypot(u-.5,v-.5)-(i%2 ? .5 : .28))<1e-9);
    assert.ok(u>=0 && u<=1 && v>=0 && v<=1);
  });
  assert.equal(ring.angle,Math.PI/2);
}
// The user now requested restoring the original FBX geometry.
const original={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/core/original-ship-data.js'),'utf8'),original);
assert.equal(original.window.OriginalArwingData.length,3);
for(const part of original.window.OriginalArwingData) {
  assert.ok(part.vertices.every(Number.isFinite));
  assert.ok(part.indices.every(i=>Number.isInteger(i) && i>=0 && i<part.vertices.length/3));
}
const catalog={window:{},console};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/jarvis/nasa-api.js'),'utf8'),catalog);
assert.equal(catalog.window.NASA_PLANETARY_DATABASE.moon.name,'Luna');
assert.equal(catalog.window.NASA_PLANETARY_DATABASE.jupiter.planetTypeDesc,'Gigante gaseoso');
assert.equal(catalog.window.NASA_PLANETARY_DATABASE.pillars_of_creation.planetTypeDesc,'Región de formación estelar');
console.log('PASS: ring mapping, celestial classifications and valid original ship geometry.');
