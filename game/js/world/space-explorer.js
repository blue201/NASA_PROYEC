/* ==========================================================================
   NASA ODYSSEY // SPACE EXPLORATION ENGINE (NAVEGACIÓN CÓSMICA LIBRE 3D)
   Vastedad del Universo: Agujeros Negros, Galaxias, Nebulosas y Guía IA en Vivo
   ========================================================================== */

class SpaceExplorationEngine {
  constructor(containerId, onExitCallback, sharedRenderer = null) {
    this.container = document.getElementById(containerId);
    this.onExit = onExitCallback;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Nave del explorador
    this.ship = null;
    this.shipGroup = null;
    this.shipSpeed = 60.0; // km/s base crucero en el cosmos expandido
    this.maxSpeed = 260.0; // km/s impulso máximo
    this.minSpeed = 0.0;
    this.isWarpActive = false;
    this.warpLinesMesh = null;

    // Controles y Teclado
    this.keys = {};
    this.mouse = { x: 0, y: 0, isDown: false, prevX: 0, prevY: 0 };
    this.cameraPitch = 0;
    this.cameraYaw = 0;
    this.cameraModes = ['chase', 'top', 'bottom', 'cockpit', 'far'];
    this.currentCameraMode = 'cockpit';

    // Lista de Monumentos Cósmicos (Landmarks)
    this.landmarks = [];
    this.colliders = [];
    this.verticalSpeed = 0;
    this.currentLandmark = null;
    this.activeVoiceUtterance = null;
    this.isVoiceMuted = false;

    // Estado de la Simulación
    this.isActive = false;
    this.clock = new THREE.Clock();

    // Referencias a Elementos UI del HUD de Exploración
    this.ui = {
      screen: document.getElementById('space-exploration-screen'),
      exitBtn: document.getElementById('exit-exploration-btn'),
      voiceToggleBtn: document.getElementById('toggle-exploration-voice-btn'),
      voiceStatusText: document.getElementById('exploration-voice-status'),
      skyboxToggleBtn: document.getElementById('toggle-skybox-btn'),
      skyboxNameText: document.getElementById('exploration-skybox-name'),
      guidePanel: document.getElementById('exploration-guide-panel'),
      guideCloseBtn: document.getElementById('close-guide-panel-btn'),
      guideIcon: document.getElementById('guide-target-icon'),
      guideTitle: document.getElementById('guide-target-title'),
      guideClass: document.getElementById('guide-target-class'),
      guideDist: document.getElementById('guide-target-dist'),
      guideExplanation: document.getElementById('guide-explanation-text'),
      guideRelativityStrip: document.getElementById('guide-relativity-strip'),
      readAloudBtn: document.getElementById('guide-read-aloud-btn'),
      waypointsList: document.getElementById('exploration-waypoints-list'),
      speedValue: document.getElementById('hud-explorer-speed'),
      warpIndicator: document.getElementById('hud-explorer-warp-tag')
    };

    this.init(sharedRenderer);
  }

  init(sharedRenderer = null) {
    this.scene = new THREE.Scene();

    // Frustum extendido a 75,000 unidades para abarcar sectores cósmicos masivos
    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.5, 75000);
    this.camera.position.set(0, 9, 44);

    if (sharedRenderer) {
      this.renderer = sharedRenderer;
    } else {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      if (this.container) {
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
      }
    }

    // Luces
    window.Fluidity?.register(this.renderer);
    const ambientLight = new THREE.AmbientLight(0x0a192f, 0.45);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(200, 300, 500);
    this.scene.add(dirLight);

    // Fondo Cósmico Panorámico Fotorrealista 360° del Universo (Hubble, JWST, Vía Láctea)
    this.buildPhotorealisticUniverseSkybox();

    // Manto estelar tridimensional (Vastedad Cósmica)
    this.buildInfiniteStarfield();
    // Distant dust volumes add depth and parallax while leaving the flight corridor clear.
    if(window.WorldVisuals?.createNebula){
      this.explorationNebulae=new THREE.Group();
      this.explorationNebulae.name='Nebulosas cromáticas';
      const nebulaeSpecs=[
        [-48000, 14000,-52000, 7200, [0x00d2ff, 0x9b5cff, 0x44d6c1]], // Nebulosa Velo de Orión (Azul cian y púrpura)
        [ 52000,-16000,-55000, 7800, [0x38bdf8, 0xf43f5e, 0xa855f7]], // Nebulosa Tarántula (Magenta y cobalto)
        [-58000, 19000, 42000, 7500, [0x34d399, 0x60a5fa, 0x06b6d4]], // Nebulosa del Águila (Esmeralda y cerúleo)
        [ 55000, 18000, 48000, 7900, [0xa855f7, 0xff007f, 0xfbbf24]], // Nebulosa Roseta (Ámbar oro y fucsia)
        [-45000,-22000,-42000, 6800, [0xec4899, 0xc084fc, 0x38bdf8]], // Nebulosa de Carina (Rosa cósmico y violeta)
        [ 42000, 24000,-48000, 7400, [0x22d3ee, 0x818cf8, 0x6366f1]], // Velo de Encélado (Cian eléctrico y zafiro)
        [-51000, 16000, 54000, 6900, [0xf97316, 0xfbbf24, 0xef4444]], // Nebulosa Cabeza de Caballo (Fuego y bermellón)
        [ 48000,-21000, 38000, 7200, [0x10b981, 0x06b6d4, 0xa855f7]]  // Nebulosa Ojo de Gato (Verde ionizado y lavanda)
      ];
      nebulaeSpecs.forEach(([x,y,z,r,palette],i)=>{
        const cloud=window.WorldVisuals.createNebula(r,palette);
        cloud.position.set(x,y,z);
        cloud.rotation.set(.35*i,.7*i,.4);
        cloud.traverse(o=>{if(o.isPoints){o.material.opacity=.52;o.material.blending=THREE.AdditiveBlending;}});
        this.explorationNebulae.add(cloud);
      });

      // Galaxia Activa Centaurus A (NGC 5128) en el espacio profundo con chorros relativistas
      if (window.nasaApi?.createCentaurusAGalaxyTexture) {
        const cenATex = window.nasaApi.createCentaurusAGalaxyTexture();
        const cenAMat = new THREE.MeshBasicMaterial({
          map: cenATex,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const cenAPlane = new THREE.Mesh(new THREE.PlaneGeometry(18000, 18000), cenAMat);
        cenAPlane.position.set(-38000, 14000, -36000);
        cenAPlane.lookAt(0, 0, 0);
        this.explorationNebulae.add(cenAPlane);
        this.cenAGalaxy = cenAPlane;
      }
      this.scene.add(this.explorationNebulae);
    }

    // Líneas de velocidad Warp (Hiper-salto Relativista)
    // Speed is expressed through the ship and camera, without streaks.

    // Construcción de la Nave Arwing de Exploración
    this.buildExplorationShip();

    // Construcción de los 8 Monumentos del Espacio Profundo
    this.buildCosmicLandmarks();

    // Configurar Eventos de Entrada
    this.setupEventListeners();

    // Construir Lista de Waypoints en la UI
    this.renderWaypointsUI();
  }

  /* ========================================================================
     CÚPULA CELESTE FOTORREALISTA 360° DEL UNIVERSO (HUBBLE, JWST & VÍA LÁCTEA)
     ======================================================================== */
  buildPhotorealisticUniverseSkybox() {
    const curated = window.nasaApi?.getCuratedNasaSkyboxes?.() || [
      {id:'milky_way_photo',name:'Vía Láctea · panorama ESO',url:'assets/milky-way-eso.jpg',rotation:0},
      {id:'milky_way_reverse',name:'Vía Láctea · vista opuesta',url:'assets/milky-way-eso.jpg',rotation:Math.PI},
      {id:'milky_way_quarter',name:'Vía Láctea · vista lateral',url:'assets/milky-way-eso.jpg',rotation:Math.PI / 2}
    ];
    this.skyboxList = [...curated];

    // Integración en vivo con la API APOD de la NASA (Astronomy Picture of the Day)
    window.nasaApi?.fetchLiveApod?.().then(live => {
      if (live && live.url && !this.skyboxList.some(s => s.id === live.id)) {
        this.skyboxList.splice(1, 0, {
          id: live.id,
          name: live.name || ('🔭 APOD · ' + live.title),
          url: live.hdurl || live.url,
          localFallback: 'assets/milky-way-eso.jpg',
          rotation: 0,
          explanation: live.explanation,
          date: live.date
        });
      }
    }).catch(() => {});

    this.currentSkyboxIndex = 0;
    this.textureLoader = new THREE.TextureLoader();

    // Cúpula celeste esférica masiva (55,000 unidades)
    const skyGeo = new THREE.SphereGeometry(55000, 64, 48);
    this.skyMat = new THREE.MeshBasicMaterial({
      color: 0xa1b7d8,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.skyDome = new THREE.Mesh(skyGeo, this.skyMat);
    this.scene.add(this.skyDome);

    // Cargar inmediatamente el primer fondo fotorrealista (Hubble Deep Field)
    this.setPhotorealisticSkybox(0);
  }

  setPhotorealisticSkybox(index) {
    if (index < 0 || index >= this.skyboxList.length) return;
    this.currentSkyboxIndex = index;
    const skyData = this.skyboxList[index];

    // Reuse cached textures; switching backgrounds cannot apply stale load callbacks.
    this.skyTextures ||= new Map();
    if (!this.skyTextures.has(skyData.url)) {
      const tex = new THREE.TextureLoader().load(
        skyData.url,
        (loadedTex) => {
          loadedTex.encoding = THREE.sRGBEncoding;
          loadedTex.needsUpdate = true;
        },
        undefined,
        () => {
          // Fallback a fotografía local o nebulosa procedural si la red de la NASA está desconectada
          const fallback = skyData.localFallback || 'assets/milky-way-eso.jpg';
          if (!this.skyTextures.has(fallback)) {
            this.skyTextures.set(fallback, new THREE.TextureLoader().load(fallback));
          }
          if (this.currentSkyboxIndex === index && this.skyDome) {
            this.skyMat.map = this.skyTextures.get(fallback);
            this.skyMat.needsUpdate = true;
          }
        }
      );
      this.skyTextures.set(skyData.url, tex);
    }
    this.skyMat.map = this.skyTextures.get(skyData.url);
    this.skyDome.rotation.y = skyData.rotation || 0;
    if (this.skyMat.map) this.skyMat.map.encoding = THREE.sRGBEncoding;
    this.skyMat.toneMapped = false;
    this.skyMat.needsUpdate = true;

    if (this.ui.skyboxNameText) {
      this.ui.skyboxNameText.textContent = skyData.name;
    }

    if (skyData.explanation && this.ui.guideContent && this.ui.guidePanel && !this.ui.guidePanel.hidden) {
      this.ui.guideContent.innerHTML = `
        <div class="skybox-guide-card">
          <h4>${skyData.name}</h4>
          <p class="text-sm text-cyan">${skyData.mission || 'NASA APOD'} · ${skyData.date || 'Archivo Oficial'}</p>
          <p class="text-xs text-muted" style="margin-top:6px;">${skyData.explanation}</p>
        </div>
      `;
    }
  }

  nextPhotorealisticSkybox() {
    const nextIdx = (this.currentSkyboxIndex + 1) % this.skyboxList.length;
    this.setPhotorealisticSkybox(nextIdx);
    if (window.spaceAudio) window.spaceAudio.playWarningBeep();
  }

  /* ========================================================================
     CAMPO ESTELAR TRIDIMENSIONAL MASIVO EXPANDIDO (18,000 ESTRELLAS)
     ======================================================================== */
  buildInfiniteStarfield() {
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 42000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const colorRoll = Math.random();
      if (colorRoll > 0.82) {
        colors[i * 3] = 0.32; colors[i * 3 + 1] = 0.72; colors[i * 3 + 2] = 1.0; // Estrellas azules masivas O/B
      } else if (colorRoll > 0.65) {
        colors[i * 3] = 0.99; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0; // Estrellas blancas puras A/F
      } else if (colorRoll > 0.48) {
        colors[i * 3] = 0.86; colors[i * 3 + 1] = 0.94; colors[i * 3 + 2] = 1.0; // Enanas blancas ultracompactas
      } else if (colorRoll > 0.28) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 0.48; // Estrellas amarillas/doradas G
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.44; colors[i * 3 + 2] = 0.35; // Gigantes rojas M
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.9,
      sizeAttenuation: false,
      depthWrite: false,
      map: window.CinematicVisuals?.stellarMap?.() || null,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.starfieldMesh = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfieldMesh);
  }

  /* ========================================================================
     LÍNEAS DE VELOCIDAD RELATIVISTA WARP (PROFUNDIDAD AUMENTADA)
     ======================================================================== */
  buildWarpSpeedLines() {
    const warpCount = 800;
    const warpGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(warpCount * 6); // 2 vertices por linea

    for (let i = 0; i < warpCount; i++) {
      const x = (Math.random() - 0.5) * 260;
      const y = (Math.random() - 0.5) * 180;
      const z = -Math.random() * 800;

      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z - 65;
    }

    warpGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const warpMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });

    this.warpLinesMesh = new THREE.LineSegments(warpGeo, warpMat);
    this.scene.add(this.warpLinesMesh);
  }

