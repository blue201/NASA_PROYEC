# Cómo trabajamos (Team Rocket HN)

## Reglas
1. **Nadie sube directo a `main`.** Todo entra por pull request y lo aprueba otra persona.
2. `main` siempre funciona: antes de abrir un PR, el juego debe abrir y la Luna debe cargar.
3. Cambios pequeños: un PR por tarea (mejor 5 PR chicos que 1 gigante).
4. Cada quien trabaja en su zona (ver tabla). Si tocas la **zona común**, avisa en el grupo y pide revisión.
5. Nunca subas llaves ni `.env`. Usa `.env.example` como plantilla.
6. Todo dato real lleva su fuente (`source_url`) en `data/planets/`.
7. Declaramos el uso de IA en el README.

## Activa el aviso local (una vez por persona)
```bash
git config core.hooksPath .githooks
```
Desde ahí, `git push` a `main` se bloquea con un aviso. GitHub no puede proteger `main` en un repo privado gratis, así que esta regla depende de todos.

## Ramas
| Rama | Quién | Para qué |
|---|---|---|
| `main` | nadie directo | versión que siempre funciona |
| `rol/datos` | Datos y peligros | APIs, `data/planets/`, hangar de diseño |
| `rol/historia` | Historia | guion, misiones, textos, diálogos |
| `rol/modelado` | Modelado y superficie | Luna, aterrizaje, rover, dron |
| `rol/multijugador` | Multijugador | modo de hasta 4 jugadores, detrás de `?multi=1` |

Para una tarea concreta crea una rama corta desde la de tu rol (`rol/modelado/rover`), abre el PR hacia `main` y bórrala al fusionar.

## Zonas
| Zona | Carpetas | Dueño |
|---|---|---|
| Datos y peligros | `api/`, `data/`, `game/services/` | Datos |
| Historia | `game/js/story/`, `game/js/cinematic/`, `game/js/jarvis/`, `game/assets/audio-es/`, `game/assets/cinematics/` | Historia |
| Modelado y superficie | `game/js/world/`, `game/js/surface/`, `game/js/fauna/`, `game/js/flight/landing-game.js`, `game/assets/models/`, `game/assets/pbr/` | Modelado |
| Multijugador | `game/js/multiplayer/`, `game/server/multiplayer/` | Multijugador |
| **Común (con revisión)** | `game/index.html`, `game/js/core/`, `game/js/ui/` (HUD, cabina), resto de `game/js/flight/`, `game/css/`, `game/serve.cjs`, `game/js/design/`, `docker-compose.yml`, `.github/` | todos |

`game/index.html` carga cada script con una etiqueta `<script>`: es el archivo con más riesgo de choques. Agrega tu línea al final de tu bloque y avisa.

## Orden de trabajo
1. **La Luna completa de principio a fin**: diseño → vuelo → aterrizaje → rover y dron → recolección → reporte.
2. Después, multijugador y otros planetas en su propia rama, sin romper el modo de un jugador.
