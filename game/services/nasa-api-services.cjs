/* ==========================================================================
   NASA ODYSSEY // NASA OPEN APIS EXPANDED SERVICES
   NeoWs (Asteroids), DONKI (Space Weather), TechTransfer (Patents) & InSight (Mars)
   Official NASA Open APIs (api.nasa.gov) with zero-latency resilient fallbacks
   ========================================================================== */

const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

function getApiKey() {
  if (process.env.NASA_API_KEY && process.env.NASA_API_KEY.trim()) return process.env.NASA_API_KEY.trim();
  try {
    const keyFile = path.join(__dirname, '..', '.local', 'nasa-key');
    if (fs.existsSync(keyFile)) return fs.readFileSync(keyFile, 'utf8').trim();
  } catch {}
  return 'DEMO_KEY';
}

function fetchJson(url, timeoutMs = 4500) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'NASA-Odyssey-Game/2.0' } }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('Timeout conectando con NASA Open APIs'));
    });
  });
}

// --------------------------------------------------------------------------
// 1. ASTEROIDS - NeoWs (Near Earth Object Web Service)
// --------------------------------------------------------------------------
const CURATED_NEOWS_ASTEROIDS = [
  { id: '2099942', name: '99942 Apophis (2004 MN4)', estimated_diameter_km: { min: 0.34, max: 0.41 }, is_potentially_hazardous: true, close_approach_date: '2029-04-13', miss_distance_km: '31600', relative_velocity_km_s: '7.43', danger_level: 'Crítica (Paso suborbital geosíncrono)' },
  { id: '2101955', name: '101955 Bennu (1999 RQ36)', estimated_diameter_km: { min: 0.49, max: 0.53 }, is_potentially_hazardous: true, close_approach_date: '2182-09-24', miss_distance_km: '680000', relative_velocity_km_s: '6.12', danger_level: 'Alta (Objetivo Misión OSIRIS-REx)' },
  { id: '3542519', name: '2024 YR4', estimated_diameter_km: { min: 0.05, max: 0.09 }, is_potentially_hazardous: true, close_approach_date: '2032-12-22', miss_distance_km: '105000', relative_velocity_km_s: '14.2', danger_level: 'Monitoreo activo radar JPL' },
  { id: '2003122', name: '3122 Florence (1981 ET3)', estimated_diameter_km: { min: 4.4, max: 4.9 }, is_potentially_hazardous: true, close_approach_date: '2057-09-02', miss_distance_km: '7000000', relative_velocity_km_s: '13.5', danger_level: 'Gigante cercano con 2 lunas' },
  { id: '2004179', name: '4179 Toutatis (1989 AC)', estimated_diameter_km: { min: 2.5, max: 5.4 }, is_potentially_hazardous: true, close_approach_date: '2069-11-05', miss_distance_km: '3000000', relative_velocity_km_s: '11.8', danger_level: 'Rotación caótica en 2 ejes' },
  { id: '2025143', name: '25143 Itokawa (1998 SF36)', estimated_diameter_km: { min: 0.33, max: 0.54 }, is_potentially_hazardous: false, close_approach_date: '2026-10-18', miss_distance_km: '18400000', relative_velocity_km_s: '8.9', danger_level: 'Pila de escombros de baja densidad' },
  { id: '2000433', name: '433 Eros (1898 DQ)', estimated_diameter_km: { min: 16.8, max: 34.4 }, is_potentially_hazardous: false, close_approach_date: '2056-01-24', miss_distance_km: '22000000', relative_velocity_km_s: '5.6', danger_level: 'Primer asteroide orbitado (NEAR Shoemaker)' }
];

