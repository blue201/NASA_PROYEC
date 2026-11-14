const fs = require('node:fs');
const path = require('node:path');

const decode=s=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#039;/g,"'").replace(/&quot;/g,'"').replace(/&#8217;/g,"'").replace(/\s+/g,' ').trim();

function parseApod(html){
  const image=html.match(/src="(https:\/\/assets\.science\.nasa\.gov\/[^"\s]*\/apod\/[^"\s]+)"/);
  const title=html.match(/<h2[^>]*class="display-48[^>]*>([\s\S]*?)<\/h2>/);
  const date=html.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(20\d{2})\s*<\/td>/);
  if(!image||!title||!date)throw Error('La estructura de APOD cambió o la publicación no es una imagen.');
  const month=['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(date[1])+1;
  const explanation=html.match(/<strong>Explanation:<\/strong>([\s\S]*?)<\/p>/)?.[1]||'';
  return {title:decode(title[1]),date:`${date[3]}-${String(month).padStart(2,'0')}-${date[2].padStart(2,'0')}`,url:decode(image[1]),media_type:'image',explanation:decode(explanation),source:'https://science.nasa.gov/apod/'};
}

// Curated high-res NASA APOD & Deep Space Observatory library (JWST, Hubble, ESO)
const CURATED_APOD_GALLERY = [
  {
    id: 'carina_jwst',
    title: 'Acantilados Cósmicos en la Nebulosa Carina (JWST)',
    date: '2022-07-13',
    url: 'https://apod.nasa.gov/apod/image/2207/Carina_JWST_960.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/2207/Carina_JWST_12000.jpg',
    localFallback: 'assets/milky-way-eso.jpg',
    media_type: 'image',
    copyright: 'NASA, ESA, CSA, STScI',
    explanation: 'Capturada por la cámara infrarroja NIRCam del Telescopio Espacial James Webb, esta vista muestra las "Acantilados Cósmicos" en la región de formación estelar NGC 3324.',
    source: 'https://apod.nasa.gov/apod/ap220713.html'
  },
  {
    id: 'pillars_creation',
    title: 'Pilares de la Creación (Telescopio Espacial Hubble)',
    date: '2015-01-07',
    url: 'https://apod.nasa.gov/apod/image/1501/PillarsOfCreation_Hubble_960.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/1501/PillarsOfCreation_Hubble_big.jpg',
    localFallback: 'assets/milky-way-eso.jpg',
    media_type: 'image',
    copyright: 'NASA, ESA, Hubble Heritage Team',
    explanation: 'Columnas monumentales de gas de hidrógeno interestelar y polvo en la Nebulosa del Águila (M16), esculpidas por la radiación ultravioleta de estrellas masivas.',
    source: 'https://apod.nasa.gov/apod/ap150107.html'
  },
  {
    id: 'andromeda_m31',
    title: 'Galaxia Espiral de Andrómeda (M31)',
    date: '2023-10-18',
    url: 'https://apod.nasa.gov/apod/image/2310/M31_HubbleSubaru_960.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/2310/M31_HubbleSubaru_orig.jpg',
    localFallback: 'assets/milky-way-eso.jpg',
    media_type: 'image',
    copyright: 'NASA, ESA, Digitized Sky Survey 2',
    explanation: 'La galaxia espiral gigante más cercana a la Vía Láctea, situada a 2.5 millones de años luz en la constelación de Andrómeda.',
    source: 'https://apod.nasa.gov/apod/ap231018.html'
  },
  {
    id: 'orion_m42',
    title: 'Gran Nebulosa de Orión (M42)',
    date: '2024-01-24',
    url: 'https://apod.nasa.gov/apod/image/2401/Orion_Hubble_960.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/2401/Orion_Hubble_orig.jpg',
    localFallback: 'assets/milky-way-eso.jpg',
    media_type: 'image',
    copyright: 'NASA, ESA, M. Robberto',
    explanation: 'La guardería estelar masiva más cercana a nuestro Sistema Solar, a unos 1,350 años luz de la Tierra, visible a simple vista al sur del Cinturón de Orión.',
    source: 'https://apod.nasa.gov/apod/ap240124.html'
  },
  {
    id: 'webb_deep_field',
    title: 'Primer Campo Profundo de Webb (SMACS 0723)',
    date: '2022-07-12',
    url: 'https://apod.nasa.gov/apod/image/2207/WebbDeepField_SMACS0723_960.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/2207/WebbDeepField_SMACS0723_4k.jpg',
    localFallback: 'assets/milky-way-eso.jpg',
    media_type: 'image',
    copyright: 'NASA, ESA, CSA, STScI',
    explanation: 'La imagen infrarroja más profunda y nítida del universo distante hasta la fecha, con cúmulos de galaxias magnificados por lente gravitacional.',
    source: 'https://apod.nasa.gov/apod/ap220712.html'
  },
  {
    id: 'milky_way_eso',
    title: 'Vía Láctea · Panorama 360° Observatorio Austral Europeo',
    date: '2026-10-20',
    url: 'assets/milky-way-eso.jpg',
    hdurl: 'assets/milky-way-eso.jpg',
    localFallback: 'assets/milky-way-eso.jpg',
    media_type: 'image',
    copyright: 'ESO / S. Brunier',
    explanation: 'Proyección cilíndrica de la bóveda celeste completa centrada en el bulbo de la Vía Láctea y las Nubes de Magallanes.',
    source: 'https://www.eso.org/public/images/eso0932a/'
  }
];

function getNasaApiKey() {
  if (process.env.NASA_API_KEY && process.env.NASA_API_KEY.trim()) {
    return process.env.NASA_API_KEY.trim();
  }
  try {
    const keyFile = path.join(__dirname, '..', '.local', 'nasa-key');
    if (fs.existsSync(keyFile)) {
      const key = fs.readFileSync(keyFile, 'utf8').trim();
      if (key) return key;
    }
  } catch {}
  return 'DEMO_KEY';
}

let cached, time=0;
let cachedGallery = null, galleryTime = 0;

async function loadApod(options = {}) {
  const apiKey = getNasaApiKey();
  const dateParam = options.date ? `&date=${encodeURIComponent(options.date)}` : '';

  if (!options.date && cached && Date.now() - time < 300000) {
    return cached;
  }

  // 1. Intentar API oficial de NASA
  try {
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true${dateParam}`;
    const r = await fetch(apiUrl, { signal: AbortSignal.timeout(9000) });
    if (r.ok) {
      const data = await r.json();
      if (data && data.url) {
        const item = {
          title: data.title || 'Astronomical Picture of the Day',
          date: data.date || new Date().toISOString().slice(0, 10),
          url: data.hdurl || data.url,
          hdurl: data.hdurl || data.url,
          standardUrl: data.url,
          media_type: data.media_type || 'image',
          explanation: data.explanation || '',
          copyright: data.copyright || 'NASA / APOD',
          source: `https://apod.nasa.gov/apod/ap${(data.date || '').slice(2).replace(/-/g, '')}.html`
        };
        if (!options.date) { cached = item; time = Date.now(); }
        return item;
      }
    }
  } catch {}

  // 2. Intentar scraping de respaldo en science.nasa.gov
  try {
    const r = await fetch('https://science.nasa.gov/apod/', { signal: AbortSignal.timeout(9000) });
    if (r.ok) {
      const html = await r.text();
      if (html.length <= 3000000) {
        const parsed = parseApod(html);
        if (parsed && parsed.url) {
          cached = parsed;
          time = Date.now();
          return parsed;
        }
      }
    }
  } catch {}

  // 3. Biblioteca curada de NASA APOD
  if (cached) return cached;
  const fallback = CURATED_APOD_GALLERY[0];
  cached = fallback;
  time = Date.now();
  return fallback;
}

