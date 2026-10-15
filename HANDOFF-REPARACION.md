# HANDOFF — Misión Juvenil D5 (reparación en otra PC)

> Este documento es el **punto de partida obligatorio** para el agente que trabaje en otra PC.
> Léelo completo antes de tocar un archivo. Regla 0: **no rompas nada que ya funciona.**

---

## 1. Estado del repositorio

| Campo | Valor |
|---|---|
| Repo | `https://github.com/kevorteg/misionjuvenild5.git` |
| Rama | `main` |
| Trabajo | árbol limpio, sincronizado con `origin/main` |
| Último commit relevante | `eae440a "update"` (chat de Chispa + `PROMPT_AGENTE_FUEGO_D5.md`) |
| Tamaño | ~273 archivos trackeados |

Commits recientes (no reescribir historia):

```
eae440a update
797b69c Blindar el config de Tailwind: dejar de tapar el error real
65e28e0 Chispa: micro-tours y ayuda de formularios, ambas declarativas
5bb9c70 Chispa: un solo sistema de sueño, más estado escuchando
46000a9 Chispa: menú contextual con clic derecho
```

**Nunca**: `push --force`, `commit --amend` sobre commits ya subidos, borrar tests que fallen,
o `git checkout` masivo sin revisar. Si algo falla, se arregla con un commit nuevo.

---

## 2. Entorno (cómo levantar el proyecto)

Servidor estático + Chrome con puerto de depuración. **Las pruebas CDP dependen de esto.**

```powershell
# 1. Servidor en el puerto 5500 (puerto principal)
Set-Location 'C:\Users\Home\Desktop\PROYECTOS\Misión juvenil web'
python -m http.server 5500 --bind 127.0.0.1

# 2. Servidor en el puerto 8899 (las suites viejas lo usan)
python -m http.server 8899 --bind 127.0.0.1

# 3. Chrome con depuración (perfil aislado para no tocar el Chrome del usuario)
chrome.exe --remote-debugging-port=9222 --user-data-dir=<perfil-temp> --no-first-run --no-default-browser-check about:blank
```

Verificación:

- `http://127.0.0.1:5500/index.html` → 200
- `http://localhost:8899/index.html` → 200
- `http://127.0.0.1:9222/json/version` → JSON de Chrome

Notas que ya costaron tiempo:

- Los procesos lanzados con `Start-Process -WindowStyle Hidden` **no sobreviven** entre llamadas
  en ciertos shells. Lanza servidor + Chrome + suites **en la misma sesión de shell**.
- Chrome ya abierto sin `--remote-debugging-port` ignora el flag: hay que usar perfil aislado
  (`--user-data-dir`) o cerrar el Chrome existente.
- Prerrequisito Node: `npm install ws` dentro de `tests/cdp/` (los tests hacen `require('ws')`
  / `import WebSocket from "ws"`).
- Versiones probadas: Chrome/154.0.8037.98, Node v24.13.0, Python 3.14 (`C:\Python314\python.exe`).

---

## 3. REGLAS DURAS (esto NO se toca / así se hace)

De `AGENTS.md` (obligatorias, el usuario las exige):

1. **Tipografía compacta.** H1 máx 42px, H2 máx 30px, párrafos `font-body font-bold text-sm`,
   labels `text-[10px]/text-[11px]/text-xs`. **Nunca** `text-5xl`, `text-display-hero`,
   `text-headline-lg`. El usuario rechazó los textos grandes.
2. **Esquinas cuadradas.** `*, *::before, *::after { border-radius: 0 !important; }` al final de
   cada `<style>`. El usuario ama esta regla experimental; no eliminarla ni diseñar asumiendo
   `rounded-*`.