async function loadNeoWs() {
  const apiKey = getApiKey();
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${nextWeek}&api_key=${apiKey}`;
  try {
    const data = await fetchJson(url);
    if (data && data.near_earth_objects) {
      const list = [];
      Object.values(data.near_earth_objects).forEach(arr => {
        arr.forEach(neo => {
          const app = neo.close_approach_data?.[0];
          list.push({
            id: neo.id,
            name: neo.name,
            estimated_diameter_km: {
              min: Number((neo.estimated_diameter?.kilometers?.estimated_diameter_min || 0.1).toFixed(3)),
              max: Number((neo.estimated_diameter?.kilometers?.estimated_diameter_max || 0.2).toFixed(3))
            },
            is_potentially_hazardous: !!neo.is_potentially_hazardous_asteroid,
            close_approach_date: app?.close_approach_date || today,
            miss_distance_km: app?.miss_distance?.kilometers || '1500000',
            relative_velocity_km_s: Number(app?.relative_velocity?.kilometers_per_second || 12).toFixed(2),
            danger_level: neo.is_potentially_hazardous_asteroid ? 'Alerta NASA JPL: Potencialmente Peligroso' : 'Trayectoria Segura Monitoreada'
          });
        });
      });
      if (list.length > 0) return { source: 'live_nasa_neows', count: list.length, asteroids: list };
    }
  } catch {}
  return { source: 'curated_nasa_jpl', count: CURATED_NEOWS_ASTEROIDS.length, asteroids: CURATED_NEOWS_ASTEROIDS };
}

// --------------------------------------------------------------------------
// 2. DONKI (Space Weather Database Of Notifications, Knowledge, Information)
// --------------------------------------------------------------------------
const CURATED_DONKI_ALERTS = [
  { messageType: 'CME', messageIssueTime: '2026-11-09T18:40:00Z', messageTitle: 'CME con trayectoria Tierra-Marte detectada por STEREO-A', speed_km_s: 920, half_angle: 42, note: 'Eyección de Masa Coronal rápida asociada a erupción de filamento en región solar activa AR3664. Posibles auroras boreales intensas (Kp 7) e inducción magnética en alta atmósfera.' },
  { messageType: 'FLR', messageIssueTime: '2026-11-08T14:15:00Z', messageTitle: 'Llamarada Solar Clase X2.4 en extremidad Noreste', peakTime: '14:22Z', classType: 'X2.4', note: 'Emisión intensa de rayos X y ultravioleta extremo. Bloqueo de comunicaciones de radio de alta frecuencia (R3 Fuerte) en el lado iluminado por el Sol.' },
  { messageType: 'GST', messageIssueTime: '2026-11-07T06:30:00Z', messageTitle: 'Tormenta Geomagnética Moderada G2 alcanzada', kpIndex: 6, note: 'Impacto de corriente de viento solar de alta velocidad (HSS) originada en agujero coronal polar. Compresión de la magnetopausa terrestre a 8.2 radios terrestres.' },
  { messageType: 'IPS', messageIssueTime: '2026-11-06T22:10:00Z', messageTitle: 'Choque Interplanetario registrado por Sonda DSCOVR', location: 'Punto Lagrange L1', note: 'Salto repentino en densidad del plasma y campo magnético interplanetario. Advertencia de perturbación para satélites en órbita geoestacionaria.' }
];

async function loadDonki() {
  const apiKey = getApiKey();
  const url = `https://api.nasa.gov/DONKI/notifications?type=all&api_key=${apiKey}`;
  try {
    const data = await fetchJson(url);
    if (Array.isArray(data) && data.length > 0) {
      const parsed = data.slice(0, 8).map(d => ({
        messageType: d.messageType || 'CME',
        messageIssueTime: d.messageIssueTime || new Date().toISOString(),
        messageTitle: d.messageTitle || 'Alerta de Clima Espacial NASA SWRC',
        note: (d.messageBody || '').slice(0, 240).replace(/\n/g, ' ') + '...'
      }));
      return { source: 'live_nasa_donki', alerts: parsed };
    }
  } catch {}
  return { source: 'curated_nasa_donki', alerts: CURATED_DONKI_ALERTS };
}

// --------------------------------------------------------------------------
// 3. TECHTRANSFER (NASA Technology Transfer, Patents & Spinoffs)
// --------------------------------------------------------------------------
const CURATED_TECHTRANSFER = [
  {
    title: 'Propulsor Iónico de Efecto Hall con Blindaje Magnético',
    patent_id: 'NASA-PAT-9418291',
    category: 'Propulsión Espacial Avanzada',
    desc: 'Sistema de aceleración de plasma de xenón que reduce la erosión anódica en un 95%, permitiendo misiones interplanetarias continuas durante más de 10 años sin recarga de tobera.',
    effect: '-40% gasto de combustible en crucero y despegues orbitales optimizados (-3% coste por salto)',
    system: 'Propulsión',
    cost: 40
  },
  {
    title: 'Compuesto Aerogel de Silicio de Ultrabaja Densidad',
    patent_id: 'NASA-PAT-8815124',
    category: 'Protección Térmica & Blindaje',
    desc: 'Material nanométrico con 99.8% de aire que resiste temperaturas de hasta 1200°C protegiendo el casco durante reentradas atmosféricas hipersónicas.',
    effect: '-40% daño en el casco por fricción atmosférica, colisiones y sobrecalentamiento',
    system: 'Blindaje Térmico',
    cost: 40
  },
  {
    title: 'Bucle Cerrado de Recuperación y Purificación Catalítica de Agua (ECLSS)',
    patent_id: 'NASA-PAT-7928341',
    category: 'Soporte Vital',
    desc: 'Reactor de oxidación avanzada y destilación por compresión de vapor que recicla el 98% del agua de la tripulación en la nave con grado de pureza farmacéutico.',
    effect: '-50% consumo vital de oxígeno, agua y raciones de la tripulación durante expediciones',
    system: 'Soporte Vital',
    cost: 40
  },
  {
    title: 'Espectrómetro Láser Raman de Micro-Cavidad Óptica',
    patent_id: 'NASA-PAT-1049281',
    category: 'Instrumentación Científica',
    desc: 'Sensor ultracompacto para identificar biomarcadores de carbono orgánico y minerales hidratados a 15 metros de distancia sin destruir la muestra.',
    effect: 'Alcance de radar y escaneo duplicado (160 m) y +20 créditos de bonificación por hallazgo',
    system: 'Sensores y Escáner',
    cost: 40
  },
  {
    title: 'Aleación con Memoria de Forma Superelástica Nitinol-60',
    patent_id: 'NASA-PAT-9938192',
    category: 'Estructura & Tren de Aterrizaje',
    desc: 'Mallas metálicas moleculares para neumáticos y amortiguadores de aterrizaje que absorben impactos extremos sobre regolito sin desinflarse ni deformarse permanentemente.',
    effect: 'Amortiguación superelástica: duplica la tolerancia de velocidad y ángulo en la toma a tierra',
    system: 'Tren de Aterrizaje',
    cost: 40
  }
];

