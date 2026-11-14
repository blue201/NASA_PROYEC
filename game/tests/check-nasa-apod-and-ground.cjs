const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const THREE = require('../assets/vendor/three-r128.min.js');

// 1. Verificar servicio APOD y catálogo curado de la NASA
const apodService = require('../services/apod-service.cjs');
assert.ok(typeof apodService.parseApod === 'function');
assert.ok(typeof apodService.loadApod === 'function');
assert.ok(typeof apodService.loadApodGallery === 'function');
assert.ok(Array.isArray(apodService.CURATED_APOD_GALLERY));
assert.ok(apodService.CURATED_APOD_GALLERY.length >= 5);

(async () => {
  const apod = await apodService.loadApod();
  assert.ok(apod.title, 'APOD debe tener título');
  assert.ok(apod.url, 'APOD debe tener URL');
  assert.ok(apod.explanation, 'APOD debe tener explicación');

  const gallery = await apodService.loadApodGallery(4);
  assert.ok(Array.isArray(gallery));
  assert.ok(gallery.length >= 3);
  for (const item of gallery) {
    assert.ok(item.title && item.url);
  }

  // 2. Verificar NasaApiService (nasa-api.js)
  const windowCtx = {};
  const context = { window: windowCtx, THREE, console, document: { createElement: () => ({ getContext: () => ({ fillStyle:'', fillRect(){}, createRadialGradient:()=>({addColorStop(){}}), beginPath(){}, arc(){}, fill(){}, stroke(){}, putImageData(){} }), width:1024, height:1024 }) } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/jarvis/nasa-api.js'), 'utf8'), context);
  const nasaApi = windowCtx.nasaApi;
  assert.ok(nasaApi, 'nasaApi debe estar instanciado');

  const skyboxes = nasaApi.getCuratedNasaSkyboxes();
  assert.ok(Array.isArray(skyboxes) && skyboxes.length >= 5, 'Debe haber fondos curados de la NASA');
  assert.ok(skyboxes.some(s => s.name.includes('Carina') || s.name.includes('JWST')));
  assert.ok(skyboxes.some(s => s.name.includes('Pilares') || s.name.includes('Hubble')));

  const moonSites = nasaApi.getNasaGroundSites('moon');
  assert.ok(moonSites.length >= 3, 'Debe haber hitos históricos en la Luna');
  assert.ok(moonSites.some(s => s.id.includes('apollo11')));

  const marsSites = nasaApi.getNasaGroundSites('mars');
  assert.ok(marsSites.length >= 3, 'Debe haber hitos históricos en Marte');
  assert.ok(marsSites.some(s => s.id.includes('curiosity')));
  assert.ok(marsSites.some(s => s.id.includes('perseverance')));

  // Texturas de suelo
  const marsTex = nasaApi.createMarsRegolithTexture();
  assert.ok(marsTex && marsTex.isTexture, 'createMarsRegolithTexture debe retornar una textura Three.js');

  const lunarTex = nasaApi.createLunarRegolithTexture();
  assert.ok(lunarTex && lunarTex.isTexture, 'createLunarRegolithTexture debe retornar una textura Three.js');

  // 3. Verificar NasaGroundPoints (nasa-ground-points.js)
  const gpContext = {
    window: windowCtx,
    THREE,
    console,
    localStorage: { getItem: () => null, setItem() {} },
    document: {
      getElementById: () => null,
      body: { appendChild() {} },
      createElement: () => ({
        style: {},
        innerHTML: '',
        setAttribute() {},
        appendChild() {},
        querySelector: () => ({ onclick: null }),
        showModal() {},
        close() {}
      })
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/world/nasa-ground-points.js'), 'utf8'), gpContext);
  const groundMgr = windowCtx.NasaGroundPoints;
  assert.ok(groundMgr, 'NasaGroundPoints debe estar disponible');

  const mockEngine = {
    scene: new THREE.Scene(),
    planetKey: 'mars',
    isActive: true,
    shipGroup: new THREE.Group()
  };
  mockEngine.shipGroup.position.set(0, 50, 0);

  groundMgr.setup(mockEngine, () => 15);
  assert.ok(groundMgr.sites.length >= 3, 'Debe haber colocado hitos en la superficie de Marte');
  assert.ok(mockEngine.scene.children.some(c => c.name === 'Hitos Científicos NASA'));

  // Simular aproximación al rover Curiosity
  const curiositySite = groundMgr.sites.find(s => s.id.includes('curiosity'));
  assert.ok(curiositySite);
  mockEngine.shipGroup.position.copy(curiositySite.position);
  groundMgr.update(0.1);
  assert.ok(curiositySite.discovered, 'Curiosity debe marcarse como descubierto al aproximarse');

  groundMgr.dispose();
  assert.equal(groundMgr.sites.length, 0, 'Dispose debe limpiar los hitos de la escena');

  console.log('PASS: NASA APOD API integration, curated deep-space backgrounds, planetary ground textures, and historical NASA mission ground beacons.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});

