# Instalación

## Requisitos

- Navegador actualizado (Chrome, Edge, Firefox o Safari)
- Editor de código (Visual Studio Code o Cursor)
- Python (opcional, para un servidor local) o la extensión Live Server
- Conexión a internet para el mapa (OpenStreetMap) y, si se usa, el ranking remoto

## Pasos

1. Copiar este repositorio o descomprimir el proyecto.
2. No hace falta `npm install`: es HTML, CSS y JavaScript.
3. Servir la carpeta raíz:

```bash
python -m http.server 5500
```

4. Abrir `http://localhost:5500`.

## Configuración opcional

Editar `js/config.js`:

- `SITE_CONFIG.publicUrl`: URL publicada (para el QR del pie).
- `RANKING_CONFIG.supabaseUrl` y `supabaseAnonKey`: ranking compartido.

## Git

```bash
git init
git add .
git commit -m "Sitio educativo Argentina 2026 COBOLJA"
```
