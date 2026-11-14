const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const THREE=require('../assets/vendor/three-r128.min.js');const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',value:0});return nodes.get(id);};
const state={supplies:50,fuel:50,oxygen:90,hull:100,operational:true,save(){},repair(){}};
const window={ExpeditionSystems:{state},dispatchEvent(){}};const context={window,THREE,navigator:{getGamepads:()=>[]},document:{hidden:false,getElementById:node,createElement:()=>({}),body:{append(){}}},CustomEvent:class{},setTimeout:()=>1,clearTimeout(){},Math};
for(const file of ['flight/navigation-physics.js','flight/cruise-systems.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),context);
const e={isActive:true,landmarks:[{id:'earth'}],scene:new THREE.Scene(),shipGroup:new THREE.Group(),colliders:[],keys:{KeyJ:true},cameraYaw:0,cameraPitch:0,linearVelocity:{x:0,y:0,z:0}};
window.CruiseSystems.update(e,.1);assert.equal(e.scene.children.length,0);assert.equal(e._shots,undefined);
const c=window.CruiseSystems;for(let i=0;i<30;i++){c.redistribute(i%3,i%2?1:-1);assert.equal(Object.values(c.reactor).reduce((a,b)=>a+b),8);assert.ok(Object.values(c.reactor).every(v=>v>=0&&v<=6));}
c.reactor.grv=2;c.reactor.eng=4;c.reactor.shd=2;c.requestJump(e,'earth');assert.ok(e.jumpCharge);let arrived=false;e.warpJumpToLandmark=()=>arrived=true;for(let i=0;i<61;i++)c.update(e,.1);assert.ok(arrived);assert.equal(state.fuel,47);
const n=window.NavigationPhysics;assert.ok(n.turnAuthority(130,260)>n.turnAuthority(0,260)*2);assert.ok(n.turnAuthority(130,260)>n.turnAuthority(260,260)*2);
function sim(fps){let v={x:0,y:0,z:0};for(let i=0;i<fps*2;i++)v=n.forceStep(v,{x:0,y:0,z:-50},1/fps);return v.z;}assert.ok(Math.abs(sim(30)-sim(144))<1e-8);
assert.equal(n.forceStep({x:10,y:0,z:-20},{x:0,y:0,z:0},.1,{drag:0}).x,10);
assert.ok(n.forceStep({x:10,y:0,z:0},{x:0,y:0,z:0},.1,{brake:true}).x<10);
console.log('PASS: no shooting, conserved reactor budget, powered jump/fuel cost, turn sweet spot, force integration 30/144Hz, cruise conservation and gradual braking.');
