/* Menú contextual propio de Conexión D5. Sólo se carga en transmision.html. */
(function () {
    'use strict';

    if (window.__transmisionContextMenuInit) return;
    window.__transmisionContextMenuInit = true;

    var MENU_ID = 'conexionD5ContextMenu';
    var KEEP_NATIVE = 'a,button,input,textarea,select,video,audio,[contenteditable=""],[contenteditable="true"],[role="textbox"]';
    var menu;

    function selectionExists() {
        try {
            var selection = window.getSelection();
            return !!(selection && String(selection).trim());
        } catch (error) { return false; }
    }

    function closeMenu() {
        if (!menu || menu.hidden) return;
        menu.hidden = true;
        menu.removeAttribute('data-open');
    }

    function openMenu(x, y) {
        menu.hidden = false;
        menu.setAttribute('data-open', 'true');
        var rect = menu.getBoundingClientRect();
        menu.style.left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)) + 'px';
        menu.style.top = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)) + 'px';
        var first = menu.querySelector('[role="menuitem"]');
        if (first) first.focus({ preventScroll: true });
    }

    function announce(message) {
        var live = document.getElementById('conexionD5ContextStatus');
        if (live) live.textContent = message;
    }

    function copyLink() {
        var done = function () { announce('Enlace de Conexión D5 copiado.'); };
        var fail = function () { announce('No se pudo copiar el enlace. Usa Compartir invitación en la página.'); };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(location.href).then(done, fail);
            return;
        }
        try {
            var field = document.createElement('textarea');
            field.value = location.href;
            field.setAttribute('readonly', '');
            field.style.cssText = 'position:fixed;left:-9999px;top:0';
            document.body.appendChild(field);
            field.select();
            var copied = document.execCommand('copy');
            field.remove();
            copied ? done() : fail();
        } catch (error) { fail(); }
    }

    function runAction(action) {
        var chispa = window.ChispaD5;
        if (action === 'tour') {
            closeMenu();
            if (chispa && chispa.tour) chispa.tour();
            else announce('Chispita todavía se está preparando. Intenta de nuevo en un momento.');
        } else if (action === 'verse') {
            closeMenu();
            if (chispa && chispa.verse) chispa.verse();
            else announce('Chispita todavía se está preparando. Intenta de nuevo en un momento.');
        } else if (action === 'chispa') {
            closeMenu();
            var trigger = document.getElementById('chispaTrigger');
            if (trigger) trigger.click();
        } else if (action === 'copy') {
            copyLink();
        } else {
            closeMenu();
            var target = document.querySelector(action);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (action === '#room-access') {
                    window.setTimeout(function () {
                        var nameField = document.getElementById('roomAccessName');
                        if (nameField) nameField.focus({ preventScroll: true });
                    }, 450);
                }
            }
        }
    }

    function buildMenu() {
        var style = document.createElement('style');
        style.id = 'conexionD5ContextMenuStyle';
        style.textContent =
            '#' + MENU_ID + '{position:fixed;z-index:100000;width:min(270px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;overscroll-behavior:contain;background:#1F2E3D;color:#fff;border:2px solid #449bd1;box-shadow:0 5px 0 #111d26;padding:5px;font-family:Rubik,sans-serif}' +
            '#' + MENU_ID + '[hidden]{display:none!important}' +
            '#' + MENU_ID + ' .ctx-heading{padding:8px 9px 7px;border-bottom:1px solid #ffffff26;color:#ffb36f;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}' +
            '#' + MENU_ID + ' [role="menuitem"]{display:flex;align-items:center;gap:9px;width:100%;min-height:39px;padding:8px 9px;border:0;background:transparent;color:#fff;text-align:left;font:900 11px Rubik,sans-serif;letter-spacing:.035em;text-transform:uppercase;cursor:pointer}' +
            '#' + MENU_ID + ' [role="menuitem"]:hover,#' + MENU_ID + ' [role="menuitem"]:focus-visible{outline:2px solid #F58634;outline-offset:-2px;background:#26323C}' +
            '#' + MENU_ID + ' [role="menuitem"] .material-symbols-outlined{font-size:19px;color:#F58634}' +
            '#' + MENU_ID + ' .ctx-divider{height:1px;margin:4px 3px;background:#ffffff26}' +
            '#' + MENU_ID + ' .ctx-foot{padding:7px 9px 4px;color:#ffffff80;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}' +
            '#conexionD5ContextStatus{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}' +
            '@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}';
        document.head.appendChild(style);

        menu = document.createElement('div');
        menu.id = MENU_ID;
        menu.hidden = true;
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Accesos rápidos de Conexión D5');
        menu.innerHTML =
            '<div class="ctx-heading">Conexión D5 · Accesos rápidos</div>' +
            '<button type="button" role="menuitem" data-action="#room-access"><span class="material-symbols-outlined" aria-hidden="true">video_call</span><span>Entrar o iniciar una sala</span></button>' +
            '<button type="button" role="menuitem" data-action="#mesas"><span class="material-symbols-outlined" aria-hidden="true">location_city</span><span>Ver salas por campus</span></button>' +
            '<button type="button" role="menuitem" data-action="#agenda"><span class="material-symbols-outlined" aria-hidden="true">event</span><span>Próximos encuentros</span></button>' +
            '<div class="ctx-divider" aria-hidden="true"></div>' +
            '<button type="button" role="menuitem" data-action="chispa"><span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span><span>Abrir a Chispita</span></button>' +
            '<button type="button" role="menuitem" data-action="tour"><span class="material-symbols-outlined" aria-hidden="true">explore</span><span>Hacer el recorrido</span></button>' +
            '<button type="button" role="menuitem" data-action="verse"><span class="material-symbols-outlined" aria-hidden="true">auto_stories</span><span>Recibir un versículo</span></button>' +
            '<div class="ctx-divider" aria-hidden="true"></div>' +
            '<button type="button" role="menuitem" data-action="copy"><span class="material-symbols-outlined" aria-hidden="true">content_copy</span><span>Copiar enlace de esta página</span></button>' +
            '<div class="ctx-foot">Clic derecho · Esc para cerrar</div>';
        document.body.appendChild(menu);

        var status = document.createElement('span');
        status.id = 'conexionD5ContextStatus';
        status.setAttribute('aria-live', 'polite');
        document.body.appendChild(status);
    }

    function init() {
        if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
        buildMenu();

        document.addEventListener('contextmenu', function (event) {
            if (event.shiftKey || selectionExists()) return;
            var target = event.target;
            if (!target || typeof target.closest !== 'function' || target.closest(KEEP_NATIVE + ',#' + MENU_ID + ',#chispaD5')) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            openMenu(event.clientX, event.clientY);
        }, true);

        menu.addEventListener('click', function (event) {
            var item = event.target.closest('[data-action]');
            if (!item) return;
            event.preventDefault();
            runAction(item.getAttribute('data-action'));
        });
        menu.addEventListener('keydown', function (event) {
            var items = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
            var index = items.indexOf(document.activeElement);
            if (event.key === 'Escape') { closeMenu(); return; }
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            var offset = event.key === 'ArrowDown' ? 1 : -1;
            items[(index + offset + items.length) % items.length].focus();
        });
        document.addEventListener('pointerdown', function (event) {
            if (menu && !menu.contains(event.target)) closeMenu();
        }, true);
        document.addEventListener('scroll', closeMenu, true);
        window.addEventListener('resize', closeMenu);
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
