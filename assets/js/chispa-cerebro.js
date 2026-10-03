/* =========================================================================
   chispa-cerebro.js — Chispa consciente del contexto (Fase 1, local y gratis)

   Le da "inteligencia" a Chispa sin IA: sabe en qué página está y reacciona
   a lo que el usuario hace (podcast, video, FAQ, filtros, like, descarga,
   scroll, retorno a una página). Habla por la burbuja existente usando
   prioridad + cooldown (ver experiencia-d5.js -> say) para no pisar el tour,
   los versículos ni la inactividad.

   Sin APIs, sin URLs externas, funciona offline.
   ========================================================================= */

(function () {
    'use strict';

    if (window.__chispaCerebro) return;
    window.__chispaCerebro = true;

    var PAGE = (window.location.pathname.replace(/\/+$/, '').split('/').pop() || 'index').toLowerCase().replace(/\.html$/, '');
    var ss = window.sessionStorage;

    // --- Frases de llegada por página (una por visita a esa página) ---
    var ARRIVAL = {
        index: ['¿Por dónde empezamos hoy?', 'Bienvenido de nuevo al D5.'],
        podcast: ['Dale play, tengo un episodio favorito. 🔊', 'Este es el Podcast D5 Fuego. ¡Échale oído!'],
        'muro-espiritual': ['Deja tu petición; yo la cuido. 🙏', 'Aquí las oraciones se encienden.'],
        'quienes-somos': ['¡Viniste a conocernos! Mira de dónde viene el D5.', 'Esta es la historia del D5.'],
        colegios: ['¿Llevamos el D5 a tu colegio?', 'Los colegios también encienden el fuego.'],
        universidades: ['¿Y si el D5 llega a tu campus?', 'Esto es el D5 en las universidades.'],
        contacto: ['¿Nos escribes? Con gusto te leo.', 'Estoy a un mensaje de distancia.'],
        recursos: ['Aquí hay material para tu camino.', 'Recursos gratis para tu fe.'],
        'preguntas-frecuentes': ['¿Dudas? Toca una pregunta y te la abro.', 'Preguntas frecuentes, respuestas claras.'],
        calendario: ['Mira todo lo que viene este mes.', 'Agenda D5: no te pierdas nada.'],
        impacto: ['Esto es lo que el D5 ya encendió.', 'Mira el impacto real del D5.'],
        digital: ['A un Click: podcast, recursos y más.', 'Todo el D5 a un solo click.'],
        404: ['Te perdiste… pero yo te guío de vuelta.', 'Esa página no existe, pero aquí estoy.']
    };

    var RETURN_LINES = {
        podcast: ['Volviste al podcast. 🎧', 'Otra vez por aquí, me gusta.'],
        'quienes-somos': ['De nuevo por aquí… te gusta nuestra historia, ¿eh?', 'Volviste a conocernos. 😌'],
        'muro-espiritual': ['Volviste al Muro. ¿Oramos?', 'Otra petición, otra chispa.'],
        index: ['¡De vuelta al inicio!', 'Otra vez por casa, me alegra.']
    };

    var PODCAST = {
        select: ['Ah, mi episodio favorito.', '¡Buena elección!', 'Sube el volumen, esto vale la pena.'],
        play: ['¡Veo que estás escuchando! 🎧', 'Así me gusta, con fuego.', 'Pon atención a esta parte.'],
        pause: ['¿Pausa? Aquí espero.', 'Tómate tu tiempo.', 'Cuando quieras seguimos.'],
        ended: ['¿Otro episodio?', 'Se acabó… ¿repetimos?', '¡Buen audio! ¿Vamos por más?'],
        download: ['¡Guardado! Para oírlo sin conexión.', 'Descarga lista. 🔥'],
        like: ['¡Gracias por el like!', 'Anotado en tus favoritos.']
    };

    var VIDEO = {
        open: ['¡Pongamos el video!', 'Modo video: activado. 📺'],
        play: ['Dale, aquí lo veo contigo.', 'Ojos en la pantalla. 👀'],
        pause: ['Pausa… aquí sigo.', '¿Un respiro? Vale.'],
        close: ['Buen video, ¿no?', 'Cerramos… ¿seguimos explorando?']
    };

    var TEMAS = ['Buena temática.', '¡Ese tema enciende!', 'Buena elección de tema.'];
    var FAQ = ['Buena pregunta. 👀', 'Ah, esa es clásica.', 'Me gusta que preguntes.'];
    var SCROLL = ['¿Te vas hasta abajo, eh?', 'Sigue bajando, hay más.', '¿Viste todo? Bien ahí.'];

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function typing() {
        var a = document.activeElement;
        if (!a) return false;
        if (a.isContentEditable) return true;
        var t = a.tagName;
        return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT';
    }
    function tourOpen() {
        var t = document.getElementById('d5Tour');
        return !!(t && !t.hidden);
    }
    function ready() {
        return !(document.hidden || typing() || tourOpen());
    }

    // Habla con prioridad "media" (2) respetando bloqueos.
    function sayC(text, prio) {
        if (!text || !ready()) return false;
        var D = window.ChispaD5;
        if (!D || !D.say) return false;
        D.say(text, 5000, prio || 2);
        return true;
    }

    // Intenta hablar más tarde si el momento no es bueno (tour, escritura...).
    function sayWhen(text, prio, delay, tries) {
        tries = (tries == null ? 3 : tries);
        setTimeout(function () {
            if (sayC(text, prio)) return;
            if (tries > 0) sayWhen(text, prio, 3500, tries - 1);
        }, delay);
    }

    function init() {
        // --- Llegada a la página ---
        var visits = 0;
        try { visits = parseInt(ss.getItem('mjd5-cb-' + PAGE), 10) || 0; } catch (e) {}
        try { ss.setItem('mjd5-cb-' + PAGE, String(visits + 1)); } catch (e) {}

        var arrive = RETURN_LINES[PAGE] && visits > 0 ? pick(RETURN_LINES[PAGE]) : (ARRIVAL[PAGE] && pick(ARRIVAL[PAGE]));
        if (arrive) sayWhen(arrive, 2, 9000, 3);

        // --- Podcast ---
        window.addEventListener('d5:podcast', function (e) {
            var d = (e && e.detail) || {};
            var lines = PODCAST[d.action];
            if (lines) sayC(pick(lines), 3);
        });

        // --- Video ---
        window.addEventListener('d5:video', function (e) {
            var d = (e && e.detail) || {};
            var lines = VIDEO[d.action];
            if (lines) sayC(pick(lines), 3);
        });

        // --- Filtros (podcast y FAQ) ---
        document.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || !t.closest) return;
            if (t.closest('.category-btn') || t.closest('.faq-chip')) sayC(pick(TEMAS), 3);
        }, true);

        // --- FAQ: al abrir una pregunta ---
        var details = document.querySelectorAll('details');
        for (var i = 0; i < details.length; i++) {
            (function (d) {
                d.addEventListener('toggle', function () { if (d.open) sayC(pick(FAQ), 3); });
            })(details[i]);
        }

        // --- Scroll profundo (una vez) ---
        var scrolled = false;
        window.addEventListener('scroll', function () {
            if (scrolled || document.hidden) return;
            var h = document.documentElement;
            if (!h.scrollHeight) return;
            var pct = (h.scrollTop + window.innerHeight) / h.scrollHeight;
            if (pct > 0.8) {
                scrolled = true;
                sayWhen(pick(SCROLL), 1, 600, 1);
            }
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
})();
