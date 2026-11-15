# Servidor multijugador (rol: Multijugador)

`rooms.cjs` mantiene las partidas cooperativas en memoria y maneja `GET/POST /api/multiplayer` desde `serve.cjs`.

La sala tiene capacidad máxima de cuatro jugadores, un destino fijado por el anfitrión y reserva exclusiva por tipo de mineral. La asignación se procesa en el servidor para evitar que dos jugadores reclamen el mismo mineral al mismo tiempo. El manifiesto solo aumenta al aceptar la acción de depósito del dron junto a la nave principal.

La sincronización usa solicitudes HTTP de sondeo; no requiere paquetes adicionales. Las salas se eliminan al quedar vacías, tras tres horas o cuando sus jugadores pasan 30 segundos sin señal. El estado no se guarda entre reinicios del proceso.
