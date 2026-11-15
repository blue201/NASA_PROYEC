const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/cinematic/cinematic-slides.js', 'utf8');

function boot(search = '', saved = {}, blocked = false) {
  const callbacks = [];
  const storage = new Map(Object.entries(saved));
  const document = { readyState: 'loading', addEventListener(event, callback) {
    if (event === 'DOMContentLoaded') callbacks.push(callback);
  } };
  const window = { location: { search } };
  vm.runInNewContext(source, { window, document, URLSearchParams,
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
  return { window, storage, callbacks, get shown() { return shown; } };
}

const first = boot();
assert.equal(first.shown, 1);
first.callbacks.forEach(fn => fn());
first.window.CinematicStorySlides.openPrologue();
assert.equal(first.shown, 1, 'duplicate startup or open does not reset the active presentation');
first.window.cinematicSlides.isPlaying = false;
first.window.CinematicStorySlides.openPrologue();
assert.equal(first.shown, 2, 'explicit replay still works after closing');
assert.equal(boot('', Object.fromEntries(first.storage)).shown, 0);
assert.equal(boot('', { odyssey_first_prologue_seen_v1: 'seen' }).shown, 0);
assert.equal(boot('?prologue', Object.fromEntries(first.storage)).shown, 1);
assert.equal(boot('?epilogue').shown, 1);
assert.equal(boot('?nasa').shown, 0);
assert.equal(boot('', {}, true).shown, 1, 'unavailable storage does not duplicate startup');

const main = fs.readFileSync('js/core/main.js', 'utf8');
assert(!/setTimeout\([^\n]*openPrologue/.test(main), 'main must not schedule another prologue');
const story = fs.readFileSync('js/cinematic/story-system.js', 'utf8');
const trigger = story.slice(story.indexOf('    triggerPrologue() {'), story.indexOf('    // EVENTO:', story.indexOf('    triggerPrologue() {')));
assert(trigger.includes('CinematicStorySlides?.openPrologue()'));
assert(!trigger.includes('queueSequence'), 'old radio prologue is removed');
console.log('PASS: one startup, no active restart, legacy saves, replay, URL modes and blocked storage.');
