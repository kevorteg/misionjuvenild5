# LiveKit para Misión Juvenil D5

## Configuración

La aplicación usa las funciones de Vercel en `api/` para firmar credenciales, consultar salas y aplicar moderación. El navegador nunca recibe la API secret de LiveKit.

1. Crea un proyecto LiveKit Cloud Build (gratuito) y copia su WebSocket URL, API key y API secret.
2. En Vercel → Settings → Environment Variables, configura `LIVEKIT_URL`, `LIVEKIT_API_KEY` y `LIVEKIT_API_SECRET`.
3. Define `LIVEKIT_ADMIN_CODE` con una clave larga y privada para la administración global.
4. Define `LIVEKIT_ROOM_HOST_CODES` como un objeto JSON con una clave independiente por sala, siguiendo `.env.example`.
5. Opcionalmente, configura `LIVEKIT_ROOM_JOIN_CODES` con claves de acceso para asistentes, por ejemplo `{"MJ-D5-Vigilia":"clave-larga-de-ejemplo"}`, y cambia `LIVEKIT_REQUIRE_ROOM_JOIN_CODE=true`. Usa una clave larga por sala; el endpoint la valida en el servidor antes de emitir el token. Si se activa el requisito sin configurar la clave de una sala, esa sala queda cerrada para nuevos asistentes.
6. Vuelve a desplegar. Para probar las funciones localmente, usa `vercel dev`; abrir los HTML con `file://` o con un servidor estático no ejecuta las rutas `/api`.

Usa claves distintas a las de este ejemplo y no las pongas en archivos públicos, mensajes ni commits. El endpoint acepta solamente las salas incluidas en `lib/livekit.js`.

La agenda de `calendario.html` todavía es contenido publicado en el sitio. La reserva, edición y cancelación de reuniones requieren añadir almacenamiento persistente y una interfaz de coordinación; LiveKit administra salas activas, no guarda por sí solo un calendario de reuniones futuras.

## Roles de esta primera versión

| Rol | Acciones |
| --- | --- |
| Administrador | Iniciar cualquier sala, publicar audio/video/pantalla, asignar o quitar moderadores, moderar asistentes, terminar una sala. |
| Anfitrión de campus | Iniciar su sala, publicar audio/video/pantalla, dar turno, silenciar o expulsar asistentes y delegar/quitar moderadores. |
| Moderador delegado | Durante una reunión, dar turno, silenciar o expulsar asistentes. No puede delegar roles ni terminar la sala. El permiso de moderador dura una hora. |
| Expositor con turno | Publicar micrófono y cámara mientras conserva el turno; no puede moderar. |
| Asistente | Ver/escuchar, escribir en el chat, reaccionar y levantar la mano. No puede publicar audio/video hasta recibir turno. |

El panel de campus usa claves compartidas por sala para esta etapa de bajo costo. No son cuentas personales: no identifican a un encargado concreto y deben rotarse si se comparten fuera del equipo. Para cuentas nominativas, recuperación de acceso y auditoría se requiere añadir autenticación y almacenamiento de usuarios/roles.

## Costos y límites del plan gratuito

El plan Build de LiveKit Cloud cuesta USD 0 al mes, no exige tarjeta, pero su cuota de WebRTC se comparte entre todas las salas: 5.000 minutos-participante y 50 GB de transferencia saliente mensuales, además de un máximo de 100 participantes conectados simultáneamente en el proyecto. Al agotar una cuota del plan gratuito, las solicitudes se bloquean hasta el reinicio mensual; no se cobran excesos automáticamente. Ejemplos de consumo de minutos: 50 personas durante una hora consumen 3.000 minutos-participante; 100 personas durante una hora consumen 6.000.

La grabación no está conectada en esta versión. LiveKit Cloud incluye una pequeña cuota de egress en Build, pero no es grabación ilimitada ni una garantía de costo cero durante una actividad frecuente. El uso de OBS sería una integración aparte y necesitaría un flujo de salida seguro.

## Privacidad y despliegue

- El visitante elige el nombre visible antes de entrar; no se solicita correo ni identidad legal.
- La página de transmisiones muestra el total por campus y los nombres elegidos solo en el auditorio principal mientras las personas sigan conectadas.
- La sala se considera activa solo si LiveKit reporta participantes conectados. Si queda vacía, los visitantes no pueden volver a entrar; un anfitrión sí puede reabrirla.
- Las claves de anfitrión viven en variables de entorno. El token de moderador se entrega por mensaje de datos privado al participante elegido y expira en una hora.
- Se requiere HTTPS para cámara y micrófono en el sitio publicado.

