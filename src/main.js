import './style.css';
import { state, onChange } from './state.js';
import { renderDesign } from './modules/design/design.js';
import { renderMission } from './modules/mission/mission.js';
import { renderReport } from './modules/report/report.js';
import { renderSources } from './modules/sources/sources.js';

const app = document.getElementById('app');
const views = { design: renderDesign, mission: renderMission, report: renderReport, sources: renderSources };
let current = 'design';

function go(view) {
  current = view;
  document.querySelectorAll('[data-go]').forEach((b) => b.classList.toggle('active', b.dataset.go === view));
  app.innerHTML = '';
  views[view](app, { go });
}

document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
onChange(() => go(current));
go('design');
window.__state = state; // útil para depurar en la consola
