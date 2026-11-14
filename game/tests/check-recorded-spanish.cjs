const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const window={speechSynthesis:{getVoices:()=>[],cancel(){}},spaceAudio:{duckMusic(){}}},status={};
class Audio {constructor(url){this.url=url;}play(){return Promise.resolve();}pause(){this.paused=true;}}
const context={window,Audio,document:{addEventListener(){},getElementById:()=>status}};
vm.createContext(context);
for(const file of ['core/spanish-audio-data.js','core/spanish-voices.js','jarvis/planet-narrator.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),context);
assert.ok(window.SpanishAudioClips.length>30);
for(const clip of window.SpanishAudioClips){
 assert.match(clip.url,/^assets\/audio-es\/[a-f0-9]+\.wav$/);
 const wav=fs.readFileSync(path.join(__dirname,'..',clip.url));
 assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.ok(wav.length>1000);
 let peak=0;for(let i=44;i+1<wav.length;i+=2)peak=Math.max(peak,Math.abs(wav.readInt16LE(i)));assert.ok(peak>500);
}
const sample=window.SpanishAudioClips.find(row=>row.role==='narrator');
assert.equal(window.planetNarrator.speak(sample.text),true);assert.match(status.textContent,/incorporada/);assert.equal(window.planetNarrator.audio.url,sample.url);
window.planetNarrator.audio.onended();assert.equal(window.planetNarrator.isSpeaking,false);
window.planetNarrator.speak(sample.text);const active=window.planetNarrator.audio;window.planetNarrator.stop();assert.equal(active.paused,true);assert.equal(active.onended,null);
const fallback=window.SpanishVoices.clip('Una frase dinámica no grabada.','sofia');assert.equal(fallback.role,'sofia');assert.equal(fallback.fallback,true);
assert.equal(window.SpanishVoices.clip('Texto científico sin grabar.','narrator',false),null);
console.log('PASS: Spanish recordings exist, valid non-silent WAV files, playback without installed voices, end/stop and transparent role fallback.');
