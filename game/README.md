# Odyssey · guía del sistema actual

## 1. Qué es

Un juego web local de exploración espacial en JavaScript y Three.js. El navegador dibuja las escenas 3D; un servidor Node.js entrega archivos y conecta las consultas de JARVIS y los servicios externos. No es una simulación astronómica a escala real: distancias y tiempos están adaptados al juego. Las superficies de los gigantes gaseosos son escenarios ficticios.

## 2. Qué necesita

- La carpeta completa del proyecto, especialmente index.html, js/, css/ y assets/.
- Node.js para el servidor completo (no requiere instalar paquetes npm). serve.bat busca un Node instalado o el runtime disponible en este equipo; su alternativa PowerShell sirve el juego estático, pero no sustituye las API de Node.
- Un navegador con WebGL, aceleración gráfica y memoria suficiente para texturas, fauna y escenarios. No hay un mínimo de FPS o de memoria certificado.
- Una interacción inicial para permitir audio. El micrófono es opcional y depende de los permisos y del reconocimiento de voz del navegador.
- Internet y una clave Gemini válida con cuota para la conversación remota y la voz generada. La clave se lee en el servidor desde GEMINI_API_KEY o .local/gemini-key: no debe colocarse en el código del navegador. También existe conexión a un modelo local mediante Ollama cuando no se configura Gemini.
- Los comandos locales, modelos y música incluidos no necesitan una respuesta de Gemini. NASA y otras consultas en vivo sí dependen de servicios externos.

## 3. Cómo iniciarlo

1. Abre serve.bat dentro de esta carpeta y conserva abierta la ventana del servidor.
2. Para iniciar explícitamente el servidor completo: node serve.cjs --no-browser.
3. Abre http://127.0.0.1:8080/ en el navegador.
4. Para probar con los mundos desbloqueados: http://127.0.0.1:8080/?pruebas=1. Ese modo usa progreso temporal separado; no es tu partida normal.
5. Después de una actualización recarga con Ctrl+F5.

## 4. Qué ocurre mientras juegas

1. index.html carga estilos, Three.js y módulos. main.js enlaza controles, selección y cambios de modo.
2. Seleccionas un mundo o abres el mapa estelar con N. El visor muestra su modelo, texturas y datos.
3. La navegación actualiza impulso, orientación, cámara y colisiones. Los viajes y la actividad consumen reservas.
4. La entrada al planeta reproduce una transición hacia la superficie. Entrar NO completa la misión.
5. En superficie se generan terreno, clima y elementos adecuados al mundo. La Tierra incorpora fauna y ciudades; el Cretácico usa criaturas y vegetación diferentes. Los tornados y remolinos son efectos locales animados; no aparecen en la Luna ni en Mercurio.
6. Cerca de la base, el botón «Aterrizar en la base» (o el panel de aproximación) inicia el aterrizaje si la nave está operativa y cumple la distancia y altura. Resuelves una pregunta del espacio y un cálculo matemático. Entonces la nave baja suavemente sobre la base, sin repetir la entrada al planeta. Solo al completar la toma se registra la misión.
7. El resultado permite seguir explorando o salir al espacio. La salida reproduce el despegue y requiere combustible.
8. Descubrir grutas, ruinas o depósitos concede 40 créditos una vez por lugar. Los retos matemáticos opcionales conceden 20 una vez por mundo.
9. Esc → Exploración y mejoras permite gastar créditos en motores, escudos, luces o módulo submarino. Hay tres niveles, con costes de 30, 60 y 90 créditos.
10. El guardado usa almacenamiento local del navegador. Cambiar de navegador/perfil o borrar sus datos puede hacer que no veas la misma partida. El modo pruebas no conserva progreso normal.

## 5. Controles y suministros

W/S: avance y reversa. A/D: giro; doble pulsación: barrel roll. Q/E o flechas verticales: subir/bajar en superficie. Espacio: freno. Shift: impulso. V: cámara. N: mapa estelar. T: remolque y reabastecimiento. Esc: pausa y configuración de audio. (La tecla F ya no está asignada; el aterrizaje se hace con el botón correspondiente.)

