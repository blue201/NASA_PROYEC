/* Living Earth: downloaded fauna in herds, flocks and schools.
   No animal geometry is generated here; every visible creature comes from a GLB.
   Terrain, groves and spawn bookkeeping stay synchronous so tests and saves are stable. */

(() => {

  class LivingEarth {

    constructor(engine, height, ancient = false) {
      this.engine = engine;
      this.height = height;
      this.ancient = ancient;
      this.time = 0;
      this.disposed = false;
      this.cityBodies = [];
      this.buildings = [];
      this.pendingAssets = [];
      this.materials = [];
      this.group = new THREE.Group();
      this.group.name = ancient ? 'Cretácico · Tierra olvidada' : 'Vida terrestre';
      engine.scene.add(this.group);
      this.animals = [];

      if (ancient) this.plantGroves();

      // Spawn bookkeeping is synchronous; GLB meshes are attached asynchronously afterwards.
      if (ancient && window.CretaceousFauna) window.CretaceousFauna.populate(this);
      else if (!ancient && window.EarthFaunaCatalog) window.EarthFaunaCatalog.populate(this);

      if (window.EarthAssets) {
        if (!ancient) this.pendingAssets.push(window.EarthAssets.city(this));
        this.animals.forEach((a, i) => { this.pendingAssets.push(window.EarthAssets.fauna(this, a, i)); });
        this.ready = Promise.allSettled(this.pendingAssets).then(results => {
          this.assetErrors = results.filter(r => r.status === 'rejected').length;
        });
      }
    }

    ground(x, z) {
      const geo = this.engine.terrain?.geometry, p = geo?.parameters;
      if (!p?.widthSegments) return this.height(x, z, 'earth');
      const nx = p.widthSegments, nz = p.heightSegments;
      const u = Math.max(0, Math.min(nx - .00001, (x / p.width + .5) * nx));
      const v = Math.max(0, Math.min(nz - .00001, (z / p.height + .5) * nz));
      const ix = Math.floor(u), iz = Math.floor(v), fx = u - ix, fz = v - iz;
      const a = iz * (nx + 1) + ix, pos = geo.attributes.position;
      const ha = pos.getY(a), hb = pos.getY(a + nx + 1), hc = pos.getY(a + nx + 2), hd = pos.getY(a + 1);
      return fx + fz <= 1
        ? ha + (hd - ha) * fx + (hb - ha) * fz
        : hc + (hb - hc) * (1 - fx) + (hd - hc) * (1 - fz);
    }

    /* Ancient scenery: biome-aware groves, sharing a handful of geometries. */
    plantGroves() {
      const mat = (color, rough = .92) => {
        const m = new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true });
        this.materials.push(m);
        return m;
      };
      const bark = mat(0x5e4630), leaf = mat(0x2c5031), palm = mat(0x3b6b37), dry = mat(0x7d6d3f), reed = mat(0x597a43);
      const trunkGeo = new THREE.CylinderGeometry(.7, 1.5, 12, 6);
      const coneGeo = new THREE.ConeGeometry(7, 20, 7);
      const crownGeo = new THREE.IcosahedronGeometry(8, 1);
      const reedsGeo = new THREE.ConeGeometry(1.1, 6, 5);
      const habitat = (x, z, h) => window.EarthRegions?.habitat?.(x, z, h) || 'Pradera';

      for (let i = 0; i < 420; i++) {
        const x = Math.sin(i * 7.4) * 4400, z = -900 + Math.cos(i * 3.1) * 4300;
        const y = this.height(x, z, 'earth'), b = habitat(x, z, y);
        if (y < 12 || y > 760 || window.EarthRegions?.cityAt?.(x, z, 220)) continue;
        if (!['Selva', 'Bosque', 'Costa', 'Humedal', 'Sabana', 'Tundra', 'Montaña', 'Glaciar', 'Desierto'].includes(b)) continue;
        const g = new THREE.Group();
        g.position.set(x, y, z);
        if (b === 'Desierto') {
          const cactus = new THREE.Mesh(trunkGeo, dry); cactus.scale.set(.45, 1.1, .45); cactus.position.y = 5; g.add(cactus);
        } else if (b === 'Humedal') {
          for (let r = 0; r < 5; r++) { const s = new THREE.Mesh(reedsGeo, reed); s.position.set(Math.sin(r * 2.1) * 4, 2, Math.cos(r * 2.1) * 4); g.add(s); }
        } else if (['Tundra', 'Montaña', 'Glaciar'].includes(b)) {
          const trunk = new THREE.Mesh(trunkGeo, bark); trunk.position.y = 6; trunk.scale.set(.7, 1.8, .7); g.add(trunk);
          for (let c = 0; c < 3; c++) { const crown = new THREE.Mesh(coneGeo, leaf); crown.position.y = 14 + c * 7; crown.scale.setScalar(1 - c * .22); g.add(crown); }
        } else if (b === 'Sabana') {
          const trunk = new THREE.Mesh(trunkGeo, bark); trunk.position.y = 6; g.add(trunk);
          const crown = new THREE.Mesh(crownGeo, dry); crown.scale.set(1.5, .45, 1.5); crown.position.y = 14; g.add(crown);
        } else {
          const scale = b === 'Selva' ? 1.35 : 1;
          const trunk = new THREE.Mesh(trunkGeo, bark); trunk.position.y = 6 * scale; trunk.scale.setScalar(scale); g.add(trunk);
          for (let c = 0; c < 3; c++) {
            const crown = new THREE.Mesh(crownGeo, b === 'Costa' ? palm : leaf);
            crown.position.set(Math.sin(c * 2.1) * 4 * scale, (14 + c * 3) * scale, Math.cos(c * 2.1) * 4 * scale);
            crown.scale.setScalar(scale * (.9 + c * .14)); g.add(crown);
          }
        }
        g.scale.setScalar(5.2);
        this.group.add(g);
      }
    }

    update(dt) {
      if (this.engine.arrival) return;
      this.time += dt;
      const t = this.time, ship = this.engine.shipGroup.position;

      for (const a of this.animals) {
        const dx = a.x - ship.x, dz = a.z - ship.z, distSq = dx * dx + dz * dz;
        const near = distSq < (this.ancient ? 25000000 : 90000);
        a.g.visible = distSq < (this.ancient ? 36000000 : 490000);
        if (!a.g.visible) continue;

        const resting = !!a.idleAction && !a.aquatic && !a.bird && Math.sin(t * .18 + a.phase) > .82;
        const target = resting ? 0 : 1;
        a.gait = (a.gait ?? 1) + (target - (a.gait ?? 1)) * (1 - Math.exp(-dt * 3.5));
        a.movementPhase = (a.movementPhase || 0) + dt * (a.speed || .15) * (a.bird ? 2.6 : a.aquatic ? 1.7 : 1.4) * a.gait;

        const angle = a.movementPhase + a.phase;
        const radius = a.wander || (a.bird ? 55 : a.aquatic ? 22 : 13);
        let x = a.x + Math.sin(angle) * radius;
        let z = a.z + Math.cos(angle) * radius;
        let gy = this.height(x, z, 'earth');

        // Keep creatures out of cities and out of the sea/land they do not belong to.
        if (window.EarthRegions?.cityAt?.(x, z, 150)) { x = a.x; z = a.z; gy = this.height(x, z, 'earth'); }
        if (a.aquatic) {
          if (a.type === 'whale' && gy > -16) { x = a.x; z = a.z; gy = this.height(x, z, 'earth'); }
          if (gy > -4) { x = a.x; z = a.z; gy = this.height(x, z, 'earth'); }
        }
        else if (!a.bird && gy < 6) { x = a.x; z = a.z; gy = this.height(x, z, 'earth'); }

        let y;
        if (a.bird) {
          y = Math.max(8, this.height(x, z, 'earth')) + (a.altitude || 30) + Math.sin(angle * 2 + a.phase) * 4;
        } else if (a.aquatic) {
          if (a.type === 'whale') {
            y = Math.min(-11, -18 + Math.sin(t * .12 + a.phase) * 5);
          } else if (a.type === 'dolphin') {
            const cycle = (t * 1.15 + a.phase) % (Math.PI * 2);
            if (cycle < 2.2) {
              const frac = cycle / 2.2, arc = Math.sin(frac * Math.PI);
              y = -3.5 + arc * 9.6;
            } else y = -4.5 + Math.sin(t * 1.6 + a.phase) * 1.4;
          } else if (a.type === 'shark') {
            y = -3.2 + Math.sin(t * .6 + a.phase) * 1.2;
          } else {
            y = Math.min(-1.2, gy + 5 + Math.sin(t * .65 + a.phase) * 2.8);
          }
          y = Math.max(gy + 2, y);
          if (a.type === 'whale') y = Math.min(-11, y);
        } else {
          y = this.ground(x, z);
        }

        a.g.position.set(x, y, z);
        const heading = Math.PI / 2 + angle;
        let turn = heading - a.g.rotation.y;
        turn = Math.atan2(Math.sin(turn), Math.cos(turn));
        a.g.rotation.y += turn * (1 - Math.exp(-dt * 5));

        if (a.action) a.action.setEffectiveWeight(a.gait);
        if (a.idleAction) a.idleAction.setEffectiveWeight(1 - a.gait);
        if (!near) continue;

        if (a.mixer) a.mixer.update(dt);

        // Predators turn toward the ship when it comes close; this reads as curiosity, not AI.
        if (a.carnivore && distSq < 150 * 150) {
          const toShip = Math.atan2(ship.x - x, ship.z - z);
          let d = toShip - a.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
          a.g.rotation.y += d * (1 - Math.exp(-dt * 2.5));
        }

        if (a.aquatic && a.type !== 'dolphin') {
          const pitch = Math.cos(t * .8 + a.phase) * .05;
          a.g.rotation.x += (pitch - a.g.rotation.x) * (1 - Math.exp(-dt * 4));
        } else if (a.bird) {
          a.g.rotation.z = Math.sin(angle * .7) * .16;
          a.g.rotation.x = Math.cos(angle * 2) * .07;
        } else {
          a.g.rotation.x *= Math.exp(-dt * 4);
        }
      }
    }

    dispose() {
      this.disposed = true;
      this.animals.forEach(a => {
        a.mixer?.stopAllAction();
        if (a.model) a.mixer?.uncacheRoot(a.model);
        a.model?.traverse(o => o.skeleton?.boneTexture?.dispose());
      });
      this.engine.rockBodies = this.engine.rockBodies.filter(b => !this.cityBodies.includes(b));
      this.engine.scene.remove(this.group);
      const geometries = new Set();
      this.group.traverse(o => { if (o.geometry && !o.userData.sharedAsset) geometries.add(o.geometry); });
      geometries.forEach(g => g.dispose());
      this.materials.forEach(m => m.dispose());
    }

  }

  window.LivingEarth = LivingEarth;

})();
