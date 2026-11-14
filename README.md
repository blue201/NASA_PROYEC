# Lunar CubeSat Mission

Juego educativo de diseño de misión lunar, hecho por **Team Rocket HN** para el NASA Space Apps Challenge 2026 (Tegucigalpa), reto *Space Mission Design Game*.

1. **Diseño:** elige estructura (6U o 12U), energía, comunicaciones, instrumento y propulsión. Debes cumplir con masa, volumen, presupuesto y Δv; si te pasas, no puedes lanzar.
2. **Misión:** en órbita lunar haces 3 pases sobre el polo sur administrando batería y bajada de datos. En el segundo pase llega una tormenta solar.
3. **Reporte:** ves tus puntos de ciencia y por qué salió así.

## Cómo correrlo

```bash
npm install
npm run dev
```

`npm run build` genera `dist/`. Al hacer push a `main`, el workflow `.github/workflows/pages.yml` lo publica en GitHub Pages.

## Estructura (un módulo por persona)

| Carpeta | Qué hace |
|---|---|
| `src/modules/design/` | Fase de diseño y validación |
| `src/modules/mission/` | Simulación de los 3 pases y el evento |
| `src/modules/report/` | Reporte final |
| `src/modules/sources/` | Panel de fuentes |
| `src/state.js` | Estado compartido y cálculo de totales |
| `src/data/cubesat.json` | Catálogo de subsistemas y reglas de misión |
| `src/data/cache/` | Respuestas cacheadas de las APIs |
| `scripts/fetch-data.mjs` | Regenera el caché (`npm run fetch-data`) |

## Data Sources

El juego **no llama a ninguna API en vivo** ni usa llaves. Los datos se descargan con `npm run fetch-data` y se guardan como JSON en `src/data/cache/` con `source_url` y `retrieved_at`.

- **JPL Horizons API** (https://ssd.jpl.nasa.gov/api/horizons.api): vector Luna (301) respecto al geocentro (500@399). Usamos la distancia (RG) y el tiempo de luz (LT) para el retardo de señal y el tiempo de viaje.
- **NASA Image and Video Library** (https://images-api.nasa.gov): imágenes de la Luna, el polo sur lunar y CubeSats. Se conserva el `nasa_id` y el enlace a cada imagen.
- **CubeSat 101** (NASA CubeSat Launch Initiative): referencia para tamaños y límites de masa por U. Los costos y potencias del catálogo son valores de balance de juego aproximados.

Este proyecto no está respaldado ni afiliado a NASA. No usa logos de NASA.

## Uso de IA

Parte del código y la documentación se generó con ayuda de Claude (Anthropic) y fue revisada por el equipo. Todo el trabajo se hizo durante el hackathon, a partir del sábado 14 de noviembre de 2026 a las 09:00.
