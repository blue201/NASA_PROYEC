const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const window={},sources=[],timers=[];
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/audio/audio.js'),'utf8'),{window,document:{getElementById(){return null;}},setTimeout(fn){timers.push(fn);},clearInterval(){}});
const audio=window.spaceAudio;audio.ctx={currentTime:10,createBufferSource(){const source={connect(){},start(){this.started=true;},stop(t){this.stopped=t;},disconnect(){this.disconnected=true;}};sources.push(source);return source;}};
audio._isSoundtrackPlaying=true;audio._scoreMode='bright';audio._customTracks={bright:{duration:60}};audio._soundtrackGain={};
audio._playNextOrchestralChord();audio._playNextOrchestralChord();assert.equal(sources.length,1);assert.equal(sources[0].loop,true);assert.equal(sources[0].buffer.duration,60);
audio._soundtrackGain=null;audio.stopOrchestralSoundtrack();assert.equal(sources[0].stopped,11.25);assert.equal(audio._customTrackNode,null);timers.forEach(fn=>fn());assert.equal(sources[0].disconnected,true);
assert.equal(audio._customTracks.bright.duration,60);
console.log('PASS: one looping source per selected local track, no duplicate source per chord, delayed stop/disconnect and retained in-session track assignment.');
