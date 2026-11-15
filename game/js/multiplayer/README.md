# Multijugador (rol: Multijugador)

El lobby multijugador aparece en el menu principal. La simulacion cooperativa inicia al entrar a una sala activa; el modo de un jugador conserva su flujo normal. El cliente sincroniza por ids de planeta y recurso del catalogo.

## Proyectos cooperativos

- Desde el menu principal, crea una partida o unete con su codigo. La sala acepta de 2 a 4 comandantes y requiere dos para iniciar.
- Selecciona un personaje canonico de la tripulacion: Sofia Parker, Leo Chen, Marcus Vance o Arthur Vance. Un personaje solo puede ocupar un puesto por sala.
- El anfitrion elige un proyecto: unidad medica para una condicion ficticia, equipo especializado de navegacion o robot asistente para personas mayores.
- El anfitrion selecciona planeta y cuatro materiales distintos disponibles en el catalogo. La receta pide una unidad de cada material.
- El catalogo se filtra con la disponibilidad recolectable del planeta elegido; el servidor verifica la misma lista desde la API planetaria.
- Al guardar la receta, el lobby pasa a una sala de espera con retratos, personajes y minerales elegidos por cada tripulante. Solo el anfitrion inicia la mision.
- Despues de guardar la receta, cada participante elige un mineral distinto en el lobby. Los puestos y las reservas se muestran a todo el equipo; el anfitrion solo puede iniciar cuando todos hayan elegido.
- La lista de minerales identifica al personaje que mantiene cada reserva y bloquea esa opcion para los demas.
- Los jugadores pueden hacer varios despliegues. Un material queda bloqueado mientras otro dron lo recolecta; al depositarse, queda registrado y se puede reservar el siguiente.
- Los drones de los participantes se muestran en la misma superficie; sus posiciones se sincronizan y las colisiones aplican un rebote local visible.
- La Capitana Sofia (anfitriona) pilota la nave principal al planeta de la mision; los demas tripulantes siguen su viaje.
- Durante el vuelo, el servidor comparte la escena, posicion, orientacion y progreso del comandante. Los tripulantes no pueden pilotar la nave ni cambiar de mapa; toman el control de su dron al desplegarlo.
- En superficie, cada tripulante pilota manualmente su dron Assault con WASD, Q/E para altura y F para recolectar (tambien hay boton en pantalla). Al recoger una unidad, el dron vuelve automaticamente a la nave y deposita la carga. Despues puede elegir otro mineral pendiente.
- El aterrizaje ofrece la accion «Desplegar dron recolector». Al entregar los cuatro materiales requeridos, todos ven una animacion de mision completada y se desbloquea el planeta siguiente cuando hay una ruta definida.
- El modelo se carga desde `assets/Assault_Drone_Concept.glb`, conversion local del USDZ proporcionado.
- Cada recurso de superficie genera doce puntos de recoleccion en posiciones aleatorias compartidas por la semilla de la sala. La receta compartida completa el proyecto cuando los cuatro materiales llegan a la nave.
- Los materiales lunares proceden de mineralogia descrita por NASA; algunos minerales de Mercurio y Venus se infieren de mediciones remotas o XRF y se muestran como inferidos, no como yacimientos confirmados.
- Los depositos generados en el terreno son una abstraccion de juego, no coordenadas ni abundancias geologicas reales.
- Si el puerto de la API planetaria no es 8787, pasa `?multi=1&api=http://localhost:PUERTO_API`.
- El lobby muestra la Imagen Astronomica del Dia (APOD) con opacidad del 20 % y una imagen local de respaldo.

En una expedicion local de un jugador, el mismo control manual, retorno, deposito y seleccion del siguiente mineral aparece al activar la exploracion de superficie.

El coordinador agrega el acceso al lobby en la portada; el vuelo cooperativo se ejecuta solo despues de iniciar una sala.
