// Valida data/planets/*.json. Uso: npm run check-planets
import { loadPlanets } from '../src/planets.js';

const planets = await loadPlanets();
let bad = 0;
for (const { file, data, problems } of planets) {
  const unverified = JSON.stringify(data).match(/"verified":\s*false/g)?.length ?? 0;
  if (problems.length) {
    bad++;
    console.log(`✗ ${file}`);
    problems.forEach((p) => console.log(`   - ${p}`));
  } else {
    console.log(`✓ ${file}${unverified ? ` (${unverified} valores por verificar)` : ''}`);
  }
}
process.exit(bad ? 1 : 0);
