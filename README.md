# Misión Juvenil D5

Sitio web institucional y plataforma digital de Misión Juvenil, Distrito 5.

El proyecto reúne contenido espiritual, acompañamiento estudiantil, recursos de formación, información institucional y el podcast D5 Fuego en una experiencia web estática, clara y orientada a jóvenes de colegios, universidades e institutos.

## Propósito

Misión Juvenil trabaja para formar, equipar y movilizar jóvenes en contextos educativos. Esta plataforma extiende esa misión al entorno digital mediante contenido accesible, herramientas de participación y recursos descargables.

## Contenido de la plataforma

- Página principal con accesos al ecosistema digital, convocatorias y contenidos destacados.
- Podcast D5 Fuego con episodios, categorías, reproducción de audio, favoritos y descarga.
- Recursos devocionales, académicos, de liderazgo y multimedia.
- Calendario de actividades y encuentros.
- Información sobre el trabajo en colegios y universidades.
- Espacio de salud mental y acompañamiento emocional.
- Muro espiritual para compartir peticiones de oración.
- Preguntas frecuentes sobre identidad, participación, actividades y contacto.
- Información institucional, historia y líneas de trabajo de Misión Juvenil.

## Experiencia D5 (Chispa)

"Experiencia D5" es la capa de acompañamiento del sitio, cargada automáticamente en las páginas principales (`assets/js/experiencia-d5.js`):

- **Mascota Chispa**: personaje SVG animado en la esquina inferior derecha. Sus ojos siguen el cursor, reacciona al hover, salta, se alegra y se puede arrastrar (con la posición recordada en `localStorage`). En móvil se reposiciona sola para no tapar la barra inferior ni el reproductor sticky.
- **Menú de Chispa**: hacer el tour, hablar por WhatsApp, pedir un versículo, activar/desactivar el sonido y cerrar.
- **Tour de primera visita** en la portada (spotlight guiado de una sola vez) y **micro-tips** de una sola vez en páginas clave.
- **Sonidos procedurales** con Web Audio API (escala pentatónica, sin archivos de audio).
- **Versículos** servidos desde `assets/data/versiculos.json`, con respaldo embebido si el fetch falla.
- **Reacciones del sitio**: celebra cuando se registra una petición de oración y cuando se envía un formulario.

El **Muro de Fuego** (`assets/js/muro-fuego.js`, en `muro-espiritual.html`) dibuja en canvas 2D el muro de peticiones y se integra con el sonido y las reacciones de Chispa.

Las convenciones visuales de la marca (tipografía compacta, esquinas cuadradas, botones 3D, paleta institucional, header y footer comunes) están documentadas en `AGENTS.md`.

## Páginas principales

| Página | Archivo | Descripción |
| --- | --- | --- |
| Inicio | `index.html` | Presentación general, acceso al ecosistema y experiencia D5 |
| Calendario | `calendario.html` | Eventos y encuentros del distrito |
| Podcast | `podcast.html` | Episodios, filtros, reproductor de audio y podcast en video |
| Recursos | `recursos.html` | Biblioteca de materiales descargables |
| Quiénes somos | `quienes-somos.html` | Historia, misión y visión |
| Qué hacemos | `impacto.html` | Alcance y resultados del proyecto |
| Colegios | `colegios.html` | Trabajo y actividades en instituciones escolares |
| Universidades | `universidades.html` | Sedes, campus y presencia universitaria |
| Salud mental | `salud-mental.html` | Orientación y acompañamiento emocional |
| Muro espiritual | `muro-espiritual.html` | Peticiones de oración y Muro de Fuego |
| A un Click | `digital.html` | Acceso a contenidos y herramientas digitales |
| Preguntas frecuentes | `preguntas-frecuentes.html` | Respuestas a consultas comunes |
| Contacto | `contacto.html` | Canales de comunicación institucional |
| Lanzamiento | `lanzamiento.html` | Pantalla de cuenta regresiva previa al lanzamiento |
| No encontrado | `404.html` | Página de error con navegación de regreso |
| Fuego D5 IA | `fuego-d5.html` | Asistente conversacional (en pausa, ver Estado del proyecto) |

## Tecnologías

- HTML5: una página por archivo estático, con `tailwind.config` inline (no existe un `tailwind.config.js` compartido).
- Tailwind CSS mediante CDN para utilidades de interfaz.
- CSS modular e inline por página para animaciones y detalles de marca.
- JavaScript en el navegador para interacciones, filtros, animaciones, formularios y reproducción de audio/video.
- Web Audio API para los sonidos de la experiencia D5.
- Canvas 2D para el Muro de Fuego.
- Google Fonts y Material Symbols para tipografía e iconografía.
- Archivos multimedia locales (imágenes, audio, video y documentos).

## Estructura del proyecto

