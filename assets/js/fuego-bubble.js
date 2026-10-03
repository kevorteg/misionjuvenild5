/* =========================================================================
   fuego-bubble.js — Burbuja flotante de Fuego D5 IA

   Se inyecta UNA vez por pagina. Aparece abajo a la derecha (arriba de la
   .mobile-bottom-nav en movil) y lleva a fuego-d5.html.

   Este archivo no depende del Worker: si la IA no esta desplegada todavia,
   la burbuja sigue funcionando como enlace a la pagina.
   ========================================================================= */

(function () {
    // Interruptor temporal: Botpress esta activo en el sitio, asi que la
    // burbuja propia queda apagada para no superponerse. Ponlo en true
    // cuando Fuego D5 IA reemplace a Botpress.
    const FUEGO_BUBBLE_ACTIVA = false;
    if (!FUEGO_BUBBLE_ACTIVA) return;

    if (window.__fuegoBubbleInit) return;
    window.__fuegoBubbleInit = true;

    // No duplicar si la pagina ya es la del chat.
    const actual = window.location.pathname.split('/').pop() || 'index.html';
    if (actual === 'fuego-d5.html') return;

    const link = document.createElement('a');
    link.href = 'fuego-d5.html';
    link.setAttribute('aria-label', 'Abrir Fuego D5 IA, el asistente de Misión Juvenil D5');
    link.title = 'Fuego D5 IA';
    link.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true">local_fire_department</span>' +
        '<span class="fuego-bubble-tag">Fuego D5 IA</span>';

    // Estilos del boton, inyectados una vez.
    if (!document.getElementById('fuegoBubbleStyle')) {
        const style = document.createElement('style');
        style.id = 'fuegoBubbleStyle';
        style.textContent = `
            #fuegoBurbuja {
                position: fixed;
                right: 1rem;
                bottom: 1rem;
                z-index: 50;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.6rem 0.75rem;
                background: #F58634;
                color: #ffffff;
                border: 2px solid #C86018;
                box-shadow: 0 5px 0 #C86018;
                font-family: Rubik, sans-serif;
                font-weight: 900;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                text-decoration: none;
                transition: transform 0.15s ease-in-out, background-color 0.15s ease-in-out;
            }
            #fuegoBurbuja:hover { background: #ff9344; transform: translateY(-2px); }
            #fuegoBurbuja:active { transform: translateY(5px); box-shadow: 0 0 0 #C86018; }
            #fuegoBurbuja .material-symbols-outlined { font-size: 22px; }
            #fuegoBurbuja .fuego-bubble-tag { display: none; }
            @media (min-width: 640px) {
                #fuegoBurbuja .fuego-bubble-tag { display: inline; }
            }
            /* En movil, por encima de la barra inferior de navegacion. */
            @media (max-width: 1279px) {
                #fuegoBurbuja { bottom: calc(5.25rem + env(safe-area-inset-bottom)); }
            }
            @media (prefers-reduced-motion: reduce) {
                #fuegoBurbuja { transition: none; }
                #fuegoBurbuja:hover, #fuegoBurbuja:active { transform: none; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(link);

    // En el reproductor de index.html/podcast.html la barra sticky ocupa el
    // ancho completo abajo: subida la burbuja para no taparla.
    const hayPlayer = Boolean(document.getElementById('playerSection'));
    if (hayPlayer) {
        link.style.bottom = 'calc(7.5rem + env(safe-area-inset-bottom))';
    }
})();