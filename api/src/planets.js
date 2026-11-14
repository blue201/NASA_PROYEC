// Lee y valida los archivos de data/planets/*.json (contrato compartido).
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const PLANETS_DIR =
  process.env.PLANETS_DIR ?? fileURLToPath(new URL('../../data/planets/', import.meta.url));

const isMeasured = (v) =>
  v && typeof v === 'object' && 'value' in v && 'unit' in v && (v.source_url || v.source_api);

// Devuelve una lista de problemas (vacía = válido).
export function validatePlanet(p, file = '') {
  const errs = [];
  const at = (msg) => errs.push(`${file}: ${msg}`);
  for (const k of ['id', 'name', 'schema_version', 'physical', 'resources', 'hazards']) if (!(k in p)) at(`falta "${k}"`);
  if (file && p.id && file !== `${p.id}.json`) at(`el archivo debería llamarse ${p.id}.json`);
  for (const [k, v] of Object.entries(p.physical ?? {})) if (!isMeasured(v)) at(`physical.${k} necesita value, unit y source_url`);
  for (const r of p.resources ?? []) {
    if (!r.id || !r.name) at('cada recurso necesita id y name');
    if (!isMeasured(r.abundance)) at(`resources.${r.id}.abundance necesita value, unit y source_url`);
  }
  for (const h of p.hazards ?? []) {
    if (!h.id || !h.name) at('cada peligro necesita id y name');
    if (!h.source_url) at(`hazards.${h.id} necesita source_url`);
    if (!h.game_effect?.target) at(`hazards.${h.id} necesita game_effect.target`);
  }
  return errs;
}

export async function loadPlanets() {
  const files = (await readdir(PLANETS_DIR)).filter((f) => f.endsWith('.json') && f !== 'schema.json');
  const planets = [];
  for (const f of files.sort()) {
    const p = JSON.parse(await readFile(PLANETS_DIR + '/' + f, 'utf8'));
    planets.push({ file: f, data: p, problems: validatePlanet(p, f) });
  }
  return planets;
}
