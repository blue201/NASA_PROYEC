const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

// Mock DOM environment for testing supply-bars toggle
let domLoadedCb, keydownCb;
const localStorageMock = {
  data: {},
  getItem(k) { return this.data[k] ?? null; },
  setItem(k, v) { this.data[k] = String(v); }
};

class MockElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.classList = new Set();
    this.classList.toggle = (cls, force) => {
      if (force !== undefined) {
        if (force) this.classList.add(cls); else this.classList.delete(cls);
        return force;
      }
      if (this.classList.has(cls)) { this.classList.delete(cls); return false; }
      this.classList.add(cls); return true;
    };
    this.classList.contains = (cls) => this.classList.has(cls);
    this.attributes = {};
    this.dataset = {};
    this.style = {};
    this.listeners = {};
  }
  get lastElementChild() { return this.children[this.children.length - 1] || this; }
  set innerHTML(html) {
    const btn = new MockElement('button');
    btn.id = 'supply-bars-toggle-btn';
    btn.classList.add('supply-bars-toggle-btn');
    btn.setAttribute('aria-expanded', 'true');
    const span = new MockElement('span');
    span.classList.add('supply-toggle-icon');
    btn.append(span);
    const stat = new MockElement('span');
    stat.id = 'supply-bars-mini-stat';
    stat.classList.add('supply-bars-mini-stat');
    const title = new MockElement('strong');
    title.id = 'supply-bars-title';
    this.children.push(title, stat, btn);
  }
  get innerHTML() { return ''; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  append(...nodes) {
    for (const n of nodes) {
      if (typeof n === 'string') continue;
      n.parentElement = this;
      this.children.push(n);
    }
  }
  addEventListener(event, fn) {
    this.listeners[event] = fn;
  }
  dispatchEvent(event) {
    if (this.listeners[event.type]) this.listeners[event.type](event);
  }
  querySelector(sel) {
    if (sel.startsWith('#')) {
      const id = sel.slice(1);
      if (this.id === id) return this;
      for (const c of this.children) {
        const found = c.querySelector?.(sel);
        if (found) return found;
      }
    }
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      if (this.classList.contains(cls)) return this;
      for (const c of this.children) {
        const found = c.querySelector?.(sel);
        if (found) return found;
      }
    }
    if (sel.startsWith('[data-resource="')) {
      const res = sel.match(/\[data-resource="([^"]+)"\]/)[1];
      if (this.dataset.resource === res) return this;
      for (const c of this.children) {
        const found = c.querySelector?.(sel);
        if (found) return found;
      }
    }
    if (sel.startsWith('[data-value="')) {
      const val = sel.match(/\[data-value="([^"]+)"\]/)[1];
      if (this.dataset.value === val) return this;
      for (const c of this.children) {
        const found = c.querySelector?.(sel);
        if (found) return found;
      }
    }
    if (sel === 'p') {
      for (const c of this.children) {
        if (c.tagName === 'P') return c;
        const found = c.querySelector?.('p');
        if (found) return found;
      }
    }
    return null;
  }
  insertAdjacentHTML(pos, html) {
    // create mock label meters
    const matches = [...html.matchAll(/data-resource="([^"]+)"/g)];
    for (const m of matches) {
      const labelEl = new MockElement('label');
      labelEl.dataset.resource = m[1];
      labelEl.dataset.value = m[1];
      labelEl.value = 100;
      this.children.push(labelEl);
    }
    const p = new MockElement('p');
    p.id = 'supply-consequence';
    this.children.push(p);
  }
}

const documentMock = {
  body: new MockElement('body'),
  addEventListener(ev, cb) {
    if (ev === 'DOMContentLoaded') domLoadedCb = cb;
  },
  createElement(tag) {
    return new MockElement(tag);
  },
  getElementById(id) {
    return this.body.querySelector('#' + id);
  },
  querySelector(sel) {
    return this.body.querySelector(sel);
  },
  activeElement: null
};

const windowMock = {
  addEventListener(ev, cb) {
    if (ev === 'keydown') keydownCb = cb;
  },
  localStorage: localStorageMock,
  ExpeditionSystems: {
    state: { hull: 85, fuel: 70, oxygen: 90, water: 95, food: 95, supplies: 100, operational: true }
  }
};

const code = fs.readFileSync('js/ui/player-experience.js', 'utf8');
vm.runInNewContext(code, {
  document: documentMock,
  window: windowMock,
  localStorage: localStorageMock,
  setInterval() {},
  setTimeout() {}
});

assert.ok(domLoadedCb, 'DOMContentLoaded listener registered');
domLoadedCb();

const hud = documentMock.getElementById('supply-bars');
assert.ok(hud, '#supply-bars element created');
const header = hud.querySelector('#supply-bars-header');
assert.ok(header, '#supply-bars-header created');
const toggleBtn = hud.querySelector('#supply-bars-toggle-btn');
assert.ok(toggleBtn, '#supply-bars-toggle-btn created');
const miniStat = hud.querySelector('#supply-bars-mini-stat');
assert.ok(miniStat, '#supply-bars-mini-stat created');

// Initially expanded
assert.equal(hud.classList.contains('is-minimized'), false, 'initially expanded');
assert.equal(toggleBtn.getAttribute('aria-expanded'), 'true');

// Toggle to minimized via header click
header.dispatchEvent({ type: 'click', stopPropagation() {} });
assert.equal(hud.classList.contains('is-minimized'), true, 'minimized after click');
assert.equal(hud.dataset.collapsed, 'true');
assert.equal(toggleBtn.getAttribute('aria-expanded'), 'false');
assert.equal(localStorageMock.getItem('odyssey_supply_bars_collapsed'), 'true', 'persists to localStorage');

// Toggle back to expanded via 'M' key
keydownCb({ key: 'm' });
assert.equal(hud.classList.contains('is-minimized'), false, 'expanded after pressing M');
assert.equal(hud.dataset.collapsed, 'false');
assert.equal(toggleBtn.getAttribute('aria-expanded'), 'true');
assert.equal(localStorageMock.getItem('odyssey_supply_bars_collapsed'), 'false');

console.log('PASS: #supply-bars minimizable/expandable toggle, hotkey M, aria attributes and persistence verified.');
