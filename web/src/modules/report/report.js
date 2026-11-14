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
  const fit = m.objective.value[instrument.id];
  const science = Math.round(m.downlinkedMb * fit * m.orbit.scienceMult);
  const lessons = [];
  const best = Object.entries(m.objective.value).sort((a, b) => b[1] - a[1])[0][0];
  if (instrument.id !== best) {
    const bestName = state.catalog.subsystems.instrument.options.find((o) => o.id === best).name;
    lessons.push(`Para "${m.objective.name.toLowerCase()}" tu instrumento valía ×${fit}; ${bestName.toLowerCase()} habría valido ×${m.objective.value[best]}.`);
  }
  lessons.push(
    m.orbit.scienceMult > 1
      ? `La ${m.orbit.name.toLowerCase()} multiplicó tu ciencia ×${m.orbit.scienceMult}, a cambio de solo ${m.orbit.contactMin} min de contacto por pase.`
      : `La ${m.orbit.name.toLowerCase()} te dio ${m.orbit.contactMin} min de contacto por pase, pero redujo la ciencia a ×${m.orbit.scienceMult}.`
  );
  if (m.log.some((e) => e.safeMode)) lessons.push('La batería se agotó al menos una vez. Más generación o batería, o apagar el instrumento en la tormenta, lo habría evitado.');
  if (m.storedMb > 0) lessons.push(`Quedaron ${m.storedMb.toFixed(0)} MB sin bajar: tu radio (${comms.name}) fue el cuello de botella.`);
  if (t.costUsd < state.catalog.startingBudget * 0.6) lessons.push('Te sobró mucho presupuesto: podías llevar un instrumento o radio mejor.');
  if (lessons.length <= 1) lessons.push('Diseño equilibrado: energía, datos y presupuesto alcanzaron para la misión.');

  root.innerHTML = `
    <section class="report">
      <h2>Reporte de misión</h2>
      <p class="hint">Objetivo: ${m.objective.name}</p>
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
