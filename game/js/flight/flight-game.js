/* ==========================================================================
   NASA ODYSSEY // FLIGHT GAME ENGINE
   Photorealistic cosmic nebula, horizontal anamorphic star flare & stranded void
   ========================================================================== */

class FlightGameEngine {
  constructor(containerId, onMissionCompleteCallback, onGameOverCallback, onStrandedCallback, onStartLandingCallback) {
    this.container = document.getElementById(containerId);
    this.onMissionComplete = onMissionCompleteCallback;
    this.onGameOver = onGameOverCallback;
    this.onStranded = onStrandedCallback;
    this.onStartLanding = onStartLandingCallback;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.ship = null;
    this.hazardsManager = null;
    this.stationsManager = null;
    this.qteSystem = null;

    // Planeta de Origen (Tierra)
    this.earthOriginGroup = null;

    // Planeta de Destino Dinámico
    this.destinationPlanetGroup = null;
    this.destinationPlanetMesh = null;
    this.destinationCloudsMesh = null;
    this.destinationRingsMesh = null;
    this.destinationGlowMesh = null;
    this.destinationMoons = [];
    this.destinationOrbitingAsteroids = [];

    // Sistema de Líneas de Velocidad / Aceleración Relativista (Warp Speed Lines)
    this.warpLinesMesh = null;
    this.warpVelocities = null;
    this.warpBaseLengths = null;

    // Dinámica de Velocidad y Aceleración Turbo Boost
    this.cruiseSpeedKm = 1000;
    this.boostSpeedKm = 3600;
    this.currentSpeedKm = 1000;
    this.boostRatio = 1.0;
    this.isBoosting = false;
    this.wasBoostingLastFrame = false;

    // Anillos / Puertas de Navegación de Aproximación al Planeta
    this.approachGates = [];
    this.gateSpawnTimer = 0;

    // Animación de Salida / Despegue de la Tierra
    this.isLaunching = false;
    this.launchTimer = 0;

    // Grupo Cinemático de la Nebulosa Estelar (Nave a la Deriva)
    this.strandedGroup = null;

    // Estado y Modelo Matemático
    this.activePlanetKey = 'mars';
    this.hull = 100;
    this.fuel = 100;
    this.oxygen = 100;
    this.progress = 0;this.arrivalShot=null;this.travelShot=null;

    this.mathModel = {
      orbitalDistanceKm: 225000000,
      fuelBurnRate: 1.15,
      oxygenBurnRate: 0.8,
      minDockingsRequired: 2
    };

    this.currentDistanceKm = 225000000;
    this.dockingSuccessCount = 0;

    this.isFlying = false;
    this.isQTEActive = false;
    this.isStrandedCinematic = false;
    this.currentFailureSceneIndex = 0;
    this.isFreeCamera = false;
    this.orbitControls = null;

    // Catálogo de Escenas en caso de Fallar (Idénticas a la imagen de referencia)
    this.failureScenes = [
      {
        id: 'nebula_fire_ice',
        title: 'Nebulosa de Fuego y Hielo (Referencia Original)',
        image: 'assets/milky-way-eso.jpg',
        cause: 'Inercia de Reposo // Deriva en Nebulosa de Fuego y Hielo',
        beacon: 'MODO CINEMÁTICO // NAVE INERTE EN EL CERO ABSOLUTO',
        telemetry: 'COORDENADAS: 1.42 AU DE LA TIERRA // TEMP: 2.75 K // EN REPOSO',
        desc: 'La nave Arwing flota inerte con los propulsores apagados. En medio de la inmensidad de la nebulosa estelar de fuego y hielo, la silueta se recorta contra la superestrella y su fulgor anamórfico.',
        rimColor: 0x38bdf8,
        rimIntensity: 7.5,
        damageRatio: 0.15,
        shipPos: { x: -0.4, y: -0.2, z: 0 },
        shipRot: { x: 0.38, y: -0.22, z: -0.58 },
        camPos: { x: 0, y: 0, z: 40 },
        camLook: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'cryo_frozen_void',
        title: 'Cero Absoluto Criogénico a 2.7 Kelvin',
        image: 'assets/milky-way-eso.jpg',
        cause: 'Apagado de Motores // Cristalización Criogénica',
        beacon: 'MODO CINEMÁTICO // CÁMARA DE PERFIL INFERIOR',
        telemetry: 'REACTORES: REPOSO // OXÍGENO: 0.00% // CRISTALIZACIÓN',
        desc: 'Soporte vital y celdas de energía completamente en reposo a 225,000,000 km de la Tierra. El frío cósmico del cero absoluto congela el fuselaje, capturado desde un plano contrapicado.',
        rimColor: 0x38bdf8,
        rimIntensity: 6.2,
        damageRatio: 0.40,
        shipPos: { x: 1.5, y: -0.3, z: 0 },
        shipRot: { x: 0.22, y: -0.28, z: 0.25 },
        camPos: { x: -6, y: -3, z: 28 },
        camLook: { x: 1.5, y: -0.2, z: -2 }
      },
      {
        id: 'asteroid_belt_shattered',
        title: 'Colapso Estructural en Cinturón de Asteroides',
        image: 'assets/milky-way-eso.jpg',
        cause: 'Campo de Escombros // Silencio en la Nebulosa Carmesí',
        beacon: 'MODO CINEMÁTICO // CÁMARA ELEVADA SOBRE EL ALA',
        telemetry: 'CASCO: FRACTURA // CAMPO DE ESCOMBROS // EN REPOSO',
        desc: 'Inmóvil en un sector bañado por una nebulosa carmesí y magenta, la cámara se sitúa en ángulo cenital dinámico observando la nave entre el polvo estelar.',
        rimColor: 0xff4d6d,
        rimIntensity: 5.2,
        damageRatio: 0.50,
        shipPos: { x: -0.5, y: -0.4, z: 0 },
        shipRot: { x: 0.45, y: 0.25, z: -0.35 },
        camPos: { x: 7, y: 5, z: 30 },
        camLook: { x: 0, y: -0.5, z: -2 }
      },
      {
        id: 'abyss_outer_void',
        title: 'Aislamiento en el Abismo Sin Retorno',
        image: 'assets/milky-way-eso.jpg',
        cause: 'Vastedad Exterior // Estrella Solitaria en la Lejanía',
        beacon: 'MODO CINEMÁTICO // PLANO CENITAL DESDE EL VACÍO',
        telemetry: 'DISTANCIA: 480,000,000 km // ABISMO EXTERIOR // SILENCIO',
        desc: 'La nave se suspende en el vacío más oscuro de la galaxia, dejando atrás una lejana estrella dorada reflejada en las toberas.',
        rimColor: 0xf59e0b,
        rimIntensity: 5.0,
        damageRatio: 0.30,
        shipPos: { x: 0.8, y: -0.2, z: 0 },
        shipRot: { x: -0.20, y: 0.30, z: -0.25 },
        camPos: { x: -4, y: 9, z: 32 },
        camLook: { x: 1, y: -0.5, z: 0 }
      },
      {
        id: 'black_hole_event_horizon',
        title: 'Horizonte de Sucesos de Sagitario A* (Disco de Acreción Relativista)',
        image: 'assets/milky-way-eso.jpg', // imagen real (ESO, CC BY 4.0)
        cause: 'Atracción Gravitacional Relativista // Cruce del Radio de Schwarzschild',
        beacon: 'MODO CINEMÁTICO // VISTA PANORÁMICA DEL DISCO DE ACRECIÓN',
        telemetry: 'GRAVEDAD: RELATIVISTA // LENTE DE EINSTEIN // EN REPOSO',
        desc: 'El disco de acreción arde a millones de grados con chorros de plasma relativista. La distorsión gravitacional extrema dobla el espacio-tiempo alrededor de la nave inmóvil.',
        rimColor: 0xf59e0b,
        rimIntensity: 7.5,
        damageRatio: 0.45,
        shipPos: { x: 1.5, y: -0.4, z: 0 },
        shipRot: { x: 0.35, y: -0.40, z: 0.40 },
        camPos: { x: 6, y: -2, z: 35 },
        camLook: { x: 1, y: 0, z: -4 }
      },
      {
        id: 'cosmic_vastness_deep',
        title: 'Vastedad Infinita del Cosmos (Campo Ultra Profundo JWST)',
        image: 'assets/milky-way-eso.jpg',
        cause: 'Silencio Intergaláctico // Red Cósmica Universal',
        beacon: 'MODO CINEMÁTICO // PLANO GENERAL DE ESCALA COLOSAL',
        telemetry: 'DISTANCIA: 2.5M AÑOS LUZ // BILLONES DE GALAXIAS // SOLEDAD ABSOLUTA',
        desc: 'Billones de galaxias espirales y filamentos de la red cósmica iluminan el vacío más insondable. Un plano general de escala colosal resalta la pequeñez de la nave.',
        rimColor: 0x818cf8,
        rimIntensity: 5.5,
        damageRatio: 0.20,
        shipPos: { x: 0, y: 0, z: 0 },
        shipRot: { x: 0.15, y: -0.15, z: -0.20 },
        camPos: { x: -1, y: 2, z: 52 },
        camLook: { x: 0.5, y: 0, z: 0 }
      }
    ];

    this.clock = new THREE.Clock();

    // DOM Elements
    this.hullBar = document.getElementById('hull-bar');
    this.hullValue = document.getElementById('hull-value');
    this.oxygenBar = document.getElementById('oxygen-bar');
    this.oxygenValue = document.getElementById('oxygen-value');
    this.fuelBar = document.getElementById('fuel-bar');
    this.fuelValue = document.getElementById('fuel-value');
    this.navDistanceText = document.getElementById('nav-distance-text');
    this.approachFill = document.getElementById('approach-fill');
    this.approachShipMarker = document.getElementById('approach-ship-marker');
    this.navStageText = document.getElementById('nav-stage-text');
    this.damageFlashEl = document.getElementById('damage-flash');
    this.alertContainer = document.getElementById('hud-alert-container');
    this.strandedOverlay = document.getElementById('stranded-deep-space-overlay');
    this.strandedDistDisplay = document.getElementById('stranded-dist-display');
    this.strandedBackdropLayer = document.getElementById('stranded-backdrop-layer');
    this.strandedCausePill = document.getElementById('stranded-cause-pill');
    this.strandedBeaconText = document.getElementById('stranded-beacon-text');
    this.strandedTitleText = document.getElementById('stranded-title-text');
    this.strandedDescText = document.getElementById('stranded-desc-text');
    this.sceneCounterBadge = document.getElementById('scene-counter-badge');
    this.sceneCounterTitle = document.getElementById('scene-counter-title');
    this.toggleFreeCamBtn = document.getElementById('toggle-free-cam-btn');
    this.freeCamText = document.getElementById('free-cam-text');
    this.failureTabChips = document.querySelectorAll('.scene-tab-chip');
  }

