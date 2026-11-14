/* ==========================================================================
   NASA ODYSSEY // PLANETARY CANYON LANDING & TOUCHDOWN ENGINE
   3D Procedural Canyon Flight, Terrain-Specific Obstacles & Touchdown Sequence
   ========================================================================== */

class PlanetaryLandingEngine {
  constructor(containerId, onTouchdownSuccessCallback, onLandingCrashCallback) {
    this.container = document.getElementById(containerId);
    this.onTouchdownSuccess = onTouchdownSuccessCallback;
    this.onLandingCrash = onLandingCrashCallback;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.ship = null;
    this.planetKey = 'mars';
    this.planetData = null;

    // Estado del Vuelo en Cañón y Física de Velocidad Gradual
    this.isActive = false;
    this.isTouchdownAnimation = false;
    this.canyonDistance = 3000; // 3,000 metros hasta la pista de aterrizaje
    this.altitude = 65; // Metros sobre el fondo del cañón (rango 15m a 110m)
    this.lateralPos = 0;this.lateralVelocity=0;this.altitudeVelocity=0; // Posición horizontal en el cañón (-38m a +38m)
    
    // FÍSICA DE VELOCIDAD Y FRENADO GRADUAL PARA ATERRIZAJE
    this.initialSpeed = 160;
    this.flightSpeed = 160; // m/s actual
    this.minSpeed = 22;     // Velocidad mínima de planeo seguro
    this.maxSpeed = 220;    // Velocidad punta
    this.safeLandingSpeed = 40; // Umbral de aterrizaje suave y seguro (< 40 m/s)
    this.brakeRate = 58;    // m/s² tasa de frenado gradual con retropropulsores
    this.throttleRate = 42; // m/s² tasa de aceleración
    this.isBrakingPedal = false;
    this.isThrottlingPedal = false;
    this.retroSoundCooldown = 0;
    this.hull = 100;

    // ESTACIONAMIENTO Y ATERRIZAJE VERTICAL VTOL
    this.touchdownTimer = 0;
    this.vtolLegsGroup = null;
    this.vtolLegPistons = [];
    this.vtolExhaustPlumes = [];
    this.vtolGroundScorch = null;
    this.vtolDustParticles = [];
    this.vtolDustGroup = null;
    this.vtolSoundPlayed = false;
    this.vtolVentSoundPlayed = false;
    this.savedTouchdownData = null;

    this.keys = { up: false, down: false, left: false, right: false, brake: false, throttle: false };

    // Elementos 3D del Cañón
    this.canyonFloor = null;
    this.leftCliff = null;
    this.rightCliff = null;
    this.obstacles = [];
    this.reentryParticles = [];
    this.reentryGroup = null;
    this.retroThrusterParticles = [];
    this.retroThrusterGroup = null;
    this.outpostGroup = null;
    this.fragments = [];

    // Temporizadores y Reloj
    this.clock = new THREE.Clock();
    this.obstacleSpawnTimer = 0;
    this.warningSoundCooldown = 0;

    // Elementos del DOM
    this.landingScreen = document.getElementById('landing-simulation-screen');
    this.stageTitle = document.getElementById('landing-stage-title');
    this.altValue = document.getElementById('landing-alt-value');
    this.distValue = document.getElementById('landing-dist-value');
    this.trackPct = document.getElementById('landing-track-pct');
    this.trackFill = document.getElementById('landing-track-fill');
    this.shipIcon = document.getElementById('landing-ship-icon');
    this.warningBanner = document.getElementById('terrain-warning-banner');

    // DOM de Velocidad y Pedales Graduales
    this.speedValue = document.getElementById('landing-speed-value');
    this.brakeStatus = document.getElementById('landing-brake-status');
    this.speedCorridorFill = document.getElementById('speed-corridor-fill');
    this.speedCorridorStatus = document.getElementById('speed-corridor-status');
    this.brakePedalBtn = document.getElementById('brake-pedal-btn');
    this.throttlePedalBtn = document.getElementById('throttle-pedal-btn');

    // DOM del Banner de Estado VTOL
    this.vtolStatusHud = document.getElementById('vtol-status-hud');
    this.vtolStatusText = document.getElementById('vtol-status-text');

    this.setupKeyListeners();
  }

  init(sharedRenderer) {
    this.scene = new THREE.Scene();
    this.renderer = sharedRenderer;

    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 6.5, 22);
    this.camera.lookAt(0, 3.5, -45);

    // Luces
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.sunLight.position.set(60, 80, 40);
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight(0x1e293b, 0.6);
    this.scene.add(this.ambientLight);

    // Nave Arwing
    this.ship = new ArwingShipController(this.scene);

    // Grupo de Re-entrada Atmosférica (Llamas de plasma)
    this.buildReentryEffect();

    // Grupo de Retro-Propulsores de Frenado Gradual (Plasma azul hacia adelante)
    this.buildRetroThrusters();

