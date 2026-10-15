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

    // ---------- Copiar cita al portapapeles ----------
    window.copyVerse = function (event) {
        if (event) event.preventDefault();   // evita cualquier recarga / envío por defecto

        var label = document.getElementById('copy-verse-text');
        function done() {
            if (!label) return;
            var prev = label.textContent;
            label.textContent = '\u00a1Copiado!';
            setTimeout(function () { label.textContent = prev; }, 2500);
        }

        var text = currentText();
        if (!text) return;

        // Intentar copiar texto + imagen si existe un fondo/imagen asociada al versículo
        var imgEl = document.getElementById('verse-img') || document.querySelector('#verse-container img');
        var imgUrl = imgEl ? imgEl.src : null;

        if (imgUrl && window.ClipboardItem) {
            fetch(imgUrl)
                .then(function (res) { return res.blob(); })
                .then(function (blob) {
                    var item = new ClipboardItem({ 'text/plain': new Blob([text], { type: 'text/plain' }), 'image/png': blob });
                    return navigator.clipboard.write([item]);
                })
                .then(done)
                .catch(function () {
                    // Si falla la imagen, copiar solo texto
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
                    } else {
                        fallbackCopy(text, done);
                    }
                });
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
        } else {
            fallbackCopy(text, done);
        }
    };

    // ---------- Descargar tarjeta de la cita como imagen (canvas nativo) ----------
    window.downloadVerseCard = function () {
        if (!current) return;

        var W = 800, H = 450;
        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        // Fondo blanco institucional
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);

        // Borde inferior azul (como la marca)
        ctx.fillStyle = '#006491';
        ctx.fillRect(0, H - 8, W, 8);

        // Cita
        ctx.fillStyle = '#111d26';
        ctx.font = 'bold 34px Rubik, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var maxWidth = W - 120;
        var lines = wrapText(ctx, current.text, maxWidth);
        var lineHeight = 44;
        var startY = H / 2 - (lines.length * lineHeight) / 2 + 10;

        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], W / 2, startY + i * lineHeight);
        }

        // Referencia
        ctx.fillStyle = '#4E575F';
        ctx.font = 'bold 20px Rubik, sans-serif';
        ctx.fillText(current.ref, W / 2, H - 70);

        // Pie de página
        ctx.fillStyle = '#006491';
        ctx.font = 'bold 16px Rubik, sans-serif';
        ctx.fillText('Misión Juvenil D5 · Promesa de Hoy', W / 2, H - 25);

        var link = document.createElement('a');
        link.download = 'promesa-d5.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showDownloadToast();
    };

    function wrapText(ctx, text, maxWidth) {
        var words = text.split(' ');
        var lines = [];
        var currentLine = words[0];

        for (var i = 1; i < words.length; i++) {
            var test = currentLine + ' ' + words[i];
            var metrics = ctx.measureText(test);
            if (metrics.width > maxWidth && i > 1) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = test;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    var downloadToastTimer = null;
    function showDownloadToast(msg) {
        var label = document.getElementById('copy-verse-text');
        if (!label) return;
        var prev = label.textContent;
        label.textContent = msg || '¡Imagen descargada!';
        clearTimeout(downloadToastTimer);
        downloadToastTimer = setTimeout(function () { label.textContent = prev; }, 2500);
    }

    // ---------- Compartir promesa ----------
    window.shareVerse = function (event) {
        if (event) event.preventDefault();

        var text = currentText();
        if (!text) return;

        var label = document.getElementById('copy-verse-text');
        var prev = label ? label.textContent : '';
        function doneShare(msg) {
            if (!label) return;
            label.textContent = msg || '¡Compartido!';
            setTimeout(function () { label.textContent = prev; }, 2500);
        }

        // 1) Web Share API (móvil / navegadores modernos)
        if (navigator.share) {
            navigator.share({
                title: 'Misión Juvenil D5',
                text: text,
                url: window.location.href
            }).then(function () { doneShare('¡Compartido!'); })
              .catch(function () {
                  // Si el usuario cancela o falla, intentar copiar al portapapeles
                  copyTextToClipboard(text, doneShare);
              });
            return;
        }

        // 2) Fallback: WhatsApp directo (muy usado en Colombia)
        var waUrl = 'https://wa.me/?text=' + encodeURIComponent(text + ' — Misión Juvenil D5 ' + window.location.href);
        if (/Android|iPhone|iPad|iPod/.test(navigator.userAgent)) {
            // En móvil: abrir WhatsApp
            window.open(waUrl, '_blank');
            doneShare('Abriendo WhatsApp');
            return;
        }

        // 3) Escritorio: copiar al portapapeles
        copyTextToClipboard(text, doneShare);
    };

    function copyTextToClipboard(text, done) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                if (done) done('¡Enlace copiado!');
            }).catch(function () {
                fallbackCopy(text, function () { if (done) done('¡Copiado!'); });
            });
        } else {
            fallbackCopy(text, function () { if (done) done('¡Copiado!'); });
        }
    }

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
