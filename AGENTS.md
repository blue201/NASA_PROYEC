# AGENTS.md: reglas para "SI", el asistente de IA del equipo

Este archivo es para cualquier IA que trabaje en este repositorio (Claude, Copilot, Gemini, Cursor u otra). En el equipo la llamamos **"SI"**. Léelo completo antes de tocar código. Las personas del equipo pueden darte instrucciones más específicas; si chocan con estas reglas, pregunta antes de actuar.

## 1. Qué es el proyecto

- **Team Rocket HN**, NASA Space Apps Challenge 2026 (Tegucigalpa), reto **Space Mission Design Game**.
- El reto pide un juego donde el jugador **diseña y gestiona una misión espacial** tomando decisiones de ingeniería con recursos limitados (**presupuesto, masa, energía**, datos, comunicaciones, tiempo) y ve las consecuencias de cada decisión.
- Nuestra versión: la IA agotó recursos de la Tierra; el equipo diseña una nave en el **hangar**, vuela a la Luna, aterriza, explora con rover y dron, extrae un recurso real (hielo de agua) y recibe un reporte que explica por qué salió así.
- **Prioridad: la Luna completa de principio a fin** (diseño → vuelo → aterrizaje → rover/dron → recolección → reporte). Multijugador y otros planetas van después, en su propia rama, sin romper el modo de un jugador.
- La fase de diseño (presupuesto, masa, energía) es el centro del reto: no la debilites.

## 2. Cómo levantarlo

```bash
cp .env.example .env          # llaves opcionales; nunca se suben
git config core.hooksPath .githooks
docker compose up --build
```

| Servicio | Puerto |
|---|---|
| Juego 3D (`game/`) | http://localhost:8400 |
| API (`api/`) | http://localhost:8787 (`/health`, `/api/planets`, `/api/distance`, `/api/images`) |
| Prototipo del hangar (`web/`, se archiva) | http://localhost:5299 |

Si un puerto está ocupado: `GAME_PORT=… API_PORT=… docker compose up`. Pruebas del juego: `cd game && node tests/run.cjs`. Validar planetas: `cd api && npm run check-planets`.

## 3. Cómo está hecho el juego (importante)

- `game/` es JavaScript sin empaquetador ni módulos: **`game/index.html` carga cada script uno por uno** con una etiqueta script y las piezas se comparten por `window.*`.
- **No muevas ni renombres archivos sin avisar**: rompe las rutas en `index.html` y las de los demás.
- El orden de los scripts en `index.html` importa. Agrega tu script en tu bloque y explica por qué en el PR.
- Three.js r128 está vendorizado en `game/assets/vendor/`. No lo actualices sin plan.

## 4. Carpetas por rol

| Rol | Puede tocar | Dueño |
|---|---|---|
| Datos y peligros | `api/`, `data/`, `game/services/` | (usuario de GitHub pendiente) |
| Historia | `game/js/story/`, `game/js/cinematic/`, `game/js/jarvis/`, `game/assets/audio-es/`, `game/assets/cinematics/` | (pendiente) |
| Modelado y superficie | `game/js/world/`, `game/js/surface/`, `game/js/fauna/`, `game/js/flight/landing-game.js`, `game/assets/models/`, `game/assets/pbr/` | blue201 |
| Multijugador | `game/js/multiplayer/`, `game/server/multiplayer/` | (pendiente) |
| **Zona común** | `game/index.html`, `game/js/core/`, `game/js/ui/`, `game/js/design/`, resto de `game/js/flight/`, `game/css/`, `game/serve.cjs`, `docker-compose.yml`, `.github/`, este archivo | todos, **solo con revisión de otra persona** |

Si tu tarea necesita tocar la zona común o la carpeta de otro rol, dilo antes y propón el cambio mínimo. Detalle en `CONTRIBUTING.md` y `docs/roles/`.

## 5. Git

- **Nunca subas directo a `main`.** Trabaja en una rama (`rol/<tu-rol>` o `rol/<tu-rol>/<tarea>`) y abre un **pull request pequeño**.
- No uses `--no-verify` ni `--force` sin que una persona lo pida explícitamente.
- El repositorio es **privado** y se queda así hasta que Blue (blue201) diga lo contrario. No cambies su visibilidad.

### Commits y pull requests (reglas de Blue, obligatorias)

1. **Antes de cada commit y de cada push**, muestra a la persona la lista de archivos, el título y la descripción, y **espera su "dale"**. Sin "dale" no hay commit ni push.
2. **Los commits van solo a nombre de la persona.** Nada de `Co-Authored-By: Claude` (ni de ninguna IA), nada de "Generated with …" ni otra firma de IA en commits ni en pull requests. `.claude/settings.json` lo desactiva para Claude Code y `.githooks/commit-msg` rechaza cualquier commit que la traiga.
3. **No reescribas el historial** (rebase, amend de commits subidos, filter-branch, force push) sin que la persona lo diga.
4. **Títulos cortos en español** y **un commit por tema**.

## 6. Lo que nunca se sube

- Llaves, tokens, `.env`, `.local/` ni nada que parezca una credencial. Las llaves van en `.env` (ver `.env.example`) y solo las lee el servidor, nunca el navegador.
- Archivos de **más de 50 MB**.
- `game/sources/` (modelos fuente) y `game/assets/music/` (música): se comparten por Drive (ver README).

## 7. Datos

- Los datos de cada cuerpo celeste salen de **`data/planets/<id>.json`** (contrato en `data/planets/README.md`). Agregar un planeta = agregar un archivo.
- **Cada valor lleva su fuente** (`source_url`) y `verified`. **No inventes valores.** Si no encuentras la fuente, deja el campo pendiente y dilo.
- `game_effect` es balance de juego y puede ajustarse, pero dilo en el PR.
- Las llamadas a NASA/JPL van por la `api/`, no desde el navegador.

## 8. Licencias y créditos

- Conserva `game/LICENSE.txt` (MIT, Antonio Maiorano 2014) y su aviso **tal cual**.
- Conserva `game/assets/vendor/THREE-LICENSE.txt` y `game/assets/CREDITS.md`. Todo recurso nuevo (modelo, textura, audio, imagen) se acredita en `CREDITS.md` con su licencia.
- No uses logos de NASA ni la marca NASA como si fuera nuestra. No copies personajes, naves ni arte de otros juegos o películas.
- `game/` parte de Odyssey (trabajo previo del equipo); su uso en la entrega está pendiente del OK de los organizadores.

## 9. Forma de trabajar

1. **Antes de un cambio grande** (más de un archivo de la zona común, mover carpetas, cambiar el contrato de datos, borrar cosas): muestra el plan y **espera el OK** de la persona.
2. **Al terminar**: di qué hiciste, qué archivos tocaste y **qué probar** (URL y pasos).
3. **Anota el cambio en `docs/BITACORA.md`** (fecha, quién, qué, por qué) en el mismo PR.
4. Si algo queda pendiente, agrégalo a `docs/PENDIENTES.md`.
5. Declara el uso de IA en la descripción del PR.

## 10. Dónde está todo

- `README.md`: cómo correrlo, fuentes de datos, créditos.
- `CONTRIBUTING.md`: reglas de ramas y zonas.
- `docs/ARQUITECTURA.md`: cómo se conectan juego, API, hangar y datos.
- `docs/roles/*.md`: guía por rol. `tasks/*.md`: primeras tareas.
- `docs/BITACORA.md` y `docs/PENDIENTES.md`.
