// Fase 1: diseño del CubeSat. Dueño sugerido: dev 1.
import { state, emit, designTotals, SUBSYSTEMS, objective } from '../../state.js';

const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

function bar(label, value, max, unit, fmt = (v) => v.toFixed(1)) {
  const pct = Math.min(100, (value / max) * 100);
  const over = value > max;
  return `
    <div class="meter ${over ? 'over' : ''}">
      <div class="meter-label"><span>${label}</span><span>${fmt(value)} / ${fmt(max)} ${unit}</span></div>
      <div class="meter-track"><div class="meter-fill" style="width:${pct}%"></div></div>
    </div>`;
}

function optionStats(o) {
  const bits = [];
  if (o.generationW) bits.push(`${o.generationW} W gen`);
  if (o.storageWh) bits.push(`${o.storageWh} Wh`);
  if (o.downlinkKbps) bits.push(`${o.downlinkKbps} kbps`);
  if (o.dataMbPerPass) bits.push(`${o.dataMbPerPass} MB/pase`);
  if (o.deltaVms) bits.push(`${o.deltaVms} m/s Δv`);
  if (o.drawW) bits.push(`consume ${o.drawW} W`);
  bits.push(`${o.massKg} kg`, `${o.volumeU} U`, usd(o.costUsd));
  return bits.join(' · ');
}

export function renderDesign(root, { go }) {
  const { catalog, design } = state;
  const t = designTotals();

  const group = (title, name, list, describe) => `
    <h2>${title}</h2>
    <div class="choices">
      ${list
        .map(
          (o) => `
        <label class="choice ${design[name] === o.id ? 'on' : ''}">
          <input type="radio" name="${name}" value="${o.id}" ${design[name] === o.id ? 'checked' : ''}/>
          <strong>${o.name}</strong>
          <small>${describe(o)}</small>
        </label>`
        )
        .join('')}
    </div>`;
  const obj = objective();

  root.innerHTML = `
    <section class="design">
      <div class="col">
        ${group('1. Objetivo de la misión', 'objective', catalog.objectives, (o) => o.blurb)}
        ${group('2. Lanzador', 'launcher', catalog.launchers, (o) => `${o.blurb} Hasta ${o.maxVolumeU}U y ${o.maxMassKg} kg · ${usd(o.costUsd)}`)}
        ${group('3. Órbita lunar', 'orbit', catalog.orbits, (o) => `${o.blurb} Necesita ${o.requiredDeltaVms} m/s · contacto ${o.contactMin} min por pase`)}
        <h2>4. Estructura</h2>
        <div class="choices">
          ${catalog.structures
            .map(
              (s) => `
            <label class="choice ${design.structure === s.id ? 'on' : ''}">
              <input type="radio" name="structure" value="${s.id}" ${design.structure === s.id ? 'checked' : ''}/>
              <strong>${s.name}</strong>
              <small>hasta ${s.maxMassKg} kg · ${s.volumeU} U · ${usd(s.costUsd)}</small>
            </label>`
            )
            .join('')}
        </div>
        ${SUBSYSTEMS.map((key) => {
          const sub = catalog.subsystems[key];
          return `
          <h2>${sub.label}</h2>
          <div class="choices">
            ${sub.options
              .map(
                (o) => `
              <label class="choice ${design[key] === o.id ? 'on' : ''}">
                <input type="radio" name="${key}" value="${o.id}" ${design[key] === o.id ? 'checked' : ''}/>
                <strong>${o.name}</strong>
                <small>${optionStats(o)}${key === 'instrument' && obj ? ` · valor para tu objetivo: ×${obj.value[o.id]}` : ''}</small>
              </label>`
              )
              .join('')}
          </div>`;
        }).join('')}
      </div>
      <aside class="col summary">
        <h2>Tu CubeSat ${t.structure.id}</h2>
        ${bar('Masa', t.massKg, t.structure.maxMassKg, 'kg')}
        ${bar('Volumen', t.volumeU, t.structure.volumeU, 'U')}
        ${bar('Presupuesto', t.costUsd, catalog.startingBudget, '', usd)}
        ${bar('Consumo vs generación', t.drawW, Math.max(t.generationW, 1), 'W', (v) => v.toFixed(0))}
        <p class="hint">Δv: ${t.deltaVms} m/s${t.requiredDeltaVms ? ` (tu órbita necesita ${t.requiredDeltaVms})` : ''}</p>
        ${t.drawW > t.generationW && t.generationW ? '<p class="warn">Consumes más de lo que generas: tendrás que apagar cosas en órbita.</p>' : ''}
        <ul class="problems">${t.problems.map((p) => `<li>${p}</li>`).join('')}</ul>
        <button id="launch" class="primary" ${t.ok ? '' : 'disabled'}>Lanzar misión</button>
      </aside>
    </section>`;

  root.querySelectorAll('input[type=radio]').forEach((input) =>
    input.addEventListener('change', () => {
      design[input.name] = input.value;
      emit();
    })
  );
  root.querySelector('#launch').addEventListener('click', () => {
    state.mission = null; // reinicia la misión con el diseño nuevo
    go('mission');
  });
}
