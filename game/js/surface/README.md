# Superficie (rol: Modelado)

Aquí van los módulos nuevos de superficie: `rover.js`, `drone.js` y lo que salga de limpiar la Luna.
Se cargan con una etiqueta `<script>` en `index.html` (zona común: pide revisión) y exponen `window.Rover`, `window.Drone`.
Leen gravedad, temperatura y recursos desde `/api/planets/<id>` (ver `data/planets/README.md`).
