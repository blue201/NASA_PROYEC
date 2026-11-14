/* ==========================================================================
   NASA ODYSSEY // RESCUE STATIONS (SATELLITES & SPACE SHUTTLES)
   Docking targets for refueling and oxygen replenishment
   ========================================================================== */

class DockingStationsManager {
  constructor(scene) {
    this.scene = scene;
    this.stations = [];
    this.spawnTimer = 0;
    this.spawnInterval = 8.5; // Aparece una estación cada 8.5 segundos
    this.speed = 130;
  }

  update(delta, shipPos, onDockingReadyCallback) {
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnStation();
    }

    for (let i = this.stations.length - 1; i >= 0; i--) {
      const st = this.stations[i];
      st.group.position.z += this.speed * delta;

      // Pulsar anillo holográfico de atraque
      if (st.ringMesh) {
        st.ringMesh.scale.x = 1 + Math.sin(Date.now() * 0.006) * 0.15;
        st.ringMesh.scale.y = 1 + Math.sin(Date.now() * 0.006) * 0.15;
        st.ringMesh.rotation.z += 0.02;
      }

      // Rotación suave del satélite/transbordador
      st.group.rotation.y += 0.008;

      // Comprobar rango de acople
      const dist = st.group.position.distanceTo(shipPos);
      if (dist < 15 && !st.docked) {
        st.docked = true;
        onDockingReadyCallback(st.name, st.type);
        this.destroyStation(i);
        continue;
      }

      // Eliminar si pasa de largo
      if (st.group.position.z > 25) {
        this.destroyStation(i);
      }
    }
  }

  spawnStation() {
    const isShuttle = Math.random() > 0.5;
    const group = new THREE.Group();
    let name;
    let type;

    const solarTex = window.nasaApi ? window.nasaApi.createSolarPanelTexture() : null;
    const goldTex = window.nasaApi ? window.nasaApi.createGoldFoilTexture() : null;
    const goldNormal = window.nasaApi ? window.nasaApi.createGoldFoilNormalMap() : null;
    const hullTex = window.nasaApi ? window.nasaApi.createShipHullTexture() : null;
    const hullNormal = window.nasaApi ? window.nasaApi.createShipNormalMap() : null;
    const hullRoughness = window.nasaApi ? window.nasaApi.createShipRoughnessMap() : null;

    if (isShuttle) {
      // 1. Transbordador Espacial de Rescate NASA Orion / Space Shuttle
      name = 'TRANSBORDADOR ESPACIAL ORION // NASA';
      type = 'shuttle';

      const hullMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        map: hullTex,
        normalMap: hullNormal,
        normalScale: new THREE.Vector2(1.1, 1.1),
        roughnessMap: hullRoughness,
        roughness: 0.28,
        metalness: 0.78,
        envMapIntensity: 1.4
      });

      const heatTileMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        normalMap: hullNormal,
        normalScale: new THREE.Vector2(0.9, 0.9),
        roughness: 0.88,
        metalness: 0.12
      });

      const solarMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        map: solarTex,
        roughness: 0.14,
        metalness: 0.92
      });

      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        roughness: 0.06,
        metalness: 0.95,
        emissive: 0x004455,
        emissiveIntensity: 0.5
      });

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.92,
        roughness: 0.22
      });

      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.94,
        roughness: 0.2
      });

      // Fuselaje cilíndrico presurizado aerodinámico
      const bodyGeo = new THREE.CylinderGeometry(1.6, 2.2, 8.4, 24);
      const bodyMesh = new THREE.Mesh(bodyGeo, hullMat);
      bodyMesh.rotation.x = Math.PI / 2;
      group.add(bodyMesh);

      // Escudo térmico negro ventral inferior (TPS Ceramic Tiles)
      const heatGeo = new THREE.BoxGeometry(2.8, 0.45, 8.2);
      const heatMesh = new THREE.Mesh(heatGeo, heatTileMat);
      heatMesh.position.set(0, -1.25, 0);
      group.add(heatMesh);

      // Morro de proa aerodinámico con balasto térmico de carbono reforzado
      const noseGeo = new THREE.ConeGeometry(1.6, 3.2, 24);
      const noseMesh = new THREE.Mesh(noseGeo, heatTileMat);
      noseMesh.rotation.x = -Math.PI / 2;
      noseMesh.position.z = 5.8;
      group.add(noseMesh);

      // Ventanas de cabina de navegación envolventes (Anti-reflectantes)
      const visorGeo = new THREE.BoxGeometry(1.8, 0.48, 0.9);
      const visorMesh = new THREE.Mesh(visorGeo, glassMat);
      visorMesh.position.set(0, 0.88, 5.0);
      group.add(visorMesh);

      // Estabilizador vertical de cola (Timón aerodinámico)
      const finGeo = new THREE.BoxGeometry(0.24, 3.2, 3.2);
      const finMesh = new THREE.Mesh(finGeo, hullMat);
      finMesh.position.set(0, 2.0, -2.8);
      group.add(finMesh);

      // Luz de navegación de cola (Aft White Strobe)
      const tailLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      tailLight.position.set(0, 3.65, -3.8);
      group.add(tailLight);

      // Alas dobles delta con elevones de borde de salida
      const wingGeo = new THREE.BoxGeometry(10.5, 0.28, 4.6);
      const wingMesh = new THREE.Mesh(wingGeo, hullMat);
      wingMesh.position.set(0, -0.4, -0.8);
      group.add(wingMesh);

      // Luces de navegación en puntas de ala (Babor Rojo / Estribor Verde)
      const portLight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      portLight.position.set(-5.3, -0.3, -0.8);
      group.add(portLight);

      const stbdLight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      stbdLight.position.set(5.3, -0.3, -0.8);
      group.add(stbdLight);

      // Paneles solares articulados desplegados
      const solarPanelGeo = new THREE.BoxGeometry(6.5, 1.6, 0.12);
      const leftSolar = new THREE.Mesh(solarPanelGeo, solarMat);
      leftSolar.position.set(-8.5, 0.6, -0.6);
      group.add(leftSolar);

      const rightSolar = new THREE.Mesh(solarPanelGeo, solarMat);
      rightSolar.position.set(8.5, 0.6, -0.6);
      group.add(rightSolar);

      // Tres motores principales SSME en triángulo con toberas de titanio
      const engineGeo = new THREE.ConeGeometry(0.55, 1.8, 16);
      engineGeo.rotateX(Math.PI / 2);
      [
        [0, 0.85, -4.8],
        [-0.75, -0.45, -4.8],
        [0.75, -0.45, -4.8]
      ].forEach(([ex, ey, ez]) => {
        const eng = new THREE.Mesh(engineGeo, metalMat);
        eng.position.set(ex, ey, ez);
        group.add(eng);

        // Núcleo incandescente de tobera
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        core.position.set(ex, ey, ez - 0.7);
        group.add(core);
      });

      // Pods de Maniobra Orbital OMS a ambos lados de la cola
      [-1.3, 1.3].forEach(ox => {
        const oms = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 2.2), darkMat);
        oms.position.set(ox, 0.7, -3.2);
        group.add(oms);
      });

      // Brazo robótico Canadarm articulado en la bahía de carga
      const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.5, 8);
      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.position.set(0.9, 1.4, 0.5);
      arm.rotation.z = Math.PI / 3;
      group.add(arm);

    } else {
      // 2. Estación Orbital Científica Modular NASA DSCOVR-II / Gateway
      name = 'ESTACIÓN ODYSSEY · REABASTECIMIENTO';
      type = 'satellite';

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        map: goldTex,
        normalMap: goldNormal,
        normalScale: new THREE.Vector2(1.2, 1.2),
        roughness: 0.2,
        metalness: 0.96,
        envMapIntensity: 1.5
      });

      const solarMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        map: solarTex,
        roughness: 0.14,
        metalness: 0.92
      });

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.28,
        metalness: 0.88
      });

      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.45,
        metalness: 0.85
      });

      const windowMat = new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        emissive: 0x004455,
        roughness: 0.08,
        metalness: 0.9
      });

      // Estructura de celosía central principal (Integrated Truss)
      const trussGeo = new THREE.BoxGeometry(0.7, 0.7, 9.6);
      const trussMesh = new THREE.Mesh(trussGeo, darkMat);
      group.add(trussMesh);

      // Módulo central presurizado (Cilindro con escudo micrometeorítico Whipple)
      const habModuleGeo = new THREE.CylinderGeometry(1.6, 1.6, 4.2, 24);
      habModuleGeo.rotateX(Math.PI / 2);
      const habModule = new THREE.Mesh(habModuleGeo, metalMat);
      habModule.position.z = -0.5;
      group.add(habModule);
      window.WorldVisuals.addStationRadiators(group, metalMat);

      // Costillas de blindaje Whipple anticolisión en el módulo
      for (let rz = -2.2; rz <= 1.4; rz += 0.9) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(1.64, 0.05, 8, 24), darkMat);
        rib.position.z = rz;
        group.add(rib);
      }

      // Módulos habitacionales envueltos en Kapton dorado con relieve MLI
      const goldHab1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 2.8), goldMat);
      goldHab1.position.z = 2.2;
      group.add(goldHab1);

      // Cúpula de observación panorámica (Cupola con 7 ventanas)
      const cupolaGeo = new THREE.SphereGeometry(0.85, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const cupola = new THREE.Mesh(cupolaGeo, windowMat);
      cupola.position.set(0, 1.6, -0.5);
      group.add(cupola);

      // Antena parabólica de telecomunicaciones de espacio profundo
      const dishProfile = [];
      for (let i = 0; i <= 20; i++) {
        const radius = i * 0.12;
        dishProfile.push(new THREE.Vector2(radius, radius * radius * 0.14));
      }
      const dishGeo = new THREE.LatheGeometry(dishProfile, 32);
      const dishMesh = new THREE.Mesh(dishGeo, metalMat);
      dishMesh.rotation.x = Math.PI / 2;
      dishMesh.position.set(0, 0, 4.2);
      group.add(dishMesh);

      const feedMesh = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 8), darkMat);
      feedMesh.rotateX(Math.PI / 2);
      feedMesh.position.set(0, 0, 5.2);
      group.add(feedMesh);

      // Radiadores de disipación térmica blancos
      const radGeo = new THREE.BoxGeometry(0.08, 2.8, 3.2);
      const rad = new THREE.Mesh(radGeo, metalMat);
      rad.position.set(0, -2.4, -0.5);
      group.add(rad);

      // Grandes conjuntos dobles de paneles solares articulados
      const solarWingGeo = new THREE.BoxGeometry(7.8, 2.2, 0.12);
      const leftArray = new THREE.Mesh(solarWingGeo, solarMat);
      leftArray.position.set(-6.2, 0, 0);
      group.add(leftArray);

      const rightArray = new THREE.Mesh(solarWingGeo, solarMat);
      rightArray.position.set(6.2, 0, 0);
      group.add(rightArray);
    }

    // Halo holográfico de baliza de acople (verde esmeralda brillante)
    const ringGeo = new THREE.RingGeometry(4.5, 5.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    group.add(ringMesh);

    // Luz estroboscópica de aproximación
    const beaconLight = new THREE.PointLight(0x10b981, 3, 25);
    group.add(beaconLight);

    const spawnX = (Math.random() - 0.5) * 45;
    const spawnY = (Math.random() - 0.5) * 28;
    const spawnZ = -480;

    group.position.set(spawnX, spawnY, spawnZ);
    this.scene.add(group);

    this.stations.push({
      group: group,
      ringMesh: ringMesh,
      name: name,
      type: type,
      docked: false
    });
  }

  disposeHierarchy(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  destroyStation(index) {
    if (index >= 0 && index < this.stations.length) {
      const st = this.stations[index];
      this.disposeHierarchy(st.group);
      this.scene.remove(st.group);
      this.stations.splice(index, 1);
    }
  }

  clear() {
    for (let i = 0; i < this.stations.length; i++) {
      this.disposeHierarchy(this.stations[i].group);
      this.scene.remove(this.stations[i].group);
    }
    this.stations = [];
  }
}

window.DockingStationsManager = DockingStationsManager;
