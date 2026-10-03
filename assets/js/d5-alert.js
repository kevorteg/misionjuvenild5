/* =========================================================================
   d5-alert.js — Ventana de aviso con diseño de marca

   Reemplaza el alert() nativo (feo) por un modal cuadrado, con ícono,
   color e identidad de Misión Juvenil D5. Al sobreescribir window.alert,
   TODOS los avisos existentes quedan con diseño automáticamente.

   Uso: alert('mensaje')  ó  D5Alert('mensaje', {type:'success'})
        D5Alert.confirm('¿Seguro?', 'Sí', 'No').then(ok => ...)
   ========================================================================= */

(function () {
    'use strict';

    if (window.__d5Alert) return;
    window.__d5Alert = true;

    var STYLE_ID = 'd5-alert-style';
    var THEME = {
        success: { icon: 'check_circle', title: '¡LISTO!', btn: '¡AMÉN!', color: '#F58634', dark: '#C86018' },
        info: { icon: 'info', title: 'AVISO', btn: 'ENTENDIDO', color: '#006491', dark: '#02557d' },
        warning: { icon: 'error', title: 'UN MOMENTO', btn: 'OK', color: '#984800', dark: '#6d3300' },
        purple: { icon: 'volunteer_activism', title: 'RECIBIDO', btn: 'GRACIAS', color: '#473458', dark: '#31233E' }
    };

    function typeFor(msg) {
        var s = String(msg).toLowerCase();
        if (/gracias|listo|enviad|colocad|suscrib|correcto|éxito|exito|copiado|bienvenid|amén|amen|recibid|fortaleza/.test(s)) return 'success';
        if (/escribe|antes de|debes|por favor|completa|falt|selecciona|inválid|invalid|error|no se pudo|requerid/.test(s)) return 'warning';
        return 'info';
    }

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var st = document.createElement('style');
        st.id = STYLE_ID;
        st.textContent = [
            '.d5a-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(17,29,38,.55);backdrop-filter:blur(3px);opacity:0;transition:opacity .18s ease}',
            '.d5a-overlay.d5a-on{opacity:1}',
            '.d5a-card{width:100%;max-width:380px;background:#fff;border:3px solid #111d26;border-radius:0 !important;box-shadow:0 8px 0 rgba(0,0,0,.28);transform:translateY(12px) scale(.97);transition:transform .2s cubic-bezier(.2,.9,.3,1.2);overflow:hidden}',
            '.d5a-overlay.d5a-on .d5a-card{transform:none}',
            '.d5a-top{display:flex;align-items:center;gap:12px;padding:16px 18px;color:#fff}',
            '.d5a-ico{width:44px;height:44px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.18);border-radius:0 !important}',
            '.d5a-ico .material-symbols-outlined{font-size:28px;line-height:1}',
            '.d5a-title{font-family:"Rubik","Nunito Sans",sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.04em;font-size:15px;line-height:1.1}',
            '.d5a-sub{display:block;font-family:"Nunito Sans",sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.14em;font-size:9px;opacity:.85;margin-top:3px}',
            '.d5a-body{padding:18px}',
            '.d5a-msg{font-family:"Nunito Sans",sans-serif;font-weight:700;font-size:14px;line-height:1.5;color:#111d26;margin:0}',
            '.d5a-actions{padding:0 18px 18px}',
            '.d5a-btn{width:100%;border:0;cursor:pointer;padding:13px 16px;color:#fff;font-family:"Rubik","Nunito Sans",sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:13px;border-radius:0 !important;transition:transform .06s ease,box-shadow .06s ease}',
            '.d5a-btn:active{transform:translateY(4px)}',
            '.d5a-cancel{width:100%;margin-top:8px;cursor:pointer;padding:11px 16px;background:#fff;border:3px solid #111d26;color:#111d26;font-family:"Rubik","Nunito Sans",sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:12px;border-radius:0 !important}'
        ].join('');
        document.head.appendChild(st);
    }

    var el = null, lastFocus = null, onKey = null, resolveFn = null;

    function build() {
        ensureStyle();
        el = document.createElement('div');
        el.className = 'd5a-overlay';
        el.setAttribute('role', 'alertdialog');
        el.setAttribute('aria-modal', 'true');
        el.innerHTML =
            '<div class="d5a-card" role="document">' +
            '  <div class="d5a-top">' +
            '    <span class="d5a-ico"><span class="material-symbols-outlined" data-ico>check_circle</span></span>' +
            '    <span class="d5a-title"><span data-title>AVISO</span><span class="d5a-sub">Misión Juvenil D5</span></span>' +
            '  </div>' +
            '  <div class="d5a-body"><p class="d5a-msg" data-msg></p></div>' +
            '  <div class="d5a-actions">' +
            '    <button type="button" class="d5a-btn" data-ok></button>' +
            '    <button type="button" class="d5a-cancel" data-cancel hidden>Cancelar</button>' +
            '  </div>' +
            '</div>';
        document.body.appendChild(el);
        el.querySelector('[data-ok]').addEventListener('click', function () { close(true); });
        el.querySelector('[data-cancel]').addEventListener('click', function () { close(false); });
        el.addEventListener('click', function (e) { if (e.target === el) close(false); });
        onKey = function (e) { if (e.key === 'Escape') close(false); };
        document.addEventListener('keydown', onKey, true);
    }

    function close(result) {
        if (!el) return;
        var e = el;
        el = null;
        if (onKey) { document.removeEventListener('keydown', onKey, true); onKey = null; }
        e.classList.remove('d5a-on');
        setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 200);
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (x) {} lastFocus = null; }
        var r = resolveFn; resolveFn = null;
        if (r) r(result === true);
    }

    function open(message, opts) {
        opts = opts || {};
        var type = opts.type || typeFor(message);
        var t = THEME[type] || THEME.info;
        if (!el) build();
        lastFocus = document.activeElement;
        el.querySelector('[data-ico]').textContent = opts.icon || t.icon;
        el.querySelector('[data-title]').textContent = opts.title || t.title;
        el.querySelector('[data-msg]').textContent = String(message);
        var ok = el.querySelector('[data-ok]');
        ok.textContent = opts.ok || t.btn;
        var top = el.querySelector('.d5a-top');
        top.style.background = t.color;
        ok.style.background = t.color;
        ok.style.boxShadow = '0 4px 0 ' + t.dark;
        var cancel = el.querySelector('[data-cancel]');
        cancel.hidden = !opts.confirm;
        cancel.textContent = opts.cancel || 'Cancelar';
        el.classList.add('d5a-on');
        setTimeout(function () { try { ok.focus(); } catch (x) {} }, 60);
    }

    function D5Alert(message, opts) {
        // evita solaparse: cierra el anterior sin resolver confirmaciones pendientes
        if (el && resolveFn) { var r = resolveFn; resolveFn = null; r(false); }
        if (el) close(false);
        open(message, opts);
    }

    D5Alert.confirm = function (message, okText, cancelText) {
        return new Promise(function (resolve) {
            D5Alert(message, { type: 'purple', title: 'CONFIRMA', ok: okText || 'SÍ', cancel: cancelText || 'CANCELAR', confirm: true });
            resolveFn = resolve;
        });
    };

    window.D5Alert = D5Alert;
    window.alert = function (m) { D5Alert(m); };
})();
