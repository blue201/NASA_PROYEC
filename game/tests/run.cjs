// Run with: node tests/run.cjs. Uses only the Node.js standard library.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const project = path.join(__dirname, '..');
function walkJs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) { walkJs(path.join(dir, entry.name)); continue; }
    if (!entry.name.endsWith('.js')) continue;
    const file = path.join(dir, entry.name);
    const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
walkJs(path.join(project, 'js'));
for (const name of fs.readdirSync(__dirname).filter(name => /^check-.*\.cjs$/.test(name))) {
  const result = spawnSync(process.execPath, [path.join(__dirname, name)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('All automated checks passed. Browser acceptance and FPS measurements remain pending.');
