# Publicación

Fecha límite del plan técnico: antes del 19 de noviembre de 2026.

## Opción A — Dominio del colegio

Si COBOLJA da acceso a tiempo:

`https://www.cobolja.edu.bo/mundial2026/argentina`

Subir todos los archivos de la raíz del proyecto (mantener `css`, `js`, `pages`, `data` y `assets`).

## Opción B — GitHub Pages

1. Crear un repositorio (puede ser privado durante el desarrollo).
2. Subir el código.
3. Settings → Pages → Deploy from branch `main` / carpeta `/` (root).
4. La URL quedará similar a `https://USUARIO.github.io/COBOLJA-ARGENTINA/`.

## Opción C — Netlify Drop

Arrastrar la carpeta del proyecto a [https://app.netlify.com/drop](https://app.netlify.com/drop). Sirve para tener un enlace el mismo día.

## Código QR

1. Publicar el sitio.
2. Pegar la URL en `js/config.js` → `SITE_CONFIG.publicUrl`.
3. Volver a publicar.
4. Probar el QR del pie desde un celular (red del colegio y datos móviles).

## Prueba mínima antes de entregar

- [ ] La portada abre en computadora y en celular.
- [ ] Todos los enlaces del menú funcionan.
- [ ] Trivia calcula el puntaje y permite repetir.
- [ ] El mapa muestra marcadores y popups.
- [ ] El desafío da vuelta las diez tarjetas.
- [ ] El QR abre el sitio correcto.
