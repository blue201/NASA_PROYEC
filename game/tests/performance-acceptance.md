# Validación de rendimiento — Etapa 37

Resolución de referencia confirmada: **1920 × 1080**.
Objetivo: **60 FPS**. Referencia para escenas exigentes: **45 FPS**.

## Equipo de referencia comunicado por el usuario

- Procesador: Intel Core i7 de 8.ª generación; modelo exacto pendiente.
- Memoria RAM: 16 GB.
- Tarjeta gráfica: NVIDIA Quadro P2000, según lo comunicado por el usuario.
- Memoria gráfica: 4 GB de VRAM declarados por el usuario; pendientes de verificación en el equipo.
- Resolución: 1920 × 1080.
- Sistema operativo, controlador gráfico y frecuencia de pantalla: pendientes de registrar.

Esta descripción es provisional y no acredita el rendimiento. La cantidad de VRAM no identifica la capacidad de la GPU; los objetivos se comprobarán con mediciones reales en el equipo indicado.

## Medición preparada

Desde la pausa, abrir «Rendimiento · referencia Full HD». El informe usa los intervalos reales entre cuadros de animación y muestra FPS medios, tiempo medio, percentil 95 y máximo. Conserva hasta 12.000 intervalos recientes por actividad y resolución, con un máximo de 12 combinaciones en memoria.

La resolución comprobada es la del lienzo renderizado, no solo el tamaño de la ventana. Por ejemplo, una ventana de 1920 × 1080 con densidad de píxeles 2 puede renderizar a 3840 × 2160: esa muestra se identifica como fuera de referencia. El medidor no cambia la resolución ni la calidad visual.

Se excluyen pausa, pestañas ocultas, pérdida de contexto gráfico y los primeros 2 segundos de cada segmento. No se descartan los cuadros lentos durante una actividad visible. Las pruebas de carga inicial y transición deben realizarse por separado: este medidor no las acredita.

Reunir al menos 30 segundos medidos por actividad y resolución. Las actividades breves pueden necesitar varios intentos. Las cifras se calculan en memoria y no se transmiten a ningún servicio.

## Matriz pendiente de ejecución real

| Navegador | Versión | Vuelo | Acoples | Descenso / estacionamiento | Exploración | Escenas exigentes |
|---|---|---|---|---|---|---|
| Chrome actual | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Edge actual | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Firefox actual | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

Registrar procesador, tarjeta gráfica y controlador, memoria RAM, sistema operativo, resolución renderizada y frecuencia de pantalla. Repetir los mismos recorridos y condiciones por navegador. Identificar las escenas exigentes antes de evaluar sus resultados; los 45 FPS no sustituyen el objetivo general de 60 FPS.

Comparar FPS medios y distribución de tiempos de cuadro; registrar tirones, crecimiento de memoria y fallos visibles. No atribuir una causa a CPU o GPU solo con estos intervalos: esa investigación requiere herramientas de perfilado del navegador.

## Estado

El medidor y sus cálculos tienen pruebas automatizadas con tiempos sintéticos. Esas pruebas **no demuestran** que el juego alcance los FPS objetivo. La compatibilidad, los recorridos integrales, las mediciones reales y la aprobación de todas las pruebas de aceptación siguen pendientes. No publicar hasta aprobarlas todas.

### Primera comprobación real

El 15 de octubre de 2026 se realizó una prueba en el navegador integrado con lienzo de 1920 × 1080 y densidad 1. El informe mostró 58,3 FPS medios durante 33,2 segundos acumulados de vuelo, 17,16 ms de tiempo medio, percentil 95 de 16,90 ms y máximo de 50,00 ms. Un acople registró 59,1 FPS en 1,1 segundos, muestra insuficiente. No se verificó la GPU efectiva ni el controlador, ni se completó la matriz de Chrome/Edge/Firefox. Estos resultados no aprueban la aceptación ni acreditan todas las escenas exigentes.

También se comprobaron hangar, cancelación, pausa, bloqueo/desbloqueo científico, transición al descenso y recuperación por recarga. Se corrigieron errores de estructura HTML, un programa gráfico de atmósfera, una llamada inexistente en la nave averiada y la integración de escaneo y catálogo. Se añadieron regresiones automatizadas para la estructura HTML, la animación de daño y el escaneo con pausa y cambios de fase.
