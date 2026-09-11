# Misión Juvenil D5

Sitio web institucional y plataforma digital de Misión Juvenil, Distrito 5.

El proyecto reúne contenido espiritual, acompañamiento estudiantil, recursos de formación, información institucional y el podcast D5 Fuego en una experiencia web estática, clara y orientada a jóvenes de colegios, universidades e institutos.

## Propósito

Misión Juvenil trabaja para formar, equipar y movilizar jóvenes en contextos educativos. Esta plataforma extiende esa misión al entorno digital mediante contenido accesible, herramientas de participación y recursos descargables.

## Contenido de la plataforma

- Página principal con accesos al ecosistema digital, convocatorias y contenidos destacados.
- Podcast D5 Fuego con episodios, categorías, reproducción de audio, favoritos, descarga y compartir.
- Recursos devocionales, académicos, de liderazgo y multimedia.
- Información sobre el trabajo en colegios y universidades.
- Espacio de salud mental y acompañamiento emocional.
- Muro espiritual para compartir peticiones de oración.
- Preguntas frecuentes sobre identidad, participación, actividades y contacto.
- Información institucional, historia y líneas de trabajo de Misión Juvenil.

## Páginas principales

| Página | Archivo | Descripción |
| --- | --- | --- |
| Inicio | `index.html` | Presentación general y acceso al ecosistema |
| Podcast | `podcast.html` | Episodios, filtros y reproductor de audio |
| Recursos | `recursos.html` | Biblioteca de materiales descargables |
| Quiénes somos | `quienes-somos.html` | Historia, misión y visión |
| Colegios | `colegios.html` | Trabajo y actividades en instituciones escolares |
| Universidades | `universidades.html` | Sedes, campus y presencia universitaria |
| Salud mental | `salud-mental.html` | Orientación y acompañamiento emocional |
| Muro espiritual | `muro-espiritual.html` | Peticiones y participación comunitaria |
| A un Click | `digital.html` | Acceso a contenidos y herramientas digitales |
| Impacto | `impacto.html` | Alcance y resultados del proyecto |
| Preguntas frecuentes | `preguntas-frecuentes.html` | Respuestas a consultas comunes |
| Contacto | `contacto.html` | Canales de comunicación institucional |

## Tecnologías

- HTML5 para la estructura de las páginas.
- CSS modular para estilos generales, componentes y secciones específicas.
- JavaScript en el navegador para interacciones, filtros, animaciones, formularios y reproducción de audio.
- Tailwind CSS mediante CDN para utilidades de interfaz.
- Google Fonts y Material Symbols para tipografía e iconografía.
- Archivos multimedia locales para imágenes, audio, video y documentos.

## Estructura del proyecto

```text
.
├── index.html
├── podcast.html
├── recursos.html
├── quienes-somos.html
├── colegios.html
├── universidades.html
├── salud-mental.html
├── muro-espiritual.html
├── digital.html
├── impacto.html
├── preguntas-frecuentes.html
├── contacto.html
├── assets/
│   ├── css/
│   │   ├── components.css
│   │   ├── main.css
│   │   ├── muro.css
│   │   ├── podcast.css
│   │   ├── recursos.css
│   │   └── sections.css
│   └── js/
│       ├── animations.js
│       ├── calendar.js
│       ├── core.js
│       ├── podcast.js
│       ├── recursos.js
│       └── data/
├── media/
│   ├── audio/
│   ├── img/
│   ├── recursos/
│   └── video/
├── bajar-recursos.ps1
├── fix-lfs-audios.ps1
└── Mision juvenil documento.md
```

## Reproductor de podcast

El reproductor principal se encuentra en `podcast.html` y funciona con los archivos de audio locales del proyecto.

Incluye:

- Reproducción y pausa.
- Episodio actual y carátula.
- Barra de progreso y duración.
- Avance y retroceso de 15 segundos.
- Velocidad de reproducción de 1.0x, 1.25x y 1.5x.
- Favoritos, descarga y compartir.
- Modo minimizado y reapertura del reproductor.
- Estado visual del episodio que está sonando.

La página de inicio cuenta con un reproductor integrado para reproducir el episodio destacado sin abandonar `index.html`.

## Ejecución local

El proyecto no requiere un proceso de compilación. Para una revisión rápida, se puede abrir `index.html` directamente en el navegador.

Para probar correctamente audio, navegación local y recursos del navegador, es recomendable utilizar un servidor HTTP local. Por ejemplo, desde la carpeta raíz:

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

## Convenciones de contenido

- Mantener las rutas de imágenes, audios, videos y documentos relativas al proyecto.
- Usar nombres de archivo consistentes con la estructura existente en `media/`.
- Evitar enlaces vacíos o referencias a recursos que no estén disponibles.
- Conservar la navegación común de encabezado y pie de página entre las páginas.
- Probar los controles interactivos después de modificar HTML o JavaScript.
- Revisar la visualización en escritorio y móvil.

## Estado del proyecto

Proyecto web estático en evolución. Las páginas, recursos y scripts se mantienen dentro del mismo repositorio para facilitar su despliegue, revisión y actualización.

## Licencia y uso

El contenido, la identidad visual, las imágenes, los audios y los documentos pertenecen a sus respectivos propietarios. Antes de reutilizar o redistribuir cualquier material, solicitar la autorización correspondiente.

## Contacto

Para información institucional, participación o colaboración, utilizar la página [Contacto](contacto.html) del sitio.
