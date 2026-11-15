/* Paso d: datos reales de la Luna.
   Pide a la API (puerto 8787) los datos del planeta, la distancia Tierra–Luna (JPL Horizons)
   y las imágenes (NASA Image and Video Library). Si la API no responde, usa la copia local
   de data/planets/moon.json (moon.fallback.json) y muestra un aviso en pantalla.
   Expone window.MoonData = { ready, planet, distance, images, source }.
   URL de la API: ?api=http://host:puerto en la URL del juego, o http://<mismo host>:8787 por defecto.
   Zona común: cambios con revisión. */
(function () {
  const TIMEOUT_MS = 4000;
  const FALLBACK_URL = 'js/design/moon.fallback.json';
  const IMAGES_FALLBACK = 'js/design/nasa-images.fallback.json';
  const DISTANCE_FALLBACK = 'js/design/horizons-moon.fallback.json';
  const params = new URLSearchParams(location.search);
  // En el sitio publicado (https, sin servidor propio) no hay API: se usan los datos guardados.
  const STATIC = !params.get('api') && location.protocol === 'https:';
  const API = (params.get('api') || location.protocol + '//' + location.hostname + ':8787').replace(/\/$/, '');

  function getJson(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    return fetch(url, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(r.status + ' ' + url); return r.json(); })
      .finally(() => clearTimeout(timer));
  }

  function banner(text) {
    const show = () => {
      const b = document.createElement('div');
      b.className = 'hg-banner';
      b.setAttribute('role', 'status');
      b.textContent = text;
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 12000);
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  }

  const data = { planet: null, distance: null, images: [], source: 'cargando', api: API };

  data.ready = (async () => {
    const none = Promise.reject(new Error('sitio estático'));
    none.catch(() => {});
    const [planet, distance, images] = await Promise.allSettled(STATIC ? [none, none, none] : [
      getJson(API + '/api/planets/moon'),
      getJson(API + '/api/distance'),
      getJson(API + '/api/images'),
    ]);
    if (planet.status === 'fulfilled') {
      data.planet = planet.value;
      data.source = 'api';
    } else {
      data.planet = await getJson('data/planets/moon.json').catch(() => getJson(FALLBACK_URL)).catch(() => null);
      data.source = 'local';
      console.warn('API no disponible, usando moon.fallback.json:', planet.reason);
    }
    // Sin API: distancia e imágenes guardadas (JPL Horizons y NASA Image Library, con su fecha de consulta).
    const dist = distance.status === 'fulfilled' ? distance.value : await getJson(DISTANCE_FALLBACK).catch(() => null);
    if (dist && dist.rows && dist.rows.length) {
      const today = dist.rows[0];
      data.distance = { km: today.range_km, lightTimeS: today.light_time_s, date: today.date, source_url: dist.source_url, retrieved_at: dist.retrieved_at };
    }
    const imgs = images.status === 'fulfilled' ? images.value : await getJson(IMAGES_FALLBACK).catch(() => null);
    data.images = (imgs && imgs.items) || [];
    if (data.source !== 'api' && !STATIC) {
      banner('Sin conexión con la API: usando datos guardados de la Luna. El juego sigue funcionando.');
    }
    document.dispatchEvent(new CustomEvent('moondata:ready', { detail: data }));
    return data;
  })();

  window.MoonData = data;
})();
