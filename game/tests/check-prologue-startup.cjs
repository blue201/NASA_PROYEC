const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/cinematic/cinematic-slides.js', 'utf8');

function boot(search = '', saved = {}, blocked = false, deferred = false) {
  const callbacks = [];
  const storage = new Map(Object.entries(saved));
  const document = { readyState: 'loading', addEventListener(event, callback) {
    if (event === 'DOMContentLoaded') callbacks.push(callback);
  } };
  const tracks = [];
  let stopped = 0, resumed = 0;
  const window = { location: { search }, AudioMix: { levels: { music: 0.4 } }, spaceAudio: {
    _musicWanted: true,
    stopOrchestralSoundtrack() { stopped++; },
    startOrchestralSoundtrack() { resumed++; }
  } };
  if (deferred) window.StartMenu = { awaitingChoice: true };
  vm.runInNewContext(source, { window, document, URLSearchParams,
    Audio: class {
      constructor(src) { this.src = src; tracks.push(this); }
      play() { this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; }
    },
    localStorage: {
      getItem(k) { if (blocked) throw Error('blocked'); return storage.get(k); },
      setItem(k, v) { if (blocked) throw Error('blocked'); storage.set(k, v); }
    }
  });
  let shown = 0;
  const proto = window.CinematicStorySlides.Class.prototype;
  proto.setupDOM = function () { this.modal = { style: {}, querySelector() { return null; } }; };
  proto.bindEvents = function () {};
  proto.showSlide = function () { shown++; };
  callbacks.forEach(fn => fn());
  return { window, storage, callbacks, tracks, get stopped() { return stopped; }, get resumed() { return resumed; }, get shown() { return shown; } };
}

const first = boot();
const deferred = boot('', {}, false, true);
assert.equal(deferred.shown, 0, 'the start menu defers the prologue');
deferred.window.StartMenu.awaitingChoice = false;
deferred.window.CinematicStorySlides.autoLaunch();
assert.equal(deferred.shown, 1, 'a new mission can start its prologue after choosing');
assert.equal(first.shown, 1);
assert.equal(first.window.cinematicSlides.slides.length, 15);
assert.match(first.window.cinematicSlides.slides[0].title, /ARCHIVO 01/);
assert.match(first.window.cinematicSlides.slides[14].title, /ARCHIVO 15/);
for (const slide of first.window.cinematicSlides.slides) assert(fs.existsSync(slide.imageSrc));
assert(fs.existsSync(first.tracks[0].src));
assert.equal(first.tracks[0].volume, 0.4);
assert.equal(first.tracks[0].loop, true);
assert.equal(first.stopped, 1);
first.callbacks.forEach(fn => fn());
first.window.CinematicStorySlides.openPrologue();
assert.equal(first.shown, 1, 'duplicate startup or open does not reset the active presentation');
assert.equal(first.tracks.length, 1, 'repeated opens retain one soundtrack');
first.window.AudioMix.levels.music = 0;
first.window.cinematicSlides.syncPrologueMusic();
assert.equal(first.tracks[0].volume, 0);
first.window.cinematicSlides.stopPrologueMusic();
assert.equal(first.tracks[0].paused, true);
assert.equal(first.resumed, 1);
assert.equal(first.window.spaceAudio._musicWanted, true);
first.window.cinematicSlides.isPlaying = false;
first.window.CinematicStorySlides.openPrologue();
assert.equal(first.shown, 2, 'explicit replay still works after closing');
assert.equal(boot('', Object.fromEntries(first.storage)).shown, 0);
assert.equal(boot('', { odyssey_first_prologue_seen_v1: 'seen' }).shown, 1, 'legacy seven-slide intro does not hide the restored introduction');
assert.equal(boot('', { odyssey_prologue_v3_15slides: 'seen' }).shown, 0);
assert.equal(boot('?prologue', Object.fromEntries(first.storage)).shown, 1);
assert.equal(boot('?epilogue').shown, 1);
assert.equal(boot('?epilogue').tracks.length, 0, 'epilogue does not play the prologue theme');
assert.equal(boot('?nasa').shown, 0);
assert.equal(boot('', {}, true).shown, 1, 'unavailable storage does not duplicate startup');

const main = fs.readFileSync('js/core/main.js', 'utf8');
assert(!/setTimeout\([^\n]*openPrologue/.test(main), 'main must not schedule another prologue');
const story = fs.readFileSync('js/cinematic/story-system.js', 'utf8');
const trigger = story.slice(story.indexOf('    triggerPrologue() {'), story.indexOf('    // EVENTO:', story.indexOf('    triggerPrologue() {')));
assert(trigger.includes('CinematicStorySlides?.openPrologue()'));
assert(!trigger.includes('queueSequence'), 'old radio prologue is removed');
console.log('PASS: one startup, no active restart, legacy saves, replay, URL modes and blocked storage.');
