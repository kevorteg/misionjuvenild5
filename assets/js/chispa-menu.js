/* =========================================================================
   chispa-menu.js — Menú contextual de Chispa (clic derecho)

   Un clic derecho normal abre el menú del sistema. Este script lo sustituye
   por uno con las acciones de Chispa, porque es la forma más rápida de
   pedirle un versículo sin abrir su burbuja.

   Reglas de convivencia (importantes):
     · No se toca el menú nativo en enlaces, campos, audio/video ni texto
       seleccionado: ahí el menú del sistema es lo que la persona quiere.
     · No se activa en táctil: en móvil el clic derecho es el long-press y
       pelearse con él rompe la selección de texto y el zoom.
     · Todo lo que hace aquí también se puede hacer desde el menú de la
       burbuja de Chispa. Este es un atajo, nunca la única vía.

   No usa assets externos. No manda nada a ningún servidor.
   ========================================================================= */

(function () {
    'use strict';

    if (window.__chispaMenuInit) return;
    window.__chispaMenuInit = true;

    var WA = 'https://wa.me/573137159439?text=Hola%2C%20quiero%20unirme%20a%20Misi%C3%B3n%20Juvenil%20D5';

    // Lo que no debe interferirse nunca.
    var RESPETA = 'a, input, textarea, select, video, audio, [contenteditable=""], [contenteditable="true"]';

    var menu, abierto = false;

    function haySeleccion() {
        try {
            var s = window.getSelection();
            return !!(s && String(s).length > 0);
        } catch (e) {
            return false;
        }
    }

    function hayAlgoQueRespetar(e) {
        var t = e.target;
        // e.target no siempre es un Element: puede ser el documento.
        if (!t || typeof t.closest !== 'function') return false;
        return !!t.closest(RESPETA);
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function icono(nombre) {
        return '<span class="material-symbols-outlined" aria-hidden="true">' + nombre + '</span>';
    }

    // La llamita de Chispa, la misma forma que lleva en el sitio.
    var FLAMA = '<svg class="d5ctx-flama" viewBox="0 0 72 72" width="12" height="12" aria-hidden="true">'
        + '<path d="M36 6C29 18 12 27 12 43c0 13 10 22 24 22s24-9 24-22C60 27 43 18 36 6z" fill="#F58634" stroke="#C86018" stroke-width="4" stroke-linejoin="round"/></svg>';

    function pintar() {
        var C = window.ChispaD5;
        var sonido = C && C.soundOn ? C.soundOn() : true;
        menu.innerHTML =
            '<button type="button" data-accion="verso">' + icono('auto_stories') + '<span>Versículo del día</span></button>' +
            '<button type="button" data-accion="tour">' + icono('school') + '<span>Hacer el tour</span></button>' +
            '<a href="' + WA + '" target="_blank" rel="noopener" data-accion="wa">' + icono('chat') + '<span>Hablar por WhatsApp</span></a>' +
            '<button type="button" data-accion="copiar">' + icono('link') + '<span>Copiar el enlace</span></button>' +
            '<button type="button" data-accion="sonido">' + icono(sonido ? 'volume_up' : 'volume_off') +
                '<span>Sonido: ' + (sonido ? 'activado' : 'silenciado') + '</span></button>' +
            '<div class="d5ctx-pie">' + FLAMA + '<span>Hecho con fuego por el D5</span></div>';
    }

    function abrir(x, y) {
        pintar();
        menu.hidden = false;
        abierto = true;
        var w = menu.offsetWidth, h = menu.offsetHeight;
        var left = Math.min(x, window.innerWidth - w - 8);
        var top = Math.min(y, window.innerHeight - h - 8);
        menu.style.left = Math.max(8, left) + 'px';
        menu.style.top = Math.max(8, top) + 'px';
    }

    function cerrar() {
        if (!abierto || !menu) return;
        abierto = false;
        menu.hidden = true;
    }

    function copiarEnlace() {
        var url = location.href;
        var ok = function () { avisar('copiar', '¡Enlace copiado!'); };
        var mal = function () { avisar('copiar', 'No se pudo copiar'); };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(ok, mal);
            return;
        }
        // Respaldo para http:// y navegadores viejos.
        try {
            var ta = document.createElement('textarea');
            ta.value = url;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;left:-9999px;top:0';
            document.body.appendChild(ta);
            ta.select();
            var res = document.execCommand('copy');
            document.body.removeChild(ta);
            res ? ok() : mal();
        } catch (e) { mal(); }
    }

    // Confirmación efímera en el propio ítem: sin toast, sin ruido.
    function avisar(accion, texto) {
        var b = menu.querySelector('[data-accion="' + accion + '"]');
        if (!b) return;
        var lbl = b.querySelector('span');
        var antes = lbl.textContent;
        lbl.textContent = texto;
        clearTimeout(avisar._t);
        avisar._t = setTimeout(function () {
            if (abierto) pintar(); else lbl.textContent = antes;
        }, 1800);
    }

    function ejecutar(accion) {
        var C = window.ChispaD5;
        if (!C) return;
        if (accion === 'verso') C.verse();
        else if (accion === 'tour') C.tour();
        else if (accion === 'sonido') C.sound(!(C.soundOn && C.soundOn()));
        else if (accion === 'copiar') { copiarEnlace(); return; } // no cerrar: hay aviso
        cerrar();
    }

    function tourAbierto() {
        var t = document.getElementById('d5Tour');
        return !!(t && !t.hidden);
    }

    function init() {
        // Sin Chispa no hay menú: un ítem que no hace nada se siente roto.
        if (!window.ChispaD5 || !document.getElementById('chispaD5')) {
            var intentos = 0;
            var iv = setInterval(function () {
                if (window.ChispaD5 && document.getElementById('chispaD5')) {
                    clearInterval(iv);
                    init();
                } else if (++intentos > 24) { clearInterval(iv); }
            }, 150);
            return;
        }
        // Sólo ratón: en táctil el "menú contextual" es el long-press.
        if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

        var CSS =
            '#d5CtxMenu{position:fixed;z-index:100000;min-width:212px;background:#ffffff;'
            + 'border:2px solid #006491;box-shadow:0 5px 0 #02557d;padding:0;margin:0;'
            + "font-family:Rubik,sans-serif}"
            + '#d5CtxMenu[hidden]{display:none}'
            + '#d5CtxMenu button,#d5CtxMenu a{display:flex;align-items:center;gap:.55rem;width:100%;'
            + 'padding:.55rem .75rem;border:0;border-bottom:1px solid #E5E5E5;background:#ffffff;'
            + 'cursor:pointer;font-family:Rubik,sans-serif;font-weight:900;font-size:11px;'
            + 'text-transform:uppercase;letter-spacing:.05em;color:#111d26;text-align:left;text-decoration:none}'
            + '#d5CtxMenu button:hover,#d5CtxMenu a:hover{background:#F7F9FA;color:#006491}'
            + '#d5CtxMenu .material-symbols-outlined{font-size:17px;color:#006491}'
            + '.d5ctx-pie{display:flex;align-items:center;gap:.4rem;padding:.45rem .75rem;'
            + 'background:#F7F9FA;font-size:10px;font-weight:800;letter-spacing:.04em;'
            + 'text-transform:uppercase;color:#8A9299}'
            + '.d5ctx-flama{flex:none;display:block}';
        var st = document.createElement('style');
        st.id = 'd5CtxMenuStyle';
        st.textContent = CSS;
        document.head.appendChild(st);

        menu = document.createElement('div');
        menu.id = 'd5CtxMenu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Acciones de Chispa');
        menu.hidden = true;
        document.body.appendChild(menu);

        document.addEventListener('contextmenu', function (e) {
            if (e.shiftKey) return;                       // el usuario quiere el nativo
            if (tourAbierto()) return;                    // el tour manda
            if (haySeleccion()) return;                   // hay texto seleccionado
            if (hayAlgoQueRespetar(e)) return;             // enlaces, campos, audio
            var t = e.target;
            if (t && typeof t.closest === 'function' && t.closest('#chispaD5')) return;
            e.preventDefault();
            abrir(e.clientX, e.clientY);
        });

        menu.addEventListener('click', function (e) {
            var b = e.target.closest('[data-accion]');
            if (!b) return;
            e.preventDefault();
            e.stopPropagation();
            ejecutar(b.getAttribute('data-accion'));
        });

        // El clic que cierra va en captura, así que hay que exceptuar el propio menú:
// si no, "Copiar el enlace" cerraría antes de poder confirmar.
        document.addEventListener('click', function (e) {
            if (menu && menu.contains(e.target)) return;
            cerrar();
        }, true);
        document.addEventListener('scroll', cerrar, true);
        window.addEventListener('resize', cerrar);
        window.addEventListener('blur', cerrar);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();