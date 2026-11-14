// Descarga ambas fuentes y escribe el caché que usa el frontend publicado
// (web/src/data/cache/). Correr antes de cada deploy: npm run cache
import { writeFile, mkdir } from 'node:fs/promises';
import { fetchImages, fetchMoonDistance } from '../src/sources.js';

const OUT = new URL(process.env.CACHE_DIR ?? '../../web/src/data/cache/', import.meta.url);

async function save(name, data) {
  await mkdir(OUT, { recursive: true });
  await writeFile(new URL(name, OUT), JSON.stringify(data, null, 2) + '\n');
  console.log(`✓ ${name}`);
}

await save('nasa-images.json', await fetchImages());
await save('horizons-moon.json', await fetchMoonDistance());
