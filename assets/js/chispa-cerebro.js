/* =========================================================================
   chispa-cerebro.js — Chispa consciente del contexto (Fase 1, local y gratis)

   Le da "inteligencia" a Chispa sin IA: sabe en qué página está y reacciona
   a acciones puntuales (podcast, video, FAQ) y a gestos ya existentes del
   sitio (oración en el Muro, envío de formularios — manejados en
   experiencia-d5.js). Nunca lee lo que la persona escribe.

   Reglas de voz:
     - Prioridad: versículo 4 > acción 3 > ambiente 2 > idle 1.
     - Reacciones contextuales (3): 1 cada 25 s y máx 2 por minuto.
     - Saludo y frase de llegada por página: una vez por sesión.
     - Pools de 3-4 frases que nunca repiten la misma dos veces seguidas.

   Sin APIs, sin URLs externas, funciona offline.
   ========================================================================= */

(function () {
    'use strict';

    if (window.__chispaCerebro) return;
    window.__chispaCerebro = true;

    var PAGE = (window.location.pathname.replace(/\/+$/, '').split('/').pop() || 'index').toLowerCase().replace(/\.html$/, '');
    var ss = window.sessionStorage;

    // --- Frases de llegada por página (una vez por sesión) ---
    var ARRIVAL = {
        index: ['¿Por dónde empezamos hoy?', 'Bienvenido de nuevo al D5.', 'Aquí estamos otra vez.'],
        podcast: ['Dale play, tengo un episodio favorito. 🔊', 'Este es el Podcast D5 Fuego.', 'Elige uno y le damos.'],
        'muro-espiritual': ['Deja tu petición; yo la cuido. 🙏', 'Aquí las oraciones se encienden.', 'Cuéntanos por quién oramos.'],
        'quienes-somos': ['¡Viniste a conocernos!', 'Esta es la historia del D5.', 'Mira de dónde viene el D5.'],
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

    // --- Acciones ---
    var PODCAST_PLAY = ['¡Buen episodio!', 'Aquí te espero.', 'Dale, te acompaño.', 'Buen audio. 🔥'];
    var VIDEO = {
        open: ['¡Pongamos el video!', 'Modo video: activado. 📺', 'Dale, aquí lo veo.'],
        play: ['Aquí lo sigo contigo.', 'Ojos en la pantalla. 👀', 'Buen video, ¿no?'],
        close: ['Cerramos… ¿seguimos?', '¿Otro video?', 'Buen material.']
    };
    var FAQ = ['Buena pregunta. 👀', 'Ah, esa es clásica.', 'Me gusta que preguntes.'];

    var lastPick = {};
    function pick(key, arr) {
        if (!arr || !arr.length) return '';
        if (arr.length === 1) return arr[0];
        var last = lastPick[key], i;
        for (var n = 0; n < 8; n++) {
            i = Math.floor(Math.random() * arr.length);
            if (i !== last) break;
        }
        lastPick[key] = i;
        return arr[i];
    }

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

    function sayC(text, prio) {
        if (!text || !ready()) return false;
        var D = window.ChispaD5;
        if (!D || !D.say) return false;
        D.say(text, 5000, prio || 3);
        return true;
    }

    // Reintenta si el momento no es bueno (tour abierto, escribiendo...).
    function sayWhen(text, prio, delay, tries) {
        tries = (tries == null ? 3 : tries);
        setTimeout(function () {
            if (sayC(text, prio)) return;
            if (tries > 0) sayWhen(text, prio, 3500, tries - 1);
        }, delay);
    }

    function init() {
        // --- Llegada a la página (una vez por sesión) ---
        var seen = false;
        try { seen = ss.getItem('mjd5-cb-' + PAGE) === '1'; } catch (e) {}
        if (!seen && ARRIVAL[PAGE]) {
            try { ss.setItem('mjd5-cb-' + PAGE, '1'); } catch (e) {}
            sayWhen(pick('arr-' + PAGE, ARRIVAL[PAGE]), 2, 9000, 3);
        }

        // --- Podcast: solo el primer play de la sesión ---
        var podPlayed = false;
        try { podPlayed = ss.getItem('mjd5-cb-podplay') === '1'; } catch (e) {}
        window.addEventListener('d5:podcast', function (e) {
            var d = (e && e.detail) || {};
            if (d.action !== 'play' || podPlayed) return;
            podPlayed = true;
            try { ss.setItem('mjd5-cb-podplay', '1'); } catch (e) {}
            sayC(pick('podplay', PODCAST_PLAY), 3);
        });

        // --- Video ---
        window.addEventListener('d5:video', function (e) {
            var d = (e && e.detail) || {};
            var lines = VIDEO[d.action];
            if (lines) sayC(pick('vid-' + d.action, lines), 3);
        });

        // --- FAQ: al abrir una pregunta ---
        var details = document.querySelectorAll('details');
        for (var i = 0; i < details.length; i++) {
            (function (d) {
                d.addEventListener('toggle', function () { if (d.open) sayC(pick('faq', FAQ), 3); });
            })(details[i]);
        }

        // El Muro de oración (d5:pray) y los formularios (d5:submit) ya los
        // atiende experiencia-d5.js: reacciona al GESTO, nunca al contenido.
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
})();
