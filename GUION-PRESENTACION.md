# Guion de presentación — Transmisiones en vivo D5

Guía para mostrar las funciones nuevas de `transmision.html` y `en-vivo.html` ante un público.
Duración sugerida: **8–12 minutos**. Está escrito para leerse en voz alta (lo que está entre
comillas) y las indicaciones técnicas van en bloques aparte.

---

## 0. Antes de empezar (checklist de 5 minutos)

Sin esto, la demo falla en vivo y no hay forma de arreglarlo frente al público.

1. **Abrir el sitio con `https://`** (o `http://127.0.0.1` en local). Con `file://` la cámara y la
   moderación no funcionan: el navegador bloquea los permisos.
2. **Permisos del navegador ya concedidos**: entra una vez a la sala y acepta cámara y micrófono.
   Si el navegador pregunta en plena presentación, se pierde el hilo.
3. **Cerrar pestañas y apps con cámara** (Meet, Zoom, Teams) — si no, la cámara sale en negro.
4. **Dos ventanas listas**: una con el rol de anfitrión y otra como invitado. Lo ideal es
   **dos pantallas o dos equipos**, porque así se ve el efecto real de "la otra persona recibe".
5. **Sala cerrada al inicio**: la portada debe mostrar **SIN TRANSMISIÓN ACTIVA**. Ese es el
   punto de partida del guion. Si quedó una sala abierta de una prueba, ciérrala con FINALIZAR.
6. **Respaldo**: si el internet falla, la **llave pública de demostración `MJD5-DEMO`** permite
   mostrar toda la interfaz sin servidor. Úsala como plan B y dilo con naturalidad.

---

## 1. Apertura: la portada (1–2 min)

**Pantalla:** `transmision.html`

> "Antes, para ver una transmisión había que pedir el link por WhatsApp y esperar a que alguien
> lo mandara. Ahora hay un solo lugar donde se ve **qué está en vivo en este momento** y qué no."

**Qué mostrar:**

- La insignia del hero: **SIN TRANSMISIÓN ACTIVA** cuando nadie transmite.
- Haz clic en **ENTRAR A LA MESA** de un campus inactivo → aparece el aviso
  *"Por el momento no estamos transmitiendo. Próxima: …"*.

> "Fíjense que no manda a una pantalla vacía: dice claramente que no estamos transmitiendo y
> cuándo es la próxima. Eso evita que la gente entre a un cuarto solo y se vaya."

**Y prueba el hero:** el botón grande está **deshabilitado** mientras no hay nada en vivo.
> "El botón se habilita solo cuando hay una transmisión real. La página nunca promete algo que
> no está pasando."

**La rejilla de campus:** siete mesas (Vigilia, Univalle, ICESI, USC, Javeriana, SENA, UAO).
Cada tarjeta muestra estado propio, número de personas conectadas y los avatares de quienes están
dentro. Se actualiza sola **cada 15 segundos**, sin recargar.

---

## 2. Abrir la sala como anfitrión (2 min)

**Pantalla:** la segunda ventana, `en-vivo.html`

1. Entra a la sala con **modo anfitrión** y escribe la **clave del campus**.
2. Se abre el **prejoin** ("Antes de entrar"): nombre visible + clave.
3. Al entrar, arriba aparece **EN VIVO** y abajo el rol: *"Conectado a LiveKit · rol host"*.

> "La sala no existe hasta que el anfitrión la abre. Si nadie la abrió, nadie puede entrar:
> así nunca hay un cuarto vacío con gente esperando."

**Vuelve a la primera ventana** y espera unos segundos (o recarga):
la portada ahora dice **EN VIVO AHORA**, la tarjeta del campus muestra cuántas personas hay
y el botón del hero **se habilita**.

> "La misma página que decía 'sin transmisión' ahora dice 'en vivo'. Eso es lo que ve la gente
> cuando entra desde Instagram o WhatsApp."

---

## 3. Entrar como invitado: los roles (2 min)

**Pantalla:** la ventana del invitado

1. Entra **desde la portada** (botón del hero) y escribe solo tu nombre: no pide clave.
2. Observa la diferencia: **no aparece el botón FINALIZAR** y **cámara y compartir pantalla están
   deshabilitados**.

> "El invitado entra sin clave, pero no puede publicar nada todavía. Puede ver, escuchar,
   escribir en el chat, reaccionar y **levantar la mano**. El micrófono se pide, no se toma.
> Eso es lo que hace que una vigilia con 80 personas no sea un caos de ruido."

**Muestra el intento bloqueado:** pulsa el micrófono como invitado.
Aparece el aviso de pedir la palabra / levantar la mano.

---

## 4. La mesa de trabajo del anfitrión (2–3 min)

**Pantalla:** la ventana del anfitrión. Aquí está la parte fuerte.

- **El auditorio:** 32 sillas. El invitado puede **escoger su asiento** y todos ven quién está
  dónde. Huele a "salón", no a lista de nombres.
- **Chat, preguntas y encuestas** en las pestañas de la derecha.
- **La fila de turnos:** quien levanta la mano aparece ahí.

**Moderación sobre el video de la persona** (pasa el mouse por encima del recuadro):
**Silenciar · Dar turno · Expulsar · Hacer moderador · Quitar moderador**.

### Momento clave: "Dar turno"

1. Pulsa **Dar turno** sobre el invitado.
2. En la ventana del invitado, el rol cambia a **speaker** y **se habilitan** cámara y micrófono.

> "El anfitrión le abre el micrófono a una persona con un clic. Y cuando termina, se lo quita
> igual de fácil."

### Momento clave: delegar moderación

