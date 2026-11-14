const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const window={},document={getElementById(){return null;}};
for(const file of ['flight/navigation-physics.js','world/expedition-systems.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),{window,document});
const p=window.NavigationPhysics,forward={x:0,y:0,z:-1};
const v=p.assist({x:80,y:30,z:100},forward,.1);
assert.equal(v.z,100);assert(v.x<80&&v.x>0);assert(v.y<30&&v.y>0);
let one={x:80,y:30,z:-100},two={...one};
for(let i=0;i<30;i++)one=p.assist(one,forward,1/30);
for(let i=0;i<144;i++)two=p.assist(two,forward,1/144);
assert(Math.abs(one.x-two.x)<1e-9);
const center={x:0,y:0,z:0};assert(Math.abs(p.gravity({x:2000,y:0,z:0},center,110).force.x)===0);
assert(p.gravity({x:300,y:0,z:0},center,110).force.x<0);
assert(p.gravity({x:117,y:0,z:0},center,110).captured);
assert(Number.isFinite(p.gravity(center,center,110).force.x));
const s=new window.ExpeditionSystems.ExpeditionState();s.tick(.1);assert(s.water<100&&s.food<100&&s.supplies===100&&s.oxygen<100&&s.fuel<100);
s.resupply();s.water=0;s.tick(.1);assert(s.hull<100);
s.oxygen=.001;s.tick(.1);assert.equal(s.oxygen,0);assert.equal(s.operational,false);assert.equal(s.scan(),false);
console.log('PASS: frame-independent lateral flight assist preserves reverse inertia; black-hole attraction/capture boundaries and finite center; water exhaustion damages life support and blocks scanning on failure.');

