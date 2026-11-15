# Guía: Modelado y superficie (Blue)

**Tu zona:** `game/js/world/`, `game/js/surface/` (rover, dron), `game/js/fauna/`, `game/js/flight/landing-game.js`, `game/assets/models/`, `game/assets/pbr/`. Modelos fuente en `game/sources/` (Drive, fuera de git).
**No toques sin avisar:** `game/index.html` (agrega tu script en tu bloque y avisa), `game/js/core/`, `game/js/design/`.

**Reglas:** todo modelo o textura nuevo con su licencia en `game/assets/CREDITS.md`. Nada de naves o arte de otros juegos (la nave "Arwing" de Star Fox hay que rediseñarla). Ningún archivo de más de 50 MB en git.

**Primeras tareas** (detalle en `tasks/modelado.md`):
1. Quitar los objetos blancos de la Luna (sospechosos en `planet-phenomena.js`, `surface-explorer.js`, `nasa-ground-points.js`).
2. Pulir la secuencia de aterrizaje en Shackleton.
3. Rover con llantas que sale de la nave y toma fotos del terreno.
4. Dron que excava y recolecta el recurso de `moon.json`.