  /* ========================================================================
     NAVE DE EXPLORACIÓN ESPACIAL (MODELO PROCEDURAL ARWING DE MISIONES)
     ======================================================================== */
  buildExplorationShip() {
    this.shipGroup = new THREE.Group();
    this.shipGroup.rotation.order = 'YXZ';

    if (window.ArwingShip) {
      // Instanciar el mismo modelo de nave Arwing de las misiones
      // Rotado 180° en Y para que la proa apunte en la dirección de avance (-Z) y toberas hacia la cámara (+Z)
      this.ship = new window.ArwingShip({ rotationY: Math.PI, scale: 1.0 });
      this.shipGroup.add(this.ship.mesh);
    } else {
      // Malla alternativa aerodinámica de respaldo
      const bodyGeo = new THREE.ConeGeometry(1.6, 6.5, 6);
      bodyGeo.rotateX(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.8 });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      this.shipGroup.add(bodyMesh);
    }

    // Luces de navegación y halo estelar de la nave
    const navLight = new THREE.PointLight(0x00f3ff, 2.0, 45);
    navLight.position.set(0, 1.2, -1.0);
    this.shipGroup.add(navLight);

    const engineLight = new THREE.PointLight(0x00f3ff, 2.4, 40);
    engineLight.position.set(0, 0, 4.5);
    this.shipGroup.add(engineLight);
    this.engineLight = engineLight;

