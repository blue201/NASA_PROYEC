// Descarga y cachea los datos externos como JSON dentro del repo.
// Se corre a mano (npm run fetch-data); el juego en producción solo lee el caché,
// así no hay llamadas a APIs ni llaves en el frontend.
//
// Fuentes:
//  - NASA Image and Video Library: https://images-api.nasa.gov (no requiere llave)
//  - JPL Horizons API:             https://ssd.jpl.nasa.gov/api/horizons.api (no requiere llave)

import { writeFile, mkdir } from 'node:fs/promises';

const OUT = new URL('../src/data/cache/', import.meta.url);

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

async function save(name, data) {
  await mkdir(OUT, { recursive: true });
  await writeFile(new URL(name, OUT), JSON.stringify(data, null, 2) + '\n');
  console.log(`✓ ${name}`);
}

// ---------- NASA Image and Video Library ----------
const IMAGE_QUERIES = ['lunar south pole', 'cubesat', 'moon orbit spacecraft'];

async function fetchImages() {
  const items = [];
  for (const q of IMAGE_QUERIES) {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=6`;
    const json = await getJson(url);
    for (const it of json.collection.items.slice(0, 6)) {
      const d = it.data?.[0] ?? {};
      const thumb = it.links?.find((l) => l.rel === 'preview')?.href;
      items.push({
        nasa_id: d.nasa_id,
        title: d.title,
        description: d.description_508 ?? d.description ?? '',
        center: d.center ?? null,
        date_created: d.date_created ?? null,
        thumb,
        query: q,
        source_url: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`,
      });
    }
  }
  await save('nasa-images.json', {
    source: 'NASA Image and Video Library',
    api: 'https://images-api.nasa.gov/search',
    retrieved_at: new Date().toISOString(),
    items,
  });
}

// ---------- JPL Horizons: distancia Tierra–Luna ----------
async function fetchHorizons() {
  const start = new Date();
  const stop = new Date(start.getTime() + 30 * 86400e3);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: "'301'",        // Luna
    CENTER: "'500@399'",     // geocentro de la Tierra
    EPHEM_TYPE: "'VECTORS'",
    VEC_TABLE: "'3'",        // incluye LT (light time), RG (distancia), RR
    OUT_UNITS: "'KM-S'",
    START_TIME: `'${fmt(start)}'`,
    STOP_TIME: `'${fmt(stop)}'`,
    STEP_SIZE: "'1 d'",
    CSV_FORMAT: "'YES'",
  });
  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params}`;
  const json = await getJson(url);
  const block = json.result.split('$$SOE')[1]?.split('$$EOE')[0] ?? '';
  // Columnas CSV con VEC_TABLE=3: JDTDB, Fecha, X, Y, Z, VX, VY, VZ, LT, RG, RR
  const rows = block.trim().split('\n').map((line) => {
    const c = line.split(',').map((s) => s.trim());
    return { date: c[1], light_time_s: Number(c[8]), range_km: Number(c[9]) };
  }).filter((r) => Number.isFinite(r.range_km));
  await save('horizons-moon.json', {
    source: 'JPL Horizons',
    source_url: url,
    retrieved_at: new Date().toISOString(),
    target: 'Moon (301)',
    center: 'Earth geocenter (500@399)',
    rows,
  });
}

await fetchImages();
await fetchHorizons();
