const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('js/core/main.js', 'utf8');
const start = source.indexOf('  function runOrbitalCalculationSequence(planetKey) {');
const end = source.indexOf('  // 5. RENDERIZADO DE MATERIALES', start);
assert(start >= 0 && end > start, 'orbital calculation flow exists');
const flow = source.slice(start, end);
assert.equal((flow.match(/title: '[1-6]\. /g) || []).length, 6, 'six player calculations are required');
assert.match(flow, /input\.required = true/);
assert.match(flow, /input\.disabled = index !== 0/);
assert.match(flow, /Math\.abs\(answer - exercise\.expected\) > exercise\.tolerance/);
assert.match(flow, /TODOS LOS CÁLCULOS MANUALES VERIFICADOS/);
assert.match(flow, /executeFlightPlanBtn\.disabled = true/);
assert.doesNotMatch(flow, /setInterval\(/, 'the old automatic calculation sequence is gone');
assert.match(source, /launchBtn\.addEventListener\('click', \(\) => \{\s*openOrbitalCalculationModal\(selectedPlanetKey\)/);

console.log('PASS: orbital launch requires six ordered answers; answers are validated before enabling the flight plan.');