  init(sharedRenderer = null) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.00025);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 14000);
    this.camera.position.set(0, 5.5, 20);
    this.camera.lookAt(0, 0, -50);

    if (sharedRenderer) {
      this.renderer = sharedRenderer;
    } else {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;
      this.container.appendChild(this.renderer.domElement);
    }

    window.Fluidity?.register(this.renderer);
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.sunLight.position.set(50, 25, 30);
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight(0x0a192f, 0.45);
    this.scene.add(this.ambientLight);

    this.createDeepSpaceBackground();
    // Star streaks intentionally removed.

    this.ship = new ArwingShipController(this.scene);
    this.hazardsManager = new SpaceHazardsManager(this.scene);
    this.stationsManager = new DockingStationsManager(this.scene);

    this.qteSystem = new QuickTimeEventSystem((success) => {
      this.onQTEResolved(success);
    });

    this.idleTime = 0;
    this.autoSceneTimer = 0;
    this.isIdleCinematic = false;
    this.isVastnessView = false;
    this.cosmicDustParticles = null;
    this.deepCosmicStarsMesh = null;
    this.milkyWayStreamMesh = null;
    this.distantGalaxiesGroup = null;
    this.interstellarCometGroup = null;
    this.paleBlueDotMesh = null;

    // Sistema de Cámaras Múltiples y Rotación 360° por Arrastre (Mouse Drag)
    this.cameraModes = ['chase', 'cockpit'];
    this.currentCameraMode = 'chase';
    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.isDragging = false;
    this.dragPrevX = 0;
    this.dragPrevY = 0;

    // Drones y Trayectoria de Hohmann en Vuelo Integrado
    this.flightActiveDrones = [];
    this.isDroneScanning = false;
    this.droneScanPct = 0;
    this.hohmannTrajectoryCurveMesh = null;
    this.hohmannTrajectoryParticles = null;
    this.isHohmannCalculated = false;

    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if ((code === 'KeyV' || code === 'KeyC') && !e.repeat) {
        this.cycleCameraMode();
        return;
      }
      if (code === 'KeyT') {
        this.executeHohmannCalculation();
        return;
      }
      if (code === 'KeyR') {
        this.requestFlightReconDrones();
        return;
      }

      // Si está en vuelo normal, reiniciar contador de inactividad
      this.idleTime = 0;
    });

    // Control de Arrastre del Ratón (Mouse Drag para Rotar la Cámara 360°)
    window.addEventListener('mousedown', (e) => {
      if (!this.isFlying || this.isStrandedCinematic) return;
      if (e.target.closest('button, a, input, select, .modal, .glass-panel, #flight-approach-bar')) return;
      this.isDragging = true;
      this.dragPrevX = e.clientX;
      this.dragPrevY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.isFlying) return;
      const dx = e.clientX - this.dragPrevX;
      const dy = e.clientY - this.dragPrevY;
      this.dragPrevX = e.clientX;
      this.dragPrevY = e.clientY;

      this.orbitYaw -= dx * 0.0055;
      this.orbitPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.orbitPitch + dy * 0.0055));
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Soporte táctil para pantallas táctiles y móviles
    window.addEventListener('touchstart', (e) => {
      if (!this.isFlying || this.isStrandedCinematic || !e.touches[0]) return;
      if (e.target.closest('button, a, input, select, .modal, .glass-panel, #flight-approach-bar')) return;
      this.isDragging = true;
      this.dragPrevX = e.touches[0].clientX;
      this.dragPrevY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || !this.isFlying || !e.touches[0]) return;
      const dx = e.touches[0].clientX - this.dragPrevX;
      const dy = e.touches[0].clientY - this.dragPrevY;
      this.dragPrevX = e.touches[0].clientX;
      this.dragPrevY = e.touches[0].clientY;

      this.orbitYaw -= dx * 0.0055;
      this.orbitPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.orbitPitch + dy * 0.0055));
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    const resumeIdleBtn = document.getElementById('resume-idle-flight-btn');
    if (resumeIdleBtn) {
      resumeIdleBtn.addEventListener('click', () => {
        this.exitIdleCinematic();
      });
    }

    const vastnessBtn = document.getElementById('flight-toggle-vastness-btn');
    if (vastnessBtn) {
      vastnessBtn.addEventListener('click', () => {
        this.cycleCameraMode('far');
      });
    }
    const vastnessTopBtn = document.getElementById('flight-toggle-vastness-top-btn');
    if (vastnessTopBtn) {
      vastnessTopBtn.addEventListener('click', () => {
        this.cycleCameraMode();
      });
    }

    // Botones de la Barra de Aproximación
    const calcHohmannBtn = document.getElementById('flight-calc-hohmann-btn');
    if (calcHohmannBtn) {
      calcHohmannBtn.addEventListener('click', () => this.executeHohmannCalculation());
    }
    const deployDronesBtn = document.getElementById('flight-deploy-drones-btn');
    if (deployDronesBtn) {
      deployDronesBtn.addEventListener('click', () => this.requestFlightReconDrones());
    }
    const landDirectBtn = document.getElementById('flight-land-direct-btn');
    if (landDirectBtn) {
      landDirectBtn.addEventListener('click', () => this.attemptLanding());
    }
    const camCycleBtn = document.getElementById('flight-cam-cycle-btn');
    if (camCycleBtn) {
      camCycleBtn.addEventListener('click', () => this.cycleCameraMode());
    }

    const boostBtn = document.getElementById('flight-boost-btn');
    if (boostBtn) {
      const startBoost = (e) => {
        if (e) e.preventDefault();
        if (this.ship) this.ship.keys.boost = true;
        boostBtn.classList.add('active');
      };
      const stopBoost = (e) => {
        if (e) e.preventDefault();
        if (this.ship) this.ship.keys.boost = false;
        boostBtn.classList.remove('active');
      };

      boostBtn.addEventListener('mousedown', startBoost);
      window.addEventListener('mouseup', stopBoost);
      boostBtn.addEventListener('touchstart', startBoost, { passive: false });
      window.addEventListener('touchend', stopBoost);
    }

    window.addEventListener('resize', () => this.onWindowResize());
  }

  toggleCosmicVastnessMode() {
    this.isVastnessView = !this.isVastnessView;

    const vastnessBtn = document.getElementById('flight-toggle-vastness-btn');
    const vastnessTopBtn = document.getElementById('flight-toggle-vastness-top-btn');
    const scaleBadge = document.getElementById('cosmic-scale-badge');
    const scaleText = document.getElementById('cosmic-scale-text');

    if (this.isVastnessView) {
      if (vastnessBtn) vastnessBtn.classList.add('active');
      if (vastnessTopBtn) vastnessTopBtn.classList.add('active');
      if (scaleBadge) scaleBadge.classList.add('active');
      if (scaleText) scaleText.textContent = '🌌 VASTEDAD ACTIVA: ESCALA COLOSAL // VACÍO INTERGALÁCTICO [V]';

      if (window.spaceAudio) {
        window.spaceAudio.ensureContext();
        window.spaceAudio.playCosmicVastnessChime();
        window.spaceAudio.startCosmicVastnessDrone();
      }

      this.camera.fov = 68;
      this.camera.updateProjectionMatrix();

      this.showHUDAlert('🌌 MODO INMENSIDAD CÓSMICA ACTIVADO: Observando la escala infinita del universo [V]', 'dock-alert');
    } else {
      if (vastnessBtn) vastnessBtn.classList.remove('active');
      if (vastnessTopBtn) vastnessTopBtn.classList.remove('active');
      if (scaleBadge) scaleBadge.classList.remove('active');
      if (scaleText) scaleText.textContent = 'ESCALA CÓSMICA: 1 UA = 149.6M km // VACÍO: 10⁻²⁴ g/cm³ [V]';

      if (window.spaceAudio) {
        window.spaceAudio.stopCosmicVastnessDrone();
      }

      this.camera.fov = 50;
      this.camera.updateProjectionMatrix();

      this.showHUDAlert('Encuadre táctico de vuelo restaurado', '');
    }
  }

  createDeepSpaceBackground() {
    // 1. Fondo Cósmico Panorámico de Alta Resolución (JWST Deep Cosmos)
    if (window.nasaApi && window.nasaApi.createCosmicSkyboxTexture) {
      this.scene.background = window.nasaApi.createCosmicSkyboxTexture('assets/milky-way-eso.jpg');
    }

    // ========================================================================
    // CAPA 1: CAMPO ULTRA-PROFUNDO DE ESTRELLAS Y GALAXIAS REMOTAS (16,000 PUNTOS)
    // ========================================================================
    const deepStarCount = 1800;
    const deepPositions = new Float32Array(deepStarCount * 3);
    const deepColors = new Float32Array(deepStarCount * 3);

    for (let i = 0; i < deepStarCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3500 + Math.cbrt(Math.random()) * 11500;

      deepPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      deepPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      deepPositions[i + 2] = r * Math.cos(phi);

      const pType = Math.random();
      if (pType > 0.82) {
        deepColors[i] = 0.65; deepColors[i + 1] = 0.85; deepColors[i + 2] = 1.0;
      } else if (pType < 0.16) {
        deepColors[i] = 1.0; deepColors[i + 1] = 0.55; deepColors[i + 2] = 0.35;
      } else if (pType < 0.26) {
        deepColors[i] = 1.0; deepColors[i + 1] = 0.35; deepColors[i + 2] = 0.55;
      } else {
        deepColors[i] = 0.95; deepColors[i + 1] = 0.98; deepColors[i + 2] = 1.0;
      }
    }

    const deepStarGeo = new THREE.BufferGeometry();
    deepStarGeo.setAttribute('position', new THREE.BufferAttribute(deepPositions, 3));
    deepStarGeo.setAttribute('color', new THREE.BufferAttribute(deepColors, 3));

    const deepStarMat = new THREE.PointsMaterial({
      map: window.CinematicVisuals.stellarMap(),
      size: 2.4,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    this.deepCosmicStarsMesh = new THREE.Points(deepStarGeo, deepStarMat);
    this.scene.add(this.deepCosmicStarsMesh);

    // ========================================================================
    // CAPA 2: DISCO GALÁCTICO Y BRAZO ESPIRAL DE LA VÍA LÁCTEA (4,500 PUNTOS)
    // ========================================================================
    const mwCount = 800;
    const mwPositions = new Float32Array(mwCount * 3);
    const mwColors = new Float32Array(mwCount * 3);

    for (let i = 0; i < mwCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = 2200 + Math.random() * 6800;
      const diskX = Math.cos(angle) * rad;
      const diskZ = Math.sin(angle) * rad;
      const diskY = (diskX * 0.42 + diskZ * 0.28) + (Math.random() - 0.5) * 550;

      const idx = i * 3;
      mwPositions[idx] = diskX;
      mwPositions[idx + 1] = diskY;
      mwPositions[idx + 2] = diskZ;

      const cRand = Math.random();
      if (cRand > 0.6) {
        mwColors[idx] = 0.5; mwColors[idx + 1] = 0.75; mwColors[idx + 2] = 1.0;
      } else if (cRand > 0.3) {
        mwColors[idx] = 0.9; mwColors[idx + 1] = 0.6; mwColors[idx + 2] = 1.0;
      } else {
        mwColors[idx] = 1.0; mwColors[idx + 1] = 0.9; mwColors[idx + 2] = 0.75;
      }
    }

    const mwGeo = new THREE.BufferGeometry();
    mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPositions, 3));
    mwGeo.setAttribute('color', new THREE.BufferAttribute(mwColors, 3));

    const mwMat = new THREE.PointsMaterial({
      map: window.CinematicVisuals.stellarMap(),
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.milkyWayStreamMesh = new THREE.Points(mwGeo, mwMat);
    this.scene.add(this.milkyWayStreamMesh);

    // ========================================================================
    // CAPA 3: POLVO CÓSMICO INTERESTELAR EN PRIMER PLANO (PARALAJE 3D INMEDIATO)
    // ========================================================================
    const dustCount = 180;
    const dustPositions = new Float32Array(dustCount * 3);
    this.cosmicDustVelocities = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPositions[idx] = (Math.random() - 0.5) * 90;
      dustPositions[idx + 1] = (Math.random() - 0.5) * 60;
      dustPositions[idx + 2] = -40 + Math.random() * 110;
      this.cosmicDustVelocities[i] = 15 + Math.random() * 35;
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      map: window.CinematicVisuals.stellarMap(),
      size: 1.4,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.cosmicDustParticles = new THREE.Points(dustGeo, dustMat);
    this.cosmicDustParticles.visible = false;
    this.scene.add(this.cosmicDustParticles);

    // ========================================================================
    // CAPA 4: GALAXIAS ESPIRALES DISTANTES EN EL HORIZONTE DEL VACÍO
    // ========================================================================
    this.distantGalaxiesGroup = new THREE.Group();
    this.createProceduralGalaxy(this.distantGalaxiesGroup, { x: 5500, y: 3200, z: -9500 }, 750, 0x38bdf8, 0.45);
    this.createProceduralGalaxy(this.distantGalaxiesGroup, { x: -6800, y: -2400, z: -8800 }, 550, 0xf59e0b, 0.35);
    this.createProceduralGalaxy(this.distantGalaxiesGroup, { x: 1800, y: 5500, z: -10500 }, 620, 0xc084fc, 0.40);

    // Galaxia Activa Centaurus A con Chorros Relativistas Bipolares y Banda de Polvo
    if (window.nasaApi?.createCentaurusAGalaxyTexture) {
      const cenATex = window.nasaApi.createCentaurusAGalaxyTexture();
      const cenAMat = new THREE.MeshBasicMaterial({
        map: cenATex,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const cenAPlane = new THREE.Mesh(new THREE.PlaneGeometry(3400, 3400), cenAMat);
      cenAPlane.position.set(-8200, 4800, -11200);
      cenAPlane.lookAt(0, 0, 0);
      this.distantGalaxiesGroup.add(cenAPlane);
    }
    this.scene.add(this.distantGalaxiesGroup);

    // ========================================================================
    // CAPA 5: COMETA INTERESTELAR CON COLA DE IONES FLUORESCENTE
    // ========================================================================
    this.createInterstellarComet();
  }

  createProceduralGalaxy(parent, pos, starCount, colorHex, scale = 1.0) {
    const galGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const baseColor = new THREE.Color(colorHex);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const arm = (i % 2) * Math.PI;
      const dist = Math.pow(Math.random(), 2.2) * 450 * scale;
      const angle = arm + dist * 0.015 + (Math.random() - 0.5) * 0.4;
      const x = Math.cos(angle) * dist + (Math.random() - 0.5) * (dist * 0.25);
      const z = Math.sin(angle) * dist + (Math.random() - 0.5) * (dist * 0.25);
      const y = (Math.random() - 0.5) * (40 * scale);

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      const cFactor = 1.0 - (dist / (450 * scale));
      colors[idx] = THREE.MathUtils.lerp(baseColor.r, 1.0, cFactor * 0.8);
      colors[idx + 1] = THREE.MathUtils.lerp(baseColor.g, 1.0, cFactor * 0.8);
      colors[idx + 2] = THREE.MathUtils.lerp(baseColor.b, 1.0, cFactor * 0.8);
    }

    galGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const galMat = new THREE.PointsMaterial({
      map: window.CinematicVisuals.stellarMap(),
      size: 2.8 * scale,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Points(galGeo, galMat);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.x = Math.PI / 4;
    mesh.rotation.y = Math.PI / 6;
    mesh.userData = { rotSpeed: 0.0003 + Math.random() * 0.0002 };
    parent.add(mesh);
  }

  createInterstellarComet() {
    this.interstellarCometGroup = new THREE.Group();
    this.interstellarCometGroup.position.set(2400, 1100, -5200);

    const nucGeo = new THREE.SphereGeometry(4, 16, 16);
    const nucMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const nucleus = new THREE.Mesh(nucGeo, nucMat);
    this.interstellarCometGroup.add(nucleus);

    const tailCount = 280;
    const tailPositions = new Float32Array(tailCount * 3);
    const tailColors = new Float32Array(tailCount * 3);

    for (let i = 0; i < tailCount; i++) {
      const idx = i * 3;
      const progress = i / tailCount;
      const len = progress * 420;
      tailPositions[idx] = len + (Math.random() - 0.5) * (progress * 35);
      tailPositions[idx + 1] = len * 0.35 + (Math.random() - 0.5) * (progress * 25);
      tailPositions[idx + 2] = (Math.random() - 0.5) * (progress * 20);

      tailColors[idx] = 0.2 + (1 - progress) * 0.8;
      tailColors[idx + 1] = 0.6 + (1 - progress) * 0.4;
      tailColors[idx + 2] = 1.0;
    }

    const tailGeo = new THREE.BufferGeometry();
    tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
    tailGeo.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));

    const tailMat = new THREE.PointsMaterial({
      map: window.CinematicVisuals.stellarMap(),
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const tail = new THREE.Points(tailGeo, tailMat);
    this.interstellarCometGroup.add(tail);

    this.scene.add(this.interstellarCometGroup);
  }

  updateDeepSpaceBackground(delta) {
    if (this.milkyWayStreamMesh) {
      // Keep the distant sky stable.
    }
    if (this.deepCosmicStarsMesh) {
      // No artificial stellar drift.
    }
    if (this.distantGalaxiesGroup) {
      this.distantGalaxiesGroup.children.forEach(g => {
        if (g.userData && g.userData.rotSpeed) {
          g.rotation.z += g.userData.rotSpeed * delta * 60;
        }
      });
    }

    if (this.cosmicDustParticles) this.cosmicDustParticles.visible = false;

    if (this.interstellarCometGroup) {
      this.interstellarCometGroup.position.x -= 8 * delta;
      this.interstellarCometGroup.position.y -= 2.5 * delta;
      if (this.interstellarCometGroup.position.x < -4000) {
        this.interstellarCometGroup.position.x = 3500;
        this.interstellarCometGroup.position.y = 1200;
      }
    }
  }

  createWarpSpeedLines() {
    const lineCount = 420;
    const positions = new Float32Array(lineCount * 6);
    this.warpVelocities = new Float32Array(lineCount);
    this.warpBaseLengths = new Float32Array(lineCount);

    for (let i = 0; i < lineCount; i++) {
      const x = (Math.random() - 0.5) * 130;
      const y = (Math.random() - 0.5) * 80;
      const z = -Math.random() * 650;
      const len = 16 + Math.random() * 26;

      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z - len;

      this.warpBaseLengths[i] = len;
      this.warpVelocities[i] = 420 + Math.random() * 320;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.warpLinesMesh = new THREE.LineSegments(geo, mat);
    this.scene.add(this.warpLinesMesh);
  }

  updateWarpSpeedLines(delta, boostRatio = 1.0) {
    if (this.warpLinesMesh) this.warpLinesMesh.visible = false;
  }

  /* ========================================================================
     CONSTRUCCIÓN DE LA NEBULOSA CÓSMICA Y ESTRELLA CON FLARE HORIZONTAL
     (Idéntica a la imagen de referencia del usuario: estrella brillante + gas turquesa y ámbar)
     ======================================================================== */
  buildCinematicNebulaAndFlare() {
    this.strandedGroup = new THREE.Group();
    this.strandedGroup.visible = false;

    // 1. Estrella brillante en el centro/fondo
    const starCoreGeo = new THREE.SphereGeometry(14, 32, 32);
    const starCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starCore = new THREE.Mesh(starCoreGeo, starCoreMat);
    starCore.position.set(0, 4, -450);
    window.CinematicVisuals.decorateStar(starCore, 14);
    this.strandedGroup.add(starCore);

    // Corona radial celeste
    const coronaGeo = new THREE.SphereGeometry(26, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    coronaMesh.position.set(0, 4, -450);
    this.strandedGroup.add(coronaMesh);

    // 2. Destello horizontal anamórfico (Anamorphic Lens Flare Line)
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 1024;
    flareCanvas.height = 32;
    const fCtx = flareCanvas.getContext('2d');
    const fGrad = fCtx.createLinearGradient(0, 0, 1024, 0);
    fGrad.addColorStop(0, 'rgba(0, 243, 255, 0)');
    fGrad.addColorStop(0.3, 'rgba(0, 243, 255, 0.45)');
    fGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.95)');
    fGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    fGrad.addColorStop(0.52, 'rgba(255, 255, 255, 0.95)');
    fGrad.addColorStop(0.7, 'rgba(0, 243, 255, 0.45)');
    fGrad.addColorStop(1, 'rgba(0, 243, 255, 0)');
    fCtx.fillStyle = fGrad;
    fCtx.fillRect(0, 0, 1024, 32);

    const flareTexture = new THREE.CanvasTexture(flareCanvas);
    const flareMat = new THREE.MeshBasicMaterial({
      map: flareTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const flareMesh = new THREE.Mesh(new THREE.PlaneGeometry(1500, 4.5), flareMat);
    flareMesh.position.set(0, 4, -445);
    this.strandedGroup.add(flareMesh);

    // 3. Nube de Gas Turquesa / Cian en el centro de la nebulosa
    const cyanCanvas = document.createElement('canvas');
    cyanCanvas.width = 512;
    cyanCanvas.height = 512;
    const cCtx = cyanCanvas.getContext('2d');
    const cGrad = cCtx.createRadialGradient(256, 256, 15, 256, 256, 256);
    cGrad.addColorStop(0, 'rgba(0, 243, 255, 0.7)');
    cGrad.addColorStop(0.35, 'rgba(6, 182, 212, 0.45)');
    cGrad.addColorStop(0.7, 'rgba(14, 116, 144, 0.2)');
    cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cCtx.fillStyle = cGrad;
    cCtx.fillRect(0, 0, 512, 512);

    const cyanCloudMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(cyanCanvas),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cyanCloud = new THREE.Mesh(new THREE.PlaneGeometry(550, 420), cyanCloudMat);
    cyanCloud.position.set(15, 10, -460);
    this.strandedGroup.add(cyanCloud);

    // 4. Polvo Cósmico de Fuego Ámbar / Naranja (como en la imagen de referencia)
    const amberCanvas = document.createElement('canvas');
    amberCanvas.width = 512;
    amberCanvas.height = 512;
    const aCtx = amberCanvas.getContext('2d');
    const aGrad = aCtx.createRadialGradient(256, 256, 20, 256, 256, 256);
    aGrad.addColorStop(0, 'rgba(249, 115, 22, 0.65)');
    aGrad.addColorStop(0.45, 'rgba(217, 119, 6, 0.38)');
    aGrad.addColorStop(0.85, 'rgba(180, 83, 9, 0.12)');
    aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    aCtx.fillStyle = aGrad;
    aCtx.fillRect(0, 0, 512, 512);

    const amberCloudMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(amberCanvas),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const amberLeft = new THREE.Mesh(new THREE.PlaneGeometry(620, 450), amberCloudMat);
    amberLeft.position.set(-220, 110, -470);
    this.strandedGroup.add(amberLeft);

    const amberRight = new THREE.Mesh(new THREE.PlaneGeometry(620, 450), amberCloudMat.clone());
    amberRight.position.set(230, -70, -470);
    this.strandedGroup.add(amberRight);

    this.scene.add(this.strandedGroup);
  }

  startMission(planetKey, minDockingsRequired = 2) {
    document.body.classList.remove('quiet-derelict');
    this.criticalSceneShown=false;
    this.autoFactsRead=false;
    window.spaceAudio?.setScoreMode?.('epic');
    this.qteSystem.cancel();
    this.isDroneScanning = false;
    this.droneScanElapsed = 0;
    this.droneScanPct = 0;
    this.mathModel.minDockingsRequired = Number.isInteger(minDockingsRequired) && minDockingsRequired >= 0
      ? minDockingsRequired : 2;
    this.activePlanetKey = planetKey;
    const planetData = NASA_PLANETARY_DATABASE[planetKey] || NASA_PLANETARY_DATABASE.mars;

    this.hull = 100;
    this.fuel = 100;
    this.oxygen = 100;
    this.progress = 0;this.arrivalShot=null;this.travelShot=null;
    this.dockingSuccessCount = 0;
    this.isStrandedCinematic = false;
    this.isLaunching = true;
    this.launchTimer = 0;
    this.gateSpawnTimer = 0;
    this.approachGates = [];

    if (this.strandedGroup) this.strandedGroup.visible = false;
    if (this.strandedOverlay) this.strandedOverlay.classList.remove('active');

    const rawDist = planetData.distanceFromEarthKm || 225000000;
    this.mathModel.orbitalDistanceKm = rawDist;
    this.currentDistanceKm = rawDist;

    const distanceFactor = Math.log10(Math.max(10000, rawDist)) / 8.0;
    this.mathModel.fuelBurnRate = 1.15 * distanceFactor * planetData.speedScale;
    this.mathModel.oxygenBurnRate = 0.8 * distanceFactor;

    this.isVastnessView = false;
    if (this.camera) {
      this.camera.fov = 50;
      this.camera.updateProjectionMatrix();
    }

    this.setupEarthOrigin();
    this.setupDestinationPlanet(planetKey);

    this.ship.reset();
    for(const gate of this.approachGates||[])gate.visible=false;
    if(this.hohmannTrajectoryCurveMesh)this.hohmannTrajectoryCurveMesh.visible=false;
    if(this.hohmannTrajectoryParticles)this.hohmannTrajectoryParticles.visible=false;
    this.hazardsManager.clear();
    this.stationsManager.clear();

    // Posición inicial de despegue (saliendo de la órbita de la Tierra)
    this.camera.position.set(0, 3.2, 14);
    this.camera.lookAt(0, 1.5, -60);

    this.currentDistanceKm=this.destinationAltitudeKm();
    this.updateHUD();
    this.isFlying = true;
    this.isQTEActive = false;
    this.clock.start();
    window.dispatchEvent(new Event('odyssey-checkpoint'));

    if (window.spaceAudio) {
      window.spaceAudio.startThrusterSound();
      window.spaceAudio.playLaunchWhoosh();
    }
  }

  setupEarthOrigin() {
    if (this.earthOriginGroup) this.scene.remove(this.earthOriginGroup);
    this.earthOriginGroup = new THREE.Group();
    this.earthOriginGroup.position.set(-54, -26, -72);

    const earthGeo = new THREE.SphereGeometry(60, 64, 64);
    const earthBump = null;
    const earthSpecular = null;
    const earthNight = window.nasaApi ? window.nasaApi.createEarthNightLightsTexture() : null;

    const earthMat = new THREE.MeshStandardMaterial({
      map: window.nasaApi.createEarthTexture(),
      bumpMap: earthBump,
      bumpScale: 0.22,
      roughnessMap: earthSpecular,
      roughness: 0.35,
      metalness: 0.1,
      emissiveMap: earthNight,
      emissive: new THREE.Color(0xffe066),
      emissiveIntensity: 0.4
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthOriginGroup.add(earthMesh);

    const cloudGeo = new THREE.SphereGeometry(60 * 1.018, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: window.nasaApi.createCloudTexture(),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    this.earthOriginGroup.add(new THREE.Mesh(cloudGeo, cloudMat));

    // Baliza luminosa de Punto Azul Pálido visible a millones de kilómetros
    const paleDotGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const paleDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.paleBlueDotMesh = new THREE.Mesh(paleDotGeo, paleDotMat);
    this.paleBlueDotMesh.position.set(0, 0, 0);
    this.paleBlueDotMesh.visible = false;
    this.earthOriginGroup.add(this.paleBlueDotMesh);

    // Luna en órbita lejana
    const moonGeo = new THREE.SphereGeometry(16, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(165, 45, 80);
    this.earthOriginGroup.add(moonMesh);

    this.scene.add(this.earthOriginGroup);
  }

  setupDestinationPlanet(planetKey) {
    if (this.destinationPlanetGroup) this.scene.remove(this.destinationPlanetGroup);

    this.destinationPlanetGroup = new THREE.Group();
    // Iniciar a distancia lejana (-932.6) y escala inicial 0.18 para aproximación progresiva continua
    this.destinationPlanetGroup.position.set(0, 6, -932.6);

    const planetData = NASA_PLANETARY_DATABASE[planetKey];
    this.destinationAccretionDiskMesh = null;

    if (planetData.isBlackHole) {
      // Modelo Relativista del Agujero Negro en Vuelo Interplanetario
      const horizonGeo = new THREE.SphereGeometry(45, 48, 48);
      const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      this.destinationPlanetMesh = new THREE.Mesh(horizonGeo, horizonMat);
      this.destinationPlanetGroup.add(this.destinationPlanetMesh);

      // Anillo de Fotones
      const photonGeo = new THREE.TorusGeometry(48, 0.8, 16, 96);
      const photonMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const photonRing = new THREE.Mesh(photonGeo, photonMat);
      photonRing.rotation.x = Math.PI / 2.3;
      this.destinationPlanetGroup.add(photonRing);

      // Disco de Acreción Masivo
      const diskGeo = new THREE.RingGeometry(52, 175, 64);
      diskGeo.rotateX(Math.PI / 2.3);
      const diskMat = new THREE.MeshBasicMaterial({
        map: window.nasaApi.createBlackHoleDiskTexture(),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending
      });
      this.destinationAccretionDiskMesh = new THREE.Mesh(diskGeo, diskMat);
      this.destinationPlanetGroup.add(this.destinationAccretionDiskMesh);

      // Chorros Relativistas de Plasma Bipolares
      const jetColor = planetData.atmosphereColor || 0x00f3ff;
      const jetGeo = new THREE.CylinderGeometry(1.5, 30, 420, 32, 1, true);
      const jetMat = new THREE.MeshBasicMaterial({
        color: jetColor,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const jetTop = new THREE.Mesh(jetGeo, jetMat);
      jetTop.position.y = 210;
      this.destinationPlanetGroup.add(jetTop);

      const jetBottom = new THREE.Mesh(jetGeo.clone(), jetMat.clone());
      jetBottom.position.y = -210;
      jetBottom.rotation.x = Math.PI;
      this.destinationPlanetGroup.add(jetBottom);

      // Aura gravitacional
      const auraGeo = new THREE.SphereGeometry(62, 32, 32);
      const auraMat = new THREE.MeshBasicMaterial({
        color: planetData.atmosphereColor || 0xf59e0b,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending
      });
      this.destinationPlanetGroup.add(new THREE.Mesh(auraGeo, auraMat));

      // Lunas y satélites / compañeros de la singularidad
      this.setupDestinationMoonsAndAsteroids(planetKey, 48);

      this.destinationPlanetGroup.scale.set(0.18, 0.18, 0.18);
      this.scene.add(this.destinationPlanetGroup);
      return;
    }

    if (planetData.isDeepSpaceNebula) {
      this.destinationPlanetGroup.add(window.WorldVisuals.createNebula(70));
      this.destinationPlanetGroup.scale.set(0.18, 0.18, 0.18);
      this.scene.add(this.destinationPlanetGroup);
      return;
    }

    let texture;
    switch (planetKey) {
      case 'earth': texture = window.nasaApi.createEarthTexture(); break;
      case 'moon': texture = window.nasaApi.createMoonTexture(); break;
      case 'mars': texture = window.nasaApi.createMarsTexture(); break;
      case 'venus': texture = window.nasaApi.createVenusTexture(); break;
      case 'mercury': texture = window.nasaApi.createMercuryTexture(); break;
      case 'jupiter': texture = window.nasaApi.createJupiterTexture(); break;
      case 'saturn': texture = window.nasaApi.createSaturnTexture(); break;
      case 'uranus': texture = window.PlanetEnvironments.texture('uranus'); break;
      case 'neptune': texture = window.nasaApi.createNeptuneTexture(); break;
      case 'pillars_of_creation': texture = window.nasaApi.createDeepSpaceNebulaTexture(); break;
      default: texture = window.nasaApi.createMarsTexture();
    }

    const baseRadius = 70;
    const sphereGeo = new THREE.SphereGeometry(baseRadius, 64, 64);

    const bumpMap = null; // Preserve the mapped geography, without unrelated procedural relief.
    const specularRoughness = null;
    const nightLights = (planetKey === 'earth' && window.nasaApi) ? window.nasaApi.createEarthNightLightsTexture() : null;

    const sphereMatConfig = {
      map: texture,
      roughness: planetKey === 'earth' ? 0.62 : 0.86,
      metalness: 0
    };

    if (bumpMap) {
      sphereMatConfig.bumpMap = bumpMap;
      sphereMatConfig.bumpScale = planetKey === 'mars' ? 0.28 : (planetKey === 'moon' ? 0.32 : 0.22);
    }
    if (specularRoughness) {
      sphereMatConfig.roughnessMap = specularRoughness;
    }
    if (nightLights) {
      sphereMatConfig.emissiveMap = nightLights;
      sphereMatConfig.emissive = new THREE.Color(0xffe066);
      sphereMatConfig.emissiveIntensity = 0.4;
    }

    const sphereMat = new THREE.MeshStandardMaterial(sphereMatConfig);
    this.destinationPlanetMesh = new THREE.Mesh(sphereGeo, sphereMat);
    this.destinationPlanetGroup.add(this.destinationPlanetMesh);

    if (planetKey === 'earth' && planetData.hasClouds) {
      const cloudGeo = new THREE.SphereGeometry(baseRadius * 1.018, 64, 64);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: window.nasaApi.createCloudTexture(),
        transparent: true,
        opacity: planetKey === 'venus' ? 0.9 : 0.65,
        blending: THREE.AdditiveBlending
      });
      this.destinationCloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.destinationPlanetGroup.add(this.destinationCloudsMesh);
    }

    if (planetData.hasRings) {
      const ringGeo = window.WorldVisuals.createRings(baseRadius * 1.35, baseRadius * 2.35);
      const ringMat = new THREE.MeshStandardMaterial({
        map: window.nasaApi.createSaturnRingsTexture(),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      this.destinationRingsMesh = new THREE.Mesh(ringGeo, ringMat);
      this.destinationPlanetGroup.add(this.destinationRingsMesh);
    }

    if (planetKey !== 'moon' && planetKey !== 'mercury') {
    const glowGeo = new THREE.SphereGeometry(baseRadius * (planetKey === 'mars' ? 1.008 : 1.025), 32, 32);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(planetData.atmosphereColor) } },
      vertexShader: `
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          intensity = pow(max(0.0, 1.0 - abs(dot(vNormal, vec3(0, 0, 1.0)))), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          gl_FragColor = vec4(glowColor * intensity, intensity * 0.25);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    this.destinationGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.destinationPlanetGroup.add(this.destinationGlowMesh);
    }

    // Lunas y cinturón de pequeños asteroides alrededor del planeta de destino
    this.setupDestinationMoonsAndAsteroids(planetKey, baseRadius);

    // Escala inicial lejana que crece progresivamente con la aproximación
    this.destinationPlanetGroup.scale.set(0.18, 0.18, 0.18);
    this.scene.add(this.destinationPlanetGroup);
  }

  /* ========================================================================
     LUNAS NATURALES Y CINTURÓN DE PEQUEÑOS ASTEROIDES DEL DESTINO
     ======================================================================== */
  setupDestinationMoonsAndAsteroids(planetKey, baseRadius = 70) {
    this.destinationMoons = [];
    this.destinationOrbitingAsteroids = [];

    const scaleFactor = baseRadius / 6.2;
    const moonDefs = window.nasaApi ? window.nasaApi.getPlanetaryMoonsData(planetKey) : [];

    // 1. Instanciación de Lunas con Órbitas 3D
    moonDefs.forEach(def => {
      let moonMesh;
      const r = def.radius * scaleFactor;
      const d = def.distance * scaleFactor;

      if (def.isStar) {
        const starGeo = new THREE.SphereGeometry(r, 24, 24);
        const starMat = new THREE.MeshBasicMaterial({ color: def.color || 0xffffff });
        moonMesh = new THREE.Mesh(starGeo, starMat);
        const glowGeo = new THREE.SphereGeometry(r * 1.5, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color: def.color || 0x60a5fa,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending
        });
        moonMesh.add(new THREE.Mesh(glowGeo, glowMat));
      } else if (def.isRock) {
        const rockGeo = new THREE.DodecahedronGeometry(r, 2);
        const rockMat = new THREE.MeshStandardMaterial({
          map: window.nasaApi ? window.nasaApi.createAsteroidRockTexture() : null,
          roughness: 0.85,
          metalness: 0.1
        });
        moonMesh = new THREE.Mesh(rockGeo, rockMat);
      } else {
        const sphereGeo = new THREE.SphereGeometry(r, 32, 32);
        const tex = def.textureFn ? def.textureFn() : (window.nasaApi ? window.nasaApi.createMoonTexture() : null);
        const sphereMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.75,
          metalness: 0.08
        });
        moonMesh = new THREE.Mesh(sphereGeo, sphereMat);
      }

      // Trayectoria de órbita luminosa
      const points = [];
      const segs = 64;
      for (let i = 0; i <= segs; i++) {
        const th = (i / segs) * Math.PI * 2;
        const px = Math.cos(th) * d;
        const pz = Math.sin(th) * d;
        const py = Math.sin(th) * (d * Math.tan(def.inclination || 0));
        points.push(new THREE.Vector3(px, py, pz));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMat = new THREE.LineBasicMaterial({
        color: def.isStar ? 0x60a5fa : 0x38bdf8,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      this.destinationPlanetGroup.add(orbitLine);

      const curX = Math.cos(def.angle) * d;
      const curZ = Math.sin(def.angle) * d;
      const curY = Math.sin(def.angle) * (d * Math.tan(def.inclination || 0));
      moonMesh.position.set(curX, curY, curZ);

      this.destinationPlanetGroup.add(moonMesh);

      this.destinationMoons.push({
        mesh: moonMesh,
        distance: d,
        speed: def.speed,
        angle: def.angle,
        inclination: def.inclination || 0
      });
    });

    // 2. Anillo ligero y despejado de Asteroides Orbitando el Planeta de Destino (reducido a 8)
    const isRinged = planetKey === 'saturn';
    const minOrbit = baseRadius * 1.55;
    const maxOrbit = baseRadius * 3.2;
    const asteroidCount = (planetKey === 'saturn' || planetKey === 'jupiter') ? 10 : 8;

    for (let i = 0; i < asteroidCount; i++) {
      const orbitDist = minOrbit + Math.random() * (maxOrbit - minOrbit);
      const keplerSpeed = (0.012 / Math.sqrt(orbitDist / baseRadius)) * (0.85 + Math.random() * 0.3);
      const inc = (Math.random() - 0.5) * (isRinged ? 0.05 : 0.22);
      const angle = Math.random() * Math.PI * 2;
      const size = (0.06 + Math.random() * 0.08) * scaleFactor;

      const aGeo = new THREE.DodecahedronGeometry(size, 1);
      const aMat = new THREE.MeshStandardMaterial({
        map: window.nasaApi ? window.nasaApi.createAsteroidRockTexture() : null,
        roughness: 0.85,
        metalness: 0.15
      });
      const aMesh = new THREE.Mesh(aGeo, aMat);

      const ax = Math.cos(angle) * orbitDist;
      const az = Math.sin(angle) * orbitDist;
      const ay = Math.sin(angle) * (orbitDist * Math.tan(inc)) + (Math.random() - 0.5) * 3;
      aMesh.position.set(ax, ay, az);

      this.destinationPlanetGroup.add(aMesh);

      this.destinationOrbitingAsteroids.push({
        mesh: aMesh,
        distance: orbitDist,
        speed: keplerSpeed,
        angle: angle,
        inclination: inc,
        rotX: (Math.random() - 0.5) * 0.03,
        rotY: (Math.random() - 0.5) * 0.04,
        rotZ: (Math.random() - 0.5) * 0.02
      });
    }
  }

  spawnApproachGate() {
    const ringGeo = new THREE.TorusGeometry(12, 0.6, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
    const gate = new THREE.Mesh(ringGeo, ringMat);
    gate.position.set(
      this.ship.position.x + (Math.random() - 0.5) * 12,
      this.ship.position.y + (Math.random() - 0.5) * 8,
      -420
    );
    this.scene.add(gate);
    this.approachGates.push(gate);
  }

  updateApproachGates(delta) {
    for (let i = this.approachGates.length - 1; i >= 0; i--) {
      const g = this.approachGates[i];
      g.position.z += 175 * delta;
      g.rotation.z += 0.02;

      // Cruce del anillo por la nave
      if (Math.abs(g.position.z - this.ship.position.z) < 6.0) {
        const dx = Math.abs(g.position.x - this.ship.position.x);
        const dy = Math.abs(g.position.y - this.ship.position.y);
        if (dx < 12 && dy < 12) {
          if (window.spaceAudio) window.spaceAudio.playGatePassSound();
          this.showHUDAlert('⚡ ¡PUERTA DE NAVEGACIÓN SUPERADA! RUMBO ALINEADO AL PLANETA', 'dock-alert');
          this.progress = Math.min(100, this.progress + 2.5);
          this.scene.remove(g);
          this.approachGates.splice(i, 1);
          continue;
        }
      }

      if (g.position.z > 35) {
        this.scene.remove(g);
        this.approachGates.splice(i, 1);
      }
    }
  }

  update() {
    if (!this.isFlying && !this.isStrandedCinematic) return;
    const delta = Math.min(this.clock.getDelta(), 0.1);
    window.Fluidity?.frame(this.renderer, delta);
    if(!this.isStrandedCinematic&&!this.isQTEActive&&this.progress>=85&&['earth','moon','mars','venus','mercury','uranus','saturn','jupiter','neptune'].includes(this.activePlanetKey)&&this.hull>0){this.updatePlanetArrival(delta);return;}

    // ========================================================================
    // CINEMÁTICA: NAVE EN REPOSO / DESOLADA EN EL VACÍO CÓSMICO (IDÉNTICA A LA IMAGEN)
    // ========================================================================
    if (this.isStrandedCinematic) {
      this.ship.update(delta);

      // Si el usuario toca cualquier control de vuelo mientras estaba quieto, retomar vuelo
      const isPressingControls = this.ship && (
        this.ship.keys.up || this.ship.keys.down || 
        this.ship.keys.left || this.ship.keys.right
      );
      if (isPressingControls && this.isIdleCinematic) {
        this.exitIdleCinematic();
        return;
      }

      // A single uninterrupted drift; no scene carousel.
      // Si el usuario está solo en reposo voluntario (idle), mantener nave estática con micro-respiración
      if (this.isIdleCinematic) {
        if (this.ship && this.ship.shipGroup) {
          const curScene = this.failureScenes[this.currentFailureSceneIndex];
          const time = this.clock.getElapsedTime();
          this.ship.position.y = (curScene ? curScene.shipPos.y : -0.2) + Math.sin(time * 0.4) * 0.05;
        }
      }
      // En modo derelict/perdido (!this.isIdleCinematic), this.ship.update(delta) actualiza la posición y rotación con deriva espacial continua

      // Movimiento suave de cámara: sigue a la nave flotante a la deriva o responde a órbita libre
      if (this.isFreeCamera && this.orbitControls) {
        if (this.ship && !this.isIdleCinematic) {
          this.orbitControls.target.lerp(this.ship.position, delta * 4.0);
        }
        this.orbitControls.update();
      } else {
        const curScene = this.failureScenes[this.currentFailureSceneIndex];
        const baseCam = (curScene && curScene.camPos) ? curScene.camPos : { x: 0, y: 0, z: 40 };
        const shipPos = (this.ship && this.ship.position) ? this.ship.position : { x: 0, y: 0, z: 0 };
        const time = this.clock.getElapsedTime();
        const driftX = this.isIdleCinematic ? Math.sin(time * 0.22) * 1.5 : 0;
        const driftY = this.isIdleCinematic ? Math.cos(time * 0.16) * 0.8 : 0;

        const targetCamX = (!this.isIdleCinematic ? shipPos.x : 0) + baseCam.x + driftX;
        const targetCamY = (!this.isIdleCinematic ? shipPos.y : 0) + baseCam.y + driftY;
        const targetCamZ = (!this.isIdleCinematic ? shipPos.z : 0) + baseCam.z;

        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, delta * 2.0);
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, delta * 2.0);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, delta * 2.0);

        const targetLookX = !this.isIdleCinematic ? shipPos.x : ((curScene && curScene.camLook) ? curScene.camLook.x : 0);
        const targetLookY = !this.isIdleCinematic ? shipPos.y : ((curScene && curScene.camLook) ? curScene.camLook.y : 0);
        const targetLookZ = !this.isIdleCinematic ? shipPos.z : ((curScene && curScene.camLook) ? curScene.camLook.z : 0);

        this.camera.lookAt(targetLookX, targetLookY, targetLookZ);
      }

      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.updateDroneScan(delta);

    // Detección de Aceleración y Régimen de Impulso Turbo Boost
    const isBoosting = !this.isStrandedCinematic && this.ship && this.ship.keys && this.ship.keys.boost;
    this.isBoosting = isBoosting;

    // Aceleración y Velocidad Dinámica Relativista (Crucero 1,000 km/s -> Turbo 3,600 km/s)
    const targetSpeed = isBoosting ? this.boostSpeedKm : this.cruiseSpeedKm;
    const speedLerp = isBoosting ? 4.5 : 2.5;
    this.currentSpeedKm = THREE.MathUtils.lerp(this.currentSpeedKm, targetSpeed, delta * speedLerp);
    this.boostRatio = this.currentSpeedKm / this.cruiseSpeedKm;

    if (isBoosting && !this.wasBoostingLastFrame) {
      if (window.spaceAudio && window.spaceAudio.playBoostIgnite) {
        window.spaceAudio.playBoostIgnite();
      }
    }
    this.wasBoostingLastFrame = isBoosting;

    if (window.spaceAudio && window.spaceAudio.setThrusterBoost) {
      window.spaceAudio.setThrusterBoost(isBoosting, this.boostRatio);
    }

    // Actualizar líneas de aceleración relativista (Warp Speed Lines) con factor de impulso
    this.updateWarpSpeedLines(delta, this.boostRatio);

    // ========================================================================
    // VUELO NORMAL HACIA EL PLANETA
    // ========================================================================
    if (!this.isQTEActive) {
      if (this.ship && (this.ship.keys.up || this.ship.keys.down || this.ship.keys.left || this.ship.keys.right || this.ship.keys.boost)) {
        this.idleTime = 0;
      } else {
        this.idleTime = (this.idleTime || 0) + delta;
      }

      this.ship.update(delta);
      this.ship.setDamage(1.0 - (this.hull / 100));

      const fuelMult = isBoosting ? 1.45 : 1.0;
      this.fuel = Math.max(0, this.fuel - delta * this.mathModel.fuelBurnRate * fuelMult * (window.CrewDiary?.modifier('leo')||1));
      this.oxygen = Math.max(0, this.oxygen - delta * this.mathModel.oxygenBurnRate);
      const crew=window.ExpeditionSystems?.state;if(crew){const before=crew.hull;crew.consumeCrew(delta);this.hull=Math.max(0,this.hull-(before-crew.hull));}

      // Avisos por radio de escasez crítica de suministros
      if (this.fuel < 32 && window.odysseyStory && window.odysseyStory.triggerLowFuel) {
        window.odysseyStory.triggerLowFuel(this.fuel);
      }
      if (this.oxygen < 28 && window.odysseyStory && window.odysseyStory.triggerLowOxygen) {
        window.odysseyStory.triggerLowOxygen(this.oxygen);
      }

      if ((this.fuel <= 0 || this.oxygen <= 0 || this.hull<=0) && !this.isStrandedCinematic) {
        this.isIdleCinematic = false;
        this.triggerDamageFlash();
        if (window.spaceAudio) window.spaceAudio.playWarningBeep();
        const reason = this.hull<=0?'Fallo del soporte vital o casco destruido':this.fuel <= 0
          ? 'Agotamiento Total de Combustible // Reactores Apagados'
          : 'Soporte Vital Crítico // Oxígeno al Cero Absoluto';
        const desc = this.fuel <= 0
          ? 'Los reactores de fusión consumieron la totalidad del combustible antes de alcanzar la órbita de inserción. Con los propulsores apagados y subsistemas sobrecalentados, la nave Arwing queda inoperativa y varada, vagando eternamente por el vacío cósmico.'
          : 'Las reservas de oxígeno vital descendieron al 0%. Los sistemas auxiliares colapsaron por congelación criogénica y la nave queda varada con daño interno, vagando a la deriva en el silencio del universo.';
        this.showHUDAlert('¡SUMINISTROS AGOTADOS! MOTORES APAGADOS // A LA DERIVA', 'danger');
        this.triggerStrandedCinematic(1, reason, desc);
        return;
      }

      const progressMult = 0.65 + this.boostRatio * 0.48;
      this.progress = Math.min(100, this.progress + delta * 2.2 * progressMult);
      const remainingRatio = 1 - (this.progress / 100);
      // Distance is measured from the rendered ship to the destination surface.
      this.currentDistanceKm = this.destinationAltitudeKm();
      window.AutoPlanetFacts?.flight(this);

      // Alejar la Tierra de origen de forma progresiva y continua hasta convertirse en el "Pálido Punto Azul"
      if (this.earthOriginGroup) {
        const progressRatio = Math.min(1, Math.max(0, this.progress / 100));
        const recedeEase = progressRatio * (2 - progressRatio);
        this.earthOriginGroup.position.x = -54 - recedeEase * 95;
        this.earthOriginGroup.position.y = -26 - recedeEase * 42;
        this.earthOriginGroup.position.z = -72 + Math.pow(progressRatio, 1.15) * 1850;
        this.earthOriginGroup.rotation.y += 0.12 * delta;
        const s = Math.max(0.025, Math.pow(1.0 - progressRatio * 0.96, 1.75));
        this.earthOriginGroup.scale.set(s, s, s);
        if (this.paleBlueDotMesh) this.paleBlueDotMesh.visible = progressRatio > 0.42;
      }

      // ======================================================================
      // APROXIMACIÓN PROGRESIVA: EL PLANETA SE ACERCA Y CRECE CONTINUAMENTE SIN SALTOS
      // ======================================================================
      if (this.destinationPlanetGroup) {
        const progressRatio = Math.min(1, Math.max(0, this.progress / 100));
        const pNorm = Math.min(1, progressRatio / 0.85);
        const approachCurve = pNorm * pNorm * (0.35 + 0.65 * pNorm);
        const scaleVal = 0.18 + approachCurve * 2.52;
        const gap = 82 + 838 * Math.pow(1 - pNorm, 1.85);
        this.destinationPlanetGroup.position.z = this.ship.position.z - (70 * scaleVal + gap);
        this.destinationPlanetGroup.scale.set(scaleVal, scaleVal, scaleVal);
        this.currentDistanceKm=this.destinationAltitudeKm();

        // Rotación continua visible y perceptible en tiempo real
        this.updateDestinationRotation(delta);

        // Órbitas continuas de Lunas y Pequeños Asteroides alrededor del destino
        if (this.destinationMoons && this.destinationMoons.length > 0) {
          const step = delta * 60;
          this.destinationMoons.forEach(m => {
            m.angle += m.speed * step;
            const x = Math.cos(m.angle) * m.distance;
            const z = Math.sin(m.angle) * m.distance;
            const y = Math.sin(m.angle) * (m.distance * Math.tan(m.inclination));
            m.mesh.position.set(x, y, z);
            m.mesh.rotation.y += 0.015 * step;
          });
        }

        if (this.destinationOrbitingAsteroids && this.destinationOrbitingAsteroids.length > 0) {
          const step = delta * 60;
          this.destinationOrbitingAsteroids.forEach(a => {
            a.angle += a.speed * step;
            const x = Math.cos(a.angle) * a.distance;
            const z = Math.sin(a.angle) * a.distance;
            const y = Math.sin(a.angle) * (a.distance * Math.tan(a.inclination));
            a.mesh.position.set(x, y, z);
            a.mesh.rotation.x += a.rotX * step;
            a.mesh.rotation.y += a.rotY * step;
            a.mesh.rotation.z += a.rotZ * step;
          });
        }
      }

      // Generar y actualizar puertas de navegación hacia el planeta
      this.gateSpawnTimer += delta;
      if (this.gateSpawnTimer > 7.0 && this.progress < 90) {
        this.gateSpawnTimer = 0;
        this.spawnApproachGate();
      }
      this.updateApproachGates(delta);

      this.updateMissionStageText();

      // Detección de colisiones directa con asteroides (35% de daño)
      this.hazardsManager.update(delta, this.ship.position, (type, damage) => {
        this.onCollision(type, damage);
      }, this.ship.barrelTime > 0);

      this.stationsManager.update(delta, this.ship.position, (name, type) => {
        this.onDockingStationEncountered(name, type);
      });

      // ======================================================================
      // SISTEMA DE CÁMARAS DINÁMICAS MULTI-PERSPECTIVA Y ARRASTRE 360°
      // ======================================================================
      if (this.isLaunching) {
        this.launchTimer += delta;
        const launchDistance = 30 * Math.max(1, 0.95 / this.camera.aspect);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, launchDistance, 1 - Math.exp(-delta * 4));
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 5.5, 0.05);
        if (this.launchTimer > 3.0) this.isLaunching = false;
      } else {
        const shipPos = this.ship.position.clone();
        let baseOffset = new THREE.Vector3(0, 5.0, 18.0);
        let targetFov = 50;

        switch (this.currentCameraMode) {
          case 'top':
            // Desde arriba de la nave (Dorsal / Cenital)
            baseOffset.set(0, 24.0, 1.5);
            targetFov = 54;
            break;
          case 'bottom':
            // Desde abajo de la nave (Ventral / Contrapicado hacia motores)
            baseOffset.set(0, -18.0, 4.5);
            targetFov = 52;
            break;
          case 'cockpit':
            // Primera persona desde la cabina del piloto en la proa
            baseOffset.set(0, 1.25, -2.4);
            targetFov = 64;
            break;
          case 'far':
            // Muy lejos en el cosmos (Panorámica cinemática)
            baseOffset.set(0, 36.0, 85.0);
            targetFov = 60;
            break;
          case 'chase':
          default:
            // Vista clásica de persecución detrás de la nave
            baseOffset.set(0, 6.5, 30.0);
            targetFov = 50;
            break;
        }

        if (this.currentCameraMode !== 'cockpit') baseOffset.multiplyScalar(Math.max(1, 0.95 / this.camera.aspect));

        // Mantener encuadre progresivo sin alejar el planeta al activar el impulso
        const boostFov = this.currentCameraMode === 'cockpit' && this.isBoosting ? 2.5 : 0;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov + boostFov, delta * 4.5);
        this.camera.updateProjectionMatrix();

        if (this.currentCameraMode === 'cockpit') {
          // En primera persona la cámara está en la cabina con inercia G y anticipación de giro Starfield
          const k = this.ship?.keys || {};
          const gLag = new THREE.Vector3(
            ((k.right || k.strafeRight) ? 0.12 : (k.left || k.strafeLeft) ? -0.12 : 0),
            ((k.up || k.strafeUp) ? -0.10 : (k.down || k.strafeDown) ? 0.12 : 0),
            (this.isBoosting ? -0.32 : 0)
          );
          const cockpitPos = shipPos.clone().add(baseOffset).add(gLag);
          this.camera.position.lerp(cockpitPos, 1-Math.exp(-delta*10));

          const lookDir = new THREE.Vector3(0, 0, -1);
          lookDir.applyEuler(new THREE.Euler(-this.orbitPitch, this.orbitYaw, 0, 'YXZ'));
          this.camera.lookAt(cockpitPos.clone().add(lookDir.multiplyScalar(80)));
        } else {
          // En modos en 3ra persona (chase, top, bottom, far), el arrastre de ratón orbita suavemente en 360°
          const spherical = new THREE.Spherical().setFromVector3(baseOffset);
          spherical.theta += this.orbitYaw;
          spherical.phi = Math.max(0.08, Math.min(Math.PI - 0.08, spherical.phi - this.orbitPitch));

          const rotOffset = new THREE.Vector3().setFromSpherical(spherical);
          const targetPos = shipPos.clone().add(rotOffset);

          this.camera.position.lerp(targetPos, 1-Math.exp(-delta*8.5));
          this.camera.lookAt(shipPos.clone().add(new THREE.Vector3(0, 0, -12)));
        }

        // Trepidación por fuerza G a altas velocidades relativistas
        if (this.boostRatio > 1.2) {
          const rumble = (this.boostRatio - 1.0) * 0.055;
          this.camera.position.x += (Math.random() - 0.5) * rumble;
          this.camera.position.y += (Math.random() - 0.5) * rumble * 0.7;
        }
      }

      // ======================================================================
      // ACTUALIZACIÓN DE DRONES Y ESCANEO PROGRESIVO DEL PLANETA
      // ======================================================================
      if (this.flightActiveDrones && this.flightActiveDrones.length > 0 && this.destinationPlanetGroup) {
        const shipWorld = (this.ship && this.ship.shipGroup)
          ? this.ship.shipGroup.getWorldPosition(new THREE.Vector3())
          : (this.ship && this.ship.position ? this.ship.position.clone() : this.camera.position.clone());
        const shipLocal = this.destinationPlanetGroup.worldToLocal(shipWorld.clone());
        const scanRatio = Math.max(0, Math.min(1, (this.droneScanPct || 0) / 100));

        if (this.flightScanOverlay) {
          this.flightScanOverlay.rotation.y += delta * 0.65;
          if (this.flightScanShell && this.flightScanShell.material) {
            this.flightScanShell.material.opacity = this.isDroneScanning ? (0.06 + scanRatio * 0.24) : Math.max(0, this.flightScanShell.material.opacity - delta * 0.3);
            this.flightScanShell.scale.y = Math.max(0.08, scanRatio || 1);
          }
          if (this.flightScanRing && this.flightScanRing.material) {
            const latY = (1 - scanRatio * 2) * 70.5;
            const ringR = Math.max(4, Math.sqrt(Math.max(0, 72 * 72 - latY * latY)));
            this.flightScanRing.position.y = latY;
            this.flightScanRing.scale.set(ringR, ringR, 1);
            this.flightScanRing.material.opacity = this.isDroneScanning ? 0.82 : 0;
          }
        }

        this.flightActiveDrones.forEach((d, idx) => {
          d.angle += d.speed * delta * 60;
          const x = Math.cos(d.angle) * d.distance;
          const z = Math.sin(d.angle) * d.distance * Math.cos(d.inclination);
          const y = Math.sin(d.angle) * d.distance * Math.sin(d.inclination);
          d.launchTime = (d.launchTime || 0) + delta;
          const tLocal = Math.max(0, d.launchTime - idx * 0.22);
          const eject = Math.min(1, tLocal / 0.5);
          const launch = Math.max(0, Math.min(1, (tLocal - 0.35) / 1.45));
          const ease = launch * launch * (3 - 2 * launch);
          if (tLocal < 0.5) {
            d.launchOrigin = shipLocal.clone().add(new THREE.Vector3((idx - 1) * 2.2 * eject, (1.2 + idx * 0.5) * eject, -3.5 * eject));
          }
          const origin = d.launchOrigin || d.launch || shipLocal;
          const orbitPos = new THREE.Vector3(x, y, z);
          const midArc = origin.clone().lerp(orbitPos, 0.5).add(new THREE.Vector3((idx - 1) * 18, 22 + idx * 6, 0));
          const p0 = origin.clone().lerp(midArc, ease);
          const p1 = midArc.clone().lerp(orbitPos, ease);
          d.group.position.lerpVectors(p0, p1, ease);
          d.group.scale.setScalar(0.45 + eject * 0.45 + ease * 0.95);
          d.group.lookAt(this.destinationPlanetGroup.getWorldPosition(new THREE.Vector3()));
          if (d.wingMesh) {
            d.wingMesh.scale.x = 0.1 + 0.9 * Math.min(1, tLocal / 0.75);
          }
          if (d.laserMesh && d.laserMesh.material) {
            d.laserMesh.visible = ease > 0.65;
            d.laserMesh.material.opacity = (0.35 + Math.sin(Date.now() * 0.015 + d.phase) * 0.25) * Math.min(1, (ease - 0.65) / 0.35);
          }
          if (d.ionGlow) {
            d.ionGlow.scale.setScalar((ease < 1 ? 1.45 : 0.9) + Math.sin(Date.now() * 0.025 + idx) * 0.22);
          }
        });
      }

      if (this.hohmannTrajectoryParticles) {
        const posAttr = this.hohmannTrajectoryParticles.geometry.attributes.position;
        const positions = posAttr.array;
        const progressArr = this.hohmannTrajectoryParticles.userData.progress;
        const curve = this.hohmannTrajectoryParticles.userData.curve;
        if (curve && progressArr) {
          for (let i = 0; i < progressArr.length; i++) {
            progressArr[i] = (progressArr[i] + delta * 0.28) % 1.0;
            const pt = curve.getPoint(progressArr[i]);
            positions[i * 3] = pt.x;
            positions[i * 3 + 1] = pt.y;
            positions[i * 3 + 2] = pt.z;
          }
          posAttr.needsUpdate = true;
        }
      }

      this.updateApproachBar();
      this.checkGameConditions();
    }

    // Actualizar capas de fondo y polvo cósmico para una inmensidad viva en tiempo real
    this.updateDeepSpaceBackground(delta);

    this.updateHUD();
    this.renderer.render(this.scene, this.camera);
  }

  destinationAltitudeKm(){
    if(!this.destinationPlanetGroup||!this.ship?.position)return 0;
    const radius=70*this.destinationPlanetGroup.scale.x,kmRadius=({earth:6371,moon:1737.4,mars:3389.5,mercury:2439.7,venus:6051.8,uranus:25362})[this.activePlanetKey]||6371;
    return Math.max(0,(this.ship.position.distanceTo(this.destinationPlanetGroup.position)-radius)/radius*kmRadius);
  }
  updatePlanetArrival(dt){
    const planet=this.destinationPlanetGroup;if(!planet)return;
    this.shipGroup=this.ship?.shipGroup;
    if(!this.arrivalShot){this._reentryRoarPlayed=false;this.arrivalShot={time:0,gap:Math.max(.14,this.ship.position.distanceTo(planet.position)-70*planet.scale.x),direction:this.ship.position.clone().sub(planet.position).normalize()};this.travelShot=true;this.currentCameraMode='chase';this.cameraTransitionRemaining=0;this.ship.keys={};this.ship.velocity?.set(0,0,0);}
    const shot=this.arrivalShot;
    const boost=(this.keys?.Space||this.keys?.KeyW||this.keys?.ArrowUp||this.ship?.keys?.Space||this.ship?.keys?.KeyW)?2.2:1.0;
    shot.time+=dt*boost;
    const t=Math.min(1,shot.time/7),ease=t*t*(3-2*t),radius=70*planet.scale.x;
    // Aproximación continua y progresiva hacia el horizonte planetario con actitud aerodinámica y pre-entrada atmosférica.
    const gap=radius*.22+(shot.gap-radius*.22)*Math.pow(1-ease,1.75);
    const direction=shot.direction;
    this.ship.position.copy(planet.position).addScaledVector(direction,radius+gap);this.ship.shipGroup.position.copy(this.ship.position);
    const entryPitch=-.18*ease-.04*Math.sin(t*Math.PI*2),entryRoll=-.08*Math.sin(t*Math.PI);
    this.ship.shipGroup.rotation.set(entryPitch,0,entryRoll);
    const model=this.ship.arwingModel?.mesh;if(model)model.visible=true;
    const clouded=!['moon','mercury'].includes(this.activePlanetKey);
    this.ship.arwingModel?.update?.(dt,180+260*ease,{roll:entryRoll*3,pitch:entryPitch*2,brake:t>.62,boost:t<.45,rcs:true});
    if(t>.25){
      const entryProgress=Math.min(1.0,(t-.25)/.70);
      window.EntryFX?.update?.(this,entryProgress,dt,{departure:false,clouded});
      if(clouded&&t>.4&&!this._reentryRoarPlayed){
        this._reentryRoarPlayed=true;
        window.spaceAudio?.playReentryRoar?.();
      }
    }
    if(!this._arrivalScratch){this._arrivalScratch={up:new THREE.Vector3(),side:new THREE.Vector3(),offset:new THREE.Vector3(),lookTarget:new THREE.Vector3()};}
    const sc=this._arrivalScratch;sc.up.set(0,1,0);if(Math.abs(direction.dot(sc.up))>.95)sc.up.set(1,0,0);
    sc.side.crossVectors(sc.up,direction).normalize();
    sc.offset.copy(direction).multiplyScalar(30-12*ease).addScaledVector(sc.up,6.5-2.5*ease).addScaledVector(sc.side,3.5*Math.sin(ease*Math.PI*.5));
    this.camera.position.copy(this.ship.position).add(sc.offset);
    sc.lookTarget.copy(this.ship.position).lerp(planet.position,.28+.32*ease);
    this.camera.lookAt(sc.lookTarget);this.camera.fov=50-3*ease;this.camera.updateProjectionMatrix();
    this.progress=85+t*15;this.currentDistanceKm=this.destinationAltitudeKm();this.updateHUD();
    if(this.destinationGlowMesh?.material){this.destinationGlowMesh.material.opacity=!clouded?0:Math.min(.34,.08+ease*.26);}
    if(this.navStageText)this.navStageText.textContent=t<.2?'DESTINO A LA VISTA · ALINEANDO PROA':t<.65?'ENTRADA ORBITAL · DESCENSO PROGRESIVO':!clouded?'APROXIMACIÓN A LA SUPERFICIE':'ENTRANDO EN LA ATMÓSFERA SUPERIOR';
    this.updateDestinationRotation(dt);this.renderer.render(this.scene,this.camera);
    if(t===1){window.EntryFX?.clear?.(this);this.arrivalShot=null;this.travelShot=null;this.isFlying=false;window.spaceAudio?.stopThrusterSound?.();this.onStartLanding?.(this.activePlanetKey,Math.round(this.hull));}
  }
  updatePaused() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.updateDeepSpaceBackground(delta);
    this.updateDestinationRotation(delta);
    this.renderer.render(this.scene, this.camera);
  }

  updateDestinationRotation(delta) {
    if (this.destinationPlanetMesh) this.destinationPlanetMesh.rotation.y += delta * 0.08;
    if (this.destinationCloudsMesh) this.destinationCloudsMesh.rotation.y += delta * 0.12;
    if (this.destinationRingsMesh) this.destinationRingsMesh.rotation.z += delta * 0.03;
    if (this.destinationAccretionDiskMesh) this.destinationAccretionDiskMesh.rotation.z -= delta * 0.18;
  }

  updateMissionStageText() {
    if (!this.navStageText) return;
    if (this.progress < 25) {
      this.navStageText.textContent = 'ETAPA 1: SALIDA DE LA TIERRA // INYECCIÓN TRANSLUNAR';
    } else if (this.progress < 60) {
      this.navStageText.textContent = 'ETAPA 2: TRÁNSITO EN ESPACIO PROFUNDO // CINTURÓN DE ESCOMBROS';
    } else if (this.progress < 85) {
      this.navStageText.textContent = 'ETAPA 3: APROXIMACIÓN ORBITAL // CAPTURA GRAVITATORIA';
    } else {
      this.navStageText.textContent = 'ETAPA 4: INSERCIÓN EN ÓRBITA BAJA // FRICCIÓN ATMOSFÉRICA';
    }
  }

  // ==========================================================================
  // MÉTODOS DE CÁMARA MULTI-PERSPECTIVA Y ACCIONES DE APROXIMACIÓN PLANETARIA
  // ==========================================================================

  cycleCameraMode(targetMode = null) {
    if(this.isStrandedCinematic)return;
    if (targetMode && this.cameraModes.includes(targetMode)) {
      this.currentCameraMode = targetMode;
    } else {
      this.currentCameraMode = this.currentCameraMode === 'cockpit' ? 'chase' : 'cockpit';
    }

    this.orbitYaw = 0;
    this.orbitPitch = 0;

    const labels = {
      chase: 'PERSECUCIÓN [V]',
      top: 'DESDE ARRIBA [V]',
      bottom: 'DESDE ABAJO [V]',
      cockpit: 'CABINA [V]',
      far: 'MUY LEJOS [V]'
    };

    const label = labels[this.currentCameraMode] || this.currentCameraMode.toUpperCase();
    const camNameEl = document.getElementById('flight-cam-name');
    if (camNameEl) camNameEl.textContent = label;
    const globalLabel = document.getElementById('global-cam-label');
    if (globalLabel) globalLabel.textContent = label.replace(' [V]', '');

    this.showHUDAlert(`🎥 CÁMARA: ${label.replace(' [V]', '')} // Arrastra con el ratón para rotar 360°`, 'dock-alert');

    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.playCosmicVastnessChime();
    }
  }

  executeHohmannCalculation() {
    this.isHohmannCalculated = true;

    // Obtener datos del planeta destino
    const pData = (window.NASA_PLANETARY_DATABASE && window.NASA_PLANETARY_DATABASE[this.activePlanetKey])
      ? window.NASA_PLANETARY_DATABASE[this.activePlanetKey]
      : { name: 'Marte', semiMajorAxisKm: 227900000 };

    // Cálculo orbital
    const r1 = 149600000; // Radio órbita Tierra (km)
    const r2 = pData.semiMajorAxisKm || 227900000;
    const mu = 132712440018; // Parámetro gravitacional estándar Sol (km^3/s^2)
    const deltav1 = Math.sqrt(mu / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1);
    const deltavTotal = Math.abs(deltav1 * 1.75).toFixed(2);
    const transitHours = Math.round(Math.PI * Math.sqrt(Math.pow((r1 + r2) / 2, 3) / mu) / 3600);
    const flightHours = Math.min(62.5, (transitHours / 70).toFixed(1));

    // Generar o actualizar curva 3D de transferencia en el espacio
    if (this.hohmannTrajectoryCurveMesh) {
      this.scene.remove(this.hohmannTrajectoryCurveMesh);
      if (this.hohmannTrajectoryParticles) this.scene.remove(this.hohmannTrajectoryParticles);
    }

    const startPt = new THREE.Vector3(0, 0, 160);
    const destPos = this.destinationPlanetGroup ? this.destinationPlanetGroup.position.clone() : new THREE.Vector3(0, 0, -450);
    const midPt1 = new THREE.Vector3(38, 14, (startPt.z + destPos.z) * 0.35);
    const midPt2 = new THREE.Vector3(-22, 8, (startPt.z + destPos.z) * 0.75);

    const curve = new THREE.CatmullRomCurve3([startPt, midPt1, midPt2, destPos]);
    const tubeGeo = new THREE.TubeGeometry(curve, 72, 0.45, 12, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.hohmannTrajectoryCurveMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.hohmannTrajectoryCurveMesh);

    // Partículas energéticas que fluyen a lo largo del arco
    const partCount = 28;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    const partProgress = [];
    for (let i = 0; i < partCount; i++) {
      const t = i / partCount;
      partProgress.push(t);
      const pt = curve.getPoint(t);
      partPos[i * 3] = pt.x;
      partPos[i * 3 + 1] = pt.y;
      partPos[i * 3 + 2] = pt.z;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 2.4,
      sizeAttenuation: false,
      map: window.CinematicVisuals.stellarMap(),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.hohmannTrajectoryParticles = new THREE.Points(partGeo, partMat);
    this.hohmannTrajectoryParticles.userData = { curve, progress: partProgress };
    this.scene.add(this.hohmannTrajectoryParticles);

    // Actualizar HUD Chip
    const chip = document.getElementById('flight-hohmann-chip');
    if (chip) {
      chip.style.display = 'block';
      const dvEl = document.getElementById('hchip-dv');
      if (dvEl) dvEl.textContent = `${deltavTotal} km/s`;
      const timeEl = document.getElementById('hchip-time');
      if (timeEl) timeEl.textContent = `${flightHours} h`;
      const fuelEl = document.getElementById('hchip-fuel');
      if (fuelEl) fuelEl.textContent = `${Math.round(deltavTotal * 24.5)}%`;
    }

    this.showHUDAlert(`🧮 TRAYECTORIA DE HOHMANN TRAZADA EN 3D // Δv = ${deltavTotal} km/s`, 'dock-alert');

    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.playTrajectoryLockSound();
    }
  }

  async requestFlightReconDrones() {
    if (!this.isFlying || this.isStrandedCinematic || this.isQTEActive || this.isDroneScanning || window.partialPause?.isPaused) return;
    const target = this.activePlanetKey;
    if (window.missionChallenges?.requestProgressive) {
      const authorized = await window.missionChallenges.requestProgressive('drones', target);
      if (!authorized) return;
    }

    if (this.activePlanetKey === target && this.isFlying && !this.isStrandedCinematic) this.deployFlightReconDrones();
  }

  deployFlightReconDrones() {
    if (!this.isFlying || this.isStrandedCinematic || window.partialPause?.isPaused || this.isDroneScanning) return;
    this.isDroneScanning = true;
    this.droneScanPct = 0;
    this.droneScanElapsed = 0;

    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.playDroneDeploySound();
    }

    this.showHUDAlert('Compuerta abierta · drones saliendo de la nave y escaneando el planeta', 'dock-alert');

    // Instanciar drones 3D que salen de la nave y entran en órbita alrededor del planeta destino
    if (this.destinationPlanetGroup && this.flightActiveDrones.length === 0) {
      if (!this.flightScanOverlay) {
        this.flightScanOverlay = new THREE.Group();
        this.flightScanShell = new THREE.Mesh(
          new THREE.SphereGeometry(71.8, 24, 18),
          new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
        );
        this.flightScanRing = new THREE.Mesh(
          new THREE.TorusGeometry(1, 0.016, 8, 64),
          new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
        );
        this.flightScanRing.rotation.x = Math.PI / 2;
        this.flightScanOverlay.add(this.flightScanShell, this.flightScanRing);
        this.destinationPlanetGroup.add(this.flightScanOverlay);
      }

      const droneConfigs = [
        { name: 'DRONE-01 ALPHA', dist: 82, incl: 0.18, speed: 0.032, color: 0x00f3ff, angle: 0, phase: 0 },
        { name: 'DRONE-02 BETA', dist: 88, incl: 1.38, speed: 0.024, color: 0x10b981, angle: 2.1, phase: 1.5 },
        { name: 'DRONE-03 GAMMA', dist: 94, incl: -0.68, speed: 0.028, color: 0xd946ef, angle: 4.2, phase: 3.0 }
      ];

      const shipOriginWorld = (this.ship && this.ship.shipGroup)
        ? this.ship.shipGroup.getWorldPosition(new THREE.Vector3())
        : (this.ship && this.ship.position ? this.ship.position.clone() : this.camera.position.clone());
      const shipOriginLocal = this.destinationPlanetGroup.worldToLocal(shipOriginWorld);

      droneConfigs.forEach(cfg => {
        const droneGroup = new THREE.Group();

        // Chasis aeroespacial
        const bodyGeo = new THREE.BoxGeometry(0.9, 0.5, 1.35);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
        droneGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

        // Paneles solares desplegables
        const wingGeo = new THREE.BoxGeometry(2.8, 0.05, 0.65);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
        const wingMesh = new THREE.Mesh(wingGeo, wingMat);
        droneGroup.add(wingMesh);

        // Tobera iónica con resplandor
        const ionGeo = new THREE.ConeGeometry(0.28, 0.75, 12);
        const ionMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending });
        const ionGlow = new THREE.Mesh(ionGeo, ionMat);
        ionGlow.rotation.x = -Math.PI / 2;
        ionGlow.position.z = 0.85;
        droneGroup.add(ionGlow);

        // Haz láser volumétrico hacia el planeta
        const laserGeo = new THREE.CylinderGeometry(0.1, 3.2, 24, 16, 1, true);
        laserGeo.translate(0, -12, 0);
        laserGeo.rotateX(Math.PI / 2);
        const laserMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
        const laserMesh = new THREE.Mesh(laserGeo, laserMat);
        droneGroup.add(laserMesh);

        droneGroup.position.copy(shipOriginLocal);
        this.destinationPlanetGroup.add(droneGroup);
        this.flightActiveDrones.push({
          group: droneGroup,
          wingMesh,
          launchTime: 0,
          launch: shipOriginLocal.clone(),
          laserMesh,
          ionGlow,
          distance: cfg.dist,
          inclination: cfg.incl,
          speed: cfg.speed,
          angle: cfg.angle,
          phase: cfg.phase
        });
      });
    }

  }

  updateDroneScan(delta) {
      if (!this.isDroneScanning || !this.isFlying || this.isStrandedCinematic) return;
      const previousPct = this.droneScanPct;
      this.droneScanElapsed += delta;
      this.droneScanPct = Math.min(100, Math.floor((this.droneScanElapsed + 1e-9) / 0.18) * 5);
      if (this.droneScanPct === previousPct) return;
      if (this.droneScanPct >= 100) {
        this.droneScanPct = 100;
        this.isDroneScanning = false;

        // Desbloquear planeta en base de datos global
        if (window.onPlanetScannedFromFlight) {
          window.onPlanetScannedFromFlight(this.activePlanetKey);
        }
        window.dispatchEvent(new Event('odyssey-checkpoint'));

        const landBtn = document.getElementById('flight-land-direct-btn');
        const pData = (window.NASA_PLANETARY_DATABASE && window.NASA_PLANETARY_DATABASE[this.activePlanetKey])
          ? window.NASA_PLANETARY_DATABASE[this.activePlanetKey]
          : null;

        if (landBtn && pData && pData.canLand !== false) {
          landBtn.style.display = 'inline-flex';
          landBtn.classList.add('pulse-glow');
        }

        this.showHUDAlert(`✓ ESCANEO COMPLETADO // RECURSOS Y ATMÓSFERA IDENTIFICADOS [Usa el botón Aterrizar para descender]`, 'dock-alert');
        if (window.spaceAudio) window.spaceAudio.playTelemetryRevealSound();
      } else if (Math.floor(this.droneScanPct / 25) > Math.floor(previousPct / 25)) {
        if (window.spaceAudio) window.spaceAudio.playDroneLaserPulseSound();
        this.showHUDAlert(`🛰️ Escaneando corteza y espectro: ${this.droneScanPct}%`, '');
      }
  }

  attemptLanding() {
    const pData = (window.NASA_PLANETARY_DATABASE && window.NASA_PLANETARY_DATABASE[this.activePlanetKey])
      ? window.NASA_PLANETARY_DATABASE[this.activePlanetKey]
      : null;

    if (pData && pData.canLand === false) {
      this.showHUDAlert('🚫 ATENCIÓN: El cuerpo celeste carece de superficie sólida apta para aterrizar', 'danger');
      if (window.spaceAudio) window.spaceAudio.playWarningBeep();
      return;
    }

    this.showHUDAlert('🛬 INICIANDO DESCENSO ATMOSFÉRICO AL CAÑÓN 3D...', 'dock-alert');
    if (this.onStartLanding) {
      this.onStartLanding(this.activePlanetKey, this.hull);
    }
  }

  updateApproachBar() {
    const titleEl = document.getElementById('approach-planet-title');
    const distEl = document.getElementById('approach-dist-val');
    if (titleEl) {
      const pData = (window.NASA_PLANETARY_DATABASE && window.NASA_PLANETARY_DATABASE[this.activePlanetKey]);
      const pName = pData ? pData.name.toUpperCase() : this.activePlanetKey.toUpperCase();
      titleEl.textContent = `APROXIMACIÓN: ${pName}`;
    }
    if (distEl) {
      distEl.textContent = `${Math.round(this.currentDistanceKm).toLocaleString()} km · superficie`;
    }
  }

  onCollision(type, damage) {
    if (damage > 0 && window.adaptiveTutorial) window.adaptiveTutorial.failure('flight');
    this.hull = Math.max(0, this.hull - damage);
    this.ship.setDamage(1.0 - (this.hull / 100));
    this.triggerDamageFlash();
    this.triggerCameraTrauma();

    if (window.spaceAudio) {
      window.spaceAudio.playCollisionSound();
    }

    // Diálogos dinámicos reactivos de la tripulación ante impactos de asteroides
    if (window.odysseyStory && window.odysseyStory.triggerCollisionChatter) {
      window.odysseyStory.triggerCollisionChatter(type, damage, this.hull);
    } else if (window.odysseyStory && window.odysseyStory.triggerDamage) {
      window.odysseyStory.triggerDamage(this.hull);
    }

    const alertText = type === 'debris' ? `¡IMPACTO CON BASURA ESPACIAL! -${damage}% CASCO` : `¡COLISIÓN DIRECTA CON ASTEROIDE! -${damage}% CASCO`;
    this.showHUDAlert(alertText, 'danger');

    // Si el casco es destruido por colisiones, activar de inmediato la nave varada y dañada vagando por el espacio
    if (this.hull > 0 && this.hull <= 25 && !this.criticalSceneShown && !this.isStrandedCinematic && !this.isQTEActive) {
      this.criticalSceneShown=true;window.sofiaTragedy?.play({scene:'crisis'});
    }
    if (this.hull <= 0 && !this.isStrandedCinematic) {
      this.isIdleCinematic = false;
      this.triggerStrandedCinematic(
        2,
        'Destrucción Catastrófica de Casco por Impactos Espaciales',
        'Múltiples colisiones hipervelozes con asteroides y escombros espaciales fracturaron el fuselaje principal y destruyeron los reactores de plasma. La nave Arwing queda varada con daño severo, humo y chispas eléctricas, vagando a la deriva por el espacio profundo.'
      );
    }
  }

  onDockingStationEncountered(name, type) {
    this.isQTEActive = true;
    this.showHUDAlert('ACOPLE DETECTADO // INICIANDO QTE DE REABASTECIMIENTO', 'dock-alert');
    if (window.odysseyStory && window.odysseyStory.triggerDockingProximity) {
      window.odysseyStory.triggerDockingProximity();
    }
    this.qteSystem.start(name);
  }

  onQTEResolved(isSuccess) {
    this.isQTEActive = false;
    if (window.adaptiveTutorial) {
      if (isSuccess) window.adaptiveTutorial.success('docking');
      else window.adaptiveTutorial.failure('docking');
    }

    if (isSuccess) {
      this.fuel = 100;
      this.oxygen = 100;
      this.dockingSuccessCount++;
      this.hull = 100;
      this.ship?.setDamage?.(0);
      window.ExpeditionSystems?.state.resupply();
      window.dispatchEvent(new Event('odyssey-checkpoint'));
      this.showHUDAlert('Acople completo · casco reparado y suministros al 100%', 'dock-alert');
      if (window.odysseyStory && window.odysseyStory.triggerDockingSuccess) {
        window.odysseyStory.triggerDockingSuccess();
      }
    } else {
      this.fuel = Math.max(0, this.fuel - 18);
      this.showHUDAlert('FALLO DE ACOPLE // RETROPROPULSORES ACTIVADOS (-18% COMBUSTIBLE)', 'danger');
      if (window.odysseyStory && window.odysseyStory.triggerDockingFailed) {
        window.odysseyStory.triggerDockingFailed();
      }

      if (this.fuel <= 0 && !this.isStrandedCinematic) {
        this.isIdleCinematic = false;
        this.triggerStrandedCinematic(
          0,
          'Fallo Crítico de Acople // Propelente Agotado',
          'Los propulsores de maniobra consumieron las reservas finales de combustible durante la secuencia fallida de aproximación. Con los reactores apagados, la nave Arwing queda varada y dañada, vagando por el espacio.'
        );
      }
    }
  }

  /* ========================================================================
     SISTEMA DE ESCENAS EN CASO DE FALLAR // MODO CINEMÁTICO (IDÉNTICO A LA IMAGEN)
     ======================================================================== */
  setFailureScene(index, preserveDrift = false) {
    if (index < 0) index = this.failureScenes.length - 1;
    if (index >= this.failureScenes.length) index = 0;
    this.currentFailureSceneIndex = index;
    const sceneData = this.failureScenes[index];
    if (!sceneData) return;

    const isDerelict = !this.isIdleCinematic;

    // Actualizar imagen de fondo fotorrealista (Nebulosa / Estrella) tanto en CSS como en WebGL
    if (this.strandedBackdropLayer) {
      this.strandedBackdropLayer.style.backgroundImage = `url("${sceneData.image}")`;
    }
    if(!this.singleDriftScene){
    if (!this.failureTextureLoader) this.failureTextureLoader = new THREE.TextureLoader();
    this.failureTextureLoader.load(sceneData.image, (tex) => {
      tex.encoding = THREE.sRGBEncoding;
      this.scene.background = tex;
    });
    }

    // Actualizar indicadores y textos descriptivos
    if (this.sceneCounterBadge) {
      this.sceneCounterBadge.textContent = `ESCENA ${index + 1} / ${this.failureScenes.length}`;
    }
    if (this.sceneCounterTitle) {
      this.sceneCounterTitle.textContent = sceneData.title;
    }
    if (this.strandedCausePill) {
      this.strandedCausePill.textContent = this.customFailureCause ? `⚠️ CAUSA DEL FALLO: ${this.customFailureCause}` : `⚠️ CAUSA DEL FALLO: ${sceneData.cause}`;
    }
    if (this.strandedBeaconText) {
      this.strandedBeaconText.textContent = isDerelict ? 'SEÑAL DE BALIZA: MAYDAY S.O.S. // NAVE DAÑADA Y VARADA EN GRAVEDAD CERO' : sceneData.beacon;
    }
    if (this.strandedTitleText) {
      this.strandedTitleText.textContent = isDerelict ? 'NAVE VARADA Y CON DAÑO EN EL ESPACIO PROFUNDO' : sceneData.title.toUpperCase();
    }
    if (this.strandedDescText) {
      this.strandedDescText.textContent = this.customFailureDesc || sceneData.desc;
    }

    // Actualizar píldoras/chips superiores activos
    if (this.failureTabChips) {
      this.failureTabChips.forEach((chip, i) => {
        if (i === index) chip.classList.add('active');
        else chip.classList.remove('active');
      });
    }

    // Posición y orientación de la nave 3D Arwing (con daño y deriva)
    if (this.ship) {
      if (!isDerelict || !preserveDrift) {
        this.ship.position.set(sceneData.shipPos.x, sceneData.shipPos.y, sceneData.shipPos.z);
        this.ship.setStrandedOffline(true, sceneData.shipRot, isDerelict);
      }
      this.ship.setDamage(isDerelict ? 1.0 : sceneData.damageRatio);
    }

    // Luz de borde (Rim Light) brillante alineada con la estrella
    if (!this.strandedRimLight) {
      this.strandedRimLight = new THREE.DirectionalLight(sceneData.rimColor, sceneData.rimIntensity);
      this.strandedRimLight.position.set(-65, 18, -60);
      this.scene.add(this.strandedRimLight);
    } else {
      this.strandedRimLight.color.setHex(sceneData.rimColor);
      this.strandedRimLight.intensity = sceneData.rimIntensity;
      this.strandedRimLight.position.set(-65, 18, -60);
      this.strandedRimLight.visible = true;
    }

    // Si la cámara libre está inactiva, reencuadrar la vista dinámica de la escena
    if (!this.isFreeCamera && sceneData.camPos) {
      this.targetCamPos = sceneData.camPos;
      this.targetCamLook = sceneData.camLook || { x: 0, y: 0, z: 0 };
      const sPos = this.ship ? this.ship.position : { x: 0, y: 0, z: 0 };
      const camX = (isDerelict ? sPos.x : 0) + sceneData.camPos.x;
      const camY = (isDerelict ? sPos.y : 0) + sceneData.camPos.y;
      const camZ = (isDerelict ? sPos.z : 0) + sceneData.camPos.z;
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(isDerelict ? sPos.x : this.targetCamLook.x, isDerelict ? sPos.y : this.targetCamLook.y, isDerelict ? sPos.z : this.targetCamLook.z);
    }
  }

  nextFailureScene() {
    this.setFailureScene(this.currentFailureSceneIndex + 1, !this.isIdleCinematic);
  }

  prevFailureScene() {
    this.setFailureScene(this.currentFailureSceneIndex - 1, !this.isIdleCinematic);
  }

  toggleFreeCamera() {
    this.isFreeCamera = !this.isFreeCamera;

    if (this.isFreeCamera) {
      if (!this.orbitControls && window.THREE && window.THREE.OrbitControls) {
        this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.06;
        this.orbitControls.minDistance = 18;
        this.orbitControls.maxDistance = 140;
        this.orbitControls.enablePan = true;
      }
      if (this.orbitControls) {
        this.orbitControls.enabled = true;
        if (this.ship) {
          this.orbitControls.target.copy(this.ship.position);
        }
      }
      if (this.toggleFreeCamBtn) this.toggleFreeCamBtn.classList.add('active');
      if (this.freeCamText) this.freeCamText.textContent = 'ÓRBITA 360° ACTIVA';
      this.showHUDAlert('🎥 CÁMARA LIBRE ACTIVADA: Arrastra con el ratón para rotar 360° en el vacío', 'dock-alert');
    } else {
      if (this.orbitControls) {
        this.orbitControls.enabled = false;
      }
      if (this.toggleFreeCamBtn) this.toggleFreeCamBtn.classList.remove('active');
      if (this.freeCamText) this.freeCamText.textContent = 'CÁMARA LIBRE 360°';
      const sPos = this.ship ? this.ship.position : { x: 0, y: 0, z: 0 };
      this.camera.position.set(sPos.x, sPos.y, sPos.z + 40);
      this.camera.lookAt(sPos.x, sPos.y, sPos.z);
      this.showHUDAlert('Encuadre cinemático original restaurado', '');
    }
  }

  triggerStrandedCinematic(sceneIndex = 0, failureCause = null, customDesc = null) {
    if (this.isStrandedCinematic && this.customFailureCause && failureCause) return;
    const showFarewell=!!failureCause&&!this.isIdleCinematic;
    this.isStrandedCinematic = true;
    this.isFlying = true;
    this.customFailureCause = failureCause;
    this.customFailureDesc = customDesc;

    // Activar modo cinemático en el contenedor HUD para ocultar retículas y barras de juego
    const hudScreen = document.getElementById('flight-hud-screen');
    if (hudScreen) hudScreen.classList.add('stranded-mode');

    // Desactivar luz solar directa frontal y atenuar ambiente para crear silueta dramática
    if (this.sunLight) this.sunLight.visible = false;
    if (this.ambientLight) this.ambientLight.intensity = 0.12;

    if (this.renderer) this.renderer.setClearColor(0x000000, 0);

    if (window.spaceAudio) {
      window.spaceAudio.stopThrusterSound();
      window.spaceAudio.startStrandedAmbientDrone();
    }

    // Ocultar líneas de aceleración, planeta, origen y obstáculos durante la cinemática
    if (this.warpLinesMesh) this.warpLinesMesh.visible = false;
    if (this.destinationPlanetGroup) this.destinationPlanetGroup.visible = false;
    if (this.earthOriginGroup) this.earthOriginGroup.visible = false;
    for(const gate of this.approachGates||[])gate.visible=false;
    if(this.hohmannTrajectoryCurveMesh)this.hohmannTrajectoryCurveMesh.visible=false;
    if(this.hohmannTrajectoryParticles)this.hohmannTrajectoryParticles.visible=false;
    this.hazardsManager.clear();
    this.stationsManager.clear();

    // Guardar fondo previo
    if (this.scene.background) {
      this.savedSkyboxBackground = this.scene.background;
    }

    // Activar escena seleccionada
    this.singleDriftScene=true;
    this.setFailureScene(0);
    if(this.savedSkyboxBackground)this.scene.background=this.savedSkyboxBackground;
    if(this.strandedGroup)this.strandedGroup.visible=false;
    if(!this.isFreeCamera)this.toggleFreeCamera();
    if(this.ship?.position&&this.camera){this.camera.position.copy(this.ship.position).add(new THREE.Vector3(18,8,42));this.camera.lookAt(this.ship.position);}
    // Keep the damaged ship framed in place; only smoke and debris drift.
    if(this.ship?.driftVelocity)this.ship.driftVelocity.set(0,0,0);
    if(this.ship?.driftRotSpeed)this.ship.driftRotSpeed.set(0,0,0);
    if(this.orbitControls){
      this.orbitControls.autoRotate=false;
      this.orbitControls.target.copy(this.ship.position);
    }
    document.body.classList.add('quiet-derelict');

    // Distinguir entre reposo voluntario/inactividad (idle) y muerte/accidente real (game over)
    const resumeBtn = document.getElementById('resume-idle-flight-btn');
    const retryBtn = document.getElementById('recalculate-mission-btn');
    if (this.isIdleCinematic) {
      if (resumeBtn) resumeBtn.style.display = 'inline-flex';
      if (retryBtn) retryBtn.style.display = 'none';
      if (this.strandedCausePill) {
        this.strandedCausePill.textContent = '⏸️ MODO REPOSO EN GRAVEDAD CERO // Toca [W / A / S / D / Espacio] para reanudar';
      }
      if (this.strandedBeaconText) {
        this.strandedBeaconText.textContent = 'DIRECTOR CINEMÁTICO ACTIVO // NAVE DETENIDA // CAMBIO AUTOMÁTICO DE CÁMARA';
      }
      if (this.strandedTitleText) {
        this.strandedTitleText.textContent = 'NAVE EN REPOSO // OBSERVACIÓN CÓSMICA';
      }
    } else {
      if (resumeBtn) resumeBtn.style.display = 'none';
      if (retryBtn) retryBtn.style.display = 'inline-flex';
      if (this.strandedCausePill) {
        this.strandedCausePill.textContent = `⚠️ CAUSA DEL FALLO: ${failureCause || 'COLAPSO CRÍTICO // IMPACTOS ACUMULADOS EN EL CASCO'}`;
      }
      if (this.strandedBeaconText) {
        this.strandedBeaconText.textContent = 'SEÑAL DE BALIZA: MAYDAY S.O.S. // NAVE VARADA Y CON DAÑO EN GRAVEDAD CERO';
      }
      if (this.strandedTitleText) {
        this.strandedTitleText.textContent = 'NAVE VARADA Y CON DAÑO EN EL ESPACIO PROFUNDO';
      }
      if (customDesc && this.strandedDescText) {
        this.strandedDescText.textContent = customDesc;
      }
      if (window.odysseyStory && window.odysseyStory.triggerStrandedGameOver) {
        window.odysseyStory.triggerStrandedGameOver(failureCause);
      }
    }

    // Mostrar capa de fondo fotorrealista y overlay cinemático con letras de cine
    if (this.strandedBackdropLayer) {
      this.strandedBackdropLayer.classList.add('active');
    }
    if (this.strandedOverlay) {
      if (this.strandedDistDisplay) {
        this.strandedDistDisplay.textContent = `${Math.round(this.currentDistanceKm).toLocaleString()} km · superficie`;
      }
      this.strandedOverlay.classList.add('active');
    }
    // The damaged ship remains visible instead of a farewell dialog.
  }

  exitStrandedCinematic() {
    document.body.classList.remove('quiet-derelict');
    this.isStrandedCinematic = false;
    this.isIdleCinematic = false;
    this.autoSceneTimer = 0;

    const hudScreen = document.getElementById('flight-hud-screen');
    if (hudScreen) hudScreen.classList.remove('stranded-mode');

    // Restaurar iluminación y estado operativo de la nave
    if (this.sunLight) this.sunLight.visible = true;
    if (this.ambientLight) this.ambientLight.intensity = 0.45;
    if (this.strandedRimLight) this.strandedRimLight.visible = false;

    if (this.ship) {
      this.ship.setStrandedOffline(false);
    }

    if (this.warpLinesMesh) this.warpLinesMesh.visible = true;
    if (this.destinationPlanetGroup) this.destinationPlanetGroup.visible = true;
    if (this.earthOriginGroup && this.progress < 25) this.earthOriginGroup.visible = true;

    // Restaurar encuadre de cámara de vuelo
    if (this.ship) {
      this.camera.position.set(this.ship.position.x * 0.42, 5.5 + this.ship.position.y * 0.35, 20);
      this.camera.lookAt(0, 0, -50);
    }

    if (this.orbitControls) {
      this.orbitControls.enabled = false;
      this.isFreeCamera = false;
      if (this.toggleFreeCamBtn) this.toggleFreeCamBtn.classList.remove('active');
      if (this.freeCamText) this.freeCamText.textContent = 'CÁMARA LIBRE 360°';
    }

    if (this.savedSkyboxBackground) {
      this.scene.background = this.savedSkyboxBackground;
    }

    if (window.spaceAudio) {
      window.spaceAudio.stopStrandedAmbientDrone();
    }

    if (this.strandedBackdropLayer) {
      this.strandedBackdropLayer.classList.remove('active');
    }

    if (this.strandedOverlay) {
      this.strandedOverlay.classList.remove('active');
    }
  }

  exitIdleCinematic() {
    this.isIdleCinematic = false;
    this.idleTime = 0;
    this.autoSceneTimer = 0;
    this.exitStrandedCinematic();
    this.isFlying = true;

    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.playLaunchWhoosh();
      window.spaceAudio.startThrusterSound();
    }
    this.showHUDAlert('⚡ PROPULSIÓN RESTAURADA // RETOMANDO VUELO', 'dock-alert');
  }

  checkGameConditions() {
    if (this.progress >= 100 && this.hull > 0 && this.fuel > 0 && this.oxygen > 0 && !this.isQTEActive) {
      this.isFlying = false;
      if (window.spaceAudio) window.spaceAudio.stopThrusterSound();

      const pData = NASA_PLANETARY_DATABASE[this.activePlanetKey];
      // Si las condiciones son óptimas y el planeta permite aterrizaje
      if (pData && pData.canLand !== false && this.onStartLanding) {
        this.onStartLanding(this.activePlanetKey, Math.round(this.hull));
        return;
      }

      if (this.onMissionComplete) {
        this.onMissionComplete({
          distance: this.mathModel.orbitalDistanceKm,
          dockings: this.dockingSuccessCount,
          hull: Math.round(this.hull),
          planetName: (pData && pData.name) || NASA_PLANETARY_DATABASE[this.activePlanetKey].name
        });
      }
      return;
    }

    if (this.hull <= 0 && !this.isStrandedCinematic) {
      this.isIdleCinematic = false;
      this.triggerStrandedCinematic(
        2,
        'Fallo Estructural Irreversible // Casco Destruido',
        'El blindaje de aleación de titanio colapsó ante el impacto continuado de micrometeoritos y escombros espaciales. La nave Arwing queda inoperativa y varada, con eyección continua de plasma y humo, vagando por el espacio.'
      );
    }
  }

  triggerDamageFlash() {
    if (!this.damageFlashEl) return;
    this.damageFlashEl.classList.add('active');
    setTimeout(() => {
      this.damageFlashEl.classList.remove('active');
    }, 180);
  }

  triggerCameraTrauma() {
    if (!this.container) return;
    this.container.classList.remove('screen-trauma');
    void this.container.offsetWidth; // Force reflow
    this.container.classList.add('screen-trauma');
    setTimeout(() => {
      this.container.classList.remove('screen-trauma');
    }, 380);
  }

  showHUDAlert(text, type = '') {
    if (!this.alertContainer) return;
    const alertDiv = document.createElement('div');
    alertDiv.className = `hud-alert ${type}`;
    alertDiv.textContent = text;
    this.alertContainer.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.style.opacity = '0';
      alertDiv.style.transition = 'opacity 0.4s ease';
      setTimeout(() => alertDiv.remove(), 400);
    }, 1800);
  }

  updateHUD() {
    if (this.hullBar) this.hullBar.style.width = `${Math.max(0, this.hull)}%`;
    if (this.hullValue) this.hullValue.textContent = `${Math.round(this.hull)}%`;

    if (this.oxygenBar) this.oxygenBar.style.width = `${Math.max(0, this.oxygen)}%`;
    if (this.oxygenValue) this.oxygenValue.textContent = `${Math.round(this.oxygen)}%`;

    if (this.fuelBar) this.fuelBar.style.width = `${Math.max(0, this.fuel)}%`;
    if (this.fuelValue) this.fuelValue.textContent = `${Math.round(this.fuel)}%`;

    if (this.navDistanceText) {
      this.navDistanceText.textContent = `${Math.round(this.currentDistanceKm).toLocaleString()} km · superficie`;
    }
    if (this.approachFill) {
      this.approachFill.style.width = `${this.progress}%`;
    }
    if (this.approachShipMarker) {
      this.approachShipMarker.style.left = `${this.progress}%`;
    }

    // Telemetría Matemática Orbital en Vivo
    const liveDistEl = document.getElementById('live-math-dist');
    if (liveDistEl) liveDistEl.textContent = `${Math.round(this.currentDistanceKm).toLocaleString()} km · superficie`;

    const liveDeltavEl = document.getElementById('live-math-deltav');
    if (liveDeltavEl) {
      const dv = (3.5 + Math.log10(Math.max(1000, this.currentDistanceKm / 10000)) * 0.85).toFixed(1);
      liveDeltavEl.textContent = `Δv = ${dv} km/s`;
    }

    const liveFuelRateEl = document.getElementById('live-math-fuel-rate');
    if (liveFuelRateEl) liveFuelRateEl.textContent = `-${this.mathModel.fuelBurnRate.toFixed(2)}%/s (Combustible: ${Math.round(this.fuel)}%)`;

    const liveO2RateEl = document.getElementById('live-math-o2-rate');
    if (liveO2RateEl) liveO2RateEl.textContent = `-${this.mathModel.oxygenBurnRate.toFixed(2)}%/s (Oxígeno: ${Math.round(this.oxygen)}%)`;

    const liveDockingEl = document.getElementById('live-math-docking');
    if (liveDockingEl) {
      const minDock = Math.max(0, this.mathModel.minDockingsRequired - this.dockingSuccessCount);
      liveDockingEl.textContent = minDock > 0 ? `FALTAN ${minDock} ACOPLE(S)` : `REQUISITO CUMPLIDO (${this.dockingSuccessCount})`;
      liveDockingEl.className = minDock > 0 ? 'text-danger' : 'text-success';
    }

    // Velocímetro Relativista y Estado de Impulso en HUD
    const speedValEl = document.getElementById('hud-flight-speed');
    if (speedValEl) {
      speedValEl.textContent = `${Math.round(this.currentSpeedKm).toLocaleString()} km/s`;
    }
    const boostTagEl = document.getElementById('hud-boost-tag');
    if (boostTagEl) {
      if (this.currentSpeedKm > 1400) {
        boostTagEl.className = 'hud-boost-badge active';
        boostTagEl.textContent = '⚡ TURBO BOOST ACTIVO';
      } else {
        boostTagEl.className = 'hud-boost-badge';
        boostTagEl.textContent = 'CRUCERO';
      }
    }

    const navSpdEl = document.getElementById('nav-speed');
    if (navSpdEl) navSpdEl.textContent = `${Math.round(this.currentSpeedKm || 1000).toLocaleString()} km/s`;
    const navSweetEl = document.getElementById('nav-sweet');
    if (navSweetEl) {
      const isSweet = this.boostRatio >= 0.9 && this.boostRatio <= 1.25;
      navSweetEl.textContent = isSweet ? 'MANIOBRA ÓPTIMA' : 'VELOCIDAD';
      navSweetEl.classList?.toggle?.('active', isSweet);
    }
    const navBoostEl = document.getElementById('nav-boost');
    if (navBoostEl) navBoostEl.value = this.isBoosting ? 100 : 60;
    const speedCursor = document.getElementById('sf-speed-cursor');
    if (speedCursor?.style) {
      const pct = Math.min(100, Math.max(0, ((this.currentSpeedKm - 1000) / (3600 - 1000)) * 100));
      speedCursor.style.left = `calc(${pct}% - 1.5px)`;
    }
  }

  stop() {
    this.arrivalShot=null;this.travelShot=null;
    this.qteSystem.cancel();
    this.isDroneScanning = false;
    this.droneScanElapsed = 0;
    this.isFlying = false;
    this.exitStrandedCinematic();
    if (this.strandedGroup) this.strandedGroup.visible = false;
    if (window.spaceAudio) {
      window.spaceAudio.stopThrusterSound();
      if (window.spaceAudio.setThrusterBoost) {
        window.spaceAudio.setThrusterBoost(false, 1.0);
      }
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

window.FlightGameEngine = FlightGameEngine;
