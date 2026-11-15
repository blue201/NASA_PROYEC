const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const MD = require('../js/design/mission-design.js');
const catalog = require('../js/design/catalog.json');
const source = fs.readFileSync('js/design/hangar.js', 'utf8');

function boot(blockedStorage = false, failCatalog = false) {
  const document = new EventTarget();
  class Element extends EventTarget {
    constructor(tag) {
      super();
      this.tagName = tag;
      this.children = [];
      this.scrollTop = 0;
      this.isConnected = true;
      this.dataset = {};
    }
    setAttribute(name, value) { this[name] = value; }
    appendChild(child) { this.children.push(child); child.parent = this; }
    remove() { this.parent.children = this.parent.children.filter(child => child !== this); this.isConnected = false; }
    showModal() { this.open = true; }
    close() { this.open = false; }
    focus() { document.activeElement = this; }
    contains(element) { return element === this || this.children.includes(element); }
    set innerHTML(html) {
      this.children = [...html.matchAll(/<(button|input|div|aside|section)\b([^>]*)>/g)].map(match => {
        const element = new Element(match[1]);
        for (const attribute of match[2].matchAll(/([\w-]+)="([^"]*)"/g)) element[attribute[1]] = attribute[2];
        element.className = element.class || '';
        element.checked = /\bchecked\b/.test(match[2]);
        element.disabled = /\bdisabled\b/.test(match[2]);
        if (element['data-hg']) element.dataset.hg = element['data-hg'];
        return element;
      });
    }
    querySelectorAll(selector) {
      return this.children.filter(element => selector.split(',').some(part => {
        if (part.startsWith('.')) return element.className.split(' ').includes(part.slice(1));
        if (part === 'input:checked') return element.tagName === 'input' && element.checked;
        return element.tagName === part;
      }));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    closest() { return this.dataset.hg ? this : null; }
    click() { if (!this.disabled) this.dispatchEvent(new Event('click', { cancelable: true })); }
  }
  document.body = new Element('body');
  const launch = new Element('button');
  document.activeElement = launch;
  document.readyState = 'complete';
  document.createElement = tag => new Element(tag);
  document.getElementById = id => id === 'execute-flight-plan-btn' ? launch : null;
  const window = { MissionDesign: MD };
  Object.defineProperty(window, 'localStorage', { get() {
    if (blockedStorage) throw Error('blocked');
    return { getItem() { return null; }, setItem() {} };
  } });
  let requests = 0;
  vm.runInNewContext(source, { window, document, console: { error() {} }, CustomEvent,
    fetch: async () => ({ ok: !(failCatalog && ++requests === 1), status: 503, json: async () => catalog })
  });
  function action(root, name) {
    const target = root.children.find(child => child.dataset.hg === name);
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: target });
    root.dispatchEvent(event);
  }
  return { window, document, launch, action, get dialog() { return document.body.children.find(element => element.tagName === 'dialog'); } };
}

(async () => {
  const app = boot(true);
  await app.window.Hangar.ready;
  let launches = 0, cancellations = 0;
  await Promise.all([
    app.window.Hangar.open({ onLaunch() { launches++; }, onCancel() { cancellations++; } }),
    app.window.Hangar.open()
  ]);
  const root = app.dialog;
  assert(root.open);
  assert.equal(app.document.body.children.filter(element => element.tagName === 'dialog').length, 1);
  const input = root.querySelectorAll('input').find(input => input.name === 'objective');
  input.type = 'radio';
  input.focus();
  root.querySelector('.hg-body').scrollTop = 310;
  root.querySelector('.hg-choices').scrollTop = 125;
  const change = new Event('change');
  Object.defineProperty(change, 'target', { value: input });
  root.dispatchEvent(change);
  assert.equal(app.document.activeElement.name, input.name);
  assert.equal(app.document.activeElement.value, input.value);
  assert.equal(root.querySelector('.hg-body').scrollTop, 310);
  assert.equal(root.querySelector('.hg-choices').scrollTop, 125);
  app.action(root, 'launch');
  assert.equal(launches, 0, 'an incomplete design cannot launch');
  Object.assign(app.window.Hangar.design, { objective: 'ice', launcher: 'rideshare', orbit: 'elliptic-polar',
    structure: '6U', power: 'deploy-panels', comms: 'sband', instrument: 'neutron', propulsion: 'cold-gas' });
  app.action(root, 'launch');
  assert.equal(launches, 1, 'repeated opens preserve the original launch callback');
  assert.equal(cancellations, 0);
  assert.equal(app.document.activeElement, app.launch);
  await app.window.Hangar.open({ onCancel() { cancellations++; } });
  app.dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
  assert.equal(cancellations, 1);
  assert.equal(app.dialog, undefined);

  let started = 0;
  app.launch.addEventListener('click', () => { started++; });
  app.launch.click();
  await Promise.resolve();
  await Promise.resolve();
  app.action(app.dialog, 'launch');
  assert.equal(started, 1, 'valid design forwards exactly one launch click');
  app.launch.click();
  await Promise.resolve();
  await Promise.resolve();
  assert(app.dialog.open, 'a later launch goes through the hangar again');
  app.window.Hangar.close();

  const failed = boot(false, true);
  await failed.window.Hangar.open();
  assert(failed.dialog.children.some(child => child.dataset.hg === 'retry'));
  failed.action(failed.dialog, 'retry');
  await failed.window.Hangar.ready;
  await new Promise(resolve => setImmediate(resolve));
  assert(failed.dialog.querySelectorAll('input').length > 0, 'catalog download can be retried');
  failed.window.Hangar.close();
  const pending = boot();
  const opening = pending.window.Hangar.open();
  pending.window.Hangar.close();
  await opening;
  assert.equal(pending.dialog, undefined, 'a late catalog response cannot reopen a closed hangar');
  console.log('PASS: blocked storage, modal opening, duplicate opens, keyboard focus, scroll, validation, cancellation, launch gate and catalog retry.');
})().catch(error => { console.error(error); process.exitCode = 1; });
