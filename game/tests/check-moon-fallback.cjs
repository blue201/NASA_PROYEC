// La copia local de la Luna (respaldo si la API cae) debe ser igual a data/planets/moon.json.
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const local = path.join(__dirname, '..', 'js', 'design', 'moon.fallback.json');
const source = path.join(__dirname, '..', '..', 'data', 'planets', 'moon.json');
if (!fs.existsSync(source)) {
  console.log('SKIP: data/planets/moon.json no está disponible (¿contenedor sin data/?).');
  process.exit(0);
}
assert.deepStrictEqual(JSON.parse(fs.readFileSync(local, 'utf8')), JSON.parse(fs.readFileSync(source, 'utf8')),
  'game/js/design/moon.fallback.json está desactualizado: cópialo de data/planets/moon.json');
console.log('PASS: el respaldo local de la Luna coincide con data/planets/moon.json.');
