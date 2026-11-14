/* ==========================================================================
   NASA ODYSSEY // SPACE HAZARDS & COLLISION SYSTEM (SWEEP & WINGSPAN BOX)
   Robust swept collision detection without tunneling & direct hull damage
   ========================================================================== */

class SpaceHazardsManager {
  constructor(scene) {
    this.scene = scene;
    this.hazards = [];
    this.fragments = []; // Fragmentos de explosión al colisionar
    this.spawnTimer = 0;
    this.spawnInterval = 1.35; // Frecuencia equilibrada de aparición para evitar sobrecarga visual
    this.hazardSpeed = 115; // Velocidad de avance óptima para ver y colisionar

    // Geometría y materiales de asteroides de alta resolución
    this.asteroidTexture = window.nasaApi ? window.nasaApi.createAsteroidRockTexture() : null;
    this.goldFoilTexture = window.nasaApi ? window.nasaApi.createGoldFoilTexture() : null;
    this.solarPanelTexture = window.nasaApi ? window.nasaApi.createSolarPanelTexture() : null;

    // 1. Asteroide Condrita Rocoso (Cráteres profundos, cantos irregulares y silueta orgánica tipo Bennu / Ryugu)
    this.chondriteGeo = new THREE.IcosahedronGeometry(2.8, 4);
    const pos = this.chondriteGeo.attributes.position;
    const craters = [
      { x: 1.5, y: 0.8, z: 1.2, r: 1.6, depth: 0.42 },
      { x: -1.4, y: -0.9, z: 0.7, r: 1.2, depth: 0.35 },
      { x: 0.2, y: 1.8, z: -1.0, r: 1.1, depth: 0.30 },
      { x: -0.6, y: -0.4, z: -1.8, r: 1.4, depth: 0.38 }
    ];
    for (let i = 0; i < pos.count; i++) {
      let vx = pos.getX(i);
      let vy = pos.getY(i);
      let vz = pos.getZ(i);
      // Elongación natural de forma de patata cósmica (Eros / Bennu / Itokawa)
      vz *= 1.16;
      vx *= 0.97;

      // Ruido fractal 3D Simplex multi-octava con crestas afiladas
      let noise;
      if (window.nasaApi && window.nasaApi.fbm3D) {
        noise = 1.0 + window.nasaApi.fbm3D(vx * 0.7, vy * 0.7, vz * 0.7, 4) * 0.42;
      } else {
        noise = 1 + (Math.sin(vx * 2.2) * Math.cos(vy * 2.2) * 0.28) +
                    (Math.sin(vz * 3.6 + vx * 1.5) * 0.16) +
                    (Math.sin(vx * 5.2) * Math.cos(vz * 5.2) * 0.09) +
                    (Math.cos(vy * 7.0 + vz * 2.0) * 0.05);
      }

      // Concavidades de cráteres de impacto con reborde elevado
      let craterMod = 0;
      for (let c = 0; c < craters.length; c++) {
        const cr = craters[c];
        const dist = Math.hypot(vx - cr.x, vy - cr.y, vz - cr.z);
        if (dist < cr.r) {
          const normD = dist / cr.r;
          if (normD < 0.8) {
            craterMod -= (1.0 - normD / 0.8) * cr.depth;
          } else {
            craterMod += Math.sin((normD - 0.8) / 0.2 * Math.PI) * (cr.depth * 0.35);
          }
        }
      }

      const finalFactor = Math.max(0.45, noise + craterMod);
      pos.setXYZ(i, vx * finalFactor, vy * finalFactor, vz * finalFactor);
    }
    this.chondriteGeo.computeVertexNormals();

    // 2. Asteroide Metálico de Níquel-Hierro (Facetado angular, regmagliptos y reflectividad estilo 16 Psyche)
    this.ironGeo = new THREE.IcosahedronGeometry(2.6, 3);
    const iPos = this.ironGeo.attributes.position;
    for (let i = 0; i < iPos.count; i++) {
      let vx = iPos.getX(i);
      let vy = iPos.getY(i);
      let vz = iPos.getZ(i);
      let n;
      if (window.nasaApi && window.nasaApi.simplex3D) {
        n = 1.0 + window.nasaApi.simplex3D(vx * 1.1, vy * 1.1, vz * 1.1) * 0.32 +
                  Math.abs(window.nasaApi.simplex3D(vx * 2.6, vy * 2.6, vz * 2.6)) * 0.16;
      } else {
        n = 1 + (Math.sin(vx * 4.1) * 0.28) + (Math.cos(vz * 3.2) * 0.18) + (Math.sin(vy * 6.0) * 0.08);
      }
      // Regmagliptos (depresiones cóncavas esculpidas por ablación)
      const scoop = Math.sin(vx * 3.0) * Math.sin(vy * 3.0) * Math.sin(vz * 3.0);
      if (scoop > 0.35) n -= 0.18;
      iPos.setXYZ(i, vx * n, vy * n, vz * n);
    }
    this.ironGeo.computeVertexNormals();

    // 3. Asteroide Cometario de Hielo Sucio (Contacto binario bilobulado estilo 67P / Churyumov-Gerasimenko)
    this.cometGeo = new THREE.DodecahedronGeometry(2.6, 3);
    const cPos = this.cometGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      let vx = cPos.getX(i);
      let vy = cPos.getY(i);
      let vz = cPos.getZ(i);
      // Constricción del cuello central entre lóbulos
      const neck = 1.0 - Math.exp(-vz * vz * 1.6) * 0.32;
      let n = (1 + (Math.sin(vy * 3.1) * 0.24) + (Math.sin(vx * 2.5) * 0.16)) * neck;
      cPos.setXYZ(i, vx * n, vy * n, vz * (vz > 0 ? 1.25 : 0.95));
    }
    this.cometGeo.computeVertexNormals();

