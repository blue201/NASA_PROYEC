# Guía: Historia

**Tu zona:** `game/js/story/` (misiones en `missions/<id>.json`), `game/js/cinematic/`, `game/js/jarvis/`, `game/assets/audio-es/`, `game/assets/cinematics/`.
**No toques sin avisar:** `game/index.html`, `game/js/core/`, `data/planets/` (pide a Datos los valores que necesites).

**Reglas:** textos en español, sencillos y que expliquen el *porqué* de cada decisión. Sin marca ni logos de NASA. Nada copiado de películas o juegos (personajes, naves, frases). Las misiones referencian recursos y peligros por su `id` de `data/planets/`.

**Primeras tareas** (detalle en `tasks/historia.md`):
1. Premisa e intro corta; cambiar "Coalición Espacial NASA".
2. Completar `missions/moon-01-shackleton-ice.json` (briefing, éxito y cada fallo).
3. Explicaciones cortas para cada decisión del hangar y para el reporte final.
