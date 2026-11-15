/* Depósitos de recursos reales visibles en la superficie (rol: Modelado).
   Lee data/planets/<id>.json (vía la API, puerto 8787) y pone en el suelo el material
   de cada recurso real, con su nombre y su fuente al acercarse.
   Sin datos inventados: si un recurso no tiene "location" de superficie, no se dibuja.
   Expone window.ResourceDeposits = { build, dispose, nearest, list }. */
(function () {
  const COUNT_PER_RESOURCE = 12;
  const NEAR_M = 70;

  // Aspecto por tipo de material (colores de roca, sin brillos).
  const LOOK = {
    'water-ice': { color: 0x575e62, rough: 0.45, flat: 0.25, size: 7 },        // regolito helado: gris oscuro con leve escarcha
    'mid-latitude-ice': { color: 0x7d878c, rough: 0.4, flat: 0.4, size: 9 },
    'ilmenite': { color: 0x2b2b2e, rough: 0.55, flat: 0.8, size: 6 },
    'perchlorate': { color: 0xa89f88, rough: 0.9, flat: 0.15, size: 12 },     // vetas de sal pálida
    'iron-bearing-minerals': { color: 0x5a3a35, rough: 0.8, flat: 0.7, size: 6 },
    'plagioclase': { color: 0x9c968b, rough: 0.85, flat: 0.7, size: 5 },
    'pyroxene': { color: 0x3f4a3a, rough: 0.85, flat: 0.7, size: 5 },
    'olivine': { color: 0x5d6a37, rough: 0.8, flat: 0.7, size: 5 },
    'sulfur': { color: 0x9d9157, rough: 0.9, flat: 0.3, size: 8 },
    'basalt': { color: 0x3a3632, rough: 0.9, flat: 0.8, size: 7 },
    'plagioclase': { color: 0xb6b1a6, rough: 0.82, flat: 0.72, size: 6 },
    'pyroxene': { color: 0x4e5949, rough: 0.84, flat: 0.7, size: 6 },
    'olivine': { color: 0x788343, rough: 0.82, flat: 0.68, size: 6 },
    'enstatite': { color: 0x686b69, rough: 0.8, flat: 0.7, size: 6 },
    'oldhamite': { color: 0xb7a866, rough: 0.78, flat: 0.55, size: 6 },
    'orthopyroxene': { color: 0x51594d, rough: 0.84, flat: 0.7, size: 6 },
    'anorthite': { color: 0xc5c0b3, rough: 0.82, flat: 0.72, size: 6 },
  };
  const DEFAULT_LOOK = { color: 0x6f6a63, rough: 0.9, flat: 0.7, size: 6 };

  const params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
  const API = (params.get('api') || (typeof location !== 'undefined' ? location.protocol + '//' + location.hostname + ':8787' : '')).replace(/\/$/, '');

  let current = null; // { explorer, group, deposits: [] }

  // Recursos que se pueden "ver tirados": tienen ubicación en el suelo (no atmósfera ni toda la superficie difusa).
  function surfaceResources(planet) {
    return (planet?.resources || []).filter((r) => {
      const loc = String(r.location || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!loc || r.id === 'no-surface') return false;
      if (['regolith-oxygen', 'helium-3', 'co2-atmosphere'].includes(r.id)) return false;
      return !/atmosfera|nubes|sin superficie solida/.test(loc);
    });
  }
  function sourceOf(r) {
    return r.abundance?.source_url || r.source_url || r.evidence?.source_url || '';
  }

  function seededRandom(seed) {
    let state = seed >>> 0 || 0x6d2b79f5;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFor(value) {
    let seed = 2166136261;
    for (const char of String(value)) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
    return seed >>> 0;
  }

  // Clusters aleatorios, reproducibles para que toda la sala vea el mismo terreno.
  function positionsFor(padX, padZ, random, occupied) {
    const out = [];
    for (let i = 0; i < COUNT_PER_RESOURCE; i++) {
      let point = null;
      for (let attempt = 0; attempt < 100 && !point; attempt++) {
        const angle = random() * Math.PI * 2;
        const dist = 280 + random() * 1050;
        const x = padX + Math.cos(angle) * dist, z = padZ + Math.sin(angle) * dist;
        if (occupied.every(([otherX, otherZ]) => Math.hypot(x - otherX, z - otherZ) >= 125)) point = [x, z];
      }
      if (point) { out.push(point); occupied.push(point); }
    }
    return out;
  }

  function build(explorer, planet) {
    dispose();
    const THREE = window.THREE || globalThis.THREE;
    const heightAt = window.SurfaceNavigation?.heightAt || (() => 0);
    const key = explorer.planetKey;
    const group = new THREE.Group();
    group.name = 'Depósitos de recursos reales';
    const pad = explorer.landingPad?.position || { x: 0, z: -650 };
    const resources = surfaceResources(planet);
    const deposits = [];
    const roomCode = window.CooperativeMission?.session?.code || '';
    const random = seededRandom(seedFor(`${key}:${roomCode || Date.now()}`));
    const occupied = [];
    const geo = new THREE.IcosahedronGeometry(1, 1);
    resources.forEach((r, idx) => {
      const look = LOOK[r.id] || DEFAULT_LOOK;
      const mat = new THREE.MeshStandardMaterial({ color: look.color, roughness: look.rough, metalness: r.id === 'ilmenite' ? 0.35 : 0, flatShading: true });
      for (const [x, z] of positionsFor(pad.x, pad.z, random, occupied)) {
        const y = heightAt(x, z, key);
        const cluster = new THREE.Group();
        cluster.position.set(x, y, z);
        // Varios trozos sueltos: "material tirado" en el suelo.
        for (let k = 0; k < 7; k++) {
          const piece = new THREE.Mesh(geo, mat);
          const s = look.size * (0.45 + ((k * 37) % 10) / 14);
          piece.scale.set(s, s * look.flat, s * (0.8 + (k % 3) * 0.2));
          piece.position.set(Math.sin(k * 2.1) * look.size * 1.6, s * look.flat * 0.3, Math.cos(k * 1.7) * look.size * 1.6);
          piece.rotation.set(k * 0.4, k * 1.3, k * 0.2);
          piece.castShadow = piece.receiveShadow = true;
          cluster.add(piece);
        }
        group.add(cluster);
        deposits.push({ id: r.id, name: r.name, source_url: sourceOf(r), verified: !!(r.abundance?.verified ?? r.verified), position: { x, y, z }, mesh: cluster, resource: r });
      }
    });
    explorer.scene?.add(group);
    current = { explorer, group, deposits };
    return deposits;
  }

  function dispose() {
    if (!current) return;
    current.group.parent?.remove(current.group);
    current.group.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    current = null;
    hideLabel();
  }

  function nearest(pos, maxDist = Infinity) {
    let best = null, bd = maxDist;
    for (const d of current?.deposits || []) {
      const dist = Math.hypot(d.position.x - pos.x, d.position.z - pos.z);
      if (dist < bd) { bd = dist; best = d; }
    }
    return best ? { deposit: best, distance: bd } : null;
  }

  // Etiqueta al acercarse: nombre del recurso y fuente.
  let label = null;
  function showLabel(d) {
    if (typeof document === 'undefined') return;
    if (!label) {
      label = document.createElement('div');
      label.className = 'hg-banner hg-resource-label';
      label.setAttribute('role', 'status');
      document.body.appendChild(label);
    }
    const host = d.source_url ? d.source_url.replace(/^https?:\/\//, '').split('/')[0] : 'sin fuente';
    label.textContent = '⛏ ' + d.name + ' · fuente: ' + host + (d.verified ? '' : ' (por verificar)');
  }
  function hideLabel() { label?.remove?.(); label = null; }

  function tick() {
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(tick);
    const e = current?.explorer;
    if (!e || !e.isActive || e.arrival) { hideLabel(); return; }
    const near = nearest(e.shipGroup.position, NEAR_M);
    if (near) showLabel(near.deposit); else hideLabel();
  }

  async function loadPlanet(key) {
    try {
      const r = await fetch(API + '/api/planets/' + key);
      if (r.ok) return r.json();
    } catch (e) { /* sin API */ }
    if (key === 'moon') return window.MoonData?.planet || null; // respaldo local de la Luna
    return null;
  }

  // Engancharse al inicio y fin de la exploración de superficie, sin tocar surface-explorer.js.
  function install() {
    const P = window.PlanetSurfaceExplorer;
    if (!P || P.prototype.__depositsHooked) return;
    P.prototype.__depositsHooked = true;
    const start = P.prototype.start, stop = P.prototype.stop;
    P.prototype.start = function (key) {
      const out = start.apply(this, arguments);
      const self = this;
      loadPlanet(self.ancientEarth ? 'earth' : key).then((planet) => { if (planet && self.isActive && self.planetKey === key) build(self, planet); });
      return out;
    };
    P.prototype.stop = function () { dispose(); return stop.apply(this, arguments); };
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(tick);
  }

  window.ResourceDeposits = { build, dispose, nearest, surfaceResources, install, get list() { return current?.deposits || []; } };
  if (window.PlanetSurfaceExplorer) install();
  else if (typeof window.addEventListener === 'function') window.addEventListener('load', install);
})();
