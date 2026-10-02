# Misión Juvenil D5 — Reglas de Diseño (¡OBLIGATORIAS!)

Reglas de estilo para TODAS las páginas. Leer antes de crear/editar cualquier página.

## 1. Tipografía COMPACTA (el usuario rechazó tamaños grandes)
Escala única tomada de `index.html` — NO usar textos gigantes.
- H1 (hero): `text-[20px] sm:text-[32px] lg:text-[42px] font-headline font-black uppercase leading-[1.1]` (máx 42px).
- H2 (sección): `text-2xl sm:text-3xl font-headline font-black uppercase tracking-tight` (máx 30px).
- H3 (tarjeta): `text-base sm:text-lg font-headline font-black uppercase`.
- Texto de párrafo: `font-body font-bold text-sm` (máx text-base).
- Métricas/captions/labels: `text-[10px]`, `text-[11px]`, `text-xs` font-black uppercase tracking-widest.
- Botones: `text-xs sm:text-sm font-headline font-black uppercase tracking-wider`.
- Iconos Material Symbols: `text-2xl` máx en controles normales; `text-4xl` máx en el play del hero.
- NUNCA usar `text-5xl`, `text-display-hero`, `text-headline-lg`, etc.

## 2. Esquinas CUADRADAS (no redondeadas)
Regla experimental que el usuario AMA (no eliminar):
```css
*, *::before, *::after { border-radius: 0 !important; }
```
Añadir al final de cada `<style>`. No diseñar con `rounded-lg/xl/2xl` pensando que se ven.

## 3. Colores de marca (NO usar verde real)
- Azul: `primary #006491`, `primary-container #449bd1`, `primary-dark #02557d`.
- Naranja: `secondary-orange #F58634` (= `duo-yellow`), `secondary-dark #C86018`.
- Morado institucional: `duo-green #473458` (= `duo-purple`), `duo-green-dark #31233E`.
- `secondary #984800`, `secondary-container #FF8E3B`, `inverse-surface #26323C`.
- Verdes de Duolingo reales (#58CC02, #46A302, teal, emerald) NO se usan.

## 4. Botones táctiles 3D (Duolingo-style)
Usar `.btn-3d` + variante: `.btn-3d-orange` (primario), `.btn-3d-white` (secundario),
`.btn-3d-green` (morado institucional), `.btn-3d-blue`, `.btn-3d-purple`.
Sombra inferior `0 4px 0 <dark>`, activo: `translateY(4px)` + sombra 0.

## 5. Header y Footer COMUNES
Copiar SIEMPRE el `<header>` y `<footer>` de `index.html`:
- Header blanco sticky, logo `media/img/logos/FULL.png`, menú con dropdowns con fotos
  (A un Click: podcast/recursos/muro-espiritual; Servicios: salud-mental/colegios/universidades),
  CTA naranja "¡UNIRME AHORA!", menú móvil.
- Footer oscuro `bg-[#1F2E3D]` con FULL.png, columnas Ecosistema / Campus / Boletín.

## 6. Contenido y estructura por página
- Podcast (podcast.html): hero PODCAST D5 FUEGO (badges + botones de streaming + tarjeta
  Ep. 08 con REPRODUCIR AHORA), filtros por temática, grilla de episodios (tarjetas táctiles 3D
  con like + descarga), Cargar más, Buzón anónimo, **sección PODCAST EN VIDEO**
  (thumbnail con play → YouTube), reproductor **sticky pegado ARRIBA del footer**
  (NO flotante que tape el footer).
- Quiénes Somos / Salud Mental / Contacto / FAQ: ver `Mision juvenil documento.md`.

## 7. Assets locales (nunca URLs externas)
- Carátulas: `media/audio/podcasts/minuatura ep 8.jpg`, `media/img/podcasts/*`.
- Audios: `media/audio/podcasts/podcast-ep{N}.mp3` (existen 1,2,3,5,6,8).
- No dejar `https://lh3.googleusercontent.com/aida...` ni `href="#"` sueltos.

## 8. Animaciones
- `.reveal` → `.reveal-visible` con IntersectionObserver (script estándar).
- Episodio reproduciéndose: `.ep-card.playing` con borde naranja.

## 9. Reproductor de podcast (compartido home + podcast.html)
- Debe quedar `position: sticky; bottom: 0` DENTRO de `<main>`, justo encima del footer
  (el usuario lo pidió explícitamente: "el reproductor arriba del footer").
- HTML: la barra usa clases `.pj-body`, `.pj-info`, `.pj-controls`, `.pj-progress`,
  `.pj-actions`. En móvil el bloque de controles usa `display: contents !important`
  para que todos los botones caigan en UNA sola línea (fila 2) entre info (fila 1)
  y barra (fila 3). NO quitar ese `!important` ni el `flex-wrap: wrap`.
- Volumen: botón `#playerVolumeBtn` + slider `#playerVolume` (`togglePlayerMute`).
- Funciones estándar: `playEpisode`, `togglePlayState`, `seekRelative(±15)`,
  `handleScrubClick`, `togglePlayerMute`, `togglePlayerLike`, `toggleCardLike`,
  `downloadAsset`, `minimizePlayer`, `openPlayer`, `filterCategory`, `submitQuestion`,
  `loadMoreEpisodes`.
- ELIMINADOS por decisión del usuario: `cyclePlaybackSpeed` / `1.0x` y
  `shareCurrentEpisode` / botón Compartir. NO reintroducirlos.
- `video-player.js` SÍ conserva velocidad (es el reproductor de MP4, otro control).
- Tiempos: los `#current-time-m` / `#duration-m` son móvil (`xl:hidden`) y
  `#current-time` / `#duration` son desktop (`hidden xl:inline`). Ambos se escriben
  desde `setTimes()` vía la clase `.js-time`.

## 10. Convenciones de archivo
- Una página por archivo HTML estático con Tailwind CDN + `tailwind.config` inline
  (mismo bloque de tokens de colores en todas las páginas).
- NO existe un `tailwind.config.js` compartido: cada página lleva el suyo inline
  en la línea ~15. No crear un archivo global de tokens.
- Verificar balance de etiquetas tras editar con PowerShell.