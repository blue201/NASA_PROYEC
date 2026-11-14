const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const window={},document={getElementById:()=>null};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/world/planet-proximity.js'),'utf8'),{window,document});
let time=0;const spoken=[],selected=[],guide=new window.PlanetProximityGuide({now:()=>time,onTarget:t=>selected.push(t?.planetKey||null),onFact:key=>{spoken.push(key);return true;}});
const bodies=[{planetKey:'earth',radius:10,center:{x:0,y:0,z:0}},{planetKey:'moon',radius:3,center:{x:70,y:0,z:0}}];
assert.equal(guide.update({x:-500,y:0,z:0},bodies),null);guide.update({x:-40,y:0,z:0},bodies);assert.deepEqual(spoken,['earth']);
time=100000;guide.update({x:-40,y:0,z:0},bodies);assert.equal(spoken.length,1,'hovering does not repeat a fact');
guide.update({x:-70,y:0,z:0},bodies);assert.equal(selected.at(-1),'earth','exit hysteresis prevents flicker');
guide.update({x:-500,y:0,z:0},bodies);assert.equal(selected.at(-1),null);guide.update({x:72,y:0,z:0},bodies,{muted:true});assert.equal(selected.at(-1),'moon');assert.equal(spoken.length,1);
guide.update({x:72,y:0,z:0},bodies,{busy:true});assert.equal(spoken.length,1);guide.update({x:72,y:0,z:0},bodies);assert.equal(spoken.at(-1),'moon');
guide.update({x:-500,y:0,z:0},bodies);time+=1000;guide.update({x:72,y:0,z:0},bodies);assert.equal(spoken.length,2,'cooldown prevents repeated approaches');
let facts=0;window.planetNarrator={speak(){facts++;return true;}};window.PlanetCuriosities={mars:'Un dato sobre Marte.'};const engine={progress:81,activePlanetKey:'mars'};window.AutoPlanetFacts.flight(engine);assert.equal(facts,0);engine.progress=82;window.AutoPlanetFacts.flight(engine);window.AutoPlanetFacts.flight(engine);assert.equal(facts,0);
console.log('PASS: planet approach, closest body, hysteresis, one fact per visit, cooldown, mute/busy behavior and no automatic flight-arrival narration.');

