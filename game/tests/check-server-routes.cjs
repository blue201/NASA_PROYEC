const http = require('http');
const assert = require('assert');
const { createServer } = require('../serve.cjs');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:8080${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  let server = null;
  try {
    await get('/');
  } catch {
    server = createServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(8080, '127.0.0.1', resolve);
    });
  }
  try {
  // 1. Root route
  const rootRes = await get('/');
  assert.strictEqual(rootRes.status, 200, 'GET / debe retornar 200');
  assert(rootRes.body.includes('NASA ODYSSEY'), 'GET / debe contener index.html');

  // 2. Redirects for in-game integration without external page or 404
  const nasaRes = await get('/nasa');
  assert.strictEqual(nasaRes.status, 302, 'GET /nasa debe redirigir');
  assert.strictEqual(nasaRes.headers.location, '/index.html?nasa=1');

  const prologueRes = await get('/prologue');
  assert.strictEqual(prologueRes.status, 302, 'GET /prologue debe redirigir');
  assert.strictEqual(prologueRes.headers.location, '/index.html?prologue=1');

  const epilogueRes = await get('/epilogue');
  assert.strictEqual(epilogueRes.status, 302, 'GET /epilogue debe redirigir');
  assert.strictEqual(epilogueRes.headers.location, '/index.html?epilogue=1');

  // 3. In-game APIs
  const apodRes = await get('/api/apod');
  assert.strictEqual(apodRes.status, 200, 'GET /api/apod debe retornar 200');
  const apodJson = JSON.parse(apodRes.body);
  assert(apodJson.title, 'APOD debe tener título');

  const neowsRes = await get('/api/neows');
  assert.strictEqual(neowsRes.status, 200, 'GET /api/neows debe retornar 200');
  const neowsJson = JSON.parse(neowsRes.body);
  assert(Array.isArray(neowsJson.asteroids), 'NeoWs debe tener array de asteroides');

  const donkiRes = await get('/api/donki');
  assert.strictEqual(donkiRes.status, 200, 'GET /api/donki debe retornar 200');
  const donkiJson = JSON.parse(donkiRes.body);
  assert(Array.isArray(donkiJson.alerts), 'DONKI debe tener alertas');

  // 4. Assets for character presentation
  const sofiaRes = await get('/assets/sofia_parker.jpg');
  assert.strictEqual(sofiaRes.status, 200, 'GET /assets/sofia_parker.jpg debe retornar 200');

  console.log('PASS: check-server-routes.cjs validó todas las rutas y APIs con éxito.');
  } finally {
    if (server) await new Promise(r => server.close(r));
  }
}

run().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});

