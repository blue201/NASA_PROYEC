const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class Element extends EventTarget {
  constructor() {
    super();
    this.isConnected = true;
    this.open = false;
    this.value = '';
  }
  focus() { document.activeElement = this; }
  showModal() {
    if (this.failOpening) throw new Error('Opening failed');
    this.open = true;
  }
  close() {
    if (!this.open) return;
    this.open = false;
    queueMicrotask(() => this.dispatchEvent(new Event('close')));
  }
}
const ids = ['orbital-hangar', 'hangar-form', 'hangar-camera', 'hangar-audio',
  'hangar-cancel', 'hangar-destination', 'hangar-route', 'mission-intro',
  'mission-intro-skip', 'launch-mission-btn'];
const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
const document = new EventTarget();
document.getElementById = id => elements[id];
document.activeElement = new Element();
let scheduled;
let cleared = false;
const errors = [];
const window = {
  spaceAudio: { isMuted: true },
  setTimeout: callback => { scheduled = callback; return 1; },
  clearTimeout: () => { cleared = true; }
};
const project = require('node:path').join(__dirname, '..');
vm.runInNewContext(fs.readFileSync(project + '/js/flight/mission-preparation.js', 'utf8'),
  { window, document, console: { error: (...args) => errors.push(args) } });

(async () => {
  document.dispatchEvent(new Event('DOMContentLoaded'));
  assert.equal(elements['mission-intro'].open, true);
  elements['mission-intro-skip'].dispatchEvent(new Event('click'));
  await Promise.resolve();
  assert.equal(elements['mission-intro'].open, false);
  assert.equal(cleared, true);
  assert.equal(document.activeElement, elements['launch-mission-btn']);
  scheduled(); // A late timer must not reopen or double-close the introduction.

  const previous = document.activeElement;
  let preparation = window.missionPreparation.open({ destination: 'Marte', dockings: 2 });
  assert.equal(elements['hangar-camera'].value, 'cockpit');
  assert.equal(elements['hangar-audio'].checked, false);
  assert.match(elements['hangar-route'].textContent, /2 acople/);
  assert.equal(await window.missionPreparation.open({ destination: 'Tierra' }), null);
  elements['hangar-camera'].value = 'cockpit';
  elements['hangar-audio'].checked = true;
  elements['hangar-form'].dispatchEvent(new Event('submit', { cancelable: true }));
  const result = await preparation;
  assert.equal(result.camera, 'cockpit');
  assert.equal(result.audioEnabled, true);
  assert.equal(document.activeElement, previous);

  preparation = window.missionPreparation.open({ destination: 'Tierra' });
  assert.equal(elements['hangar-camera'].value, 'cockpit');
  elements['hangar-cancel'].dispatchEvent(new Event('click'));
  assert.equal(await preparation, null);

  preparation = window.missionPreparation.open({ destination: 'Luna' });
  elements['hangar-camera'].value = 'invalid';
  elements['hangar-form'].dispatchEvent(new Event('submit', { cancelable: true }));
  assert.equal(elements['orbital-hangar'].open, true);
  elements['orbital-hangar'].close(); // Native Escape dismissal.
  assert.equal(await preparation, null);

  elements['orbital-hangar'].failOpening = true;
  assert.equal(await window.missionPreparation.open({ destination: 'Marte' }), null);
  assert.equal(errors.length, 1);
  elements['orbital-hangar'].failOpening = false;
  preparation = window.missionPreparation.open({ destination: 'Marte' });
  elements['hangar-cancel'].dispatchEvent(new Event('click'));
  assert.equal(await preparation, null);
  console.log('PASS: intro, defaults, confirmation, duplicate opening, cancellation, invalid camera, Escape, opening failure and retry.');
})().catch(error => { console.error(error); process.exitCode = 1; });
