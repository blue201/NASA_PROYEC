# Team Rocket HN · Misión Luna

Juego educativo de diseño de misión espacial, hecho por **Team Rocket HN** para el NASA Space Apps Challenge 2026 (Tegucigalpa), reto *Space Mission Design Game*.

**Premisa:** la demanda de la IA agotó recursos de la Tierra. Tu equipo diseña una nave con presupuesto, masa y energía limitados, viaja a la Luna, aterriza, explora con un rover, extrae hielo de agua con un dron y recibe un reporte que explica por qué la misión salió como salió.

## Enlaces (públicos, sin login)

- **Jugar:** https://blue201.github.io/NASA_PROYEC/
- **Demo (7 diapositivas):** https://blue201.github.io/NASA_PROYEC/demo/
- **Texto de la entrega en inglés:** [docs/SUBMISSION_EN.md](docs/SUBMISSION_EN.md)

## Cómo colaborar (equipo)

```bash
git clone https://github.com/blue201/NASA_PROYEC.git
cd NASA_PROYEC
docker compose up --build      # juego en http://localhost:8400, API en http://localhost:8787
```

Para la entrega trabajamos **directo en `main`**: cada `git push` a `main` vuelve a publicar el juego y la demo en los enlaces de arriba en unos 2 minutos (workflow `.github/workflows/pages.yml`). Si activaste el aviso local (`git config core.hooksPath .githooks`), ese aviso bloquea el push a `main`; para la entrega usa `git push --no-verify origin main` o desactívalo con `git config --unset core.hooksPath`. Sin firmas de IA en los commits (ver [AGENTS.md](AGENTS.md)).

## Estructura

```
api/            Backend Node (Docker): NASA Images, JPL Horizons y /api/planets
data/planets/   Contrato compartido: un JSON por planeta con datos reales y fuentes
game/           Juego 3D (Three.js), basado en Odyssey (ver Créditos)
web/            Prototipo del hangar de diseño (se porta a game/js/design/)
tasks/          Tres primeras tareas de cada rol
.github/        CODEOWNERS y workflow de publicación
.githooks/      Aviso local que bloquea el push directo a main
```

Roles, zonas y ramas: [CONTRIBUTING.md](CONTRIBUTING.md).

## Cómo correrlo

1. Copia `.env.example` como `.env` (las llaves son opcionales).
2. Activa el aviso de push: `git config core.hooksPath .githooks`.
3. Descarga los assets pesados (ver abajo).
4. Levanta todo:

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Juego 3D | http://localhost:8400 |
| API | http://localhost:8787/health · `/api/planets` · `/api/distance` · `/api/images` |
| Prototipo del hangar | http://localhost:5299 |

Si un puerto está ocupado: `GAME_PORT=8410 API_PORT=8797 docker compose up`.

Sin Docker: `cd game && PORT=8400 node serve.cjs --no-browser` y `cd api && npm start`.

## Assets pesados (fuera de git)

Los modelos fuente (.blend, .fbx, .gltf, .obj; ~103 MB) **no están en el repo**. El juego corre sin ellos: solo hacen falta para editar modelos.

- Enlace de Drive: **PEGAR_AQUÍ_EL_ENLACE**
- Descomprime en `game/sources/`, de modo que quede `game/sources/blend/`, `game/sources/fbx/`, `game/sources/gltf/` y `game/sources/obj/`.

`game/sources/` está en `.gitignore`.

## Data Sources

No se usan llaves de API en el navegador. Cada valor guardado lleva su `source_url`.

- **JPL Horizons API** (https://ssd.jpl.nasa.gov/api/horizons.api): distancia Tierra–Luna y tiempo de luz.
- **NASA Image and Video Library** (https://images-api.nasa.gov): imágenes de la Luna y CubeSats, con `nasa_id`.
- **Datos por planeta** (`data/planets/*.json`): gravedad, temperatura, recursos y peligros con la fuente de cada valor (NASA NSSDC Moon Fact Sheet, NASA Science, LCROSS, Chang'e 4 LND, Lunar Sourcebook). Los marcados `verified: false` están en revisión.
- **CubeSat 101** (NASA CSLI): referencia de tamaños y masas de la fase de diseño.

Este proyecto no está respaldado ni afiliado a NASA y no usa sus logos.

## Créditos

- **Odyssey**: la carpeta `game/` parte de *Odyssey*, un proyecto previo del equipo creado antes del hackathon. Su uso en la entrega está **pendiente de aprobación escrita de los organizadores**. Todo lo hecho desde el sábado 14 de noviembre de 2026 a las 09:00 queda en el historial de este repositorio.
- **Licencia MIT (Antonio Maiorano, 2014)**: `game/LICENSE.txt` se conserva tal cual. Su nombre no aparece en ningún archivo de código del proyecto; el origen del aviso está en revisión.
- **three.js** (MIT): `game/assets/vendor/`, licencia en `game/assets/vendor/THREE-LICENSE.txt`.
- Texturas, panorama, voces y demás recursos: ver `game/assets/CREDITS.md`.

## Uso de IA

Parte del código y la documentación se generó con ayuda de Claude (Anthropic) y fue revisada por el equipo. El juego Odyssey usa Gemini para su copiloto conversacional (opcional, con llave propia en `.env`).
