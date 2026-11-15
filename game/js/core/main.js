/* ==========================================================================
   NASA ODYSSEY // MAIN APPLICATION ORCHESTRATOR
   UI state management, Real NASA photography, Orbital math breakdown & Stranded Void loop
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  window.missionChallenges = new window.MissionChallenges();
  // 1. Instanciar Visor de Planetas 3D
  const planetViewer = new PlanetViewer('canvas-container');
  window.planetViewerInstance = planetViewer;

  // Inicializar Sistema de Historia, Radio Star Fox y PADD de Tripulación
  if (window.odysseyStory && !window.odysseyStory.hasInitialized) {
    window.odysseyStory.init();
  }

  // 2. Instanciar Motor de Vuelo Espacial, Motor de Aterrizaje y Motor de Exploración Cósmica
  let flightEngine = null;
  let landingEngine = null;
  let spaceExplorationEngine = null;

  // Variables de Estado
  let selectedPlanetKey = 'mars'; // Destino inicial
  const scannedPlanets = window.ODYSSEY_TEST_MODE ? Object.fromEntries(Object.keys(NASA_PLANETARY_DATABASE).map(k=>[k,true])) : { earth: true }; // Por defecto solo la base Tierra es conocida; el resto son desconocidos

  // Elementos DOM
  const selectionScreen = document.getElementById('planet-selection-screen');
  const flightScreen = document.getElementById('flight-hud-screen');
  const landingScreen = document.getElementById('landing-simulation-screen');
  const spaceExplorationScreen = document.getElementById('space-exploration-screen');
  const launchBtn = document.getElementById('launch-mission-btn');
  const exploreSpaceBtn = document.getElementById('explore-space-btn');
  const toggleAudioBtn = document.getElementById('toggle-audio-btn');
  const audioIcon = document.getElementById('audio-icon');

  const planetTabs = document.querySelectorAll('.planet-tab');
  const targetTitle = document.getElementById('target-planet-title');
  const targetSubtitle = document.getElementById('target-planet-subtitle');
  const targetDesolationBadge = document.getElementById('target-desolation-badge');

  // Fotografía Real de la NASA
  const nasaPhotoMission = document.getElementById('nasa-photo-mission');
  const nasaPhotoImg = document.getElementById('nasa-photo-img');
  const nasaPhotoDesc = document.getElementById('nasa-photo-desc');

  // Desglose Matemático Orbital
  const mathStepDist = document.getElementById('math-step-dist');
  const mathStepDeltav = document.getElementById('math-step-deltav');
  const mathStepTime = document.getElementById('math-step-time');
  const mathStepFuel = document.getElementById('math-step-fuel');
  const mathStepOxygen = document.getElementById('math-step-oxygen');
  const mathRiskNotice = document.getElementById('math-risk-notice');
  const openMathModalBtn = document.getElementById('open-math-modal-btn');

  // Ordenador de Cálculo Matemático Orbital (NASA Flight Dynamics)
  const orbitalMathModal = document.getElementById('orbital-math-modal');
  const closeOrbitalMathBtn = document.getElementById('close-orbital-math-btn');
  const recalcOrbitalMathBtn = document.getElementById('recalc-orbital-math-btn');
  const executeFlightPlanBtn = document.getElementById('execute-flight-plan-btn');
  const calcModalRoute = document.getElementById('calc-modal-route');
  const calcStatusIndicator = document.getElementById('calc-status-indicator');
  const calcProgressPct = document.getElementById('calc-progress-pct');
  const calcProgressFill = document.getElementById('calc-progress-fill');

  // Spans de Estadísticas Calculadas en el Modal
  const cstatR1 = document.getElementById('cstat-r1');
  const cstatR2 = document.getElementById('cstat-r2');
  const cstatA = document.getElementById('cstat-a');
  const cstatDist = document.getElementById('cstat-dist');
  const cstatDv1 = document.getElementById('cstat-dv1');
  const cstatDv2 = document.getElementById('cstat-dv2');
  const cstatDvTotal = document.getElementById('cstat-dv-total');
  const cstatFuelMass = document.getElementById('cstat-fuel-mass');
  const cstatFuelStatus = document.getElementById('cstat-fuel-status');
  const cstatTimeKepler = document.getElementById('cstat-time-kepler');
  const cstatTimeOdyssey = document.getElementById('cstat-time-odyssey');
  const cstatLorentz = document.getElementById('cstat-lorentz');
  const cstatPhaseAngle = document.getElementById('cstat-phase-angle');
  const cstatO2Status = document.getElementById('cstat-o2-status');
  const cstatDockingsNeeded = document.getElementById('cstat-dockings-needed');
  const cstatTrajectoryStatus = document.getElementById('cstat-trajectory-status');

  // Tarjetas y Etiquetas de Bloqueo de Pasos
  const calcStepCards = [
    document.getElementById('calc-step-1'),
    document.getElementById('calc-step-2'),
    document.getElementById('calc-step-3'),
    document.getElementById('calc-step-4'),
    document.getElementById('calc-step-5')
  ];
  const stepLockTags = [
    document.getElementById('step-lock-1'),
    document.getElementById('step-lock-2'),
    document.getElementById('step-lock-3'),
    document.getElementById('step-lock-4'),
    document.getElementById('step-lock-5')
  ];
  let calcAnimationTimer = null;

  // Condiciones Ambientales (Desconocidas por defecto)
  const telTemp = document.getElementById('tel-temp');
  const telPressure = document.getElementById('tel-pressure');
  const telRadiation = document.getElementById('tel-radiation');
  const telComposition = document.getElementById('tel-composition');
  const telLandingViability = document.getElementById('tel-landing-viability');
  const telemetryStatusTag = document.getElementById('telemetry-status-tag');
  const scanPlanetBtn = document.getElementById('scan-planet-btn');

  // Nuevos Campos de Ciencia Planetaria (Identidad, Descubrimiento, Tamaño, Lunas)
  const telPlanetIdentity = document.getElementById('tel-planet-identity');
  const telDiscoveryDate = document.getElementById('tel-discovery-date');
  const telDiscoverer = document.getElementById('tel-discoverer');
  const telHistoricMission = document.getElementById('tel-historic-mission');
  const telDiameter = document.getElementById('tel-diameter');
  const telMass = document.getElementById('tel-mass');
  const telVolume = document.getElementById('tel-volume');
  const telGravity = document.getElementById('tel-gravity');
  const telTempDetail = document.getElementById('tel-temp-detail');
  const telMoonCount = document.getElementById('tel-moon-count');
  const telMoonDetails = document.getElementById('tel-moon-details');
  const telPlanetClass = document.getElementById('tel-planet-class');
  const telPlanetAsteroids = document.getElementById('tel-planet-asteroids');

  // HUD de Enjambre de Drones de Reconocimiento
  const droneScanHud = document.getElementById('drone-scan-hud');
  const droneScanPct = document.getElementById('drone-scan-pct');
  const droneProgressBarFill = document.getElementById('drone-progress-bar-fill');
  const droneHudStatusText = document.getElementById('drone-hud-status-text');
  const droneAlphaStatus = document.getElementById('drone-alpha-status');
  const droneBetaStatus = document.getElementById('drone-beta-status');
  const droneGammaStatus = document.getElementById('drone-gamma-status');

  // Botones de Simulación Directa de Aterrizaje
  const testLandingBtn = document.getElementById('test-landing-btn');
  const flightForceLandingBtn = document.getElementById('flight-force-landing-btn');

  // HUD
  const navTargetName = document.getElementById('nav-target-name');
  const approachPlanetIcon = document.getElementById('approach-planet-icon');
  const damageStatusBadge = document.getElementById('damage-status-badge');

  // Espectrometría y Materiales del Planeta
  const scanStatusBadge = document.getElementById('scan-status-badge');
  const scanPlanetClass = document.getElementById('scan-planet-class');
  const scanSpectralSig = document.getElementById('scan-spectral-sig');
  const scanResourcePct = document.getElementById('scan-resource-pct');
  const scanResourceBar = document.getElementById('scan-resource-bar');
  const scanPlanetMoons = document.getElementById('scan-planet-moons');
  const scanPlanetAsteroids = document.getElementById('scan-planet-asteroids');
  const scanMaterialsList = document.getElementById('scan-materials-list');

  // Modal de Escaneo en Cabina de Vuelo
  const flightScanPlanetBtn = document.getElementById('flight-scan-planet-btn');
  const flightScanModal = document.getElementById('flight-scan-modal');
  const closeFlightScanBtn = document.getElementById('close-flight-scan-btn');
  const flightScanConfirmBtn = document.getElementById('flight-scan-confirm-btn');
  const flightScanPlanetTitle = document.getElementById('flight-scan-planet-title');
  const flightScanClassBadge = document.getElementById('flight-scan-class-badge');
  const flightScanSpectralText = document.getElementById('flight-scan-spectral-text');
  const flightScanScoreVal = document.getElementById('flight-scan-score-val');
  const flightScanMaterialsList = document.getElementById('flight-scan-materials-list');

  // Modales
  const completeModal = document.getElementById('mission-complete-modal');
  const completeTitle = document.getElementById('complete-planet-name');
  const statDist = document.getElementById('stat-dist');
  const statDockings = document.getElementById('stat-dockings');
  const statIntegrity = document.getElementById('stat-integrity');
  const restartSuccessBtn = document.getElementById('restart-success-btn');

  const touchdownModal = document.getElementById('touchdown-success-modal');
  const touchdownTitle = document.getElementById('touchdown-planet-name');
  const touchdownSiteDesc = document.getElementById('touchdown-site-desc');
  const touchdownSiteName = document.getElementById('touchdown-site-name');
  const touchdownHull = document.getElementById('touchdown-hull');
  const touchdownTemp = document.getElementById('touchdown-temp');
  const touchdownSpeed = document.getElementById('touchdown-speed');
  const touchdownQuality = document.getElementById('touchdown-quality');
  const touchdownBadge = document.getElementById('touchdown-badge');
  const touchdownMaterialsGrid = document.getElementById('touchdown-materials-grid');
  const touchdownContinueBtn = document.getElementById('touchdown-continue-btn');

  const gameOverModal = document.getElementById('game-over-modal');
  const gameOverTitle = document.getElementById('gameover-reason-title');
  const gameOverDesc = document.getElementById('gameover-reason-desc');
  const retryBtn = document.getElementById('retry-mission-btn');

  // Cinemática: Nave a la Deriva en el Vacío
  const strandedOverlay = document.getElementById('stranded-deep-space-overlay');
  const recalculateBtn = document.getElementById('recalculate-mission-btn');

  const epicBadge = document.getElementById('epic-status-badge');

  // 3. Inicializar Motor de Aterrizaje en Cañón 3D
  landingEngine = new PlanetaryLandingEngine(
    'canvas-container',
    (touchdownData) => {
      window.ExpeditionSystems?.state.unlock(touchdownData.planetKey);
      if(window.ExpeditionSystems){const state=window.ExpeditionSystems.state;state.hull=touchdownData.hullRemaining;state.fuel=flightEngine.fuel;state.oxygen=flightEngine.oxygen;state.save();}
      // Aterrizaje y estacionamiento vertical exitoso
      if (touchdownTitle) touchdownTitle.textContent = `¡HAS ESTACIONADO EN ${touchdownData.planetName.toUpperCase()}!`;
      if (touchdownSiteDesc) touchdownSiteDesc.textContent = `La nave Arwing completó con éxito la maniobra de aproximación y flare vertical (VTOL), desplegó su tren de aterrizaje hidráulico y estacionó verticalmente a ${touchdownData.touchdownSpeed} m/s en la plataforma balizada de ${touchdownData.landingSite}.`;
      if (touchdownSiteName) touchdownSiteName.textContent = touchdownData.landingSite;
      if (touchdownHull) touchdownHull.textContent = `${touchdownData.hullRemaining}%`;
      if (touchdownTemp) touchdownTemp.textContent = touchdownData.temp;
      if (touchdownSpeed) touchdownSpeed.textContent = `${touchdownData.touchdownSpeed} m/s`;
      if (touchdownQuality) touchdownQuality.textContent = touchdownData.quality;
      if (touchdownBadge) touchdownBadge.textContent = touchdownData.badgeText;

      // Renderizar materiales descubiertos en el sitio de aterrizaje
      if (touchdownMaterialsGrid) {
        touchdownMaterialsGrid.innerHTML = buildMaterialsListHTML(touchdownData.materials);
      }

      if (window.odysseyStory && window.odysseyStory.triggerLandingSuccess) {
        window.odysseyStory.triggerLandingSuccess(touchdownData);
      }

      if (touchdownModal) touchdownModal.classList.add('active');
    },
    (crashReason, pData) => {
      // Accidente en el cañón: la nave queda varada y con daño vagando por el espacio
      landingEngine.stop();
      landingScreen.classList.remove('active');
      landingEngine?.stop();
      window.surfaceExplorer?.stop();
      if(spaceExplorationEngine?.isActive)spaceExplorationEngine.stopExploration();
      flightScreen.classList.add('active');
      flightEngine.startMission(selectedPlanetKey, computeOrbitalTelemetry(selectedPlanetKey).min_dockings);
      flightEngine.isIdleCinematic = false;
      const siteName = (pData && pData.landingSiteName) || 'la superficie planetaria';
      flightEngine.triggerStrandedCinematic(
        2,
        'Impacto Crítico en Superficie / Terreno Planetario',
        `La nave Arwing colisionó catastróficamente contra las formaciones rocosas de ${siteName}. Con el fuselaje fracturado y propulsores extinguidos, la nave queda varada con daño severo, humo y chispas, expulsada a órbita baja y vagando a la deriva por el espacio profundo.`
      );
    }
  );
  landingEngine.init(planetViewer.renderer);

  // 4. Inicializar Motor de Vuelo con Callback de Aterrizaje
  flightEngine = new FlightGameEngine(
    'canvas-container',
    (stats) => {
      if(window.ExpeditionSystems){const state=window.ExpeditionSystems.state;state.hull=stats.hull;state.fuel=flightEngine.fuel;state.oxygen=flightEngine.oxygen;state.save();}
      completeTitle.textContent = `¡HAS LLEGADO A LA ÓRBITA DE ${stats.planetName.toUpperCase()}!`;
      statDist.textContent = `${stats.distance.toLocaleString()} km`;
      statDockings.textContent = stats.dockings;
      statIntegrity.textContent = `${stats.hull}%`;
      completeModal.classList.add('active');
    },
    (title, desc) => {
      gameOverTitle.textContent = title;
      gameOverDesc.textContent = desc;
      gameOverModal.classList.add('active');
    },
    (reason, data) => {
      // Cinemática a la deriva gestionada en flightEngine
    },
    (planetKey, hull) => {
      // Iniciar Aterrizaje Atmosférico en Cañón 3D si las condiciones son viables
      flightScreen.classList.remove('active');
      flightEngine.stop();
      scannedPlanets[planetKey] = true;window.SecretEarth?.record(planetKey);
      renderPlanetaryTelemetry(planetKey);
      if (window.odysseyStory && window.odysseyStory.triggerLandingPhase) {
        window.odysseyStory.triggerLandingPhase(planetKey);
      }
      landingEngine.startDescent(planetKey, hull);
    }
  );
  flightEngine.init(planetViewer.renderer);

  // 4. Conectar con la API de NASA EPIC
  window.nasaApi.fetchLiveEpicData().then((epicData) => {
    if (epicData && epicBadge) {
      epicBadge.innerHTML = `<span class="satellite-icon">🛰️</span> NASA DSCOVR // FOTO REAL HOY: ${epicData.id}`;
    }
  });

  // Base de Parámetros Orbitales Astrodinámicos (Heliocéntricos & Baricéntricos)
  const ASTRODYNAMICS_DATA = {
    mercury: { r2_km: 57.91e6, r2_au: 0.387, isSolar: true },
    venus: { r2_km: 108.20e6, r2_au: 0.723, isSolar: true },
    earth: { r2_km: 149.60e6, r2_au: 1.000, isSolar: true },
    moon: { r2_km: 149.60e6 + 384400, r2_au: 1.0026, isLunar: true },
    mars: { r2_km: 227.94e6, r2_au: 1.524, isSolar: true },
    jupiter: { r2_km: 778.50e6, r2_au: 5.204, isSolar: true },
    saturn: { r2_km: 1434.00e6, r2_au: 9.582, isSolar: true },
    neptune: { r2_km: 4495.00e6, r2_au: 30.047, isSolar: true },
    sagittarius_a: { r2_km: 2.46e17, r2_au: 1.64e9, isDeep: true, isBlackHole: true },
    cygnus_x1: { r2_km: 5.77e16, r2_au: 3.86e8, isDeep: true, isBlackHole: true },
    pillars_of_creation: { r2_km: 6.62e16, r2_au: 4.43e8, isDeep: true }
  };

  function computeOrbitalTelemetry(planetKey) {
    const pData = NASA_PLANETARY_DATABASE[planetKey] || NASA_PLANETARY_DATABASE.mars;
    const astro = ASTRODYNAMICS_DATA[planetKey] || { r2_km: 227.94e6, r2_au: 1.524, isSolar: true };

    const r1_km = 149.60e6;
    const r1_au = 1.000;
    const mu_sun = 1.3271244e11;
    const mu_earth = 3.9860044e5;
    const c_speed = 299792;
    const g0 = 9.80665;
    const arwing_mass_kg = 12500;
    const arwing_isp_s = 4850;
    const arwing_fuel_tank_kg = 8000;
    const cruise_velocity = 1000;

    let dist_km = pData.distanceFromEarthKm || 225000000;
    if (dist_km === 0 && planetKey === 'earth') dist_km = 10000;

    const r2_km = astro.r2_km;
    const r2_au = astro.r2_au;
    let a_km, a_au, dv1, dv2, dv_total, time_kepler_days, time_odyssey_hrs;
    let lorentz_gamma, phase_angle_deg, fuel_mass_needed, fuel_status_pct;
    let oxygen_status_pct, min_dockings;

    if (astro.isLunar) {
      const r_leo = 6700;
      const r_moon = 384400;
      const a_lunar = (r_leo + r_moon) / 2;
      a_km = a_lunar;
      a_au = a_km / 149.6e6;
      dv1 = Math.sqrt(mu_earth / r_leo) * (Math.sqrt((2 * r_moon) / (r_leo + r_moon)) - 1);
      dv2 = Math.sqrt(mu_earth / r_moon) * (1 - Math.sqrt((2 * r_leo) / (r_leo + r_moon)));
      dv_total = Math.abs(dv1) + Math.abs(dv2);
      time_kepler_days = (Math.PI * Math.sqrt(Math.pow(a_lunar, 3) / mu_earth)) / 86400;
      phase_angle_deg = 180 * (1 - Math.pow(a_lunar / r_moon, 1.5));
    } else if (astro.isDeep) {
      a_km = r2_km / 2;
      a_au = r2_au / 2;
      dv1 = 45.20;
      dv2 = 38.60;
      dv_total = dv1 + dv2;
      time_kepler_days = 999999;
      phase_angle_deg = 0;
    } else {
      a_km = (r1_km + r2_km) / 2;
      a_au = a_km / 149.6e6;
      dv1 = Math.sqrt(mu_sun / r1_km) * (Math.sqrt((2 * r2_km) / (r1_km + r2_km)) - 1);
      dv2 = Math.sqrt(mu_sun / r2_km) * (1 - Math.sqrt((2 * r1_km) / (r1_km + r2_km)));
      dv_total = Math.abs(dv1) + Math.abs(dv2);
      const t_sec = Math.PI * Math.sqrt(Math.pow(a_km, 3) / mu_sun);
      time_kepler_days = t_sec / 86400;
      const phase_rad = Math.PI * (1 - Math.pow(a_km / r2_km, 1.5));
      phase_angle_deg = (phase_rad * (180 / Math.PI)) % 360;
      if (phase_angle_deg < 0) phase_angle_deg += 360;
    }

    const effective_exhaust_velocity = (arwing_isp_s * g0) / 1000;
    fuel_mass_needed = arwing_mass_kg * (1 - Math.exp(-dv_total / effective_exhaust_velocity));
    fuel_status_pct = (fuel_mass_needed / arwing_fuel_tank_kg) * 100;

    time_odyssey_hrs = dist_km / cruise_velocity / 3600;
    const beta = cruise_velocity / c_speed;
    lorentz_gamma = 1 / Math.sqrt(1 - beta * beta);

    oxygen_status_pct = Math.min(999, time_odyssey_hrs * 1.8);
    min_dockings = Math.min(6, Math.max(1, Math.round((dist_km / 150000000) * 2)));

    return {
      planetKey,
      planetName: pData.name,
      distanceDisplay: pData.distanceDisplay || `${dist_km.toLocaleString()} km`,
      dist_km,
      r1_km,
      r1_au,
      r2_km,
      r2_au,
      a_km,
      a_au,
      dv1: Math.abs(dv1).toFixed(2),
      dv2: Math.abs(dv2).toFixed(2),
      dv_total: dv_total.toFixed(2),
      time_kepler_days: time_kepler_days > 3650 ? `${(time_kepler_days / 365.25).toFixed(0)} años` : `${time_kepler_days.toFixed(1)} días`,
      time_odyssey: time_odyssey_hrs > 8760 ? `${(time_odyssey_hrs / 8760).toFixed(1)} años luz` : `${time_odyssey_hrs.toFixed(1)} h (${(time_odyssey_hrs / 24).toFixed(1)} d)`,
      lorentz_gamma: lorentz_gamma.toFixed(7),
      phase_angle_deg: phase_angle_deg.toFixed(1),
      fuel_mass_kg: Math.round(fuel_mass_needed).toLocaleString(),
      fuel_status_pct: fuel_status_pct.toFixed(1),
      oxygen_status_pct: oxygen_status_pct.toFixed(1),
      min_dockings
    };
  }

  // 5. CÁLCULO MATEMÁTICO ORBITAL PASO A PASO (TOTALMENTE VISIBLE)
  function updateOrbitalMathematics(planetKey) {
    const data = NASA_PLANETARY_DATABASE[planetKey] || NASA_PLANETARY_DATABASE.mars;
    const tel = computeOrbitalTelemetry(planetKey);

    mathStepDist.textContent = tel.distanceDisplay;
    mathStepDeltav.textContent = `${tel.dv_total} km/s`;
    mathStepTime.textContent = tel.time_odyssey;

    if (tel.fuel_status_pct > 100) {
      mathStepFuel.innerHTML = `<span class="text-danger">${tel.fuel_status_pct}%</span> (Déficit: -${(tel.fuel_status_pct - 100).toFixed(1)}%)`;
    } else {
      mathStepFuel.innerHTML = `<span class="text-success">${tel.fuel_status_pct}%</span> (Suficiente)`;
    }

    if (tel.oxygen_status_pct > 100) {
      mathStepOxygen.innerHTML = `<span class="text-danger">${tel.oxygen_status_pct}%</span> (Déficit: -${(tel.oxygen_status_pct - 100).toFixed(1)}%)`;
    } else {
      mathStepOxygen.innerHTML = `<span class="text-success">${tel.oxygen_status_pct}%</span> (Suficiente)`;
    }

    if (data.isBlackHole) {
      mathRiskNotice.innerHTML = `🚨 <strong>ADVERTENCIA RELATIVISTA:</strong> Destino: <strong>${data.name}</strong> (${tel.distanceDisplay}). Distorsión extrema de espacio-tiempo: <em>Dilatación temporal gravitacional $\\Delta t' = \\Delta t / \\sqrt{1 - R_s/r}$</em>. Peligro de espaguetización letal en el horizonte de sucesos. ¡Se requieren maniobras de acople precisas para evitar la caída irreversible hacia la singularidad!`;
    } else if (data.isDeepSpaceNebula) {
      mathRiskNotice.innerHTML = `🌌 <strong>VASTEDAD CÓSMICA PROFUNDA:</strong> Distancia: <strong>${tel.distanceDisplay}</strong>. Navegación a través de la inmensidad de la cuna estelar. Consumo de propulsión hiperlumínica masivo; sin acoples la nave quedará perdida en el vacío intergaláctico.`;
    } else {
      mathRiskNotice.innerHTML = `🚨 <strong>ADVERTENCIA MATEMÁTICA:</strong> Distancia hacia ${data.name}: <strong>${tel.distanceDisplay}</strong>. Semieje Hohmann: <strong>${(tel.a_km / 1e6).toFixed(1)}M km</strong>. Impulso $\\Delta v$: <strong>${tel.dv_total} km/s</strong>. Se requieren <strong>mínimo ${tel.min_dockings} acople(s) exitoso(s)</strong> con satélites en ruta para evitar quedar varado en el vacío.`;
    }

    if (data.nasaRealPhotoUrl) {
      nasaPhotoImg.src = data.nasaRealPhotoUrl;
      nasaPhotoMission.textContent = data.nasaPhotoMission || 'NASA Archivo Fotográfico';
      nasaPhotoDesc.textContent = data.nasaPhotoDesc || 'Fotografía de archivo tomada por sondas espaciales de la NASA.';
    }
  }

  // 6. ORDENADOR DE VUELO: SECUENCIA DE CÁLCULO MATEMÁTICO EN TIEMPO REAL
  function openOrbitalCalculationModal(planetKey) {
    if (!orbitalMathModal) return;
    orbitalMathModal.classList.add('active');
    runOrbitalCalculationSequence(planetKey);
  }

  function runOrbitalCalculationSequence(planetKey) {
    if (calcAnimationTimer) clearInterval(calcAnimationTimer);

    const telemetry = computeOrbitalTelemetry(planetKey);
    const pData = NASA_PLANETARY_DATABASE[planetKey] || NASA_PLANETARY_DATABASE.mars;

    if (calcModalRoute) {
      calcModalRoute.textContent = `RUTA: TIERRA (1.000 AU) ➔ ${pData.name.toUpperCase()} (${telemetry.distanceDisplay})`;
    }

    // Llenar datos en tarjetas
    if (cstatR1) cstatR1.textContent = `${(telemetry.r1_km / 1e6).toFixed(2)} × 10⁶ km (${telemetry.r1_au.toFixed(3)} AU)`;
    if (cstatR2) cstatR2.textContent = `${(telemetry.r2_km / 1e6).toLocaleString(undefined, {maximumFractionDigits: 2})} × 10⁶ km (${telemetry.r2_au.toFixed(3)} AU)`;
    if (cstatA) cstatA.textContent = `${(telemetry.a_km / 1e6).toLocaleString(undefined, {maximumFractionDigits: 2})} × 10⁶ km (${telemetry.a_au.toFixed(3)} AU)`;
    if (cstatDist) cstatDist.textContent = telemetry.distanceDisplay;

    if (cstatDv1) cstatDv1.textContent = `+${telemetry.dv1} km/s`;
    if (cstatDv2) cstatDv2.textContent = `+${telemetry.dv2} km/s`;
    if (cstatDvTotal) cstatDvTotal.textContent = `${telemetry.dv_total} km/s`;

    if (cstatFuelMass) cstatFuelMass.textContent = `${telemetry.fuel_mass_kg} kg de plasma`;
    if (cstatFuelStatus) {
      cstatFuelStatus.textContent = `${telemetry.fuel_status_pct}% capacidad (${telemetry.fuel_status_pct > 100 ? 'Déficit -' + (telemetry.fuel_status_pct - 100).toFixed(1) + '%' : 'Suficiente'})`;
      cstatFuelStatus.className = telemetry.fuel_status_pct > 100 ? 'stat-val text-danger font-bold' : 'stat-val text-success font-bold';
    }

    if (cstatTimeKepler) cstatTimeKepler.textContent = telemetry.time_kepler_days;
    if (cstatTimeOdyssey) cstatTimeOdyssey.textContent = telemetry.time_odyssey;
    if (cstatLorentz) cstatLorentz.textContent = `${telemetry.lorentz_gamma} (v/c = ${(1000 / 299792).toFixed(5)})`;
    if (cstatPhaseAngle) cstatPhaseAngle.textContent = `${telemetry.phase_angle_deg}° de adelanto orbital`;

    if (cstatO2Status) {
      cstatO2Status.textContent = `${telemetry.oxygen_status_pct}% consumo (${telemetry.oxygen_status_pct > 100 ? 'Déficit -' + (telemetry.oxygen_status_pct - 100).toFixed(1) + '%' : 'Nominal'})`;
      cstatO2Status.className = telemetry.oxygen_status_pct > 100 ? 'stat-val text-danger font-bold' : 'stat-val text-success font-bold';
    }
    if (cstatDockingsNeeded) cstatDockingsNeeded.textContent = `${telemetry.min_dockings} ACOPLE(S) QTE OBLIGATORIO(S)`;
    if (cstatTrajectoryStatus) {
      cstatTrajectoryStatus.textContent = 'CALCULANDO...';
      cstatTrajectoryStatus.className = 'stat-val text-warning';
    }

    // Reset de estados visuales
    calcStepCards.forEach((card, idx) => {
      if (card) {
        card.classList.remove('active-calculating', 'locked-in');
      }
      if (stepLockTags[idx]) {
        stepLockTags[idx].textContent = 'PENDIENTE';
      }
    });

    if (executeFlightPlanBtn) {
      executeFlightPlanBtn.disabled = true;
      executeFlightPlanBtn.classList.remove('pulse-glow');
    }

    let progress = 0;
    if (calcProgressFill) calcProgressFill.style.width = '0%';
    if (calcProgressPct) calcProgressPct.textContent = '0%';
    if (calcStatusIndicator) calcStatusIndicator.textContent = 'INICIALIZANDO INTEGRACIÓN ORBITAL KEPLERIANA...';

    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      window.spaceAudio.playCalculationBeep(1);
    }
    if (calcStepCards[0]) calcStepCards[0].classList.add('active-calculating');
    if (stepLockTags[0]) stepLockTags[0].textContent = 'CALCULANDO...';

    calcAnimationTimer = setInterval(() => {
      progress += 2;
      if (progress > 100) progress = 100;

      if (calcProgressFill) calcProgressFill.style.width = `${progress}%`;
      if (calcProgressPct) calcProgressPct.textContent = `${progress}%`;

      if (progress === 20) {
        if (calcStepCards[0]) {
          calcStepCards[0].classList.remove('active-calculating');
          calcStepCards[0].classList.add('locked-in');
        }
        if (stepLockTags[0]) stepLockTags[0].textContent = 'BLOQUEADO ✓';
        if (calcStepCards[1]) calcStepCards[1].classList.add('active-calculating');
        if (stepLockTags[1]) stepLockTags[1].textContent = 'CALCULANDO...';
        if (calcStatusIndicator) calcStatusIndicator.textContent = 'CALCULANDO IMPULSO Δv DE HOHMANN & INYECCIÓN DE ESCAPE...';
        if (window.spaceAudio) window.spaceAudio.playCalculationBeep(2);
      } else if (progress === 40) {
        if (calcStepCards[1]) {
          calcStepCards[1].classList.remove('active-calculating');
          calcStepCards[1].classList.add('locked-in');
        }
        if (stepLockTags[1]) stepLockTags[1].textContent = 'BLOQUEADO ✓';
        if (calcStepCards[2]) calcStepCards[2].classList.add('active-calculating');
        if (stepLockTags[2]) stepLockTags[2].textContent = 'CALCULANDO...';
        if (calcStatusIndicator) calcStatusIndicator.textContent = 'INTEGRANDO ECUACIÓN DE COHETE DE TSIOLKOVSKY & CONSUMO DE PLASMA...';
        if (window.spaceAudio) window.spaceAudio.playCalculationBeep(3);
      } else if (progress === 60) {
        if (calcStepCards[2]) {
          calcStepCards[2].classList.remove('active-calculating');
          calcStepCards[2].classList.add('locked-in');
        }
        if (stepLockTags[2]) stepLockTags[2].textContent = 'BLOQUEADO ✓';
        if (calcStepCards[3]) calcStepCards[3].classList.add('active-calculating');
        if (stepLockTags[3]) stepLockTags[3].textContent = 'CALCULANDO...';
        if (calcStatusIndicator) calcStatusIndicator.textContent = 'RESOLVIENDO FACTOR LORENTZ, CINEMÁTICA Y VENTANA DE FASE...';
        if (window.spaceAudio) window.spaceAudio.playCalculationBeep(4);
      } else if (progress === 80) {
        if (calcStepCards[3]) {
          calcStepCards[3].classList.remove('active-calculating');
          calcStepCards[3].classList.add('locked-in');
        }
        if (stepLockTags[3]) stepLockTags[3].textContent = 'BLOQUEADO ✓';
        if (calcStepCards[4]) calcStepCards[4].classList.add('active-calculating');
        if (stepLockTags[4]) stepLockTags[4].textContent = 'CALCULANDO...';
        if (calcStatusIndicator) calcStatusIndicator.textContent = 'EVALUANDO MATRIZ DE SUPERVIVENCIA & ACOPLE SATELITAL...';
        if (window.spaceAudio) window.spaceAudio.playCalculationBeep(5);
      } else if (progress >= 100) {
        clearInterval(calcAnimationTimer);
        calcAnimationTimer = null;

        if (calcStepCards[4]) {
          calcStepCards[4].classList.remove('active-calculating');
          calcStepCards[4].classList.add('locked-in');
        }
        if (stepLockTags[4]) stepLockTags[4].textContent = 'BLOQUEADO ✓';
        if (cstatTrajectoryStatus) {
          cstatTrajectoryStatus.textContent = 'BLOQUEADO ✓ (LOCK-ON)';
          cstatTrajectoryStatus.className = 'stat-val text-success font-bold';
        }
        if (calcStatusIndicator) {
          calcStatusIndicator.textContent = '¡TRAYECTORIA ORBITAL VALIDADA Y BLOQUEADA AL 100%! LISTO PARA DESPEGUE.';
        }
        if (executeFlightPlanBtn) {
          executeFlightPlanBtn.disabled = false;
          executeFlightPlanBtn.classList.add('pulse-glow');
        }
        if (window.spaceAudio) {
          window.spaceAudio.playTrajectoryLockSound();
        }
      }
    }, 34);
  }

  // 5. RENDERIZADO DE MATERIALES Y COMPONENTES QUÍMICOS IDENTIFICADOS
  function buildMaterialsListHTML(materials) {
    if (!materials || materials.length === 0) {
      return '<div class="materials-empty-hint">⚠️ No se detectaron depósitos minerales estables en la superficie analizada.</div>';
    }
    const typeLabels = {
      volatile: { label: 'VOLÁTIL / LÍQUIDO', cls: 'badge-volatile' },
      metal: { label: 'METAL ESTRUCTURAL', cls: 'badge-metal' },
      silicate: { label: 'SILICATO / CORTEZA', cls: 'badge-silicate' },
      energy: { label: 'ENERGÍA / FUSIÓN', cls: 'badge-energy' },
      gas: { label: 'GAS ATMOSFÉRICO', cls: 'badge-gas' },
      rare: { label: 'ELEMENTO RARO', cls: 'badge-rare' }
    };

    return materials.map(mat => {
      const typeInfo = typeLabels[mat.type] || { label: (mat.type || 'RECURSO').toUpperCase(), cls: 'badge-generic' };
      return `
        <div class="material-card ${mat.type || 'metal'}">
          <div class="material-header">
            <div class="material-name-wrap">
              <span class="material-formula">${mat.formula || 'X'}</span>
              <strong class="material-name">${mat.name}</strong>
            </div>
            <div class="material-meta-right">
              <span class="material-type-badge ${typeInfo.cls}">${typeInfo.label}</span>
              <span class="material-pct-badge">${mat.pct}%</span>
            </div>
          </div>
          <div class="material-bar-track">
            <div class="material-bar-fill ${mat.type || 'metal'}" style="width: ${mat.pct}%;"></div>
          </div>
          <p class="material-desc">${mat.desc}</p>
        </div>
      `;
    }).join('');
  }

  // 6. GESTIÓN TELEMÉTRICA: LAS ESTADÍSTICAS Y MATERIALES SE REVELAN CON EL ENJAMBRE DE DRONES
  function renderPlanetaryTelemetry(planetKey) {
    const photoData=NASA_PLANETARY_DATABASE[planetKey];
    if(photoData?.nasaRealPhotoUrl){nasaPhotoImg.src=photoData.nasaRealPhotoUrl;nasaPhotoImg.alt='Archivo NASA · '+(photoData.realPlanetName||photoData.name);nasaPhotoMission.textContent=photoData.nasaPhotoMission||'Archivo NASA';nasaPhotoDesc.textContent=photoData.nasaPhotoDesc||'Fotografía del archivo NASA';}

    const pData = NASA_PLANETARY_DATABASE[planetKey];
    if (!pData) return;

    const isScanned = !!scannedPlanets[planetKey];
    document.getElementById('planet-conditions-box')?.classList.toggle('scan-pending', !isScanned);

    if (!isScanned) {
      // Cabecera del Panel Principal: CUERPO CELESTE NO IDENTIFICADO
      if (targetTitle) {
        targetTitle.textContent = pData.realPlanetName || pData.name;
        targetTitle.classList.add('unknown-title');
      }
      if (targetDesolationBadge) {
        targetDesolationBadge.textContent = 'RECONOCIMIENTO PENDIENTE';
        targetDesolationBadge.className = 'desolation-badge unknown-badge';
      }
      if (targetSubtitle) {
        targetSubtitle.textContent = 'Despliega los drones para desbloquear la ficha científica y evaluar las condiciones del destino.';
      }

      if (telemetryStatusTag) {
        telemetryStatusTag.className = 'telemetry-status-tag unknown';
        telemetryStatusTag.textContent = 'DATOS PENDIENTES DE ESCANEO';
      }
      const indicator = document.querySelector('.telemetry-radar-indicator');
      if (indicator) indicator.classList.remove('verified');

      // Campos de Identidad y Descubrimiento
      if (telPlanetIdentity) {
        telPlanetIdentity.textContent = '[DESCONOCIDO // REQUIERE RECONOCIMIENTO]';
        telPlanetIdentity.className = 'cond-val text-muted';
      }
      if (telPlanetClass) {
        telPlanetClass.textContent = '[DESCONOCIDO // REQUIERE RECONOCIMIENTO]';
        telPlanetClass.className = 'cond-val text-muted';
      }
      if (scanPlanetClass) {
        scanPlanetClass.textContent = '[DESCONOCIDO // ESCANEE EL PLANETA]';
        scanPlanetClass.className = 'id-val text-muted';
      }
      if (telDiscoveryDate) {
        telDiscoveryDate.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telDiscoveryDate.className = 'cond-val text-muted';
      }
      if (telDiscoverer) {
        telDiscoverer.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telDiscoverer.className = 'cond-val text-muted';
      }
      if (telHistoricMission) {
        telHistoricMission.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telHistoricMission.className = 'cond-val text-muted';
      }

      // Campos de Tamaño, Masa y Gravedad
      if (telDiameter) {
        telDiameter.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telDiameter.className = 'cond-val text-muted';
      }
      if (telMass) {
        telMass.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telMass.className = 'cond-val text-muted';
      }
      if (telVolume) {
        telVolume.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telVolume.className = 'cond-val text-muted';
      }
      if (telGravity) {
        telGravity.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telGravity.className = 'cond-val text-muted';
      }

      // Campos de Climatología y Temperatura
      if (telTemp) {
        telTemp.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telTemp.className = 'cond-val text-muted';
      }
      if (telTempDetail) {
        telTempDetail.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telTempDetail.className = 'cond-val text-muted';
      }
      if (telPressure) {
        telPressure.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telPressure.className = 'cond-val text-muted';
      }
      if (telRadiation) {
        telRadiation.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telRadiation.className = 'cond-val text-muted';
      }
      if (telComposition) {
        telComposition.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telComposition.className = 'cond-val text-muted';
      }

      // Campos de Lunas y Satélites
      if (telMoonCount) {
        telMoonCount.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telMoonCount.className = 'cond-val text-muted';
      }
      if (telMoonDetails) {
        telMoonDetails.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telMoonDetails.className = 'cond-val text-muted';
      }
      if (telPlanetAsteroids) {
        telPlanetAsteroids.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telPlanetAsteroids.className = 'cond-val text-muted';
      }
      if (scanPlanetMoons) {
        scanPlanetMoons.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        scanPlanetMoons.className = 'id-val text-muted';
      }
      if (scanPlanetAsteroids) {
        scanPlanetAsteroids.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        scanPlanetAsteroids.className = 'id-val text-muted';
      }
      if (telLandingViability) {
        telLandingViability.textContent = '[DESCONOCIDO // ANÁLISIS DE TERRENO REQUERIDO]';
        telLandingViability.className = 'cond-val text-muted';
      }

      // Habitabilidad Humana y Éxodo NASA (PADD Sofia Parker)
      const telGenScore = document.getElementById('tel-genesis-score');
      const telGenVerdict = document.getElementById('tel-genesis-verdict');
      if (telGenScore) {
        telGenScore.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telGenScore.className = 'cond-val text-muted';
      }
      if (telGenVerdict) {
        telGenVerdict.textContent = '[DESCONOCIDO // ESCANEO PENDIENTE]';
        telGenVerdict.className = 'cond-val text-muted';
      }

      // Espectrografía y Materiales no escaneados
      if (scanStatusBadge) {
        scanStatusBadge.textContent = 'SIN IDENTIFICAR';
        scanStatusBadge.className = 'scan-pill unknown';
      }
      if (scanSpectralSig) {
        scanSpectralSig.textContent = '[ESPECTRO NO SINTETIZADO]';
        scanSpectralSig.className = 'id-val text-muted';
      }
      if (scanResourcePct) scanResourcePct.textContent = '0%';
      if (scanResourceBar) scanResourceBar.style.width = '0%';
      if (scanMaterialsList) {
        scanMaterialsList.innerHTML = `
          <div class="materials-empty-hint" id="materials-empty-hint">
            🛸 Despliega el enjambre de drones de reconocimiento orbital para identificar qué planeta es, cuándo se descubrió, su tamaño, temperatura, cantidad de lunas y recursos minerales.
          </div>
        `;
      }

      if (scanPlanetBtn) {
        scanPlanetBtn.classList.remove('scanned', 'scanning');
        scanPlanetBtn.innerHTML = '<span class="probe-icon">🛰️</span><span class="probe-text">DESPLEGAR DRONES DE RECONOCIMIENTO // ANALIZAR PLANETA</span>';
      }
    } else {
      // Cabecera del Panel Principal: PLANETA IDENTIFICADO CON CIENCIA OFICIAL NASA
      if (targetTitle) {
        targetTitle.textContent = pData.name;
        targetTitle.classList.remove('unknown-title');
      }
      if (targetDesolationBadge) {
        targetDesolationBadge.textContent = pData.desolationStatus;
        targetDesolationBadge.className = 'desolation-badge';
      }
      if (targetSubtitle) {
        targetSubtitle.textContent = pData.subtitle;
      }

      if (telemetryStatusTag) {
        telemetryStatusTag.className = 'telemetry-status-tag verified';
        telemetryStatusTag.textContent = 'ESCANEO COMPLETO · DATOS DEL CATÁLOGO';
      }
      const indicator = document.querySelector('.telemetry-radar-indicator');
      if (indicator) indicator.classList.add('verified');

      // 1. Identidad y Descubrimiento
      if (telPlanetIdentity) {
        telPlanetIdentity.textContent = `${pData.realPlanetName || pData.name}`;
        telPlanetIdentity.className = 'cond-val text-cyan font-bold';
      }
      if (telPlanetClass) {
        telPlanetClass.textContent = pData.planetTypeDesc || pData.planetClass || 'Planeta Terrestre';
        telPlanetClass.className = 'cond-val text-cyan font-bold';
      }
      if (scanPlanetClass) {
        scanPlanetClass.textContent = pData.planetTypeDesc || pData.planetClass || 'Planeta Terrestre';
        scanPlanetClass.className = 'id-val text-cyan font-bold';
      }
      if (telDiscoveryDate) {
        telDiscoveryDate.textContent = pData.discoveryDate || 'Conocido desde la antigüedad';
        telDiscoveryDate.className = 'cond-val text-warning';
      }
      if (telDiscoverer) {
        telDiscoverer.textContent = pData.discoverer || 'Observación humana histórica';
        telDiscoverer.className = 'cond-val';
      }
      if (telHistoricMission) {
        telHistoricMission.textContent = pData.historicMission || pData.nasaPhotoMission || 'Misión Espacial Pionera NASA';
        telHistoricMission.className = 'cond-val text-cyan';
      }

      // 2. Tamaño, Masa y Dimensiones
      if (telDiameter) {
        telDiameter.textContent = pData.equatorialDiameterKm || pData.radius || 'Desconocido';
        telDiameter.className = 'cond-val text-cyan font-bold';
      }
      if (telMass) {
        telMass.textContent = pData.planetMass || 'Calculada';
        telMass.className = 'cond-val text-warning font-bold';
      }
      if (telVolume) {
        telVolume.textContent = pData.planetVolume || 'Proporcional';
        telVolume.className = 'cond-val';
      }
      if (telGravity) {
        telGravity.textContent = pData.gravity || '9.81 m/s²';
        telGravity.className = 'cond-val';
      }

      // 3. Climatología y Temperatura
      if (telTemp) {
        telTemp.textContent = pData.temperatureRange || pData.temperature;
        telTemp.className = 'cond-val text-warning font-bold';
      }
      if (telTempDetail) {
        telTempDetail.textContent = pData.temperatureDetail || 'Comportamiento térmico orbital';
        telTempDetail.className = 'cond-val';
      }
      if (telPressure) {
        telPressure.textContent = pData.atmospherePressure;
        telPressure.className = 'cond-val';
      }
      if (telRadiation) {
        telRadiation.textContent = pData.radiationLevel;
        telRadiation.className = 'cond-val text-danger';
      }
      if (telComposition) {
        telComposition.textContent = pData.atmosphereComposition;
        telComposition.className = 'cond-val';
      }

      // 4. Cantidad de Lunas y Satélites
      if (telMoonCount) {
        telMoonCount.textContent = `${pData.moonCount !== undefined ? pData.moonCount : 0} SATÉLITES EN EL CATÁLOGO`;
        telMoonCount.className = 'cond-val text-cyan font-bold';
      }
      if (telMoonDetails) {
        telMoonDetails.textContent = pData.moonDetails || 'Sin lunas principales catalogadas';
        telMoonDetails.className = 'cond-val';
      }
      if (scanPlanetMoons) {
        const moons = window.nasaApi ? window.nasaApi.getPlanetaryMoonsData(planetKey) : [];
        if (moons && moons.length > 0) {
          scanPlanetMoons.textContent = moons.map(m => m.name).join(' // ');
          scanPlanetMoons.className = 'id-val text-cyan font-bold';
        } else {
          scanPlanetMoons.textContent = pData.moonDetails || 'Sin lunas naturales catalogadas';
          scanPlanetMoons.className = 'id-val text-muted';
        }
      }
      const astInfo = planetKey === 'saturn'
        ? 'Anillos Densos PBR + Enjambre Discreto de Micro-Asteroides'
        : (planetKey === 'jupiter' || planetKey === 'mars'
          ? 'Cinturón Troyano + Asteroides Rocosos en Órbita Kepleriana'
          : (planetKey === 'sagittarius_a' || planetKey === 'cygnus_x1'
            ? 'Materia Desgarrada y Fragmentos Acelerados a 0.3c'
            : 'Cinturón Ligero de Micro-Asteroides y Nube de Polvo'));

      if (telPlanetAsteroids) {
        telPlanetAsteroids.textContent = astInfo;
        telPlanetAsteroids.className = 'cond-val text-warning font-bold';
      }
      if (scanPlanetAsteroids) {
        scanPlanetAsteroids.textContent = astInfo;
        scanPlanetAsteroids.className = 'id-val text-warning font-bold';
      }

      if (telLandingViability) {
        if (pData.canLand !== false) {
          telLandingViability.textContent = `VIABLE // ${pData.landingSiteName.toUpperCase()}`;
          telLandingViability.className = 'cond-val text-success';
        } else {
          telLandingViability.textContent = 'NO VIABLE // SIN SUPERFICIE SÓLIDA O SINGULARIDAD';
          telLandingViability.className = 'cond-val text-danger';
        }
      }

      // Habitabilidad Humana y Éxodo NASA (PADD Sofia Parker)
      const telGenScore = document.getElementById('tel-genesis-score');
      const telGenVerdict = document.getElementById('tel-genesis-verdict');
      const habData = window.odysseyHabitability ? window.odysseyHabitability[planetKey] : null;
      if (telGenScore) {
        const scoreVal = habData ? habData.score : 50;
        telGenScore.textContent = `${scoreVal}% ÍNDICE DEL JUEGO · ${habData ? habData.classification : 'CANDIDATO'}`;
        telGenScore.className = scoreVal >= 60 ? 'cond-val text-success font-bold' : (scoreVal >= 30 ? 'cond-val text-warning font-bold' : 'cond-val text-danger font-bold');
      }
      if (telGenVerdict) {
        telGenVerdict.textContent = habData ? habData.verdict : 'Datos espectrográficos procesados por J.A.R.V.I.S.';
        telGenVerdict.className = 'cond-val text-cyan';
      }

      // Espectrometría y Potencial Minero
      if (scanStatusBadge) {
        scanStatusBadge.textContent = `✓ IDENTIFICADO: ${pData.name.toUpperCase()}`;
        scanStatusBadge.className = 'scan-pill verified';
      }
      if (scanSpectralSig) {
        scanSpectralSig.textContent = pData.spectralSignature || 'Firma espectral orbital confirmada';
        scanSpectralSig.className = 'id-val text-warning';
      }
      const score = pData.resourceScore || 75;
      if (scanResourcePct) scanResourcePct.textContent = `${score}%`;
      if (scanResourceBar) scanResourceBar.style.width = `${score}%`;

      if (scanMaterialsList) {
        scanMaterialsList.innerHTML = buildMaterialsListHTML(pData.materials);
      }

      if (scanPlanetBtn) {
        scanPlanetBtn.classList.remove('scanning');
        scanPlanetBtn.classList.add('scanned');
        scanPlanetBtn.innerHTML = '<span class="probe-icon">✓</span><span class="probe-text">ESCANEO COMPLETO · DRONES EN ÓRBITA</span>';
      }
    }
  }

  // 7. Botón para Desplegar Enjambre de Drones de Reconocimiento y Revelar Estadísticas del Planeta
  if (scanPlanetBtn) {
    scanPlanetBtn.addEventListener('click', async () => {
      if (scanPlanetBtn.classList.contains('scanning')) return;
      const scanTarget = selectedPlanetKey;
      if (window.missionChallenges?.requestProgressive) {
        const authorized = await window.missionChallenges.requestProgressive('drones', scanTarget);
        if (!authorized) return;
      }

      planetViewer.resume();
      if (selectedPlanetKey !== scanTarget) return;
      if (window.spaceAudio) {
        window.spaceAudio.ensureContext();
        window.spaceAudio.playDroneDeploySound();
      }

      if (window.odysseyStory && window.odysseyStory.triggerDroneScanLaunch) {
        window.odysseyStory.triggerDroneScanLaunch(selectedPlanetKey);
      }

      if (telemetryStatusTag) {
        telemetryStatusTag.className = 'telemetry-status-tag scanning';
        telemetryStatusTag.textContent = '🛰️ ENJAMBRE DE DRONES DESPLEGADO // RECONOCIMIENTO ACTIVO...';
      }
      scanPlanetBtn.classList.add('scanning');
      scanPlanetBtn.innerHTML = '<span class="probe-icon">📡</span><span class="probe-text">ENJAMBRE ACTIVO // DRONES ESCANEANDO...</span>';

      // Mostrar HUD de Drones en Pantalla
      if (droneScanHud) {
        droneScanHud.style.display = 'block';
        if (droneScanPct) droneScanPct.textContent = '0%';
        if (droneProgressBarFill) droneProgressBarFill.style.width = '0%';
        if (droneHudStatusText) {
          droneHudStatusText.textContent = '🛰️ Desplegando enjambre de 3 drones desde la nave Odyssey...';
        }
        if (droneAlphaStatus) droneAlphaStatus.textContent = 'DESPLEGANDO...';
        if (droneBetaStatus) droneBetaStatus.textContent = 'DESPLEGANDO...';
        if (droneGammaStatus) droneGammaStatus.textContent = 'DESPLEGANDO...';
      }

      // Disparar secuencia 3D con 3 drones en órbita y barridos láser
      if (planetViewer && planetViewer.deployReconDrones) {
        planetViewer.deployReconDrones((pct, statusInfo) => {
          if (droneScanPct) droneScanPct.textContent = `${pct}%`;
          if (droneProgressBarFill) droneProgressBarFill.style.width = `${pct}%`;
          if (droneHudStatusText && statusInfo) {
            droneHudStatusText.textContent = statusInfo.statusText;
          }

          if (pct === 25 || pct === 50 || pct === 75) {
            if (window.spaceAudio) window.spaceAudio.playDroneLaserPulseSound();
          }

          if (pct >= 20 && droneAlphaStatus) droneAlphaStatus.textContent = 'ORBITANDO 🟢';
          if (pct >= 45 && droneBetaStatus) droneBetaStatus.textContent = 'ORBITANDO 🟢';
          if (pct >= 70 && droneGammaStatus) droneGammaStatus.textContent = 'ORBITANDO 🟢';
        }, () => {
          if(selectedPlanetKey!==scanTarget)return;scanPlanetBtn.classList.remove('scanning');
          scannedPlanets[scanTarget] = true;window.SecretEarth?.record(scanTarget);
          if (window.spaceAudio) window.spaceAudio.playTelemetryRevealSound();

          if (window.odysseyStory && window.odysseyStory.triggerDroneScanComplete) {
            window.odysseyStory.triggerDroneScanComplete(selectedPlanetKey, NASA_PLANETARY_DATABASE[selectedPlanetKey]);
          }

          setTimeout(() => {
            if (droneScanHud) droneScanHud.style.display = 'none';
          }, 650);

          renderPlanetaryTelemetry(selectedPlanetKey);

          // Actualizar widget de foto si procede
          if (typeof renderNasaRealPhotoWidget === 'function') {
            renderNasaRealPhotoWidget(selectedPlanetKey);
          }
        });
      } else {
        setTimeout(() => {
          if(selectedPlanetKey!==scanTarget)return;scanPlanetBtn.classList.remove('scanning');
          scannedPlanets[scanTarget] = true;window.SecretEarth?.record(scanTarget);
          if (window.spaceAudio) window.spaceAudio.playTelemetryRevealSound();
          if (droneScanHud) droneScanHud.style.display = 'none';
          renderPlanetaryTelemetry(selectedPlanetKey);
        }, 1500);
      }
    });
  }

  // 7. Selección de Planetas
  planetTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      planetTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const planetKey = tab.getAttribute('data-planet');
      selectedPlanetKey = planetKey;
      window.planetNarrator?.stop();
      const voiceSelect = document.getElementById('planet-audio-select');
      if (voiceSelect && [...voiceSelect.options].some(o => o.value === planetKey)) voiceSelect.value = planetKey;

      if (window.odysseyStory && window.odysseyStory.triggerPlanetSelected) {
        const pObj = NASA_PLANETARY_DATABASE[planetKey];
        window.odysseyStory.triggerPlanetSelected(planetKey, pObj ? pObj.name : planetKey);
      }

      planetViewer.loadPlanet(planetKey);

      // Renderizar telemetría (se encarga del título según si está escaneado o no)
      renderPlanetaryTelemetry(planetKey);
      updateOrbitalMathematics(planetKey);
    });
  });

  // Inicializar con Marte (Desconocido hasta lanzar sonda o aproximación)
  renderPlanetaryTelemetry('mars');
  updateOrbitalMathematics('mars');

  // Pestañas de Telemetría / Hohmann / Fotos NASA para evitar sobremontado vertical
  const panelSubtabBtns = document.querySelectorAll('.panel-tab-btn');
  const panelSubtabContents = document.querySelectorAll('.panel-tab-content');
  panelSubtabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      panelSubtabBtns.forEach((b) => b.classList.toggle('active', b === btn));
      panelSubtabContents.forEach((c) => {
        const sec = c.getAttribute('data-tab-section');
        c.classList.toggle('active-tab-content', sec === targetTab);
      });
    });
  });

  // Toggle Minimizar / Mostrar Panel de Planetas
  const togglePlanetPanelBtn = document.getElementById('toggle-planet-panel-btn');
  const expandPlanetPanelBtn = document.getElementById('expand-planet-panel-btn');
  const planetInfoCard = document.getElementById('planet-info-card');
  const planetCarousel = document.getElementById('planet-carousel');

  if (togglePlanetPanelBtn && planetInfoCard) {
    togglePlanetPanelBtn.addEventListener('click', () => {
      planetInfoCard.classList.add('collapsed');
      if (expandPlanetPanelBtn) expandPlanetPanelBtn.style.display = 'flex';
      if (planetCarousel) planetCarousel.classList.add('wide-mode');
    });
  }

  if (expandPlanetPanelBtn && planetInfoCard) {
    expandPlanetPanelBtn.addEventListener('click', () => {
      planetInfoCard.classList.remove('collapsed');
      expandPlanetPanelBtn.style.display = 'none';
      if (planetCarousel) planetCarousel.classList.remove('wide-mode');
    });
  }

  // Estado inicial del botón de telemetría si inicia colapsado
  if (expandPlanetPanelBtn && planetInfoCard && planetInfoCard.classList.contains('collapsed')) {
    expandPlanetPanelBtn.style.display = 'flex';
  }

  // Atajos de teclado: 'H' (Ocultar/Mostrar Telemetría) y 'V'/'C' (Cambiar Cámara)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
      if (selectionScreen.classList.contains('active') && planetInfoCard) {
        if (planetInfoCard.classList.contains('collapsed')) {
          planetInfoCard.classList.remove('collapsed');
          if (expandPlanetPanelBtn) expandPlanetPanelBtn.style.display = 'none';
          if (planetCarousel) planetCarousel.classList.remove('wide-mode');
        } else {
          planetInfoCard.classList.add('collapsed');
          if (expandPlanetPanelBtn) expandPlanetPanelBtn.style.display = 'flex';
          if (planetCarousel) planetCarousel.classList.add('wide-mode');
        }
      }
    }

    if (e.key === 'v' || e.key === 'V' || e.key === 'c' || e.key === 'C') {
      if (selectionScreen.classList.contains('active') && planetViewer && planetViewer.cycleCameraMode) {
        planetViewer.cycleCameraMode();
      }
    }
  });

  // Selector Global de Cámaras en Topbar
  const globalCamSwitchBtn = document.getElementById('global-cam-switch-btn');
  if (globalCamSwitchBtn) {
    globalCamSwitchBtn.addEventListener('click', () => {
      if (flightScreen && flightScreen.classList.contains('active') && flightEngine) {
        flightEngine.cycleCameraMode();
      } else if (spaceExplorationScreen && spaceExplorationScreen.classList.contains('active') && spaceExplorationEngine) {
        spaceExplorationEngine.cycleCameraMode();
      } else if (planetViewer && planetViewer.cycleCameraMode) {
        planetViewer.cycleCameraMode();
      }
    });
  }

  // Botón Rápido de Hohmann en Dock
  const quickCalcHohmannBtn = document.getElementById('quick-calc-hohmann-btn');
  if (quickCalcHohmannBtn) {
    quickCalcHohmannBtn.addEventListener('click', () => {
      openOrbitalCalculationModal(selectedPlanetKey);
    });
  }

  // Cerrar chip flotante de Hohmann
  const closeHohmannChipBtn = document.getElementById('close-hohmann-chip-btn');
  if (closeHohmannChipBtn) {
    closeHohmannChipBtn.addEventListener('click', () => {
      const chip = document.getElementById('flight-hohmann-chip');
      if (chip) chip.style.display = 'none';
    });
  }

  // Puente de escaneo de planetas completado desde el vuelo espacial
  window.onPlanetScannedFromFlight = (planetKey) => {
    scannedPlanets[planetKey] = true;window.SecretEarth?.record(planetKey);
    renderPlanetaryTelemetry(planetKey);
    if (typeof renderNasaRealPhotoWidget === 'function') {
      renderNasaRealPhotoWidget(planetKey);
    }
  };

  // Toggle Minimizar / Expandir Ordenador de Vuelo (HUD)
  const toggleFlightMathBtn = document.getElementById('toggle-flight-math-btn');
  const flightMathPanel = document.getElementById('flight-math-panel');
  if (toggleFlightMathBtn && flightMathPanel) {
    toggleFlightMathBtn.addEventListener('click', () => {
      flightMathPanel.classList.toggle('collapsed');
      toggleFlightMathBtn.textContent = flightMathPanel.classList.contains('collapsed') ? '+' : '—';
    });
  }

  // Cerrar Guía Holográfica del Modo Exploración
  const closeGuidePanelBtn = document.getElementById('close-guide-panel-btn');
  const explorationGuidePanel = document.getElementById('exploration-guide-panel');
  if (closeGuidePanelBtn && explorationGuidePanel) {
    closeGuidePanelBtn.addEventListener('click', () => {
      explorationGuidePanel.classList.remove('active');
    });
  }

  // 8. Botón de Despegue desde la Tierra (Abre el Ordenador de Cálculo de Trayectoria)
  launchBtn.addEventListener('click', () => {
    executeFlightPlanBtn.disabled=false;executeFlightPlanBtn.click();
  });

  if (openMathModalBtn) {
    openMathModalBtn.addEventListener('click', () => {
      openOrbitalCalculationModal(selectedPlanetKey);
    });
  }

  if (closeOrbitalMathBtn && orbitalMathModal) {
    closeOrbitalMathBtn.addEventListener('click', () => {
      orbitalMathModal.classList.remove('active');
      if (calcAnimationTimer) {
        clearInterval(calcAnimationTimer);
        calcAnimationTimer = null;
      }
    });
  }

  if (orbitalMathModal) {
    orbitalMathModal.addEventListener('click', (e) => {
      if (e.target === orbitalMathModal) {
        orbitalMathModal.classList.remove('active');
        if (calcAnimationTimer) {
          clearInterval(calcAnimationTimer);
          calcAnimationTimer = null;
        }
      }
    });
  }

  if (recalcOrbitalMathBtn) {
    recalcOrbitalMathBtn.addEventListener('click', () => {
      runOrbitalCalculationSequence(selectedPlanetKey);
    });
  }

  if (executeFlightPlanBtn) {
    executeFlightPlanBtn.addEventListener('click', async () => {
      if (executeFlightPlanBtn.disabled) return;
      const missionPlanetKey = selectedPlanetKey;
      if (window.missionChallenges?.requestProgressive) {
        executeFlightPlanBtn.disabled = true;
        const authorized = await window.missionChallenges.requestProgressive('mission', missionPlanetKey);
        executeFlightPlanBtn.disabled = false;
        if (!authorized) return;
      }
      landingEngine?.stop();
      window.surfaceExplorer?.stop();
      document.getElementById('landing-simulation-screen')?.classList.remove('active');
      // Landing authorization happens beside the destination pad.
      if (selectedPlanetKey !== missionPlanetKey) return;
      const missionTelemetry = computeOrbitalTelemetry(missionPlanetKey);
      executeFlightPlanBtn.disabled = true;
      const preparation={camera:spaceExplorationEngine?.currentCameraMode||'chase',audioEnabled:!window.spaceAudio?.isMuted};
      executeFlightPlanBtn.disabled=false;
      if (orbitalMathModal) orbitalMathModal.classList.remove('active');
      if (calcAnimationTimer) {
        clearInterval(calcAnimationTimer);
        calcAnimationTimer = null;
      }

      if (window.spaceAudio) {
        if (window.spaceAudio.isMuted === preparation.audioEnabled) {
          window.spaceAudio.toggleMute();
        }
        audioIcon.textContent = window.spaceAudio.isMuted ? '🔇' : '🔊';
        window.spaceAudio.ensureContext();
        window.spaceAudio.playLaunchWhoosh();
      }

      selectionScreen.classList.remove('active');
      planetViewer.pause();

      const pData = NASA_PLANETARY_DATABASE[selectedPlanetKey];
      navTargetName.textContent = `APROXIMACIÓN: ${pData.name.toUpperCase()}`;

      const planetIcons = {
        earth: '🌍', moon: '🌕', mars: '🪐', venus: '🪐', mercury: '⚪',
        jupiter: '🪐', saturn: '🪐', neptune: '🔵',
        sagittarius_a: '🕳️', cygnus_x1: '⚡', pillars_of_creation: '🌌'
      };
      approachPlanetIcon.textContent = planetIcons[selectedPlanetKey] || '🪐';

      // Transferir datos calculados al panel de vuelo en vivo (HUD)
      const tel = computeOrbitalTelemetry(selectedPlanetKey);
      const liveDistEl = document.getElementById('live-math-dist');
      if (liveDistEl) liveDistEl.textContent = tel.distanceDisplay;
      const liveDeltavEl = document.getElementById('live-math-deltav');
      if (liveDeltavEl) liveDeltavEl.textContent = `Δv = ${tel.dv_total} km/s`;
      const liveDockingEl = document.getElementById('live-math-docking');
      if (liveDockingEl) liveDockingEl.textContent = `MÍN. ${tel.min_dockings} ACOPLE(S)`;

      landingEngine?.stop();
      window.surfaceExplorer?.stop();
      if(spaceExplorationEngine?.isActive)spaceExplorationEngine.stopExploration();
      flightScreen.classList.add('active');
      flightEngine.startMission(selectedPlanetKey, computeOrbitalTelemetry(selectedPlanetKey).min_dockings);

      if(window.ExpeditionSystems){const resources=window.ExpeditionSystems.state;flightEngine.fuel=resources.fuel;flightEngine.oxygen=resources.oxygen;flightEngine.hull=resources.hull;}
      flightEngine.cycleCameraMode(preparation.camera);

      if (window.odysseyStory && window.odysseyStory.triggerFlightStart) {
        window.odysseyStory.triggerFlightStart(selectedPlanetKey);
      }

    });
  }

  // 9. Botón de Audio
  toggleAudioBtn.addEventListener('click', () => {
    if (window.spaceAudio) {
      window.spaceAudio.ensureContext();
      const muted = window.spaceAudio.toggleMute();
      audioIcon.textContent = muted ? '🔇' : '🔊';
    }
  });

  // 10. Reinicio tras Misión Cumplida
  restartSuccessBtn.addEventListener('click', () => {
    completeModal.classList.remove('active');
    flightScreen.classList.remove('active');
    flightEngine.stop();

    planetViewer.resume();
    selectionScreen.classList.add('active');
  });

  // 11. Reintentar tras colisión (o accidente de aterrizaje)
  retryBtn.addEventListener('click', () => {
    gameOverModal.classList.remove('active');
    if (landingEngine && landingEngine.isActive) {
      landingEngine.startDescent(selectedPlanetKey, 100);
    } else {
      flightEngine.startMission(selectedPlanetKey, computeOrbitalTelemetry(selectedPlanetKey).min_dockings);
    }
  });

  // 12. Recalcular y reintentar tras quedar a la Deriva (Cinemática)
  recalculateBtn.addEventListener('click', () => {
    strandedOverlay.classList.remove('active');
    flightEngine.exitStrandedCinematic();
    flightEngine.startMission(selectedPlanetKey, computeOrbitalTelemetry(selectedPlanetKey).min_dockings);
  });

  // 13. Modal de Visualización Científica 4K Ultra HD & Repositorio de la NASA
  const photoModal = document.getElementById('nasa-photo-modal');
  const photoModalImg = document.getElementById('photo-modal-img');
  const photoModalTitle = document.getElementById('photo-modal-title');
  const photoModalDesc = document.getElementById('photo-modal-desc');
  const photoModalCredit = document.getElementById('photo-modal-credit');
  const photoItemTitle = document.getElementById('photo-item-title');
  const photoItemDate = document.getElementById('photo-item-date');
  const photoItemRes = document.getElementById('photo-item-res');
  const tsCenter = document.getElementById('ts-center');
  const tsNasaId = document.getElementById('ts-nasa-id');
  const photoDownloadLink = document.getElementById('photo-download-link');
  const photoGalleryCounter = document.getElementById('photo-gallery-counter');
  const photoThumbnailsStrip = document.getElementById('photo-thumbnails-strip');
  const photoLoadingSpinner = document.getElementById('photo-loading-spinner');
  const closePhotoModalBtn = document.getElementById('close-photo-modal-btn');
  const openPhotoModalBtn = document.getElementById('open-photo-modal-btn');
  const photoPreviewTrigger = document.getElementById('photo-preview-trigger');
  const flightOpenGalleryBtn = document.getElementById('flight-open-gallery-btn');
  const applyTextureBtn = document.getElementById('apply-texture-to-planet-btn');
  const resetTextureBtn = document.getElementById('reset-planet-texture-btn');
  const nasaApiSearchInput = document.getElementById('nasa-api-search-input');
  const nasaApiSearchBtn = document.getElementById('nasa-api-search-btn');
  const quickFilterChips = document.querySelectorAll('.quick-filter-chips .filter-chip');

  let active4kAsset = null;
  let currentGalleryList = [];

  function display4KAsset(asset) {
    if (!asset) return;
    active4kAsset = asset;

    if (photoLoadingSpinner) photoLoadingSpinner.style.display = 'flex';

    const testImg = new Image();
    testImg.onload = () => {
      if (photoModalImg) photoModalImg.src = asset.largeUrl || asset.origUrl || asset.thumbUrl;
      const resolution = document.getElementById('photo-item-res');
      if (resolution) resolution.textContent = testImg.naturalWidth + ' × ' + testImg.naturalHeight + ' px';
      if (photoLoadingSpinner) photoLoadingSpinner.style.display = 'none';
    };
    testImg.onerror = () => {
      if (photoModalImg){photoModalImg.src='assets/nasa-photos/'+(selectedPlanetKey||'earth')+'.jpg';photoModalImg.alt='Imagen de archivo NASA del planeta seleccionado';}if(photoModalDesc)photoModalDesc.textContent='La imagen remota no está disponible. Se muestra una fotografía NASA del archivo local.';
      if (photoLoadingSpinner) photoLoadingSpinner.style.display = 'none';
    };
    testImg.src = asset.largeUrl || asset.origUrl;

    if (photoItemTitle) photoItemTitle.textContent = asset.title;
    if (photoModalDesc) photoModalDesc.textContent = asset.desc || 'Asset científico de alta resolución catalogado por la NASA.';
    if (photoItemDate) photoItemDate.textContent = `FECHA: ${asset.date || 'Archivo NASA'}`;
    if (photoModalCredit) photoModalCredit.textContent = asset.mission || 'NASA Jet Propulsion Laboratory (JPL)';
    if (tsCenter) tsCenter.textContent = asset.mission ? asset.mission.split('//')[0].trim() : 'NASA';
    if (tsNasaId) tsNasaId.textContent = asset.id || 'Archivo NASA';
    if (photoDownloadLink) {
      photoDownloadLink.href = asset.origUrl || asset.largeUrl;
    }

    if (photoThumbnailsStrip) {
      const cards = photoThumbnailsStrip.querySelectorAll('.gallery-thumb-card');
      cards.forEach(c => {
        if (c.dataset.assetId === asset.id) c.classList.add('active');
        else c.classList.remove('active');
      });
    }
  }

  function renderGalleryThumbnails(list) {
    currentGalleryList = list;
    if (!photoThumbnailsStrip) return;
    photoThumbnailsStrip.innerHTML = '';

    if (photoGalleryCounter) {
      photoGalleryCounter.textContent = `IMÁGENES DISPONIBLES (${list.length})`;
    }

    list.forEach((asset, idx) => {
      const card = document.createElement('div');
      card.className = 'gallery-thumb-card' + (idx === 0 ? ' active' : '');
      card.dataset.assetId = asset.id;

      const img = document.createElement('img');
      img.src = asset.thumbUrl || asset.largeUrl;
      img.alt = asset.title;
      img.loading = 'lazy';

      const titleOverlay = document.createElement('div');
      titleOverlay.className = 'thumb-title-overlay';
      titleOverlay.textContent = asset.title;

      card.appendChild(img);
      card.appendChild(titleOverlay);

      card.addEventListener('click', () => {
        display4KAsset(asset);
      });

      photoThumbnailsStrip.appendChild(card);
    });

    if (list.length > 0) {
      display4KAsset(list[0]);
    }
  }

  function openNASAPhotoModal(planetKey = null) {
    const key = planetKey || selectedPlanetKey || 'mars';
    const data = NASA_PLANETARY_DATABASE[key] || NASA_PLANETARY_DATABASE.mars;

    if (photoModalTitle) {
      photoModalTitle.textContent = `GALERÍA DE IMÁGENES // ${data.name.toUpperCase()}`;
    }

    quickFilterChips.forEach(chip => {
      if (chip.dataset.filter === 'current' || chip.dataset.filter === key) chip.classList.add('active');
      else chip.classList.remove('active');
    });

    const gallery = window.nasaApi ? window.nasaApi.getPlanet4KGallery(key) : [];
    renderGalleryThumbnails(gallery);

    if (photoModal) photoModal.classList.add('active');
  }

  if (openPhotoModalBtn) openPhotoModalBtn.addEventListener('click', () => openNASAPhotoModal(selectedPlanetKey));
  if (photoPreviewTrigger) photoPreviewTrigger.addEventListener('click', () => openNASAPhotoModal(selectedPlanetKey));
  if (flightOpenGalleryBtn) flightOpenGalleryBtn.addEventListener('click', () => openNASAPhotoModal(selectedPlanetKey));

  if (closePhotoModalBtn) {
    closePhotoModalBtn.addEventListener('click', () => {
      if (photoModal) photoModal.classList.remove('active');
    });
  }

  if (photoModal) {
    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal || e.target.classList.contains('photo-modal-backdrop')) {
        photoModal.classList.remove('active');
      }
    });
  }

  if (applyTextureBtn) {
    applyTextureBtn.addEventListener('click', () => {
      if (!active4kAsset) return;
      const targetUrl = active4kAsset.largeUrl || active4kAsset.origUrl;
      if (planetViewer && planetViewer.applyCustomTexture) {
        planetViewer.applyCustomTexture(targetUrl, active4kAsset.title);
      }
    });
  }

  if (resetTextureBtn) {
    resetTextureBtn.addEventListener('click', () => {
      if (planetViewer && planetViewer.resetDefaultTexture) {
        planetViewer.resetDefaultTexture();
      }
    });
  }

  async function performNasaSearch(query) {
    if (!query || !window.nasaApi || !window.nasaApi.searchNasaImages) return;

    if (photoLoadingSpinner) photoLoadingSpinner.style.display = 'flex';
    if (photoGalleryCounter) photoGalleryCounter.textContent = `BUSCANDO EN IMAGES-API.NASA.GOV...`;

    try {
      const liveResults = await window.nasaApi.searchNasaImages(query, 12);
      if (photoLoadingSpinner) photoLoadingSpinner.style.display = 'none';

      if (liveResults && liveResults.length > 0) {
        if (photoModalTitle) {
          photoModalTitle.textContent = `RESULTADOS API NASA // "${query.toUpperCase()}"`;
        }
        renderGalleryThumbnails(liveResults);
      } else {
        if (photoGalleryCounter) {
          photoGalleryCounter.textContent = `SIN RESULTADOS PARA "${query}". MOSTRANDO EL CATÁLOGO.`;
        }
        const fallback = window.nasaApi.getPlanet4KGallery(selectedPlanetKey);
        renderGalleryThumbnails(fallback);
      }
    } catch (err) {
      console.warn("Fallo búsqueda en vivo:", err);
      if (photoLoadingSpinner) photoLoadingSpinner.style.display = 'none';
      const fallback = window.nasaApi.getPlanet4KGallery(selectedPlanetKey);
      renderGalleryThumbnails(fallback);
    }
  }

  if (nasaApiSearchBtn) {
    nasaApiSearchBtn.addEventListener('click', () => {
      const q = nasaApiSearchInput ? nasaApiSearchInput.value : '';
      performNasaSearch(q);
    });
  }

  if (nasaApiSearchInput) {
    nasaApiSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performNasaSearch(nasaApiSearchInput.value);
      }
    });
  }

  quickFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      quickFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;
      if (filter === 'current') {
        openNASAPhotoModal(selectedPlanetKey);
      } else if (filter === 'jwst') {
        performNasaSearch('James Webb Space Telescope Deep Field');
      } else if (filter === 'blackhole') {
        performNasaSearch('Black Hole Chandra Event Horizon');
      } else if (NASA_PLANETARY_DATABASE[filter]) {
        openNASAPhotoModal(filter);
      } else {
        performNasaSearch(filter);
      }
    });
  });

  // 14. Botones de Simulación Directa de Aterrizaje en Cañón 3D
  if (testLandingBtn) {
    testLandingBtn.addEventListener('click', () => {
      scannedPlanets[selectedPlanetKey] = true;window.SecretEarth?.record(selectedPlanetKey);
      renderPlanetaryTelemetry(selectedPlanetKey);
      selectionScreen.classList.remove('active');
      planetViewer.pause();
      landingEngine.startDescent(selectedPlanetKey, 100);
    });
  }

  if (flightForceLandingBtn) {
    flightForceLandingBtn.addEventListener('click', () => {
      const curHull = Math.round(flightEngine.hull);
      flightScreen.classList.remove('active');
      flightEngine.stop();
      scannedPlanets[selectedPlanetKey] = true;window.SecretEarth?.record(selectedPlanetKey);
      renderPlanetaryTelemetry(selectedPlanetKey);
      landingEngine.startDescent(selectedPlanetKey, curHull);
    });
  }

  if (touchdownContinueBtn) {
    touchdownContinueBtn.addEventListener('click', () => {
      touchdownModal.classList.remove('active');
      landingEngine.stop();
      landingScreen.classList.remove('active');
      const key=landingEngine.planetKey;
      exploreSpaceBtn.click();
      if(window.ExpeditionSystems?.state.canLand(key))openSurface(key);
    });
  }

  // 15. Botones de Simulación Directa de Deriva en el Vacío (Fallo de Trayectoria)
  const testStrandedBtn = document.getElementById('test-stranded-btn');
  const flightForceFailureBtn = document.getElementById('flight-force-failure-btn');
  const flightForceFailureBtnBottom = document.getElementById('flight-force-failure-btn-bottom');
  const resumeIdleFlightBtn = document.getElementById('resume-idle-flight-btn');

  function triggerDirectStrandedSimulation() {
    selectionScreen.classList.remove('active');
    planetViewer.pause();

    const pData = NASA_PLANETARY_DATABASE[selectedPlanetKey];
    navTargetName.textContent = `APROXIMACIÓN: ${pData.name.toUpperCase()}`;
    flightScreen.classList.add('active');

    // Iniciar y activar inmediatamente la cinemática de nave a la deriva
    flightEngine.startMission(selectedPlanetKey, computeOrbitalTelemetry(selectedPlanetKey).min_dockings);
    flightEngine.triggerStrandedCinematic();
  }

  function toggleStrandedCinematicMode() {
    if (!flightEngine) return;
    if (!flightEngine.isStrandedCinematic) {
      flightEngine.isIdleCinematic = true;
      flightEngine.triggerStrandedCinematic(flightEngine.currentFailureSceneIndex);
    } else {
      flightEngine.exitIdleCinematic();
    }
  }

  if (testStrandedBtn) testStrandedBtn.addEventListener('click', triggerDirectStrandedSimulation);
  if (flightForceFailureBtn) flightForceFailureBtn.addEventListener('click', toggleStrandedCinematicMode);
  if (flightForceFailureBtnBottom) flightForceFailureBtnBottom.addEventListener('click', toggleStrandedCinematicMode);
  if (resumeIdleFlightBtn) {
    resumeIdleFlightBtn.addEventListener('click', () => {
      if (flightEngine) flightEngine.exitIdleCinematic();
    });
  }

  // 15. Modo Exploración Libre del Espacio Profundo (Galaxias, Agujeros Negros y Guía IA)
  document.getElementById('flight-free-explore')?.addEventListener('click', () => exploreSpaceBtn.click());
  if (exploreSpaceBtn) {
    exploreSpaceBtn.addEventListener('click', () => {
      landingEngine?.stop();
      document.getElementById('landing-simulation-screen')?.classList.remove('active');
      window.partialPause?.reset();
      flightEngine.qteSystem?.cancel();
      if(flightEngine.isFlying&&window.ExpeditionSystems){const state=window.ExpeditionSystems.state;state.fuel=flightEngine.fuel;state.oxygen=flightEngine.oxygen;state.hull=flightEngine.hull;state.save();}
      flightEngine.stop();
      flightScreen.classList.remove('active');
      window.odysseyStory?.radio?.clearTimers();
      if (window.odysseyStory?.radio) window.odysseyStory.radio.currentQueue = [];
      window.odysseyStory?.radio?.enterStandbyMode();
      selectionScreen.classList.remove('active');
      planetViewer.pause();

      if (!spaceExplorationEngine) {
        spaceExplorationEngine = new SpaceExplorationEngine(
          'exploration-canvas-container',
          () => {
            // Callback al regresar de la exploración
            if (spaceExplorationScreen) spaceExplorationScreen.classList.remove('active');
            selectionScreen.classList.add('active');
            planetViewer.resume();
          },
          planetViewer.renderer
        );
      }

      spaceExplorationEngine.startExploration();
    });
  }

  const gameoverViewStrandedBtn = document.getElementById('gameover-view-stranded-btn');
  if (gameoverViewStrandedBtn) {
    gameoverViewStrandedBtn.addEventListener('click', () => {
      gameOverModal.classList.remove('active');
      flightScreen.classList.add('active');
      flightEngine.triggerStrandedCinematic(0);
    });
  }

  let orbitalReturnPose = null;
  const surfaceMenu = document.getElementById('surface-menu');
  document.getElementById('surface-menu-toggle')?.addEventListener('click', () => { surfaceMenu.hidden = !surfaceMenu.hidden;const key=document.getElementById('surface-planet').value;document.getElementById('surface-lock-status').textContent=key==='uranus'?'Vuelo atmosférico: sin suelo sólido.':window.ExpeditionSystems.state.canLand(key)?'Superficie habilitada: misión y aterrizaje completados.':'Superficie bloqueada. Completa la misión de aproximación, los QTE y el aterrizaje.'; });
  document.getElementById('surface-close')?.addEventListener('click', () => { surfaceMenu.hidden = true; });
  let surfaceEntryPending=false;
  async function openSurface(key,landing=false,hull=100,ancient=false){
    if(surfaceEntryPending)return;
    if(key==='cretaceous'){key='earth';ancient=true;}
    if(!['earth','moon','mars','venus','mercury','uranus','saturn','jupiter','neptune'].includes(key)){flightScreen.classList.remove('active');flightEngine.stop();spaceExplorationEngine.startExploration();window.PlanetNavigation?.go(spaceExplorationEngine,key);return;}
    if (!landing&&!spaceExplorationEngine?.isActive) return;
    if(!landing&&!['uranus','saturn','jupiter','neptune'].includes(key)&&!window.ExpeditionSystems.state.canLand(key)){document.getElementById('surface-lock-status').textContent='Primero completa la misión y el aterrizaje de este planeta.';return;}
    selectedPlanetKey=key;
    saveExpedition(true);
    orbitalReturnPose = spaceExplorationEngine?.shipGroup?{position:spaceExplorationEngine.shipGroup.position.clone(),yaw:spaceExplorationEngine.cameraYaw,pitch:spaceExplorationEngine.cameraPitch,mode:spaceExplorationEngine.currentCameraMode}:null;
    spaceExplorationEngine?.finishCinema();spaceExplorationEngine?.stopExploration();
    if (!window.surfaceExplorer) window.surfaceExplorer = new window.PlanetSurfaceExplorer(planetViewer.renderer, (departedPlanet) => {
      exploreSpaceBtn.click();
      if(departedPlanet){window.PlanetNavigation?.arrive(spaceExplorationEngine,departedPlanet);spaceExplorationEngine.cycleCameraMode?.('chase');return;}
      if (orbitalReturnPose) { spaceExplorationEngine.shipGroup.position.copy(orbitalReturnPose.position);spaceExplorationEngine.cameraYaw=orbitalReturnPose.yaw;spaceExplorationEngine.cameraPitch=orbitalReturnPose.pitch;spaceExplorationEngine.currentCameraMode=orbitalReturnPose.mode; }
    });
    surfaceMenu.hidden=true;
    selectionScreen.classList.remove('active');flightScreen.classList.remove('active');landingScreen.classList.remove('active');planetViewer.pause();flightEngine.stop();landingEngine.stop();
    window.surfaceExplorer.ancientEarth=ancient;window.surfaceExplorer.start(key);window.surfaceExplorer.beginArrival();
    if(landing){window.ExpeditionSystems.state.hull=Math.max(0,Math.min(100,hull));}
  }
  window.addEventListener('odyssey-test-surface',event=>{if(!window.ODYSSEY_TEST_MODE)return;const key=event.detail?.planet;if(!NASA_PLANETARY_DATABASE[key])return;window.surfaceExplorer?.stop();window.ExpeditionSystems.state.resupply();openSurface(key,true,100);});
  window.requestPlanetTravel=(key)=>{
    const state=window.ExpeditionSystems?.state;
    if(window.missionChallenges?.active||window.surfaceExplorer?.arrival||window.surfaceExplorer?.autoLanding||window.surfaceExplorer?.surfaceLift||spaceExplorationEngine?.travelShot||!state?.operational||state.fuel<5||state.oxygen<1)return false;
    document.getElementById('jarvis-live')?.close();document.getElementById('surface-success')?.close();
    if(window.surfaceExplorer?.isActive)window.surfaceExplorer.stop();
    if(!spaceExplorationEngine?.isActive)exploreSpaceBtn.click();
    return window.PlanetNavigation.go(spaceExplorationEngine,key);
  };
  document.getElementById('surface-planet')?.addEventListener('change',event=>{
    if(event.target.value==='cretaceous'){
      document.getElementById('surface-enter').textContent='Descenso Panorámico 360°';
      document.getElementById('surface-lock-status').textContent='Planeta Cretácico: biosfera primitiva, dinosaurios colosales, volcanes activos y vista 360°.';
      return;
    }
    document.getElementById('surface-enter').textContent=event.target.value==='uranus'?'Entrar en la atmósfera':'Descender y explorar';
    document.getElementById('surface-lock-status').textContent=event.target.value==='uranus'?'Urano: vuelo entre nubes, sin superficie sólida.':window.ExpeditionSystems.state.canLand(event.target.value)?'Superficie habilitada.':'Completa la misión y el aterrizaje para explorar este mundo.';
  });
  document.getElementById('mission-intro-prologue-btn')?.addEventListener('click',()=>{
    document.getElementById('mission-intro')?.close();
    window.CinematicStorySlides?.openPrologue();
  });
  document.getElementById('mission-intro-nasa-btn')?.addEventListener('click',()=>{
    window.NasaHudConsole?.open();
  });
  document.getElementById('card-prologue-btn')?.addEventListener('click',()=>{
    window.CinematicStorySlides?.openPrologue();
  });
  document.getElementById('card-epilogue-btn')?.addEventListener('click',()=>{
    window.CinematicStorySlides?.openEpilogue();
  });
  document.getElementById('card-nasa-live-btn')?.addEventListener('click',()=>{
    window.NasaHudConsole?.open();
  });
  document.getElementById('pause-prologue-btn')?.addEventListener('click',()=>{
    window.partialPause?.resume();
    window.CinematicStorySlides?.openPrologue();
  });
  document.getElementById('pause-epilogue-btn')?.addEventListener('click',()=>{
    window.partialPause?.resume();
    window.CinematicStorySlides?.openEpilogue();
  });
  document.getElementById('pause-nasa-btn')?.addEventListener('click',()=>{
    window.partialPause?.resume();
    window.NasaHudConsole?.open();
  });
  document.getElementById('surface-prologue-btn')?.addEventListener('click',()=>{
    window.CinematicStorySlides?.openPrologue();
  });
  document.getElementById('surface-epilogue-btn')?.addEventListener('click',()=>{
    window.CinematicStorySlides?.openEpilogue();
  });
  landingEngine.startDescent=(key,hull=100)=>{const state=window.ExpeditionSystems.state;for(const k of ['fuel','oxygen'])if(Number.isFinite(flightEngine[k]))state[k]=Math.max(0,Math.min(100,flightEngine[k]));openSurface(key,true,hull);};
  window.addEventListener('odyssey-forgotten-earth',()=>{if(!window.SecretEarth?.ready())return;if(!spaceExplorationEngine?.isActive)exploreSpaceBtn.click();openSurface('earth',false,100,true);});
  document.getElementById('surface-enter')?.addEventListener('click',()=>openSurface(document.getElementById('surface-planet').value));

  document.getElementById('orbital-drone-scan')?.addEventListener('click',()=>{if(spaceExplorationEngine?.isActive)window.ExpeditionApproach.interact(spaceExplorationEngine);});
  document.getElementById('expedition-economy')?.addEventListener('change',e=>{window.ExpeditionSystems.state.economy=e.target.checked;});
  document.getElementById('expedition-repair')?.addEventListener('click',()=>{document.getElementById('expedition-status').textContent=window.ExpeditionSystems.state.repair()?'Kit aplicado: casco reparado.':'Reparar requiere un kit, 10 repuestos y daño en el casco.';});
  window.addEventListener('keydown',e=>{if(e.code==='KeyT'&&!e.repeat&&spaceExplorationEngine?.isActive&&!window.partialPause?.isPaused&&!e.target?.closest?.('input,textarea,select,dialog')){document.getElementById('expedition-resupply')?.click();}});
  document.getElementById('expedition-resupply')?.addEventListener('click',()=>{
    if(!spaceExplorationEngine?.isActive)return;window.ExpeditionSystems.cancel(spaceExplorationEngine);
    const earth=spaceExplorationEngine.colliders.find(b=>b.planetKey==='earth');if(!earth)return;
    const state=window.ExpeditionSystems.state;state.resupply();
    spaceExplorationEngine.shipSpeed=0;spaceExplorationEngine.verticalSpeed=0;spaceExplorationEngine.cruiseActive=false;spaceExplorationEngine.keys={};spaceExplorationEngine.strafeSpeed=0;spaceExplorationEngine.reverseSpeed=0;spaceExplorationEngine.linearVelocity={x:0,y:0,z:0};spaceExplorationEngine._boostReturnSpeed=null;
    const center=earth.mesh.getWorldPosition(new THREE.Vector3());spaceExplorationEngine.shipGroup.position.copy(center).add(new THREE.Vector3(0,45,earth.radius+110));spaceExplorationEngine.cameraYaw=0;spaceExplorationEngine.cameraPitch=-.15;
    document.getElementById('expedition-status').textContent='Remolque completado: base orbital terrestre. Combustible, oxígeno y kits repuestos.';
  });
  window.addEventListener('odyssey-select-expedition',event=>{const key=event.detail?.planet;if(!NASA_PLANETARY_DATABASE[key])return;selectedPlanetKey=key;spaceExplorationEngine.stopExploration();selectionScreen.classList.add('active');planetViewer.resume();planetViewer.currentCameraMode='orbit';planetViewer.loadPlanet(key);renderPlanetaryTelemetry(key);planetInfoCard.classList.remove('collapsed');if(expandPlanetPanelBtn)expandPlanetPanelBtn.style.display='none';});
  document.getElementById('expedition-mission')?.addEventListener('click',()=>{
    const target=spaceExplorationEngine?.isActive&&window.ExpeditionSystems.nearest(spaceExplorationEngine);
    if(!target){document.getElementById('expedition-status').textContent='Acércate a un planeta para iniciar su aproximación.';return;}
    selectedPlanetKey=target.planetKey;spaceExplorationEngine.stopExploration();selectionScreen.classList.add('active');planetViewer.resume();planetViewer.loadPlanet(selectedPlanetKey);renderPlanetaryTelemetry(selectedPlanetKey);launchBtn.click();
  });
  window.addEventListener('odyssey-orbital-scan',async event=>{
    const key=event.detail?.planet;if(!NASA_PLANETARY_DATABASE[key])return;scannedPlanets[key]=true;renderPlanetaryTelemetry(key);saveExpedition(true);
    if(flightScanPlanetTitle)flightScanPlanetTitle.textContent=NASA_PLANETARY_DATABASE[key].name.toUpperCase();
    const startExpedition=window.ExpeditionApproach?.complete(key);
    await window.JarvisPlanet?.analyze(key);
    if(startExpedition){
      selectedPlanetKey=key;spaceExplorationEngine.stopExploration();selectionScreen.classList.add('active');planetViewer.resume();planetViewer.loadPlanet(key);executeFlightPlanBtn.disabled=false;executeFlightPlanBtn.click();return;
    }
    const d=NASA_PLANETARY_DATABASE[key];if(flightScanClassBadge)flightScanClassBadge.textContent=d.planetClass||'Análisis orbital';if(flightScanSpectralText)flightScanSpectralText.textContent=d.atmosphereComposition||d.spectralSignature||'Sin atmósfera densa';if(flightScanScoreVal)flightScanScoreVal.textContent=`${d.resourceScore||0}%`;if(flightScanMaterialsList)flightScanMaterialsList.innerHTML=buildMaterialsListHTML(d.materials);flightScanModal?.classList.add('active');
  });

  window.addEventListener('resize', () => window.surfaceExplorer?.onResize());

  // 15.1. Escaneo Espectroscópico del Planeta en Cabina de Vuelo (En tiempo real)
  if (flightScanPlanetBtn) {
    flightScanPlanetBtn.addEventListener('click', () => {
      const curPlanetKey = (flightEngine && flightEngine.currentPlanet) ? flightEngine.currentPlanet : selectedPlanetKey;
      const pData = NASA_PLANETARY_DATABASE[curPlanetKey] || NASA_PLANETARY_DATABASE.mars;

      scannedPlanets[curPlanetKey] = true;window.SecretEarth?.record(curPlanetKey);
      renderPlanetaryTelemetry(curPlanetKey);

      if (window.spaceAudio) {
        window.spaceAudio.ensureContext();
        window.spaceAudio.playProbeScanSound();
      }

      if (flightScanPlanetTitle) flightScanPlanetTitle.textContent = pData.name.toUpperCase();
      if (flightScanClassBadge) flightScanClassBadge.textContent = pData.planetClass || 'Planeta Terrestre Clase M';
      if (flightScanSpectralText) flightScanSpectralText.textContent = `${pData.spectralSignature || 'Firma espectral orbital'} • ${pData.atmosphereComposition}`;
      if (flightScanScoreVal) flightScanScoreVal.textContent = `${pData.resourceScore || 85}%`;
      if (flightScanMaterialsList) flightScanMaterialsList.innerHTML = buildMaterialsListHTML(pData.materials);

      if (flightScanModal) flightScanModal.classList.add('active');
    });
  }

  if (closeFlightScanBtn) {
    closeFlightScanBtn.addEventListener('click', () => {
      if (flightScanModal) flightScanModal.classList.remove('active');
    });
  }

  if (flightScanConfirmBtn) {
    flightScanConfirmBtn.addEventListener('click', () => {
      if (flightScanModal) flightScanModal.classList.remove('active');
    });
  }

  if (flightScanModal) {
    flightScanModal.addEventListener('click', (e) => {
      if (e.target === flightScanModal) flightScanModal.classList.remove('active');
    });
  }

  // 16. CONTROLADOR DE ESCENAS EN CASO DE FALLAR (CINEMÁTICAS, CÁMARA 360° Y MODOS)
  const prevFailureSceneBtn = document.getElementById('prev-failure-scene-btn');
  const nextFailureSceneBtn = document.getElementById('next-failure-scene-btn');
  const toggleFreeCamBtn = document.getElementById('toggle-free-cam-btn');
  const toggleCinemaTextBtn = document.getElementById('toggle-cinema-text-btn');
  const restoreHudBtn = document.getElementById('restore-hud-btn');
  const strandedCaptionBox = document.getElementById('stranded-caption-box');
  const failureScenesTabs = document.getElementById('failure-scenes-tabs');
  const exitStrandedBtn = document.getElementById('exit-stranded-btn');
  const returnSelectorBtn = document.getElementById('return-selector-btn');

  // Navegación anterior / siguiente
  if (prevFailureSceneBtn) {
    prevFailureSceneBtn.addEventListener('click', () => {
      if (flightEngine) flightEngine.prevFailureScene();
    });
  }

  if (nextFailureSceneBtn) {
    nextFailureSceneBtn.addEventListener('click', () => {
      if (flightEngine) flightEngine.nextFailureScene();
    });
  }

  // Píldoras de selección directa de escena (1 a 4)
  const sceneChips = document.querySelectorAll('.scene-tab-chip');
  sceneChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const idx = parseInt(chip.getAttribute('data-scene-index'), 10);
      if (!isNaN(idx) && flightEngine) {
        flightEngine.setFailureScene(idx);
      }
    });
  });

  // Activar / Desactivar Cámara Libre 360° con Órbita
  if (toggleFreeCamBtn) {
    toggleFreeCamBtn.addEventListener('click', () => {
      if (flightEngine) flightEngine.toggleFreeCamera();
    });
  }

  // Modo Pantalla Limpia / Ocultar HUD para admirar la imagen de la nebulosa
  function setCinemaUIVisible(visible) {
    if (strandedCaptionBox) {
      if (visible) strandedCaptionBox.classList.remove('hidden-ui');
      else strandedCaptionBox.classList.add('hidden-ui');
    }
    if (failureScenesTabs) {
      if (visible) failureScenesTabs.classList.remove('hidden-ui');
      else failureScenesTabs.classList.add('hidden-ui');
    }
    if (restoreHudBtn) {
      restoreHudBtn.style.display = visible ? 'none' : 'block';
    }
  }

  if (toggleCinemaTextBtn) {
    toggleCinemaTextBtn.addEventListener('click', () => {
      const isHidden = strandedCaptionBox && strandedCaptionBox.classList.contains('hidden-ui');
      setCinemaUIVisible(isHidden);
    });
  }

  if (restoreHudBtn) {
    restoreHudBtn.addEventListener('click', () => {
      setCinemaUIVisible(true);
    });
  }

  // Salir de la pantalla cinemática y volver al selector de planetas
  function closeStrandedCinematicAndReturn() {
    setCinemaUIVisible(true);
    if (flightEngine) flightEngine.stop();
    flightScreen.classList.remove('active');
    planetViewer.resume();
    selectionScreen.classList.add('active');
  }

  if (exitStrandedBtn) exitStrandedBtn.addEventListener('click', closeStrandedCinematicAndReturn);
  if (returnSelectorBtn) returnSelectorBtn.addEventListener('click', closeStrandedCinematicAndReturn);
  document.getElementById('drift-return-btn')?.addEventListener('click', closeStrandedCinematicAndReturn);

  // 17. Controles de Audio y Banda Sonora Orquestal Épica (Interstellar / Cosmos)
  const btnSoundtrackToggle = document.getElementById('btn-soundtrack-toggle');
  const btnCinematicTour = document.getElementById('btn-cinematic-tour');

  document.getElementById('exploration-music-toggle')?.addEventListener('click', () => window.spaceAudio?.toggleSoundtrack());
  if (btnSoundtrackToggle) {
    btnSoundtrackToggle.addEventListener('click', () => {
      if (window.spaceAudio) {
        window.spaceAudio.toggleSoundtrack();
      }
    });
  }

  // Desbloqueo inicial de audio en el primer clic o pulsación del usuario
  const unlockAudioContext = () => {
    if (window.spaceAudio) {window.spaceAudio.ensureContext();if(window.spaceAudio._musicWanted!==false){if(window.sofiaTragedy?.isActive)window.sofiaTragedy.musicWasPlaying=true;else window.spaceAudio.startOrchestralSoundtrack();}}
    window.removeEventListener('click', unlockAudioContext);
    window.removeEventListener('keydown', unlockAudioContext);
  };
  window.addEventListener('click', unlockAudioContext);
  window.addEventListener('keydown', unlockAudioContext);

  // 18. Modo Recorrido Cinemático 3D (Botón y Tecla 'C')
  if (btnCinematicTour) {
    btnCinematicTour.addEventListener('click', () => {
      if (planetViewer) planetViewer.toggleCinematicTour();
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      // Activar solo en la pantalla principal del visor 3D de planetas
      if (selectionScreen && selectionScreen.classList.contains('active') && planetViewer) {
        planetViewer.toggleCinematicTour();
      }
    }
  });

  let sciencePlanPlanet = null;
  let sciencePlan = null;
  if (window.FlightScienceHUD) {
    window.flightScienceHUD = new window.FlightScienceHUD(() => {
      if (!flightEngine.isFlying || flightEngine.isStrandedCinematic || !flightScreen.classList.contains('active')
        || completeModal.classList.contains('active') || gameOverModal.classList.contains('active')) return null;
      const planet = flightEngine.activePlanetKey;
      if (planet !== sciencePlanPlanet) {
        sciencePlanPlanet = planet;
        sciencePlan = computeOrbitalTelemetry(planet);
      }
      return { engine: flightEngine, planet, data: NASA_PLANETARY_DATABASE[planet],
        plan: sciencePlan, scanned: !!scannedPlanets[planet], paused: !!window.partialPause?.isPaused };
    });
  }

  // Checkpoints contain gameplay data only; scenes and transient challenges are rebuilt.
  const recoveryStatus = document.getElementById('recovery-status');
  let recoveryStatusTimer = null;
  function showRecoveryStatus(message) {
    clearTimeout(recoveryStatusTimer);
    recoveryStatus.textContent = message;
    recoveryStatus.hidden = false;
    recoveryStatusTimer = setTimeout(() => { recoveryStatus.hidden = true; }, 10000);
  }
  const checkpoints = new window.MissionCheckpointStore(Object.keys(NASA_PLANETARY_DATABASE), showRecoveryStatus);
  const savedExpedition = checkpoints.read();
  let checkpointReady = false;
  let restoringCheckpoint = false;
  let checkpointPaused = false;
  let renderPaused = false;
  let lastCheckpointPhase = '';
  let lastCheckpointTime = 0;
  const recoveryAttempts = [];
  const watchedCanvases = new Set();
  const lostCanvases = new Set();

  function captureExpedition() {
    if (window.surfaceExplorer?.isActive) return null;
    const base = { planet: selectedPlanetKey,
      scanned: Object.keys(scannedPlanets).filter(key => scannedPlanets[key]) };
    if (completeModal.classList.contains('active') || touchdownModal.classList.contains('active')) {
      return { ...base, phase: 'menu' };
    }
    if (spaceExplorationEngine && spaceExplorationEngine.isActive) {
      const e = spaceExplorationEngine;
      return { ...base, phase: 'exploration', exploration: {
        position: e.shipGroup.position.toArray(), yaw: e.cameraYaw, pitch: e.cameraPitch, speed: e.shipSpeed
      } };
    }
    if (landingEngine.isActive && landingEngine.hull > 0) {
      return { ...base, phase: 'landing', planet: landingEngine.planetKey, hull: landingEngine.hull };
    }
    if (landingEngine.isTouchdownAnimation) return null;
    if (flightEngine.isFlying) {
      if (flightEngine.isStrandedCinematic || flightEngine.isQTEActive || flightEngine.qteSystem.resultTimer !== null) return null;
      return { ...base, phase: 'flight', planet: flightEngine.activePlanetKey, flight: {
        hull: flightEngine.hull, fuel: flightEngine.fuel, oxygen: flightEngine.oxygen,
        progress: flightEngine.progress, dockings: flightEngine.dockingSuccessCount,
        camera: flightEngine.currentCameraMode, position: flightEngine.ship.position.toArray(),
        velocity: flightEngine.ship.velocity.toArray(), speed: flightEngine.currentSpeedKm
      } };
    }
    if (selectionScreen.classList.contains('active')) return { ...base, phase: 'menu' };
    return null;
  }

  function saveExpedition(force = false) {
    if (!checkpointReady || restoringCheckpoint || checkpointPaused || renderPaused || lostCanvases.size || window.partialPause?.isPaused) return;
    const state = captureExpedition();
    if (!state) return;
    const phase = `${state.phase}:${state.planet}`;
    const now = performance.now();
    if (force || phase !== lastCheckpointPhase || (['flight', 'exploration'].includes(state.phase) && now - lastCheckpointTime >= 15000)) {
      checkpoints.save(state);
      lastCheckpointPhase = phase;
      lastCheckpointTime = now;
    }
  }

  function restoreExpedition(state) {
    window.performanceMonitor?.suspend();
    restoringCheckpoint = true;
    try {
      window.partialPause?.reset();
      window.surfaceExplorer?.stop();
      flightEngine.stop();
      landingEngine.stop();
      if (spaceExplorationEngine) spaceExplorationEngine.stopExploration();
      [selectionScreen, flightScreen, landingScreen, spaceExplorationScreen,
        completeModal, touchdownModal, gameOverModal, strandedOverlay, orbitalMathModal]
        .filter(Boolean).forEach(element => element.classList.remove('active'));
      selectedPlanetKey = state.planet;
      state.scanned.forEach(key => { scannedPlanets[key] = true;window.SecretEarth?.record(key); });
      planetTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.planet === state.planet));
      renderPlanetaryTelemetry(state.planet);
      planetViewer.pause();
      if (state.phase === 'flight') {
        flightScreen.classList.add('active');
        flightEngine.startMission(state.planet, computeOrbitalTelemetry(state.planet).min_dockings);
        const f = state.flight;
        Object.assign(flightEngine, { hull: f.hull, fuel: f.fuel, oxygen: f.oxygen,
          progress: f.progress, dockingSuccessCount: f.dockings, currentSpeedKm: f.speed,
          isLaunching: f.progress === 0 });
        flightEngine.currentDistanceKm = Math.round(flightEngine.mathModel.orbitalDistanceKm * (1 - f.progress / 100));
        flightEngine.ship.position.fromArray(f.position);
        flightEngine.ship.velocity.fromArray(f.velocity);
        flightEngine.ship.shipGroup.position.copy(flightEngine.ship.position);
        flightEngine.ship.setDamage(1 - f.hull / 100);
        flightEngine.cycleCameraMode(f.camera);
        flightEngine.updateHUD();
        navTargetName.textContent = `APROXIMACIÓN: ${NASA_PLANETARY_DATABASE[state.planet].name.toUpperCase()}`;
        const telemetry = computeOrbitalTelemetry(state.planet);
        const restoredTelemetry = {
          'live-math-dist': telemetry.distanceDisplay,
          'live-math-deltav': `Δv = ${telemetry.dv_total} km/s`,
          'live-math-docking': `MÍN. ${telemetry.min_dockings} ACOPLE(S)`
        };
        Object.entries(restoredTelemetry).forEach(([id, value]) => {
          const element = document.getElementById(id);
          if (element) element.textContent = value;
        });
      } else if (state.phase === 'landing') {
        // Resume at the safe entrance to the phase, not inside a regenerated obstacle.
        landingEngine.startDescent(state.planet, state.hull);
      } else if (state.phase === 'exploration') {
        exploreSpaceBtn.click();
        const e = state.exploration;
        spaceExplorationEngine.shipGroup.position.fromArray(e.position);
        spaceExplorationEngine.cameraYaw = e.yaw;
        spaceExplorationEngine.cameraPitch = e.pitch;
        spaceExplorationEngine.shipSpeed = e.speed;
        window.PlanetNavigation?.recover(spaceExplorationEngine);
      } else {
        selectionScreen.classList.add('active');
        planetViewer.loadPlanet(state.planet);
        planetViewer.resume();
      }
      lastCheckpointPhase = `${state.phase}:${state.planet}`;
      lastCheckpointTime = performance.now();
      showRecoveryStatus(state.phase === 'landing'
        ? 'Progreso recuperado. Retomamos el descenso desde el inicio de la fase.'
        : 'Progreso válido recuperado automáticamente.');
    } finally {
      restoringCheckpoint = false;
    }
  }

  function recoverExpedition(error) {
    console.error('Se interrumpió la escena de la expedición.', error);
    const now = performance.now();
    while (recoveryAttempts.length && now - recoveryAttempts[0] > 10000) recoveryAttempts.shift();
    recoveryAttempts.push(now);
    const state = checkpoints.read();
    if (state && recoveryAttempts.length <= 2) {
      try { restoreExpedition(state); return; } catch (restoreError) {
        console.error('No se pudo reconstruir la escena.', restoreError);
      }
    }
    // Preserve both records when automatic reconstruction keeps failing.
    checkpointPaused = true;
    renderPaused = true;
    window.partialPause?.reset();
    try { flightEngine.qteSystem.cancel(); } catch (cancelError) { console.error(cancelError); }
    if (window.adaptiveTutorial) window.adaptiveTutorial.enter(null);
    selectionScreen.classList.add('active');
    [flightScreen, landingScreen, spaceExplorationScreen, completeModal, touchdownModal, gameOverModal]
      .filter(Boolean).forEach(element => element.classList.remove('active'));
    showRecoveryStatus('No se pudo recuperar la escena. El último guardado válido se conserva; recarga la página para reintentarlo.');
  }

  function watchGraphicsContexts() {
    [planetViewer.renderer, flightEngine.renderer, spaceExplorationEngine?.renderer].filter(Boolean).forEach(renderer => {
      const canvas = renderer.domElement;
      if (watchedCanvases.has(canvas)) return;
      watchedCanvases.add(canvas);
      canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        window.performanceMonitor?.suspend();
        lostCanvases.add(canvas);
        showRecoveryStatus('Se interrumpió la imagen. Conservamos el progreso mientras se recupera.');
      });
      canvas.addEventListener('webglcontextrestored', () => {
        lostCanvases.delete(canvas);
        if (!lostCanvases.size && checkpointReady) recoverExpedition(new Error('Graphics context restored'));
      });
    });
  }

  window.addEventListener('odyssey-checkpoint', () => {
    if (restoringCheckpoint) return;
    queueMicrotask(() => saveExpedition(true));
  });
  document.addEventListener('visibilitychange', () => {
    window.performanceMonitor?.suspend();
    if (document.visibilityState === 'hidden') saveExpedition(true);
  });
  window.addEventListener('pagehide', () => saveExpedition(true));

  function getPausableEngine() {
    if (renderPaused || lostCanvases.size || completeModal.classList.contains('active') || touchdownModal.classList.contains('active')) return null;
    if (window.surfaceExplorer?.isActive) return window.surfaceExplorer;
    if (spaceExplorationEngine?.isActive) return spaceExplorationEngine;
    if (landingEngine.isActive || landingEngine.isTouchdownAnimation) return landingEngine;
    if (flightEngine.isFlying && !flightEngine.isStrandedCinematic) return flightEngine;
    return null;
  }
  if (window.PartialPauseController) {
    window.partialPause = new window.PartialPauseController({
      getEngine: getPausableEngine,
      beforePause: () => saveExpedition(true),
      onResume: () => { lastCheckpointTime = performance.now(); }
    });
  }

  if (window.PerformanceMonitor) {
    window.performanceMonitor = new window.PerformanceMonitor();
    window.performanceMonitor.attachReport(document.getElementById('performance-report'));
  }
  function measurementContext() {
    if (window.surfaceExplorer?.isActive) return null;
    if (document.visibilityState !== 'visible' || completeModal.classList.contains('active')
      || touchdownModal.classList.contains('active') || gameOverModal.classList.contains('active')) return null;
    let engine;
    let scene;
    if (spaceExplorationEngine?.isActive) { if(spaceExplorationEngine.cinemaShot)return null; engine = spaceExplorationEngine; scene = 'exploration'; }
    else if (landingEngine.isActive || landingEngine.isTouchdownAnimation) {
      engine = landingEngine; scene = landingEngine.isTouchdownAnimation ? 'touchdown' : 'landing';
    } else if (flightEngine.isFlying && !flightEngine.isStrandedCinematic) {
      engine = flightEngine; scene = flightEngine.isQTEActive ? 'docking' : 'flight';
    } else return null;
    return { scene, width: engine.renderer.domElement.width, height: engine.renderer.domElement.height };
  }

  function resumeSavedExpedition() {
    checkpointReady = true;
    if (savedExpedition) {
      try { restoreExpedition(savedExpedition); } catch (error) { recoverExpedition(error); }
    }
  }
  const introDialog = document.getElementById('mission-intro');
  if (introDialog.open) introDialog.addEventListener('close', resumeSavedExpedition, { once: true });
  else resumeSavedExpedition();

  // 19. Loop de renderizado continuo unificado y óptimo
  function gameLoop(frameTime) {
    requestAnimationFrame(gameLoop);
    if (renderPaused || lostCanvases.size) { window.performanceMonitor?.suspend(); return; }
    try {
    watchGraphicsContexts();
    window.sofiaTragedy?.update(frameTime);
    window.ImmersionView?.sync(window.surfaceExplorer?.isActive ? window.surfaceExplorer : spaceExplorationEngine?.isActive ? spaceExplorationEngine : flightEngine.isFlying ? flightEngine : null);
    const musicEngine=window.surfaceExplorer?.isActive?window.surfaceExplorer:spaceExplorationEngine?.isActive?spaceExplorationEngine:flightEngine.isFlying?flightEngine:null;
    window.SituationalMusic?.update(musicEngine,window.surfaceExplorer?.isActive?'surface':spaceExplorationEngine?.isActive?'space':'flight',frameTime);
    if (window.sofiaTragedy?.isActive) {
      const engine=getPausableEngine();window.partialPause?.clearControls(engine);engine?.clock?.getDelta?.();
      window.performanceMonitor?.suspend();return;
    }
    if (window.missionChallenges?.active) {
      const engine = getPausableEngine();
      if (engine) {
        window.partialPause?.clearControls(engine);
        engine.updatePaused();
      } else if (!planetViewer.isPaused) planetViewer.update();
      window.performanceMonitor?.suspend();
      return;
    }
    window.flightScienceHUD?.update();
    if (window.partialPause) {
      window.partialPause.sync();
      if (window.partialPause.isPaused) {
        window.performanceMonitor?.suspend();
        window.partialPause.engine.updatePaused();
        return;
      }
    }

    // JARVIS reference panels do not suspend flight.
    if (window.performanceMonitor) window.performanceMonitor.sample(frameTime, measurementContext());

    if (window.adaptiveTutorial) {
      const activity = spaceExplorationEngine && spaceExplorationEngine.isActive ? 'exploration'
        : landingEngine && landingEngine.isActive ? 'landing'
        : flightEngine && flightEngine.isFlying && !flightEngine.isStrandedCinematic ? 'flight'
        : null;
      window.adaptiveTutorial.enter(activity);
    }

    if (window.surfaceExplorer?.isActive) {
      window.surfaceExplorer.update();
    } else if (spaceExplorationEngine && spaceExplorationEngine.isActive) {
      // 1. Motor de Exploración Cósmica Libre
      spaceExplorationEngine.update();
    } else if (landingEngine && (landingEngine.isActive || landingEngine.isTouchdownAnimation)) {
      // 2. Motor de Descenso y Aterrizaje en Cañón Planetario
      landingEngine.update();
    } else if (flightEngine && (flightEngine.isFlying || flightEngine.isStrandedCinematic)) {
      // 3. Motor de Vuelo Espacial
      flightEngine.update();

      // Indicador textual del estado del casco en el HUD
      if (damageStatusBadge) {
        if (flightEngine.hull > 75) {
          damageStatusBadge.textContent = 'CASCO INTACTO';
          damageStatusBadge.style.color = '#10b981';
        } else if (flightEngine.hull > 45) {
          damageStatusBadge.textContent = 'DAÑO MODERADO // QUEMADURAS';
          damageStatusBadge.style.color = '#f59e0b';
        } else if (flightEngine.hull > 15) {
          damageStatusBadge.textContent = 'DAÑO CRÍTICO // HUMO Y CHISPAS';
          damageStatusBadge.style.color = '#ef4444';
        } else {
          damageStatusBadge.textContent = 'DESPRESURIZACIÓN INMINENTE';
          damageStatusBadge.style.color = '#ef4444';
        }
      }
    } else if (planetViewer && !planetViewer.isPaused) {
      // 4. Visor 3D de Planetas (Menú Principal / Selector)
      planetViewer.update();
    }
    saveExpedition();
    } catch (error) {
      window.performanceMonitor?.suspend();
      recoverExpedition(error);
    }
  }
  // cinematic-slides owns prologue/epilogue startup; do not schedule a second intro.
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('nasa') && !urlParams.has('prologue') && !urlParams.has('epilogue')) {
      setTimeout(() => window.NasaHudConsole?.open(), 400);
    }
  } catch {}
  requestAnimationFrame(gameLoop);
});