1. Pulsa **Hacer moderador** sobre el invitado.
2. En la ventana del invitado aparecen los controles de moderación sobre los demás.

> "El anfitrión no tiene que estar pendiente de todo. Puede nombrar moderadores en vivo —
> y el permiso **caduca solo en una hora**."

**Aclara la jerarquía** (da confianza al que va a usar esto):

> "Nadie puede moderar al anfitrión. Un moderador solo modera asistentes. Y solo el anfitrión
> puede nombrar moderadores o cerrar la sala. Las reglas se aplican en el servidor, no solo
> en la pantalla: aunque alguien abra las herramientas del navegador, no puede saltárselas."

---

## 5. Los medios: cámara, micrófono y pantalla (2 min)

Este bloque es el que más impresiona. Se hace en la ventana que ya tiene turno.

1. **Cámara** → se enciende la vista previa inmediatamente.
2. **Micrófono** → el icono cambia y el indicador se pone verde.
3. **Compartir pantalla** → elige una ventana o la pantalla completa.

> "Cuando alguien comparte pantalla, **su video pasa al frente y grande**, y la barra de
> controles sigue ahí abajo: se puede seguir silenciando, dando turno o expulsando sin salir
> de la transmisión. Ese era justamente el problema de la versión anterior."

4. **Deja de compartir** con el botón rojo **DEJAR DE COMPARTIR** (o el mismo botón de pantalla).

> "Y se deja de compartir igual de fácil. Antes no había forma: había que salirse de la sala."

5. **Reacciones:** abre el menú de reacciones y manda **🙏 🔥 AMÉN**.
   Se ven **flotando sobre el escenario** en tu pantalla y en la del otro.

> "Las reacciones suben por la pantalla como en las transmisiones grandes. Y no son solo
> locales: la otra persona las ve igual."

---

## 6. Plan B: el modo demo (1 min)

Si no hay internet o el servidor no responde: en la portada, sección de la sala de prueba,
escribe la llave pública **`MJD5-DEMO`** y entra.

> "Esta es la llave de demostración. Abre la sala con participantes de ejemplo para mostrar
> la interfaz, **y la cámara, el micrófono y compartir pantalla funcionan de verdad** —
> son los de tu propio computador. Solo no hay otras personas conectadas del otro lado."

---

## 7. Cierre: terminar la sala (1 min)

**Pantalla:** ventana del anfitrión → **FINALIZAR**

> "Cuando termina la vigilia, el anfitrión la cierra. Todos vuelven a la página de
> transmisiones, la portada vuelve a decir **SIN TRANSMISIÓN ACTIVA** y la sala deja de existir.
> Nada queda abierto ni consumiendo recursos."

---

## Preguntas que probablemente te hagan

**¿Cuánto cuesta?**
> Hoy corre sobre el plan gratuito de LiveKit: **0 dólares al mes**, sin tarjeta. Alcanza para
> unos 5.000 minutos-persona al mes. Para que se hagan una idea: 50 personas una hora son
> 3.000 minutos. Si algún mes se llena, **no se cobra de más**: se bloquea hasta el reinicio.
> Cuando el uso crezca, se sube de plan y ya.

**¿Necesito instalar algo?**
> No. Se abre en el navegador, como una página web normal. Solo hay que aceptar el permiso de
> cámara y micrófono la primera vez.

**¿Se graba? / ¿queda guardado?**
> **No se graba.** No guardamos video ni audio. El nombre lo escribe cada persona y no se pide
> correo ni datos personales. Los nombres solo se ven mientras la persona está conectada.

**¿Y si alguien entra a molestar?**
> El anfitrión lo silencia o lo expulsa con un clic, y puede nombrar moderadores para que ayuden.

**¿Funciona en el celular?**
> Sí, la sala se adapta. Los controles quedan en una sola fila deslizable y el video se acomoda.

**¿Y si se cae el internet del que transmite?**
> Los demás vuelven solos a la página de transmisiones y pueden volver a entrar cuando el
> anfitrión reabra la sala.

---

## Errores típicos y qué decir si pasan

| Síntoma | Causa | Qué hacer en vivo |
| --- | --- | --- |
| No aparece imagen al encender cámara | Otra app la está usando, o se negó el permiso | Cerrar la otra app y recargar. Decirlo tranquilo: "el navegador pide permiso una vez". |
| El botón del hero sigue en "SIN TRANSMISIÓN" | La portada refresca cada 15 s | Esperar unos segundos o recargar la pestaña. |
| La clave del campus "no coincide" | Clave equivocada para esa sala | Cada campus tiene la suya. En la demo, usar `MJD5-DEMO`. |
| Aparece "no estamos transmitiendo" al entrar como invitado | La sala se vació | El anfitrión debe volver a abrirla. Es el comportamiento correcto. |
| En la demo no se ven otras personas | Es el modo demo | Aclarar: "es la interfaz de ejemplo; los medios son reales, pero no hay nadie más conectado". |

---

## Orden resumido (para tener a mano)

1. Portada → **SIN TRANSMISIÓN** + aviso con la próxima fecha.
2. Anfitrión abre la sala con su clave → portada pasa a **EN VIVO AHORA**.
3. Invitado entra sin clave → sin FINALIZAR, micrófono bloqueado, pide la palabra.
4. Anfitrión: **Dar turno** → el invitado ya puede hablar.
5. Anfitrión: **Hacer moderador** → el invitado modera.
6. Invitado: **cámara + micrófono**, luego **compartir pantalla** → la barra sigue disponible.
7. **Reacciones** flotantes en ambas pantallas.
8. Anfitrión: **FINALIZAR** → todo vuelve a **SIN TRANSMISIÓN**.