    this.shipGroup.position.set(0, 0, 0);
    this.scene.add(this.shipGroup);
  }

  /* ========================================================================
     CONSTRUCCIÓN DE LOS 8 MONUMENTOS CÓSMICOS EN EL ESPACIO PROFUNDO
     ======================================================================== */
  buildCosmicLandmarks() {
    this.landmarks = [
      // 1. SAGITARIO A* (Superagujero Negro Supermasivo del Centro Galáctico)
      {
        id: 'sagittarius_a',
        name: 'Sagitario A* (Superagujero Negro Central)',
        shortName: 'Sagitario A*',
        category: 'Sector 01 // Centro Galáctico Supermasivo',
        icon: '🕳️',
        position: new THREE.Vector3(0, 0, -4500),
        observationOffset: new THREE.Vector3(0, 140, 620),
        mass: '4.15 Millones de Masas Solares',
        distanceDisplay: '26,670 Años Luz de la Tierra',
        temperature: '10,000,000 K en el Disco // 0 Kelvin en el Horizonte',
        radiation: 'Radiación Sincrotrón & Rayos X NuSTAR // Extrema Letal',
        timeDilation: 'Dilatación Gravitacional Extrema (Δt → ∞ en el Horizonte)',
        explanation: 'Estás contemplando el colosal ancla gravitacional de toda la Vía Láctea. La esfera negra central es el horizonte de sucesos de Schwarzschild: la frontera definitiva donde ni siquiera la luz puede escapar. El disco de acreción incandescente gira a más de 90,000 km/s (0.3c); el lado que viaja hacia ti se ve más brillante y azul debido al efecto Doppler relativista. La luz doblada por encima de la sombra es un arco de lente gravitacional predicho por la Relatividad General de Albert Einstein.',
        buildMesh: () => this.createSagittariusMesh()
      },

      // 2. CYGNUS X-1 (Microcuásar Relativista & Supergigante Azul)
      {
        id: 'cygnus_x1',
        name: 'Cygnus X-1 & HDE 226868 (Microcuásar Binario)',
        shortName: 'Cygnus X-1',
        category: 'Sector 02 // Microcuásar Binario de Rayos X',
        icon: '⚡',
        position: new THREE.Vector3(4200, 700, -2800),
        observationOffset: new THREE.Vector3(0, 160, 720),
        mass: '21.2 Masas Solares (Hoyo) + 40 Masas Solares (Supergigante)',
        distanceDisplay: '7,300 Años Luz',
        temperature: 'Disco a 12,000,000 K // Estrella a 31,000 K',
        radiation: 'Fuente de Rayos X Duros más brillante de la galaxia',
        timeDilation: 'Marea Relativista Extrema a través del Lóbulo de Roche',
        explanation: 'El primer agujero negro de la historia confirmado por la astrofísica. Cygnus X-1 conforma un sistema binario letal con la supergigante azul HDE 226868. Su colosal campo gravitacional desgarra la atmósfera de la estrella y succiona un río continuo de plasma caliente que espirala hacia el agujero negro, expulsando chorros bipolares de partículas subatómicas disparadas casi a la velocidad de la luz (0.99c).',
        buildMesh: () => this.createCygnusMesh()
      },

      // 3. GARGANTÚA (Agujero Negro Relativista de Giro Extremo de Kerr)
      {
        id: 'gargantua',
        name: 'Gargantúa (Agujero Negro de Kerr con Lente Doble)',
        shortName: 'Gargantúa',
        category: 'Sector 03 // Singularidad de Kerr Relativista',
        icon: '🌑',
        position: new THREE.Vector3(-4600, -400, -3200),
        observationOffset: new THREE.Vector3(0, 130, 560),
        mass: '100 Millones de Masas Solares',
        distanceDisplay: 'Sector Interestelar Profundo',
        temperature: 'Disco Dorado a 6,500 K',
        radiation: 'Radiación Gravitacional Relativista Filtrada',
        timeDilation: '1 hora en órbita cercana = 7 años terrestres',
        explanation: 'Una singularidad de rotación extrema de Kerr (con espín a = 0.999). Su altísima velocidad de giro arrastra el propio espacio-tiempo a su alrededor (Efecto Lense-Thirring). La doble curvatura que ves por arriba y por abajo del horizonte no son dos discos separados, sino el mismo disco ecuatorial cuya luz ha sido curvada hacia tu mirada por la inmensa gravedad de la esfera de fotones.',
        buildMesh: () => this.createGargantuaMesh()
      },

      // 4. GALAXIA DE ANDRÓMEDA (Messier 31)
      {
        id: 'andromeda',
        name: 'Galaxia de Andrómeda (Messier 31)',
        shortName: 'Andrómeda (M31)',
        category: 'Sector 04 // Galaxia Espiral Gigante del Grupo Local',
        icon: '🌀',
        position: new THREE.Vector3(5600, 1800, 2400),
        observationOffset: new THREE.Vector3(0, 260, 980),
        mass: '1.5 Billones de Masas Solares (1 Trillón de Estrellas)',
        distanceDisplay: '2.537 Millones de Años Luz',
        temperature: 'Cúmulos Estelares O/B en Brazos Espirales',
        radiation: 'Brillo Integrado de 1 Billón de Estrellas',
        timeDilation: 'Deriva Intergaláctica a 110 km/s hacia la Vía Láctea',
        explanation: 'La galaxia espiral más masiva de nuestro Grupo Local. Contiene aproximadamente un billón de estrellas, el doble que nuestra Vía Láctea. Se aproxima hacia nosotros a 400,000 km/h y colisionará con nuestra galaxia en 4,500 millones de años, fusionándose pacíficamente en una supergalaxia bautizada por los astrónomos como "Lactómeda".',
        buildMesh: () => this.createGalaxyMesh(0x38bdf8, 0x60a5fa, 0xfef08a, 750)
      },

      // 5. GALAXIA DEL SOMBRERO (Messier 104)
      {
        id: 'sombrero',
        name: 'Galaxia del Sombrero (Messier 104)',
        shortName: 'Galaxia Sombrero',
        category: 'Sector 05 // Galaxia Lenticular Gigante en Virgo',
        icon: '🛸',
        position: new THREE.Vector3(-5400, 2100, 2000),
        observationOffset: new THREE.Vector3(0, 220, 920),
        mass: '800,000 Millones de Masas Solares',
        distanceDisplay: '29.3 Millones de Años Luz (Constelación Virgo)',
        temperature: 'Anillo de Hidrógeno Frío & Polvo de Absorción',
        radiation: 'Agujero Negro Central Supermasivo de 1,000M Masas Solares',
        timeDilation: 'Velocidad de recesión de 1,024 km/s',
        explanation: 'Famosa por su deslumbrante bulbo central blanco-dorado y su oscuro cinturón ecuatorial simétrico de polvo interestelar. Su núcleo alberga uno de los agujeros negros supermasivos más masivos conocidos en galaxias cercanas (mil millones de masas solares) y una población de más de 2,000 cúmulos globulares antiguos.',
        buildMesh: () => this.createSombreroMesh()
      },

      // 6. PILARES DE LA CREACIÓN (Nebulosa M16)
      {
        id: 'pillars',
        name: 'Pilares de la Creación (Nebulosa del Águila M16)',
        shortName: 'Pilares Creación',
        category: 'Sector 06 // Cuna Estelar Molecular Masiva',
        icon: '✨',
        position: new THREE.Vector3(1600, 3400, -4800),
        observationOffset: new THREE.Vector3(0, 180, 800),
        mass: 'Columna de 200 Masas Solares de Gas Interestelar',
        distanceDisplay: '6,500 Años Luz (Brazo de Sagitario)',
        temperature: '-260°C (13 Kelvin) // Gas Crionizado',
        radiation: 'Fotones Ultravioleta O/B evaporando las columnas',
        timeDilation: 'Colapso Gravitacional Gravitatorio Lento',
        explanation: 'Torres interestelares de gas hidrógeno y polvo molecular de 5 años luz de altura (40 billones de kilómetros). En sus extremos, la radiación ultravioleta de estrellas jóvenes masivas esculpe la nube revelando glóbulos densos llamados EGGs (Glóbulos Gaseosos en Evaporación), en cuyo interior se están gestando nuevos sistemas planetarios y protoestrellas.',
        buildMesh: () => this.createPillarsMesh()
      },

      // 7. NEBULOSA DEL ANILLO / OJO CÓSMICO (Messier 57)
      {
        id: 'ring_nebula',
        name: 'Nebulosa del Ojo Cósmico / Anillo (M57)',
        shortName: 'Ojo Cósmico (M57)',
        category: 'Sector 07 // Nebulosa Planetaria Remanente en Lira',
        icon: '👁️',
        position: new THREE.Vector3(-2800, 2900, -2400),
        observationOffset: new THREE.Vector3(0, 150, 650),
        mass: '1.2 Masas Solares de Gas Ionizado Expandido',
        distanceDisplay: '2,570 Años Luz (Constelación Lira)',
        temperature: 'Enana Blanca Central a 120,000 K',
        radiation: 'Emisión Verde Esmeralda O-III (500.7 nm) & Roja N-II',
        timeDilation: 'Expansión Radial del Cascarón a 20 km/s',
        explanation: 'El destino cósmico que le aguarda a nuestro propio Sol dentro de 5,000 millones de años. Una estrella moribunda expulsó sus capas exteriores creando una burbuja toroidal brillante de plasma ionizado. En el centro brilla la enana blanca remanente, un núcleo ultradenso tan caliente que su radiación ultravioleta hace resplandecer el gas como un ojo cósmico en la inmensidad.',
        buildMesh: () => this.createRingNebulaMesh()
      },

      // 8. SISTEMA SOLAR LOCAL (CUNA DE LA HUMANIDAD)
      {
        id: 'solar_system',
        name: 'Sistema Solar Local (El Sol & Planetas)',
        shortName: 'Sistema Solar',
        category: 'Sector 08 // Sistema Planetario Monocéntrico',
        icon: '☀️',
        position: new THREE.Vector3(0, 0, 3600),
        observationOffset: new THREE.Vector3(0, 500, 2900),
        mass: '1 Masa Solar (99.86% de la masa total del sistema)',
        distanceDisplay: 'Punto de Partida Terrestre // 0 AU',
        temperature: 'Corona Solar a 1,500,000 K // Núcleo a 15,000,000 K',
        radiation: 'Viento Solar Heliosférico & Espectro G2V',
        timeDilation: 'Marco Inercial de Referencia Terrestre',
        explanation: 'El rincón del universo donde florece la vida. Una estrella enana amarilla de 4,600 millones de años rodeada por los cuatro mundos rocosos interiores, el cinturón de asteroides, los cuatro gigantes gaseosos exteriores y el cinturón de Kuiper.',
        buildMesh: () => this.createSolarSystemMesh()
      }
    ];

    // Instanciar y añadir cada monumento a la escena 3D
    this.landmarks.forEach(lm => {
      const meshGroup = lm.buildMesh();
      meshGroup.position.copy(lm.position);
      this.scene.add(meshGroup);
      lm.meshGroup = meshGroup;
      meshGroup.updateMatrixWorld(true);
      meshGroup.traverse(mesh => {
        if(mesh.userData.asteroidRadius){this.colliders.push({mesh,radius:mesh.userData.asteroidRadius,name:'asteroide',asteroid:true});return;}
        const radius = mesh.geometry?.parameters?.radius;
        if (mesh.geometry?.type !== 'SphereGeometry' || !radius || (radius < 3 && !mesh.userData.planetKey) || mesh.material?.transparent) return;
        this.colliders.push({mesh,radius,name:mesh.userData.planetName || lm.shortName,planetKey:mesh.userData.planetKey});
      });
    });
  }

  /* ========================================================================
     CREADORES PROCEDURALES DE MODELOS 3D DE ESCALA COLOSAL
     ======================================================================== */
  createSagittariusMesh() {
    const group = new THREE.Group();

    // 1. Horizonte de Sucesos Masivo (Radio 110)
    const horizonGeo = new THREE.SphereGeometry(110, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    group.add(new THREE.Mesh(horizonGeo, horizonMat));

    // 2. Anillo de Fotones cegador
    const photonGeo = new THREE.TorusGeometry(118, 2.4, 16, 128);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending
    });
    const photonRing = new THREE.Mesh(photonGeo, photonMat);
    photonRing.rotation.x = Math.PI / 2.3;
    group.add(photonRing);

    // 3. Disco de Acreción Ecuatorial Doppler Masivo (Radio 130 a 480)
    const diskGeo = new THREE.RingGeometry(130, 480, 128);
    diskGeo.rotateX(Math.PI / 2.3);
    const diskMat = new THREE.MeshBasicMaterial({
      map: window.nasaApi ? window.nasaApi.createBlackHoleDiskTexture() : null,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    group.add(diskMesh);
    group.userData.disk = diskMesh;

    // 4. Lentes Gravitacionales de Einstein (Arcos de luz curvada gigantes)
    const arcGeo = new THREE.RingGeometry(120, 390, 80, 1, 0, Math.PI);
    const arcMat = diskMat.clone();
    const topArc = new THREE.Mesh(arcGeo, arcMat);
    topArc.rotation.x = -Math.PI / 8;
    group.add(topArc);

    const bottomArc = topArc.clone();
    bottomArc.rotation.z = Math.PI;
    bottomArc.rotation.x = Math.PI / 8;
    group.add(bottomArc);

    // 5. Chorros Relativistas de Plasma Bipolares Colosales (Longitud 1200)
    const jetGeo = new THREE.CylinderGeometry(4.5, 75, 1200, 32, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const topJet = new THREE.Mesh(jetGeo, jetMat);
    topJet.position.y = 600;
    group.add(topJet);

    const bottomJet = topJet.clone();
    bottomJet.position.y = -600;
    bottomJet.rotation.x = Math.PI;
    group.add(bottomJet);

    // Estrellas relativistas en órbita (S2 ampliada a radio 550)
    const starGeo = new THREE.SphereGeometry(7.5, 20, 20);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const s2Star = new THREE.Mesh(starGeo, starMat);
    window.CinematicVisuals.decorateStar(s2Star, 7.5, 0x93c5fd);
    s2Star.position.set(550, 60, 0);
    group.add(s2Star);
    group.userData.s2Star = s2Star;

    return group;
  }

  createCygnusMesh() {
    const group = new THREE.Group();

    // Agujero Negro Estelar (Radio 45)
    const holeGeo = new THREE.SphereGeometry(45, 48, 48);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const holeMesh = new THREE.Mesh(holeGeo, holeMat);
    holeMesh.position.set(-130, 0, 0);
    group.add(holeMesh);

    // Disco de Acreción
    const diskGeo = new THREE.RingGeometry(52, 175, 80);
    diskGeo.rotateX(Math.PI / 2.3);
    const diskMat = new THREE.MeshBasicMaterial({
      map: window.nasaApi ? window.nasaApi.createBlackHoleDiskTexture() : null,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.position.copy(holeMesh.position);
    group.add(disk);
    group.userData.disk = disk;

    // Chorros Relativistas de Rayos X Duros (Longitud 750)
    const jetGeo = new THREE.CylinderGeometry(2.8, 48, 750, 32, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const jetTop = new THREE.Mesh(jetGeo, jetMat);
    jetTop.position.set(-130, 375, 0);
    group.add(jetTop);

    const jetBottom = jetTop.clone();
    jetBottom.position.set(-130, -375, 0);
    jetBottom.rotation.x = Math.PI;
    group.add(jetBottom);

    // Supergigante Azul Binaria HDE 226868 (Radio 120)
    const blueStarGeo = new THREE.SphereGeometry(120, 64, 64);
    const blueStarMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const blueStar = new THREE.Mesh(blueStarGeo, blueStarMat);
    window.CinematicVisuals.decorateStar(blueStar, 120, 0x9ccaff);
    blueStar.position.set(190, 0, 0);

    // Corona y halo azul masivo
    const haloGeo = new THREE.SphereGeometry(148, 36, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    haloGeo.dispose(); haloMat.dispose();
    group.add(blueStar);

    // Flujo de transferencia de masa de Roche (puente de plasma gigante)
    const streamGeo = new THREE.CylinderGeometry(9.0, 32.0, 320, 24);
    streamGeo.rotateZ(Math.PI / 2);
    const streamMat = new THREE.MeshBasicMaterial({
      color: 0xbfdbfe,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const stream = new THREE.Mesh(streamGeo, streamMat);
    stream.position.set(30, 0, 0);
    group.add(stream);

    return group;
  }

  createGargantuaMesh() {
    const group = new THREE.Group();

    // Horizonte de sucesos masivo (Radio 95)
    const holeGeo = new THREE.SphereGeometry(95, 64, 64);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    group.add(new THREE.Mesh(holeGeo, holeMat));

    // Anillo de Fotones incandescente
    const photonGeo = new THREE.TorusGeometry(102, 2.0, 16, 128);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const photon = new THREE.Mesh(photonGeo, photonMat);
    photon.rotation.x = Math.PI / 2.3;
    group.add(photon);

    // Disco Dorado de Acreción Colosal (Radio 112 a 410)
    const diskGeo = new THREE.RingGeometry(112, 410, 96);
    diskGeo.rotateX(Math.PI / 2.3);
    const diskMat = new THREE.MeshBasicMaterial({
      map: window.nasaApi ? window.nasaApi.createBlackHoleDiskTexture() : null,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    group.add(disk);
    group.userData.disk = disk;

    // Doble Arco de Einstein Gigante
    const arcGeo = new THREE.RingGeometry(105, 340, 80, 1, 0, Math.PI);
    const arcTop = new THREE.Mesh(arcGeo, diskMat);
    arcTop.rotation.x = -Math.PI / 8;
    group.add(arcTop);

    const arcBottom = arcTop.clone();
    arcBottom.rotation.z = Math.PI;
    arcBottom.rotation.x = Math.PI / 8;
    group.add(arcBottom);

    return group;
  }

  createGalaxyMesh(innerColor, midColor, outerColor, radius = 750) {
    const group = new THREE.Group();

    // 10,800 partículas estelares ordenadas en 4 brazos espirales logarítmicos + regiones H-II magenta/turquesa
    const count = 10800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cCore = new THREE.Color(0xfff4c2);
    const cInner = new THREE.Color(outerColor || 0xfef08a);
    const cMid = new THREE.Color(midColor || 0x60a5fa);
    const cOuter = new THREE.Color(innerColor || 0x38bdf8);
    const cHII = new THREE.Color(0xf43f5e);
    const cCyan = new THREE.Color(0x22d3ee);
    const cViolet = new THREE.Color(0xa855f7);
    const temp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // 4 brazos espirales (2 principales + 2 secundarios)
      const armIdx = i % 4;
      const arm = armIdx * (Math.PI * 0.5);
      const distRatio = Math.pow(Math.random(), 1.45);
      const r = distRatio * radius;
      const spread = (armIdx % 2 === 0 ? 0.36 : 0.55) * (0.4 + distRatio * 0.9);
      const angle = arm + distRatio * Math.PI * 4.8 + (Math.random() - 0.5) * spread;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = (Math.random() - 0.5) * (radius * 0.11 * (1 - distRatio * 0.72));

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      if (distRatio < 0.18) {
        temp.copy(cCore).lerp(cInner, distRatio / 0.18);
      } else if (distRatio < 0.52) {
        temp.copy(cInner).lerp(cMid, (distRatio - 0.18) / 0.34);
      } else {
        temp.copy(cMid).lerp(cOuter, (distRatio - 0.52) / 0.48);
      }
      // Regiones H-II rosadas/magenta y cúmulos jóvenes turquesa/violeta en los brazos
      if (distRatio > 0.22 && i % 9 === 0) temp.lerp(cHII, 0.78);
      else if (distRatio > 0.3 && i % 13 === 0) temp.lerp(cCyan, 0.7);
      else if (distRatio > 0.45 && i % 17 === 0) temp.lerp(cViolet, 0.65);

      col[i * 3] = temp.r;
      col[i * 3 + 1] = temp.g;
      col[i * 3 + 2] = temp.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 5.2,
      map: window.CinematicVisuals?.stellarMap?.() || null,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geo, mat);
    group.add(particles);
    group.userData.galaxy = particles;

    // Segunda capa espiral en contrarrotación suave con nebulosas H-II brillantes
    const knotCount = 1200;
    const knotGeo = new THREE.BufferGeometry();
    const knotPos = new Float32Array(knotCount * 3);
    const knotCol = new Float32Array(knotCount * 3);
    for (let i = 0; i < knotCount; i++) {
      const arm = (i % 2) * Math.PI;
      const d = 0.18 + Math.pow(Math.random(), 1.2) * 0.78;
      const r = d * radius;
      const a = arm + d * Math.PI * 4.8 + (Math.random() - 0.5) * 0.25;
      knotPos[i * 3] = Math.cos(a) * r;
      knotPos[i * 3 + 1] = (Math.random() - 0.5) * radius * 0.04;
      knotPos[i * 3 + 2] = Math.sin(a) * r;
      temp.copy(i % 3 === 0 ? cHII : i % 3 === 1 ? cCyan : cViolet);
      knotCol.set([temp.r, temp.g, temp.b], i * 3);
    }
    knotGeo.setAttribute('position', new THREE.BufferAttribute(knotPos, 3));
    knotGeo.setAttribute('color', new THREE.BufferAttribute(knotCol, 3));
    const knots = new THREE.Points(knotGeo, new THREE.PointsMaterial({
      size: 13,
      map: window.CinematicVisuals?.stellarMap?.() || null,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    group.add(knots);
    group.userData.galaxyKnots = knots;

    // Núcleo galáctico bulbo masivo
    const coreGeo = new THREE.SphereGeometry(radius * 0.12, 36, 36);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Halo galáctico gigante
    const haloGeo = new THREE.SphereGeometry(radius * 0.26, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    group.add(haloMesh);
    group.userData.galaxyHalo = haloMesh;

    group.rotation.x = Math.PI / 3.5;
    return group;
  }

  createSombreroMesh() {
    const group = new THREE.Group();

    // Bulbo brillante blanco elíptico gigante (Radio 140)
    const bulgeGeo = new THREE.SphereGeometry(140, 64, 64);
    bulgeGeo.scale(1.45, 0.75, 1.45);
    const bulgeMat = new THREE.MeshBasicMaterial({
      color: 0xfef3c7,
      transparent: true,
      opacity: 0.95
    });
    group.add(new THREE.Mesh(bulgeGeo, bulgeMat));

    // Halo exterior elíptico masivo
    const haloGeo = new THREE.SphereGeometry(230, 48, 48);
    haloGeo.scale(1.5, 0.7, 1.5);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Mesh(haloGeo, haloMat));

    // Icónico Anillo Ecuatorial Oscuro de Polvo de Absorción (Radio 190 a 340)
    const ringGeo = new THREE.RingGeometry(190, 340, 128);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      side: THREE.DoubleSide,
      roughness: 0.95,
      transparent: true,
      opacity: 0.94
    });
    group.add(new THREE.Mesh(ringGeo, ringMat));

    // Borde brillante exterior del disco
    const edgeGeo = new THREE.RingGeometry(320, 390, 128);
    edgeGeo.rotateX(Math.PI / 2);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0xfef9c3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Mesh(edgeGeo, edgeMat));

    // Enjambre giratorio de estrellas azul-doradas y regiones H-II en el borde del Sombrero
    const count = 4200;
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(count * 3);
    const sCol = new Float32Array(count * 3);
    const c1 = new THREE.Color(0x60a5fa), c2 = new THREE.Color(0xf472b6), c3 = new THREE.Color(0xfef08a), tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 185 + Math.random() * 215;
      sPos[i * 3] = Math.cos(a) * r;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      sPos[i * 3 + 2] = Math.sin(a) * r;
      tmp.copy(i % 5 === 0 ? c2 : i % 2 === 0 ? c1 : c3);
      sCol.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
    const rimStars = new THREE.Points(sGeo, new THREE.PointsMaterial({
      size: 4.6, map: window.CinematicVisuals?.stellarMap?.() || null, vertexColors: true,
      transparent: true, opacity: 0.86, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    group.add(rimStars);
    group.userData.galaxyKnots = rimStars;

    group.rotation.x = Math.PI / 7.0; // Inclinación característica casi de canto
    return group;
  }

  createPillarsMesh() {
    const group = new THREE.Group();

    // 3 Columnas gaseosas colosales con esferas encadenadas
    const pillarColors = [0xd97706, 0x0ea5e9, 0x9333ea];
    const pillarHeights = [460, 380, 290];

    for (let p = 0; p < 3; p++) {
      const pX = (p - 1) * 140;
      const height = pillarHeights[p];

      for (let y = 0; y < height; y += 38) {
        const radius = (height - y * 0.4) * 0.23 + Math.sin(y * 0.1) * 12;
        const sphereGeo = new THREE.SphereGeometry(radius, 20, 20);
        const col = pillarColors[p % pillarColors.length];
        const mat = new THREE.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.22,
          transparent: true,
          opacity: 0.72,
          roughness: 0.85
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.set(pX + (Math.sin(y * 0.05) * 20), y - 100, (Math.cos(y * 0.05) * 20));
        group.add(mesh);
      }

      // Protoestrella naciente en la cima del pilar (EGG masivo)
      const eggGeo = new THREE.SphereGeometry(20, 24, 24);
      const eggMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const egg = new THREE.Mesh(eggGeo, eggMat);
      egg.position.set(pX, height - 100, 0);
      group.add(egg);
    }

    // Velo volumétrico multicolor de gas ionizado alrededor de los Pilares
    if (window.WorldVisuals?.createNebula) {
      const veil = window.WorldVisuals.createNebula(260, [0x38bdf8, 0xf43f5e, 0xfbbf24]);
      veil.position.y = 95;
      group.add(veil);
      group.userData.nebulaVeil = veil;
    }

    // Nube molecular difusa circundante colosal (Radio 380)
    const cloudGeo = new THREE.SphereGeometry(380, 32, 32);
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Mesh(cloudGeo, cloudMat));

    return group;
  }

  createRingNebulaMesh() {
    const group = new THREE.Group();

    // Cascarón toroidal esmeralda interior masivo (Radio 150, tubo 52)
    const torusInnerGeo = new THREE.TorusGeometry(150, 52, 32, 80);
    const torusInnerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending
    });
    const innerRing = new THREE.Mesh(torusInnerGeo, torusInnerMat);
    group.add(innerRing);

    // Cascarón toroidal magenta exterior masivo (Radio 195, tubo 42)
    const torusOuterGeo = new THREE.TorusGeometry(195, 42, 32, 80);
    const torusOuterMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending
    });
    const outerRing = new THREE.Mesh(torusOuterGeo, torusOuterMat);
    group.add(outerRing);

    // Filamentos radiales multicolor de plasma ionizado (O-III / H-alpha / N-II)
    const filCount = 3400;
    const filGeo = new THREE.BufferGeometry();
    const filPos = new Float32Array(filCount * 3);
    const filCol = new Float32Array(filCount * 3);
    const cIn = new THREE.Color(0x38bdf8), cMid = new THREE.Color(0x10b981), cOut = new THREE.Color(0xf43f5e), tmp = new THREE.Color();
    for (let i = 0; i < filCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const u = Math.random();
      const r = 75 + u * 165 + Math.sin(a * 9) * 10;
      filPos[i * 3] = Math.cos(a) * r;
      filPos[i * 3 + 1] = Math.sin(a) * r;
      filPos[i * 3 + 2] = (Math.random() - 0.5) * 65 * (1 - Math.abs(u - 0.5));
      tmp.copy(u < 0.35 ? cIn : u < 0.72 ? cMid : cOut);
      filCol.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    filGeo.setAttribute('position', new THREE.BufferAttribute(filPos, 3));
    filGeo.setAttribute('color', new THREE.BufferAttribute(filCol, 3));
    const filaments = new THREE.Points(filGeo, new THREE.PointsMaterial({
      size: 6.5, map: window.CinematicVisuals?.stellarMap?.() || null, vertexColors: true,
      transparent: true, opacity: 0.78, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    group.add(filaments);
    group.userData.nebulaFilaments = filaments;
    group.userData.outerRing = outerRing;

    // Enana blanca central (Ultra caliente, radio 10)
    const starGeo = new THREE.SphereGeometry(10, 32, 32);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dwarf = new THREE.Mesh(starGeo, starMat);
    window.CinematicVisuals.decorateStar(dwarf, 10, 0xc7ddff);
    group.add(dwarf);

    // Halo de la enana blanca
    const dwarfHaloGeo = new THREE.SphereGeometry(26, 24, 24);
    const dwarfHaloMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    dwarf.add(new THREE.Mesh(dwarfHaloGeo, dwarfHaloMat));

    group.rotation.x = Math.PI / 4;
    return group;
  }

  createSolarSystemMesh() {
    const group = new THREE.Group();

    // El Sol brillante central (Radio 80)
    const sunGeo = new THREE.SphereGeometry(390, 96, 64);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData.planetName = 'Sol';
    window.CinematicVisuals.decorateStar(sunMesh, 390, 0xffce80);
    group.add(sunMesh);

    // Corona Solar dorada masiva (Radio 115)
    const coronaGeo = new THREE.SphereGeometry(115, 36, 36);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    // The sprite corona fades smoothly instead of forming a second solid sphere.
    coronaGeo.dispose(); coronaMat.dispose();

    // Órbitas planetarias a gran escala
    const planets = [
      { key:"mercury", r: 150, size: 4.0, color: 0x94a3b8 }, // Mercurio
      { key:"venus", r: 215, size: 7.2, color: 0xf59e0b }, // Venus
      { key:"earth", r: 285, size: 7.8, color: 0x0284c7 }, // Tierra
      { key:"mars", r: 360, size: 5.5, color: 0xd97706 }, // Marte
      { key:"jupiter", r: 480, size: 16.0, color: 0xd97706 }, // Júpiter
      { key:"saturn", r: 620, size: 13.0, color: 0xfde047, hasRings: true },
      { key:"uranus", r: 710, size: 11.4, color: 0x91d6df },
      { key:"neptune", r: 840, size: 11.0, color: 0x416cdb }
    ];

    planets.forEach(p => {
      p.size=40.56*(window.PlanetScale?.ratio(p.key)||1);p.r*=5;
      // Línea de órbita luminosa visible alrededor del Sol
      const orbitPts=[];for(let n=0;n<=160;n++){const a=n/160*Math.PI*2;orbitPts.push(new THREE.Vector3(Math.cos(a)*p.r,0,Math.sin(a)*p.r));}
      const orbitLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts),new THREE.LineBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.18}));
      group.add(orbitLine);

      // Mini-planeta
      const pGeo = new THREE.SphereGeometry(p.size, 96, 64);
      const pMat = new THREE.MeshBasicMaterial({ color: p.color });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.userData.planetKey = p.key;
      pMesh.userData.planetName = NASA_PLANETARY_DATABASE[p.key]?.realPlanetName || p.key;
      const angle = planets.indexOf(p) * 2.399963;
      pMesh.userData.solarOrbit = { radius: p.r, angle, speed: 0.0085 * Math.pow(750 / p.r, 1.15) };
      pMesh.position.set(Math.cos(angle) * p.r, 0, Math.sin(angle) * p.r);
      if (p.key === 'earth') {
        const moon = new THREE.Mesh(new THREE.SphereGeometry(2.2,20,16),new THREE.MeshBasicMaterial({color:0xaeb4ba}));
        moon.position.set(24,5,0);moon.userData.planetKey='moon';moon.userData.planetName='Luna';pMesh.add(moon);
      }

      if(window.PlanetEnvironments){while(pMesh.children.length)pMesh.remove(pMesh.children[0]);window.PlanetEnvironments.decorate(pMesh,p.key,p.size);}

      // Si es Saturno, añadir anillos
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.size * 1.5, p.size * 2.6, 48);
        ringGeo.rotateX(Math.PI / 2.5);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75
        });
        pMesh.add(new THREE.Mesh(ringGeo, ringMat));
      }

      group.add(pMesh);
    });

    const belt=new THREE.Group();belt.name='Cinturón de asteroides';
    const geo=new THREE.DodecahedronGeometry(1,1),ironGeo=new THREE.IcosahedronGeometry(1,1);
    const mat=new THREE.MeshStandardMaterial({color:0x8b8175,roughness:.95,flatShading:true});
    const ironMat=new THREE.MeshStandardMaterial({color:0x9aa4b2,metalness:.55,roughness:.5,flatShading:true});
    const iceMat=new THREE.MeshStandardMaterial({color:0xa5c9dc,roughness:.65,flatShading:true});
    // Cinturón principal entre Marte (1800) y Júpiter (2400) + cinturón interior y exterior
    for(let i=0;i<360;i++){
      const angle=i*2.399963,band=i<240?2080+Math.sin(i*17)*150:i<310?1220+Math.sin(i*13)*65:3350+Math.cos(i*11)*180;
      const size=3+(i%8)*(i%19===0?1.8:1);
      const rock=new THREE.Mesh(i%5===0?ironGeo:geo,i%7===0?iceMat:i%5===0?ironMat:mat);
      rock.position.set(Math.cos(angle)*band,Math.sin(i*7)*42,Math.sin(angle)*band);
      rock.scale.set(size,size*.78,size*1.18);
      rock.rotation.set(i,i*.7,i*.3);
      rock.userData.asteroidRadius=1.15;
      rock.userData.spin=(0.15+(i%5)*0.08)*(i%2?1:-1);
      belt.add(rock);
    }
    group.userData.asteroidBelt=belt;
    group.add(belt);
    return group;
  }

  /* ========================================================================
     CONTROLES Y DETECCIÓN EN TIEMPO REAL
     ======================================================================== */
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActive || e.target?.closest?.('input,select,textarea,dialog')) return;
      if (this.cinemaShot) { if (['Space','Escape','KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'].includes(e.code)) this.finishCinema(); e.preventDefault(); return; }
      if (this.travelShot) {
        if (e.code === 'Space' || e.code === 'Escape' || ['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'].includes(e.code)) this.finishTravelShot();
        e.preventDefault(); return;
      }
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if(!e.repeat)window.CruiseSystems?.key(e.code);
      if(e.code==='KeyT'&&!e.repeat){document.getElementById('expedition-resupply')?.click();return;}
      window.FlightRoll?.key(this,e);this.keys[e.code] = true;
      if(e.code==='KeyR'&&!e.repeat)this.cruiseActive=!this.cruiseActive;
      if(['KeyS','KeyB','Space'].includes(e.code))this.cruiseActive=false;
      // N is handled by the distant stellar map.
      if (e.code === 'KeyG' && !e.repeat) this.toggleGuide();
      if (e.code === 'Space') {
        this.isWarpActive = false;
      }
      if ((e.code === 'KeyV' || e.code === 'KeyC') && !e.repeat) {
        this.cycleCameraMode();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isActive) return;
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.isWarpActive = false;
      }
    });

    document.getElementById('exploration-camera-toggle')?.addEventListener('click', () => (window.partialPause?.getEngine?.() || this).cycleCameraMode?.());
    document.getElementById('exploration-map-toggle')?.addEventListener('click', () => this.ui.screen.classList.toggle('navigation-open'));
    document.getElementById('exploration-guide-toggle')?.addEventListener('click', () => this.toggleGuide());
    document.getElementById('cinematic-skip')?.addEventListener('click', () => { if (this.cinemaShot) this.finishCinema(); else this.finishTravelShot(); });
    const cinemaMenu = document.getElementById('cinema-menu');
    document.getElementById('exploration-cinema-toggle')?.addEventListener('click', () => { cinemaMenu.hidden = !cinemaMenu.hidden; this.keys = {}; this.shipSpeed = 0; });
    document.getElementById('cinema-close')?.addEventListener('click', () => { cinemaMenu.hidden = true; });
    document.getElementById('cinema-play')?.addEventListener('click', () => this.startCinema(document.getElementById('cinema-destination').value));
    window.addEventListener('blur', () => { this.keys = {}; this.verticalSpeed = 0; this.turnVelocity = 0; this.pendingYaw = 0; this.pendingPitch = 0; this.mouse.isDown = false; this.isWarpActive = false; });
    for (const [id,code] of [['explorer-up','KeyQ'],['explorer-down','KeyE']]) {
      const button = document.getElementById(id);
      button?.addEventListener('pointerdown',event => { if (!this.isActive) return; event.preventDefault(); button.setPointerCapture(event.pointerId); this.keys[code] = true; });
      for (const type of ['pointerup','pointercancel','lostpointercapture']) button?.addEventListener(type,()=>{this.keys[code]=false;});
    }
    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      if (!this.isActive) return;
      if (e.button !== 0 || this.cinemaShot || this.travelShot) return;
      this.mouse.isDown = true;
      this.mouse.prevX = e.clientX;
      this.mouse.prevY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isActive || !this.mouse.isDown) return;
      const deltaX = e.clientX - this.mouse.prevX;
      const deltaY = e.clientY - this.mouse.prevY;
      this.mouse.prevX = e.clientX;
      this.mouse.prevY = e.clientY;

      // Rotación libre 360°
      this.pendingYaw = (this.pendingYaw || 0) - deltaX * 0.0025;
      this.pendingPitch = (this.pendingPitch || 0) - deltaY * 0.0025;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    // Botón Salir
    if (this.ui.exitBtn) {
      this.ui.exitBtn.addEventListener('click', () => {
        this.stopExploration();
        if (this.onExit) this.onExit();
      });
    }

    // Botón Cerrar Guía Holográfica
    if (this.ui.guideCloseBtn) {
      this.ui.guideCloseBtn.addEventListener('click', () => {
        if (this.ui.guidePanel) this.ui.guidePanel.classList.remove('active');
        window.planetNarrator?.stop();
      });
    }

    // Botón Voz Silenciar / Activar
    if (this.ui.voiceToggleBtn) {
      this.ui.voiceToggleBtn.addEventListener('click', () => {
        this.isVoiceMuted = !this.isVoiceMuted;
        if (this.ui.voiceStatusText) {
          this.ui.voiceStatusText.textContent = this.isVoiceMuted ? 'SILENCIADA' : 'ACTIVA';
        }
        if (this.isVoiceMuted) {
          window.planetNarrator?.stop();window.speechSynthesis?.cancel();
        } else if (!this.isVoiceMuted && this.currentLandmark) {
          const target=this.planetProximity?.current;
          if(target){this.planetProximity.announced=false;this.planetProximity.visits.delete(target.planetKey);}
          else this.speakExplanation(this.currentLandmark.explanation);
        }
      });
    }

    // Botón Escuchar de nuevo
    if (this.ui.readAloudBtn) {
      this.ui.readAloudBtn.addEventListener('click', () => {
        if (this.currentLandmark) {
          this.speakExplanation(this.currentLandmark.explanation);
        }
      });
    }

    // Botón Cambiar Fondo Fotorrealista
    if (this.ui.skyboxToggleBtn) {
      this.ui.skyboxToggleBtn.addEventListener('click', () => {
        this.nextPhotorealisticSkybox();
      });
    }

    window.addEventListener('resize', () => this.onResize());
  }

  /* ========================================================================
     PANEL DE WAYPOINTS / PUNTOS DE INTERÉS CÓSMICO EN LA UI
     ======================================================================== */
  renderWaypointsUI() {
    const cinemaSelect = document.getElementById('cinema-destination');
    if (cinemaSelect) { cinemaSelect.replaceChildren(); this.landmarks.forEach(lm => { const option = document.createElement('option'); option.value=lm.id; option.textContent=lm.shortName; cinemaSelect.append(option); }); }
    if (!this.ui.waypointsList) return;

    this.ui.waypointsList.innerHTML = this.landmarks.map(lm => `
      <div class="waypoint-card" data-landmark-id="${lm.id}">
        <div class="waypoint-header">
          <span class="waypoint-icon">${lm.icon}</span>
          <div class="waypoint-titles">
            <strong class="waypoint-name">${lm.shortName}</strong>
            <span class="waypoint-cat">${lm.category}</span>
          </div>
        </div>
        <div class="waypoint-distance-row">
          <span class="waypoint-dist-tag" id="dist-tag-${lm.id}">Calculando...</span>
          <button type="button" class="warp-jump-btn" data-warp-id="${lm.id}">
            VIAJAR
          </button>
        </div>
      </div>
    `).join('');

    // Eventos de botones de Salto Warp
    const warpBtns = this.ui.waypointsList.querySelectorAll('.warp-jump-btn');
    warpBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.getAttribute('data-warp-id');
        this.warpJumpToLandmark(targetId);
      });
    });

    const cards = this.ui.waypointsList.querySelectorAll('.waypoint-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const targetId = card.getAttribute('data-landmark-id');
        this.warpJumpToLandmark(targetId);
      });
    });
  }

  warpJumpToLandmark(landmarkId, charged=false) {
    if(!charged){window.CruiseSystems?.requestJump(this,landmarkId);return;}
    const lm = this.landmarks.find(l => l.id === landmarkId);
    if (!lm || !this.isActive) return;
    this.travelShot = { lm, start:this.shipGroup.position.clone(), dest:lm.position.clone().add(lm.observationOffset), elapsed:0 };
    this.shipSpeed = 0; this.verticalSpeed = 0; this.keys = {}; this.isWarpActive = false; this.cruiseActive=false; this.linearVelocity={x:0,y:0,z:0};this._boostReturnSpeed=null; this.pendingYaw=0; this.pendingPitch=0; this.turnVelocity=0;
    this.guideRequested = false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { this.finishTravelShot(); return; }
    document.body.classList.add('cinematic-shot');
    this.triggerWarpFlash();
    const title = document.getElementById('cinematic-scene-title'); if (title) title.textContent = lm.shortName;
  }

  /* ========================================================================
     DETECCIÓN DE MONUMENTOS Y EXPLICACIÓN EN VIVO (GUÍA IA DE LA NASA)
     ======================================================================== */
  updateLandmarkDetection(force = false) {
    if (!this.shipGroup) return;

    const shipPos = this.shipGroup.position;
    let closestLandmark = null;
    let minDistance = Infinity;

    this.landmarks.forEach(lm => {
      const dist = shipPos.distanceTo(lm.position);
      // Actualizar distancia en la lista de waypoints
      const distTag = document.getElementById(`dist-tag-${lm.id}`);
      if (distTag) {
        if (dist > 3500) {
          distTag.textContent = `${(dist * 0.12).toFixed(1)} Años Luz`;
        } else {
          distTag.textContent = `${(dist * 2.2).toFixed(0)} UA`;
        }
      }

      if (dist < minDistance) {
        minDistance = dist;
        closestLandmark = lm;
      }
    });

    // Umbral de proximidad de observación en sectores expandidos: 1250 unidades
    const observationThreshold = 1250;
    if (closestLandmark && (minDistance < observationThreshold || force)) {
      if (this.currentLandmark !== closestLandmark || force) {
        this.currentLandmark = closestLandmark;
        const cinemaTarget=document.getElementById('cinema-destination');if(cinemaTarget)cinemaTarget.value=closestLandmark.id;
        this.displayLandmarkExplanation(closestLandmark, minDistance);
      } else {
        // Actualizar solo distancia en el panel activo
        if (this.ui.guideDist) {
          if (minDistance > 3500) {
            this.ui.guideDist.textContent = `${(minDistance * 0.12).toFixed(1)} Años Luz (${closestLandmark.distanceDisplay})`;
          } else {
            this.ui.guideDist.textContent = `${(minDistance * 2.2).toFixed(0)} UA (${closestLandmark.distanceDisplay})`;
          }
        }
      }
    } else if (minDistance >= observationThreshold && !force) {
      if (this.currentLandmark) {
        this.currentLandmark = null;
        if (this.ui.guidePanel) {
          this.ui.guidePanel.classList.remove('active');
        }
      }
    }
  }

  initiatePlanetaryDescent(planetKey) {
    if (window.surfaceExplorer) {
      this.stop();
      window.surfaceExplorer.start(planetKey);
    } else if (window.landingEngine) {
      this.stop();
      window.landingEngine.startDescent(planetKey, 100);
    }
  }

  displayLandmarkExplanation(lm, dist) {
    if (!this.ui.guidePanel) return;

    if (this.ui.guideIcon) this.ui.guideIcon.textContent = lm.icon;
    if (this.ui.guideTitle) this.ui.guideTitle.textContent = lm.name.toUpperCase();
    if (this.ui.guideClass) this.ui.guideClass.textContent = lm.category;
    if (this.ui.guideDist) {
      if (dist > 3500) {
        this.ui.guideDist.textContent = `${(dist * 0.12).toFixed(1)} Años Luz (${lm.distanceDisplay})`;
      } else {
        this.ui.guideDist.textContent = `${(dist * 2.2).toFixed(0)} UA (${lm.distanceDisplay})`;
      }
    }
    if (this.ui.guideExplanation) this.ui.guideExplanation.textContent = lm.explanation;

    if (this.ui.guideRelativityStrip) {
      this.ui.guideRelativityStrip.innerHTML = `
        <div class="rel-item"><span>⚖️ MASA:</span> <strong>${lm.mass}</strong></div>
        <div class="rel-item"><span>🌡️ TEMP:</span> <strong>${lm.temperature}</strong></div>
        <div class="rel-item"><span>☢️ RADIACIÓN:</span> <strong>${lm.radiation}</strong></div>
        <div class="rel-item"><span>⏳ RELATIVIDAD:</span> <strong>${lm.timeDilation}</strong></div>
      `;
    }

    if (this.guideRequested) this.ui.guidePanel.classList.add('active');

    // Reproducir sonido de escaneo / aviso holográfico
    if (window.spaceAudio) {
      window.spaceAudio.playWarningBeep();
    }

    // Narrar por voz si no está silenciado
    if (!this.isVoiceMuted) {
      this.speakExplanation(`${lm.shortName || lm.name}. Objetivo a la vista.`);
    }
  }

  speakExplanation(text) {
    window.planetNarrator?.speak(text);
  }

  /* ========================================================================
     BUCLE PRINCIPAL DE ANIMACIÓN Y FÍSICA PARA SECTORES VASTOS
     ======================================================================== */
  resolveCelestialCollision(previous) {
    this.scene?.updateMatrixWorld(true);
    const bodies = (this.colliders || []).map(body => ({...body,
      bounds:body.service?new THREE.Box3().setFromObject(body.mesh):null,
      center:body.mesh.getWorldPosition(new THREE.Vector3()),
      radius:body.radius * Math.max(...body.mesh.getWorldScale(new THREE.Vector3()).toArray())}));
    const impactSpeed=this.linearVelocity?Math.hypot(this.linearVelocity.x,this.linearVelocity.y,this.linearVelocity.z):this.shipSpeed+Math.abs(this.strafeSpeed||0)+Math.abs(this.reverseSpeed||0);
    const result = window.NavigationPhysics.sweep(previous,this.shipGroup.position,bodies,7);
    this.shipGroup.position.set(result.position.x,result.position.y,result.position.z);
    if (!result.hit) return;
    if(result.hit.asteroid&&window.ExpeditionSystems&&impactSpeed>5){const state=window.ExpeditionSystems.state;window.CruiseSystems?.damage(Math.min(18,impactSpeed*.06));}
    this.strafeSpeed=0;this.reverseSpeed=0;this.cruiseActive=false;this.linearVelocity={x:0,y:0,z:0};this._boostReturnSpeed=null;
    this.shipSpeed = 0; this.verticalSpeed = 0; this.isWarpActive = false;
    this.keys.Space = this.keys.ShiftLeft = this.keys.ShiftRight = false;
    if (result.hit.planetKey) {
      const select = document.getElementById('planet-audio-select');if(select)select.value=result.hit.planetKey;
    }
    const status=document.getElementById('collision-status');
    if(status) {status.textContent=`Contacto con ${result.hit.name}. Propulsión detenida; gira o asciende para alejarte.`;clearTimeout(this.collisionNotice);this.collisionNotice=setTimeout(()=>{status.textContent='';},3500);}
  }

  toggleGuide() {
    this.guideRequested = !this.ui.guidePanel.classList.contains('active');
    if (this.currentLandmark && this.guideRequested) this.ui.guidePanel.classList.add('active');
    else this.ui.guidePanel.classList.remove('active');
    if (!this.currentLandmark && this.guideRequested) this.ui.screen.classList.add('navigation-open');
  }

  startCinema(id) {
    const lm = this.landmarks.find(item => item.id === id);
    if (!lm || !this.isActive) return;
    this.finishCinema(); this.finishTravelShot();
    const sphere = new THREE.Box3().setFromObject(lm.meshGroup).getBoundingSphere(new THREE.Sphere());
    this.cinemaShot = {lm,focus:sphere.center.clone(),radius:sphere.radius,elapsed:0,
      cameraPosition:this.camera.position.clone(),fov:this.camera.fov,shipVisible:this.shipGroup.visible};
    this.shipSpeed=0;this.verticalSpeed=0;this.keys={};this.isWarpActive=false;
    this.shipGroup.visible=false;window.planetNarrator?.stop();
    this.cinemaProxy=this.ship.mesh.clone(true);this.cinemaProxy.visible=true;this.scene.add(this.cinemaProxy);
    window.odysseyStory?.radio?.clearTimers();window.odysseyStory?.radio?.enterStandbyMode();
    document.getElementById('cinema-menu').hidden=true;
    document.getElementById('surface-menu').hidden=true;
    document.body.classList.add('cinematic-shot');
    document.getElementById('cinematic-scene-title').textContent=lm.shortName;
    window.spaceAudio?.setSoundtrackIntensity?.(.8);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) this.cinemaShot.still=true;
  }

  finishCinema() {
    if (!this.cinemaShot) return;
    const shot=this.cinemaShot;this.shipGroup.visible=shot.shipVisible;
    if(this.cinemaProxy){this.scene.remove(this.cinemaProxy);this.cinemaProxy=null;}
    this.camera.position.copy(shot.cameraPosition);this.camera.fov=shot.fov;this.camera.updateProjectionMatrix();
    this.cinemaShot=null;document.body.classList.remove('cinematic-shot');
    window.ImmersionView?.sync(this);
    document.getElementById('cinematic-fade').style.opacity='0';
    window.spaceAudio?.setSoundtrackIntensity?.(.5);
  }

  updateCinema(delta) {
    const shot=this.cinemaShot;shot.elapsed+=delta;
    const frame=window.CinemaDirector.frame(shot.still?3:shot.elapsed,shot.radius,this.camera.aspect);
    this.camera.position.copy(shot.focus).add(new THREE.Vector3(frame.x,frame.y,frame.z));
    this.camera.fov=frame.fov;this.camera.updateProjectionMatrix();this.camera.lookAt(shot.focus);
    if(this.cinemaProxy){const offset=new THREE.Vector3(frame.x,frame.y,frame.z),right=new THREE.Vector3(offset.z,0,-offset.x).normalize();
      this.cinemaProxy.position.copy(shot.focus).add(offset.multiplyScalar(.65)).addScaledVector(right,-Math.hypot(frame.x,frame.y,frame.z)*.025);
      this.cinemaProxy.position.y-=shot.radius*.05;this.cinemaProxy.scale.setScalar(Math.max(1,shot.radius/80));this.cinemaProxy.lookAt(shot.focus);this.cinemaProxy.rotateZ(Math.sin(shot.elapsed*.45)*.025);
    }
    document.getElementById('cinematic-chapter').textContent=frame.chapter;
    document.getElementById('cinematic-fade').style.opacity=String(shot.still?0:frame.fade);
    this.skyDome?.position.copy(this.camera.position);this.starfieldMesh?.position.copy(this.camera.position);
    this.updateLandmarkAnimations(delta);this.renderer.render(this.scene,this.camera);
    if(shot.elapsed>=18)this.finishCinema();
  }

  triggerWarpFlash() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    let flash = document.getElementById('sf-warp-flash');
    if (!flash && typeof document.createElement === 'function' && document.body?.appendChild) {
      flash = document.createElement('div');
      flash.id = 'sf-warp-flash';
      flash.className = 'sf-warp-flash';
      document.body.appendChild(flash);
    }
    if (flash?.classList?.add) {
      flash.classList.remove('active');
      flash.classList.add('active');
      if (typeof setTimeout === 'function') {
        setTimeout(() => flash?.classList?.remove?.('active'), 800);
      }
    }
  }

  finishTravelShot() {
    if (!this.travelShot) return;
    const { lm, dest, planetKey } = this.travelShot;
    this.shipGroup.position.copy(dest);
    const direction = lm.position.clone().sub(dest).normalize();
    this.cameraYaw = Math.atan2(-direction.x, -direction.z);
    this.cameraPitch = Math.asin(direction.y);
    this.jumpCharge = null; this.travelShot = null; this.shipSpeed = 0;this.linearVelocity={x:0,y:0,z:0};
    document.body.classList.remove('cinematic-shot');
    this.triggerWarpFlash();
    if(planetKey)window.PlanetNavigation?.arrive(this,planetKey);
    this.currentLandmark = null; this.updateLandmarkDetection(true);
  }

  updateTravelShot(delta) {
    const shot = this.travelShot; shot.elapsed += delta;
    const t = Math.min(1, shot.elapsed / 5.5), ease = t*t*t*(t*(t*6-15)+10), arc = Math.sin(t * Math.PI);
    const chapter=document.getElementById('cinematic-chapter');
    if(chapter)chapter.textContent=t<.3?'SALIDA':t<.75?'TRÁNSITO':'LLEGADA';
    this.shipGroup.position.lerpVectors(shot.start, shot.dest, ease);
    const travelDir = shot.dest.clone().sub(shot.start).normalize();
    const finalDir = shot.lm.position.clone().sub(shot.dest).normalize();
    const direction = travelDir.lerp(finalDir, ease * ease).normalize();
    this.cameraYaw = Math.atan2(-direction.x, -direction.z);
    this.cameraPitch = Math.asin(direction.y);
    this.shipGroup.rotation.set(this.cameraPitch, this.cameraYaw, 0);
    const offset = new THREE.Vector3(14 * arc, 8 + 5 * arc, 58 - 14 * ease);
    offset.multiplyScalar(Math.max(1, 0.85 / this.camera.aspect));
    offset.applyQuaternion(this.shipGroup.quaternion);
    this.camera.position.lerp(this.shipGroup.position.clone().add(offset), 1 - Math.exp(-delta * 6));
    this.camera.lookAt(this.shipGroup.position.clone().lerp(shot.lm.position, ease * ease * 0.45));
    this.skyDome?.position.copy(this.camera.position);
    this.starfieldMesh?.position.copy(this.camera.position);
    this.ship?.update(delta, 100 * (1 - ease * 0.65)); this.updateLandmarkAnimations(delta);
    this.renderer.render(this.scene,this.camera);
    if (t >= 1) this.finishTravelShot();
  }

  update() {
    if (!this.isActive) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    window.Fluidity?.frame(this.renderer, delta);
    if(document.getElementById("stellar-map")?.open||window.ExplorationUpgrades?.open||window.missionChallenges?.active){this.keys={};this.renderer.render(this.scene,this.camera);return;}
    if(window.RescueFleet?.animateDock(this,delta)){this.renderer.render(this.scene,this.camera);return;}
    window.ReactiveFlight?.update(this,delta);
    window.CruiseSystems?.input(this,delta);
    if(this.scienceScan){this.keys={};this.cruiseActive=false;this.linearVelocity={x:0,y:0,z:0};this.shipSpeed=0;this.verticalSpeed=0;}

    window.QuietFlight?.update(this,delta);
    if (this.cinemaShot) { this.updateCinema(delta); return; }
    if (this.travelShot) { this.updateTravelShot(delta); return; }

    const reactor=window.CruiseSystems?.reactor||{eng:4};
    this.maxSpeed=(100+reactor.eng*40)*(1+.1*(window.ExplorationUpgrades?.level('engine')||0));
    this.boostCharge??=100;
    const requestedBoost=!!(this.keys.ShiftLeft||this.keys.ShiftRight);
    if(!requestedBoost)this.boostLocked=false;
    const boosting=requestedBoost&&!this.boostLocked&&this.boostCharge>0&&window.ExpeditionSystems?.state.operational!==false;
    this.boostCharge=THREE.MathUtils.clamp(this.boostCharge+delta*(boosting?-25:12),0,100);
    if(this.boostCharge===0)this.boostLocked=true;
    this.isWarpActive=boosting;
    const authority=window.NavigationPhysics.turnAuthority(this.shipSpeed,this.maxSpeed);
    this.idleTime=0;
    // 2. Viraje y Rotación de la Nave
    const turnInput=Number(!!(this.keys['KeyA']||this.keys['ArrowLeft']))-Number(!!(this.keys['KeyD']||this.keys['ArrowRight']));
    this.turnVelocity=(this.turnVelocity||0)+(turnInput*.95*authority-(this.turnVelocity||0))*(1-Math.exp(-delta*5));
    this.cameraYaw+=this.turnVelocity*delta;
    const mouseBlend = 1-Math.exp(-delta*14);
    const yawStep=(this.pendingYaw||0)*mouseBlend, pitchStep=(this.pendingPitch||0)*mouseBlend;
    this.pendingYaw=(this.pendingYaw||0)-yawStep; this.pendingPitch=(this.pendingPitch||0)-pitchStep;
    this.cameraYaw+=yawStep*authority;
    this.visualYawRate=(this.turnVelocity+yawStep*authority/Math.max(.001,delta));
    this.cameraPitch=THREE.MathUtils.clamp(this.cameraPitch+pitchStep*authority,-Math.PI/2.1,Math.PI/2.1);

    this.verticalSpeed = window.NavigationPhysics.vertical(this.verticalSpeed || 0, this.keys, delta);

    // 3. Orientación de la Nave según el ángulo de la cámara
    if (this.shipGroup) {
      // Actualizar animaciones internas del modelo Arwing (turbinas, armaduras cuánticas, llamaradas con velocidad)
      if (this.ship && this.ship.update) {
        const pitchCtrl = (((this.keys.KeyQ||this.keys.ArrowUp)?1:0)-((this.keys.KeyE||this.keys.ArrowDown)?1:0)) || THREE.MathUtils.clamp(pitchStep * 15, -1, 1);
        this.ship.update(delta, this.shipSpeed, { roll: turnInput, pitch: pitchCtrl, brake: !!this.keys.Space, boost: boosting, rcs: Math.abs(turnInput) > 0.05 || Math.abs(pitchCtrl) > 0.05 });
        this.ship.setStrandedOffline?.(window.ExpeditionSystems?.state.operational===false);
      }
      if (this.engineLight) {
        this.engineLight.intensity = window.ExpeditionSystems?.state.operational===false?0:this.shipSpeed > 10 ? (2.0 + Math.random() * 0.7) : 0.45;
      }

      this.shipGroup.rotation.order = 'YXZ';
      this.shipGroup.rotation.y = this.cameraYaw;
      this.shipGroup.rotation.x = this.cameraPitch;

      // Inclinación aerodinámica lateral (Roll bancada)
      const rollTarget = THREE.MathUtils.clamp(this.visualYawRate*.2,-.28,.28);
      this.rollBank = THREE.MathUtils.lerp(this.rollBank||0, rollTarget, 1 - Math.exp(-delta * 8));this.shipGroup.rotation.z=this.rollBank+(window.FlightRoll?.update(this,delta)||0);

      // Desplazamiento hacia adelante en la dirección de la proa
      const forward = new THREE.Vector3(-Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch), Math.sin(this.cameraPitch), -Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch));
      const previousPosition = this.shipGroup.position.clone();
      const canThrust=window.ExpeditionSystems?.state.operational!==false;
      this.reverseSpeed=(this.reverseSpeed||0)+(((this.keys.KeyS||this.keys.KeyB)?65:0)-(this.reverseSpeed||0))*(1-Math.exp(-delta*5));
      this.strafeSpeed=(this.strafeSpeed||0)+(((this.keys.KeyX?1:0)-(this.keys.KeyZ?1:0))*80-(this.strafeSpeed||0))*(1-Math.exp(-delta*6));
      const right=new THREE.Vector3(Math.cos(this.cameraYaw),0,-Math.sin(this.cameraYaw));
      if(this.keys.KeyS||this.keys.KeyB||this.keys.Space)this.cruiseActive=false;
      if(!canThrust){this.shipSpeed=0;this.reverseSpeed=0;this.strafeSpeed=0;this.verticalSpeed=0;}
      const up=new THREE.Vector3().crossVectors(right,forward).normalize();
      const force=forward.clone().multiplyScalar(((this.keys.KeyW?1:0)-((this.keys.KeyS||this.keys.KeyB)?1:0))*(35+reactor.eng*20)+(boosting?320:0))
        .addScaledVector(right,((this.keys.KeyX?1:0)-(this.keys.KeyZ?1:0))*65)
        .addScaledVector(up,(((this.keys.KeyQ||this.keys.ArrowUp)?1:0)-((this.keys.KeyE||this.keys.ArrowDown)?1:0))*65);
      this.linearVelocity=window.NavigationPhysics.forceStep(this.linearVelocity||{x:0,y:0,z:0},force,delta,{drag:!canThrust?0:this.cruiseActive?0:(this.linearDrag??.55),maxSpeed:boosting?this.maxSpeed*1.8:this.maxSpeed,brake:canThrust&&!!this.keys.Space,operational:canThrust});
      if(canThrust&&!this.cruiseActive&&!this.keys.KeyX&&!this.keys.KeyZ&&!this.keys.KeyQ&&!this.keys.KeyE&&!this.keys.ArrowUp&&!this.keys.ArrowDown)
        this.linearVelocity=window.NavigationPhysics.assist(this.linearVelocity,forward,delta);
      this.gravityWarning=false;
      for(const lm of this.landmarks||[]){
        const radius=({sagittarius_a:110,cygnus_x1:45,gargantua:95})[lm.id];if(!radius)continue;
        const center=lm.position.clone();if(lm.id==='cygnus_x1')center.x-=130;
        const g=window.NavigationPhysics.gravity(this.shipGroup.position,center,radius);
        for(const axis of ['x','y','z'])this.linearVelocity[axis]+=g.force[axis]*delta;
        this.gravityWarning ||= g.warning;
        if(g.captured&&window.ExpeditionSystems){window.ExpeditionSystems.state.hull=0;window.ExpeditionSystems.state.save();}
      }
      this.longitudinalSpeed=this.linearVelocity.x*forward.x+this.linearVelocity.y*forward.y+this.linearVelocity.z*forward.z;
      this.shipSpeed=Math.hypot(this.linearVelocity.x,this.linearVelocity.y,this.linearVelocity.z);
      this.shipGroup.position.addScaledVector(new THREE.Vector3(this.linearVelocity.x,this.linearVelocity.y,this.linearVelocity.z),delta);
      this.resolveCelestialCollision(previousPosition);
      const velVec = new THREE.Vector3(this.linearVelocity.x, this.linearVelocity.y, this.linearVelocity.z);
      const sideSlip = this.shipSpeed > 4 ? THREE.MathUtils.clamp(velVec.dot(right) / Math.max(20, this.shipSpeed), -0.35, 0.35) : 0;
      const vertSlip = this.shipSpeed > 4 ? THREE.MathUtils.clamp(velVec.dot(up) / Math.max(20, this.shipSpeed), -0.35, 0.35) : 0;
      this.velPitchAlign = THREE.MathUtils.lerp(this.velPitchAlign || 0, vertSlip * 0.16 + THREE.MathUtils.clamp(this.verticalSpeed / 90, -1, 1) * 0.045, 1 - Math.exp(-delta * 9));
      this.velYawAlign = THREE.MathUtils.lerp(this.velYawAlign || 0, -sideSlip * 0.14, 1 - Math.exp(-delta * 9));
      this.velRollAlign = THREE.MathUtils.lerp(this.velRollAlign || 0, -sideSlip * 0.22, 1 - Math.exp(-delta * 9));
      this.shipGroup.rotation.x += this.velPitchAlign;
      this.shipGroup.rotation.y += this.velYawAlign;
      this.shipGroup.rotation.z += this.velRollAlign;

      // Si el usuario se queda quieto por más de 3 segundos, activar rotación cinemática de escena
      if (this.idleTime > 3.0 && this.currentCameraMode === 'far') {
        this.cinematicOrbitAngle = (this.cinematicOrbitAngle || 0) + delta * 0.25;
        const orbitRadius = 60;
        const orbitHeight = 15 + Math.sin(this.cinematicOrbitAngle * 0.4) * 6;
        const camX = Math.sin(this.cinematicOrbitAngle) * orbitRadius;
        const camZ = Math.cos(this.cinematicOrbitAngle) * orbitRadius;
        this.camera.position.set(
          this.shipGroup.position.x + camX,
          this.shipGroup.position.y + orbitHeight,
          this.shipGroup.position.z + camZ
        );
        this.camera.lookAt(this.shipGroup.position);
      } else {
        // Modos de Perspectiva de Cámara Múltiples
        let camOffset = new THREE.Vector3(0, 9, 44);
        let lookTargetOffset = forward.clone().multiplyScalar(50);
        let targetFov = 52;

        switch (this.currentCameraMode) {
          case 'top':
            camOffset.set(0, 36, 4);
            lookTargetOffset.set(0, -10, 0);
            targetFov = 56;
            break;
          case 'bottom':
            camOffset.set(0, -22, 6);
            lookTargetOffset.set(0, 10, -20);
            targetFov = 54;
            break;
          case 'cockpit':
            camOffset.set(0, 1.25, -2.4);
            lookTargetOffset = forward.clone().multiplyScalar(100);
            targetFov = 66+(boosting?5:0);
            break;
          case 'far':
            camOffset.set(0, 52, 120);
            lookTargetOffset = forward.clone().multiplyScalar(60);
            targetFov = 60;
            break;
          case 'chase':
          default:
            camOffset.set(0, 8, 44 - Math.min(4, this.shipSpeed * .012));
            targetFov = 55;
            break;
        }

        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 1-Math.exp(-delta*6));
        this.camera.updateProjectionMatrix();

        if (this.currentCameraMode !== 'cockpit') camOffset.multiplyScalar(Math.max(1, 0.85 / this.camera.aspect));
        // Smooth the local mount, not the world position: no lag through the hull at cruise speed.
        if (!this.cameraMount) this.cameraMount=camOffset.clone();
        if(this.currentCameraMode==='cockpit'){
          const forwardAcc = (this.keys.KeyW ? 1 : 0) + (boosting ? 2 : 0) - (this.keys.KeyS ? 1.5 : 0) - (this.keys.KeyB ? 1.5 : 0);
          camOffset.z += THREE.MathUtils.clamp(-forwardAcc * 0.22, -0.35, 0.25);
          camOffset.x += THREE.MathUtils.clamp(-this.turnVelocity * 0.25 + ((this.keys.KeyX?1:0)-(this.keys.KeyZ?1:0)) * 0.12, -0.18, 0.18);
          camOffset.y += THREE.MathUtils.clamp(-pitchStep * 0.35 + (((this.keys.KeyQ||this.keys.ArrowUp)?1:0)-((this.keys.KeyE||this.keys.ArrowDown)?1:0)) * 0.08, -0.12, 0.12);
          if (boosting || this.shipSpeed > 150) {
            const rumble = (boosting ? 0.022 : 0.008) * Math.min(1, this.shipSpeed / 200);
            camOffset.x += (Math.random() - 0.5) * rumble;
            camOffset.y += (Math.random() - 0.5) * rumble;
          }
          const leadYaw = THREE.MathUtils.clamp(this.turnVelocity * 14, -18, 18);
          lookTargetOffset.add(right.clone().multiplyScalar(leadYaw));
        }
        this.cameraMount.lerp(camOffset,1-Math.exp(-delta*10));
        const mountRotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(this.cameraPitch,this.cameraYaw,0,'YXZ'));
        if(!this.followRotation)this.followRotation=mountRotation.clone();
        this.followRotation.slerp(mountRotation,1-Math.exp(-delta*(this.currentCameraMode==='cockpit'?18:6)));
        const mountedOffset=this.cameraMount.clone().applyQuaternion(this.followRotation);
        this.camera.position.copy(this.shipGroup.position).add(mountedOffset);
        this.camera.rotateZ(-(this.lastCameraRoll||0));this.lastCameraRoll=0;const oldOrientation=this.camera.quaternion.clone();
        this.camera.lookAt(this.shipGroup.position.clone().add(lookTargetOffset));
        const desiredOrientation=this.camera.quaternion.clone();
        this.camera.quaternion.copy(oldOrientation).slerp(desiredOrientation,1-Math.exp(-delta*12));if(this.currentCameraMode==='cockpit'){this.lastCameraRoll=this.rollVisual||0;this.camera.rotateZ(this.lastCameraRoll);}
        this.cameraTransitionRemaining=Math.max(0,(this.cameraTransitionRemaining||0)-delta);
      }

      // Mantener la cúpula celeste centrada en la nave para un horizonte infinito inalcanzable
      if (this.skyDome) {
        this.skyDome.position.copy(this.shipGroup.position);
        /* Stable celestial orientation. */
      }
    }

    if (this.warpLinesMesh) {
      const showLines = boosting || (this.shipSpeed > 50 && this.currentCameraMode === 'cockpit');
      this.warpLinesMesh.visible = showLines;
      if (showLines) {
        this.warpLinesMesh.position.copy(this.currentCameraMode === 'cockpit' || !this.shipGroup ? this.camera.position : this.shipGroup.position);
        this.warpLinesMesh.quaternion.copy(this.shipGroup.quaternion);
        if (this.warpLinesMesh.material) {
          this.warpLinesMesh.material.opacity = THREE.MathUtils.lerp(
            this.warpLinesMesh.material.opacity,
            boosting ? 0.75 : 0.3,
            1 - Math.exp(-delta * 8)
          );
        }
      }
    }

    // 5. Animación de Discos y Galaxias de los Monumentos
    if (this.starfieldMesh) this.starfieldMesh.position.copy(this.camera.position);
    this.updateLandmarkAnimations(delta);
    this.landmarks.forEach(l=>window.PlanetEnvironments?.animate(l.meshGroup,delta));
    window.ExpeditionSystems?.update(this,delta);
    window.ExpeditionApproach?.update(this);
    window.CruiseSystems?.update(this,delta);
    window.PlanetNavigation?.update(this,delta);

    // 6. Detección en tiempo real del objeto observado
    this.updateLandmarkDetection();
    if(window.AutoPlanetFacts){
      if(!this.planetProximity)this.planetProximity=window.AutoPlanetFacts.create();
      const bodies=this.colliders.filter(body=>body.planetKey).map(body=>({...body,center:body.mesh.getWorldPosition(new THREE.Vector3()),radius:body.radius*Math.max(...body.mesh.getWorldScale(new THREE.Vector3()).toArray())}));
      this.planetProximity.update(this.shipGroup.position,bodies,{muted:this.isVoiceMuted||!!window.spaceAudio?.isMuted,busy:!!window.planetNarrator?.isSpeaking||!!window.sofiaTragedy?.isActive});
    }

    // 7. Telemetría del HUD
    if (this.ui.speedValue) {
      this.ui.speedValue.textContent = `${Math.round(Math.hypot(this.linearVelocity?.x||0,this.linearVelocity?.y||0,this.linearVelocity?.z||0))} km/s${this.cruiseActive ? " · CRUCERO" : ""}`;
    }
    const height = document.getElementById('hud-explorer-height');
    if (height) height.textContent = `${this.shipGroup.position.y.toFixed(1)} u · vertical ${Math.round(this.verticalSpeed || 0)} u/s`;
    if (this.ui.warpIndicator) {
      this.ui.warpIndicator.className = this.isWarpActive ? 'hud-warp-tag active' : 'hud-warp-tag';
      this.ui.warpIndicator.textContent = this.isWarpActive ? 'WARP HIPERLUMÍNICO ACTIVO' : 'SUB-LUZ CRUCERO';
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateLandmarkAnimations(delta) {
    this._cosmicAnimTime = (this._cosmicAnimTime || 0) + delta;
    const t = this._cosmicAnimTime;
    this.landmarks.forEach(lm => {
      if (lm.meshGroup && lm.meshGroup.userData) {
        const ud = lm.meshGroup.userData;
        if (ud.disk) {
          ud.disk.rotation.z -= delta * 0.9;
        }
        if (ud.galaxy) {
          ud.galaxy.rotation.z += delta * 0.12;
        }
        if (ud.galaxyKnots) {
          ud.galaxyKnots.rotation.y += delta * 0.16;
        }
        if (ud.galaxyHalo) {
          const s = 1 + Math.sin(t * 1.8) * 0.045;
          ud.galaxyHalo.scale.set(s, s, s);
        }
        if (ud.nebulaFilaments) {
          ud.nebulaFilaments.rotation.z -= delta * 0.09;
        }
        if (ud.outerRing) {
          ud.outerRing.rotation.z += delta * 0.05;
        }
        if (ud.nebulaVeil) {
          ud.nebulaVeil.rotation.y += delta * 0.04;
        }
        if (ud.s2Star && this.clock) {
          const time = this.clock.getElapsedTime();
          ud.s2Star.position.x = Math.cos(time * 0.8) * 550;
          ud.s2Star.position.z = Math.sin(time * 0.8) * 550;
        }
        if (ud.asteroidBelt) {
          ud.asteroidBelt.rotation.y += delta * 0.012;
        }
      }
    });
    if (this.explorationNebulae) {
      const boostGlow = this.isWarpActive ? 0.35 : (this.shipSpeed > 80 ? 0.18 : 0);
      this.explorationNebulae.children.forEach((n, i) => {
        n.rotation.y += delta * 0.012 * (i % 2 ? 1 : -1);
        n.rotation.z += delta * 0.005 * (i % 3 === 0 ? 1 : -1);
        const pulse = 0.48 + 0.22 * Math.sin(t * 1.8 + i * 1.5) + boostGlow;
        n.traverse(o => {
          if (o.isPoints && o.material) {
            o.material.opacity = Math.min(0.88, pulse);
          }
        });
      });
      if (this.cenAGalaxy) {
        this.cenAGalaxy.rotation.z += delta * 0.003;
      }
    }

  }

  updatePaused() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    window.Fluidity?.frame(this.renderer, delta);
    if(document.getElementById("stellar-map")?.open||window.ExplorationUpgrades?.open||window.missionChallenges?.active){this.keys={};this.renderer.render(this.scene,this.camera);return;}
    if(window.RescueFleet?.animateDock(this,delta)){this.renderer.render(this.scene,this.camera);return;}
    window.ReactiveFlight?.update(this,delta);
    window.CruiseSystems?.input(this,delta);
    if(this.scienceScan){this.keys={};this.cruiseActive=false;this.linearVelocity={x:0,y:0,z:0};this.shipSpeed=0;this.verticalSpeed=0;}
    this.updateLandmarkAnimations(delta);
    this.renderer.render(this.scene, this.camera);
  }

  startExploration() {
    this.isActive = true;
    this.clock.start();
    this.shipSpeed = 0; this.verticalSpeed = 0; this.keys = {}; this.isWarpActive = false; this.cruiseActive=false; this.linearVelocity={x:0,y:0,z:0};this._boostReturnSpeed=null; this.pendingYaw=0; this.pendingPitch=0; this.turnVelocity=0;
    if (this.ui.voiceStatusText) this.ui.voiceStatusText.textContent = this.isVoiceMuted?'SILENCIADA':'ACTIVA';
    document.body.classList.add('exploring-space');
    if (this.ui.screen) this.ui.screen.classList.add('active');
    this.onResize();

    // Posición inicial cerca del Sistema Solar mirando hacia el centro galáctico
    if (this.shipGroup) {
      this.shipGroup.position.set(0, 0, 2600);
      this.cameraYaw = 0;
      this.cameraPitch = 0;
      this.camera.position.set(0, 9, 2644);
      window.PlanetNavigation?.arrive(this,"earth");
    }

    // Sonido ambiental cósmico si existe
    if (window.spaceAudio && window.spaceAudio.startStrandedAmbientDrone) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.startStrandedAmbientDrone();
    }
  }

  stopExploration() {
    window.ExpeditionSystems?.cancel(this);
    window.ExpeditionSystems?.state.save();
    this.finishCinema();
    this.isActive = false;
    document.body.classList.remove('exploring-space');
    window.planetNarrator?.stop();
    this.jumpCharge = null; this.travelShot = null;
    document.body.classList.remove('cinematic-shot');
    this.keys = {};
    this.isWarpActive = false;
    if (this.ui.screen) this.ui.screen.classList.remove('active');
    window.planetNarrator?.stop();
    if (window.spaceAudio && window.spaceAudio.stopStrandedAmbientDrone) {
      window.spaceAudio.stopStrandedAmbientDrone();
    }
  }

  cycleCameraMode(targetMode = null) {
    if (targetMode && this.cameraModes.includes(targetMode)) {
      this.currentCameraMode = targetMode;
    } else {
      this.currentCameraMode = this.currentCameraMode === 'cockpit' ? 'chase' : 'cockpit';
    }

    this.cameraTransitionRemaining = .65;

    const labels = {
      chase: 'PERSECUCIÓN [V]',
      top: 'DESDE ARRIBA [V]',
      bottom: 'DESDE ABAJO [V]',
      cockpit: 'CABINA [V]',
      far: 'MUY LEJOS [V]'
    };

    const label = labels[this.currentCameraMode] || this.currentCameraMode.toUpperCase();
    const globalLabel = document.getElementById('global-cam-label');
    if (globalLabel) globalLabel.textContent = label.replace(' [V]', '');

    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.playCosmicVastnessChime();
    }
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

window.SpaceExplorationEngine = SpaceExplorationEngine;
