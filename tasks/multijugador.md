# Multijugador

El reto pide colaboración de hasta 4 personas en la **misma misión**. Recomendación: empezar por eso (cooperativo) y dejar "4 jugadores en 4 planetas" para después.

1. **Diseño del protocolo** (`game/js/multiplayer/PROTOCOL.md`): sala de 4, un rol por jugador (misión, nave, ciencia, comunicaciones), qué se sincroniza y quién decide qué.
2. **Hangar compartido**: cada jugador controla su subsistema y todos ven presupuesto, masa y energía en vivo. Servidor en `game/server/multiplayer/` (WebSocket).
3. **Interruptor `?multi=1`**: sin él, el juego es exactamente el de un jugador. Agregar una prueba en `game/tests/` que lo verifique.