```text
.
├── index.html
├── calendario.html
├── podcast.html
├── recursos.html
├── quienes-somos.html
├── impacto.html
├── colegios.html
├── universidades.html
├── salud-mental.html
├── muro-espiritual.html
├── digital.html
├── preguntas-frecuentes.html
├── contacto.html
├── lanzamiento.html
├── 404.html
├── fuego-d5.html
├── assets/
│   ├── data/
│   │   └── versiculos.json
│   ├── css/
│   │   ├── mobile-nav.css
│   │   └── (hojas heredadas de secciones)
│   └── js/
│       ├── experiencia-d5.js
│       ├── muro-fuego.js
│       ├── podcast-player.js
│       ├── video-player.js
│       ├── daily-promise.js
│       ├── menu.js
│       ├── mobile-nav.js
│       ├── nav-active.js
│       ├── social-footer.js
│       ├── calendar.js
│       ├── launch-gate.js
│       ├── fuego-bubble.js
│       └── fuego-ia.js
├── media/
│   ├── audio/
│   ├── img/
│   ├── recursos/
│   └── video/
├── kb/
│   ├── kb.json
│   └── sitemap.json
├── tools/
│   ├── add-experiencia.ps1
│   ├── add-fuego-bubble.ps1
│   ├── add-botpress.ps1
│   ├── remove-botpress.ps1
│   ├── splice-header.ps1
│   ├── ingest-kb.mjs
│   └── push-kb.mjs
├── workers/
│   └── fuego-d5/
├── AGENTS.md
├── AUDITORIA_COMPLETA_MJD5.md
├── Mision juvenil documento.md
├── bajar-recursos.ps1
├── fix-lfs-audios.ps1
├── subir-r2.ps1
├── sitemap.xml
└── robots.txt
```

## Reproductor de podcast

El reproductor sticky se comparte entre `index.html` y `podcast.html` mediante `assets/js/podcast-player.js`. Queda pegado arriba del footer y permite seguir navegando mientras suena el episodio.

Incluye:

- Reproducción y pausa.
- Episodio actual y carátula.
- Barra de progreso y duración.
- Avance y retroceso de 15 segundos.
- Control de volumen y silencio.
- Favoritos y descarga del audio.
- Modo minimizado y reapertura del reproductor.
- Estado visual del episodio que está sonando.
- Layout móvil en tres filas (info, controles y progreso).

La sección **Podcast en video** usa `assets/js/video-player.js` (popup con MP4 locales o servidos desde R2). Ese reproductor de video sí conserva el control de velocidad (1x / 1.25x / 1.5x).

## Ejecución local

El proyecto no requiere un proceso de compilación. Para una revisión rápida, se puede abrir `index.html` directamente en el navegador.

Para probar correctamente audio, video, `fetch` y recursos del navegador, es recomendable utilizar un servidor HTTP local. Por ejemplo, desde la carpeta raíz:

```powershell
python -m http.server 8000
```

Después, abrir:

```text
http://localhost:8000/index.html
```

El uso de un servidor local evita restricciones del navegador que pueden afectar la carga o reproducción de archivos multimedia mediante `file:`.

## Recursos y mantenimiento

### Recursos descargables

`bajar-recursos.ps1` crea las carpetas necesarias dentro de `media/recursos` y descarga los materiales definidos en su lista de archivos.

Ejecutarlo desde PowerShell en la raíz del proyecto:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\bajar-recursos.ps1
```

### Audios administrados con Git LFS

Los archivos de audio pueden ser grandes. `fix-lfs-audios.ps1` está disponible para tareas relacionadas con la recuperación o revisión de audios administrados mediante Git LFS.

Antes de publicar cambios, comprobar que los archivos multimedia existan y que no sean punteros LFS sin descargar.

### Medios en Cloudflare R2

`subir-r2.ps1` sube la media pesada (mp3/mp4) a Cloudflare R2 y genera el mapa de URLs públicas. Requiere las variables de entorno `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY` y, opcionalmente, `R2_BUCKET`.

### Herramientas de inyección

- `tools/add-experiencia.ps1` inserta el widget Experiencia D5 en las páginas (idempotente).
- `tools/add-fuego-bubble.ps1` inserta la burbuja de Fuego D5 IA.
- `tools/add-botpress.ps1` y `tools/remove-botpress.ps1` administran el chat temporal de Botpress.
- `tools/splice-header.ps1` copia header, footer, topbar y estilos de una página a otra.

## Convenciones de contenido

- Mantener las rutas de imágenes, audios, videos y documentos relativas al proyecto.
- Usar nombres de archivo consistentes con la estructura existente en `media/`.
- Evitar enlaces vacíos o referencias a recursos que no estén disponibles.
- Conservar la navegación, el header y el footer comunes entre las páginas.
- Respetar las reglas de diseño de `AGENTS.md` (esquinas cuadradas, botones 3D, paleta institucional y tipografía compacta).
- Probar los controles interactivos después de modificar HTML o JavaScript.
- Revisar la visualización en escritorio y móvil.

## Estado del proyecto

Proyecto web estático en evolución. Las páginas, recursos y scripts se mantienen dentro del mismo repositorio para facilitar su despliegue, revisión y actualización.

La asistente **Fuego D5 IA** (`fuego-d5.html`, `assets/js/fuego-ia.js`, `workers/fuego-d5/` y `kb/`) está **en pausa** y se conserva archivada. La burbuja `assets/js/fuego-bubble.js` permanece desactivada, por lo que hoy el acompañamiento conversacional lo cubre exclusivamente Chispa. Reactivar la IA requiere desplegar el Worker en Cloudflare y configurar sus credenciales.

## Licencia y uso

El contenido, la identidad visual, las imágenes, los audios y los documentos pertenecen a sus respectivos propietarios. Antes de reutilizar o redistribuir cualquier material, solicitar la autorización correspondiente.

## Contacto

Para información institucional, participación o colaboración, utilizar la página [Contacto](contacto.html) del sitio.
