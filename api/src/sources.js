// Clientes de las dos fuentes externas. Ninguna requiere llave.
//  - NASA Image and Video Library: https://images-api.nasa.gov
//  - JPL Horizons API:             https://ssd.jpl.nasa.gov/api/horizons.api
// Cada respuesta se normaliza y lleva source_url + retrieved_at.

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'lunar-cubesat-mission (Space Apps 2026)' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

export const DEFAULT_IMAGE_QUERIES = ['lunar south pole', 'cubesat', 'moon orbit spacecraft'];

export async function fetchImages(queries = DEFAULT_IMAGE_QUERIES, perQuery = 6) {
  const items = [];
  for (const q of queries) {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=${perQuery}`;
    const json = await getJson(url);
    for (const it of json.collection.items.slice(0, perQuery)) {
      const d = it.data?.[0] ?? {};
      items.push({
        nasa_id: d.nasa_id,
        title: d.title,
        description: d.description_508 ?? d.description ?? '',
        center: d.center ?? null,
        date_created: d.date_created ?? null,
        thumb: it.links?.find((l) => l.rel === 'preview')?.href ?? null,
        query: q,
        source_url: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`,
      });
    }
  }
  return {
    source: 'NASA Image and Video Library',
    api: 'https://images-api.nasa.gov/search',
    retrieved_at: new Date().toISOString(),
    items,
  };
}

// Distancia Tierra–Luna (y tiempo de luz) día por día.
export async function fetchMoonDistance(days = 30) {
  const start = new Date();
  const stop = new Date(start.getTime() + days * 86400e3);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: "'301'", // Luna
    CENTER: "'500@399'", // geocentro de la Tierra
    EPHEM_TYPE: "'VECTORS'",
    VEC_TABLE: "'3'", // incluye LT (light time), RG (distancia), RR
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
  const rows = block
    .trim()
    .split('\n')
    .map((line) => {
      const c = line.split(',').map((s) => s.trim());
      return { date: c[1], light_time_s: Number(c[8]), range_km: Number(c[9]) };
    })
    .filter((r) => Number.isFinite(r.range_km));
  if (!rows.length) throw new Error('Horizons no devolvió filas');
  return {
    source: 'JPL Horizons',
    source_url: url,
    retrieved_at: new Date().toISOString(),
    target: 'Moon (301)',
    center: 'Earth geocenter (500@399)',
    rows,
  };
}
