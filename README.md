# Lunar CubeSat Mission

Juego educativo de diseño de misión lunar, hecho por **Team Rocket HN** para el NASA Space Apps Challenge 2026 (Tegucigalpa), reto *Space Mission Design Game*.

1. **Diseño:** elige estructura (6U o 12U), energía, comunicaciones, instrumento y propulsión. Debes cumplir con masa, volumen, presupuesto y Δv; si te pasas, no puedes lanzar.
2. **Misión:** en órbita lunar haces 3 pases sobre el polo sur administrando batería y bajada de datos. En el segundo pase llega una tormenta solar.
3. **Reporte:** ves tus puntos de ciencia y por qué salió así.

## Estructura

```
web/      Frontend Vite (estático, se publica en GitHub Pages)
api/      Backend Node en Docker: consulta NASA Images y JPL Horizons
docker-compose.yml   Levanta api + web juntos para desarrollo
```

| Carpeta | Qué hace |
|---|---|
| `web/src/modules/design/` | Fase de diseño y validación |
| `web/src/modules/mission/` | Simulación de los 3 pases y el evento |
| `web/src/modules/report/` | Reporte final |
| `web/src/modules/sources/` | Panel de fuentes |
| `web/src/state.js` | Estado compartido y cálculo de totales |
| `web/src/data/cubesat.json` | Catálogo de subsistemas y reglas de misión |
| `web/src/data/load.js` | Pide datos al backend o usa el caché |
| `web/src/data/cache/` | Respuestas cacheadas de las APIs (las usa el sitio público) |
| `api/src/sources.js` | Clientes de NASA Images y JPL Horizons |
| `api/src/server.js` | Endpoints HTTP |
| `api/scripts/write-cache.js` | Regenera `web/src/data/cache/` |

## Cómo correrlo

Con Docker (api + web):

```bash
docker compose up --build
```

- Juego: http://localhost:5299
- API: http://localhost:8787/health, `/api/images`, `/api/distance`

Si esos puertos están ocupados: `API_PORT=9000 WEB_PORT=5200 docker compose up`.

Solo el frontend, sin backend (usa el caché):

```bash
cd web && npm install && npm run dev
```

## Cómo fluyen los datos

- En desarrollo, `VITE_API_URL` apunta al backend y el juego pide los datos en vivo.
- El sitio publicado en GitHub Pages no tiene backend: usa el JSON cacheado en `web/src/data/cache/`. Si el backend falla, el juego también cae al caché.
- Antes de publicar, actualiza el caché: `cd api && npm run cache`, y haz commit de los JSON.

## Data Sources

No se usan llaves de API en ninguna parte. Cada respuesta guardada lleva `source_url` y `retrieved_at`.

- **JPL Horizons API** (https://ssd.jpl.nasa.gov/api/horizons.api): vector Luna (301) respecto al geocentro (500@399). Usamos la distancia (RG) y el tiempo de luz (LT) para el retardo de señal y el tiempo de viaje.
- **NASA Image and Video Library** (https://images-api.nasa.gov): imágenes de la Luna, el polo sur lunar y CubeSats. Se conserva el `nasa_id` y el enlace a cada imagen.
- **CubeSat 101** (NASA CubeSat Launch Initiative): referencia para tamaños y límites de masa por U. Los costos y potencias del catálogo son valores de balance de juego aproximados.

Este proyecto no está respaldado ni afiliado a NASA. No usa logos de NASA.

## Uso de IA

Parte del código y la documentación se generó con ayuda de Claude (Anthropic) y fue revisada por el equipo. Todo el trabajo se hizo durante el hackathon, a partir del sábado 14 de noviembre de 2026 a las 09:00.
