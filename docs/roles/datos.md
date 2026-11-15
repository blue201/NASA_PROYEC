# Guía: Datos y peligros

**Tu zona:** `api/`, `data/`, `game/services/`. Lideras el hangar (`game/js/design/`, zona común: con revisión).
**No toques sin avisar:** `game/index.html`, `game/js/core/`, `game/js/ui/`, carpetas de otros roles.

**Reglas:** cada valor en `data/planets/*.json` lleva `source_url` y `verified`. No inventes valores. Las llamadas a NASA/JPL van por la API, nunca desde el navegador. Valida con `cd api && npm run check-planets`.

**Primeras tareas** (detalle en `tasks/datos.md`):
1. Verificar los 8 valores `verified: false` de `moon.json`.
2. Que el juego lea gravedad, peligros y recursos de `/api/planets/moon` y distancia de `/api/distance`, con respaldo local si la API cae.
3. Revisar los números del hangar (`game/js/design/catalog.json`) contra CubeSat 101.