async function loadApodGallery(count = 6) {
  if (cachedGallery && Date.now() - galleryTime < 600000) {
    return cachedGallery;
  }

  const apiKey = getNasaApiKey();
  try {
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${Math.min(12, Math.max(3, count))}&thumbs=true`;
    const r = await fetch(apiUrl, { signal: AbortSignal.timeout(9000) });
    if (r.ok) {
      const list = await r.json();
      if (Array.isArray(list) && list.length > 0) {
        const gallery = list.filter(item => item && item.media_type === 'image' && item.url).map((data, idx) => ({
          id: `apod_live_${idx}`,
          title: data.title || 'NASA APOD',
          date: data.date || '',
          url: data.hdurl || data.url,
          hdurl: data.hdurl || data.url,
          standardUrl: data.url,
          media_type: 'image',
          explanation: data.explanation || '',
          copyright: data.copyright || 'NASA',
          source: `https://apod.nasa.gov/apod/ap${(data.date || '').slice(2).replace(/-/g, '')}.html`
        }));
        if (gallery.length > 0) {
          cachedGallery = gallery;
          galleryTime = Date.now();
          return gallery;
        }
      }
    }
  } catch {}

  cachedGallery = CURATED_APOD_GALLERY;
  galleryTime = Date.now();
  return CURATED_APOD_GALLERY;
}

module.exports = { parseApod, loadApod, loadApodGallery, CURATED_APOD_GALLERY };
