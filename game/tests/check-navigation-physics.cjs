const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/flight/navigation-physics.js'),'utf8'),{window});
const {sweep,vertical}=window.NavigationPhysics;
const bodies=[{center:{x:0,y:0,z:0},radius:10,name:'planeta'}];
let r=sweep({x:0,y:0,z:100},{x:0,y:0,z:-100},bodies,2);
assert.equal(r.hit.name,'planeta');assert.ok(r.position.z>=12); // Both endpoints outside: no tunnelling.
r=sweep({x:20,y:0,z:100},{x:20,y:0,z:-100},bodies,2);assert.equal(r.hit,null);
r=sweep({x:0,y:0,z:0},{x:0,y:0,z:0},bodies,2);assert.ok(Math.hypot(r.position.x,r.position.y,r.position.z)>12);
r=sweep({x:0,y:0,z:12.05},{x:0,y:0,z:100},bodies,2);assert.equal(r.hit,null);
r=sweep({x:0,y:0,z:100},{x:0,y:0,z:-100},[{center:{x:0,y:0,z:50},radius:4,name:'cercano'},...bodies],2);assert.equal(r.hit.name,'cercano');
for(const fps of [30,60,144]){
 let speed=0,height=0;
 for(let n=0;n<fps;n++){speed=vertical(speed,{ArrowUp:true},1/fps);height+=speed/fps;}
 assert.ok(height>75&&height<82);assert.ok(speed>89);
 speed=vertical(0,{KeyE:true},.1);assert.ok(speed<0);
 assert.equal(vertical(0,{KeyQ:true,KeyE:true},.1),0);
 assert.ok(vertical(90,{},.1)<90);
}
console.log('PASS: vertical thrust from rest, arrows/Q/E, opposite inputs, damping, multiple frame rates, swept collisions, grazing, embedded recovery, departure and earliest body.');
