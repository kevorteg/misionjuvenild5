/* Promesa de Hoy — fuente ÚNICA: assets/data/versiculos.json
   Agrega o edita objetos allí y se reflejarán automáticamente.
   Si el fetch falla (p. ej. al abrir con file://), usa FALLBACK. */
(function () {
    'use strict';

    var FALLBACK = [
        { text: 'Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes en palabra, conducta, amor, espíritu, fe y pureza.', ref: '1 Timoteo 4:12' },
        { text: 'Acuérdate de tu Creador en los días de tu juventud...', ref: 'Eclesiastés 12:1' },
        { text: '¿Con qué limpiará el joven su camino? Con guardar tu palabra.', ref: 'Salmo 119:9' },
        { text: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará.', ref: 'Deuteronomio 31:6' },
        { text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.', ref: 'Jeremías 29:11' },
        { text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.', ref: 'Filipenses 4:6-7 (RVR1960)' }
    ];

    var current = null;

    function pick(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function render() {
        var textEl = document.getElementById('verse-text');
        var refEl  = document.getElementById('verse-ref');
        var box    = document.getElementById('verse-container');
        if (!textEl || !refEl || !current) return;
        textEl.textContent = '\u201c' + current.text + '\u201d';
        refEl.textContent  = '\u2014 ' + current.ref;
        if (box) box.style.opacity = '1';
    }

    function currentText() {
        if (!current) return '';
        return '\u201c' + current.text + '\u201d \u2014 ' + current.ref;
    }

    function fallbackCopy(text, done) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            if (done) done();
        } catch (e) { /* sin soporte */ }
    }

    window.copyVerse = function (btn) {
        var label = document.getElementById('copy-verse-text');
        if (!label && btn) label = btn.querySelector('[data-copy-label]');
        function done() {
            if (!label) return;
            var prev = label.textContent;
            label.textContent = '\u00a1Copiado!';
            setTimeout(function () { label.textContent = prev; }, 2500);
        }
        var text = currentText();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
        } else {
            fallbackCopy(text, done);
        }
    };

    window.shareVerse = function () {
        var text = currentText();
        if (navigator.share) {
            navigator.share({ title: 'Misión Juvenil D5', text: text, url: window.location.href }).catch(function () {});
        } else {
            window.copyVerse();
        }
    };

    window.getPromesaActual = function () {
        return current ? { text: current.text, ref: current.ref } : null;
    };

    function start(list) {
        current = pick(list);
        render();
    }

    function init() {
        if (!document.getElementById('verse-text')) return;
        fetch('assets/data/versiculos.json', { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function (data) {
                if (Array.isArray(data) && data.length) start(data);
                else start(FALLBACK);
            })
            .catch(function () { start(FALLBACK); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
