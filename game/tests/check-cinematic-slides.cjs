const fs = require('fs');
const path = require('path');
const assert = require('assert');

const basePath = path.resolve(__dirname, '..');
const slidesJsPath = path.join(basePath, 'js', 'cinematic/cinematic-slides.js');
const indexHtmlPath = path.join(basePath, 'index.html');
const stylesCssPath = path.join(basePath, 'css', 'styles.css');

assert(fs.existsSync(slidesJsPath), 'cinematic-slides.js debe existir');
const code = fs.readFileSync(slidesJsPath, 'utf8');

// 1. Verificar exportación de API
assert(code.includes('window.CinematicStorySlides = {'), 'Debe exportar window.CinematicStorySlides');
assert(code.includes('openPrologue'), 'Debe contener openPrologue');
assert(code.includes('openEpilogue'), 'Debe contener openEpilogue');

// 2. Extraer rutas de imágenes y audios referenciados y verificar que existen en disco
const imgMatches = [...code.matchAll(/imageSrc:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
assert(imgMatches.length >= 7, 'Debe tener al menos 7 imágenes de diapositivas');
for (const rel of imgMatches) {
  const fullPath = path.join(basePath, rel);
  assert(fs.existsSync(fullPath), `Imagen ${rel} referenciada en cinematic-slides debe existir`);
}

const audioMatches = [...code.matchAll(/audioSrc:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
assert(audioMatches.length >= 4, 'Debe tener audios de voz asignados');
for (const rel of audioMatches) {
  const fullPath = path.join(basePath, rel);
  assert(fs.existsSync(fullPath), `Audio ${rel} referenciado en cinematic-slides debe existir`);
}

// 3. Verificar elementos DOM
assert(code.includes('id="cine-slide-img"'), 'El markup debe incluir cine-slide-img');
assert(code.includes('id="cine-char-avatar"'), 'El markup debe incluir cine-char-avatar');

// 4. Verificar CSS
const css = fs.readFileSync(stylesCssPath, 'utf8');
assert(css.includes('.cine-slide-img'), 'styles.css debe contener estilos para .cine-slide-img');
assert(css.includes('.cine-char-avatar'), 'styles.css debe contener estilos para .cine-char-avatar');

// 5. Interferencia de TV antigua en la intro
assert(css.includes('.cine-tvfx'), 'styles.css debe definir la capa de interferencia .cine-tvfx');
assert(css.includes('.cine-scanlines'), 'styles.css debe definir scanlines de tubo catódico');
assert(css.includes('.cine-noise'), 'styles.css debe definir ruido de señal');
assert(css.includes('signal-glitch'), 'styles.css debe definir el micro-glitch con desplazamiento RGB');
assert(css.includes('signal-cut'), 'styles.css debe definir el corte de señal');
assert(css.includes('.cine-signal-banner'), 'styles.css debe mostrar el aviso SIN SEÑAL');
assert(css.includes('prefers-reduced-motion'), 'la interferencia debe respetar prefers-reduced-motion');
assert(code.includes('signal-cut'), 'cinematic-slides.js debe disparar cortes de señal');
assert(code.includes('scheduleAmbientGlitches'), 'cinematic-slides.js debe programar micro-glitch aleatorios');
assert(code.includes('playStaticSound'), 'los cortes deben reproducir estática de audio');
assert(code.includes('prefers-reduced-motion'), 'el motor de interferencia debe respetar prefers-reduced-motion');
assert(code.includes('cine-signal-banner'), 'el markup debe incluir el aviso SIN SEÑAL');

// 6. Retratos de los personajes en la presentación inicial
const photoMatches = [...code.matchAll(/avatarSrc:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
assert(photoMatches.length >= 10, 'los personajes deben llevar foto en prólogo y epílogo');
for (const rel of photoMatches) {
  assert(fs.existsSync(path.join(basePath, rel)), `Retrato ${rel} referenciado en cinematic-slides debe existir`);
}
assert(code.includes("avatarImg.style.display = 'block'"), 'el retrato debe mostrarse cuando la diapositiva tiene foto');

// 5. Verificar botones en index.html
const html = fs.readFileSync(indexHtmlPath, 'utf8');
assert(html.includes('id="card-prologue-btn"'), 'index.html debe tener card-prologue-btn');
assert(html.includes('id="pause-prologue-btn"'), 'index.html debe tener pause-prologue-btn');
assert(html.includes('id="surface-prologue-btn"'), 'index.html debe tener surface-prologue-btn');

console.log('PASS: check-cinematic-slides.cjs validó prólogo, epílogo, retratos y subtítulos con éxito.');

