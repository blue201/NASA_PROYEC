/* ==========================================================================
   NASA ODYSSEY // PLANET SMASH 3D INTERACTIVE PREVIEWER (ORRERY & EARTH ORIGIN)
   Realistic atmosphere scattering, day/night terminator & 360° orbital controls
   ========================================================================== */

class PlanetViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.activePlanetMesh = null;
    this.cloudsMesh = null;
    this.cloudShadowMesh = null;
    this.atmosphereGlowMesh = null;
    this.ringsMesh = null;
    this.moonsGroup = null;
    this.moons = [];
    this.asteroidsGroup = null;
    this.orbitingAsteroids = [];
    this.asteroidDustMesh = null;
    this.starsMesh = null;
    this.sunLight = null;
    this.currentPlanetKey = 'earth';
    this.isPaused = false;
    this.clock = new THREE.Clock();
    this.dronesGroup = null;
    this.activeDrones = [];
    this.droneScanTimer = null;
    this.isCinematicTourActive = false;
    this.cinematicTime = 0;
    this.currentWaypointIdx = 0;
    this.cinematicWaypoints = null;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    // Fondo Cósmico Panorámico Fotorrealista de Alta Resolución (JWST Deep Cosmic Field)
    if (window.nasaApi && window.nasaApi.createCosmicSkyboxTexture) {
      this.scene.background = window.nasaApi.createCosmicSkyboxTexture('assets/milky-way-eso.jpg');
    } else {
      this.scene.fog = new THREE.FogExp2(0x020617, 0.0004);
    }

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 14000);
    this.camera.position.set(0, 4, 25);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    this.planetContainer = new THREE.Group();
    this.scene.add(this.planetContainer);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.enableRotate = false; // El arrastre rota el planeta de forma táctil en 360° sin desincronización de cámara
      this.controls.enableZoom = true;    // Zoom suave con rueda de ratón o gesto táctil
      this.controls.minDistance = 6;
      this.controls.maxDistance = 85;
      this.controls.enablePan = false;
      this.controls.autoRotate = false;
    }

    // Nave Arwing de Misión en Patrulla Orbital alrededor del Planeta
    this.orbitalShip = null;
    this.orbitalShipAngle = 0;
    this.orbitalShipRadius = 13.0;
    if (window.ArwingShip) {
      try {
        this.orbitalShip = new window.ArwingShip({ scale: 0.14 });
        this.scene.add(this.orbitalShip.mesh);
      } catch (err) {
        console.warn('Orbital Arwing init note:', err);
      }
    }

    // Modos de Perspectiva de Cámara (Ciclo con tecla V / C)
    this.cameraModes = ['orbit', 'top', 'bottom', 'cockpit', 'far'];
    this.currentCameraMode = 'orbit';

    // Luz solar dirigida creando el terminador día/noche hiperrealista
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.65);
    this.sunLight.position.set(55, 20, 40);
    this.scene.add(this.sunLight);

    const ambientLight = new THREE.AmbientLight(0xbfc7d0, 0.24);
    this.scene.add(ambientLight);

    // Sol con corona estelar en el fondo del espacio
    const sunGeo = new THREE.SphereGeometry(18, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(520, 190, 380);
    this.scene.add(sunMesh);

    // Corona solar radial
    const coronaGeo = new THREE.SphereGeometry(36, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    coronaMesh.position.copy(sunMesh.position);
    this.scene.add(coronaMesh);

    // Fondo estelar tridimensional de alta densidad
    this.createPhotorealisticStarfield();

    // Comenzar SIEMPRE en la Tierra como origen
    this.loadPlanet('earth');

    this.setupDirectDragControls();

    window.addEventListener('resize', () => this.onWindowResize());
    this.update();
  }

  setupDirectDragControls() {
    this.isDirectDragging = false;
    this.prevDragX = 0;
    this.prevDragY = 0;
    this.dragVelocityX = 0;
    this.dragVelocityY = 0;

    const onPointerDown = (e) => {
      if(this.isDirectDragging||!document.getElementById('planet-selection-screen')?.classList.contains('active'))return;
      if (this.isPaused || this.isCinematicTourActive || (e.button !== undefined && e.button !== 0)) return;
      // No interferir con botones, selectores, pestañas o modales interactivos
      if (e.target.closest('button, a, input, select, textarea, summary, details, .interactive-panel, .nasa-topbar, .modal, .planet-info-panel, .planet-selector-carousel, #starfox-radio-box, #captain-padd-modal, .drone-scan-hud, .qte-card, .cam-switch-pill')) return;
      this.viewTransition=null;
      this.isDirectDragging = true;this.dragPointerId=e.pointerId;this.renderer.domElement.setPointerCapture?.(e.pointerId);e.preventDefault();
      this.dragVelocityX = 0;
      this.dragVelocityY = 0;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.prevDragX = clientX;
      this.prevDragY = clientY;
      if (document.body) document.body.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!this.isDirectDragging || this.isPaused || (this.dragPointerId!==undefined&&e.pointerId!==this.dragPointerId)) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - this.prevDragX;
      const deltaY = clientY - this.prevDragY;
      this.prevDragX = clientX;
      this.prevDragY = clientY;

      // Rotación esférica fluida 360° en horizontal y vertical sin bloqueos
      const rotSpeed = 0.0075;
      this.dragVelocityX = deltaX * rotSpeed;
      this.dragVelocityY = deltaY * rotSpeed;

      if (this.planetContainer) {
        this.rotatePlanet(deltaX*rotSpeed,deltaY*rotSpeed);
      }
    };

    const onPointerUp = () => {
      if(this.dragPointerId!==undefined&&this.renderer.domElement.hasPointerCapture?.(this.dragPointerId))this.renderer.domElement.releasePointerCapture(this.dragPointerId);this.dragPointerId=undefined;
      this.isDirectDragging = false;
      if (document.body) document.body.style.cursor = 'default';
    };

    window.addEventListener('pointerdown', onPointerDown);
    this.renderer.domElement.addEventListener('lostpointercapture',onPointerUp);
    this.renderer.domElement.style.touchAction = 'none';
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('blur', onPointerUp);


  }

  rotatePlanet(dx,dy){
    const up=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),right=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion);
    const axis=up.multiplyScalar(dx).add(right.multiplyScalar(dy)),angle=axis.length();if(angle>0)this.planetContainer.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis.normalize(),angle));this.planetContainer.quaternion.normalize();
  }
  createPhotorealisticStarfield() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2200;
      positions[i + 1] = (Math.random() - 0.5) * 2200;
      positions[i + 2] = (Math.random() - 0.5) * 2200;

      const pType = Math.random();
      if (pType > 0.82) {
        colors[i] = 0.75; colors[i + 1] = 0.88; colors[i + 2] = 1.0; // Estrellas clase O/B azules
      } else if (pType < 0.18) {
        colors[i] = 1.0; colors[i + 1] = 0.82; colors[i + 2] = 0.55; // Gigantes rojas/ámbar
      } else {
        colors[i] = 0.98; colors[i + 1] = 0.98; colors[i + 2] = 0.98; // Soles blancos clase G
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.8,
      map: window.CinematicVisuals.stellarMap(),
      depthWrite: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.35
    });

    this.starsMesh = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starsMesh);
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

  loadPlanet(planetKey) {
    if (this._customPlanetTexture) {
      this._customPlanetTexture.dispose();
      this._customPlanetTexture = null;
    }
    this._textureRequest = (this._textureRequest || 0) + 1;
    this.currentPlanetKey = planetKey;
    const data = NASA_PLANETARY_DATABASE[planetKey] || NASA_PLANETARY_DATABASE.earth;
    if (this.currentCameraMode === 'orbit' && this.camera) {
      const targetPos = new THREE.Vector3(0, 7, data.hasRings ? 43 : 29);
      const startPos = new THREE.Vector3(0, 10.5, (data.hasRings ? 43 : 29) * 1.42);
      this.viewTransition = { from: startPos, to: targetPos, elapsed: 0 };
      this.camera.position.copy(startPos);
      this.camera.lookAt(0, 0, 0);
    }

    if (this.planetContainer) {
      this.planetContainer.rotation.set(0, 0, 0);
    }
    this.dragVelocityX = 0;
    this.dragVelocityY = 0;

    if (this.planetTiltGroup) {
      this.disposeHierarchy(this.planetTiltGroup);
      if (this.planetContainer) this.planetContainer.remove(this.planetTiltGroup);
      this.scene.remove(this.planetTiltGroup);
      this.planetTiltGroup = null;
    }
    if (this.activePlanetMesh) {
      this.disposeHierarchy(this.activePlanetMesh);
      this.scene.remove(this.activePlanetMesh);
      this.activePlanetMesh = null;
    }
    if (this.cloudsMesh) {
      this.disposeHierarchy(this.cloudsMesh);
      this.scene.remove(this.cloudsMesh);
      this.cloudsMesh = null;
    }
    if (this.cloudShadowMesh) {
      this.disposeHierarchy(this.cloudShadowMesh);
      this.scene.remove(this.cloudShadowMesh);
      this.cloudShadowMesh = null;
    }
    if (this.atmosphereGlowMesh) {
      this.disposeHierarchy(this.atmosphereGlowMesh);
      if (this.planetContainer) this.planetContainer.remove(this.atmosphereGlowMesh);
      this.scene.remove(this.atmosphereGlowMesh);
      this.atmosphereGlowMesh = null;
    }
    if (this.ringsMesh) {
      this.disposeHierarchy(this.ringsMesh);
      this.scene.remove(this.ringsMesh);
      this.ringsMesh = null;
    }
    if (this.moonsGroup) {
      this.disposeHierarchy(this.moonsGroup);
      this.scene.remove(this.moonsGroup);
      this.moonsGroup = null;
      this.moons = [];
    }
    if (this.asteroidsGroup) {
      this.disposeHierarchy(this.asteroidsGroup);
      this.scene.remove(this.asteroidsGroup);
      this.asteroidsGroup = null;
      this.orbitingAsteroids = [];
      this.asteroidDustMesh = null;
    }
    if (this.blackHoleGroup) {
      this.disposeHierarchy(this.blackHoleGroup);
      if (this.planetContainer) this.planetContainer.remove(this.blackHoleGroup);
      this.scene.remove(this.blackHoleGroup);
      this.blackHoleGroup = null;
      this.accretionDiskMesh = null;
      this.photonRingMesh = null;
      this.jetTop = null;
      this.jetBottom = null;
    }
    if (this.dronesGroup) {
      if (this.droneScanTimer) {
        clearInterval(this.droneScanTimer);
        this.droneScanTimer = null;
      }
      this.disposeHierarchy(this.dronesGroup);
      this.scene.remove(this.dronesGroup);
      this.dronesGroup = null;
      this.activeDrones = [];
    }

    // Si es un Agujero Negro, construir modelo relativista completo (Horizonte, Disco de Acreción y Chorros)
    if (data.isBlackHole) {
      this.buildBlackHoleVisual(data);
      this.buildPlanetMoons(planetKey, data);
      this.buildOrbitingAsteroids(planetKey, data);
      return;
    }

    if (data.isDeepSpaceNebula) {
      this.planetTiltGroup = window.WorldVisuals.createNebula(7);
      this.planetContainer.add(this.planetTiltGroup);
      return;
    }

    let texture = null;
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
      default: texture = window.nasaApi.createEarthTexture();
    }

    if (texture) {
      texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      texture.encoding = THREE.sRGBEncoding;
    }

    const planetRadius = planetKey === 'pillars_of_creation' ? 8.5 : 6.2;
    const geometry = new THREE.SphereGeometry(planetRadius, 96, 96);

    const bumpMap = null; // Do not add invented relief to mapped geography.
    const specularRoughness = null; // The old procedural ocean mask did not match the geographic map.
    const nightLights = (planetKey === 'earth' && window.nasaApi) ? window.nasaApi.createEarthNightLightsTexture() : null;

    const materialConfig = {
      map: texture,
      roughness: planetKey === 'earth' ? 0.62 : 0.86,
      metalness: 0.0,
      envMapIntensity: 1.5
    };

    if (bumpMap) {
      materialConfig.bumpMap = bumpMap;
      materialConfig.bumpScale = planetKey === 'mars' ? 0.12 : (planetKey === 'moon' ? 0.14 : (planetKey === 'mercury' ? 0.58 : (planetKey === 'earth' ? 0.42 : 0.35)));
    }
    if (specularRoughness) {
      materialConfig.roughnessMap = specularRoughness;
    }
    if (nightLights) {
      materialConfig.emissiveMap = nightLights;
      materialConfig.emissive = new THREE.Color(0xffe066);
      materialConfig.emissiveIntensity = 0.85;
    }

    const material = new THREE.MeshStandardMaterial(materialConfig);
    this.activePlanetMesh = new THREE.Mesh(geometry, material);
    this._originalPlanetTexture = texture;

    // Grupo con Inclinación Axial Científica de la NASA
    this.planetTiltGroup = new THREE.Group();
    const tiltZ = THREE.MathUtils.degToRad(data.axialTiltDeg || 0);
    this.planetTiltGroup.rotation.z = tiltZ;
    const oblate = ({ jupiter: 0.935, saturn: 0.902, uranus: 0.977, neptune: 0.983 })[planetKey];
    if (oblate) this.activePlanetMesh.scale.y = oblate;
    this.planetTiltGroup.add(this.activePlanetMesh);

    // Capa de nubes dinámica acoplada a la inclinación axial con sombras sobre el relieve (Idea 1)
    if ((planetKey === 'earth' || planetKey === 'venus' || planetKey === 'mars') && (data.hasClouds || planetKey !== 'earth')) {
      const cloudTex = window.nasaApi.createCloudTexture();
      if (cloudTex) {
        cloudTex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
        cloudTex.encoding = THREE.sRGBEncoding;
      }

      // 1. Sombra de nubes proyectada sobre la corteza continental y oceánica
      const cloudShadowGeo = new THREE.SphereGeometry(planetRadius * 1.003, 96, 96);
      const cloudShadowMat = new THREE.MeshBasicMaterial({
        map: cloudTex,
        color: 0x020617,
        transparent: true,
        opacity: planetKey === 'venus' ? 0.35 : planetKey === 'mars' ? 0.16 : 0.42,
        depthWrite: false
      });
      this.cloudShadowMesh = new THREE.Mesh(cloudShadowGeo, cloudShadowMat);
      this.planetTiltGroup.add(this.cloudShadowMesh);

      // 2. Capa de nubes iluminada físicamente por el Sol
      const cloudGeo = new THREE.SphereGeometry(planetRadius * 1.018, 96, 96);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        color: planetKey === 'venus' ? 0xfbe2a2 : planetKey === 'mars' ? 0xe59a6d : 0xffffff,
        transparent: true,
        opacity: planetKey === 'venus' ? 0.55 : planetKey === 'mars' ? 0.28 : 0.74,
        roughness: 0.88,
        metalness: 0.02
      });
      this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.planetTiltGroup.add(this.cloudsMesh);
    }

    // Anillos 3D ecuatoriales para Saturno, Urano y Júpiter alineados con el eje de inclinación axial
    if (data.hasRings || planetKey === 'uranus' || planetKey === 'jupiter') {
      const innerScale = planetKey === 'uranus' ? 1.42 : planetKey === 'jupiter' ? 1.28 : 1.35;
      const outerScale = planetKey === 'uranus' ? 1.98 : planetKey === 'jupiter' ? 1.62 : 2.35;
      const ringGeo = window.WorldVisuals.createRings(planetRadius * innerScale, planetRadius * outerScale);
      const ringsTex = window.nasaApi.createSaturnRingsTexture();
      if (ringsTex) {
        ringsTex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
        ringsTex.encoding = THREE.sRGBEncoding;
      }
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringsTex,
        color: planetKey === 'uranus' ? 0x99f6e4 : planetKey === 'jupiter' ? 0xd6bfa2 : 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: planetKey === 'uranus' ? 0.52 : planetKey === 'jupiter' ? 0.26 : 0.95
      });
      this.ringsMesh = new THREE.Mesh(ringGeo, ringMat);
      this.planetTiltGroup.add(this.ringsMesh);
    }

    // Auroras polares magnéticas en Tierra y gigantes gaseosos/helados
    if (['earth', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(planetKey)) {
      const auroraCol = planetKey === 'jupiter' ? 0x60f0ff : planetKey === 'saturn' ? 0xc084fc : planetKey === 'earth' ? 0x4ade80 : 0x67e8f9;
      for (const pole of [-1, 1]) {
        const auroraRing = new THREE.Mesh(
          new THREE.TorusGeometry(planetRadius * 0.34, planetRadius * 0.024, 12, 64),
          new THREE.MeshBasicMaterial({ color: auroraCol, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        auroraRing.rotation.x = Math.PI / 2;
        auroraRing.position.y = pole * planetRadius * (oblate || 1) * 0.92;
        this.planetTiltGroup.add(auroraRing);
      }
    }

    if (this.planetContainer) {
      this.planetContainer.add(this.planetTiltGroup);
    } else {
      this.scene.add(this.planetTiltGroup);
    }

    if (planetKey !== 'moon' && planetKey !== 'mercury') {
    // Atmósfera estilizada orientada hacia el Sol
    const glowGeo = new THREE.SphereGeometry(planetRadius * (planetKey === 'mars' ? 1.008 : 1.025), 64, 64);
    const sunDirNorm = this.sunLight ? this.sunLight.position.clone().normalize() : new THREE.Vector3(1, 0.4, 0.8).normalize();
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(data.atmosphereColor || 0x38bdf8) },
        sunDirection: { value: sunDirNorm }
      },
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform vec3 sunDirection;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          // Borde tangencial Fresnel
          float fresnel = 1.0 - abs(dot(normalize(vWorldNormal), normalize(vViewDir)));
          fresnel = pow(fresnel, 2.8);

          // Iluminación solar (Rayleigh limb scattering en el lado iluminado)
          float sunCos = dot(vWorldNormal, sunDirection);
          float sunFactor = smoothstep(-0.25, 0.45, sunCos);

          // Anillo crepuscular rojizo en el terminador día/noche
          float twilight = smoothstep(-0.2, 0.1, sunCos) * (1.0 - smoothstep(0.05, 0.4, sunCos));
          vec3 twilightCol = vec3(1.0, 0.45, 0.15); // Atardecer/amanecer

          vec3 finalColor = mix(glowColor, twilightCol, twilight * 0.6);
          float alpha = fresnel * (sunFactor * 0.3 + twilight * 0.12);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    this.atmosphereGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    if (this.planetContainer) {
      this.planetContainer.add(this.atmosphereGlowMesh);
    } else {
      this.scene.add(this.atmosphereGlowMesh);
    }

    }

    // Construcción de Lunas Naturales y Enjambre de Pequeños Asteroides Orbitales
    this.buildPlanetMoons(planetKey, data);
    this.buildOrbitingAsteroids(planetKey, data);
  }

  /* ========================================================================
     MODELADO 3D RELATIVISTA DE AGUJERO NEGRO (EVENT HORIZON, DISCO Y CHORROS)
     ======================================================================== */
  buildBlackHoleVisual(data) {
    this.blackHoleGroup = new THREE.Group();

    // 1. Horizonte de Sucesos (Esfera de Negrura Absoluta de Schwarzschild)
    const horizonGeo = new THREE.SphereGeometry(5.2, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    this.blackHoleGroup.add(horizonMesh);

    // 2. Anillo de Fotones (Photon Sphere) incandescente
    const photonRingGeo = new THREE.TorusGeometry(5.48, 0.12, 16, 120);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.photonRingMesh = new THREE.Mesh(photonRingGeo, photonRingMat);
    this.photonRingMesh.rotation.x = Math.PI / 2.3;
    this.blackHoleGroup.add(this.photonRingMesh);

    // 3. Disco de Acreción Ecuatorial Principal con Doppler Beaming
    const diskGeo = new THREE.RingGeometry(6.2, 19.5, 96);
    diskGeo.rotateX(Math.PI / 2.3);
    const diskMat = new THREE.MeshBasicMaterial({
      map: window.nasaApi.createBlackHoleDiskTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.accretionDiskMesh = new THREE.Mesh(diskGeo, diskMat);
    this.blackHoleGroup.add(this.accretionDiskMesh);

    // 4. Lente Gravitacional de Einstein (Arco de luz curvado por encima del agujero)
    const lensArcGeo = new THREE.RingGeometry(5.6, 16.5, 64, 1, 0, Math.PI);
    const lensArcMat = new THREE.MeshBasicMaterial({
      map: window.nasaApi.createBlackHoleDiskTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    
    this.lensArcTop = new THREE.Mesh(lensArcGeo, lensArcMat);
    this.lensArcTop.rotation.x = -Math.PI / 8;
    this.blackHoleGroup.add(this.lensArcTop);

    this.lensArcBottom = new THREE.Mesh(lensArcGeo.clone(), lensArcMat.clone());
    this.lensArcBottom.rotation.z = Math.PI;
    this.lensArcBottom.rotation.x = Math.PI / 8;
    this.blackHoleGroup.add(this.lensArcBottom);

    // 5. Chorros Relativistas de Plasma Bipolares (Eje perpendicular)
    const jetColor = data.atmosphereColor || 0x00f3ff;
    const jetGeo = new THREE.CylinderGeometry(0.2, 3.8, 48, 32, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: jetColor,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    this.jetTop = new THREE.Mesh(jetGeo, jetMat);
    this.jetTop.position.set(0, 24, 0);
    this.blackHoleGroup.add(this.jetTop);

    this.jetBottom = new THREE.Mesh(jetGeo.clone(), jetMat.clone());
    this.jetBottom.position.set(0, -24, 0);
    this.jetBottom.rotation.x = Math.PI;
    this.blackHoleGroup.add(this.jetBottom);

    // Resplandor gravitacional esférico (Aura)
    const auraGeo = new THREE.SphereGeometry(7.5, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: data.atmosphereColor || 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    this.atmosphereGlowMesh = new THREE.Mesh(auraGeo, auraMat);
    this.blackHoleGroup.add(this.atmosphereGlowMesh);

    if (this.planetContainer) {
      this.planetContainer.add(this.blackHoleGroup);
    } else {
      this.scene.add(this.blackHoleGroup);
    }
  }

  /* ========================================================================
     DATOS HISTÓRICOS Y CIENTÍFICOS DE LUNAS NATURALES POR PLANETA
     ======================================================================== */
  getPlanetaryMoonsData(planetKey) {
    const list = [];
    switch (planetKey) {
      case 'earth':
        list.push({
          name: 'La Luna',
          radius: 1.18,
          distance: 14.8,
          speed: 0.0065,
          angle: 0.8,
          inclination: 0.09,
          textureFn: () => window.nasaApi.createMoonTexture(),
          color: 0xd1d5db,
          isRock: false
        });
        break;
      case 'mars':
        list.push({
          name: 'Fobos',
          radius: 0.44,
          distance: 9.8,
          speed: 0.019,
          angle: 0.6,
          inclination: 0.02,
          textureFn: () => window.nasaApi.createAsteroidRockTexture(),
          color: 0x78716c,
          isRock: true
        });
        list.push({
          name: 'Deimos',
          radius: 0.3,
          distance: 14.6,
          speed: 0.012,
          angle: 3.4,
          inclination: 0.04,
          textureFn: () => window.nasaApi.createAsteroidRockTexture(),
          color: 0xa8a29e,
          isRock: true
        });
        break;
      case 'jupiter':
        list.push({
          name: 'Ío (Volcánica)',
          radius: 0.95,
          distance: 10.6,
          speed: 0.022,
          angle: 0.7,
          inclination: 0.01,
          textureFn: () => window.nasaApi.createIoTexture(),
          color: 0xfacc15,
          isRock: false
        });
        list.push({
          name: 'Europa (Criogénica)',
          radius: 0.84,
          distance: 13.8,
          speed: 0.016,
          angle: 2.3,
          inclination: 0.02,
          textureFn: () => window.nasaApi.createEuropaTexture(),
          color: 0xf8fafc,
          isRock: false
        });
        list.push({
          name: 'Ganimedes',
          radius: 1.38,
          distance: 18.2,
          speed: 0.011,
          angle: 4.2,
          inclination: 0.01,
          textureFn: () => window.nasaApi.createMoonTexture(),
          color: 0x94a3b8,
          isRock: false
        });
        list.push({
          name: 'Calisto',
          radius: 1.22,
          distance: 23.5,
          speed: 0.007,
          angle: 5.7,
          inclination: 0.015,
          textureFn: () => window.nasaApi.createMoonTexture(),
          color: 0x64748b,
          isRock: false
        });
        break;
      case 'saturn':
        list.push({
          name: 'Mimas',
          radius: 0.38,
          distance: 16.5,
          speed: 0.021,
          angle: 1.2,
          inclination: 0.02,
          textureFn: () => window.nasaApi.createMoonTexture(),
          color: 0xe2e8f0,
          isRock: true
        });
        list.push({
          name: 'Encélado',
          radius: 0.48,
          distance: 19.8,
          speed: 0.015,
          angle: 3.6,
          inclination: 0.01,
          textureFn: () => window.nasaApi.createEuropaTexture(),
          color: 0x38bdf8,
          isRock: false
        });
        list.push({
          name: 'Titán (Metano)',
          radius: 1.32,
          distance: 25.5,
          speed: 0.008,
          angle: 5.1,
          inclination: 0.04,
          textureFn: () => window.nasaApi.createTitanTexture(),
          color: 0xf59e0b,
          isRock: false
        });
        break;
      case 'uranus': return [];
      case 'neptune':
        list.push({
          name: 'Proteo',
          radius: 0.44,
          distance: 10.8,
          speed: 0.017,
          angle: 1.9,
          inclination: 0.05,
          textureFn: () => window.nasaApi.createMoonTexture(),
          color: 0x64748b,
          isRock: true
        });
        list.push({
          name: 'Tritón (Retrógrada)',
          radius: 1.12,
          distance: 16.5,
          speed: -0.011, // Órbita retrógrada real en sentido opuesto
          angle: 4.6,
          inclination: 2.65, // Inclinación axial extrema
          textureFn: () => window.nasaApi.createTritonTexture(),
          color: 0xc4b5fd,
          isRock: false
        });
        break;
      case 'venus':
        list.push({
          name: 'Zoozve (Cuasi-satélite 2002 VE68)',
          radius: 0.4,
          distance: 11.8,
          speed: 0.013,
          angle: 2.1,
          inclination: 0.16,
          textureFn: () => window.nasaApi.createAsteroidRockTexture(),
          color: 0xd97706,
          isRock: true
        });
        break;
      case 'mercury':
        list.push({
          name: 'Hermes (Asteroide Co-orbital)',
          radius: 0.36,
          distance: 10.4,
          speed: 0.016,
          angle: 1.5,
          inclination: 0.22,
          textureFn: () => window.nasaApi.createAsteroidRockTexture(),
          color: 0x9ca3af,
          isRock: true
        });
        break;
      case 'moon':
        list.push({
          name: 'Kamoʻoalewa (Fragmento Lunar)',
          radius: 0.32,
          distance: 10.0,
          speed: 0.015,
          angle: 3.2,
          inclination: 0.18,
          textureFn: () => window.nasaApi.createAsteroidRockTexture(),
          color: 0xcbd5e1,
          isRock: true
        });
        break;
      case 'sagittarius_a':
        list.push({
          name: 'Estrella S2 Relativista',
          radius: 0.9,
          distance: 22.5,
          speed: 0.019,
          angle: 1.3,
          inclination: 0.32,
          color: 0x93c5fd,
          isStar: true
        });
        list.push({
          name: 'Filamento G2 (Espaguetización)',
          radius: 0.52,
          distance: 14.5,
          speed: 0.027,
          angle: 4.2,
          inclination: 0.18,
          color: 0xf97316,
          isStar: true
        });
        break;
      case 'cygnus_x1':
        list.push({
          name: 'Supergigante Azul HDE 226868',
          radius: 1.65,
          distance: 21.5,
          speed: 0.014,
          angle: 2.6,
          inclination: 0.22,
          color: 0x60a5fa,
          isStar: true
        });
        break;
      case 'pillars_of_creation':
        list.push({
          name: 'Protoestrella EGG-1',
          radius: 0.75,
          distance: 19.5,
          speed: 0.009,
          angle: 1.8,
          inclination: 0.26,
          color: 0xfde047,
          isStar: true
        });
        list.push({
          name: 'Glóbulo Gaseoso EGG-2',
          radius: 0.55,
          distance: 26.0,
          speed: 0.006,
          angle: 4.9,
          inclination: 0.36,
          color: 0xc084fc,
          isStar: true
        });
        break;
    }
    return list;
  }

  /* ========================================================================
     GENERADOR PROCEDURAL DE MALLA DE ASTEROIDE IRREGULAR 3D DISPLACED
     ======================================================================== */
  createProceduralAsteroidMesh(size = 0.25, isMetallic = false) {
    const geo = new THREE.DodecahedronGeometry(size, 2);
    const pos = geo.attributes.position;
    const seed = Math.random() * 12;

    for (let i = 0; i < pos.count; i++) {
      let vx = pos.getX(i);
      let vy = pos.getY(i);
      let vz = pos.getZ(i);

      // Elongación orgánica asimétrica de silueta natural
      vx *= (0.85 + Math.sin(seed + i * 0.32) * 0.28);
      vy *= (0.85 + Math.cos(seed + i * 0.44) * 0.28);
      vz *= (0.92 + Math.sin(seed * 0.7 + i * 0.25) * 0.32);

      // Desplazamiento fractal de rugosidad y micro-cráteres
      const noise = 1.0 + Math.sin(vx * 3.6 + seed) * 0.18 + Math.cos(vy * 3.4 + vz * 2.2) * 0.12;
      pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      map: window.nasaApi ? window.nasaApi.createAsteroidRockTexture() : null,
      bumpMap: window.nasaApi ? window.nasaApi.createAsteroidNormalMap() : null,
      bumpScale: 0.08,
      roughness: isMetallic ? 0.38 : 0.82,
      metalness: isMetallic ? 0.68 : 0.12,
      color: isMetallic ? 0xc4cbd5 : 0x9ca3af
    });

    return new THREE.Mesh(geo, mat);
  }

  /* ========================================================================
     CONSTRUCCIÓN DE LUNAS CON ANILLOS DE TRAYECTORIA ORBITAL LUMINOSA
     ======================================================================== */
  buildPlanetMoons(planetKey, data) {
    this.moonsGroup = new THREE.Group();
    this.moons = [];

    const moonDefs = this.getPlanetaryMoonsData(planetKey);
    moonDefs.forEach(def => {
      let moonMesh;
      if (def.isStar) {
        // Objeto emisor de luz (estrella binaria o protoestrella masiva)
        const starGeo = new THREE.SphereGeometry(def.radius, 28, 28);
        const starMat = new THREE.MeshBasicMaterial({
          color: def.color || 0xffffff
        });
        moonMesh = new THREE.Mesh(starGeo, starMat);

        // Corona de halo brillante
        const glowGeo = new THREE.SphereGeometry(def.radius * 1.5, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color: def.color || 0x60a5fa,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending
        });
        moonMesh.add(new THREE.Mesh(glowGeo, glowMat));
      } else if (def.isRock) {
        // Luna irregular rocosa pequeña (tipo Fobos, Deimos, Proteo)
        moonMesh = this.createProceduralAsteroidMesh(def.radius, false);
      } else {
        // Luna esférica mayor con mapeo PBR de alta resolución
        const moonGeo = new THREE.SphereGeometry(def.radius, 48, 48);
        const tex = def.textureFn ? def.textureFn() : window.nasaApi.createMoonTexture();
        const moonMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.75,
          metalness: 0.08
        });
        moonMesh = new THREE.Mesh(moonGeo, moonMat);
      }

      // Anillo de trayectoria orbital 3D semi-transparente
      const orbitPoints = [];
      const segments = 96;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * def.distance;
        const z = Math.sin(theta) * def.distance;
        const y = Math.sin(theta) * (def.distance * Math.tan(def.inclination || 0));
        orbitPoints.push(new THREE.Vector3(x, y, z));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({
        color: def.isStar ? 0x60a5fa : 0x38bdf8,
        transparent: true,
        opacity: 0.26,
        blending: THREE.AdditiveBlending
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      orbitGeo.dispose();orbitMat.dispose(); // No drawn orbital paths.

      // Posicionamiento orbital inicial
      const curX = Math.cos(def.angle) * def.distance;
      const curZ = Math.sin(def.angle) * def.distance;
      const curY = Math.sin(def.angle) * (def.distance * Math.tan(def.inclination || 0));
      moonMesh.position.set(curX, curY, curZ);

      this.moonsGroup.add(moonMesh);

      this.moons.push({
        mesh: moonMesh,
        distance: def.distance,
        speed: def.speed,
        angle: def.angle,
        inclination: def.inclination || 0,
        spinSpeed: 0.012 + Math.random() * 0.015,
        name: def.name
      });
    });

    this.scene.add(this.moonsGroup);
  }

  /* ========================================================================
     CINTURÓN DE PEQUEÑOS ASTEROIDES ORBITALES ALREDEDOR DEL PLANETA
     ======================================================================== */
  buildOrbitingAsteroids(planetKey, data) {
    this.asteroidsGroup = new THREE.Group();
    this.orbitingAsteroids = [];

    const isRinged = planetKey === 'saturn';
    const basePlanetRadius = planetKey === 'pillars_of_creation' ? 8.5 : 6.2;
    // Órbitas más despejadas para permitir contemplar la superficie y atmósfera del planeta
    const minOrbit = basePlanetRadius * 1.6;
    const maxOrbit = basePlanetRadius * 3.4;

    // Cantidad equilibrada de asteroides discretos para que la vista no se sature ni sobrecargue
    const asteroidCount = (planetKey === 'saturn' || planetKey === 'jupiter') ? 10 : (planetKey === 'mars' ? 6 : 4);
    for (let i = 0; i < asteroidCount; i++) {
      const orbitDist = minOrbit + Math.random() * (maxOrbit - minOrbit);
      // Ley de Kepler aproximada: órbitas cercanas viajan más velozmente
      const keplerSpeed = (0.012 / Math.sqrt(orbitDist / basePlanetRadius)) * (0.85 + Math.random() * 0.3);

      const maxInc = isRinged ? 0.05 : 0.22;
      const inclination = (Math.random() - 0.5) * maxInc;
      const angle = Math.random() * Math.PI * 2;

      // Diámetros discretos y proporcionados (0.05 a 0.13) para mantener protagonismo en el planeta
      const size = 0.05 + Math.random() * 0.08;
      const isMetallic = Math.random() < 0.25;

      const asteroidMesh = this.createProceduralAsteroidMesh(size, isMetallic);

      const x = Math.cos(angle) * orbitDist;
      const z = Math.sin(angle) * orbitDist;
      const y = Math.sin(angle) * (orbitDist * Math.tan(inclination)) + (Math.random() - 0.5) * 0.3;
      asteroidMesh.position.set(x, y, z);

      asteroidMesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.asteroidsGroup.add(asteroidMesh);

      this.orbitingAsteroids.push({
        mesh: asteroidMesh,
        distance: orbitDist,
        speed: keplerSpeed,
        angle: angle,
        inclination: inclination,
        rotX: (Math.random() - 0.5) * 0.025,
        rotY: (Math.random() - 0.5) * 0.035,
        rotZ: (Math.random() - 0.5) * 0.020
      });
    }

    // Polvo orbital centelleante ligero y limpio (reducido a 60 para evitar sobrecarga)
    const dustCount = 60;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const dDist = minOrbit + Math.random() * (maxOrbit - minOrbit);
      const dAngle = Math.random() * Math.PI * 2;
      const dInc = (Math.random() - 0.5) * (isRinged ? 0.04 : 0.20);

      const dx = Math.cos(dAngle) * dDist + (Math.random() - 0.5) * 0.5;
      const dz = Math.sin(dAngle) * dDist + (Math.random() - 0.5) * 0.5;
      const dy = Math.sin(dAngle) * (dDist * Math.tan(dInc)) + (Math.random() - 0.5) * 0.5;

      dustPositions[i * 3] = dx;
      dustPositions[i * 3 + 1] = dy;
      dustPositions[i * 3 + 2] = dz;

      const brightness = 0.55 + Math.random() * 0.45;
      dustColors[i * 3] = brightness * 0.9;
      dustColors[i * 3 + 1] = brightness * 0.85;
      dustColors[i * 3 + 2] = brightness * 0.75;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.10,
      vertexColors: true,
      transparent: true,
      opacity: 0.60,
      blending: THREE.AdditiveBlending
    });

    this.asteroidDustMesh = new THREE.Points(dustGeo, dustMat);
    this.asteroidsGroup.add(this.asteroidDustMesh);

    this.scene.add(this.asteroidsGroup);
  }

  update() {
    if (this.isPaused) return;
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const frameScale = delta * 60;

    // Inercia de arrastre táctil 360° en gravedad cero
    if (!this.isDirectDragging && (Math.abs(this.dragVelocityX) > 0.00005 || Math.abs(this.dragVelocityY) > 0.00005)) {
      if (this.planetContainer) {
        const displacementScale = (1 - Math.pow(0.93, frameScale)) / (1 - 0.93);
        this.rotatePlanet(this.dragVelocityX*displacementScale,this.dragVelocityY*displacementScale);
      }
      const damping = Math.pow(0.93, frameScale);
      this.dragVelocityX *= damping;
      this.dragVelocityY *= damping;
    }

    const curData = NASA_PLANETARY_DATABASE[this.currentPlanetKey] || NASA_PLANETARY_DATABASE.earth;
    const spinRate = (curData && typeof curData.rotationPeriodHours === 'number' && curData.rotationPeriodHours !== 0) ?
      (0.009 / Math.abs(curData.rotationPeriodHours)) * (curData.rotationPeriodHours < 0 ? -1 : 1) :
      0.0004;

    // Giro axial natural continuo si no se está arrastrando directamente
    if (!this.isDirectDragging && Math.abs(this.dragVelocityX) < 0.0004) {
      if (this.planetContainer) this.planetContainer.rotation.y += spinRate * frameScale;
    }

    if (this.cloudsMesh) this.cloudsMesh.rotation.y += spinRate * 0.35 * frameScale;
    if (this.cloudShadowMesh && this.cloudsMesh) {
      this.cloudShadowMesh.rotation.y = this.cloudsMesh.rotation.y - 0.012;
    }
    if (this.ringsMesh) this.ringsMesh.rotation.z += 0.0004 * frameScale;

    // Actualización orbital y axial continua de las Lunas
    if (this.moons && this.moons.length > 0) {
      this.moons.forEach(m => {
        m.angle += m.speed * frameScale;
        const x = Math.cos(m.angle) * m.distance;
        const z = Math.sin(m.angle) * m.distance;
        const y = Math.sin(m.angle) * (m.distance * Math.tan(m.inclination));
        m.mesh.position.set(x, y, z);
        m.mesh.rotation.y += m.spinSpeed * frameScale;
      });
    }

    // Actualización orbital Kepleriana y volteo 3D de pequeños asteroides
    if (this.orbitingAsteroids && this.orbitingAsteroids.length > 0) {
      this.orbitingAsteroids.forEach(a => {
        a.angle += a.speed * frameScale;
        const x = Math.cos(a.angle) * a.distance;
        const z = Math.sin(a.angle) * a.distance;
        const y = Math.sin(a.angle) * (a.distance * Math.tan(a.inclination));
        a.mesh.position.set(x, y, z);
        a.mesh.rotation.x += a.rotX * frameScale;
        a.mesh.rotation.y += a.rotY * frameScale;
        a.mesh.rotation.z += a.rotZ * frameScale;
      });
    }

    if (this.asteroidDustMesh) {
      this.asteroidDustMesh.rotation.y += 0.0025 * frameScale;
    }

    // Animación física del Agujero Negro y Chorros Relativistas
    if (this.accretionDiskMesh) this.accretionDiskMesh.rotation.z -= 0.014 * frameScale;
    if (this.photonRingMesh) this.photonRingMesh.rotation.z += 0.022 * frameScale;
    if (this.jetTop) {
      const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.12;
      this.jetTop.scale.set(pulse, 1, pulse);
      this.jetBottom.scale.set(pulse, 1, pulse);
    }

    // Actualización orbital y escaneo láser progresivo de los Drones saliendo desde la nave
    if (this.activeDrones && this.activeDrones.length > 0) {
      if (!this._droneScratch) {
        this._droneScratch = {
          origin: new THREE.Vector3(),
          orbit: new THREE.Vector3(),
          mid: new THREE.Vector3(),
          p0: new THREE.Vector3(),
          p1: new THREE.Vector3()
        };
      }
      const sc = this._droneScratch;
      if (this.orbitalShip && this.orbitalShip.mesh && this.orbitalShip.mesh.position) {
        sc.origin.copy(this.orbitalShip.mesh.position);
      } else {
        sc.origin.set(0, 0, 20);
      }
      this.activeDrones.forEach((d, idx) => {
        d.angle += d.speed * frameScale;
        sc.orbit.set(
          Math.cos(d.angle) * d.distance,
          Math.sin(d.angle) * (d.distance * Math.tan(d.inclination)),
          Math.sin(d.angle) * d.distance
        );
        d.launchTime = (d.launchTime || 0) + frameScale / 60;
        const tLocal = Math.max(0, d.launchTime - (d.delay || 0));
        if (tLocal < 0.35) {
          if (!d.launch) d.launch = new THREE.Vector3();
          d.launch.copy(sc.origin).add(new THREE.Vector3((idx - 1) * 0.6, 0.4 + idx * 0.2, 0));
        }
        const launch = Math.max(0, Math.min(1, tLocal / 1.8));
        const smooth = launch * launch * (3 - 2 * launch);
        const startPos = d.launch || sc.origin;
        sc.mid.lerpVectors(startPos, sc.orbit, 0.5).add(new THREE.Vector3((idx - 1) * 3.5, 4.2 + idx * 1.4, 0));
        sc.p0.lerpVectors(startPos, sc.mid, smooth);
        sc.p1.lerpVectors(sc.mid, sc.orbit, smooth);
        d.group.position.lerpVectors(sc.p0, sc.p1, smooth);
        d.group.scale.setScalar(0.35 + smooth * 0.95);
        d.group.lookAt(0, 0, 0); // Apuntar hacia el centro del planeta
        if (d.laserMesh && d.laserMesh.material) {
          d.laserMesh.visible = smooth > 0.68;
          const laserPulse = 0.65 + Math.sin(Date.now() * 0.012 + d.phase) * 0.35;
          d.laserMesh.material.opacity = d.laserTargetOpacity * laserPulse * Math.min(1, Math.max(0, (smooth - 0.68) / 0.32));
        }
        if (d.ionGlow) {
          d.ionGlow.scale.set(1, 1, (smooth < 1 ? 2.4 : 1.7) + Math.sin(d.launchTime * 18 + d.phase) * 0.5);
        }
      });
    }

    // Patrulla orbital de la nave Arwing alrededor del planeta
    if (this.orbitalShip && this.orbitalShip.mesh) {
      this.orbitalShipAngle += 0.006 * frameScale;
      const ox = Math.cos(this.orbitalShipAngle) * this.orbitalShipRadius;
      const oz = Math.sin(this.orbitalShipAngle) * this.orbitalShipRadius;
      const oy = Math.sin(this.orbitalShipAngle * 1.8) * 2.4;
      this.orbitalShip.mesh.position.set(ox, oy, oz);

      // Orientación en la dirección de traslación orbital
      const fx = Math.cos(this.orbitalShipAngle + 0.05) * this.orbitalShipRadius;
      const fz = Math.sin(this.orbitalShipAngle + 0.05) * this.orbitalShipRadius;
      const fy = Math.sin((this.orbitalShipAngle + 0.05) * 1.8) * 2.4;
      this.orbitalShip.mesh.lookAt(fx, fy, fz);

      if (this.orbitalShip.update) {
        this.orbitalShip.update(delta, 30);
      }
    }

    if(this.viewTransition){const t=this.viewTransition;t.elapsed+=delta;const a=Math.min(1,t.elapsed/.65);this.camera.position.lerpVectors(t.from,t.to,a*a*(3-2*a));if(a===1)this.viewTransition=null;}
    // Modo Cámara Cinemática Orbital (Idea 3) vs Control Manual Orbital
    if (this.isCinematicTourActive) {
      this.updateCinematicTour(delta);
    } else if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  // Alternar Modos de Perspectiva de Cámara en el Visor
  cycleCameraMode(targetMode = null) {
    const previousPosition=this.camera.position.clone();
    this.isCinematicTourActive=false;
    this.dragVelocityX=0;this.dragVelocityY=0;
    if (targetMode && this.cameraModes.includes(targetMode)) {
      this.currentCameraMode = targetMode;
    } else {
      const idx = this.cameraModes.indexOf(this.currentCameraMode);
      this.currentCameraMode = this.cameraModes[(idx + 1) % this.cameraModes.length];
    }

    if (this.controls) {
      this.controls.autoRotate = false;
    }

    const labels = {
      orbit: 'ORBITAL LIBRE 360°',
      top: 'DESDE ARRIBA (POLO NORTE)',
      bottom: 'DESDE ABAJO (POLO SUR)',
      cockpit: 'CABINA DE LA NAVE',
      far: 'MUY LEJOS (PANORÁMICA)'
    };

    switch (this.currentCameraMode) {
      case 'top':
        this.camera.position.set(0, 36, 1.5);
        if (this.controls) this.controls.target.set(0, 0, 0);
        break;
      case 'bottom':
        this.camera.position.set(0, -32, 2.5);
        if (this.controls) this.controls.target.set(0, 0, 0);
        break;
      case 'cockpit':
        if (this.orbitalShip && this.orbitalShip.mesh) {
          const sPos = this.orbitalShip.mesh.position;
          this.camera.position.set(sPos.x * 1.3, sPos.y + 1.2, sPos.z * 1.3);
          if (this.controls) this.controls.target.set(0, 0, 0);
        } else {
          this.camera.position.set(0, 3, 14);
          if (this.controls) this.controls.target.set(0, 0, 0);
        }
        break;
      case 'far':
        this.camera.position.set(0, 24, 62);
        if (this.controls) this.controls.target.set(0, 0, 0);
        break;
      case 'orbit':
      default:
        this.camera.position.set(0, 4, 25);
        if (this.controls) {
          this.controls.target.set(0, 0, 0);
          this.controls.autoRotate = false;
        }
        break;
    }

    this.viewTransition={from:previousPosition,to:this.camera.position.clone(),elapsed:0};
    this.camera.position.copy(previousPosition);
    const lbl = labels[this.currentCameraMode] || this.currentCameraMode.toUpperCase();
    const globalLabel = document.getElementById('global-cam-label');
    if (globalLabel) globalLabel.textContent = lbl;

    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.playCosmicVastnessChime();
    }

    return lbl;
  }

  // Controlador de Recorrido Cinemático Orbital Multi-Ángulo (Terminador, Curvatura y Especularidad)
  updateCinematicTour(delta) {
    if (!this.cinematicWaypoints) {
      this.cinematicWaypoints = [
        // 1. Rasante en el terminador día/noche con sombras alargadas del relieve montañoso
        { pos: new THREE.Vector3(7.6, 2.2, 9.2), target: new THREE.Vector3(0.6, 0, 0), fov: 40, duration: 9 },
        // 2. Gran panorámica cósmica global con curvatura planetaria y fondo de la Vía Láctea
        { pos: new THREE.Vector3(0, 16.5, 30), target: new THREE.Vector3(0, 0, 0), fov: 48, duration: 11 },
        // 3. Vuelo orbital polar sobre vórtices y casquetes glaciares
        { pos: new THREE.Vector3(2.8, 14.0, 3.6), target: new THREE.Vector3(0, 3.2, 0), fov: 37, duration: 9 },
        // 4. Rasante ecuatorial con destellos especulares oceánicos y cordilleras
        { pos: new THREE.Vector3(-10.5, 0.8, 6.2), target: new THREE.Vector3(-1.4, 0, 0), fov: 36, duration: 9 }
      ];
      this.currentWaypointIdx = 0;
      this.cinematicTime = 0;
    }

    this.cinematicTime += delta;
    let curWp = this.cinematicWaypoints[this.currentWaypointIdx];
    while (this.cinematicTime >= curWp.duration) {
      this.cinematicTime -= curWp.duration;
      this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.cinematicWaypoints.length;
      curWp = this.cinematicWaypoints[this.currentWaypointIdx];
    }
    const nextIdx = (this.currentWaypointIdx + 1) % this.cinematicWaypoints.length;
    const nextWp = this.cinematicWaypoints[nextIdx];

    const t = Math.min(1.0, this.cinematicTime / curWp.duration);
    // Interpolación suave no lineal (Cosine S-Curve)
    const smoothT = (1 - Math.cos(t * Math.PI)) / 2;

    this.camera.position.lerpVectors(curWp.pos, nextWp.pos, smoothT);
    const curTarget = new THREE.Vector3().lerpVectors(curWp.target, nextWp.target, smoothT);
    this.camera.lookAt(curTarget);
    if (this.controls) this.controls.target.copy(curTarget);

    const targetFov = THREE.MathUtils.lerp(curWp.fov, nextWp.fov, smoothT);
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }

  }

  toggleCinematicTour() {
    this.isCinematicTourActive = !this.isCinematicTourActive;
    if (this.controls) {
      this.controls.autoRotate = !this.isCinematicTourActive;
    }
    const btn = document.getElementById('btn-cinematic-tour');
    if (btn) {
      if (this.isCinematicTourActive) {
        btn.classList.add('bg-cyan-500/30', 'text-cyan-200', 'border-cyan-400');
        btn.innerHTML = '<i class="fas fa-video text-amber-400 animate-pulse"></i> Cinemática: Activa';
      } else {
        btn.classList.remove('bg-cyan-500/30', 'text-cyan-200', 'border-cyan-400');
        btn.innerHTML = '<i class="fas fa-video"></i> Tour Cinemático';
      }
    }
    return this.isCinematicTourActive;
  }

  pause() {
    this.isPaused = true;
    this.clock.stop();
  }

  resume() {
    this.isPaused = false;
    this.clock.start();
  }

  /* ========================================================================
     DESPLIEGUE 3D DE ENJAMBRE DE DRONES DE RECONOCIMIENTO ORBITAL
     Secuencia espacial cinemática: 3 drones de exploración con propulsión iónica,
     conos de escaneo láser volumétrico y transmisión telemétrica en tiempo real
     ======================================================================== */
  deployReconDrones(onProgressCallback, onCompleteCallback) {
    if (this.droneScanTimer) {
      clearInterval(this.droneScanTimer);
      this.droneScanTimer = null;
    }
    if (this.dronesGroup) {
      this.disposeHierarchy(this.dronesGroup);
      this.scene.remove(this.dronesGroup);
      this.dronesGroup = null;
      this.activeDrones = [];
    }

    const dronesGroup = new THREE.Group();
    const planetRadius = this.currentPlanetKey === 'pillars_of_creation' ? 8.5 : 6.4;

    // Retícula de radar esférica envolvente y anillo de barrido progresivo sobre el planeta
    const gridGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(planetRadius * 1.03, 28, 18));
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    const gridMesh = new THREE.LineSegments(gridGeo, gridMat);
    gridMesh.scale.y = 0.05;
    dronesGroup.add(gridMesh);

    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const scanRingMesh = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 64), scanRingMat);
    scanRingMesh.rotation.x = Math.PI / 2;
    dronesGroup.add(scanRingMesh);

    // Constructor procedimental de sonda/dron robótico de exploración espacial
    const buildDroneObject = (colorHex, laserColorHex) => {
      const drone = new THREE.Group();

      // 1. Chasis central aerodinámico/espacial blindado
      const bodyGeo = new THREE.BoxGeometry(0.38, 0.22, 0.46);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.85,
        roughness: 0.25
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      drone.add(bodyMesh);

      // 2. Lámina de aislamiento térmico de oro (Kapton Foil)
      const foilGeo = new THREE.BoxGeometry(0.40, 0.12, 0.30);
      const foilMat = new THREE.MeshStandardMaterial({
        color: 0xeab308,
        metalness: 0.95,
        roughness: 0.15
      });
      const foilMesh = new THREE.Mesh(foilGeo, foilMat);
      drone.add(foilMesh);

      // 3. Paneles solares fotovoltaicos desplegados laterales
      const wingGeo = new THREE.BoxGeometry(0.72, 0.02, 0.32);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.7,
        roughness: 0.2
      });
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.62, 0, 0);
      drone.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(0.62, 0, 0);
      drone.add(rightWing);

      // 4. Antena parabólica de alta ganancia (transmisión de telemetría a la nave)
      const dishGeo = new THREE.CylinderGeometry(0.18, 0.04, 0.06, 16);
      const dishMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.9,
        roughness: 0.1
      });
      const dishMesh = new THREE.Mesh(dishGeo, dishMat);
      dishMesh.position.set(0, 0.2, 0.05);
      dishMesh.rotation.x = Math.PI / 4;
      drone.add(dishMesh);

      // 5. Tobera de propulsión de iones y destello plasma
      const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.16, 12);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.rotation.x = Math.PI / 2;
      nozzle.position.set(0, 0, 0.3);
      drone.add(nozzle);

      // Destello azul del motor iónico
      const ionGlowGeo = new THREE.ConeGeometry(0.12, 0.35, 12);
      const ionGlowMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      const ionGlow = new THREE.Mesh(ionGlowGeo, ionGlowMat);
      ionGlow.rotation.x = -Math.PI / 2;
      ionGlow.position.set(0, 0, 0.48);
      drone.add(ionGlow);

      // 6. Cono de haz láser volumétrico de escaneo orientado al planeta
      const laserLength = planetRadius * 1.35;
      const laserGeo = new THREE.CylinderGeometry(0.04, 1.35, laserLength, 16, 1, true);
      laserGeo.translate(0, -laserLength / 2, 0);
      laserGeo.rotateX(Math.PI / 2);
      const laserMat = new THREE.MeshBasicMaterial({
        color: laserColorHex,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const laserMesh = new THREE.Mesh(laserGeo, laserMat);
      laserMesh.position.set(0, 0, 0);
      drone.add(laserMesh);

      return { group: drone, ionGlow, laserMesh };
    };

    // Configuración de los 3 Drones de Exploración
    const droneConfigs = [
      {
        id: 'alpha',
        name: 'DRONE-01 ALPHA',
        role: 'Órbita Ecuatorial // Espectrómetro y Radar Altimétrico',
        dist: planetRadius * 1.55,
        incl: 0.12,
        speed: 0.032,
        color: 0x00f3ff,
        laserColor: 0x00f3ff,
        angle: 0.0,
        phase: 0.0
      },
      {
        id: 'beta',
        name: 'DRONE-02 BETA',
        role: 'Órbita Polar // Radiómetro Térmico y Magnetómetro',
        dist: planetRadius * 1.85,
        incl: 1.48,
        speed: 0.024,
        color: 0x10b981,
        laserColor: 0x10b981,
        angle: 2.1,
        phase: 1.8
      },
      {
        id: 'gamma',
        name: 'DRONE-03 GAMMA',
        role: 'Órbita Oblicua // Rastreador de Satélites, Lunas y Anillos',
        dist: planetRadius * 2.15,
        incl: 0.76,
        speed: 0.018,
        color: 0xf59e0b,
        laserColor: 0xf59e0b,
        angle: 4.3,
        phase: 3.5
      }
    ];

    const activeDrones = [];
    const shipLaunchPos = (this.orbitalShip && this.orbitalShip.mesh && this.orbitalShip.mesh.position)
      ? new THREE.Vector3(this.orbitalShip.mesh.position.x, this.orbitalShip.mesh.position.y, this.orbitalShip.mesh.position.z)
      : new THREE.Vector3(this.camera.position.x * 0.75, this.camera.position.y * 0.75, this.camera.position.z * 0.75);

    droneConfigs.forEach(cfg => {
      const { group, ionGlow, laserMesh } = buildDroneObject(cfg.color, cfg.laserColor);
      group.position.copy(shipLaunchPos);
      dronesGroup.add(group);

      activeDrones.push({
        id: cfg.id,
        name: cfg.name,
        role: cfg.role,
        group: group,
        targetDistance: cfg.dist,
        distance: cfg.dist * 1.6,
        inclination: cfg.incl,
        speed: cfg.speed,
        angle: cfg.angle,
        phase: cfg.phase,
        laserMesh: laserMesh,
        laserTargetOpacity: 0.65,
        ionGlow: ionGlow, launch: group.position.clone(), launchTime: 0, delay: activeDrones.length * 0.28
      });
    });

    this.scene.add(dronesGroup);
    this.dronesGroup = dronesGroup;
    this.activeDrones = activeDrones;

    // Timeline de Escaneo progresivo: salida desde la nave y barrido latitudinal poco a poco
    const scanStartTime = Date.now();
    const scanDuration = 6500; // ms

    this.droneScanTimer = setInterval(() => {
      const elapsed = Date.now() - scanStartTime;
      const progress = Math.min(1.0, elapsed / scanDuration);
      const pct = Math.round(progress * 100);

      // Transición orbital suave de descenso
      activeDrones.forEach(d => {
        d.distance = d.targetDistance + (d.targetDistance * 0.65) * Math.max(0, 1 - progress * 2.2);
        d.laserTargetOpacity = progress > 0.15 ? Math.min(0.75, (progress - 0.15) * 2.5) : 0;
      });

      // Malla de radar y anillo láser barren el planeta poco a poco de polo a polo
      gridMesh.rotation.y += 0.03;
      gridMesh.scale.y = Math.max(0.05, progress);
      gridMat.opacity = Math.min(0.52, progress * 0.58);
      const latY = (1 - progress * 2) * planetRadius * 0.98;
      const ringR = Math.max(0.4, Math.sqrt(Math.max(0, planetRadius * planetRadius - latY * latY)) * 1.04);
      scanRingMesh.position.y = latY;
      scanRingMesh.scale.set(ringR, ringR, 1);
      scanRingMat.opacity = progress > 0.08 && progress < 0.99 ? 0.85 : 0;

      // Mensajes de estado del enjambre telemétrico
      let currentStatus = '🛰️ Desplegando enjambre de 3 drones desde la nave Odyssey...';
      if (pct >= 20 && pct < 45) {
        currentStatus = '🛰️ Drone-01 Alpha [Órbita Ecuatorial]: Mapeando radio ecuatorial, masa y densidad...';
      } else if (pct >= 45 && pct < 70) {
        currentStatus = '🛰️ Drone-02 Beta [Órbita Polar]: Mapeando gradiente térmico día/noche y atmósfera...';
      } else if (pct >= 70 && pct < 90) {
        currentStatus = '🛰️ Drone-03 Gamma [Órbita Oblicua]: Rastreo de lunas naturales, satélites y cinturones...';
      } else if (pct >= 90) {
        currentStatus = '🛰️ Enlace Cuántico 100%: Descargando telemetría completa y registro histórico NASA...';
      }

      if (onProgressCallback) {
        onProgressCallback(pct, {
          statusText: currentStatus,
          drones: activeDrones.map(d => ({
            id: d.id,
            name: d.name,
            role: d.role,
            active: pct >= 15
          }))
        });
      }

      if (progress >= 1.0) {
        clearInterval(this.droneScanTimer);
        this.droneScanTimer = null;

        // Mantener drones orbitando suavemente en modo centinela
        activeDrones.forEach(d => {
          d.laserTargetOpacity = 0.25;
        });
        gridMat.opacity = 0.12;

        if (onCompleteCallback) onCompleteCallback();
      }
    }, 65);
  }

  // Alias para mantener compatibilidad
  triggerHolographicScan(onCompleteCallback) {
    this.deployReconDrones(null, onCompleteCallback);
  }

  /* ========================================================================
     APLICADOR DINÁMICO DE TEXTURAS 4K NASA AL MODELO 3D PLANETARIO
     ======================================================================== */
  applyCustomTexture(textureUrl, label = 'Imagen de archivo') {
    if (!this.activePlanetMesh || !this.activePlanetMesh.material) return;
    const targetMesh = this.activePlanetMesh;
    const request = this._textureRequest = (this._textureRequest || 0) + 1;

    if (!this._originalPlanetTexture) {
      this._originalPlanetTexture = this.activePlanetMesh.material.map;
    }

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      textureUrl,
      (tex) => {
        if (request !== this._textureRequest || targetMesh !== this.activePlanetMesh) {
          tex.dispose();
          return;
        }
        if (this._customPlanetTexture) this._customPlanetTexture.dispose();
        this._customPlanetTexture = tex;
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        this.activePlanetMesh.material.map = tex;
        this.activePlanetMesh.material.needsUpdate = true;
        this.showToastNotification(`Imagen aplicada: ${label}`);
      },
      undefined,
      (err) => {
        console.warn("No se pudo cargar textura remota 4K:", err);
        if (request === this._textureRequest) this.showToastNotification('No se pudo cargar la imagen. Se conserva el mapa local.');
      }
    );
  }

  resetDefaultTexture() {
    this._textureRequest = (this._textureRequest || 0) + 1;
    if (!this.activePlanetMesh || !this.activePlanetMesh.material || !this._originalPlanetTexture) return;
    if (this._customPlanetTexture) {
      this._customPlanetTexture.dispose();
      this._customPlanetTexture = null;
    }
    this.activePlanetMesh.material.map = this._originalPlanetTexture;
    this.activePlanetMesh.material.needsUpdate = true;
    this.showToastNotification(`⟲ MAPA PBR CIENTÍFICO POR DEFECTO RESTAURADO`);
  }

  showToastNotification(msg) {
    let toast = document.getElementById('planet-viewer-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'planet-viewer-toast';
      toast.className = 'planet-viewer-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('active');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 4000);
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

window.PlanetViewer = PlanetViewer;
