const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const sources=[];
const param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(value){assert.ok(value>0);}});
const node=()=>({gain:param(),frequency:param(),connect(){}});
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/audio/audio.js'),'utf8'),{window});
const audio=window.spaceAudio;audio.ctx={createOscillator(){const osc={...node(),start:t=>{osc.started=t;},stop:t=>{osc.stopped=t;}};sources.push(osc);return osc;},createGain:node,createBiquadFilter:node};audio._soundtrackGain=node();
audio._scheduleEpicRhythm({pad:[110,165,220,330]},10,6.4);
assert.ok(sources.length>=40);for(const source of sources){assert.ok(source.started>=10&&source.stopped>source.started&&source.stopped<17);}
assert.ok(sources.some(s=>s.type==='sawtooth'));assert.ok(sources.some(s=>s.type==='sine'));
sources.length=0;audio._scheduleQuietScore({pad:[110,165,220,330]},20,6.4);
assert.equal(sources.length,6);assert.ok(sources.every(s=>s.type==='triangle'||s.type==='sine'));
for(const source of sources)assert.ok(source.started>=20&&source.stopped>source.started&&source.stopped<27);
console.log('PASS: epic percussion and brass graph, positive frequency ramps, finite scheduled notes and bounded note lifetimes.');

for(const style of ["bright","rock","tension"]){sources.length=0;audio._scheduleTravelRhythm({bass:55,pad:[110,165,220,330]},30,6.4,style);assert.ok(sources.length>20);for(const source of sources)assert.ok(source.started>=30&&source.stopped>source.started&&source.stopped<37);}
console.log("PASS: original pop, rock and tension rhythm graphs have bounded note lifetimes.");
