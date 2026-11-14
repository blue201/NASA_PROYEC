const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const spoken=[],ducks=[],status={};let cancelled=0;
const window={speechSynthesis:{cancel(){cancelled++;},getVoices:()=>[{lang:'es-HN'}],speak:u=>spoken.push(u)},spaceAudio:{duckMusic:x=>ducks.push(x)}};
const context={window,document:{addEventListener(){},getElementById:()=>status},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},NASA_PLANETARY_DATABASE:{earth:{name:'Tierra',gravity:'9.81 m/s²',temperature:'15°C',atmosphereComposition:'Nitrógeno y oxígeno'}}};
vm.createContext(context);
for(const name of ['core/spanish-voices.js','jarvis/planet-narrator.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name),'utf8'),context);
const n=window.planetNarrator;assert.equal(n.readPlanet('missing'),false);
n.readPlanet('earth');assert.equal(n.isSpeaking,true);assert.equal(spoken[0].lang,'es-HN');
spoken[0].onend();assert.match(spoken[1].text,/9\.81/); // Do not split decimal numbers into separate utterances.
const stale=spoken[1].onend;n.stop();stale();assert.equal(spoken.length,2);assert.equal(n.isSpeaking,false);
n.speak('Un dato. Otro dato.');spoken.at(-1).onend();spoken.at(-1).onend();assert.equal(n.isSpeaking,false);assert.equal(ducks.at(-1),false);
n.speak('Error.');spoken.at(-1).onerror();assert.equal(n.isSpeaking,false);assert.match(status.textContent,/No se pudo/);
delete window.speechSynthesis;let fallback=null;n.remoteSpeak=text=>{fallback=text;};assert.equal(n.speak('Sin voz'),true);assert.equal(fallback,'Sin voz');
assert.ok(cancelled>0);
console.log('PASS: Spanish voice selection, scientific fields, decimal preservation, completion, stop, stale callbacks, voice failure, unsupported API and music ducking.');
