# Guía: Multijugador

**Tu zona:** `game/js/multiplayer/`, `game/server/multiplayer/`.
**No toques sin avisar:** todo lo demás, sobre todo `game/index.html`, `game/serve.cjs` y `game/js/core/` (zona común).

**Reglas:** el modo de un jugador **nunca** se rompe: todo se activa solo con `?multi=1`. Sincroniza por `id` de planeta y de recurso de `data/planets/`. Va después de la Luna completa, en tu rama.

**Primeras tareas** (detalle en `tasks/multijugador.md`):
1. Protocolo de sala de 4 con un rol por jugador (`PROTOCOL.md`).
2. Hangar compartido: cada jugador controla un subsistema y todos ven presupuesto, masa y energía en vivo.
3. Interruptor `?multi=1` con una prueba que verifique que sin él nada cambia.
