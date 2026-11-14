// Backend mínimo sin dependencias (Node 22+).
//   GET /health
//   GET /api/images     -> NASA Image and Video Library normalizado
//   GET /api/distance   -> distancia Tierra–Luna de JPL Horizons
// Las respuestas se guardan en memoria (TTL) para no golpear las APIs de NASA.
import { createServer } from 'node:http';
import { fetchImages, fetchMoonDistance } from './sources.js';

const PORT = Number(process.env.PORT ?? 8080);
const TTL_MS = Number(process.env.CACHE_TTL_MIN ?? 60) * 60e3;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';

const cache = new Map();
async function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  const data = await loader();
  cache.set(key, { at: Date.now(), data });
  return data;
}

const routes = {
  '/health': async () => ({ ok: true }),
  '/api/images': () => cached('images', () => fetchImages()),
  '/api/distance': () => cached('distance', () => fetchMoonDistance()),
};

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const handler = req.method === 'GET' && routes[pathname];
  if (!handler) {
    res.writeHead(404).end(JSON.stringify({ error: 'not found' }));
    return;
  }
  try {
    res.end(JSON.stringify(await handler()));
  } catch (err) {
    console.error(err);
    res.writeHead(502).end(JSON.stringify({ error: 'upstream error', detail: err.message }));
  }
});

server.listen(PORT, () => console.log(`api escuchando en :${PORT}`));
