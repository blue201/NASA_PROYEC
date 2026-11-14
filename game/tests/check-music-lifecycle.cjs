const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const fades=[],timers=[];let intervals=0;
const param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(value){fades.push(value);}});
const node=()=>({gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){this.disconnected=true;}});
class AudioContext{constructor(){this.state='running';this.currentTime=0;this.destination={};}createGain(){return node();}createBiquadFilter(){return node();}}
const window={AudioContext},document={getElementById:()=>null};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/audio/audio.js'),'utf8'),{window,document,setInterval(){intervals++;return intervals;},clearInterval(){},setTimeout:fn=>{timers.push(fn);return timers.length;},console});
const audio=window.spaceAudio;audio._playNextOrchestralChord=()=>{};
audio.startOrchestralSoundtrack();assert.ok(audio.ctx);assert.equal(audio._isSoundtrackPlaying,true);assert.equal(intervals,1);
audio.startOrchestralSoundtrack();assert.equal(intervals,1);
audio.duckMusic(true);assert.equal(fades.at(-1),.025);
assert.equal(audio.toggleMute(),true);assert.equal(fades.at(-1),0);
assert.equal(audio.toggleMute(),false);assert.equal(fades.at(-1),.025);
const first=audio._soundtrackGain;assert.equal(audio.toggleSoundtrack(),false);assert.equal(audio._musicWanted,false);
assert.equal(audio.toggleSoundtrack(),true);const second=audio._soundtrackGain;
timers[0]();assert.equal(first.disconnected,true);assert.notEqual(second.disconnected,true);assert.equal(audio._soundtrackGain,second);
console.log('PASS: initial music context, one loop, narration ducking, mute/unmute, user preference and rapid restart without disconnecting the new soundtrack.');
