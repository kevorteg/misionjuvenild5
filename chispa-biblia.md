# Biblia de Chispa

> Documento de identidad y comportamiento de la mascota de Misión Juvenil D5.
> **Regla de oro:** este archivo manda. Si el código contradice este documento,
> primero se arregla el código. Si el código y el documento se contradicen entre
> sí, se pregunta antes de cambiar cualquier cosa.

---

## 1. Quién es

Chispa es una llama pequeña, viva y atenta que vive en la esquina inferior
derecha del sitio. No es una asistente, no es un chatbot y **no es una
decoración**: es la forma que tiene la comunidad de sentirse acompañada.

No vende, no presiona, no pide conversión. Está porque quiere estar.

- **Edad percibida:** niña/adolescente, ETL, nunca adulta "corporativa".
- **Actitud:** cercana pero respetuosa. Como una hermana mayor que sabe dónde
  está todo, no como la atención al cliente de un banco.
- **Postura:** siempre a mano, nunca en el centro. Nunca tapa contenido, nunca
  interrumpe una lectura.
- **Voz:** cálida, breve, en español de Colombia. Nunca usa jerga técnica,
  nunca habla en mayúsculas sostenidas, nunca escribe "usted".

### Lo que nunca hace

- No lee ni analiza lo que la persona escribe en un campo de texto.
- No reporta, no agrega, no comparte datos con terceros. No tiene red.
- No escciona. No pide perdón por existir.
- No dice "¡Excelente pregunta!".
- No repite la misma frase seguida. Si se queda sin frases nuevas, **se calla**.

---

## 2. Reglas de privacidad y salud (líneas rojas)

Estas reglas no son preferencias; son límites duros. Ninguna función las salta.

1. **Cero lectura de contenido.** Chispa reacciona a *gestos* (hiciste clic,
   enviaste, ora la comunidad), nunca al *texto* escrito. `data-chispa-help`
   se dispara al **enfocar** un campo vacío, y jamás lee su contenido.
2. **Nada de salud mental.** Chispa no diagnostica, no da consejo terapéutico,
   no sugiere tratamientos, no promete resultados. Si una página trata salud
   mental (o si la persona escribe sobre eso), manda a un profesional. Chispa
   es una llama de compañía, no un profesional de la salud.
3. **Sin promesas.** Nunca "Dios te sanará", "esto cambiará tu vida",
   "deja de dudar". Dice "te acompaño", "aquí estoy", "no estás solo".
4. **Sin miedo ni culpa.** Nunca "si no te unes perderás…". La invitación es
   una puerta abierta, no una amenaza.
5. **Sin datos personales.** No pide nombre, teléfono ni correo para hablar con
   ella. El formulario y el WhatsApp existen aparte, en su propio ritmo.
6. **La llama es decorativa y simbólica.** Cuando la comunidad ora, la llama
   brilla. Es un gesto simbólico, **no es un contador** y no pretende ser uno.

---

## 3. Memoria: qué recuerda y qué no

| Regla | Implementación | Alcance |
|---|---|---|
| Un saludo por visita | `sessionStorage['mjd5-greet']` | Pestaña |
| Frase distinta por página | `page` → frase única | Por página |
| Un comentario del podcast | `sessionStorage['mjd5-cb-podplay']` | Solo el primer play |
| Un tour por vida | `localStorage['mjd5-tour-v1']` | Navegador |
| Aviso de despertar | `sessionStorage['mjd5-wakeSaid']` | Pestaña, una vez |

**"Una vez por visita" significa una vez por pestaña**, no una vez por día.
Cerrar la pestaña y volver a abrir es una visita nueva. Es intencional: si
Chispa no saludara nunca, parecería un error instalado.

---

## 4. Reglas de saturación (el límite más importante)

El peligro real de una mascota no es que sea silenciosa: es que sea ruidosa.
Cinco frases bien elegidas valen más que veinte.

- **Máximo 1 frase propia por gesto del usuario.** Nunca dos encadenadas.
- **Una pose puede ser totalmente silenciosa.** Regla dura: **el 90 % de las
  poses no llevan frase.** Chispa reacciona con el cuerpo, no con charla.
- **Nunca encadenar reacciones.** Si llegan dos eventos seguidos (tocar "Orar"
  tres veces rápido), el segundo se **ignora**, no se acumula.
- **En la combinación `d5:pray`:** primero `orar` (serena, sin salto), después
  un `celebrar` **discreto** (brillo lento, *sin brinco*).
- Cooldown de 8 s entre reacciones propias; 25 s entre frases espontáneas;
  máximo 2 por minuto. Ver `chispa-cerebro.js`.
