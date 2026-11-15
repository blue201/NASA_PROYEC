# Arquitectura

```
                 ┌──────────────── docker compose ────────────────┐
 navegador ──▶   │  game  :8400   node serve.cjs (estáticos +     │
                 │                 /api/jarvis, servicios NASA)    │
                 │      │ fetch                                    │
                 │      ▼                                          │
                 │  api   :8787   node src/server.js ──▶ NASA Images│
                 │                 /api/planets ◀── data/planets/   │──▶ JPL Horizons
                 │                 /api/distance, /api/images       │
                 │  web   :5299   prototipo Vite (se archiva)       │
                 └─────────────────────────────────────────────────┘
```

## Piezas

| Pieza | Qué hace | Dónde |
|---|---|---|
| **Juego** | Three.js r128 sin empaquetador. `index.html` carga ~70 scripts en orden; se comunican por `window.*`. `main.js` orquesta pantallas (selección de planeta, vuelo, aterrizaje, superficie). | `game/` |
| **Servidor del juego** | Sirve los archivos y las rutas `/api/jarvis` (Gemini u Ollama) y servicios NASA con llave del servidor. | `game/serve.cjs`, `game/services/` |
| **API** | Node sin dependencias. Normaliza NASA Images y Horizons (con `source_url`, `retrieved_at`) y sirve los planetas. Caché en memoria. | `api/` |
| **Datos por planeta** | Contrato compartido: un JSON por cuerpo con valores, unidades y fuentes. Agregar un planeta = agregar un archivo. | `data/planets/` |
| **Hangar de diseño** | Fase antes del despegue: objetivo, lanzador, órbita, subsistemas; presupuesto, masa, volumen, energía y Δv. | `game/js/design/` |

## Flujo de una misión

1. **Selección:** el jugador elige la Luna y pulsa *Lanzar misión*.
2. **Hangar** (`hangar.js`): intercepta el botón de despegue. Calcula con `mission-design.js` sobre `catalog.json`. Si el diseño no cumple, no hay despegue y se lista qué falta. Al despegar guarda `Hangar.lastLaunch` y emite `hangar:launch`.
3. **Autorización** de Odyssey (preguntas) y **vuelo** (`flight-game.js`). `cockpit-link.js` envuelve `FlightGameEngine.startMission`: el combustible inicial sale del margen de Δv y la pantalla de cabina muestra energía, combustible, masa, Δv y presupuesto restante.
4. **Aterrizaje** (`landing-game.js`) y **superficie** (`surface-explorer.js`); rover y dron irán en `game/js/surface/`.
5. **Recolección y reporte:** leen recursos y peligros de `/api/planets/moon` (pendiente, paso d).

## Datos externos y respaldo

- El juego pide distancia e imágenes a la API (8787) y la Luna a `/api/planets/moon`.
- **Si la API no responde**, el juego debe seguir con una copia local de `moon.json` y mostrar un aviso en pantalla (paso d del hangar, pendiente).
- Ninguna llave llega al navegador: `GEMINI_API_KEY` y `NASA_API_KEY` viven en `.env` y solo las leen los servidores.

## Archivos clave

| Archivo | Para qué |
|---|---|
| `game/index.html` | Orden de carga de scripts (zona común, el que más choques da) |
| `game/js/core/main.js` | Orquestación de pantallas y flujo de misión |
| `game/js/flight/flight-game.js` | Motor de vuelo (`FlightGameEngine`) |
| `game/js/design/mission-design.js` | Reglas del diseño, sin DOM (probado en `game/tests/check-mission-design.cjs`) |
| `game/js/design/hangar.js` | Pantalla del hangar y bloqueo del despegue |
| `game/js/design/cockpit-link.js` | Valores del diseño en la cabina |
| `api/src/sources.js` | Clientes de NASA Images y Horizons |
| `api/src/planets.js` | Lectura y validación de `data/planets/` |
