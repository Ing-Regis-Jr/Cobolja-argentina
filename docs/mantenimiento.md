# Mantenimiento

## Actualizar textos

Las páginas de investigación son HTML en `pages/`. Conviene dejar las fuentes al final de cada archivo.

Preguntas: `data/preguntas.js`  
Lugares del mapa: `data/lugares.js`  
Datos impactantes: `data/datos-impactantes.js`

No mezclar esos datos dentro de `trivia.js` o `map.js`.

## Ranking en Supabase

Crear una tabla y políticas de lectura/escritura anónima (sin clave secreta en el sitio):

```sql
create table ranking_argentina (
  id bigint generated always as identity primary key,
  nick text not null check (char_length(nick) between 2 and 16),
  score int not null check (score >= 0 and score <= 10),
  total int not null,
  created_at timestamptz default now()
);

alter table ranking_argentina enable row level security;

create policy "leer ranking" on ranking_argentina
  for select using (true);

create policy "enviar puntaje" on ranking_argentina
  for insert with check (
    char_length(nick) between 2 and 16
    and score >= 0
    and score <= 10
  );
```

En `js/config.js` usar solo la URL del proyecto y la clave `anon` (publicable). Nunca la clave `service_role`.

Si el ranking remoto falla, la trivia sigue funcionando y el puntaje queda en `localStorage`.

## Adaptar a otro país

1. Cambiar colores en `css/base.css`.
2. Reemplazar contenidos de `pages/` y `index.html`.
3. Regenerar `data/preguntas.js` y `data/lugares.js`.
4. Ajustar el centro del mapa en `js/map.js`.
5. Renombrar títulos COBOLJA / país / año.

## Imágenes

Guardar fotos en `assets/images/` con nombres claros y citar la fuente en la página. Comprimir antes de publicar.
