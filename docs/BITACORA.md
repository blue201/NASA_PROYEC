# Bitácora

Registro por fecha de lo hecho y lo decidido. Lo más nuevo va arriba dentro de cada día. Cada PR agrega su línea.

## 2026-11-15

### Disponibilidad por planeta y sala de espera con retratos
El selector muestra los materiales recolectables segun el planeta configurado. La validacion del servidor consulta la API planetaria si los JSON no estan montados en el contenedor de juego. Al guardar la receta, el lobby cambia a una sala de espera con miniaturas oficiales de la tripulacion, sus minerales asignados y el inicio reservado al anfitrion.

Se modifican `game/js/multiplayer/cooperative-mission.js`, `game/server/multiplayer/rooms.cjs`, el README multijugador y esta bitacora.

### Reservas visibles, colisiones y mas depositos
El selector de la sala identifica al personaje que reservo cada mineral y deshabilita ese material para el resto. En superficie, cada participante ve los drones remotos; las posiciones se interpolan y las trayectorias producen un rebote cuando los drones se encuentran. Los recursos del catalogo generan doce depositos por tipo en posiciones pseudoaleatorias separadas, con una semilla compartida por sala para que el equipo vea el mismo terreno.

Se modifican `game/js/multiplayer/cooperative-mission.js`, `game/server/multiplayer/rooms.cjs`, `game/js/surface/resource-deposits.js`, los README de multijugador y esta bitacora. El ajuste en superficie queda sujeto a revision del rol de Modelado y Superficie.

### Lobby cooperativo: sala de espera y asignaciones
La sala de espera usa la imagen del dia con opacidad del 20 % y queda centrada. El sondeo solo redibuja cuando cambia el estado compartido, evitando que cierre los desplegables. Crear/unirse usa personajes canonicos de la tripulacion; el servidor impide duplicarlos y publica sus roles. Tras guardar la receta, todos ven los minerales y pueden reservar uno distinto; la reserva se sincroniza y bloquea para los demas. Solo el anfitrion validado puede guardar/iniciar, y la partida exige que cada participante seleccione un mineral. Las solicitudes de unirse ya no reutilizan credenciales antiguas de otra sala.

Se modifican `game/js/multiplayer/cooperative-mission.js`, `game/server/multiplayer/rooms.cjs`, los README de multijugador y esta bitacora.

### Partidas cooperativas de recolección mineral
La sala del menu principal permite de 2 a 4 jugadores y exige dos para iniciar. El anfitrion elige una unidad medica para una condicion ficticia seleccionable, equipo especializado de navegacion o robot asistente para personas mayores; tambien define el planeta y una receta de cuatro materiales distintos. Los jugadores pueden hacer varios despliegues: un material queda bloqueado mientras otro dron lo recolecta y se registra al depositarlo. El proyecto se construye cuando el equipo entrega los cuatro tipos. Se agregan minerales documentados para la Luna, Mercurio y Venus. En Mercurio, la mineralogia se infiere de MESSENGER; en Venus, los minerales se infieren de calculos normativos sobre analisis XRF, por lo que quedan marcados como inferidos y con abundancias pendientes. Depositos y cantidades recolectables son balance de juego, no cartografia ni reservas reales.

Se modifican `game/js/multiplayer/cooperative-mission.js`, `game/server/multiplayer/rooms.cjs`, `game/js/surface/resource-deposits.js`, `data/planets/moon.json`, `mercury.json`, `venus.json`, los README de multijugador, `docs/PENDIENTES.md` y esta bitacora. La carga del script y la ruta API ya estaban conectadas en la rama; los cambios en superficie requieren revision de Modelado y Datos.

### Tecla Espacio y señal CRT del prólogo

La tecla Espacio avanza una diapositiva del prólogo y queda aislada de los controles de vuelo; no permite retroceder ni omitirlo. Se refuerza la textura de televisor antiguo durante el prólogo y se mantiene el destello de distorsión al cambiar de escena, con versión estática para movimiento reducido.

Se modifican `game/js/cinematic/cinematic-slides.js`, `game/css/styles.css` y esta bitácora.

### Pausa solo con Escape y secciones en ventanas superpuestas

