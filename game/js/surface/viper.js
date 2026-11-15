/* VIPER en la Luna (rol: Modelado). Modelo propio y sencillo hecho en código, sin logos.
   VIPER (Volatiles Investigating Polar Exploration Rover) fue el rover de NASA diseñado para
   buscar hielo de agua en el polo sur lunar; la misión se canceló en 2024.
   Se coloca cerca de la plataforma en la Luna y muestra su ficha y fuente al acercarse.
   Expone window.ViperRover = { build, dispose, info }. */
(function () {
  const INFO = {
    name: 'VIPER · rover de NASA para buscar hielo en el polo sur (cancelado en 2024)',
    source_url: 'https://science.nasa.gov/mission/viper/',
    note: 'Modelo simplificado propio, a escala aumentada ×6 para que se vea en el juego.',
  };
  const SCALE = 6;       // el rover real mide ~1.5 × 1.5 × 2.5 m
  const NEAR_M = 60;
  let current = null;

  function makeRover(THREE) {
    const g = new THREE.Group();
    g.name = 'VIPER (modelo simplificado)';
    const white = new THREE.MeshStandardMaterial({ color: 0xbfc4c8, roughness: 0.6, metalness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.8 });
    const panel = new THREE.MeshStandardMaterial({ color: 0x1d2a44, roughness: 0.35, metalness: 0.5 });
    const gold = new THREE.MeshStandardMaterial({ color: 0x8a6d2f, roughness: 0.5, metalness: 0.6 });
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    // Chasis
    add(new THREE.BoxGeometry(1.4, 0.55, 1.9), white, 0, 0.75, 0);
    add(new THREE.BoxGeometry(1.2, 0.08, 1.7), gold, 0, 0.47, 0);            // aislamiento térmico
    // Paneles solares verticales en tres lados (el sol en el polo está muy bajo)
    add(new THREE.BoxGeometry(0.04, 0.75, 1.6), panel, -0.73, 1.05, 0);
    add(new THREE.BoxGeometry(0.04, 0.75, 1.6), panel, 0.73, 1.05, 0);
    add(new THREE.BoxGeometry(1.3, 0.75, 0.04), panel, 0, 1.05, -0.97);
    // Mástil con cámaras y faros
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 10), white, 0.35, 1.5, 0.75);
    add(new THREE.BoxGeometry(0.42, 0.16, 0.16), dark, 0.35, 1.98, 0.75);
    add(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff3c4 }), 0.22, 1.98, 0.84);
    add(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff3c4 }), 0.48, 1.98, 0.84);
    // Taladro TRIDENT (para muestrear hasta ~1 m de profundidad)
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), dark, -0.45, 0.55, 0.95);
    // Ruedas (4) con brazos de suspensión
    const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.18, 18);
    wheelGeo.rotateZ(Math.PI / 2);
    for (const [x, z] of [[-0.85, 0.7], [0.85, 0.7], [-0.85, -0.7], [0.85, -0.7]]) {
      add(wheelGeo, dark, x, 0.26, z);
      add(new THREE.BoxGeometry(0.08, 0.35, 0.08), white, x * 0.86, 0.5, z);
    }
    g.scale.setScalar(SCALE);
    return g;
  }

  function build(explorer) {
    dispose();
    if (explorer.planetKey !== 'moon' || explorer.ancientEarth) return null;
    const THREE = window.THREE || globalThis.THREE;
    const heightAt = window.SurfaceNavigation?.heightAt || (() => 0);
    const pad = explorer.landingPad?.position || { x: 0, z: -650 };
    const x = pad.x + 150, z = pad.z + 90;
    const rover = makeRover(THREE);
    rover.position.set(x, heightAt(x, z, 'moon'), z);
    rover.rotation.y = -0.6;
    explorer.scene?.add(rover);
    current = { explorer, rover, position: { x, z } };
    return rover;
  }

  function dispose() {
    if (!current) return;
    current.rover.parent?.remove(current.rover);
    current.rover.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    current = null;
    hideLabel();
  }

  let label = null;
  function showLabel() {
    if (typeof document === 'undefined') return;
    if (!label) { label = document.createElement('div'); label.className = 'hg-banner hg-viper-label'; label.setAttribute('role', 'status'); document.body.appendChild(label); }
    label.textContent = '🚙 ' + INFO.name + ' · fuente: science.nasa.gov';
  }
  function hideLabel() { label?.remove?.(); label = null; }

  function tick() {
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(tick);
    const e = current?.explorer;
    if (!e || !e.isActive || e.arrival) { hideLabel(); return; }
    const p = e.shipGroup.position;
    if (Math.hypot(p.x - current.position.x, p.z - current.position.z) < NEAR_M) showLabel(); else hideLabel();
  }

  function install() {
    const P = window.PlanetSurfaceExplorer;
    if (!P || P.prototype.__viperHooked) return;
    P.prototype.__viperHooked = true;
    const start = P.prototype.start, stop = P.prototype.stop;
    P.prototype.start = function () { const out = start.apply(this, arguments); build(this); return out; };
    P.prototype.stop = function () { dispose(); return stop.apply(this, arguments); };
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(tick);
  }

  window.ViperRover = { build, dispose, info: INFO, get current() { return current; } };
  if (window.PlanetSurfaceExplorer) install();
})();
