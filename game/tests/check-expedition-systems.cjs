const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const window={},document={getElementById(){return null;}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/world/expedition-systems.js'),'utf8'),{window,document});
const {ExpeditionState}=window.ExpeditionSystems;
let saved;const storage={getItem(){return saved||null;},setItem(k,v){saved=v;}};
const state=new ExpeditionState(storage);
assert.equal(state.canLand('earth'),false);assert.equal(state.unlock('jupiter'),false);
state.unlock('earth');assert.equal(new ExpeditionState(storage).canLand('earth'),true);
assert.equal(state.scan(),true);assert.equal(state.fuel,98);state.fuel=1;assert.equal(state.scan(),false);
state.hull=50;assert.equal(state.repair(),true);assert.equal(state.hull,80);assert.equal(state.kits,1);
state.repair();assert.equal(state.hull,100);assert.equal(state.repair(),false);
state.resupply();assert.equal(state.operational,true);assert.equal(state.kits,2);
state.tick(.1,{moving:true,boost:true});const normal=100-state.fuel;
state.resupply();state.economy=true;state.tick(.1,{moving:true,boost:true});assert.ok(100-state.fuel<normal);
for(const key of ['fuel','oxygen','hull']){state.resupply();state[key]=0;assert.equal(state.operational,false);assert.equal(state.scan(),false);}
saved=JSON.stringify({unlocked:['fake'],fuel:-1,oxygen:100,hull:100,kits:2});assert.equal(new ExpeditionState(storage).fuel,100);
console.log('PASS: surface lock, valid unlock persistence, gas-giant rejection, scan cost, bounded repairs, resupply, economy and exhaustion of all vital resources.');

state.resupply();state.consumeCrew(.1);assert.ok(state.water<100&&state.food<100);assert.equal(state.supplies,100);state.save();assert.equal(new ExpeditionState(storage).water,state.water);state.water=0;const hull=state.hull;state.consumeCrew(.1);assert.ok(state.hull<hull);state.resupply();state.hull=50;state.supplies=9;assert.equal(state.repair(),false);state.supplies=10;assert.equal(state.repair(),true);assert.equal(state.supplies,0);state.resupply();assert.equal(state.water,100);assert.equal(state.food,100);console.log('PASS: crew consumption, persistence, depletion damage, repair cost and full refill.');