Se oculta y desactiva el botón visible de pausa para conservar Escape como único acceso. Las secciones de controles, audio, video y configuraciones se abren en ventanas modales sobre el menú de pausa; Escape cierra primero la sección y luego reanuda la misión.

Se modifican `game/index.html`, `game/js/core/partial-pause.js`, `game/css/clean-hud.css`, `game/css/player-experience.css` y esta bitácora.

### Respuestas inmediatas en cálculos y diagnóstico de voz de Laica

Los tres cálculos de la misión validan la opción al seleccionarla: una respuesta correcta se marca en verde y desbloquea la siguiente pregunta; una incorrecta se marca en rojo y permite reintentar sin botón de confirmación. La interfaz de Laica informa si el navegador carece de reconocimiento de voz y muestra mensajes distintos para permisos, conexión y errores de escucha.

Se modifican `game/js/core/main.js`, `game/js/jarvis/jarvis-planets.js`, `game/css/clean-hud.css` y esta bitácora.

### Navegación, voz Laica y diario por dificultad planetaria

El mapa estelar queda sobre el estado de la nave y el botón visible de pausa se oculta durante la navegación; Escape conserva la pausa. El panel de estado muestra casco, combustible y oxígeno. El asistente visible se llama Laica y acepta comandos de voz para abrir mapa y diario, pausar/reanudar, consultar estado y viajar a destinos. El diario presenta los totales de repuestos, agua, comida y energía; la necesidad y entrega de raciones de agua/comida escalan por planeta con multiplicadores ficticios de dificultad.

Se modifican `game/js/ui/player-experience.js`, `game/js/ui/crew-diary.js`, `game/js/jarvis/jarvis-planets.js`, `game/js/jarvis/jarvis-copilot.js`, `game/js/jarvis/planet-narrator.js`, `game/css/clean-hud.css` y esta bitácora.

### Hangar de tres componentes y durabilidad base del dron

El hangar deja tres selecciones: energía, peso del dron y resistencia. Sus valores calculan una durabilidad base de juego (55% resistencia, 25% energía y 20% peso), que viaja con los datos de lanzamiento. El peso y el blindaje se suman a masa, volumen y presupuesto, conservando las validaciones de despliegue.

Se modifican `game/js/design/hangar.js`, `game/css/hangar.css` y esta bitácora. La durabilidad se entrega como dato del lanzamiento; su uso para aplicar daño al dron queda pendiente porque este cambio se limitó al hangar.

### Verificaciones breves antes del despliegue

El inicio de expedición requiere tres cálculos de selección múltiple: impulso total de la trayectoria, tiempo de transferencia y propelente. El hangar resume las verificaciones previas en masa/capacidad, presupuesto y energía/propulsión; se mantienen los bloqueos de diseño existentes.

Se modifican `game/js/core/main.js`, `game/js/design/hangar.js`, `game/css/hangar.css` y esta bitácora.

### Lanzamiento sin preguntas de autorización

Se elimina el cuestionario de autorización que aparecía al salir del hangar y antes del lanzamiento. Los retos de escaneo, aterrizaje y recompensas opcionales se conservan.

Se modifica `game/js/core/main.js` y se registra en esta bitácora.

### Pausa organizada y retorno al menú

Se amplía el diálogo de pausa con diseño rectangular y secciones plegables de controles, audio, video y configuraciones. Continuar queda como acción principal; volver al menú guarda la expedición antes de regresar a la portada. Al completar un escaneo orbital, el botón deja de mostrarse y se conserva para destinos pendientes.

Se modifican `game/index.html`, `game/js/ui/clean-hud.js`, `game/js/core/audio-mixer.js`, `game/js/core/partial-pause.js`, `game/js/core/main.js`, `game/css/player-experience.css` y `docs/BITACORA.md`, con aprobación del alcance en zona común.

### Cálculos breves, nave del menú y prólogo manual

El ordenador orbital presenta seis preguntas de selección múltiple con opciones a dos decimales y conserva el desbloqueo por etapas. La portada reutiliza el mismo modelo Arwing que vuela durante la exploración. El prólogo ocupa toda la pantalla y solo avanza al pulsar «Siguiente»; se quitaron los controles visibles de retroceso y omisión y se desactivó el avance por teclado y temporizador.