El combustible alimenta los motores; oxígeno, agua y comida mantienen el soporte vital; el casco representa integridad; repuestos y kits permiten reparar. Reparar usa un kit y 10 repuestos y recupera hasta 30 puntos de casco. Las naves de servicio permiten reabastecerse. El modo relajado reduce consumo y daño, pero conserva consecuencias.

## 6. Cómo funciona JARVIS

Primero se interpretan órdenes permitidas, por ejemplo «viaja a la Luna», «llévame a la base», «busca una gruta», «diagnóstico» o «repara la nave». Esas acciones llaman funciones del juego y respetan sus requisitos. El copiloto usa movimiento normal; un control manual de movimiento cancela su ayuda.

Las preguntas abiertas se envían al servidor /api/jarvis con un historial corto y el estado de suministros. El servidor consulta Gemini o el modelo local y devuelve texto. Una respuesta conversacional no ejecuta código arbitrario: las acciones se realizan mediante comandos programados. La voz y la captura de micrófono son capas separadas y pueden fallar aunque el texto funcione.

## 7. Organización técnica

| Parte | Función |
|---|---|
| serve.cjs, services/ y lanzadores | Servidor local, JARVIS, voz y APIs de la NASA |
| index.html, nasa.html, css/ | Pantallas, menús y organización visual |
| js/core/main.js | Conecta controles y transiciones |
| js/world/space-explorer.js y navigation-physics.js | Navegación espacial y movimiento |
| js/world/surface-explorer.js | Vuelo de superficie, llegada, base y despegue |
| js/world/expedition-systems.js | Reservas, daños, reparación y progreso |
| js/world/planet-ecology.js, world-details.js, planet-phenomena.js | Clima, tráfico, luces y vórtices |
| js/fauna/living-earth.js y earth-assets.js | Fauna animada y modelos locales |
| js/world/exploration-upgrades.js | Créditos, lugares secretos y mejoras |
| js/jarvis/ | Conversación, comandos y copiloto |
| assets/ | Modelos, texturas, música, voces y bibliotecas |
| tests/ | Comprobaciones automáticas y escenarios de prueba |

