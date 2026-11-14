# Modelado y superficie (Blue)

1. **Quitar los objetos blancos de la Luna.** Sospechosos: cristales azul claro del tubo de lava (`game/js/world/planet-phenomena.js`, color `0x93c5fd` para `moon`), bloques de hielo y rocas instanciadas (`game/js/world/surface-explorer.js`, ~l.306 y ~l.529) y balizas de misiones (`game/js/world/nasa-ground-points.js`). Dificultad: baja, una vez identificado con captura.
2. **Secuencia de aterrizaje de la nave.** Ya existe en `game/js/flight/landing-game.js` y `game/js/world/expedition-approach.js`: pulir la llegada al sitio de Shackleton. Dificultad: media.
3. **Rover con llantas que sale de la nave y toma imágenes del terreno.** Nuevo: `game/js/surface/rover.js` (modelo, rampa, manejo, foto con su cámara). Dificultad: media-alta.
4. **Dron que excava y recolecta el recurso.** Nuevo: `game/js/surface/drone.js`; para la demo basta una animación guiada que suma el recurso leído de `data/planets/moon.json`. Dificultad: media.