Se modifican `game/index.html`, `game/js/core/main.js`, `game/js/ui/start-menu.js`, `game/js/cinematic/cinematic-slides.js`, `game/css/clean-hud.css`, `game/css/styles.css` y `docs/BITACORA.md`, con aprobación del alcance en zona común.

### Portada orbital, diario y controles de música

Se anima la nave de la portada sobre un campo estelar y se acerca el diario a una página de cuaderno ilustrado. El tema del prólogo intenta iniciarse al abrir el menú y vuelve a intentarlo con la primera interacción si el navegador bloquea el autoplay. Pausa ahora ofrece pista anterior/siguiente y pausar/reanudar; el volumen se mantiene en los controles existentes.

Se modifican `game/index.html`, `game/css/clean-hud.css`, `game/js/ui/start-menu.js`, `game/js/core/audio-mixer.js` y `game/js/audio/folder-music.js`. Las pistas anterior/siguiente requieren una biblioteca en `game/assets/music/library.json`; esa carpeta no está incluida en esta copia.

### Cámara cinemática en vuelo

Se añade una toma orbital 360° de bajo coste que empieza tras 60 segundos sin controles durante el vuelo espacial. La cámara varía suavemente su altura y distancia alrededor de la nave. Pulsar una tecla o iniciar un arrastre táctil devuelve la cámara al modo normal. La simulación de vuelo continúa durante la toma.

Se modifica `game/js/flight/flight-game.js`. Verificar en un vuelo: esperar un minuto sin controles, observar la órbita completa y mover la nave o la cámara para confirmar que vuelve el control normal.

El botón de lanzamiento vuelve a abrir el ordenador orbital y espera a que termine el cálculo antes de habilitar el viaje. Los destinos seleccionados desde exploración y aproximación sincronizan la pestaña y la telemetría, y pasan por el mismo cálculo. Si el navegador bloqueó el audio automático del prólogo, el primer clic del usuario vuelve a intentar reproducirlo.

Se modifica también `game/js/core/main.js`. Verificar inicio con Nueva misión, seleccionar Luna o Tierra, abrir el ordenador de vuelo, esperar el 100 % y comenzar el viaje. El reproductor usa la música local del prólogo cuando existe; la canción de YouTube referida antes no está en `game/assets/music/` en esta copia.

### Menú, diario, cálculos y selección del hangar

Se rediseña la portada de inicio y se integra `assets/cinematics/prologue-theme.mp3` con reproducción automática cuando el navegador la permite y un control explícito para reproducir o pausar. El diario deja de insertarse en Pausa: abre un diálogo independiente desde un botón de libro de cuero envejecido, fijo en la esquina inferior izquierda. El ordenador orbital ahora exige seis respuestas introducidas por el jugador (semieje, impulsos de salida y llegada, tiempo Hohmann, propelente y oxígeno); no revela cada resultado ni habilita el vuelo hasta validar todas. Las tarjetas de componentes del hangar muestran con más claridad el componente elegido y reciben foco de teclado.

Se modifican `game/index.html`, `game/css/clean-hud.css`, `game/js/ui/start-menu.js`, `game/js/ui/crew-diary.js`, `game/js/core/main.js` y `game/js/design/hangar.js`. Se actualiza `game/tests/check-start-menu.cjs` y se añade `game/tests/check-manual-orbital-math.cjs`. La revisión visual del menú, la cubierta del libro y las tarjetas del hangar queda pendiente en navegador de escritorio y móvil.

## 2026-11-14 (sábado, día 1)

### Decisiones
- **Reto elegido:** Space Mission Design Game. El centro es diseñar la misión con presupuesto, masa y energía, y ver las consecuencias.
- **Primero la Luna completa** (diseño → vuelo → aterrizaje → rover/dron → recolección → reporte). Multijugador y otros planetas, después y en su propia rama.
- **Premisa:** la IA agotó recursos de la Tierra; hay que extraer recursos reales en la Luna (hielo de agua en Shackleton).
- **Repositorio:** `blue201/NASA_PROYEC`, creado hoy a las 10:12, después del arranque. **Privado** hasta que Blue diga.
- **Integrar Odyssey** (juego previo del equipo) en `game/` en vez de partir de cero, con su uso en la entrega **pendiente del OK escrito de los organizadores**.
- **Integrar el hangar** del prototipo `web/` (puerto 5299) dentro del juego, en la rama `feat/hangar`. El prototipo se **archiva y sale del docker compose** cuando el hangar funcione dentro del juego.
- **Reglas de git:** nada directo a `main`; ramas por rol y PR pequeños; antes de cada commit/push se muestra lista, título y descripción y se espera el "dale" de Blue; **sin firmas de IA** en commits ni PR.

