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

    // ---------- Descargar tarjeta de la cita como imagen (estilo HERO de index.html) ----------
    // Replica: fondo foto hero-mj.jpg, overlay azul institucional, logo FULL.png, texto en mayúsculas, esquinas cuadradas.
    window.downloadVerseCard = function () {
        if (!current) return;

        var W = 1200, H = 675;
        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        // 1) Fondo azul institucional base (por si la foto no carga)
        ctx.fillStyle = '#006491';
        ctx.fillRect(0, 0, W, H);

        var bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = 'media/img/hero-mj.jpg';

        var logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = 'media/img/logos/FULL.png';

        var ready = 0, total = 2;
        function checkReady() {
            ready++;
            if (ready >= total) renderCard();
        }
        bgImg.onload = checkReady;
        bgImg.onerror = checkReady;
        logoImg.onload = checkReady;
        logoImg.onerror = checkReady;

        function renderCard() {
            // 2) Fondo foto con opacidad (estilo hero, object-fit: cover)
            if (bgImg.complete && bgImg.naturalWidth) {
                var scale = Math.max(W / bgImg.naturalWidth, H / bgImg.naturalHeight);
                var x = (W - bgImg.naturalWidth * scale) / 2;
                var y = (H - bgImg.naturalHeight * scale) / 2;
                ctx.globalAlpha = 0.50;
                ctx.drawImage(bgImg, x, y, bgImg.naturalWidth * scale, bgImg.naturalHeight * scale);
                ctx.globalAlpha = 1.0;
            }

            // 3) Overlay azul institucional igual al hero (from-primary-container/70 via-primary-container/75 to-primary-dark/85)
            var grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, 'rgba(68, 155, 209, 0.70)');   // primary-container
            grad.addColorStop(0.5, 'rgba(68, 155, 209, 0.75)');
            grad.addColorStop(1, 'rgba(2, 85, 125, 0.85)');    // primary-dark
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // 4) Logo FULL.png (esquina superior izquierda, estilo header del hero)
            if (logoImg.complete && logoImg.naturalWidth) {
                var logoW = 150, logoH = 150 * (logoImg.naturalHeight / logoImg.naturalWidth);
                ctx.drawImage(logoImg, 50, 40, logoW, logoH);
            }

            // 5) Badge superior: PROMESA DE HOY PARA TI (mayúsculas, estilo hero eyebrow)
            ctx.fillStyle = '#F58634';
            ctx.font = 'bold 20px Rubik, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('PROMESA DE HOY PARA TI', 50, 150);

            // Línea naranja debajo del badge
            ctx.strokeStyle = '#F58634';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(50, 165);
            ctx.lineTo(180, 165);
            ctx.stroke();

            // 6) Cita: blanco, mayúsculas, negrita, grande (estilo H1 hero)
            var citaMayus = current.text.toUpperCase();
            var refMayus = current.ref.toUpperCase();

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 4;
            ctx.font = 'bold 58px Rubik, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            var maxWidth = W - 160;
            var lines = wrapText(ctx, citaMayus, maxWidth);
            var lineHeight = 80;
            var startY = H / 2 - (lines.length * lineHeight) / 2 + 30;

            for (var i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], 50, startY + i * lineHeight);
            }

            // Quitar sombra
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // 7) Referencia en naranja secundario
            ctx.fillStyle = '#F58634';
            ctx.font = 'bold 30px Rubik, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(refMayus, 50, H - 110);

            // 8) Línea decorativa naranja
            ctx.strokeStyle = '#F58634';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(50, H - 80);
            ctx.lineTo(220, H - 80);
            ctx.stroke();

            // 9) Pie de página institucional
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 22px Rubik, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('MISIÓN JUVENIL D5', 50, H - 40);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = 'bold 16px Rubik, sans-serif';
            ctx.fillText('Promesa de Hoy · Distrito D5', 50, H - 15);

            // 10) Acento naranja en esquina inferior derecha (esquina cuadrada)
            ctx.fillStyle = '#F58634';
            ctx.fillRect(W - 100, H - 20, 100, 20);

            // --- Descargar ---
            var link = document.createElement('a');
            link.download = 'promesa-d5.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showDownloadToast();
        };
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

        // Acortar texto para evitar URLs demasiado largas (evita RESULT_CODE_KILLED_BAD_MESSAGE en Android)
        var shortText = text.length > 200 ? text.slice(0, 200).trim() + '…' : text;
        var pageUrl = window.location.href || '';

        // 1) Web Share API (móvil / navegadores modernos)
        if (navigator.share) {
            navigator.share({
                title: 'Misión Juvenil D5',
                text: shortText,
                url: pageUrl
            }).then(function () { doneShare('¡Compartido!'); })
              .catch(function (err) {
                  // Si falla (incluye Android killing el proceso), ir al fallback
                  shareFallback(shortText, pageUrl, doneShare);
              });
            return;
        }

        // 2) Escritorio o navegador sin Web Share: fallback directo
        shareFallback(shortText, pageUrl, doneShare);
    };

    function shareFallback(text, pageUrl, done) {
        // WhatsApp directo con URL corta y texto validado (máx ~2000 chars para evitar bad message)
        var waBody = text + ' — Misión Juvenil D5';
        if (pageUrl) waBody += ' ' + pageUrl;
        var waUrl = 'https://wa.me/?text=' + encodeURIComponent(waBody);

        if (/Android|iPhone|iPad|iPod/.test(navigator.userAgent)) {
            // En móvil: abrir WhatsApp en pestaña nueva
            try {
                window.open(waUrl, '_blank');
                done('Abriendo WhatsApp');
            } catch (e) {
                copyTextToClipboard(text, done);
            }
            return;
        }

        // Escritorio: copiar al portapapeles
        copyTextToClipboard(text, done);
    }

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