    // Materiales PBR Científicos con Mapas Normales Tangentes y Rugosidad Heterogénea
    const rockNormal = window.nasaApi ? window.nasaApi.createAsteroidNormalMap() : null;
    const rockRoughness = window.nasaApi ? window.nasaApi.createAsteroidRoughnessMap() : null;
    const goldNormal = window.nasaApi ? window.nasaApi.createGoldFoilNormalMap() : null;

    this.rockMat = new THREE.MeshStandardMaterial({
      color: 0xc6bfb4,
      emissive: 0x34445b, emissiveIntensity: 0.18,
      map: this.asteroidTexture,
      normalMap: rockNormal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: rockRoughness,
      roughness: 0.88,
      metalness: 0.02,
      envMapIntensity: 1.2
    });

    this.metallicAsteroidMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      normalMap: rockNormal,
      normalScale: new THREE.Vector2(1.0, 1.0),
      roughness: 0.32,
      metalness: 0.92,
      envMapIntensity: 1.8
    });

    this.cometMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      map: this.asteroidTexture,
      roughness: 0.72,
      metalness: 0.25,
      emissive: 0x0284c7,
      emissiveIntensity: 0.16
    });

    this.goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      map: this.goldFoilTexture,
      normalMap: goldNormal,
      normalScale: new THREE.Vector2(1.25, 1.25),
      roughness: 0.2,
      metalness: 0.96,
      envMapIntensity: 1.6
    });

    this.solarPanelMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      map: this.solarPanelTexture,
      roughness: 0.14,
      metalness: 0.92
    });

    this.metalDebrisMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.28,
      metalness: 0.88
    });

    this.darkTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.92
    });

    this.fragmentGeo = new THREE.DodecahedronGeometry(0.65, 0);
  }

  update(delta, shipPos, onCollisionCallback, rolling = false) {
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnHazard(shipPos);
    }

    // Actualizar fragmentos de explosiones activas
    for (let i = this.fragments.length - 1; i >= 0; i--) {
      const f = this.fragments[i];
      f.life -= delta;
      if (f.life <= 0) {
        this.scene.remove(f.mesh);
        this.fragments.splice(i, 1);
        continue;
      }
      f.mesh.position.addScaledVector(f.velocity, delta);
      f.mesh.rotation.x += f.rotSpeed.x * delta;
      f.mesh.rotation.y += f.rotSpeed.y * delta;
      f.mesh.scale.multiplyScalar(0.96);
    }

    // Actualizar movimiento y detectar colisiones mediante barrido de volumen (Swept Box)
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];

      const prevZ = h.mesh.position.z;
      // Desplazamiento en Z hacia la nave
      h.mesh.position.z += this.hazardSpeed * delta;
      const newZ = h.mesh.position.z;

      // Rotación en gravedad cero
      h.mesh.rotation.x += h.rotSpeed.x * delta;
      h.mesh.rotation.y += h.rotSpeed.y * delta;
      h.mesh.rotation.z += h.rotSpeed.z * delta;

      // ======================================================================
      // DETECCIÓN ROBUSTA DE COLISIÓN (ENVERGADURA COMPLETA DEL ARWING)
      // La nave Arwing mide: Envergadura X = ±7.2, Altura Y = ±3.5, Longitud Z = ±4.0
      // ======================================================================
      const shipZ = (shipPos && shipPos.z !== undefined) ? shipPos.z : 0;
      const shipX = (shipPos && shipPos.x !== undefined) ? shipPos.x : 0;
      const shipY = (shipPos && shipPos.y !== undefined) ? shipPos.y : 0;

      const zBuffer = 5.5 + h.radius;

      // Comprobar si el obstáculo cruza o está dentro de la zona Z de la nave en este frame
      const inZZone = (newZ >= (shipZ - zBuffer) && prevZ <= (shipZ + zBuffer)) ||
                      (Math.abs(newZ - shipZ) <= zBuffer);

      if (inZZone) {
        const dx = Math.abs(h.mesh.position.x - shipX);
        const dy = Math.abs(h.mesh.position.y - shipY);

        // Tolerancias generosas y exactas que cubren las alas, cabina y fuselaje
        const hitXLimit = 8.2 + h.radius; // Cubre toda la envergadura de las alas laterales
        const hitYLimit = 4.8 + h.radius; // Cubre la cabina superior, alerones y propulsores

        if (dx <= hitXLimit && dy <= hitYLimit) {
          if (rolling && h.type === 'small-fragment') {
            this.destroyHazard(i);
            continue;
          }
          // ¡COLISIÓN CONFIRMADA!
          this.spawnExplosion(h.mesh.position, h.type);
          onCollisionCallback(h.type, h.damage);
          this.destroyHazard(i);
          continue;
        }
      }

      // Eliminar cuando sobrepasa la cámara
      if (h.mesh.position.z > 35) {
        this.destroyHazard(i);
      }
    }
  }

  spawnExplosion(pos, type) {
    const count = 12;
    const mat = (type === 'asteroid') ? this.rockMat : this.metalDebrisMat;

    for (let j = 0; j < count; j++) {
      const fragMesh = new THREE.Mesh(this.fragmentGeo, mat);
      fragMesh.position.copy(pos);
      const scale = 0.4 + Math.random() * 0.7;
      fragMesh.scale.set(scale, scale, scale);

      this.scene.add(fragMesh);
      this.fragments.push({
        mesh: fragMesh,
        life: 0.8 + Math.random() * 0.4,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 45,
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 40 - 15
        ),
        rotSpeed: {
          x: (Math.random() - 0.5) * 12,
          y: (Math.random() - 0.5) * 12
        }
      });
    }
  }

  spawnHazard(shipPos) {
    const isDebris = Math.random() > 0.45;
    let mesh;
    let radius;
    let type;
    let damage;

    // Distribución espaciosa de obstáculos para que el espacio se sienta inmenso y limpio
    let spawnX, spawnY;
    const targetX = (shipPos && shipPos.x !== undefined) ? shipPos.x : 0;
    const targetY = (shipPos && shipPos.y !== undefined) ? shipPos.y : 0;

    if (Math.random() < 0.45) {
      spawnX = targetX + (Math.random() - 0.5) * 24;
      spawnY = targetY + (Math.random() - 0.5) * 16;
    } else {
      spawnX = (Math.random() - 0.5) * 65;
      spawnY = (Math.random() - 0.5) * 40;
    }

    const spawnZ = -560 - Math.random() * 80;

    if (!isDebris) {
      type = 'asteroid';
      radius = 1.6 + Math.random() * 1.4; // Tamaño equilibrado que no opaque la pantalla
      damage = 35; // 3 impactos destruyen la nave

      const rVal = Math.random();
      let geo, mat;
      if (rVal > 0.65) {
        // Asteroide Metálico Níquel-Hierro
        geo = this.ironGeo;
        mat = this.metallicAsteroidMat;
      } else if (rVal > 0.25) {
        // Asteroide Condrita Rocoso con Cráteres
        geo = this.chondriteGeo;
        mat = this.rockMat;
      } else {
        // Asteroide Cometario de Hielo
        geo = this.cometGeo;
        mat = this.cometMat;
      }

      mesh = new THREE.Mesh(geo, mat);
      // Variación asimétrica única por asteroide
      const scaleX = radius * (0.85 + Math.random() * 0.35);
      const scaleY = radius * (0.85 + Math.random() * 0.35);
      const scaleZ = radius * (0.85 + Math.random() * 0.35);
      geo.computeBoundingSphere();
      const baseRadius = geo.boundingSphere.radius;
      mesh.scale.set(scaleX / baseRadius, scaleY / baseRadius, scaleZ / baseRadius);
      radius = Math.max(scaleX, scaleY, scaleZ);
    } else {
      type = 'debris';
      damage = 25;
      const debrisGroup = new THREE.Group();
      const debrisKind = Math.random();

      if (debrisKind > 0.7) {
        // 1. Satélite Científico de la NASA Fuera de Servicio
        radius = 3.4;

        // Módulo central envuelto en foil térmico dorado Kapton
        const busMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.8), this.goldFoilMat);
        debrisGroup.add(busMesh);

        // Bloques de propulsores RCS de actitud en las 4 esquinas
        const rcsGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
        [[-1.25, -1.25], [1.25, -1.25], [-1.25, 1.25], [1.25, 1.25]].forEach(([rx, ry]) => {
          const rcs = new THREE.Mesh(rcsGeo, this.darkTitaniumMat);
          rcs.position.set(rx, ry, 0);
          debrisGroup.add(rcs);
        });

        // Paneles solares dobles con textura fotovoltaica
        const wingGeo = new THREE.BoxGeometry(5.6, 2.0, 0.12);
        const leftWing = new THREE.Mesh(wingGeo, this.solarPanelMat);
        leftWing.position.set(-4.2, 0, 0);
        debrisGroup.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, this.solarPanelMat);
        rightWing.position.set(4.2, 0, 0);
        debrisGroup.add(rightWing);

        // Antena parabólica reflectante con mástil y alimentador
        const dishMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.35, 0.7, 16), this.metalDebrisMat);
        dishMesh.rotation.x = Math.PI / 2;
        dishMesh.position.set(0, 0, 1.8);
        debrisGroup.add(dishMesh);

        const feedMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), this.darkTitaniumMat);
        feedMesh.rotation.x = Math.PI / 2;
        feedMesh.position.set(0, 0, 2.4);
        debrisGroup.add(feedMesh);

        mesh = debrisGroup;
      } else if (debrisKind > 0.4) {
        // 2. Etapa Superior de Cohete Criogénico Gastado (Centaur / Saturn S-IVB)
        radius = 3.0;

        // Tanque de propelente blanco cilíndrico
        const tankMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 7.2, 20), this.metalDebrisMat);
        tankMesh.rotation.x = Math.PI / 2;
        debrisGroup.add(tankMesh);

        // Costillas de refuerzo estructural del tanque
        for (let r = -2.4; r <= 2.4; r += 1.6) {
          const rib = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.06, 8, 24), this.darkTitaniumMat);
          rib.position.z = r;
          debrisGroup.add(rib);
        }

        // Anillo de interestadio de separación
        const ringMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.9, 16), this.metallicAsteroidMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.z = 2.4;
        debrisGroup.add(ringMesh);

        // Campana de tobera de titanio orientable
        const nozzleMesh = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.5, 16), this.darkTitaniumMat);
        nozzleMesh.rotation.x = -Math.PI / 2;
        nozzleMesh.position.z = -4.6;
        debrisGroup.add(nozzleMesh);

        mesh = debrisGroup;
      } else if (debrisKind > 0.18) {
        // 3. Ala de Paneles Solares Fragmentada a la Deriva
        radius = 3.2;

        const mainArray = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.6, 0.14), this.solarPanelMat);
        debrisGroup.add(mainArray);

        // Vigas de soporte de celosía rotas
        const sparGeo = new THREE.BoxGeometry(0.18, 0.18, 1.8);
        [-3.2, 3.2].forEach(sx => {
          const spar = new THREE.Mesh(sparGeo, this.darkTitaniumMat);
          spar.position.set(sx, 1.4, 0);
          spar.rotation.z = Math.PI / 6;
          debrisGroup.add(spar);
        });

        // Cables y arneses desprendidos
        const wireGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6);
        const wire = new THREE.Mesh(wireGeo, this.goldFoilMat);
        wire.position.set(-2.0, -1.8, 0.4);
        wire.rotation.z = 0.5;
        debrisGroup.add(wire);

        mesh = debrisGroup;
      } else {
        // 4. Cápsula Espacial de Tripulación Histórica Desactivada
        radius = 2.7;

        // Cono de la cápsula
        const podGeo = new THREE.ConeGeometry(1.9, 3.2, 16);
        podGeo.rotateX(-Math.PI / 2);
        const podMesh = new THREE.Mesh(podGeo, this.metalDebrisMat);
        debrisGroup.add(podMesh);

        // Escudo térmico ablativo negro en la base
        const shieldGeo = new THREE.CylinderGeometry(1.95, 1.95, 0.45, 16);
        shieldGeo.rotateX(Math.PI / 2);
        const shieldMesh = new THREE.Mesh(shieldGeo, this.darkTitaniumMat);
        shieldMesh.position.z = -1.6;
        debrisGroup.add(shieldMesh);

        // Anillo de atraque en la cúspide
        const dockGeo = new THREE.TorusGeometry(0.55, 0.1, 8, 16);
        const dockMesh = new THREE.Mesh(dockGeo, this.goldFoilMat);
        dockMesh.position.z = 1.6;
        debrisGroup.add(dockMesh);

        mesh = debrisGroup;
      }
    }

    if (type === 'debris' && Math.random() < 0.25) {
      mesh.scale.setScalar(0.2);
      radius *= 0.2;
      type = 'small-fragment';
      damage = 10;
    }
    mesh.position.set(spawnX, spawnY, spawnZ);
    this.scene.add(mesh);

    this.hazards.push({
      mesh: mesh,
      radius: radius,
      type: type,
      damage: damage,
      rotSpeed: {
        x: (Math.random() - 0.5) * 2.8,
        y: (Math.random() - 0.5) * 2.8,
        z: (Math.random() - 0.5) * 2.8
      }
    });
  }

  disposeHierarchy(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      // No eliminar geometrías y materiales base compartidos
      if (child.geometry && child.geometry !== this.chondriteGeo && child.geometry !== this.ironGeo && child.geometry !== this.cometGeo) {
        child.geometry.dispose();
      }
      if (child.material && child.material !== this.rockMat && child.material !== this.ironMat && child.material !== this.cometMat &&
          child.material !== this.solarPanelMat && child.material !== this.goldFoilMat && child.material !== this.metalDebrisMat && child.material !== this.darkTitaniumMat) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
  }

  destroyHazard(index) {
    if (index >= 0 && index < this.hazards.length) {
      const h = this.hazards[index];
      this.disposeHierarchy(h.mesh);
      this.scene.remove(h.mesh);
      this.hazards.splice(index, 1);
    }
  }

  clear() {
    for (let i = 0; i < this.hazards.length; i++) {
      this.disposeHierarchy(this.hazards[i].mesh);
      this.scene.remove(this.hazards[i].mesh);
    }
    this.hazards = [];

    for (let i = 0; i < this.fragments.length; i++) {
      if (this.fragments[i].mesh && this.fragments[i].mesh.geometry) {
        this.fragments[i].mesh.geometry.dispose();
      }
      this.scene.remove(this.fragments[i].mesh);
    }
    this.fragments = [];
  }
}

window.SpaceHazardsManager = SpaceHazardsManager;