### Hecho
- **Prototipo `web/`** (Vite): hangar con objetivo, lanzador, órbita y 4 subsistemas; misión de 3 pases con tormenta solar; reporte. Valores de CubeSat 101 marcados por verificar.
- **API `api/`** (Node sin dependencias, Docker): `/api/images` (NASA Image and Video Library, filtrado a Luna y CubeSats), `/api/distance` (JPL Horizons), `/api/planets`.
- **Mudanza:** Odyssey copiado de `PROYECTOS/NASA` a `NASA_PROYEC/game/` sin tocar el original. Excluidos `.local/` (llave de Gemini), `game/sources/` (103 MB de modelos fuente) y `game/assets/music/` (116 MB): van por Drive. Verificado: la llave no aparece en el código ni en el historial; el juego corre sin modelos fuente.
- **Estructura por rol:** carpetas nuevas `game/js/{design,surface,story,multiplayer}`, `game/server/multiplayer`, `CODEOWNERS`, `CONTRIBUTING.md`, `tasks/`.
- **Contrato de datos:** `data/planets/moon.json` con gravedad, temperaturas, recursos y peligros, cada uno con su fuente; `schema.json` y `npm run check-planets`. Quedan 8 valores `verified: false`.
- **Docker:** `docker compose up` levanta juego (8400), API (8787) y prototipo (5299). Puertos configurables; `game/serve.cjs` acepta `PORT` y `HOST`.
- **Licencia:** `game/LICENSE.txt` es MIT de "Antonio Maiorano, 2014". Su nombre no aparece en ningún archivo de código; origen desconocido (probable plantilla inicial). Se conserva tal cual y se acredita en el README. three.js r128 (MIT) está vendorizado con su licencia.
- **Hook local:** `.githooks/pre-push` bloquea el push a `main`; `.githooks/commit-msg` rechaza firmas de IA.
- **Hangar en el juego (rama `feat/hangar`):** paso a (pantalla con el botón 🛠 Hangar) y paso b (el despegue pasa por el hangar y se bloquea si el diseño no cumple). Paso c (valores en la cabina) en curso.
- **GitHub:** subidas `rol/datos`, `rol/historia`, `rol/modelado`, `rol/multijugador` y `feat/hangar`. `main` pendiente de que Blue la suba (requiere saltarse el aviso local una vez).
- Música y modelos fuente sacados de **todo el historial** de git antes del primer push.

### Aportes de RamiPosadas (por hora)

#### 14:11 · Agua y comida diarias (PR #3)

Traslado selectivo del diario de tripulación: reparto manual, reservas individuales, consumo por día simulado y consecuencias por privación. El almacén y los motores nuevos del equipo se conservan; se integra el diario sin sustituir su modelo de velocidad ni las mejoras existentes. Revisión solicitada a Blue por tocar index, UI, CSS, vuelo y el punto de consumo en world.

#### 14:14 · Recursos de Marte (PR #4)

Se añade data/planets/mars.json con hielo de agua, muestras con minerales de hierro y minerales identificados por CheMin (plagioclasa, piroxenos y olivino). Cada evidencia tiene fuente NASA y estado de verificación. Radio y período de rotación son aproximaciones explícitas de NASA Mars Facts. Las cinco abundancias quedan pendientes; no se prometen minas de oro ni metales puros. La API existente lo descubre sin modificar el contrato ni desplazar la misión lunar.

#### 14:27 · Historia de Génesis (PR #2)

