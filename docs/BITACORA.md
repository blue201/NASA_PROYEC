# Bitácora

Registro por fecha de lo hecho y lo decidido. Lo más nuevo va arriba dentro de cada día. Cada PR agrega su línea.

## 2026-11-14 (sábado, día 1)

### Decisiones
- **Reto elegido:** Space Mission Design Game. El centro es diseñar la misión con presupuesto, masa y energía, y ver las consecuencias.
- **Primero la Luna completa** (diseño → vuelo → aterrizaje → rover/dron → recolección → reporte). Multijugador y otros planetas, después y en su propia rama.
- **Premisa:** la IA agotó recursos de la Tierra; hay que extraer recursos reales en la Luna (hielo de agua en Shackleton).
- **Repositorio:** `blue201/NASA_PROYEC`, creado hoy a las 10:12, después del arranque. **Privado** hasta que Blue diga.
- **Integrar Odyssey** (juego previo del equipo) en `game/` en vez de partir de cero, con su uso en la entrega **pendiente del OK escrito de los organizadores**.
- **Integrar el hangar** del prototipo `web/` (puerto 5299) dentro del juego, en la rama `feat/hangar`. El prototipo se **archiva y sale del docker compose** cuando el hangar funcione dentro del juego.
- **Reglas de git:** nada directo a `main`; ramas por rol y PR pequeños; antes de cada commit/push se muestra lista, título y descripción y se espera el "dale" de Blue; **sin firmas de IA** en commits ni PR.

### Hecho
- **Prototipo `web/`** (Vite): hangar con objetivo, lanzador, órbita y 4 subsistemas; misión de 3 pases con tormenta solar; reporte. Valores de CubeSat 101 marcados por verificar.
- **API `api/`** (Node sin dependencias, Docker): `/api/images` (NASA Image and Video Library, filtrado a Luna y CubeSats), `/api/distance` (JPL Horizons), `/api/planets`.
- **Mudanza:** Odyssey copiado de `PROYECTOS/NASA` a `NASA_PROYEC/game/` sin tocar el original. Excluidos `.local/` (llave de Gemini), `game/sources/` (103 MB de modelos fuente) y `game/assets/music/` (116 MB): van por Drive. Verificado: la llave no aparece en el código ni en el historial; el juego corre sin modelos fuente.
- **Estructura por rol:** carpetas nuevas `game/js/{design,surface,story,multiplayer}`, `game/server/multiplayer`, `CODEOWNERS`, `CONTRIBUTING.md`, `tasks/`.
- **Contrato de datos:** `data/planets/moon.json` con gravedad, temperaturas, recursos y peligros, cada uno con su fuente; `schema.json` y `npm run check-planets`. Quedan 8 valores `verified: false`.
- **Docker:** `docker compose up` levanta juego (8400), API (8787) y prototipo (5299). Puertos configurables; `game/serve.cjs` acepta `PORT` y `HOST`.
- **Licencia:** `game/LICENSE.txt` es MIT de "Antonio Maiorano, 2014". Su nombre no aparece en ningún archivo de código; origen desconocido (probable plantilla inicial). Se conserva tal cual y se acredita en el README. three.js r128 (MIT) está vendorizado con su licencia.
- **Hook local:** `.githooks/pre-push` bloquea el push a `main`; `.githooks/commit-msg` rechaza firmas de IA.
- **Hangar en el juego (rama `feat/hangar`):** paso a (pantalla con el botón 🛠 Hangar) y paso b (el despegue pasa por el hangar y se bloquea si el diseño no cumple). Paso c (valores en la cabina) en curso.
- **GitHub:** subidas `rol/datos`, `rol/historia`, `rol/modelado`, `rol/multijugador` y `feat/hangar`. `main` pendiente de que Blue la suba (requiere saltarse el aviso local una vez).
- Música y modelos fuente sacados de **todo el historial** de git antes del primer push.

### Aportes de RamiPosadas (por hora)

#### 14:14 · Recursos de Marte (PR #4)

Se añade data/planets/mars.json con hielo de agua, muestras con minerales de hierro y minerales identificados por CheMin (plagioclasa, piroxenos y olivino). Cada evidencia tiene fuente NASA y estado de verificación. Radio y período de rotación son aproximaciones explícitas de NASA Mars Facts. Las cinco abundancias quedan pendientes; no se prometen minas de oro ni metales puros. La API existente lo descubre sin modificar el contrato ni desplazar la misión lunar.

#### 14:27 · Historia de Génesis (PR #2)

Adaptación selectiva de Génesis al repositorio del equipo: prólogo de siete escenas (56 segundos sin pausas), misión lunar y explicaciones de presupuesto, masa, energía y comunicaciones. Se mantiene el reproductor CRT existente y se reemplazan las grabaciones con guion obsoleto por la narración del texto vigente. No se importan modelos ni música.

Se elimina el segundo disparador de inicio en main y el prólogo antiguo por radio. Los accesos heredados abren la presentación vigente; una llamada repetida no reinicia una escena activa. Se conservan las marcas de partidas anteriores.