    // Sistema de Tren de Aterrizaje Vertical VTOL y Efectos en Tierra
    this.buildVTOLLandingGearAndEffects();
  }

  setupKeyListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActive || this.isTouchdownAnimation || e.target?.closest?.('input,select,textarea,dialog')) return;
      if (e.code === 'KeyW') {
        this.keys.throttle = true;
      }
      if (e.code === 'KeyS') {
        this.keys.brake = true;
      }
      if ((e.code === 'ArrowUp' || e.code === 'KeyQ')) {
        this.keys.up = true;
      }
      if ((e.code === 'ArrowDown' || e.code === 'KeyE')) {
        this.keys.down = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        this.keys.brake = true;
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW') {
        this.keys.throttle = false;
      }
      if (e.code === 'KeyS') {
        this.keys.brake = false;
      }
      if ((e.code === 'ArrowUp' || e.code === 'KeyQ')) {
        this.keys.up = false;
      }
      if ((e.code === 'ArrowDown' || e.code === 'KeyE')) {
        this.keys.down = false;
      }
      if (e.code === 'Space') {
        this.keys.brake = false;
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
    });

    // Conectar botones interactivos de pedales (Clic / Pantalla táctil)
    if (this.brakePedalBtn) {
      const onBrakeStart = (e) => {
        e.preventDefault();
        this.isBrakingPedal = true;
        this.brakePedalBtn.classList.add('active-pressed');
      };
      const onBrakeEnd = (e) => {
        e.preventDefault();
        this.isBrakingPedal = false;
        this.brakePedalBtn.classList.remove('active-pressed');
      };
      this.brakePedalBtn.addEventListener('mousedown', onBrakeStart);
      this.brakePedalBtn.addEventListener('mouseup', onBrakeEnd);
      this.brakePedalBtn.addEventListener('mouseleave', onBrakeEnd);
      this.brakePedalBtn.addEventListener('touchstart', onBrakeStart, { passive: false });
      this.brakePedalBtn.addEventListener('touchend', onBrakeEnd, { passive: false });
    }

    if (this.throttlePedalBtn) {
      const onThrottleStart = (e) => {
        e.preventDefault();
        this.isThrottlingPedal = true;
        this.throttlePedalBtn.classList.add('active-pressed');
      };
      const onThrottleEnd = (e) => {
        e.preventDefault();
        this.isThrottlingPedal = false;
        this.throttlePedalBtn.classList.remove('active-pressed');
      };
      this.throttlePedalBtn.addEventListener('mousedown', onThrottleStart);
      this.throttlePedalBtn.addEventListener('mouseup', onThrottleEnd);
      this.throttlePedalBtn.addEventListener('mouseleave', onThrottleEnd);
      this.throttlePedalBtn.addEventListener('touchstart', onThrottleStart, { passive: false });
      this.throttlePedalBtn.addEventListener('touchend', onThrottleEnd, { passive: false });
    }
  }

  buildReentryEffect() {
    this.reentryGroup = new THREE.Group();
    const particleCount = 70;
    const geo = new THREE.SphereGeometry(0.35, 4, 4);

    for (let i = 0; i < particleCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.4 ? 0xf97316 : 0xef4444,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      const p = new THREE.Mesh(geo, mat);
      p.visible = false;
      this.reentryGroup.add(p);
      this.reentryParticles.push(p);
    }
    this.scene.add(this.reentryGroup);
  }

  buildRetroThrusters() {
    this.retroThrusterGroup = new THREE.Group();
    const particleCount = 50;
    const geo = new THREE.ConeGeometry(0.35, 2.2, 6);
    geo.rotateX(-Math.PI / 2); // Orientadas hacia adelante para frenado

    for (let i = 0; i < particleCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.35 ? 0x00f3ff : 0x38bdf8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const p = new THREE.Mesh(geo, mat);
      p.visible = false;
      this.retroThrusterGroup.add(p);
      this.retroThrusterParticles.push({
        mesh: p,
        speed: 15 + Math.random() * 25,
        offset: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 1.5,
          Math.random() * 4
        )
      });
    }
    this.scene.add(this.retroThrusterGroup);
  }

  updateRetroThrusters(delta, isBraking) {
    if (!this.retroThrusterGroup) return;

    if (!isBraking) {
      this.retroThrusterParticles.forEach((item) => { item.mesh.visible = false; });
      return;
    }

    const shipPos = this.ship.position;
    this.retroThrusterParticles.forEach((item, idx) => {
      const p = item.mesh;
      p.visible = true;
      p.position.set(
        shipPos.x + (idx % 2 === 0 ? -4.2 : 4.2) + (Math.random() - 0.5) * 0.8,
        shipPos.y + (Math.random() - 0.5) * 0.6,
        shipPos.z + 2.5 + Math.random() * 4.5
      );
      const scale = 0.6 + Math.random() * 0.8;
      p.scale.set(scale, scale, scale);
    });
  }

  /* ========================================================================
     SISTEMA PROCEDURAL DE TREN DE ATERRIZAJE VERTICAL VTOL Y EFECTOS EN TIERRA
     ======================================================================== */
  buildVTOLLandingGearAndEffects() {
    if (!this.ship || !this.ship.shipGroup) return;

    // 1. Grupo de Patas de Aterrizaje Telescópicas (Ancladas al chasis de la Arwing)
    this.vtolLegsGroup = new THREE.Group();
    this.vtolLegPistons = [];

    const darkTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.2
    });
    const chromePistonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.08
    });
    const footpadMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.88,
      roughness: 0.35
    });
    const sensorGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

    // Cuatro Patas de Aterrizaje Telescópicas en cuadrantes diagonales
    // [Arriba-Izquierda, Arriba-Derecha, Abajo-Izquierda, Abajo-Derecha]
    const legConfigs = [
      { anchorX: -2.4, anchorY: 0.7, spreadX: -1.3, spreadY: 0.5 },
      { anchorX: 2.4, anchorY: 0.7, spreadX: 1.3, spreadY: 0.5 },
      { anchorX: -2.4, anchorY: -0.7, spreadX: -1.3, spreadY: -0.5 },
      { anchorX: 2.4, anchorY: -0.7, spreadX: 1.3, spreadY: -0.5 }
    ];

    legConfigs.forEach(cfg => {
      const legGroup = new THREE.Group();
      legGroup.position.set(cfg.anchorX, cfg.anchorY, -2.6);

      // Cilindro hidráulico exterior principal
      const upperStrutGeo = new THREE.CylinderGeometry(0.24, 0.28, 2.5, 12);
      upperStrutGeo.rotateX(Math.PI / 2); // Orientado hacia -Z (hacia abajo al colocarse vertical)
      const upperStrut = new THREE.Mesh(upperStrutGeo, darkTitaniumMat);
      upperStrut.position.set(cfg.spreadX * 0.3, cfg.spreadY * 0.3, -1.25);
      legGroup.add(upperStrut);

      // Brazo estabilizador en tijera (truss diagonal)
      const trussGeo = new THREE.BoxGeometry(0.12, 0.14, 2.2);
      const truss = new THREE.Mesh(trussGeo, darkTitaniumMat);
      truss.position.set(cfg.spreadX * 0.15, cfg.spreadY * 0.15, -1.0);
      legGroup.add(truss);

      // Pistón cromado telescópico extensible
      const pistonGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.6, 12);
      pistonGeo.rotateX(Math.PI / 2);
      const pistonMesh = new THREE.Mesh(pistonGeo, chromePistonMat);
      pistonMesh.position.set(cfg.spreadX * 0.7, cfg.spreadY * 0.7, -2.8);
      legGroup.add(pistonMesh);

      // Zapata circular ancha de contacto en tierra (Footpad)
      const padGeo = new THREE.CylinderGeometry(0.72, 0.85, 0.24, 16);
      padGeo.rotateX(Math.PI / 2);
      const footpad = new THREE.Mesh(padGeo, footpadMat);
      footpad.position.set(cfg.spreadX * 0.9, cfg.spreadY * 0.9, -4.1);
      legGroup.add(footpad);

      // Anillo sensor LED de contacto seguro en la base de la zapata
      const contactSensor = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.05, 8, 16), sensorGlowMat);
      contactSensor.position.set(cfg.spreadX * 0.9, cfg.spreadY * 0.9, -4.22);
      legGroup.add(contactSensor);

      // Estado inicial: recogidas / plegadas
      legGroup.scale.set(0.2, 0.2, 0.2);
      legGroup.visible = false;

      this.vtolLegsGroup.add(legGroup);
      this.vtolLegPistons.push(legGroup);
    });

    this.ship.shipGroup.add(this.vtolLegsGroup);

    // 2. Chorro de plasma vertical de aterrizaje (hacia abajo, local -Z)
    this.vtolExhaustPlumes = [];
    [-1.2, 1.2].forEach(xP => {
      const plumeGeo = new THREE.ConeGeometry(0.75, 5.8, 16);
      plumeGeo.rotateX(Math.PI / 2); // Punta hacia -Z
      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending
      });
      const plume = new THREE.Mesh(plumeGeo, plumeMat);
      plume.position.set(xP, -0.15, -6.5);
      this.ship.shipGroup.add(plume);
      this.vtolExhaustPlumes.push(plume);
    });

    // 3. Disco térmico en el suelo de la pista de aterrizaje
    const scorchGeo = new THREE.RingGeometry(2.0, 9.5, 36);
    scorchGeo.rotateX(-Math.PI / 2);
    const scorchMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.vtolGroundScorch = new THREE.Mesh(scorchGeo, scorchMat);
    this.vtolGroundScorch.position.set(0, 3.32, 0);
    this.scene.add(this.vtolGroundScorch);

    // 4. Polvo y humo radial en tierra al tocar la pista
    this.vtolDustGroup = new THREE.Group();
    this.vtolDustParticles = [];
    const dustCount = 45;
    const pDustGeo = new THREE.SphereGeometry(0.45, 6, 6);
    const pDustMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.0
    });

    for (let i = 0; i < dustCount; i++) {
      const p = new THREE.Mesh(pDustGeo, pDustMat.clone());
      p.visible = false;
      this.vtolDustGroup.add(p);
      this.vtolDustParticles.push({
        mesh: p,
        angle: (i / dustCount) * Math.PI * 2,
        dist: 0,
        speed: 12 + Math.random() * 18,
        active: false
      });
    }
    this.scene.add(this.vtolDustGroup);
  }

  triggerGroundDustRing() {
    if (!this.vtolDustParticles) return;
    this.vtolDustParticles.forEach(p => {
      if (!p.active && Math.random() > 0.4) {
        p.active = true;
        p.dist = 2.0;
        p.mesh.visible = true;
        p.mesh.position.set(
          Math.cos(p.angle) * p.dist,
          3.35 + Math.random() * 0.4,
          Math.sin(p.angle) * p.dist
        );
        p.mesh.scale.setScalar(0.4 + Math.random() * 0.4);
        p.mesh.material.opacity = 0.7;
      }
    });
  }

  updateGroundDust(delta) {
    if (!this.vtolDustParticles) return;
    this.vtolDustParticles.forEach(p => {
      if (p.active) {
        p.dist += p.speed * delta;
        p.mesh.position.x = Math.cos(p.angle) * p.dist;
        p.mesh.position.z = Math.sin(p.angle) * p.dist;
        p.mesh.scale.multiplyScalar(1.0 + delta * 2.5);
        p.mesh.material.opacity -= delta * 1.8;
        if (p.mesh.material.opacity <= 0.02 || p.dist > 28) {
          p.active = false;
          p.mesh.visible = false;
          p.mesh.material.opacity = 0;
        }
      }
    });
  }

  /* ========================================================================
     INICIAR DESCENSO ATMOSFÉRICO & VUELO EN CAÑÓN PLANETARIO
     ======================================================================== */
  startDescent(planetKey, currentHull = 100) {
    this.planetKey = planetKey;
    this.planetData = NASA_PLANETARY_DATABASE[planetKey] || NASA_PLANETARY_DATABASE.mars;
    this.hull = currentHull;

    this.canyonDistance = 3000;
    this.altitude = 65;
    this.lateralPos = 0;this.lateralVelocity=0;this.altitudeVelocity=0;
    this.flightSpeed = 160;
    this.isBrakingPedal = false;
    this.isThrottlingPedal = false;
    this.isActive = true;
    this.isTouchdownAnimation = false;

    // Resetear Estado VTOL
    this.touchdownTimer = 0;
    this.playedLegLockSound = false;
    this.playedContactVent = false;
    this.triggeredPreTouchdownDust = false;
    this.savedTouchdownData = null;
    if (this.vtolLegsGroup) this.vtolLegsGroup.visible = false;
    if (this.vtolGroundScorch) this.vtolGroundScorch.material.opacity = 0;
    if (this.vtolStatusHud) this.vtolStatusHud.classList.remove('active');
    if (this.vtolExhaustPlumes) this.vtolExhaustPlumes.forEach(p => { p.material.opacity = 0; });

    // Configurar Atmósfera y Niebla según el Planeta
    const skyCol = this.planetData.skyColor || 0x451a03;
    const fogDense = this.planetData.fogDensity || 0.007;
    this.scene.background = new THREE.Color(skyCol);
    this.scene.fog = new THREE.FogExp2(skyCol, fogDense);

    this.sunLight.color.setHex(this.planetKey === 'venus' ? 0xfef08a : 0xffffff);

    // Construir Cañón Procedural 3D del Planeta
    this.buildPlanetaryCanyon();

    // Construir Base de Aterrizaje de la NASA al final del cañón
    this.buildLandingOutpost();

    // Actualizar HUD
    if (this.stageTitle) {
      this.stageTitle.textContent = `DESCENSO // ${this.planetData.landingSiteName.toUpperCase()}`;
    }
    if (this.landingScreen) {
      this.landingScreen.classList.add('active');
    }

    // Efecto Sonoro de Re-entrada
    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.playReentryRoar();
      window.spaceAudio.startThrusterSound();
    }

    this.clock.start();
  }

  createCliffGeometry(width,height,depth){
    const geometry=new THREE.BoxGeometry(width,height,depth,10,18,72),p=geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ridge=Math.sin(z*.019+Math.sin(y*.031)*1.4)*4+Math.cos(z*.057+y*.045)*2;
      p.setXYZ(i,x+Math.sign(x)*ridge,y+(y/height+.5)*(Math.sin(z*.022)*13+Math.cos(z*.043)*6),z);
    }geometry.computeVertexNormals();return geometry;
  }

  buildPlanetaryCanyon() {
    // Limpiar cañón previo si existe
    if (this.canyonFloor) this.scene.remove(this.canyonFloor);
    if (this.canyonStars) this.scene.remove(this.canyonStars);
    if (this.leftCliff) this.scene.remove(this.leftCliff);
    if (this.rightCliff) this.scene.remove(this.rightCliff);
    if (this.bouldersGroup) this.scene.remove(this.bouldersGroup);
    if (this.spiresGroup) this.scene.remove(this.spiresGroup);
    if (this.horizonMountainsGroup) this.scene.remove(this.horizonMountainsGroup);
    this.clearObstacles();

    const terrainCol = ({moon:0x77766e,mercury:0x665e54,mars:0x98553b,earth:0x65794d,venus:0x8e723b})[this.planetKey]||0x9a3412;
    const wallCol = ({moon:0x6e6d67,mercury:0x655b50,mars:0x884733,earth:0x6c7053,venus:0x816535})[this.planetKey]||0xc2410c;
    const skyCol = this.planetData.skyColor || 0x451a03;

    // Niebla atmosférica realista calibrada con la atmósfera planetaria
    const airless=['moon','mercury'].includes(this.planetKey);
    this.scene.background=new THREE.Color(airless?0x020308:skyCol);
    this.scene.fog=airless?null:new THREE.FogExp2(skyCol,this.planetKey==='venus'?.006:this.planetKey==='mars'?.0015:.0022);

    // Textura PBR Geológica Estratificada según datos científicos de la NASA
    const canyonTex = window.nasaApi ? window.nasaApi.createCanyonTerrainTexture(terrainCol, wallCol) : null;
    if (canyonTex) {
      canyonTex.repeat.set(3, 6);
    }

    if (airless) {
      const starGeo = new THREE.BufferGeometry();
      const sPos = new Float32Array(500 * 3);
      for (let s = 0; s < 500; s++) {
        sPos[s * 3] = (Math.random() - 0.5) * 800;
        sPos[s * 3 + 1] = 80 + Math.random() * 250;
        sPos[s * 3 + 2] = -Math.random() * 800;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      this.canyonStars = new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: 0xdae8ff,
        size: 1.2,
        sizeAttenuation: false
      }));
      this.scene.add(this.canyonStars);
    }

    // 1. Suelo del Cañón: Valle de Erosión Aluvial con Lecho Central y Terrazas Escarpadas
    const floorGeo = new THREE.PlaneGeometry(160, 720, 96, 120);
    floorGeo.rotateX(-Math.PI / 2);
    const pos = floorGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const absX = Math.abs(x);

      // Valle central más bajo (corredor de aproximación) y laderas escarpadas en los bordes
      let height = 0;
      if (absX > 26) {
        const t = (absX - 26) / 54;
        height = Math.pow(t, 1.8) * 34.0; // Rampa de talud lateral escarpada
      }

      // Ondulaciones geológicas multi-frecuencia (lecho seco, dunas de arena y estratos)
      const riverbed = Math.sin(z * 0.035 + x * 0.02) * 3.6;
      const dunes = Math.sin(x * 0.16 + z * 0.08) * 2.2 + Math.cos(z * 0.12) * 1.4;
      const gravel = (Math.sin(x * 0.8) * Math.cos(z * 0.6)) * 0.5;

      let relief=riverbed+dunes+gravel;
      if(airless){relief=gravel*.6;for(let c=0;c<12;c++){const cx=Math.sin(c*9.2)*28,cz=-330+c*58,d=Math.hypot(x-cx,z-cz)/(7+c%4);relief+=-3*Math.exp(-d*d*2)+1.1*Math.exp(-Math.pow((d-1)*5,2));}}
      pos.setY(i,height+relief);
    }
    floorGeo.computeVertexNormals();

    const floorMat = new THREE.MeshStandardMaterial({
      color: terrainCol,
      map: canyonTex,
      roughness: 0.88,
      metalness: 0.12
    });
    this.canyonFloor = new THREE.Mesh(floorGeo, floorMat);
    this.canyonFloor.position.set(0, 0, -220);
    this.scene.add(this.canyonFloor);

    // 2. Desfiladeros y Mesas Escarpadas en Niveles (Paredes Estratificadas con Terrazas)
    const buildMesaCliffs = (isLeft) => {
      const group = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      const cliffMat = new THREE.MeshStandardMaterial({
        color: wallCol,
        map: canyonTex,
        roughness: 0.84,
        metalness: 0.16
      });

      // Nivel 1: Talud inferior inclinado (Scree slope apron)
      const tier1Geo = this.createCliffGeometry(22, 60, 720);
      const tier1 = new THREE.Mesh(tier1Geo, cliffMat);
      tier1.position.set(sign * 68, 25, -220);
      tier1.rotation.z = sign * 0.12;
      group.add(tier1);

      // Nivel 2: Cornisa vertical de roca masiva (Sedimentary bench)
      const tier2Geo = this.createCliffGeometry(26, 95, 720);
      const tier2 = new THREE.Mesh(tier2Geo, cliffMat);
      tier2.position.set(sign * 84, 70, -220);
      group.add(tier2);

      // Nivel 3: Borde superior y meseta alta (Tableland rim con salientes)
      const tier3Geo = this.createCliffGeometry(32, 70, 720);
      const tier3 = new THREE.Mesh(tier3Geo, cliffMat);
      tier3.position.set(sign * 105, 125, -220);
      tier3.rotation.z = sign * -0.06;
      group.add(tier3);

      return group;
    };

    this.leftCliff = buildMesaCliffs(true);
    this.scene.add(this.leftCliff);

    this.rightCliff = buildMesaCliffs(false);
    this.scene.add(this.rightCliff);

    // 3. Agujas Rocosas y Spiras Geológicas (Hoodoos) a los Lados del Cañón
    this.spiresGroup = new THREE.Group();
    const spireMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(wallCol).offsetHSL(0, -0.05, -0.05),
      roughness: 0.92,
      metalness: 0.08
    });

    for (let s = 0; s < 0; s++) {
      const side = s % 2 === 0 ? -1 : 1;
      const sHeight = 18 + Math.random() * 30;
      const sRadius = 4 + Math.random() * 6;
      const spireMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(sRadius, 1), spireMat);
      spireMesh.scale.set(1,sHeight/(sRadius*2),1);
      const sx = side * (46 + Math.random() * 14);
      const sz = -50 - (s * 36) + (Math.random() - 0.5) * 15;
      spireMesh.position.set(sx, sHeight / 2 - 2, sz);
      spireMesh.rotation.y = Math.random() * Math.PI;
      spireMesh.rotation.z = side * (Math.random() * 0.08);
      this.spiresGroup.add(spireMesh);
    }
    this.scene.add(this.spiresGroup);

    // 4. Bloques Rocosos y Boulders Dispersos en el Cañón
    this.bouldersGroup = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(terrainCol).offsetHSL(0, -0.1, -0.1),
      roughness: 0.94,
      metalness: 0.1
    });
    const rockGeo = new THREE.DodecahedronGeometry(1.0, 1);
    const rp=rockGeo.attributes.position;for(let k=0;k<rp.count;k++){const x=rp.getX(k),y=rp.getY(k),z=rp.getZ(k),n=1+.18*Math.sin(x*12+y*7+z*5);rp.setXYZ(k,x*n,y*n,z*n);}rockGeo.computeVertexNormals();

    for (let b = 0; b < 45; b++) {
      const bMesh = new THREE.Mesh(rockGeo, rockMat);
      const bx = (Math.random() - 0.5) * 65;
      const bz = -30 - Math.random() * 520;
      const scale = 2.0 + Math.random() * 4.5;
      bMesh.scale.set(scale, scale * (0.6 + Math.random() * 0.6), scale);
      bMesh.position.set(bx, scale * 0.5, bz);
      bMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.bouldersGroup.add(bMesh);
    }
    this.scene.add(this.bouldersGroup);

    // 5. Cadena Montañosa Multi-Capa en el Horizonte Planetario (3 Niveles de Profundidad con Siluetas Escarpadas)
    this.horizonMountainsGroup = new THREE.Group();

    // Capa 1: Riscos cercanos y crestas agudas
    const nearRidgeMat = new THREE.MeshStandardMaterial({ color: wallCol, roughness: 0.92, metalness: 0.08 });
    for (let m = 0; m < 14; m++) {
      const mHeight = 85 + Math.random() * 70;
      const mRadius = 35 + Math.random() * 40;
      const mMesh = new THREE.Mesh(new THREE.ConeGeometry(mRadius, mHeight, 6), nearRidgeMat);
      mMesh.position.set((m - 7) * 45 + (Math.random() - 0.5) * 15, mHeight / 2 - 10, -520 - Math.random() * 60);
      this.horizonMountainsGroup.add(mMesh);
    }

    // Capa 2: Cordillera media escarpada
    const midRidgeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(wallCol).lerp(new THREE.Color(skyCol), 0.35),
      roughness: 0.96
    });
    for (let m = 0; m < 16; m++) {
      const mHeight = 130 + Math.random() * 110;
      const mRadius = 55 + Math.random() * 50;
      const mMesh = new THREE.Mesh(new THREE.ConeGeometry(mRadius, mHeight, 7), midRidgeMat);
      mMesh.position.set((m - 8) * 55 + (Math.random() - 0.5) * 25, mHeight / 2 - 15, -660 - Math.random() * 80);
      this.horizonMountainsGroup.add(mMesh);
    }

    // Capa 3: Picos volcánicos titánicos de fondo difuminados en la niebla
    const peakMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skyCol).lerp(new THREE.Color(wallCol), 0.22),
      roughness: 0.98
    });
    for (let m = 0; m < 9; m++) {
      const mHeight = 260 + Math.random() * 160;
      const mRadius = 110 + Math.random() * 95;
      const mMesh = new THREE.Mesh(new THREE.ConeGeometry(mRadius, mHeight, 8), peakMat);
      mMesh.position.set((m - 4.5) * 105 + (Math.random() - 0.5) * 40, mHeight / 2 - 20, -840 - Math.random() * 90);
      this.horizonMountainsGroup.add(mMesh);
    }

    this.scene.add(this.horizonMountainsGroup);

    // 6. Polvo Atmosférico Flotante y Viento en el Cañón
    if (this.canyonDustMesh) this.scene.remove(this.canyonDustMesh);
    const dustCount = airless?0:this.planetKey==='mars'?100:180;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let d = 0; d < dustCount * 3; d += 3) {
      dustPositions[d] = (Math.random() - 0.5) * 130;
      dustPositions[d + 1] = Math.random() * 65;
      dustPositions[d + 2] = -Math.random() * 520;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: wallCol,
      size: .22,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });
    this.canyonDustMesh = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.canyonDustMesh);
  }

  buildLandingOutpost() {
    if (this.outpostGroup) this.scene.remove(this.outpostGroup);
    this.outpostGroup = new THREE.Group();
    this.outpostGroup.position.set(0, 0, -450); // Al final del cañón

    const solarTex = window.nasaApi ? window.nasaApi.createSolarPanelTexture() : null;

    // 1. Pista de aterrizaje circular con balizas LED y marcas de aproximación
    const padGeo = new THREE.CylinderGeometry(32, 34, 3.2, 36);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.88, roughness: 0.2 });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.y = 1.6;
    this.outpostGroup.add(padMesh);

    // Círculo exterior iluminado de toma de tierra (NASA Target)
    const targetGeo = new THREE.RingGeometry(7.0, 9.8, 36);
    targetGeo.rotateX(-Math.PI / 2);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, side: THREE.DoubleSide });
    const targetMesh = new THREE.Mesh(targetGeo, targetMat);
    targetMesh.position.y = 3.3;
    this.outpostGroup.add(targetMesh);

    // Anillo interior concéntrico VTOL (Bullseye de alineación)
    const innerTargetGeo = new THREE.RingGeometry(2.2, 3.2, 36);
    innerTargetGeo.rotateX(-Math.PI / 2);
    const innerTargetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const innerTargetMesh = new THREE.Mesh(innerTargetGeo, innerTargetMat);
    innerTargetMesh.position.y = 3.31;
    this.outpostGroup.add(innerTargetMesh);

    // Cruz de alineación VTOL (Eje X y Eje Z)
    const crossGeoX = new THREE.PlaneGeometry(16, 0.4);
    crossGeoX.rotateX(-Math.PI / 2);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide });
    const crossX = new THREE.Mesh(crossGeoX, crossMat);
    crossX.position.y = 3.305;
    this.outpostGroup.add(crossX);

    const crossGeoZ = new THREE.PlaneGeometry(0.4, 16);
    crossGeoZ.rotateX(-Math.PI / 2);
    const crossZ = new THREE.Mesh(crossGeoZ, crossMat);
    crossZ.position.y = 3.305;
    this.outpostGroup.add(crossZ);

    // 4 Zapatas de anclaje VTOL en el suelo de la pista (Target contact pads de las 4 patas)
    const contactPadGeo = new THREE.RingGeometry(0.65, 1.25, 16);
    contactPadGeo.rotateX(-Math.PI / 2);
    const contactPadMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    [
      { x: -3.57, z: -1.15 },
      { x:  3.57, z: -1.15 },
      { x: -3.57, z:  1.15 },
      { x:  3.57, z:  1.15 }
    ].forEach(pos => {
      const padTarget = new THREE.Mesh(contactPadGeo, contactPadMat);
      padTarget.position.set(pos.x, 3.32, pos.z);
      this.outpostGroup.add(padTarget);

      // Baliza LED ámbar en el centro de cada zapata de aterrizaje
      const ledGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(pos.x, 3.38, pos.z);
      this.outpostGroup.add(led);
    });

    // Balizas LED perimetrales de pista (Aproximación ILS iluminada)
    const beaconGeo = new THREE.SphereGeometry(1.0, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
      const b = new THREE.Mesh(beaconGeo, beaconMat);
      b.position.set(Math.cos(a) * 30, 3.6, Math.sin(a) * 30);
      this.outpostGroup.add(b);
    }

    // Luces de aproximación en línea recta ("Rabbit Lights" de pista)
    this.rabbitLights = [];
    const rabbitGeo = new THREE.SphereGeometry(0.7, 8, 8);
    const rabbitMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let r = 0; r < 8; r++) {
      const rl = new THREE.Mesh(rabbitGeo, rabbitMat.clone());
      rl.position.set(0, 2.8, 35 + r * 16);
      this.outpostGroup.add(rl);
      this.rabbitLights.push(rl);
    }

    // 2. Módulos Habitacionales Geodésicos de la NASA con ventanas iluminadas
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      metalness: 0.88
    });
    const mainDome = new THREE.Mesh(new THREE.SphereGeometry(13, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    mainDome.position.set(-46, 0, -32);
    this.outpostGroup.add(mainDome);

    const subDome = new THREE.Mesh(new THREE.SphereGeometry(8.5, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    subDome.position.set(-30, 0, -45);
    this.outpostGroup.add(subDome);

    // Ventanas cálidas iluminadas del hábitat
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.4), windowMat);
    win1.position.set(-46, 5.0, -19);
    this.outpostGroup.add(win1);

    // Granja de Paneles Solares de la Base
    const farmPanelMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, map: solarTex, roughness: 0.15, metalness: 0.9 });
    for (let p = 0; p < 4; p++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.2, 0.14), farmPanelMat);
      panel.position.set(-52 + p * 8, 2.2, 10);
      panel.rotation.x = -Math.PI / 6;
      this.outpostGroup.add(panel);
    }

    // 3. Torre de Control y Antena Parabólica de Comunicaciones
    const towerGeo = new THREE.CylinderGeometry(1.4, 2.0, 24, 16);
    const tower = new THREE.Mesh(towerGeo, domeMat);
    tower.position.set(48, 12, -26);
    this.outpostGroup.add(tower);

    const dishGeo = new THREE.CylinderGeometry(0.7, 5.5, 1.4, 20);
    dishGeo.rotateX(Math.PI / 2.4);
    const dish = new THREE.Mesh(dishGeo, domeMat);
    dish.position.set(48, 25, -26);
    this.outpostGroup.add(dish);

    // Baliza estroboscópica roja superior de la torre
    const towerBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    towerBeacon.position.set(48, 28, -26);
    this.outpostGroup.add(towerBeacon);

    // 4. Complejo de Laboratorio y Hangar Modular de la Base (Procedural de Alto Rendimiento)
    const hangarGeo = new THREE.BoxGeometry(16, 7.5, 20);
    const hangarMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.25
    });
    const hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.position.set(42, 3.75, 15);
    this.outpostGroup.add(hangar);

    // Techo arqueado semicilíndrico del hangar
    const roofGeo = new THREE.CylinderGeometry(8, 8, 20, 16, 1, false, 0, Math.PI);
    roofGeo.rotateZ(-Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, hangarMat);
    roof.position.set(42, 7.5, 15);
    this.outpostGroup.add(roof);

    // Compuerta presurizada frontal iluminada
    const gateGeo = new THREE.PlaneGeometry(7.5, 5.5);
    const gateMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(42, 2.75, 25.05);
    this.outpostGroup.add(gate);

    this.outpostGroup.visible = false;
    this.scene.add(this.outpostGroup);
  }

  update() {
    if (!this.isActive && !this.isTouchdownAnimation) return;
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // ========================================================================
    // SECUENCIA DE ESTACIONAMIENTO VERTICAL // VTOL TOUCHDOWN
    // ========================================================================
    if (this.isTouchdownAnimation) {
      this.touchdownTimer += delta;
      const t = this.touchdownTimer;

      // Actualizar partículas de polvo en tierra
      this.updateGroundDust(delta);

      // Centrar gradualmente la nave sobre la plataforma (X=0, Z=0)
      this.ship.position.x = THREE.MathUtils.lerp(this.ship.position.x, 0, 0.06);
      this.ship.position.z = THREE.MathUtils.lerp(this.ship.position.z, 0, 0.06);

      // Neutralizar balanceos laterales de alerones
      this.ship.shipGroup.rotation.z = THREE.MathUtils.lerp(this.ship.shipGroup.rotation.z, 0, 0.08);
      this.ship.shipGroup.rotation.y = THREE.MathUtils.lerp(this.ship.shipGroup.rotation.y, 0, 0.08);

      // FASE 1: FLARE VERTICAL (0.0s - 1.6s) -> Rotar 90° morro arriba, desplegar patas
      if (t < 1.6) {
        // Transición de cabeceo horizontal a vertical 90° (Math.PI / 2)
        const targetPitch = Math.PI / 2;
        this.ship.shipGroup.rotation.x = THREE.MathUtils.lerp(this.ship.shipGroup.rotation.x, targetPitch, 0.07);

        // Despliegue telescópico del tren de aterrizaje de 4 patas
        const deployScale = Math.min(1.0, Math.max(0.2, t / 1.3));
        if (this.vtolLegPistons) {
          this.vtolLegPistons.forEach(leg => {
            leg.visible = true;
            leg.scale.set(deployScale, deployScale, deployScale);
          });
        }

        // Sonido hidráulico de despliegue y bloqueo de patas
        if (t >= 0.35 && !this.playedLegLockSound) {
          this.playedLegLockSound = true;
          if (window.spaceAudio && window.spaceAudio.playHydraulicLegLockSound) {
            window.spaceAudio.playHydraulicLegLockSound();
          }
        }

        // Mantener altura de planeo/flare
        this.ship.position.y = THREE.MathUtils.lerp(this.ship.position.y, 20.0, 0.04);

        // Llamaradas verticales de retro-frenado activas
        if (this.vtolExhaustPlumes) {
          const plumeIntensity = 0.7 + Math.sin(t * 25) * 0.25;
          this.vtolExhaustPlumes.forEach(p => {
            p.material.opacity = plumeIntensity;
            p.scale.set(1.0 + Math.random() * 0.2, 1.0 + Math.random() * 0.3, 1.0);
          });
        }

        // Reflejo térmico inicial en la pista
        if (this.vtolGroundScorch) {
          this.vtolGroundScorch.material.opacity = Math.min(0.4, t * 0.25);
          this.vtolGroundScorch.scale.setScalar(0.7);
        }

        // HUD Status
        if (this.vtolStatusHud) this.vtolStatusHud.classList.add('active');
        if (this.vtolStatusText) this.vtolStatusText.textContent = 'MANIOBRA FLARE // ROTACIÓN VERTICAL 90° & DESPLIEGUE HIDRÁULICO';

        // Cámara: perspectiva de aproximación baja y frontal
        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, 0, 0.05);
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 8, 0.05);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 26, 0.05);
        this.camera.lookAt(0, this.ship.position.y * 0.8, 0);

      // FASE 2: DESCENSO VERTICAL VTOL (1.6s - 3.4s) -> Bajar suavemente hacia la pista
      } else if (t < 3.4) {
        // Asegurar orientación vertical estricta 90°
        this.ship.shipGroup.rotation.x = THREE.MathUtils.lerp(this.ship.shipGroup.rotation.x, Math.PI / 2, 0.12);

        // Descenso hacia altura de contacto (Y = 10.0 con zapatas tocando a 3.3)
        const descendT = (t - 1.6) / 1.8;
        this.ship.position.y = THREE.MathUtils.lerp(this.ship.position.y, 10.0, 0.06);

        // Patas 100% extendidas
        if (this.vtolLegPistons) {
          this.vtolLegPistons.forEach(leg => {
            leg.visible = true;
            leg.scale.set(1.0, 1.0, 1.0);
          });
        }

        // Plumas de plasma vertical a máxima potencia sosteniendo el peso
        if (this.vtolExhaustPlumes) {
          const plumeIntensity = 0.85 + Math.sin(t * 30) * 0.15;
          this.vtolExhaustPlumes.forEach(p => {
            p.material.opacity = plumeIntensity;
            p.scale.set(1.0 + Math.sin(t * 20) * 0.15, 1.2 + Math.cos(t * 20) * 0.2, 1.0);
          });
        }

        // Disco térmico en tierra crece en intensidad y tamaño al acercarse
        if (this.vtolGroundScorch) {
          this.vtolGroundScorch.material.opacity = 0.4 + descendT * 0.45;
          this.vtolGroundScorch.scale.setScalar(0.8 + descendT * 0.5);
        }

        // Desencadenar onda de polvo radial según nos acercamos a la pista
        if (t >= 2.6 && !this.triggeredPreTouchdownDust) {
          this.triggeredPreTouchdownDust = true;
          this.triggerGroundDustRing();
        }

        // HUD Status
        if (this.vtolStatusText) this.vtolStatusText.textContent = 'DESCENSO CONTROLADO VTOL // APROXIMACIÓN A ZAPATAS DE CONTACTO';

        // Cámara: toma dramática angular
        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, 9, 0.04);
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 6.5, 0.04);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 23, 0.04);
        this.camera.lookAt(0, this.ship.position.y * 0.6, 0);

      // FASE 3: CONTACTO EN TIERRA & AMORTIGUACIÓN NEUMÁTICA (3.4s - 4.4s)
      } else if (t < 4.4) {
        this.ship.shipGroup.rotation.x = Math.PI / 2;

        // Amortiguación armónica amortiguada (rebote de compresión en las zapatas)
        const bounceT = t - 3.4;
        const bounceDamping = Math.exp(-bounceT * 4.5);
        const compression = Math.max(0, Math.sin(bounceT * 12.0) * bounceDamping * 0.45);
        this.ship.position.y = 10.0 - compression;

        // Compresión de pistones hidráulicos
        if (this.vtolLegPistons) {
          const compScale = 1.0 - compression * 0.12;
          this.vtolLegPistons.forEach(leg => {
            leg.scale.set(1.0, 1.0, compScale);
          });
        }

        // Al tocar tierra: apagar propulsores y purgar vapor/aire
        if (!this.playedContactVent) {
          this.playedContactVent = true;
          this.triggerGroundDustRing();
          if (window.spaceAudio) {
            window.spaceAudio.stopThrusterSound();
            if (window.spaceAudio.playPneumaticVentSound) {
              window.spaceAudio.playPneumaticVentSound();
            }
          }
        }

        // Apagar plumas de plasma vertical
        if (this.vtolExhaustPlumes) {
          this.vtolExhaustPlumes.forEach(p => {
            p.material.opacity = Math.max(0, p.material.opacity - delta * 3.5);
          });
        }

        // Apagar postcombustión de la nave
        if (this.ship.afterburnerMeshes) {
          this.ship.afterburnerMeshes.forEach(m => m.scale.set(0, 0, 0));
        }

        // Scorch mark pasa de plasma brillante a calor residual
        if (this.vtolGroundScorch) {
          this.vtolGroundScorch.material.opacity = Math.max(0.2, this.vtolGroundScorch.material.opacity - delta * 0.35);
        }

        // HUD Status
        if (this.vtolStatusText) this.vtolStatusText.textContent = 'CONTACTO FIRME // AMORTIGUACIÓN HIDRÁULICA BLOQUEADA';

        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, 12, 0.05);
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 6.0, 0.05);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 21, 0.05);
        this.camera.lookAt(0, 5.5, 0);

      // FASE 4: PANORÁMICA CINEMÁTICA ORBITAL 360° (4.4s - 6.2s)
      } else if (t < 6.2) {
        this.ship.shipGroup.rotation.x = Math.PI / 2;
        this.ship.position.y = 10.0;
        this.ship.position.x = 0;
        this.ship.position.z = 0;

        if (this.vtolLegPistons) {
          this.vtolLegPistons.forEach(leg => leg.scale.set(1.0, 1.0, 1.0));
        }

        // Giro orbital cinemático de cámara alrededor de la nave vertical estacionada
        const orbitAngle = (t - 4.4) * 1.35;
        const orbitRadius = 22;
        this.camera.position.x = Math.sin(orbitAngle) * orbitRadius;
        this.camera.position.z = Math.cos(orbitAngle) * orbitRadius;
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 8.0, 0.04);
        this.camera.lookAt(0, 6.0, 0);

        // HUD Status
        if (this.vtolStatusText) this.vtolStatusText.textContent = 'ESTACIONAMIENTO VERTICAL COMPLETADO // SISTEMAS EN ESPERA';

      // FASE 5: FINALIZAR TOUCHDOWN (> 6.2s)
      } else {
        this.finalizeTouchdown();
      }

      this.ship.shipGroup.position.copy(this.ship.position);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // ========================================================================
    // VUELO ACTIVO A TRAVÉS DEL CAÑÓN // CONTROL GRADUAL DE VELOCIDAD
    // ========================================================================
    const isBraking = this.keys.brake || this.isBrakingPedal;
    const isThrottling = this.keys.throttle || this.isThrottlingPedal;

    if (isBraking) {
      // Reducción gradual de velocidad con retro-propulsores
      this.flightSpeed = Math.max(this.minSpeed, this.flightSpeed - this.brakeRate * delta);
      this.retroSoundCooldown -= delta;
      if (this.retroSoundCooldown <= 0 && window.spaceAudio && window.spaceAudio.playRetroBrakeSound) {
        window.spaceAudio.playRetroBrakeSound();
        this.retroSoundCooldown = 0.28;
      }
    } else if (isThrottling) {
      // Aceleración gradual de propulsores iónicos
      this.flightSpeed = Math.min(this.maxSpeed, this.flightSpeed + this.throttleRate * delta);
    } else {
      // Resistencia atmosférica natural: desaceleración suave hacia 85 m/s
      if (this.flightSpeed > 85) {
        this.flightSpeed = Math.max(85, this.flightSpeed - 9 * delta);
      }
    }

    // Actualizar llamaradas de retro-frenos en las alas
    this.updateRetroThrusters(delta, isBraking);

    this.canyonDistance = Math.max(0, this.canyonDistance - this.flightSpeed * delta);
    const progressPct = Math.min(100, Math.round(((3000 - this.canyonDistance) / 3000) * 100));

    // Control de Altitud y Alerones (Flecha Arriba = Elevar, Flecha Abajo = Descender)
    const steering=1-Math.exp(-delta*5);
    this.altitudeVelocity+=(42*(Number(this.keys.up)-Number(this.keys.down))-this.altitudeVelocity)*steering;
    this.lateralVelocity+=(46*(Number(this.keys.right)-Number(this.keys.left))-this.lateralVelocity)*steering;
    this.altitude=THREE.MathUtils.clamp(this.altitude+this.altitudeVelocity*delta,16,105);
    this.lateralPos=THREE.MathUtils.clamp(this.lateralPos+this.lateralVelocity*delta,-42,42);
    if(this.altitude===16||this.altitude===105)this.altitudeVelocity=0;
    if(Math.abs(this.lateralPos)===42)this.lateralVelocity=0;

    // Posicionar nave en relación con el terreno
    this.ship.position.x = this.lateralPos;
    this.ship.position.y = this.altitude * 0.28; // Escala gráfica en escena
    this.ship.position.z = 0;
    this.ship.update(delta);
    if(!this.isTouchdownAnimation){this.ship.shipGroup.rotation.z=THREE.MathUtils.lerp(this.ship.shipGroup.rotation.z,-this.lateralVelocity*.006,1-Math.exp(-delta*7));this.camera.lookAt(this.lateralPos*.9,this.altitude*.28,-60);}

    // Cámara sigue el vuelo en tercera persona
    this.camera.position.z=THREE.MathUtils.lerp(this.camera.position.z,35,1-Math.exp(-delta*5));
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.lateralPos * 0.7, 1-Math.exp(-delta*6));
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 6.5 + this.altitude * 0.28, 1-Math.exp(-delta*6));

    // Sistema de Alarma de Proximidad al Terreno (GPWS)
    this.checkTerrainProximity(delta);

    // Desplazamiento del suelo y paredes del cañón
    if (this.canyonFloor) {
      this.canyonFloor.position.z += this.flightSpeed * delta * 0.6;
      if (this.canyonFloor.position.z > 100) this.canyonFloor.position.z = -200;
    }

    // Desplazamiento y turbulencia del polvo atmosférico en el cañón
    if (this.canyonDustMesh) {
      const dPos = this.canyonDustMesh.geometry.attributes.position.array;
      const windSpeed = this.flightSpeed * 0.95 + 40;
      for (let i = 0; i < dPos.length / 3; i++) {
        dPos[i * 3 + 2] += windSpeed * delta;
        // Turbulencia transversal inducida por el viento del cañón
        dPos[i * 3] += Math.sin(dPos[i * 3 + 2] * 0.04 + i) * delta * 6.0;
        if (dPos[i * 3 + 2] > 25) {
          dPos[i * 3 + 2] = -480 - Math.random() * 50;
          dPos[i * 3] = (Math.random() - 0.5) * 130;
          dPos[i * 3 + 1] = 1.0 + Math.random() * 65;
        }
      }
      this.canyonDustMesh.geometry.attributes.position.needsUpdate = true;
    }

    // Luces de aproximación de pista secuenciales ("Rabbit Lights")
    if (this.rabbitLights && this.rabbitLights.length > 0) {
      const step = Math.floor((Date.now() * 0.012) % this.rabbitLights.length);
      this.rabbitLights.forEach((rl, idx) => {
        rl.visible = (idx === step || idx === (step + 1) % this.rabbitLights.length);
      });
    }

    // Generar y actualizar obstáculos del terreno según el planeta
    this.updateObstacles(delta);

    // Comprobar colisiones con paredes laterales y obstáculos
    this.checkCanyonCollisions();

    // Actualizar fragmentos de colisiones
    this.updateFragments(delta);

    // Si nos acercamos a la base (< 350m), hacer visible la pista de aterrizaje
    if (this.canyonDistance < 400 && this.outpostGroup) {
      this.outpostGroup.visible = true;
      this.outpostGroup.position.z = -this.canyonDistance * 0.6;
    }

    // ¿Llegamos al destino? (Distancia = 0)
    if (this.canyonDistance <= 0) {
      this.triggerTouchdown();
      return;
    }

    this.updateLandingHUD(progressPct);
    this.renderer.render(this.scene, this.camera);
  }

  checkTerrainProximity(delta) {
    this.warningSoundCooldown -= delta;
    const isTooLow = this.altitude < 26;
    const isTooCloseToWall = Math.abs(this.lateralPos) > 34;

    if (isTooLow || isTooCloseToWall) {
      if (this.warningBanner) this.warningBanner.classList.add('active');
      if (this.warningSoundCooldown <= 0 && window.spaceAudio) {
        window.spaceAudio.playTerrainAlarmSound();
        this.warningSoundCooldown = 0.55;
      }
    } else {
      if (this.warningBanner) this.warningBanner.classList.remove('active');
    }
  }

  updatePaused() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.updateGroundDust(delta);
    if (this.canyonDustMesh) {
      const positions = this.canyonDustMesh.geometry.attributes.position;
      for (let i = 0; i < positions.array.length; i += 3) {
        positions.array[i + 2] += 20 * delta;
        if (positions.array[i + 2] > 25) positions.array[i + 2] = -500;
      }
      positions.needsUpdate = true;
    }
    if (this.rabbitLights?.length) {
      const step = Math.floor((Date.now() * 0.012) % this.rabbitLights.length);
      this.rabbitLights.forEach((light, index) => { light.visible = index === step; });
    }
    this.renderer.render(this.scene, this.camera);
  }

  updateObstacles(delta) {
    this.obstacleSpawnTimer += delta;
    if (this.obstacleSpawnTimer > 0.85 && this.canyonDistance > 250) {
      this.obstacleSpawnTimer = 0;
      this.spawnCanyonObstacle();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const ob = this.obstacles[i];
      ob.mesh.position.z += this.flightSpeed * delta;

      if (ob.rotSpeed) {
        ob.mesh.rotation.y += ob.rotSpeed * delta;
      }

      // Eliminar cuando rebasa la cámara
      if (ob.mesh.position.z > 30) {
        this.scene.remove(ob.mesh);
        this.obstacles.splice(i, 1);
      }
    }
  }

  spawnCanyonObstacle() {
    const obType = this.planetKey==='venus'?'plume':'boulder';
    let mesh;
    let radius = 4.0;
    let height = 35;
    let spawnX = (Math.random() - 0.5) * 58;
    let spawnY = 0;
    const spawnZ = -340 - Math.random() * 60;

    const wallCol = ({moon:0x6e6d67,mercury:0x655b50,mars:0x884733,earth:0x6c7053,venus:0x816535})[this.planetKey]||0xc2410c;
    const obstacleMat = new THREE.MeshStandardMaterial({ color: wallCol, roughness: 0.9, metalness: 0.1 });

    if(obType==='boulder'){
      height=9+Math.random()*12;radius=height*.55;mesh=new THREE.Mesh(new THREE.DodecahedronGeometry(radius,1),obstacleMat);mesh.scale.y=.8;spawnY=height*.3;
    } else if (obType === 'arch' && Math.random() > 0.45) {
      // Arco de roca colosal con estalactitas y apertura de vuelo
      const archGroup = new THREE.Group();
      const pLeft = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 4.2, 48, 10), obstacleMat);
      pLeft.position.set(-19, 24, 0);
      archGroup.add(pLeft);

      const pRight = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 4.2, 48, 10), obstacleMat);
      pRight.position.set(19, 24, 0);
      archGroup.add(pRight);

      // Dintel superior del puente natural
      const archTop = new THREE.Mesh(new THREE.BoxGeometry(44, 6.5, 7.5), obstacleMat);
      archTop.position.set(0, 46, 0);
      archGroup.add(archTop);

      // Estalactitas de roca colgantes
      const stalGeo = new THREE.ConeGeometry(0.9, 5.5, 6);
      stalGeo.rotateX(Math.PI);
      [-8, 0, 8].forEach((sx) => {
        const stal = new THREE.Mesh(stalGeo, obstacleMat);
        stal.position.set(sx, 40, 0);
        archGroup.add(stal);
      });

      archGroup.position.set(0, 0, spawnZ);
      this.scene.add(archGroup);
      this.obstacles.push({
        mesh: archGroup,
        type: 'arch',
        leftX: -19,
        rightX: 19,
        topY: 46,
        bottomY: 0
      });
      return;
    } else if (obType === 'plume') {
      // Fumarola volcánica con caldera incandescente y columna de gas
      const ventGroup = new THREE.Group();
      const ventGeo = new THREE.CylinderGeometry(2.4, 7.0, 24, 12);
      const ventMesh = new THREE.Mesh(ventGeo, obstacleMat);
      ventMesh.position.y = 12;
      ventGroup.add(ventMesh);

      // Cráter con núcleo incandescente de magma
      const lavaGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.4, 12);
      const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff3b10 });
      const lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
      lavaMesh.position.y = 24.1;
      ventGroup.add(lavaMesh);

      // Columna de gas / vapor geotérmico translúcido
      const plumeGeo = new THREE.CylinderGeometry(4.5, 1.8, 36, 12);
      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const plumeMesh = new THREE.Mesh(plumeGeo, plumeMat);
      plumeMesh.position.y = 42;
      ventGroup.add(plumeMesh);

      ventGroup.position.set(spawnX, 0, spawnZ);
      this.scene.add(ventGroup);
      this.obstacles.push({
        mesh: ventGroup,
        type: 'spire',
        radius: 4.8,
        height: 38
      });
      return;
    } else {
      // Columna de basalto hexagonal cristalina
      const spireGeo = new THREE.CylinderGeometry(2.2, 4.8, height, 6);
      mesh = new THREE.Mesh(spireGeo, obstacleMat);
      spawnY = height / 2;
      radius = 4.4;
    }

    mesh.position.set(spawnX, spawnY, spawnZ);
    this.scene.add(mesh);
    this.obstacles.push({
      mesh: mesh,
      type: 'spire',
      radius: radius,
      height: height
    });
  }

  checkCanyonCollisions() {
    const shipX = this.ship.position.x;
    const shipY = this.ship.position.y;
    const shipZ = 0;

    // 1. Choque contra paredes laterales del cañón
    if (Math.abs(shipX) > 39) {
      this.onCanyonCrash('cliff_wall', 30);
      this.lateralPos = Math.sign(shipX) * 36; // Rebote hacia el interior
      return;
    }

    // 2. Choque contra suelo del cañón
    if (this.altitude < 16) {
      this.onCanyonCrash('ground', 30);
      this.altitude = 22; // Elevación de emergencia
      return;
    }

    // 3. Colisión con pilares u obstáculos
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const ob = this.obstacles[i];
      const obZ = ob.mesh.position.z;

      if (Math.abs(obZ - shipZ) < 6.0) {
        if (ob.type === 'arch') {
          // Arco: se choca si se tocan las columnas laterales o la parte superior
          const dxLeft = Math.abs(shipX - ob.leftX);
          const dxRight = Math.abs(shipX - ob.rightX);
          const hitTop = shipY > (ob.topY - 3);

          if (dxLeft < 5 || dxRight < 5 || hitTop) {
            this.onCanyonCrash('arch', 35);
            this.scene.remove(ob.mesh);
            this.obstacles.splice(i, 1);
            return;
          }
        } else {
          // Pilar o fumarola
          const dx = Math.abs(shipX - ob.mesh.position.x);
          const dy = Math.abs(shipY - ob.mesh.position.y);

          if (dx < (ob.radius + 5.5) && dy < (ob.height * 0.45)) {
            this.onCanyonCrash('spire', 35);
            this.spawnExplosion(ob.mesh.position);
            this.scene.remove(ob.mesh);
            this.obstacles.splice(i, 1);
            return;
          }
        }
      }
    }
  }

  onCanyonCrash(reason, damage) {
    if (damage > 0 && window.adaptiveTutorial) window.adaptiveTutorial.failure('landing');
    this.hull = Math.max(0, this.hull - damage);
    this.ship.setDamage(1.0 - (this.hull / 100));

    // Vibración y destello
    if (this.container) {
      this.container.classList.remove('screen-trauma');
      void this.container.offsetWidth;
      this.container.classList.add('screen-trauma');
      setTimeout(() => this.container.classList.remove('screen-trauma'), 380);
    }

    const flash = document.getElementById('damage-flash');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 200);
    }

    if (window.spaceAudio) {
      window.spaceAudio.playCollisionSound();
    }

    if (this.hull <= 0) {
      this.isActive = false;
      if (this.onLandingCrash) {
        this.onLandingCrash(reason, this.planetData);
      }
    }
  }

  spawnExplosion(pos) {
    const fragGeo = new THREE.DodecahedronGeometry(0.8, 0);
    const fragMat = new THREE.MeshStandardMaterial({ color: this.planetData.wallColor || 0xc2410c });

    for (let j = 0; j < 14; j++) {
      const frag = new THREE.Mesh(fragGeo, fragMat);
      frag.position.copy(pos);
      this.scene.add(frag);
      this.fragments.push({
        mesh: frag,
        life: 0.9,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 45,
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 35
        )
      });
    }
  }

  updateFragments(delta) {
    for (let i = this.fragments.length - 1; i >= 0; i--) {
      const f = this.fragments[i];
      f.life -= delta;
      if (f.life <= 0) {
        this.scene.remove(f.mesh);
        this.fragments.splice(i, 1);
        continue;
      }
      f.mesh.position.addScaledVector(f.velocity, delta);
      f.mesh.scale.multiplyScalar(0.96);
    }
  }

  triggerTouchdown() {
    this.isTouchdownAnimation = true;
    this.isActive = false;
    this.touchdownTimer = 0;
    this.playedLegLockSound = false;
    this.playedContactVent = false;
    this.triggeredPreTouchdownDust = false;

    const touchdownSpeed = Math.round(this.flightSpeed);
    let quality = '⭐⭐⭐ PERFECTO // TOMA SUAVE VTOL';
    let badgeText = 'ATERRIZAJE VERTICAL IMPECABLE // TOUCHDOWN VTOL';
    let damageTaken = 0;

    if (touchdownSpeed <= 40) {
      // CONTACTO SUAVE (< 40 m/s): Maniobra perfecta
      damageTaken = 0;
      quality = '⭐⭐⭐ CONTACTO VTOL SUAVE (ÓPTIMO)';
      badgeText = 'ATERRIZAJE VERTICAL IMPECABLE // TOUCHDOWN VTOL';
      if (window.spaceAudio) {
        window.spaceAudio.playTouchdownSuccessSound();
      }
    } else if (touchdownSpeed <= 65) {
      // ATERRIZAJE DURO (40 a 65 m/s): Daño moderado
      damageTaken = 20;
      this.hull = Math.max(10, this.hull - damageTaken);
      this.ship.setDamage(1.0 - (this.hull / 100));
      quality = '⭐⭐ ATERRIZAJE DURO // IMPACTO MODERADO (-20% CASCO)';
      badgeText = 'ATERRIZAJE DURO // ESTRÉS ESTRUCTURAL EN PATAS';
      if (window.spaceAudio) {
        if (window.spaceAudio.playHardLandingSound) window.spaceAudio.playHardLandingSound();
      }
      if (this.container) {
        this.container.classList.add('screen-trauma');
        setTimeout(() => this.container.classList.remove('screen-trauma'), 450);
      }
    } else {
      // IMPACTO A ALTA VELOCIDAD (> 65 m/s): Daño severo o choque fatal
      if (this.hull <= 45) {
        if (window.spaceAudio) {
          window.spaceAudio.stopThrusterSound();
          window.spaceAudio.playCollisionSound();
        }
        if (this.onLandingCrash) {
          this.onLandingCrash('overspeed_impact', this.planetData);
        }
        return;
      }
      damageTaken = 45;
      this.hull = Math.max(5, this.hull - damageTaken);
      this.ship.setDamage(1.0 - (this.hull / 100));
      quality = '⭐ IMPACTO CRÍTICO // TREN DE ATERRIZAJE DAÑADO (-45% CASCO)';
      badgeText = 'TOMA VIOLENTA // EXCESO DE VELOCIDAD VTOL';
      if (window.spaceAudio) {
        window.spaceAudio.playCollisionSound();
      }
      if (this.container) {
        this.container.classList.add('screen-trauma');
        setTimeout(() => this.container.classList.remove('screen-trauma'), 600);
      }
    }

    this.savedTouchdownData = {
      planetKey: this.planetKey,
      planetName: this.planetData.name,
      landingSite: this.planetData.landingSiteName,
      hullRemaining: Math.round(this.hull),
      temp: this.planetData.temperature,
      touchdownSpeed: touchdownSpeed,
      quality: quality,
      badgeText: badgeText,
      damageTaken: damageTaken,
      materials: this.planetData.materials || []
    };
  }

  finalizeTouchdown() {
    if (!this.isTouchdownAnimation) return;
    this.isTouchdownAnimation = false;

    if (this.vtolStatusHud) this.vtolStatusHud.classList.remove('active');
    if (this.landingScreen) this.landingScreen.classList.remove('active');

    if (this.onTouchdownSuccess && this.savedTouchdownData) {
      this.onTouchdownSuccess(this.savedTouchdownData);
    }
  }

  updateLandingHUD(progressPct) {
    if (this.altValue) this.altValue.textContent = `${Math.round(this.altitude)} m`;
    if (this.distValue) this.distValue.textContent = `${Math.round(this.canyonDistance)} m`;
    if (this.trackPct) this.trackPct.textContent = `${progressPct}%`;
    if (this.trackFill) this.trackFill.style.width = `${progressPct}%`;
    if (this.shipIcon) this.shipIcon.style.left = `${progressPct}%`;

    const spd = Math.round(this.flightSpeed);
    if (this.speedValue) {
      this.speedValue.textContent = `${spd} m/s`;
      if (spd <= 40) {
        this.speedValue.className = 'chip-val text-success';
      } else if (spd <= 65) {
        this.speedValue.className = 'chip-val text-warning';
      } else {
        this.speedValue.className = 'chip-val text-danger';
      }
    }

    const isBraking = this.keys.brake || this.isBrakingPedal;
    const isThrottling = this.keys.throttle || this.isThrottlingPedal;
    if (this.brakeStatus) {
      if (isBraking) {
        this.brakeStatus.textContent = `🛑 FRENANDO (${spd} m/s)`;
        this.brakeStatus.className = 'chip-val text-cyan active';
      } else if (isThrottling) {
        this.brakeStatus.textContent = '⚡ ACELERANDO';
        this.brakeStatus.className = 'chip-val text-warning';
      } else {
        this.brakeStatus.textContent = 'INACTIVO';
        this.brakeStatus.className = 'chip-val text-muted';
      }
    }

    if (this.speedCorridorFill) {
      const pct = Math.min(100, Math.max(10, (this.flightSpeed / this.maxSpeed) * 100));
      this.speedCorridorFill.style.width = `${pct}%`;
      if (spd <= 40) {
        this.speedCorridorFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
      } else if (spd <= 65) {
        this.speedCorridorFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
      } else {
        this.speedCorridorFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
      }
    }

    if (this.speedCorridorStatus) {
      if (spd <= 40) {
        this.speedCorridorStatus.innerHTML = `<span class="status-pill success">✓ VELOCIDAD SEGURA DE CONTACTO (${spd} m/s)</span>`;
      } else if (spd <= 65) {
        this.speedCorridorStatus.innerHTML = `<span class="status-pill warning">⚠️ PRECAUCIÓN: ATERRIZAJE DURO (${spd} m/s)</span>`;
      } else {
        this.speedCorridorStatus.innerHTML = `<span class="status-pill danger">🚨 EXCESO DE VELOCIDAD // FRENE CON [ESPACIO/S] (${spd} m/s)</span>`;
      }
    }
  }

  clearObstacles() {
    for (let i = 0; i < this.obstacles.length; i++) {
      this.scene.remove(this.obstacles[i].mesh);
    }
    this.obstacles = [];
  }

  stop() {
    this.isActive = false;
    this.isTouchdownAnimation = false;
    this.clearObstacles();
    if (this.landingScreen) this.landingScreen.classList.remove('active');
    if (window.spaceAudio) window.spaceAudio.stopThrusterSound();
  }
}

window.PlanetaryLandingEngine = PlanetaryLandingEngine;