El código JavaScript está organizado en ocho módulos dentro de `js/`: **core/** (main, test-mode, fluidez, pausa, materiales y datos de la nave), **flight/** (vuelo, aterrizaje, QTE, misiones, flota de rescate), **world/** (exploradores espacial y de superficie, fenómenos, regiones y expediciones), **fauna/** (catálogos de fauna, dinosaurios y modelo GLB), **cinematic/** (intro, diapositivas, guion y diálogo de tripulación), **jarvis/** (asistente, APIs de la NASA y narración), **audio/** (música, efectos y entrada atmosférica) y **ui/** (HUD y paneles del jugador).

Las fuentes 3D de los animales (archivos .blend, .fbx, .gltf y .obj) están reunidas en `sources/` con una subcarpeta por formato. No las necesita la versión web, pero se conservan como trabajo de autoría original. Las notas históricas no describen necesariamente el juego actual.

## 8. Cómo verificarlo

Ejecuta node tests/run.cjs para revisar sintaxis y pruebas. Comprueba además en el navegador selección, movimiento, aterrizaje, despegue, sonido y fluidez: las pruebas de código no demuestran por sí solas la calidad visual o los FPS en tu equipo. Atribuciones de recursos: assets/CREDITS.md.

## Limpieza realizada

Se retiraron tres páginas auxiliares sin referencias del juego en assets/: environment-preview.html, arrival-preview.html y challenge-preview.html. Se retiró la vista previa manual de derrota y su manejador, y el listado duplicado de suministros dentro de JARVIS con su temporizador. Se corrigió la guía local de aterrizaje de JARVIS. La antigua guía queda en docs/historial/README-versiones-anteriores.md para conservar la historia del proyecto.

## Fauna y estelas ampliadas

La Tierra usa únicamente modelos GLB descargados. `js/fauna/earth-fauna-catalog.js` define 59 especies reales repartidas por doce biomas (Ciudad, Océano, Costa, Humedal, Pradera, Sabana, Bosque, Selva, Desierto, Tundra, Glaciar y Montaña), con tamaños por encima de la realidad para que se aprecien desde el aire: vacas, ovejas, caballos blancos, dingos, shibas, perros de la pradera, albatros y tiburones azules se suman a la fauna anterior. Los animales aparecen en manadas, bandadas y bancos de peces, respetando el agua, las pendientes, las zonas urbanas y el bioma de cada especie. No queda fauna procedural. Los dinosaurios cargan desde `assets/models/cretaceous/` y la fauna actual desde `assets/models/wildlife/`, sin duplicados.

El Cretácico conserva 14 especies (`js/fauna/cretaceous-fauna.js`), todas con modelos GLB descargados y a escala de juego con proporciones realistas entre sí: los saurópodos (apatosaurio y brontosaurio) son los gigantes, el espinosaurio y el tiranosaurio los grandes depredadores, y raptorios y ovirráptores son mucho menores, como en la realidad. Se agrupan en manadas y solo aparecen en la Tierra olvidada.

El terreno se divide en doce biomas coherentes con humedad, latitud y altitud, cada uno con vegetación propia (acacias en sabana, coníferas en tundra y montaña, juncos en humedal, cactus en desierto, selva densa y bosque de hoja ancha). Las praderas y sabanas suman hierba alta ondulante con variación de tono y matas de flores de colores; la selva y el bosque añaden helechos arqueados; tundra, glaciar y montaña incorporan bloques glaciares y rocas nevadas; y la costa estrena riscos junto a la línea de agua. Las cuevas de la Tierra adaptan su roca, cristales y luz a su entorno: kárstica, marina, arenisca, hielo, cristal de montaña y obsidiana cretácica. Cada caverna incluye bóveda principal y galería lateral, estalactitas y estalagmites instanciadas, racimos de cristal, luminocientos parpadeantes, goteo animado, charcas con ondas y una baliza de luz visible desde lejos; además incorpora conductos de luz con motas de polvo, cortinas de flujo calcáreo, cristales colgantes del techo; las de obsidiana guardan fémures y costillas cretácicas, las de hielo columnas translúcidas y las kársticas/marinas raíces colgantes.

Además, cada mundo reparte lugares de exploración propios: ruinas y monolitos con bandas rúnicas, campos de géiseres y fumarolas con vapor animado, naufragios con baliza intermitente y escombros, oasis con palmeras y campos de cristales. Al acercarte, la telemetría de superficie muestra el nombre del lugar (🗺️) y de la cueva activa (📍).

Para mantener la fluidez, `js/core/fluidity.js` aplica resolución dinámica adaptativa: si el framerate cae, el pixelRatio del renderer baja en escalones y se restaura cuando sobra rendimiento; la telemetría de superficie limita sus escrituras al DOM.

El sistema de vuelo reactivo (`js/flight/reactive-flight.js`, `js/audio/entry-fx.js`, `js/audio/fx-audio.js` y `js/world/surface-explorer.js`) incluye:
- Entrada y descenso atmosférico con escudo de plasma térmico, líneas de velocidad, chispas incandescentes, fogonazo de nubes y retropropulsores en mundos sin atmósfera. La entrada añade vibración hipersónica de cámara y apertura de FOV durante el calentamiento, y el despegue incluye sacudida de motores, balanceo de ascenso y FOV dinámico hasta alcanzar la órbita.
- Estela tipo *Rooster Tail* (cola de gallo) de agua, arena del desierto, nieve o polvo al volar rasante a gran velocidad, junto con vórtices en las puntas de las alas y cintas de viento (*slipstream*).
- Animaciones articuladas en la nave (`js/flight/ship-controller.js`): alerones, aerofrenos dorsales, micropropulsores RCS, diamantes de choque y tren de aterrizaje retráctil cerca de la base.
- Audio procedural reactivo para viento, espray de agua, polvo, burbujas submarinas, rugido de tornados, estampido sónico y toques de aterrizaje.
- Mapa estelar (`js/world/stellar-map.js`) con órbitas vivas alrededor del Sol, estelas orbitales luminosas, cinturón de asteroides, nebulosas de colores y etiquetas sin solaparse con el disco solar.
- Aterrizaje asistido exclusivamente sobre la base tras resolver una pregunta del espacio y un cálculo matemático, con opción al aterrizar de seguir explorando el planeta o explorar otros planetas.

Para probarlo, recarga el juego y visita Tierra o Cretácico desde el mapa estelar (`N`). Con `?pruebas=1`, todos los mundos y el Cretácico están disponibles sin modificar el progreso normal.
