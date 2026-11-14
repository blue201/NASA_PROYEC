const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const elements=new Map();let time=0;
function element(id){if(!elements.has(id))elements.set(id,{value:'',open:false,hidden:false,addEventListener(){},focus(){},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);}
const saved=new Map();
const context={window:{addEventListener(){}},document:{getElementById:element},performance:{now:()=>time},console,
 localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},setInterval:()=>1,clearInterval(){}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/flight/mission-challenges.js'),'utf8'),context);
const rules=context.window.MissionChallengeRules;
assert.equal(rules.parseAnswer('1,5'),1.5);assert.ok(Number.isNaN(rules.parseAnswer('1+2')));
async function run(){
 const c=new context.window.MissionChallenges();
 for(const [planet,penalty] of [['earth',10],['moon',20],['mars',30]]){
  const initial=c.record.penaltySeconds;
  const pending=c.request('drones',planet);
  assert.equal(await c.request('travel',planet),false);
  c.input.value=String(c.question.answer+1);c.submit();
  assert.equal(c.record.penaltySeconds,initial+penalty);
  c.submit();assert.equal(c.record.penaltySeconds,initial+penalty);
  c.beginAttempt();time+=40000;c.tick();c.tick();
  assert.equal(c.record.penaltySeconds,initial+penalty*2);
  c.beginAttempt();c.input.value=String(c.question.answer);c.submit();
  assert.equal(await pending,true);assert.equal(c.active,false);
 }
 const pending=c.request('travel','moon');c.finish(false);assert.equal(await pending,false);
 const restored=new context.window.MissionChallenges();assert.equal(restored.record.penaltySeconds,120);assert.equal(restored.record.solved,3);
 const expired=c.request('travel','earth');time+=40000;c.input.value=String(c.question.answer);c.submit();assert.equal(c.awaitingRetry,true);c.finish(false);assert.equal(await expired,false);
 const bonusBefore=c.record.penaltySeconds;const bonus=c.request('bonus','earth');c.input.value=String(c.question.answer+1);c.submit();assert.equal(c.record.penaltySeconds,bonusBefore);c.beginAttempt();c.input.value=String(c.question.answer);c.submit();assert.equal(await bonus,true);const cancelled=c.request('bonus','moon');c.finish(false);assert.equal(await cancelled,false);assert.equal(c.record.penaltySeconds,bonusBefore);
 console.log('PASS: timed authorization, 10/20/30 penalties, timeout boundary, repeat suppression, cancellation, retries and persistence.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