Adaptación selectiva de Génesis al repositorio del equipo: prólogo de siete escenas (56 segundos sin pausas), misión lunar y explicaciones de presupuesto, masa, energía y comunicaciones. Se mantiene el reproductor CRT existente y se reemplazan las grabaciones con guion obsoleto por la narración del texto vigente. No se importan modelos ni música.

Se elimina el segundo disparador de inicio en main y el prólogo antiguo por radio. Los accesos heredados abren la presentación vigente; una llamada repetida no reinicia una escena activa. Se conservan las marcas de partidas anteriores.

## 2026-11-15 (domingo, día 2)

### Luna primero y planetas reales
Candado de planetas (Tierra y Luna activas; Marte tras la misión lunar). Se quitaron monumentos, cristales, cuevas y sondas inventadas en todos los planetas; quedan solo cosas reales con fuente: tubo de lava de Marius, pozos de Arsia Mons, chorros de CO₂, esférulas de hematita y los sitios de NASA. Sin estelas de viento ni plasma en cuerpos sin atmósfera. Arreglado "Explorar otros planetas". Modelos de Perseverance e Ingenuity con logos tapados.

### Pruebas que fallan sin ser errores nuevos
`check-expanded-nasa-apis`, `check-jarvis-chat`, `check-server-routes` y `check-voice-service` necesitan red o llaves (Gemini, api.nasa.gov). Ya fallaban en el Odyssey original.

### Correcciones del hangar y recuperación del prólogo

15 de noviembre de 2026. SI, asistente del equipo, a solicitud del usuario y con aprobación del alcance en zona común.

Se bloquean diseños guardados con estructuras o subsistemas inexistentes. El hangar utiliza un diálogo modal, conserva el foco y el desplazamiento al cambiar componentes, restaura el foco al cerrar, evita aperturas duplicadas y permite reintentar la descarga del catálogo. El despegue respeta el estado deshabilitado del botón y libera siempre su permiso temporal de paso.

Se recuperan las 15 escenas «ARCHIVO GÉNESIS», sus imágenes y la pista musical de la copia local del equipo en `Desktop/ULTIMO/SPACE/Space/work/NASA_PROYEC`. Sustituyen al prólogo de siete escenas. Se conserva un único disparador de inicio, con una marca de versión para que quienes vieron la introducción anterior puedan ver esta. La pista se detiene al cerrar y restaura la música del juego. Los créditos registran la procedencia y las licencias pendientes.

Pruebas específicas de diseño, interfaz simulada del hangar, inicio del prólogo y presentación aprobadas. La suite completa se detiene en el fallo de `check-jarvis-chat.cjs` ya documentado. La revisión visual en Edge queda pendiente porque la herramienta de control no pudo verificar la URL del navegador.

Por solicitud del usuario, SI desactiva la lectura en voz alta de las 15 diapositivas del prólogo. La presentación conserva su pista musical y el avance automático para lectura en pantalla.

### Rendimiento al entrar y salir de los planetas

15 de noviembre de 2026. SI, a solicitud del usuario. Cambio localizado en `game/js/world/surface-explorer.js`, zona de Modelado y superficie, para reducir las pausas de preparación y el coste de las transiciones.

El terreno calcula su altura una vez por vértice, reutiliza el objeto de color y precalcula las posiciones y radios de los cráteres. Comparación local en Node/VM de 30 000 vértices lunares: 10 829 ms antes y 3 103 ms después. Las alturas coinciden exactamente en 1 080 puntos repartidos entre los nueve planetas. La medición corresponde al cálculo de CPU, sin renderizado ni GPU.

Durante la entrada y la salida se limita temporalmente la densidad de píxeles a 1,25. El ajuste adaptativo normal continúa después de la transición y se restaura la densidad anterior al terminar o cancelar. En el ascenso se ocultan los detalles de superficie a partir del 35 % del recorrido y se restauran al limpiar la transición. Pruebas de repetición, restauración, visibilidad, entrada, salida y movimiento a 30/60/144 FPS simulados aprobadas. La comprobación visual y los FPS reales quedan pendientes porque el acceso al navegador sigue indisponible.

### Menor consumo gráfico y viaje al Cretácico

15 de noviembre de 2026. SI, a solicitud del usuario tras reportar lag persistente y proporcionar la animación de Sketchfab. Se revisan los límites anteriores para reducir también el trabajo de GPU.

