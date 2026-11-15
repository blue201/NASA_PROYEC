# Pendientes

| # | Pendiente | Quién | Estado |
|---|---|---|---|
| 1 | **OK escrito de los organizadores** para usar Odyssey (trabajo previo) en la entrega | Blue / equipo | Pendiente |
| 2 | **Enlace de Drive** con `game/sources/` (103 MB) y `game/assets/music/` (116 MB), pegarlo en el README | Blue | Pendiente |
| 3 | **Usuarios de GitHub** de los 3 compañeros: reemplazar los `TODO-usuario-…` de `.github/CODEOWNERS` y darles acceso al repo | Blue | Pendiente |
| 4 | **8 valores sin confirmar** en `data/planets/moon.json`: temperatura máxima de día, mínima de noche, cráter polar, oxígeno del regolito, helio-3, polvo lunar y los peligros de calor y frío asociados | Datos | Pendiente |
| 5 | **Créditos de los modelos de animales** (`game/assets/models/wildlife/`, `game/sources/`; parecen un paquete de 2022) en `game/assets/CREDITS.md` | Modelado | Pendiente |
| 6 | **Subir `main`** a GitHub (una vez, con `--no-verify`) y dejarla como rama por defecto | Blue | Pendiente |
| 7 | **Quitar firmas de IA** de los commits existentes (ya subidos en `rol/*` y `feat/hangar`) cuando Blue lo autorice | Blue decide | Pendiente |
| 8 | **Origen de la licencia MIT de Antonio Maiorano** en `game/LICENSE.txt` | Equipo | Pendiente |
| 9 | Nave basada en **"Arwing"** (`ArwingShip`, `starfox-radio-box`): es de Star Fox (Nintendo). Cambiar nombre y diseño antes de mostrarlo | Modelado / Historia | Pendiente |
| 10 | Texto **"Coalición Espacial NASA"** de la intro: no usar la marca NASA | Historia | Pendiente |
| 11 | Hangar **pasos c y d**, luego archivar `web/` y quitarlo del compose | Datos / común | En curso |
| 12 | Hacer el repo **público** antes de entregar (cuando Blue diga) | Blue | Esperando |

Entrega: **domingo 15 de noviembre de 2026, 17:00** (hora de Honduras).

### Hangar y prólogo de 15 escenas · 15 de noviembre de 2026

- Revisar visualmente el hangar y el prólogo recuperado en escritorio y móvil. El control de Edge bloqueó la comprobación automática al no poder verificar la URL.
- Documentar la licencia de las ilustraciones recuperadas del prólogo y la autorización de redistribución de `prologue-theme.mp3` (pista identificada por el usuario como «The Last Of Us - Theme song»). Procedencia detallada en `game/assets/CREDITS.md`.

### Transiciones planetarias · 15 de noviembre de 2026

- Verificar visualmente y medir FPS reales al entrar y salir de los planetas tras optimizar el terreno, limitar temporalmente la resolución y ocultar detalles lejanos durante el ascenso. Las pruebas de trayectoria y restauración pasan. El acceso al navegador no está disponible para completar la medición con GPU.
- Verificar visualmente la reproducción de «Dizzying space travel» al entrar al Cretácico, el retorno al descenso y los límites de consumo gráfico actualizados. El visor externo requiere internet. Para una futura integración totalmente local, obtener el archivo del modelo mediante una sesión autorizada de Sketchfab.

### Inicio, pausa y tripulación · 15 de noviembre de 2026

- Revisar visualmente el menú inicial con su canción, la cubierta desgastada del diario, las respuestas manuales del ordenador orbital y las selecciones del hangar en escritorio y móvil. Las pruebas automatizadas cubren la música del menú, la separación del diario y la exigencia de respuestas; falta aceptación visual en navegador.

## Pendientes anotados por RamiPosadas

### Agua y comida diarias (PR #3)
- Blue debe revisar el balance de raciones: 120 L y 60 000 kcal comunes; perfiles ficticios individuales, día de 20 minutos activos (más lento en relajado), máximo dos días asignados. No son recomendaciones médicas.
- Conservar el fallo previo de check-jarvis-chat.cjs como incidencia separada.
- Conciliar la bitácora con el PR de historia y docs/equipo al integrar. *(Resuelto al integrar.)*

### Recursos de Marte (PR #4)
- Datos: caracterizar abundancias por lugar, incertidumbre y rendimiento de extracción. Los cinco null de abundancia son desconocidos, no cero.
- Recursos de Marte son contenido de datos; su misión, conexión con recolección 3D y balance industrial quedan fuera de este PR. No se cambia moon.json ni se inventan IDs de misiones.
- Conciliar estas entradas con docs/equipo y los otros PR de Historia al integrar. *(Resuelto al integrar.)*

### Historia de Génesis (PR #2)
- El consumidor del hangar/reporte deberá mostrar `design_guidance`, `success_text` y `failure_texts` de la misión: este PR entrega contenido, no implementa el rover ni la extracción.
- La suite original falla en `check-jarvis-chat.cjs` antes de estos cambios; revisar su simulación del endpoint con el responsable de servicios.
- Coordinar estas entradas con la documentación todavía en la rama `docs/equipo`. *(Resuelto al integrar.)*