async function loadTechTransfer(query = 'propulsion') {
  const apiKey = getApiKey();
  const url = `https://api.nasa.gov/techtransfer/patent/?${encodeURIComponent(query)}&api_key=${apiKey}`;
  try {
    const data = await fetchJson(url);
    if (data && Array.isArray(data.results) && data.results.length > 0) {
      const patents = data.results.slice(0, 6).map(r => ({
        title: r[2] || 'Patente NASA de Exploración',
        patent_id: r[1] || 'NASA-PAT',
        category: r[3] || 'Tecnología de Vuelo Espacial',
        desc: (r[4] || '').replace(/<[^>]+>/g, '').slice(0, 220) + '...'
      }));
      return { source: 'live_nasa_techtransfer', results: patents };
    }
  } catch {}
  return { source: 'curated_nasa_techtransfer', results: CURATED_TECHTRANSFER };
}

// --------------------------------------------------------------------------
// 4. INSIGHT: MARS WEATHER SERVICE (Elysium Planitia Telemetry)
// --------------------------------------------------------------------------
const CURATED_MARS_WEATHER = {
  station: 'InSight Lander // Elysium Planitia, Marte (4.502° N, 135.623° E)',
  season: 'Primavera Tardía / Verano Austral en Marte (Ls 142°)',
  sol: 712,
  temperature: { min_c: -96.4, max_c: -12.8, avg_c: -62.1, unit: '°C' },
  pressure: { avg_pa: 724.8, min_pa: 698.2, max_pa: 762.1, unit: 'Pa (Atmósfera tenue de CO₂)' },
  wind: { avg_speed_mps: 4.8, max_gust_mps: 16.4, direction: 'ONO (Oeste-Noroeste)', dust_devils: '3 vórtices de polvo detectados' },
  radiation: '0.64 mGy/día (Radiación solar y cósmica de superficie)'
};

async function loadMarsWeather() {
  const apiKey = getApiKey();
  const url = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;
  try {
    const data = await fetchJson(url);
    if (data && data.sol_keys && data.sol_keys.length > 0) {
      const latestSol = data.sol_keys[data.sol_keys.length - 1];
      const solData = data[latestSol];
      return {
        source: 'live_nasa_insight',
        station: 'NASA InSight Lander // Elysium Planitia, Marte',
        sol: Number(latestSol),
        temperature: {
          min_c: solData.AT?.mn ? Number(solData.AT.mn.toFixed(1)) : -95.0,
          max_c: solData.AT?.mx ? Number(solData.AT.mx.toFixed(1)) : -14.0,
          avg_c: solData.AT?.av ? Number(solData.AT.av.toFixed(1)) : -61.0,
          unit: '°C'
        },
        pressure: {
          avg_pa: solData.PRE?.av ? Number(solData.PRE.av.toFixed(1)) : 720.0,
          unit: 'Pa'
        },
        wind: {
          avg_speed_mps: solData.HWS?.av ? Number(solData.HWS.av.toFixed(1)) : 5.2,
          unit: 'm/s'
        }
      };
    }
  } catch {}
  return { source: 'curated_nasa_insight', ...CURATED_MARS_WEATHER };
}

module.exports = {
  loadNeoWs,
  loadDonki,
  loadTechTransfer,
  loadMarsWeather,
  CURATED_NEOWS_ASTEROIDS,
  CURATED_DONKI_ALERTS,
  CURATED_TECHTRANSFER,
  CURATED_MARS_WEATHER
};

