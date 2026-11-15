# Multijugador (rol: Multijugador)

Todo el modo multijugador vive aquí y en `game/server/multiplayer/` (servidor).
Regla: **el modo de un jugador nunca debe romperse**. Todo se activa solo con `?multi=1`.
Sincroniza por `id` de planeta y de recurso, tal como vienen en `data/planets/*.json`.

## Expedición cooperativa

- Abre `http://localhost:8400/?multi=1`, crea una partida o únete con su código.
- El anfitrión elige Luna, Marte, Mercurio o Venus (los planetas rocosos con catálogo de recursos) y la partida acepta de 2 a 4 comandantes.
- Todos entran a su misión por separado y viajan al planeta de la sala; el modo bloquea destinos distintos.
- En la superficie, cada comandante reserva un mineral distinto y escoge una ruta directa, eficiente o segura.
- Cada cliente simula su dron en la escena y publica posición, carga y estado. La carga se suma al manifiesto común solo al volver a la nave.
- Las salas viven en memoria en el proceso de `serve.cjs`; al reiniciar el servidor, las partidas se pierden. El jugador inactivo se retira tras 30 segundos sin señal.
- Los tipos de mineral y sus fuentes vienen del catálogo planetario; la ubicación de los depósitos y la unidad recolectada por grupo son balance de juego, no coordenadas ni abundancias geológicas.
- Si el puerto de la API planetaria no es 8787, pasa `?multi=1&api=http://localhost:PUERTO_API`.

El modo normal no carga el coordinador si falta `multi=1`.
