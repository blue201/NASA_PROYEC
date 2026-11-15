# Servidor multijugador (rol: Multijugador)

La sala tiene capacidad maxima de cuatro jugadores y requiere al menos dos para iniciar. El anfitrion elige uno de tres proyectos, define una condicion ficticia si selecciona la unidad medica, elige planeta y compone una receta de cuatro materiales. Cada jugador puede volver a desplegarse para recolectar los tipos restantes. El servidor bloquea un mineral mientras un dron lo tiene asignado, y lo marca en la receta cuando vuelve a la nave. El proyecto se completa al depositar los cuatro tipos.

Los jugadores seleccionan una de las cuatro identidades de la tripulacion de la historia; no se aceptan nombres libres ni personajes duplicados. Tras configurar la receta, el servidor autoriza reservas unicas durante la fase de espera y las publica al resto. Solo el anfitrion actual puede guardar la configuracion o iniciar, y el inicio exige una reserva valida por participante.

La lista permitida se carga desde `data/planets/<id>.json` cuando esta disponible; en contenedores donde esos datos no se montan en el juego, el servidor consulta la API planetaria configurada en `API_URL`.


La sincronización usa solicitudes HTTP de sondeo; no requiere paquetes adicionales. Las salas se eliminan al quedar vacías, tras tres horas o cuando sus jugadores pasan 30 segundos sin señal. El estado no se guarda entre reinicios del proceso.
