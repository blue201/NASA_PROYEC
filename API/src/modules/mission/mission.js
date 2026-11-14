// Fase 2: misión en órbita lunar, 3 pases sobre el polo sur. Dueño sugerido: dev 2.
import { state, emit, designTotals, pick, AVIONICS } from '../../state.js';
import horizons from '../../data/cache/horizons-moon.json';

const PASS_HOURS = 2; // duración de cada órbita/pase (balance de juego)
const SUNLIT_FRACTION = 0.4; // fracción de la órbita con sol
const CONTACT_S = 20 * 60; // ventana de contacto con la Tierra por pase
const CRUISE_KMS = 1.2; // velocidad media de crucero en transferencia directa (aprox.)

export function newMission() {
  const t = designTotals();
  const d = state.design;
  const today = horizons.rows[0];
  const travelDays = today.range_km / CRUISE_KMS / 86400;
  return {
    pass: 0,
    batteryWh: t.storageWh,
    maxWh: t.storageWh,
    storedMb: 0,
    downlinkedMb: 0,
    log: [],
    rangeKm: today.range_km,
    delayS: today.light_time_s,
    travelDays,
    parts: {
      power: pick('power', d.power),
      comms: pick('comms', d.comms),
      instrument: pick('instrument', d.instrument),
      propulsion: pick('propulsion', d.propulsion),
    },
    done: false,
  };
}

function runPass(m, { observe, transmit }) {
  const { power, comms, instrument } = m.parts;
  const event = state.catalog.mission.events.find((e) => e.atPass === m.pass + 1);
  const entry = { pass: m.pass + 1, notes: [] };

  if (event?.id === 'solar-storm') {
    m.batteryWh *= 0.5;
    entry.notes.push('Tormenta solar: la batería perdió la mitad de su carga.');
  }

  const genWh = power.generationW * SUNLIT_FRACTION * PASS_HOURS;
  let useWh = AVIONICS.drawW * PASS_HOURS;
  if (observe) useWh += instrument.drawW * PASS_HOURS;
  if (transmit) useWh += comms.drawW * (CONTACT_S / 3600);

  const after = m.batteryWh + genWh - useWh;
  if (after < 0) {
    m.batteryWh = Math.max(0, m.batteryWh + genWh - AVIONICS.drawW * PASS_HOURS);
    entry.notes.push('Batería agotada: el satélite entró en modo seguro y no hizo ciencia ni transmitió.');
    entry.safeMode = true;
  } else {
    m.batteryWh = Math.min(m.maxWh, after);
    if (observe) {
      m.storedMb += instrument.dataMbPerPass;
      entry.notes.push(`Observaste el polo sur: +${instrument.dataMbPerPass} MB.`);
    }
    if (transmit) {
      const capMb = (comms.downlinkKbps * CONTACT_S) / 8 / 1000;
      const sent = Math.min(capMb, m.storedMb);
      m.storedMb -= sent;
      m.downlinkedMb += sent;
      entry.notes.push(`Transmitiste ${sent.toFixed(1)} MB (capacidad ${capMb.toFixed(1)} MB en ${CONTACT_S / 60} min).`);
    }
  }
  entry.batteryWh = m.batteryWh;
  m.log.push(entry);
  m.pass += 1;
  m.done = m.pass >= state.catalog.mission.passes;
}

export function renderMission(root, { go }) {
  const t = designTotals();
  if (!t.ok) {
    root.innerHTML = `<p class="warn">Primero termina un diseño válido.</p><button class="primary" id="back">Volver al diseño</button>`;
    root.querySelector('#back').onclick = () => go('design');
    return;
  }
  state.mission ??= newMission();
  const m = state.mission;
  const next = state.catalog.mission.events.find((e) => e.atPass === m.pass + 1);

  root.innerHTML = `
    <section class="mission">
      <div class="col">
        <h2>Órbita lunar · pase ${Math.min(m.pass + 1, 3)} de ${state.catalog.mission.passes}</h2>
        <p class="hint">Distancia Tierra–Luna hoy: ${Math.round(m.rangeKm).toLocaleString('en-US')} km (JPL Horizons).
        Retardo de la señal: ${m.delayS.toFixed(2)} s. Viaje estimado: ${m.travelDays.toFixed(1)} días.</p>
        <div class="meter"><div class="meter-label"><span>Batería</span><span>${m.batteryWh.toFixed(0)} / ${m.maxWh} Wh</span></div>
          <div class="meter-track"><div class="meter-fill" style="width:${(m.batteryWh / m.maxWh) * 100}%"></div></div></div>
        <p>Datos a bordo: ${m.storedMb.toFixed(1)} MB · Datos en Tierra: ${m.downlinkedMb.toFixed(1)} MB</p>
        ${next ? `<p class="warn">Alerta: ${next.name}. ${next.effect}.</p>` : ''}
        ${
          m.done
            ? `<button class="primary" id="report">Ver reporte final</button>`
            : `<label><input type="checkbox" id="observe" checked/> Encender instrumento</label>
               <label><input type="checkbox" id="transmit" checked/> Transmitir a la Tierra</label>
               <button class="primary" id="run">Ejecutar pase</button>`
        }
      </div>
      <aside class="col">
        <h2>Bitácora</h2>
        <ol class="log">${m.log.map((e) => `<li><strong>Pase ${e.pass}</strong><br>${e.notes.join('<br>') || 'Sin actividad.'}</li>`).join('')}</ol>
      </aside>
    </section>`;

  root.querySelector('#run')?.addEventListener('click', () => {
    runPass(m, {
      observe: root.querySelector('#observe').checked,
      transmit: root.querySelector('#transmit').checked,
    });
    emit();
  });
  root.querySelector('#report')?.addEventListener('click', () => go('report'));
}