Las transiciones se dibujan aproximadamente a 30 FPS con un ancho de renderizado máximo de 1280 píxeles y densidad máxima de 1. Se suspenden las actualizaciones del mapa de sombras y se restauran al terminar o cancelar. Se ocultan fauna y detalles durante la entrada, y desde el 15 % del ascenso en la salida. Las nubes de transición bajan de 44 a 10, las ambientales de 110 a 32, la precipitación de 1200 a 400 trazos, las estelas de entrada de 108 a 24 y las brasas de 180 a 48. Se elimina la luz puntual de los efectos y la segunda estela superpuesta. El avance cinematográfico conserva el tiempo transcurrido en fotogramas lentos. La miniatura de la nave en `game/js/ui/ship-status-preview.js`, zona común que requiere revisión, dibuja a 10 FPS y se suspende durante las transiciones. Las pestañas ocultas suspenden el renderizado de superficie.

La entrada al Cretácico muestra la animación original de Canary Games, CC BY 4.0, mediante el visor oficial de Sketchfab. El juego suspende su renderizado durante el visor. Al terminar, omitir o fallar la carga se libera el iframe y continúa el descenso local. La salida del planeta conserva su propio recorrido. La descarga oficial devuelve 401 sin sesión, por lo que esta integración requiere internet para mostrar la animación externa. SDK y página incrustada comprobados con HTTP 200.

Nueve pruebas específicas aprobadas, incluyendo fin de animación, omisión, callbacks tardíos, fallo de red, espera máxima, modo sin conexión, suspensión del renderizado, límites de partículas y restauración de resolución y sombras. La comprobación visual y las mediciones de consumo y FPS con GPU permanecen pendientes.

### Menú de inicio, pausa y diario de tripulación

15 de noviembre de 2026. SI, a solicitud del usuario y con aprobación explícita para los tres cambios en zona común.

Se incorpora un menú inicial con Nueva misión, Cargar misión y Opciones de sonido. La partida y el prólogo esperan a que la persona elija. La carga usa el último checkpoint válido. Una nueva misión solicita confirmación al existir un guardado y reinicia las claves de progreso de la expedición, con recuperación de los valores anteriores si falla el reinicio. Las preferencias de sonido se conservan. Los controles del mezclador se reutilizan en el inicio y en la pausa.

Se retira la regla CSS que ocultaba siempre el botón de pausa. El controlador recupera su estado cuando cambia el motor o se cierra el diálogo, libera controles y capturas de arrastre y permite pausar también desde el selector planetario. El acceso Diario abre la pausa y muestra las reservas de Sofia, Leo y Marcus. En pantallas pequeñas se accede al diario desde Pausa. Se conservan el reparto manual, el límite de dos días, los descuentos del almacén y el consumo durante juego activo. La interfaz muestra simultáneamente deshidratación e inanición cuando corresponden, además del bienestar y los botones para dar agua y comida. Los tiempos son reglas ficticias de juego ya existentes.

El checkpoint incorpora la fase de superficie, con posición, cámara, orientación y estado de aterrizaje. Se aceptan los guardados anteriores y se excluyen los fotogramas transitorios de entrada o descenso asistido. La carga en superficie utiliza la entrada normal del motor y restaura una posición segura, con la nave detenida. Las reservas de tripulación y del almacén se persisten al guardar el checkpoint.

Se modifican `game/index.html`, `game/css/clean-hud.css`, `game/js/core/main.js`, `game/js/core/partial-pause.js`, `game/js/core/audio-mixer.js`, `game/js/ui/crew-diary.js`, `game/js/cinematic/cinematic-slides.js` y `game/js/flight/mission-checkpoints.js`. Se añade `game/js/ui/start-menu.js` inmediatamente antes de main para que publique el estado del menú antes de decidir cómo iniciar. Se añaden pruebas de menú y se amplían las de pausa, diario, recuperación y prólogo.

Pruebas específicas de los tres cambios aprobadas. La suite completa valida la sintaxis y se detiene en el fallo previo de `check-jarvis-chat.cjs`. La revisión visual queda pendiente porque el canal nativo de control del navegador no está disponible.