3. **Colores de marca**: azul `#006491`, naranja `#F58634`, morado `#473458`,
   `secondary #984800`, `inverse-surface #26323C`. **Verdes reales de Duolingo prohibidos**
   (#58CC02, #46A302, teal, emerald).
4. **Botones 3D estilo Duolingo**: `.btn-3d` + (`-orange`, `-white`, `-green`, `-blue`,
   `-purple`), sombra inferior `0 4px 0 <dark>`, activo `translateY(4px)`.
5. **Header y Footer** se copian de `index.html`. Menú con dropdowns con fotos y CTA naranja
   "¡UNIRME AHORA!"; footer `bg-[#1F2E3D]`.
6. **Assets locales, nunca URLs externas.** Única excepción: el CDN de Tailwind ya existente.
   No dejar `https://lh3.googleusercontent.com/aida...` ni `href="#"` sueltos.
7. **Un HTML estático por página** con Tailwind CDN + bloque `tailwind.config` **inline** en
   la línea ~15. **No existe** `tailwind.config.js` compartido. No crear uno global.
8. **Reproductor pegado arriba del footer** (`position: sticky; bottom: 0` dentro de `<main>`).
   NO quitar `display: contents !important` de `.pj-controls` en móvil ni el `flex-wrap: wrap`.
9. **Prohibidos en el player**: `cyclePlaybackSpeed`/`1.0x` y `shareCurrentEpisode`/Compartir —
   los eliminó el usuario. **No reintroducirlos.** (`video-player.js` sí conserva velocidad: es
   otro componente.)
10. **Verificar balance de etiquetas** tras cada edición (`27/27`, etc.).

De esta sesión:

11. **No inventar tours ni contenido.** `startTour()` filtra pasos sin objetivo real. Si una
    página no declara `data-chispa-tour`, el tour **no se abre** (es mejor nada que mentir).
12. **`chispa-menu` con `max-height:min(62vh,340px);overflow-y:auto`** — con 8 ítems el menú
    se salía de la pantalla. No quitar.
13. **El chat no se ofrece en**: `salud-mental`, `lanzamiento`, `fuego-d5`
    (`CHAT_EXCLUIDAS` en `experiencia-d5.js` y `chispa-menu.js`). El botón "Pregúntale a
    Chispa" es el **primer** ítem del menú y lleva a `fuego-d5.html`.
14. **Sin libros ni dependencias nuevas** sin preguntar. El proyecto es HTML estático + CDN.

---

## 4. Pruebas CDP (regresión) — `tests/cdp/`

21 scripts que hablan por WebSocket a Chrome (`localhost:9222`), navegan y verifican.

```powershell
cd tests\cdp
npm install ws
node cdp-chat.mjs     # cada uno abre su propia pestaña/navega
```

Puertos: las suites usan `5500` (`cdp-chat`, `cdp-cerebro*`, `cdp-check`, `cdp-fix`,
`cdp-geom`, `cdp-legal`, `cdp-verify2`, `cdp-vida*`, `cdp-a11y`, `cdp-alert*`) y `8899`
(`cdp-ctx`, `cdp-help`, `cdp-geo`, `cdp-poses`, `cdp-cdn`, `cdp-sueno`). **Levanta ambos.**

### Línea base medida el 15/10/2026

| Suite | Resultado | Nota |
|---|---|---|
| `cdp-chat` | **48/48** | acceso al chat de Fuego D5 (acabado esta sesión) |
| `cdp-help` | **TODO OK** | tour declarativo; `contacto.html` con 2 pasos propios |
| `cdp-ctx` | **20/20** | menú contextual: orden ahora `chat,verso,tour,wa,copiar,sonido` |
| `cdp-poses` | **16/16** | |
| `cdp-cdn` | **TODO OK** | |
| `cdp-sueno` | **13/19** | ⚠️ ver §5 |
| `cdp-geo` | **8/12** | ⚠️ ver §5 |
| `cdp-alert`, `cdp-legal`, `cdp-cerebro`, `cdp-vida-9222` | pasan (sin errores JS) | |
| `cdp-check` | pasa | devuelve JSON de métricas |
| `cdp-a11y`, `cdp-floor`, `cdp-geom`, `cdp-vida` | **no corren**: conectan a otros puertos CDP (9223/9226/9227) | requieren varias instancias de Chrome; adaptar a un solo 9222 |

Criterio de éxito: **ninguna suite baja** respecto a la línea base. Si una falla, primero
diagnostica, nunca edites el test para "hacerlo verde" sin entender el cambio de comportamiento.

---

## 5. 🔴 El problema pendiente #1: `cdp-sueno` (13/19) y `cdp-geo` (8/12)

Estas dos suites **pasaban verdes** (19/19 y 12/12) antes de recrear el entorno. Bajaron justo
cuando Chrome se lanzó con **perfil aislado nuevo**. Diagnóstico **incompleto** (quedó a medias):

- En `cdp-sueno`, Chispa **nunca entra en `p-dormir`** (`dormir:false, zzz:"none"` en todo el
  rango). Fallan: "tras la calma se duerme", "la z sube", "al despertar da un saltito",
  "la 1a vez dice Ya desperte", "vuelve a dormirse", "al terminar el tour vuelve a poder dormirse".
- Probado y descartado: `#chispaD5` y `window.ChispaD5` existen; el tour abre (`tourOpen:false`
  cuando no toca); `sleepAt` está en closure (no es global) por lo que `__advance()` **solo
  altera `Date.now`, no los timers reales**; avanzar 300.000–600.000 ms no bastó en 30-40 s de
  espera; disparar `mousemove` tampoco.
- Lógica del sueño en `assets/js/chispa-vida.js`:
  - `frame()` rAF (línea 214) → rama `S.mode === 'idle'` (línea 232):
    `if (!sleepAt) sleepAt = Date.now() + rnd(90000, 120000)` (línea 252) y
    `else if (sleepAt && Date.now() > sleepAt) sleep()` (línea 245).
  - Se retrasa con `lastAct` (líneas 26/352/406) y se anula con `sleepAt = 0` en `activity()`.
  - `tourOpen()` (línea 50) bloquea el bucle en la línea 223.
  - La pose visual la aplica `ChispaD5.pose('dormir')` desde `experiencia-d5.js`.
- Sospechas sin confirmar: tamaño de ventana del perfil nuevo (rompería `cdp-geo`, que mide
  geometría), `prefers-reduced-motion`/`hardware` distinto, o que el reloj falso no avanza el
  `S.until` que usa `performance.now()` (¡ojo: el bucle usa `performance.now()`, **no** `Date.now`!
  `go(mode, ms)` → `S.until = performance.now() + ms` — el `__advance()` del test **no lo
  afecta**). **Investigar eso primero:** si el test solo falsea `Date.now` y la condición de
  inactividad depende de `Date.now` pero el salto de modo depende de `performance.now`, puede
  que `S.until` nunca se alcance congelado.

**No toques `chispa-vida.js` para "arreglar el test"** hasta confirmar si el fallo es del test
o del código. Si el código tiene un bug real, se corrige con commit propio y mensaje claro.

---

## 6. Fuego D5 IA — estado y bloqueadores verificados

Archivos:

- `workers/fuego-d5/src/index.js` — Cloudflare Worker (embeddings + LLM + crisis).
- `workers/fuego-d5/wrangler.toml` — `AI`, `VECTORIZE mjd5-kb`, `TOP_K=5`,
  `ALLOWED_ORIGINS` solo localhost.
- `assets/js/fuego-ia.js` — cliente: `workerUrl`, `RESPUESTAS_LOCALES` (14 reglas), fallback local.
- `fuego-d5.html` — la página del chat (ahora con Chispa).
- `PROMPT_AGENTE_FUEGO_D5.md` — alcance corregido y verificado (léelo).

### Bloqueadores reales (verificados en código, no adivinar)

1. **`workers/fuego-d5/kb/` NO existe** → el índice `mjd5-kb` está vacío → toda consulta al
   modelo responde "No tengo esa información". **Este es el bloqueador #1.**
2. **`assets/js/fuego-ia.js:5`** = `https://fuego-d5.D5-USUARIO.workers.dev` (placeholder
   literal). No hay `workers/fuego-d5/.dev.vars`. **Nunca se desplegó ni probó contra Cloudflare.**
3. **`src/index.js:42`** → `ORIGIN_FALLBACK = '*'` (CORS abierto si falta `ALLOWED_ORIGINS`).
4. **`src/index.js:77`** `askLLM`: intenta 70B → fallback 3B → `catch` (línea 248) → 500 →
   el frontend cae al motor local. O sea: hoy el usuario ve motor local casi siempre.
5. **Crisis**: `CRISIS` línea 30, chequeo **antes** del LLM (línea 203) → cuesta 0 neuronas.
   `CRISIS_REPLY` (líneas 37-40) solo enlaza a `salud-mental.html`: **faltan teléfono/canales.**

### Cuota Cloudflare Workers AI (free) — datos a 2026

- **10.000 neuronas/día**, reinicio **00:00 UTC = 19:00 hora de Colombia**. Al superarla,
  **la petición falla** (no degrada).
- Estimado por turno (~2.000 tokens in / ~200 out):
  - `llama-3.3-70b-instruct-fp8-fast`: ~94 neuronas → **~106 turnos/día**.
  - `llama-3.2-3b-instruct`: ~15 neuronas → **~650 turnos/día**.
  - Crisis determinista y motor local: **0**. Embeddings: despreciables si son cortos.
- Conclusión: **sin 3B por defecto + límites, el servicio público no aguanta un día.**

### Trabajo pendiente confirmado (en este orden)

1. **Worker**: 3B por defecto → 70B solo si hace falta (escalada), `ORIGIN_FALLBACK` deja de
   ser `'*'`, **límite por sesión**, **presupuesto diario** con degradación al motor local,
   **kill switch**, `workerUrl`/`ALLOWED_ORIGINS` con el dominio real.
2. **`CRISIS_REPLY`** con canales reales (WhatsApp `+57 313 715 439` / `contacto.html`,
   `salud-mental.html`, líder de grupo) y constante única de contacto. **Sin marcadores
   visibles tipo `[POR COMPLETAR]` en pantalla** — eso ya lo rechazó el usuario.
3. **`kb/` + ingesta** desde el contenido real de las páginas → subir al índice Vectorize.
   Sin esto, el chat no responde nada útil.
4. **Modo noche de Chispa** (9:00 p. m. – 5:00 a. m. cruzando medianoche, globos,
   `ChispaD5.noche()`).
5. **Frases de sueño (8)** y frases de despertar: **NO implementar hasta que el usuario
   confirme**. Tampoco el horario exacto si el usuario no lo da por escrito.
6. **Datos legales**: NIT, razón social, dirección, teléfono, política de privacidad
   siguen `[POR COMPLETAR]`. Preguntar al usuario; no inventar.

---

## 7. Ideas / backlog (no hacer sin permiso, pero aquí quedan)

**IA y coste**

- Caché en Cloudflare KV de preguntas ya respondidas → repetir una pregunta cuesta 0 neuronas.
- Contador visible de neuronas usadas (solo en consola/admin, nunca en la UI pública).
- Auto-degradación: al 80 % del presupuesto diario, forzar 3B; al 100 %, motor local con
  mensaje honesto de "modo de reserva".
- En ingesta del `kb/`, guardar embeds; al desplegar, solo indexar diffs.
- Sugerencias de preguntas en la UI tomadas de las entradas del `kb/`.

**Producto / Chispa**

- Oración guiada y "versículo del día" compartible desde el menú de Chispa.
- Modo noche con copa de calma y silencio de fondos.
- Buzón anónimo del podcast ya existe → cruzarlo con respuestas del modelo cuando haya `kb/`.
- Tour declarativo página por página (hoy solo `index.html` y `contacto.html` declaran
  `data-chispa-tour`; el resto del sitio no tiene tour — decidir si se completa).

**Calidad**

- CI que levante el servidor y corra `tests/cdp` en headless (o migrar las suites a Playwright,
  ya está en `devDependencies`) para no depender de Chrome manual.
- Suite de puerto 9223/9226/9227 (`cdp-a11y`, `cdp-floor`, `cdp-geom`, `cdp-vida`): unificar
  a un solo Chrome/puerto o documentar el arranque multi-instancia.

---

## 8. Mapa rápido de archivos

| Archivo | Qué es |
|---|---|
| `AGENTS.md` | reglas visuales obligatorias (§3) |
| `chispa-biblia.md` | identidad, límites, privacidad de Chispa |
| `Mision juvenil documento.md` | especificación de páginas (quienes-somos, salud-mental, contacto, FAQ) |
| `PROMPT_AGENTE_FUEGO_D5.md` | alcance corregido del chat IA |
| `assets/js/experiencia-d5.js` | Chispa: menú (8 ítems), tour, poses, estilos |
| `assets/js/chispa-vida.js` | Chispa: vida, sueño, baile, arrastre |
| `assets/js/chispa-cerebro.js` | respuestas/entradas por página (`ARRIVAL`) |
| `assets/js/chispa-menu.js` | menú contextual con clic derecho (6 acciones) |
| `assets/js/fuego-ia.js` | cliente del chat IA + motor local de respuestas |
| `workers/fuego-d5/` | Cloudflare Worker (embed, LLM, crisis) |
| `tests/cdp/` | 20 suites de regresión por Chrome DevTools Protocol |
| `media/audio/podcasts/*.mp3` | **NO están en git** (`.gitignore`, van a R2). Sin ellos, pruebas de audio fallan en una PC nueva |

---

## 9. Orden de trabajo sugerido para el otro PC

1. Levantar entorno (§2) y correr la línea base de `tests/cdp` (§4).
2. Diagnóstico de `cdp-sueno`/`cdp-geo` (§5) — probablemente el `performance.now()` vs `Date.now`.
3. Si todo está en verde, proceder al Worker (§6.1) y `kb/` (§6.3), que es lo que hace que el
   chat funcione de verdad.
4. Preguntar al usuario: frases de sueño, datos legales, dominio de producción.
5. Commit por fase, mensaje en español, **sin push sin necesidad de revisión**. Si el usuario
   lo pide, push a `main`.
