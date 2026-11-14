# Contrato de datos por planeta

Un archivo JSON por cuerpo celeste (`moon.json`, `mars.json`, …). **Agregar un planeta = agregar un archivo.** La API los sirve todos en `GET /api/planets` y uno por uno en `GET /api/planets/<id>`.

| Rol | Qué hace con estos archivos |
|---|---|
| Datos y peligros | Los llena y mantiene. Cada número lleva `source_url` y `verified`. |
| Historia | Referencia los `missions` por id y usa `resources`/`hazards` en los textos. |
| Modelado y superficie | Usa `physical` (gravedad, temperatura) y `resources[].location` para la superficie. |
| Multijugador | Sincroniza por `id` de planeta y de recurso. |

## Formato (v1)

- `id`, `name`, `schema_version`, `updated_at`
- `physical.*`: `{ value, unit, note?, source_url, verified }`
- `resources[]`: `{ id, name, location, abundance{value,unit,note,source_url,verified}, use, extraction }`
- `hazards[]`: `{ id, name, value, unit, note?, source_url, verified, game_effect{ target, per_hour | multiplier, text } }`
- `missions[]`: ids de misiones definidas por Historia en `game/js/story/missions/`

Reglas:
1. Nunca un número sin `source_url`.
2. `verified: true` solo si alguien leyó la fuente y el valor coincide.
3. `game_effect` es balance de juego (no es dato real) y puede cambiar sin fuente.
4. No renombres ids existentes: los usan los demás roles.

El esquema formal está en `schema.json`; `cd api && npm run check-planets` valida todos los archivos.
