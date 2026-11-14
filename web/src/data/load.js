// Carga los datos externos.
// Si VITE_API_URL está definida (dev con Docker), los pide al backend en vivo.
// Si no, o si el backend falla, usa el JSON cacheado en el repo, que es lo que
// sirve el sitio público en GitHub Pages.
import cachedImages from './cache/nasa-images.json';
import cachedHorizons from './cache/horizons-moon.json';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

async function fromApi(path, fallback) {
  if (!API_URL) return { ...fallback, origin: 'cache' };
  try {
    const res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(res.status);
    return { ...(await res.json()), origin: 'api' };
  } catch (err) {
    console.warn(`Backend no disponible (${path}), usando caché:`, err);
    return { ...fallback, origin: 'cache' };
  }
}

export async function loadData() {
  const [images, horizons] = await Promise.all([
    fromApi('/api/images', cachedImages),
    fromApi('/api/distance', cachedHorizons),
  ]);
  return { images, horizons };
}
