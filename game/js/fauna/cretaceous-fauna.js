/* Cretaceous fauna: downloaded GLB models only, no procedural rigs.
   The catalog is small, real and deliberately readable; herds use the same
   placement rules as modern Earth so nothing spawns inside cities or water. */
(() => {
  const catalog = [
    { name: 'Tyrannosaurus rex', file: 'Trex', path: 'assets/models/cretaceous/Trex.glb', kind: 'land', size: 72, packs: 2, herd: [1, 2], speed: .09, carnivore: true },
    { name: 'Triceratops', file: 'Triceratops', path: 'assets/models/cretaceous/Triceratops.glb', kind: 'land', size: 58, packs: 3, herd: [3, 5], speed: .08 },
    { name: 'Ankylosaurus', file: 'Ankylosaurus', path: 'assets/models/cretaceous/Ankylosaurus.glb', kind: 'land', size: 46, packs: 2, herd: [2, 3], speed: .06 },
    { name: 'Carnotaurus', file: 'Carnotaurus', path: 'assets/models/cretaceous/Carnotaurus.glb', kind: 'land', size: 48, packs: 2, herd: [1, 2], speed: .12, carnivore: true },
    { name: 'Oviraptor', file: 'Oviraptor', path: 'assets/models/cretaceous/Oviraptor.glb', kind: 'land', size: 20, packs: 3, herd: [2, 4], speed: .18 },
    { name: 'Pachycephalosaurus', file: 'Pachycephalosaurus', path: 'assets/models/cretaceous/Pachycephalosaurus.glb', kind: 'land', size: 38, packs: 2, herd: [3, 5], speed: .1 },
    { name: 'Spinosaurus', file: 'Spinosaurus', path: 'assets/models/cretaceous/Spinosaurus.glb', kind: 'land', size: 78, packs: 1, herd: [1, 2], speed: .09, carnivore: true },
    { name: 'Apatosaurus', file: 'Apatosaurus', path: 'assets/models/cretaceous/Apatosaurus.glb', kind: 'land', size: 84, packs: 2, herd: [2, 3], speed: .05 },
    { name: 'Brontosaurus', file: 'Brontosaurus', path: 'assets/models/cretaceous/Apatosaurus.glb', kind: 'land', size: 84, packs: 2, herd: [2, 3], speed: .05 },
    { name: 'Parasaurolophus', file: 'Parasaurolophus', path: 'assets/models/cretaceous/Parasaurolophus.glb', kind: 'land', size: 56, packs: 3, herd: [3, 6], speed: .09 },
    { name: 'Stegosaurus', file: 'Stegosaurus', path: 'assets/models/cretaceous/Stegosaurus.glb', kind: 'land', size: 52, packs: 3, herd: [2, 4], speed: .06 },
    { name: 'Velociraptor', file: 'Velociraptor', path: 'assets/models/cretaceous/Velociraptor.glb', kind: 'land', size: 22, packs: 4, herd: [3, 6], speed: .18, carnivore: true },
    { name: 'Archaeopteryx', file: 'QEagle', path: 'assets/models/wildlife/QEagle.glb', kind: 'air', size: 14, packs: 3, herd: [2, 4], speed: .18, carnivore: true },
    { name: 'Cretoxyrhina', file: 'QShark', path: 'assets/models/wildlife/QShark.glb', kind: 'water', size: 44, packs: 2, herd: [2, 3], speed: .16, carnivore: true }
  ].map((s, i) => ({ ...s, i }));

  function hash(n) { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }
  const cityAt = (x, z, m) => !!window.EarthRegions?.cityAt?.(x, z, m);

  function valid(world, spec, x, z) {
    const h = world.height(x, z, 'earth');
    if (h > 900) return false;
    if (cityAt(x, z, 220)) return false;
    if (spec.kind === 'water') {
      if (h > -26) return false;
      for (let t = 0; t < 6; t++) {
        const a = t * Math.PI / 3;
        if (world.height(x + Math.sin(a) * 32, z + Math.cos(a) * 32, 'earth') > -8) return false;
      }
      return true;
    }
    if (h < 18) return false;
    if (spec.kind === 'land') {
      const slope = Math.max(
        Math.abs(world.height(x + 16, z, 'earth') - h),
        Math.abs(world.height(x, z + 16, 'earth') - h)
      ) / 16;
      if (slope > .9) return false;
    }
    return true;
  }

  function findSpot(world, spec, salt, center) {
    for (let j = 0; j < 900; j++) {
      const a = spec.i * 2.399 + salt * 1.31 + j * .618;
      const r = (center ? 40 : 780) + Math.sqrt(j / 900) * 6800;
      const x = (center ? center.x : 0) + Math.sin(a) * r;
      const z = (center ? center.z : -650) + Math.cos(a) * r;
      if (valid(world, spec, x, z)) return { x, z };
    }
    return null;
  }

  function spawn(world, spec, spot, salt) {
    const h = world.height(spot.x, spot.z, 'earth');
    const g = new THREE.Group();
    let y;
    if (spec.kind === 'water') y = Math.max(h + 3, -14);
    else if (spec.kind === 'air') y = h + 85 + hash(salt) * 55;
    else y = world.ground ? world.ground(spot.x, spot.z) : h;
    g.position.set(spot.x, y, spot.z);
    const a = {
      g, type: 'dinosaur', species: spec.name, dino: spec,
      x: spot.x, z: spot.z, phase: hash(salt + spec.i) * Math.PI * 2,
      speed: spec.speed, aquatic: spec.kind === 'water', bird: spec.kind === 'air',
      isMarineDino: spec.kind === 'water', isPteroDino: spec.kind === 'air',
      carnivore: !!spec.carnivore, altitude: 30 + hash(salt * 2.7) * 24,
      wander: spec.kind === 'air' ? 70 : spec.kind === 'water' ? 26 : Math.max(12, spec.size * .7),
      asset: { file: spec.file, size: spec.size }, herd: true
    };
    g.userData = { type: 'dinosaur', species: a.species, habitat: 'Cretácico' };
    world.group.add(g);
    world.animals.push(a);
    return a;
  }

  function populate(world) {
    if (!world || !world.ancient || typeof THREE === 'undefined') return 0;
    let added = 0, salt = 0;
    const packScale = world.populationDensity || 1.35;
    for (const spec of catalog) {
      const packs = Math.max(1, Math.round(spec.packs * packScale));
      for (let p = 0; p < packs; p++) {
        // The first Parasaurolophus herd is placed as close to the pad as the terrain allows,
        // so the player always sees large dinosaurs soon after landing.
        const showcase = spec.file === 'Parasaurolophus' && p === 0 && world.engine?.landingPad?.position;
        const center = showcase ? world.engine.landingPad.position : null;
        let anchor = findSpot(world, spec, spec.i * 11 + p + 1, center);
        if (!anchor && center) anchor = findSpot(world, spec, spec.i * 11 + p + 1, null);
        if (!anchor) continue;
        const spread = Math.max(16, spec.size * 1.6);
        const min = spec.herd[0], max = spec.herd[1];
        const members = min + Math.floor(hash(spec.i * 37 + p * 9 + 5) * (max - min + 1));
        for (let m = 0; m < members; m++) {
          salt++;
          let spot = null;
          for (let t = 0; t < 36 && !spot; t++) {
            const ang = hash(spec.i * 47 + p * 23 + m * 13 + t * 2.9) * Math.PI * 2;
            const rad = Math.max(8, spec.size * .35) + hash(spec.i * 19 + p * 7 + m * 5 + t * 1.9) * spread * 2.4;
            const x = anchor.x + Math.sin(ang) * rad;
            const z = anchor.z + Math.cos(ang) * rad;
            if (valid(world, spec, x, z)) spot = { x, z };
          }
          if (!spot) spot = m === 0 ? anchor : findSpot(world, spec, salt, null);
          if (!spot) continue;
          spawn(world, spec, spot, salt);
          added++;
        }
      }
    }
    world.extraSpecies = new Set(world.animals.map(a => a.species)).size;
    return added;
  }

  window.CretaceousFauna = {
    catalog,
    species: catalog.map(s => s.name),
    populate,
    findSpot,
    valid
  };
})();
