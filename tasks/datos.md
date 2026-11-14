# Datos y peligros

1. **Verificar `data/planets/moon.json`.** Hay 8 valores con `verified: false` (temperaturas, oxígeno del regolito, helio-3, polvo). Lee la fuente, corrige y marca `true`. Corre `cd api && npm run check-planets`.
2. **Conectar el juego a datos reales.** Que la Luna en `game/` lea gravedad, peligros y recursos de `/api/planets/moon`, y distancia y retardo de `/api/distance` (hoy usa distancias de juego en `game/js/core/planet-scale.js`).
3. **Portar el hangar de diseño** de `web/src/` a `game/js/design/` (objetivo, lanzador, órbita, subsistemas; presupuesto, masa, energía, Δv; bloqueo si no cumple). Es lo que nos alinea con el reto: pide revisión de todos.
