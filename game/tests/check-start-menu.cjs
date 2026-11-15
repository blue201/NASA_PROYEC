const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function boot(hasSave = true, search = '', withDiary = false) {
  const data = new Map([
    ['odyssey_checkpoint_v1_a', 'guardado'], ['genesis_crew_v1', 'tripulación'],
    ['odyssey_audio_mix', '{"music":0.4}'], ['unrelated-preference', 'conservar']
  ]);
  let failRemoval = false, loads = 0, freshStarts = 0, navigation;
  const storage = {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem(key) {
      if (failRemoval && key === 'genesis_crew_v1') { failRemoval = false; throw Error('blocked'); }
      data.delete(key);
    }
  };
  const document = new EventTarget(), elements = new Map();
  class Element extends EventTarget {
    constructor(tag = 'div') { super(); this.tag = tag; this.children = []; this.classList = { add() {}, remove() {}, toggle() {} }; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    insertBefore(child) { this.children.push(child); }
    setAttribute(key, value) { this[key] = value; }
    querySelector(selector) { return this.children.find(child => child instanceof Element && (selector !== 'summary' || child.tag === 'summary')) || null; }
    scrollIntoView() {}
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; }
    click() { if (!this.disabled) { this.dispatchEvent(new Event('click')); this.onclick?.(); } }
  }
  const html = fs.readFileSync('index.html', 'utf8');
  for (const match of html.matchAll(/id="([^"]+)"/g)) elements.set(match[1], Object.assign(new Element(), { id: match[1] }));
  function find(element, id) {
    if (element.id === id) return element;
    for (const child of element.children || []) { const match = find(child, id); if (match) return match; }
    return null;
  }
  document.getElementById = id => elements.get(id) || [...elements.values()].map(element => find(element, id)).find(Boolean);
  document.createElement = tag => new Element(tag);
  const window = new EventTarget();
  Object.assign(window, { localStorage: storage,
    location: { href: 'http://localhost:8080/' + search, assign(url) { navigation = url; } },
    history: { replaceState(_state, _title, url) { window.location.href = url.toString(); } }
  });
  const audios = [];
  class AudioMock {
    constructor(src) { this.src = src; this.paused = true; this.loop = false; this.volume = 1; audios.push(this); }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const context = { window, document, localStorage: storage, URL, CustomEvent, Audio: AudioMock, setInterval() {}, MutationObserver: class { observe() {} } };
  vm.runInNewContext(fs.readFileSync('js/core/audio-mixer.js', 'utf8'), context);
  vm.runInNewContext(fs.readFileSync('js/ui/start-menu.js', 'utf8'), context);
  if (withDiary) {
    window.ExpeditionSystems = { state: { water: 100, food: 100, save() {} } };
    window.partialPause = { isPaused: false, pause() { this.isPaused = true; } };
    vm.runInNewContext(fs.readFileSync('js/ui/crew-diary.js', 'utf8'), context);
  }
  document.dispatchEvent(new Event('DOMContentLoaded'));
  window.StartMenu.initialize({ hasSave, onLoad() { loads++; }, onFreshStart() { freshStarts++; } });
  return { data, storage, window, document, elements, menu: window.StartMenu,
    audios, get loads() { return loads; }, get freshStarts() { return freshStarts; }, get navigation() { return navigation; },
    failNextRemoval() { failRemoval = true; }
  };
}

const app = boot();
assert.equal(app.menu.isOpen, true);
assert.equal(app.menu.awaitingChoice, true);
assert.equal(app.loads, 0, 'opening the game does not load a mission without a choice');
assert.equal(app.audios[0].src, 'assets/cinematics/prologue-theme.mp3');
assert.equal(app.audios[0].loop, true);
app.elements.get('start-menu-music').click();
assert.equal(app.audios[0].paused, true, 'the menu music control pauses the prologue theme');
app.elements.get('start-menu-music').click();
assert.equal(app.audios[0].paused, false, 'the menu music control resumes the prologue theme');
app.elements.get('start-options').click();
assert.equal(app.elements.get('start-menu-options').hidden, false);
const musicSlider = app.elements.get('start-audio-controls').children[0].children[1];
musicSlider.value = 0;
musicSlider.oninput();
assert.equal(app.window.AudioMix.levels.music, 0);
assert.equal(JSON.parse(app.data.get('odyssey_audio_mix')).music, 0);
app.elements.get('start-options-back').click();
app.elements.get('start-load').click();
assert.equal(app.loads, 1);
assert.equal(app.audios[0].paused, true, 'leaving the menu stops its music');
assert.equal(app.menu.isOpen, false);
assert.equal(app.menu.awaitingChoice, false);

const replacement = boot();
replacement.elements.get('start-new').click();
assert.equal(replacement.elements.get('start-menu-confirmation').hidden, false);
assert(replacement.data.has('odyssey_checkpoint_v1_a'));
replacement.elements.get('start-cancel-new').click();
assert(replacement.data.has('odyssey_checkpoint_v1_a'));
replacement.elements.get('start-new').click();
replacement.elements.get('start-confirm-new').click();
assert.equal(new URL(replacement.navigation).searchParams.get('mission'), 'new');
assert.equal(replacement.data.has('genesis_crew_v1'), false);
assert.equal(replacement.data.has('odyssey_checkpoint_v1_a'), false);
assert.equal(replacement.data.get('unrelated-preference'), 'conservar');
assert(replacement.data.has('odyssey_audio_mix'));

const failed = boot();
const previous = new Map(failed.data);
failed.failNextRemoval();
assert.throws(() => failed.menu.resetProgress(failed.storage));
assert.deepEqual(failed.data, previous, 'a partial reset restores the previous mission records');
const empty = boot(false);
assert.equal(empty.elements.get('start-load').disabled, true);
empty.elements.get('start-load').click();
assert.equal(empty.loads, 0);
const fresh = boot(false, '?mission=new');
assert.equal(fresh.freshStarts, 1);
assert.equal(fresh.menu.awaitingChoice, false);
assert.equal(new URL(fresh.window.location.href).searchParams.has('mission'), false);
const crew = boot(true, '', true);
crew.elements.get('start-load').click();
crew.elements.get('crew-diary-button').click();
assert.equal(crew.window.partialPause.isPaused, false, 'the diary opens independently from pause');
assert.equal(crew.document.getElementById('crew-diary-dialog').open, true);
assert.equal(crew.document.getElementById('my-diary').open, true);
const waterButton = crew.document.getElementById('crew-leo-water');
waterButton.focus();
waterButton.click();
assert.equal(crew.window.CrewDiary.members.find(member => member.id === 'leo').reserveWater, .5);
assert(crew.window.ExpeditionSystems.state.water < 100);
crew.document.getElementById('crew-leo-food').click();
assert.equal(crew.window.CrewDiary.members.find(member => member.id === 'leo').reserveFood, 600);
assert(crew.window.ExpeditionSystems.state.food < 100);
console.log('PASS: explicit load, new mission confirmation, scoped reset, rollback, disabled empty load, fresh start and persisted sound options.');
