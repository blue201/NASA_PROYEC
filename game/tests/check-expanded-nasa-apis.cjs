const assert = require('node:assert/strict');
const path = require('node:path');
const svc = require('../services/nasa-api-services.cjs');

(async () => {
  // 1. NeoWs Asteroids
  const neo = await svc.loadNeoWs();
  assert(neo && neo.asteroids && neo.asteroids.length >= 5, 'NeoWs asteroids available');
  assert(neo.asteroids.some(a => a.is_potentially_hazardous), 'Has potentially hazardous asteroids');
  assert(neo.asteroids.some(a => a.name.includes('Apophis') || a.name.includes('Bennu')), 'Contains notable NASA NEOs');

  // 2. DONKI Space Weather
  const donki = await svc.loadDonki();
  assert(donki && donki.alerts && donki.alerts.length >= 3, 'DONKI alerts available');
  assert(donki.alerts.some(a => a.messageType === 'CME' || a.messageType === 'FLR'), 'Contains CME or Solar Flare alerts');

  // 3. TechTransfer Patents
  const tech = await svc.loadTechTransfer('propulsion');
  assert(tech && tech.results && tech.results.length >= 3, 'TechTransfer results available');
  assert(tech.results.some(r => r.title && r.patent_id), 'TechTransfer items have titles and IDs');

  // 4. InSight Mars Weather
  const mars = await svc.loadMarsWeather();
  assert(mars && mars.temperature && Number.isFinite(mars.temperature.avg_c), 'Mars weather has temperature');
  assert(mars.pressure && (Number.isFinite(mars.pressure.avg_pa) || typeof mars.pressure.avg_pa === 'number'), 'Mars pressure available');

  console.log('PASS: NeoWs Asteroids, DONKI Space Weather, TechTransfer Patents and InSight Mars Weather verified.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});

