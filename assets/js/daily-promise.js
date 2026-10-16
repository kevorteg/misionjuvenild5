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

    // ---------- Dibuja Chispa (mascota llama) estilo marca D5 ----------
    function drawChispa(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 72, size / 72);

        // Cuerpo exterior (llama naranja)
        ctx.fillStyle = '#F58634';
        ctx.beginPath();
        ctx.moveTo(36, 8);
        ctx.bezierCurveTo(52, 20, 64, 40, 64, 60);
        ctx.bezierCurveTo(64, 70, 56, 72, 44, 72);
        ctx.bezierCurveTo(28, 72, 20, 70, 20, 60);
        ctx.bezierCurveTo(20, 40, 32, 20, 36, 8);
        ctx.closePath();
        ctx.fill();

        // Núcleo interno (más claro)
        ctx.fillStyle = '#FFC64D';
        ctx.beginPath();
        ctx.moveTo(36, 20);
        ctx.bezierCurveTo(46, 30, 50, 44, 50, 56);
        ctx.bezierCurveTo(50, 62, 42, 64, 36, 64);
        ctx.bezierCurveTo(30, 64, 22, 62, 22, 56);
        ctx.bezierCurveTo(22, 44, 26, 30, 36, 20);
        ctx.closePath();
        ctx.fill();

        // Cara: óvalos blancos (ojos)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(28, 44, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(44, 44, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas
        ctx.fillStyle = '#3A2410';
        ctx.beginPath();
        ctx.arc(28, 44, 2, 0, Math.PI * 2);
        ctx.arc(44, 44, 2, 0, Math.PI * 2);
        ctx.fill();

        // Brillo en ojos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(29, 43, 1, 0, Math.PI * 2);
        ctx.arc(45, 43, 1, 0, Math.PI * 2);
        ctx.fill();

        // Boca
        ctx.strokeStyle = '#3A2410';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(30.5, 54);
        ctx.bezierCurveTo(32.1, 56.2, 39.9, 56.2, 41.5, 54);
        ctx.stroke();

        // Chispa (estrella de 4 puntas) arriba derecha
        ctx.fillStyle = '#FFC64D';
        ctx.beginPath();
        ctx.moveTo(54, 14);
        ctx.lineTo(58, 14);
        ctx.lineTo(60, 16);
        ctx.lineTo(60, 20);
        ctx.lineTo(58, 20);
        ctx.lineTo(58, 22);
        ctx.lineTo(56, 22);
        ctx.lineTo(56, 20);
        ctx.lineTo(54, 20);
        ctx.lineTo(54, 18);
        ctx.lineTo(52, 18);
        ctx.lineTo(52, 16);
        ctx.lineTo(54, 16);
        ctx.lineTo(54, 14);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // ---------- Descargar tarjeta de la cita como imagen (canvas nativo, diseño creativo con foto y Chispa) ----------
    window.downloadVerseCard = function () {
        if (!current) return;

        var W = 1080, H = 1080;
        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        // --- Fondo: foto con opacidad ---
        ctx.fillStyle = '#006491';
        ctx.fillRect(0, 0, W, H);

        var bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = 'media/img/hero-mj.jpg';

        bgImg.onload = function () {
            // Dibujar foto con opacidad
            ctx.globalAlpha = 0.45;
            ctx.drawImage(bgImg, 0, 0, W, H);
            ctx.globalAlpha = 1.0;

            // Overlay azul institucional para legibilidad
            var grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, 'rgba(0, 100, 145, 0.75)');
            grad.addColorStop(0.5, 'rgba(2, 85, 125, 0.85)');
            grad.addColorStop(1, 'rgba(68, 155, 209, 0.75)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // --- Acento naranja en esquina superior izquierda (esquina cuadrada) ---
            ctx.fillStyle = '#F58634';
            ctx.fillRect(0, 0, 140, 22);
            ctx.fillRect(0, H - 22, 220, 22);

            // --- Chispa (mascota) en esquina superior derecha ---
            drawChispa(ctx, W - 140, 120, 110);

            // --- Cita: blanco con sombra para legibilidad ---
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = 14;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 4;
            ctx.font = 'bold 56px Rubik, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            var maxWidth = W - 200;
            var lines = wrapText(ctx, current.text, maxWidth);
            var lineHeight = 74;
            var startY = H / 2 - (lines.length * lineHeight) / 2 + 25;

            for (var i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], W / 2, startY + i * lineHeight);
            }

            // Quitar sombra
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // --- Referencia en naranja secundario ---
            ctx.fillStyle = '#F58634';
            ctx.font = 'bold 36px Rubik, sans-serif';
            ctx.fillText(current.ref, W / 2, H - 210);

            // --- Línea decorativa naranja ---
            ctx.strokeStyle = '#F58634';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 130, H - 150);
            ctx.lineTo(W / 2 + 130, H - 150);
            ctx.stroke();

            // --- Pie de página institucional ---
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 28px Rubik, sans-serif';
            ctx.fillText('MISIÓN JUVENIL D5', W / 2, H - 75);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = 'bold 22px Rubik, sans-serif';
            ctx.fillText('Promesa de Hoy · ' + current.ref, W / 2, H - 35);

            // --- Descargar ---
            var link = document.createElement('a');
            link.download = 'promesa-d5.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showDownloadToast();
        };

        bgImg.onerror = function () {
            // Fallback: degradado si la foto no carga
            var grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#006491');
            grad.addColorStop(0.45, '#02557d');
            grad.addColorStop(1, '#449bd1');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#F58634';
            ctx.fillRect(0, 0, 140, 22);
            ctx.fillRect(0, H - 22, 220, 22);

            drawChispa(ctx, W - 140, 120, 110);

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 4;
            ctx.font = 'bold 52px Rubik, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            var maxWidth = W - 180;
            var lines = wrapText(ctx, current.text, maxWidth);
            var lineHeight = 68;
            var startY = H / 2 - (lines.length * lineHeight) / 2 + 20;

            for (var i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], W / 2, startY + i * lineHeight);
            }

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#F58634';
            ctx.font = 'bold 34px Rubik, sans-serif';
            ctx.fillText(current.ref, W / 2, H - 200);

            ctx.strokeStyle = '#F58634';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 120, H - 140);
            ctx.lineTo(W / 2 + 120, H - 140);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = 'bold 26px Rubik, sans-serif';
            ctx.fillText('MISIÓN JUVENIL D5', W / 2, H - 70);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = 'bold 20px Rubik, sans-serif';
            ctx.fillText('Promesa de Hoy · ' + current.ref, W / 2, H - 30);

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