- **Si está hablando, no interrumpe.** `ChispaD5.busy()` bloquea nuevas burbujas.
- Frase interrumpida → se traga. Nunca "perdón, continúa…".

---

## 5. Catálogo de poses

Cada pose es una clase en la capa `.chispa-pose`, que **no tiene animación
propia**: existe para que las poses compongan con la respiración (`.chispa-body`)
y el parpadeo (`.chispa-flicker`, `.chispa-eyes`) sin pelearse entre ellas.

| Pose | Clase | Cómo se ve | Frase | Uso |
|---|---|---|---|---|
| Saludar | `.p-saludar` | Giro de llama + chispazo | a veces | Llegada a la página |
| Orar | `.p-orar` | Ojos cerrados, brillo suave | sí, 1 | `d5:pray` (primera vez) |
| Dormir | `.p-dormir` | Ojos cerrados + "z" flotante | no | 90 a 120 s de inactividad |
| Señalar | `.p-senalar` | Se inclina hacia el destino | no | Durante el tour |
| Celebrar | `.p-celebrar` | Sonrisa + brillo lento | sí, 1 | Envío de formulario |
| Escuchar | `.p-escuchar` | Inmóvil, meciéndose leve | no | Podcast sonando |

**Invariantes de todas las poses:**

- Una pose **nunca** interrumpe una burbuja abierta.
- Una pose **nunca** usa `is-jump` (el brinco es para celebrar en grande, no para una pose).
- Con `prefers-reduced-motion`, una pose = **cambio de estado, sin animación**.
  Los ojos cerrados sí se muestran; el "z" flotante, no.
- Los ojos siguen al cursor siempre que la pose no los cierre.

---

## 6. Voz: frases que sí y frases que no

**Sí:** "Aquí estoy." · "¿Te sirve esto?" · "Tómate tu tiempo." ·
"Ya desperté." · "Eso fue bonito." · "No estás solo."

**No:** "¡Hola! Soy Chispa, tu guía del D5." (rollup) ·
"¡Excelente pregunta!" · "¿En qué puedo ayudarte hoy?" ·
"Haz clic aquí para empezar" · "Suscríbete" · "¡No te lo pierdas!"

### Límite de confianza (regla de la comunidad)

En una comunidad de fe, **la confianza vale más que un número bonito.**

- Los contadores escritos a mano en el HTML (`Orar (48)`, `Amén (112)`) son
  **engañosos**: parecen un contador real y no lo son.
  → **Pendiente antes del lanzamiento:** quitarlos, marcarlos como ejemplo,
  o volverlos reales.
- Las cifras del home se revisaron bajo el mismo criterio. Ninguna cifra
  decorativa se queda sin etiquetar.

---

## 7. Movimiento reducido

`prefers-reduced-motion: reduce` significa:

| Sí | No |
|---|---|
| Estados estáticos (ojos cerrados, boca) | Giros, rebotes, brillos animados |
| "z" fijo al lado de la cabeza | "z" flotando |
| Poses que cambian el rostro | Balanceo, parpadeo |

---

## 8. Guía de marca (para el arte en Photoshop)

**Lienzo:** `viewBox 0 0 72 72` · stroke `#C86018` 3.5px · `stroke-linejoin:round`
**Colores:** llama `#F58634` · núcleo `#FFC64D` · trazo `#3A2410` (cara)

- Geometría: llama de dos curvas (exterior `#F58634`, núcleo `#FFC64D`).
- Cara: 2 óvalos blancos con borde 1.1px, pupilas `#3A2410` r=2.3,
  brillos blancos r=0.85 arriba-izquierda de cada pupila.
- Boca: arco `M30.5 54c1.6 2.2 9.4 2.2 11 0`, trazo 2.8px, `linecap:round`.
- Chispa (spark): estrella de 4 puntas en `#FFC64D`, arriba a la derecha.
- **Todo en `<g>` por capa:** `.chispa-body` (respira), `.chispa-pose`
  (poses), `.chispa-flicker` (llama), `.chispa-face`, `.chispa-eyes`, `.chispa-spark`.

**Reglas del sistema visual (heredadas de `AGENTS.md`):**

- Esquinas cuadradas. Nunca `rounded`.
- Botones 3D: `.btn-3d` + variante (`.btn-3d-orange` etc.), sombra inferior `0 4px 0`.
- Textos compactos: H1 máx 42px, H2 máx 30px, cuerpo `text-sm font-bold`.
- **Nunca** verde Duolingo (`#58CC02`, `#46A302`). Los verdes reales no se usan.