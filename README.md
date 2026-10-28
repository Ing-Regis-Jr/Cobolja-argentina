# Argentina 2026 · COBOLJA

Plataforma educativa estática sobre Argentina para la Feria Digital del Colegio Boliviano Japonés 3 (Mundial de Saberes Americanos 2026).

Sitio de varias páginas, con mapa Leaflet, trivia, desafío de datos y ranking por apodo. No usa cuentas ni servidor propio.

## Cómo abrir el proyecto

1. Abrí la carpeta en Visual Studio Code o Cursor.
2. En la terminal: `python -m http.server 5500`
3. Entrá a `http://localhost:5500`

También se puede abrir `index.html` haciendo doble clic. El mapa necesita internet (OpenStreetMap). Si el ranking remoto está configurado, también necesita internet.

## Estructura

- `index.html` — portada
- `pages/` — secciones, mapa, trivia y conclusión
- `css/` — estilos
- `js/` — navegación, trivia, mapa, ranking y desafío
- `data/` — textos de apoyo, preguntas, lugares y datos impactantes
- `docs/` — instalación, publicación y mantenimiento

## Ranking compartido

Por defecto el ranking se guarda en el navegador. Para compartirlo entre dispositivos:

1. Crear un proyecto en Supabase (si el colegio lo autoriza).
2. Seguir el SQL de `docs/mantenimiento.md`.
3. Completar `supabaseUrl` y `supabaseAnonKey` en `js/config.js` (solo la clave anónima, nunca la `service_role`).

## Publicación

Ver `docs/publicacion.md`. Nombre sugerido del sitio: `cobolja-mundial2026-argentina`. Si COBOLJA habilita el dominio institucional, la ruta objetivo es `www.cobolja.edu.bo/mundial2026/argentina`.

El pie de página muestra un código QR de la URL actual. Para el QR definitivo, poné la URL pública en `SITE_CONFIG.publicUrl` dentro de `js/config.js`.

## Reutilizar para otro país

Cambiar textos, imágenes, `data/preguntas.js`, `data/lugares.js`, `data/datos-impactantes.js` y los colores en `css/base.css`. No agregar varios países en esta versión.
