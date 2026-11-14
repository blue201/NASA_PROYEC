const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');const window={};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/flight/navigation-physics.js'),'utf8'),{window});const step=window.NavigationPhysics.velocityStep;
function simulate(fps){let v={x:0,y:0,z:0};for(let i=0;i<fps*2;i++)v=step(v,{x:30,y:60,z:-100},1/fps);return v;}
const reference=simulate(60);for(const fps of [30,144])for(const axis of ['x','y','z'])assert.ok(Math.abs(simulate(fps)[axis]-reference[axis])<1e-8);
const drift=step({x:0,y:0,z:-100},{x:100,y:0,z:0},.1,{drift:true});assert.equal(drift.z,-100);assert.equal(drift.x,0);
const lateral=step(drift,{x:0,y:0,z:0},.1,{drift:true,impulse:{x:60,y:0,z:0}});assert.equal(lateral.x,6);assert.equal(lateral.z,-100);
const resumed=step(drift,{x:100,y:0,z:0},.1);assert.ok(resumed.x>0&&resumed.z>-100&&resumed.z<0);
const exhausted=step(drift,drift,.1,{operational:false});assert.equal(exhausted.z,0);
console.log('PASS: rate-independent inertia at 30/60/144Hz, conserved drift, lateral thrust while drifting, smooth assisted turn and no propulsion without vital resources.');
