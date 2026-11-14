// Reporte final: explica por qué pasó lo que pasó. Dueño sugerido: dev 3.
import { state, designTotals } from '../../state.js';

export function renderReport(root, { go }) {
  const m = state.mission;
  if (!m?.done) {
    root.innerHTML = `<p class="hint">Completa los 3 pases para ver el reporte.</p><button class="primary" id="back">Ir a la misión</button>`;
    root.querySelector('#back').onclick = () => go('mission');
    return;
  }
  const t = designTotals();
  const { instrument, comms } = m.parts;
  const science = Math.round(m.downlinkedMb * instrument.science);
  const lessons = [];
  if (m.log.some((e) => e.safeMode)) lessons.push('La batería se agotó al menos una vez. Más generación o batería, o apagar el instrumento en la tormenta, lo habría evitado.');
  if (m.storedMb > 0) lessons.push(`Quedaron ${m.storedMb.toFixed(0)} MB sin bajar: tu radio (${comms.name}) fue el cuello de botella.`);
  if (t.costUsd < state.catalog.startingBudget * 0.6) lessons.push('Te sobró mucho presupuesto: podías llevar un instrumento o radio mejor.');
  if (!lessons.length) lessons.push('Diseño equilibrado: energía, datos y presupuesto alcanzaron para la misión.');

  root.innerHTML = `
    <section class="report">
      <h2>Reporte de misión</h2>
      <p class="big">${science} puntos de ciencia</p>
      <p>${m.downlinkedMb.toFixed(1)} MB recibidos en Tierra con ${instrument.name.toLowerCase()} y ${comms.name.toLowerCase()}.</p>
      <h3>Qué aprendimos</h3>
      <ul>${lessons.map((l) => `<li>${l}</li>`).join('')}</ul>
      <button class="primary" id="again">Rediseñar y volver a intentar</button>
    </section>`;
  root.querySelector('#again').onclick = () => {
    state.mission = null;
    go('design');
  };
}
