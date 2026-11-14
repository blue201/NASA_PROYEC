// Panel de fuentes de datos (requisito del reto). Dueño sugerido: dev 4.
import catalog from '../../data/cubesat.json';
import { state } from '../../state.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function renderSources(root) {
  const { images, horizons } = state.data;
  const origin = (d) => (d.origin === 'api' ? 'en vivo desde el backend' : 'caché del repo');
  root.innerHTML = `
    <section class="sources">
      <h2>Fuentes de datos</h2>
      <h3>JPL Horizons</h3>
      <p>Distancia Tierra–Luna y tiempo de luz, usados para el retardo de señal y el tiempo de viaje.
      Consultado: ${esc(horizons.retrieved_at)} (${origin(horizons)}). <a href="${esc(horizons.source_url)}" target="_blank" rel="noopener">Consulta original</a></p>
      <h3>NASA Image and Video Library</h3>
      <p>Consultado: ${esc(images.retrieved_at)} (${origin(images)}).</p>
      <div class="gallery">
        ${images.items
          .map(
            (i) => `<a href="${esc(i.source_url)}" target="_blank" rel="noopener" title="${esc(i.title)}">
              <img src="${esc(i.thumb)}" alt="${esc(i.title)}" loading="lazy"/><small>${esc(i.nasa_id)}</small></a>`
          )
          .join('')}
      </div>
      <h3>Valores de los subsistemas</h3>
      <p>${esc(catalog._meta.note)} <a href="${esc(catalog._meta.source_url)}" target="_blank" rel="noopener">CubeSat 101</a></p>
      <p class="hint">Este proyecto no está respaldado por NASA. Hecho con ayuda de IA (ver README).</p>
    </section>`;
}
