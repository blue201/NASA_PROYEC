/* Earth fauna: only downloaded GLB models. No procedural animal geometry lives here.
   Each species is placed in a coherent biome, in packs, flocks or schools. */
(() => {
  const catalog = [
    // Pradera
    { name: 'Ciervo común', file: 'Deer', habitat: 'Pradera', type: 'deer', size: 15, packs: 2, herd: [4, 6], speed: .15 },
    { name: 'Caballo salvaje', file: 'Horse', habitat: 'Pradera', type: 'deer', size: 17.5, packs: 1, herd: [3, 5], speed: .18 },
    { name: 'Caballo blanco', file: 'Horse_White', habitat: 'Pradera', type: 'deer', size: 17.5, packs: 1, herd: [2, 4], speed: .18 },
    { name: 'Bisonte', file: 'Bull', habitat: 'Pradera', type: 'deer', size: 21.3, packs: 1, herd: [3, 5], speed: .1 },
    { name: 'Vaca domeada', file: 'QCow', habitat: 'Pradera', type: 'deer', size: 15, packs: 1, herd: [3, 6], speed: .09 },
    { name: 'Oveja lanuda', file: 'QSheep', habitat: 'Pradera', type: 'deer', size: 11.3, packs: 2, herd: [4, 7], speed: .11 },
    { name: 'Perro de la pradera', file: 'QPug', habitat: 'Pradera', type: 'deer', size: 6.9, packs: 2, herd: [2, 4], speed: .16 },
    { name: 'Liebre', file: 'Hare', habitat: 'Pradera', type: 'deer', size: 6.9, packs: 2, herd: [2, 3], speed: .24 },
    { name: 'Águila real', file: 'QEagle', habitat: 'Pradera', type: 'bird', size: 13.8, packs: 1, herd: [1, 2], speed: .22, bird: true, carnivore: true },
    { name: 'Milano real', file: 'Bird', habitat: 'Pradera', type: 'bird', size: 10, packs: 1, herd: [3, 4], speed: .24, bird: true, carnivore: true },

    // Sabana
    { name: 'Cebra de llanura', file: 'QZebra', habitat: 'Sabana', type: 'deer', size: 20, packs: 2, herd: [5, 8], speed: .2 },
    { name: 'Elefante africano', file: 'Elephant', habitat: 'Sabana', type: 'deer', size: 30, packs: 1, herd: [3, 4], speed: .09 },
    { name: 'Búfalo cafre', file: 'Bull', habitat: 'Sabana', type: 'deer', size: 21.3, packs: 1, herd: [4, 6], speed: .11 },
    { name: 'Gacela de Grant', file: 'Doe', habitat: 'Sabana', type: 'deer', size: 13.1, packs: 2, herd: [4, 7], speed: .22 },
    { name: 'Buitre leonado', file: 'QEagle', habitat: 'Sabana', type: 'bird', size: 13.8, packs: 1, herd: [1, 2], speed: .2, bird: true, carnivore: true },

    // Bosque
    { name: 'Lobo gris', file: 'Wolf', habitat: 'Bosque', type: 'deer', size: 13.1, packs: 2, herd: [3, 4], speed: .18, carnivore: true },
    { name: 'Zorro rojo', file: 'Fox', habitat: 'Bosque', type: 'deer', size: 10, packs: 1, herd: [1, 2], speed: .2, carnivore: true },
    { name: 'Dingo del bosque', file: 'QDog', habitat: 'Bosque', type: 'deer', size: 9.4, packs: 1, herd: [2, 4], speed: .17, carnivore: true },
    { name: 'Shiba salvaje', file: 'ShibaInu', habitat: 'Bosque', type: 'deer', size: 8.8, packs: 1, herd: [1, 3], speed: .17, carnivore: true },
    { name: 'Jabalí', file: 'Boar', habitat: 'Bosque', type: 'deer', size: 11.3, packs: 2, herd: [2, 4], speed: .13 },
    { name: 'Ciervo rojo', file: 'Stag', habitat: 'Bosque', type: 'deer', size: 16.3, packs: 1, herd: [3, 5], speed: .16 },
    { name: 'Ardilla roja', file: 'Squirrel', habitat: 'Bosque', type: 'deer', size: 4.4, packs: 2, herd: [1, 3], speed: .18 },
    { name: 'Búho real', file: 'QEagle', habitat: 'Bosque', type: 'bird', size: 8.1, packs: 1, herd: [1, 1], speed: .2, bird: true, carnivore: true },

    // Selva
    { name: 'Jaguar', file: 'QCat', habitat: 'Selva', type: 'deer', size: 13.1, packs: 1, herd: [1, 2], speed: .18, carnivore: true },
    { name: 'Pecarí de collar', file: 'QPig', habitat: 'Selva', type: 'deer', size: 10, packs: 2, herd: [3, 5], speed: .13 },
    { name: 'Guacamayo rojo', file: 'Bird', habitat: 'Selva', type: 'bird', size: 8.1, packs: 2, herd: [4, 7], speed: .26, bird: true },
    { name: 'Tucán toco', file: 'Bird', habitat: 'Selva', type: 'bird', size: 6.9, packs: 1, herd: [3, 5], speed: .24, bird: true },
    { name: 'Okapi', file: 'QZebra', habitat: 'Selva', type: 'deer', size: 15, packs: 1, herd: [2, 4], speed: .15 },

    // Desierto
    { name: 'Camello bactriano', file: 'QLlama', habitat: 'Desierto', type: 'deer', size: 15, packs: 1, herd: [2, 4], speed: .09 },
    { name: 'Coyote', file: 'Fox', habitat: 'Desierto', type: 'deer', size: 10, packs: 1, herd: [1, 2], speed: .2, carnivore: true },
    { name: 'Caballo árabe', file: 'QHorse', habitat: 'Desierto', type: 'deer', size: 16.3, packs: 1, herd: [2, 4], speed: .18 },
    { name: 'Buitre orejudo', file: 'QEagle', habitat: 'Desierto', type: 'bird', size: 13.8, packs: 1, herd: [1, 2], speed: .2, bird: true, carnivore: true },

    // Tundra
    { name: 'Reno', file: 'Deer', habitat: 'Tundra', type: 'deer', size: 13.8, packs: 2, herd: [5, 7], speed: .16 },
    { name: 'Lobo ártico', file: 'Husky', habitat: 'Tundra', type: 'deer', size: 10, packs: 2, herd: [3, 4], speed: .18, carnivore: true },
    { name: 'Búho nival', file: 'QEagle', habitat: 'Tundra', type: 'bird', size: 8.1, packs: 1, herd: [1, 1], speed: .2, bird: true, carnivore: true },

    // Glaciar
    { name: 'Reno de Svalbard', file: 'Deer', habitat: 'Glaciar', type: 'deer', size: 13.1, packs: 1, herd: [4, 6], speed: .15 },
    { name: 'Zorro polar', file: 'Fox', habitat: 'Glaciar', type: 'deer', size: 8.8, packs: 1, herd: [1, 2], speed: .19, carnivore: true },
    { name: 'Gaviota polar', file: 'Bird', habitat: 'Glaciar', type: 'bird', size: 6.9, packs: 2, herd: [3, 5], speed: .24, bird: true },

    // Montaña
    { name: 'Cabra montés', file: 'Goat', habitat: 'Montaña', type: 'deer', size: 10, packs: 2, herd: [3, 5], speed: .14 },
    { name: 'Llama andina', file: 'QLlama', habitat: 'Montaña', type: 'deer', size: 13.1, packs: 2, herd: [3, 5], speed: .13 },
    { name: 'Alpaca', file: 'Alpaca', habitat: 'Montaña', type: 'deer', size: 11.9, packs: 1, herd: [4, 6], speed: .13 },
    { name: 'Cóndor andino', file: 'QEagle', habitat: 'Montaña', type: 'bird', size: 18.8, packs: 1, herd: [1, 2], speed: .22, bird: true, carnivore: true },

    // Humedal
    { name: 'Cigüeña blanca', file: 'Stork', path: 'assets/models/Stork.glb', habitat: 'Humedal', type: 'bird', size: 11.9, packs: 1, herd: [2, 4], speed: .18, bird: true },
    { name: 'Ciervo de pantano', file: 'Deer', habitat: 'Humedal', type: 'deer', size: 13.1, packs: 1, herd: [2, 3], speed: .15 },
    { name: 'Jabalí de ribera', file: 'Boar', habitat: 'Humedal', type: 'deer', size: 10.6, packs: 1, herd: [2, 3], speed: .13 },
    { name: 'Garza real', file: 'Bird', habitat: 'Humedal', type: 'bird', size: 8.8, packs: 2, herd: [2, 4], speed: .2, bird: true },

    // Costa
    { name: 'Pelícano pardo', file: 'Stork', path: 'assets/models/Stork.glb', habitat: 'Costa', type: 'bird', size: 11.9, packs: 2, herd: [2, 3], speed: .18, bird: true },
    { name: 'Gaviota plateada', file: 'Bird', habitat: 'Costa', type: 'bird', size: 6.9, packs: 2, herd: [4, 5], speed: .24, bird: true },
    { name: 'Albatros errante', file: 'Seagull', habitat: 'Costa', type: 'bird', size: 10, packs: 1, herd: [2, 4], speed: .22, bird: true },
    { name: 'Burro costero', file: 'Donkey', habitat: 'Costa', type: 'deer', size: 13.1, packs: 1, herd: [2, 3], speed: .14 },

    // Océano - Gran diversidad marina (cetáceos, escualos, peces de arrecife y abisales)
    { name: 'Delfín mular', file: 'QDolphin', habitat: 'Océano', type: 'dolphin', size: 7.5, packs: 4, herd: [5, 8], speed: .3, aquatic: true },
    { name: 'Delfín manchado', file: 'QDolphin', habitat: 'Océano', type: 'dolphin', size: 6.5, packs: 3, herd: [6, 10], speed: .34, aquatic: true },
    { name: 'Ballena jorobada', file: 'QWhale', habitat: 'Océano', type: 'whale', size: 30, packs: 3, herd: [2, 4], speed: .18, aquatic: true, deep: true },
    { name: 'Orca ártica', file: 'QWhale', habitat: 'Océano', type: 'whale', size: 21.3, packs: 3, herd: [2, 3], speed: .26, aquatic: true, deep: true, carnivore: true },
    { name: 'Tiburón blanco', file: 'QShark', habitat: 'Océano', type: 'shark', size: 11.3, packs: 3, herd: [2, 4], speed: .28, aquatic: true, carnivore: true },
    { name: 'Tiburón azul', file: 'Shark', habitat: 'Océano', type: 'shark', size: 10.6, packs: 3, herd: [2, 4], speed: .26, aquatic: true, carnivore: true },
    { name: 'Tiburón martillo', file: 'QShark', habitat: 'Océano', type: 'shark', size: 12.3, packs: 2, herd: [2, 3], speed: .3, aquatic: true, carnivore: true },
    { name: 'Manta gigante', file: 'QMantaray', habitat: 'Océano', type: 'fish', size: 11.9, packs: 3, herd: [3, 5], speed: .22, aquatic: true },
    { name: 'Mantarraya de arrecife', file: 'QMantaray', habitat: 'Océano', type: 'fish', size: 9, packs: 3, herd: [3, 6], speed: .25, aquatic: true },
    { name: 'Pez payaso', file: 'QFish1', habitat: 'Océano', type: 'fish', size: 2, packs: 4, herd: [10, 16], speed: .3, aquatic: true },
    { name: 'Pez plateado oceánico', file: 'QFish1', habitat: 'Océano', type: 'fish', size: 1.8, packs: 4, herd: [12, 20], speed: .33, aquatic: true },
    { name: 'Pez luna', file: 'QFish2', habitat: 'Océano', type: 'fish', size: 3.3, packs: 3, herd: [4, 7], speed: .22, aquatic: true },
    { name: 'Pez ángel real', file: 'QFish2', habitat: 'Océano', type: 'fish', size: 2.6, packs: 3, herd: [6, 9], speed: .24, aquatic: true },
    { name: 'Pez loro', file: 'QFish3', habitat: 'Océano', type: 'fish', size: 2.8, packs: 3, herd: [8, 14], speed: .28, aquatic: true },
    { name: 'Pez cirujano azul', file: 'QFish3', habitat: 'Océano', type: 'fish', size: 2.4, packs: 3, herd: [8, 12], speed: .29, aquatic: true },
    { name: 'Piraña roja', file: 'QPiranha', habitat: 'Océano', type: 'fish', size: 2.3, packs: 3, herd: [8, 14], speed: .3, aquatic: true }
  ].map((s, i) => ({ ...s, i }));

  function hash(n) { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }
  const cityAt = (x, z, m) => !!window.EarthRegions?.cityAt?.(x, z, m);
  const habitatAt = (x, z, h) => window.EarthRegions?.habitat?.(x, z, h);

  function valid(world, spec, x, z) {
    const h = world.height(x, z, 'earth');
    if (habitatAt(x, z, h) !== spec.habitat) return false;
    if (cityAt(x, z, 240)) return false;
    if (spec.aquatic) {
      if (h > (spec.deep || spec.type === 'whale' ? -44 : -18)) return false;
      for (let t = 0; t < 6; t++) {
        const a = t * Math.PI / 3;
        if (world.height(x + Math.sin(a) * 34, z + Math.cos(a) * 34, 'earth') > (spec.deep || spec.type === 'whale' ? -24 : -6)) return false;
      }
      return true;
    }
    if (h < 10 || h > 1150) return false;
    if (!spec.bird) {
      const slope = Math.max(
        Math.abs(world.height(x + 14, z, 'earth') - h),
        Math.abs(world.height(x, z + 14, 'earth') - h)
      ) / 14;
      if (slope > .8) return false;
    }
    return true;
  }

  // Broad deterministic search, biased to each species' own angular sector.
  function findSpot(world, spec, salt, center) {
    for (let j = 0; j < 2200; j++) {
      const a = spec.i * 2.399 + salt * 1.71 + j * .618;
      const r = (center ? 30 : 620) + Math.sqrt(j / 2200) * 6900;
      const x = (center ? center.x : 0) + Math.sin(a) * r;
      const z = (center ? center.z : -650) + Math.cos(a) * r;
      if (valid(world, spec, x, z)) return { x, z };
    }
    return null;
  }

  function spawn(world, spec, spot, salt) {
    const height = world.height(spot.x, spot.z, 'earth');
    const g = new THREE.Group();
    let y;
    if (spec.aquatic) y = Math.max(height + 3, spec.deep ? -16 : -6);
    else if (spec.bird) y = height + 26 + hash(salt) * 22;
    else y = world.ground ? world.ground(spot.x, spot.z) : height;
    g.position.set(spot.x, y, spot.z);
    const a = {
      g, type: spec.type, species: spec.name, habitat: spec.habitat,
      x: spot.x, z: spot.z, phase: hash(salt + spec.i) * Math.PI * 2,
      speed: spec.speed, aquatic: !!spec.aquatic, bird: !!spec.bird,
      carnivore: !!spec.carnivore, deep: !!spec.deep,
      altitude: 24 + hash(salt * 3.1) * 26,
      wander: spec.bird ? 55 : spec.aquatic ? 22 : 13,
      asset: { file: spec.file, size: spec.size, path: spec.path },
      herd: true
    };
    g.userData = { type: a.type, species: a.species, habitat: a.habitat };
    world.group.add(g);
    world.animals.push(a);
    return a;
  }

  function populate(world) {
    if (!world || world.ancient || typeof THREE === 'undefined') return 0;
    if (!window.EarthRegions?.habitat) return 0;
    let added = 0, salt = 0;
    const packScale = world.populationDensity || 1.7;
    for (const spec of catalog) {
      const packs = Math.max(1, Math.round(spec.packs * packScale));
      for (let p = 0; p < packs; p++) {
        // The first deer herd starts near the landing pad when the local biome allows it.
        const showcase = spec.i === 0 && p === 0 && world.engine?.landingPad?.position;
        const center = showcase ? world.engine.landingPad.position : null;
        let anchor = findSpot(world, spec, spec.i * 13 + p + 1, center);
        if (!anchor && center) anchor = findSpot(world, spec, spec.i * 13 + p + 1, null);
        if (!anchor) continue;
        const spread = Math.max(12, spec.size * 2.4);
        const min = spec.herd[0], max = spec.herd[1];
        const members = min + Math.floor(hash(spec.i * 31 + p * 7 + 3) * (max - min + 1));
        for (let m = 0; m < members; m++) {
          salt++;
          let spot = null;
          for (let t = 0; t < 32 && !spot; t++) {
            const ang = hash(spec.i * 53 + p * 29 + m * 11 + t * 3.7) * Math.PI * 2;
            const rad = 6 + hash(spec.i * 17 + p * 5 + m * 3 + t * 1.3) * spread * 2.2;
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

  window.EarthFaunaCatalog = {
    catalog,
    species: catalog.map(s => s.name),
    populate,
    findSpot,
    valid
  };
})();
