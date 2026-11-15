const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/world/surface-explorer.js', 'utf8');

function boot() {
  const timers = new Map(), events = new Map(), clients = [];
  let timerId = 0, stopped = 0, clockReads = 0, timestamp = 0;
  class Element extends EventTarget {
    constructor(tag) { super(); this.tag = tag; this.style = {}; this.children = []; }
    setAttribute(name, value) { this[name] = value; }
    append(...children) { this.children.push(...children); }
    appendChild(child) { this.children.push(child); child.parent = this; }
    showModal() { this.open = true; }
    close() { this.open = false; this.dispatchEvent(new Event('close')); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
    focus() {}
  }
  const document = { body: new Element('body'), createElement: tag => new Element(tag), hidden: false };
  const api = {
    addEventListener(event, callback) { events.set(event, callback); },
    getAnimations(callback) { callback(null, [['travel', 'Space travel', 8]]); },
    setCycleMode(mode) { assert.equal(mode, 'one'); },
    seekTo(time) { assert.equal(time, 0); },
    play() {}, start() {}, stop() { stopped++; }
  };
  const window = { navigator: { onLine: true }, Sketchfab: class {
    constructor(version, frame) { assert.equal(version, '1.12.1'); this.frame = frame; clients.push(this); }
    init(uid, options) { this.uid = uid; this.options = options; }
  } };
  vm.runInNewContext(source, {
    window, document, Date: { now: () => timestamp },
    setTimeout(callback, duration) { const id = ++timerId; timers.set(id, { callback, duration }); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  const explorer = Object.create(window.PlanetSurfaceExplorer.prototype);
  Object.assign(explorer, { isActive: true, clock: { getDelta() { clockReads++; } } });
  return { explorer, api, clients, events, timers, document, window,
    setTime(value) { timestamp = value; },
    get stopped() { return stopped; }, get clockReads() { return clockReads; } };
}

(async () => {
  const app = boot();
  app.explorer.showCretaceousTravel();
  const travel = app.explorer.cretaceousTravel;
  assert(travel.dialog.open);
  app.explorer.update();
  assert.equal(app.clockReads, 1, 'the game resets its clock without rendering under Sketchfab');
  await Promise.resolve();
  assert.equal(app.clients[0].uid, '08ee5e4cabee421ebf0b2cc927d4d6fc');
  assert.equal(app.clients[0].options.dnt, 1);
  app.clients[0].options.success(app.api);
  app.events.get('viewerready')();
  assert.equal([...app.timers.values()][0].duration, 13000, 'the watchdog follows the actual animation duration');
  app.events.get('animationEnded')();
  assert.equal(app.explorer.cretaceousTravel, null);
  assert.equal(travel.frame.src, 'about:blank');
  assert.equal(app.document.body.children.length, 0);
  assert.equal(app.stopped, 1);
  assert.equal(app.timers.size, 0);

  app.explorer.showCretaceousTravel();
  await Promise.resolve();
  const cancelled = app.explorer.cretaceousTravel;
  cancelled.dialog.children[2].dispatchEvent(new Event('click'));
  app.clients[1].options.success(app.api);
  assert.equal(app.explorer.cretaceousTravel, null, 'late API initialization cannot reopen a cancelled trip');
  assert.equal(app.stopped, 2);

  app.explorer.showCretaceousTravel();
  await Promise.resolve();
  app.clients[2].options.error();
  assert.equal(app.explorer.cretaceousTravel, null);
  app.explorer.showCretaceousTravel();
  [...app.timers.values()][0].callback();
  assert.equal(app.explorer.cretaceousTravel, null, 'an unavailable remote viewer cannot block descent indefinitely');
  app.window.navigator.onLine = false;
  app.explorer.showCretaceousTravel();
  assert.equal(app.explorer.cretaceousTravel, null, 'offline entry uses the local descent');
  assert.equal(app.document.body.children.length, 0);
  const renderedDeltas = [];
  app.explorer.arrival = {};
  app.explorer.clock.getDelta = () => .25;
  app.explorer.updateArrival = delta => { renderedDeltas.push(delta); };
  for (let frame = 0; frame < 60; frame++) {
    app.setTime(frame * 1000 / 60);
    app.explorer.update();
  }
  assert.equal(renderedDeltas.length, 30, 'a 60 Hz display renders the transition at 30 FPS');
  assert(renderedDeltas.every(delta => delta === .25), 'slow cinematic frames retain elapsed time');
  app.document.hidden = true;
  app.setTime(2000);
  app.explorer.update();
  assert.equal(renderedDeltas.length, 30, 'hidden tabs suspend transition rendering');
  console.log('PASS: original Sketchfab model, suspended local rendering, playback end, skip, late callbacks, errors, timeout and offline fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });
