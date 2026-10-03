/* =========================================================================
   experiencia-d5.js — "Experiencia D5"

   Un solo widget autónomo para todas las páginas:
     1) Mascota "Chispa" (SVG inline, abajo a la izquierda)
     2) Tutorial de primera visita en la home (spotlight)
     3) Micro-tips de una sola vez en páginas clave
     4) Sonido de bienvenida (chime procedural con Web Audio)

   No usa assets externos ni URLs de terceros. El audio sólo suena tras el
   primer gesto del usuario (política de autoplay de los navegadores).
   ========================================================================= */

(function () {
    'use strict';

    if (window.__experienciaD5Init) return;
    window.__experienciaD5Init = true;

    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var isLanzamiento = page === 'lanzamiento.html';
    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // ---------------------------------------------------------------- estado
    var LS = { tour: 'mjd5-tour-v1', tips: 'mjd5-tips-v1', sound: 'mjd5-sound' };

    function lsGet(key, def) {
        try { var v = localStorage.getItem(key); return v === null ? def : JSON.parse(v); }
        catch (e) { return def; }
    }
    function lsSet(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* modo privado */ }
    }

    var soundEnabled = lsGet(LS.sound, true);
    var chimePlayed = false;

    // ---------------------------------------------------------------- estilos
    var CSS = ''
    + '#chispaD5{position:fixed;right:1rem;bottom:1rem;z-index:55;display:flex;flex-direction:column;align-items:flex-end;gap:.5rem;font-family:Rubik,sans-serif}'
    + '#chispaD5 *{box-sizing:border-box}'
    + '#chispaTrigger{width:64px;height:64px;padding:0;border:0;background:transparent;cursor:pointer;filter:drop-shadow(0 4px 0 rgba(200,96,24,.35));transition:transform .15s ease;touch-action:none}'
    + '#chispaTrigger:hover{transform:translateY(-3px)}'
    + '#chispaTrigger:active{transform:translateY(1px)}'
    + '#chispaTrigger svg{display:block;width:100%;height:100%;animation:chispaBob 3.8s ease-in-out infinite}'
    + '.chispa-body{transform-box:fill-box;transform-origin:50% 94%;animation:chispaBreath 3.6s ease-in-out infinite}'
    + '.chispa-flicker{transform-box:fill-box;transform-origin:50% 90%;animation:chispaFlicker 2.4s ease-in-out infinite}'
    + '.chispa-face{transform-box:fill-box;transform-origin:center;transition:transform .18s ease}'
    + '#chispaTrigger:hover .chispa-face{transform:scale(1.14)}'
    + '.chispa-eyes{transform-box:fill-box;transform-origin:center;animation:chispaBlink 4.5s ease-in-out infinite}'
    + '.chispa-pupil{transition:transform .12s ease-out}'
    + '.chispa-spark{transform-box:fill-box;transform-origin:center;animation:chispaSpark 2.2s ease-in-out infinite}'
    + '.chispa-mouth-happy{display:none}'
    + '.is-happy .chispa-mouth{display:none}'
    + '.is-happy .chispa-mouth-happy{display:block}'
    + '.is-jump .chispa-body{animation:chispaJump .62s cubic-bezier(.22,1,.36,1)}'
    + '.is-drag #chispaTrigger svg,.is-drag .chispa-body{animation:none!important}'
    + '.is-drag #chispaTrigger{cursor:grabbing}'
    + '.chispa-bubble{max-width:230px;background:#ffffff;color:#111d26;border:2px solid #F58634;box-shadow:0 5px 0 #C86018;padding:.6rem .75rem;font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:13px;line-height:1.35}'
    + '.chispa-bubble strong{display:block;font-family:Rubik,sans-serif;font-weight:900;text-transform:uppercase;font-size:10px;letter-spacing:.08em;color:#C86018;margin-bottom:.15rem}'
    + '.chispa-menu{display:none;flex-direction:column;background:#ffffff;border:2px solid #006491;box-shadow:0 5px 0 #02557d;min-width:190px}'
    + '.chispa-menu.is-open{display:flex}'
    + '.chispa-menu button{display:flex;align-items:center;gap:.5rem;width:100%;padding:.6rem .75rem;border:0;border-bottom:1px solid #E5E5E5;background:#ffffff;cursor:pointer;font-family:Rubik,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#111d26;text-align:left}'
    + '.chispa-menu button:last-child{border-bottom:0}'
    + '.chispa-menu button:hover{background:#F7F9FA;color:#006491}'
    + '.chispa-menu .material-symbols-outlined{font-size:18px;color:#006491}'
    + '.chispa-hide{display:none!important}'

    // Tour
    + '#d5Tour{position:fixed;inset:0;z-index:9998}'
    + '#d5Tour[hidden]{display:none}'
    + '#d5Tour-hole{position:absolute;border:3px solid #F58634;box-shadow:0 0 0 9999px rgba(17,29,38,.78);transition:all .28s cubic-bezier(.22,1,.36,1);pointer-events:none}'
    + '#d5Tour-card{position:absolute;max-width:330px;background:#ffffff;border:2px solid #006491;box-shadow:0 8px 0 rgba(2,85,125,.85);padding:1rem 1.1rem}'
    + '#d5Tour-card h3{font-family:Rubik,sans-serif;font-weight:900;font-size:15px;text-transform:uppercase;letter-spacing:.02em;color:#006491;margin:0 0 .4rem}'
    + '#d5Tour-card p{font-family:"Nunito Sans",sans-serif;font-weight:700;font-size:13px;color:#4E575F;margin:0 0 .9rem;line-height:1.45}'
    + '#d5Tour-card .d5-tour-actions{display:flex;align-items:center;justify-content:space-between;gap:.5rem}'
    + '.d5-btn{display:inline-flex;align-items:center;gap:.35rem;padding:.5rem .8rem;border:2px solid transparent;cursor:pointer;font-family:Rubik,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:.05em}'
    + '.d5-btn-primary{background:#F58634;color:#fff;border-color:#C86018;box-shadow:0 4px 0 #C86018}'
    + '.d5-btn-primary:active{transform:translateY(4px);box-shadow:none}'
    + '.d5-btn-ghost{background:#fff;color:#4E575F;border-color:#E5E5E5;box-shadow:0 4px 0 #CECECE}'
    + '.d5-btn-ghost:active{transform:translateY(4px);box-shadow:none}'
    + '#d5Tour-dots{display:flex;gap:.3rem}'
    + '#d5Tour-dots i{width:8px;height:8px;background:#CECECE;display:block}'
    + '#d5Tour-dots i.on{background:#F58634}'

    // Micro-tip
    + '#d5Tip{position:fixed;right:1rem;bottom:5.5rem;z-index:56;max-width:260px;background:#ffffff;border:2px solid #473458;box-shadow:0 5px 0 #31233E;padding:.7rem .8rem;font-family:"Nunito Sans",sans-serif}'
    + '#d5Tip[hidden]{display:none}'
    + '#d5Tip strong{display:flex;align-items:center;gap:.4rem;font-family:Rubik,sans-serif;font-weight:900;text-transform:uppercase;font-size:10px;letter-spacing:.08em;color:#473458;margin-bottom:.25rem}'
    + '#d5Tip strong .material-symbols-outlined{font-size:16px}'
    + '#d5Tip p{font-weight:800;font-size:12.5px;color:#4E575F;margin:0 0 .6rem;line-height:1.4}'
    + '#d5Tip button{font-family:Rubik,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:.05em;background:#473458;color:#fff;border:2px solid #31233E;box-shadow:0 3px 0 #31233E;padding:.4rem .7rem;cursor:pointer}'
    + '#d5Tip button:active{transform:translateY(3px);box-shadow:none}'
    + '#d5Tip-target{position:fixed;z-index:9997;border:3px solid #473458;box-shadow:0 0 0 4px rgba(71,52,88,.15);pointer-events:none}'
    + '#d5Tip-target[hidden]{display:none}'

    + '@keyframes chispaFlicker{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.05) rotate(-2deg)}}'
    + '@keyframes chispaBlink{0%,90%,100%{transform:scaleY(1)}93%{transform:scaleY(.08)}}'
    + '@keyframes chispaBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-4px) rotate(-1.5deg)}}'
    + '@keyframes chispaSpark{0%,100%{opacity:.45;transform:scale(.7) rotate(0)}50%{opacity:1;transform:scale(1.1) rotate(25deg)}}'
    + '@keyframes chispaBreath{0%,100%{transform:scale(1,1)}50%{transform:scale(1.045,.955)}}'
    + '@keyframes chispaJump{0%{transform:translateY(0) scale(1,1)}28%{transform:translateY(-11px) scale(.93,1.09)}58%{transform:translateY(2px) scale(1.09,.91)}100%{transform:translateY(0) scale(1,1)}}'

    // Ajustes móviles: por encima de la barra inferior
    + '@media (max-width:1279px){'
    + '#chispaD5{bottom:calc(5.25rem + env(safe-area-inset-bottom))}'
    + '#d5Tip{bottom:calc(9.5rem + env(safe-area-inset-bottom))}'
    + '}'
    + '@media (prefers-reduced-motion:reduce){'
    + '.chispa-flicker,.chispa-eyes,.chispa-spark,.chispa-body{animation:none!important}'
    + '#chispaTrigger svg{animation:none!important}'
    + '.is-jump .chispa-body{animation:none!important}'
    + '#chispaTrigger{transition:none}'
    + '#d5Tour-hole{transition:none}'
    + '}';

    var styleEl = document.createElement('style');
    styleEl.id = 'experienciaD5Style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // ---------------------------------------------------------------- svg
    function chispaSvg(size) {
        return ''
        + '<svg viewBox="0 0 72 72" width="' + (size || 72) + '" height="' + (size || 72) + '" role="img" aria-label="Chispa, la mascota de Misión Juvenil D5">'
        + '<g class="chispa-body">'
        + '<g class="chispa-flicker">'
        + '<path d="M36 6C29 18 12 27 12 43c0 13 10 22 24 22s24-9 24-22C60 27 43 18 36 6z" fill="#F58634" stroke="#C86018" stroke-width="3.5" stroke-linejoin="round"/>'
        + '<path d="M36 31c-4.5 7-11 11.5-11 19 0 7.5 5 11.5 11 11.5s11-4 11-11.5c0-7.5-6.5-12-11-19z" fill="#FFC64D"/>'
        + '</g>'
        + '<g class="chispa-face">'
        + '<g class="chispa-eyes">'
        + '<ellipse cx="30" cy="45.5" rx="4.4" ry="4.9" fill="#ffffff" stroke="#3A2410" stroke-width="1.1"/>'
        + '<ellipse cx="42" cy="45.5" rx="4.4" ry="4.9" fill="#ffffff" stroke="#3A2410" stroke-width="1.1"/>'
        + '<circle class="chispa-pupil" cx="30" cy="45.8" r="2.3" fill="#3A2410"/>'
        + '<circle class="chispa-pupil" cx="42" cy="45.8" r="2.3" fill="#3A2410"/>'
        + '<circle cx="31.3" cy="44.1" r="0.85" fill="#ffffff"/>'
        + '<circle cx="43.3" cy="44.1" r="0.85" fill="#ffffff"/>'
        + '</g>'
        + '<path class="chispa-mouth" d="M30.5 54c1.6 2.2 9.4 2.2 11 0" fill="none" stroke="#3A2410" stroke-width="2.8" stroke-linecap="round"/>'
        + '<path class="chispa-mouth-happy" d="M29 53.4c1.9 3.8 12.1 3.8 14 0z" fill="#3A2410"/>'
        + '</g>'
        + '</g>'
        + '<path class="chispa-spark" d="M61 12l1.7 4.4L67 18l-4.3 1.7L61 24l-1.7-4.3L55 18l4.3-1.6z" fill="#FFC64D"/>'
        + '</svg>';
    }

    // ---------------------------------------------------------------- audio
    var audioCtx = null;
    function playChime() {
        if (!soundEnabled || chimePlayed) return;
        chimePlayed = true;
        try {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            audioCtx = audioCtx || new Ctx();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            var now = audioCtx.currentTime;
            var notes = [523.25, 659.25, 783.99, 1046.5];
            notes.forEach(function (freq, i) {
                var t = now + i * 0.12;
                var osc = audioCtx.createOscillator();
                var gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
                osc.connect(gain).connect(audioCtx.destination);
                osc.start(t);
                osc.stop(t + 0.46);
            });
        } catch (e) { /* sin audio disponible */ }
    }
    var PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    var sfxLast = 0;

    function audioCtxGet() {
        if (!soundEnabled) return null;
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        try {
            audioCtx = audioCtx || new Ctx();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        } catch (e) { return null; }
        return audioCtx;
    }

    function tone(ctx, freq, start, dur, vol, type, glideTo) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = type || 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + dur);
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(vol, start + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(g).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.03);
    }

    function note(i) {
        var n = PENTA.length;
        return PENTA[((i % n) + n) % n];
    }

    function sfx(type) {
        if (!soundEnabled) return;
        var nowMs = Date.now();
        if (nowMs - sfxLast < 45) return;
        sfxLast = nowMs;
        var ctx = audioCtxGet();
        if (!ctx) return;
        var t = ctx.currentTime;
        try {
            if (type === 'tap') {
                tone(ctx, note(1 + Math.floor(Math.random() * 3)), t, 0.15, 0.05, 'triangle');
            } else if (type === 'pop') {
                tone(ctx, note(3), t, 0.13, 0.075, 'triangle', note(6));
            } else if (type === 'tick') {
                tone(ctx, note(5 + Math.floor(Math.random() * 2)) * 1.5, t, 0.08, 0.032, 'square');
            } else if (type === 'pray') {
                tone(ctx, note(0), t, 0.7, 0.055, 'sine');
                tone(ctx, note(2), t + 0.03, 0.7, 0.04, 'sine');
                tone(ctx, note(4), t + 0.06, 0.6, 0.03, 'sine');
            } else if (type === 'success') {
                [0, 2, 4, 5].forEach(function (i, k) { tone(ctx, note(i + 2), t + k * 0.085, 0.32, 0.055, 'triangle'); });
            } else if (type === 'whoosh') {
                tone(ctx, 520, t, 0.18, 0.035, 'sine', 260);
            } else if (type === 'turn') {
                tone(ctx, note(3), t, 0.13, 0.05, 'triangle');
            } else if (type === 'finish') {
                [2, 4, 5, 7].forEach(function (i, k) { tone(ctx, note(i + 2), t + k * 0.08, 0.3, 0.055, 'triangle'); });
            } else if (type === 'error') {
                tone(ctx, 311, t, 0.16, 0.05, 'sine');
                tone(ctx, 247, t + 0.14, 0.24, 0.05, 'sine');
            }
        } catch (e) { /* sin audio disponible */ }
    }

    function sfxForTarget(el) {
        if (!el || !el.closest) return null;
        if (el.closest('[data-tour]')) return null;
        if (el.closest('#chispaD5 button')) return 'pop';
        if (el.closest('.prayer-btn')) return 'pray';
        if (el.closest('.filter-chip,.cat-pill,[onclick*="setTab"]')) return 'tick';
        if (el.closest('[onclick*="toggleFaq"]')) return 'whoosh';
        if (el.closest('[onclick*="copyVerse"],[onclick*="shareVerse"]')) return 'success';
        if (el.closest('.btn-3d-orange,a[href*="wa.me"]')) return 'tap';
        return null;
    }

    function armTaps() {
        document.addEventListener('pointerdown', function (e) {
            var k = sfxForTarget(e.target);
            if (k) sfx(k);
        }, true);
        document.addEventListener('submit', function () {
            sfx('success');
            try { window.dispatchEvent(new CustomEvent('d5:submit')); } catch (e) {}
        }, true);
    }

    function armSound() {
        var fire = function () { playChime(); };
        document.addEventListener('pointerdown', fire, { once: true });
        document.addEventListener('keydown', fire, { once: true });
    }

    // ---------------------------------------------------------------- utils
    function rectOf(sel) {
        var el = document.querySelector(sel);
        if (!el) return null;
        return { el: el, rect: el.getBoundingClientRect() };
    }
    function hideBotpress(on) {
        var nodes = document.querySelectorAll('[id*="bp-"],[class*="bp-widget"],iframe[src*="botpress"]');
        for (var i = 0; i < nodes.length; i++) {
            if (on) { nodes[i].__d5prev = nodes[i].style.visibility; nodes[i].style.visibility = 'hidden'; }
            else { nodes[i].style.visibility = nodes[i].__d5prev || ''; }
        }
    }

    // ---------------------------------------------------------------- tour
    var TOUR_HOME = [
        { sel: '#inicio h1', title: '¡Bienvenido a Misión Juvenil D5!', text: 'Este es tu punto de partida. Aquí ves quiénes somos y cómo unirte a la comunidad.' },
        { sel: '#verse-container', title: 'La Palabra de hoy', text: 'Cada día te damos una promesa distinta. Puedes copiarla y compartirla con quien la necesite.' },
        { sel: '#un-click h2', title: 'Todo a un click', text: 'Podcast, recursos, muro espiritual y más. Explora sin complicarte.' },
        { sel: '#unirme h2', title: '¿Quieres unirte?', text: 'Déjanos tus datos o escríbenos por WhatsApp. Te acompañamos en el proceso.' }
    ];

    var tourEl, holeEl, cardEl, dotsEl, tourIndex = 0, tourSteps = [], tourActive = false, mascotaEl;
    var mascotaHiddenByTour = false;

    function buildTour() {
        tourEl = document.createElement('div');
        tourEl.id = 'd5Tour';
        tourEl.hidden = true;
        tourEl.setAttribute('role', 'dialog');
        tourEl.setAttribute('aria-modal', 'true');
        tourEl.setAttribute('aria-label', 'Tutorial de bienvenida');
        tourEl.innerHTML =
            '<div id="d5Tour-hole"></div>' +
            '<div id="d5Tour-card">' +
            '<h3></h3><p></p>' +
            '<div class="d5-tour-actions">' +
            '<button type="button" class="d5-btn d5-btn-ghost" data-tour="skip">Saltar</button>' +
            '<div id="d5Tour-dots"></div>' +
            '<button type="button" class="d5-btn d5-btn-primary" data-tour="next">Siguiente</button>' +
            '</div></div>';
        document.body.appendChild(tourEl);
        holeEl = tourEl.querySelector('#d5Tour-hole');
        cardEl = tourEl.querySelector('#d5Tour-card');
        dotsEl = tourEl.querySelector('#d5Tour-dots');
        tourEl.addEventListener('click', function (e) {
            var b = e.target.closest('[data-tour]');
            if (!b) return;
            if (b.getAttribute('data-tour') === 'skip') return endTour();
            if (tourIndex + 1 >= tourSteps.length) return endTour();
            goToStep(tourIndex + 1);
        });
    }

    goToStep._t = null;
    function goToStep(i) {
        tourIndex = i;
        var st = tourSteps[i];
        var f = rectOf(st.sel);
        if (f && f.rect.height > 0) {
            try { f.el.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'center' }); }
            catch (e) { try { f.el.scrollIntoView(); } catch (e2) { /* sin scroll */ } }
            var last = null, tries = 0;
            clearInterval(goToStep._t);
            var settle = function () {
                var top = f.el.getBoundingClientRect().top;
                if (last !== null && Math.abs(top - last) < 2) { clearInterval(goToStep._t); paintStep(); return; }
                last = top;
                if (++tries > 24) { clearInterval(goToStep._t); paintStep(); }
            };
            goToStep._t = setInterval(settle, reduceMotion ? 20 : 80);
        } else {
            paintStep();
        }
    }

    function paintStep() {
        var step = tourSteps[tourIndex];
        var found = rectOf(step.sel);
        cardEl.querySelector('h3').textContent = step.title;
        cardEl.querySelector('p').textContent = step.text;
        var dots = '';
        for (var i = 0; i < tourSteps.length; i++) dots += '<i class="' + (i === tourIndex ? 'on' : '') + '"></i>';
        dotsEl.innerHTML = dots;
        cardEl.querySelector('[data-tour="next"]').textContent = (tourIndex === tourSteps.length - 1) ? 'Listo' : 'Siguiente';

        if (found) {
            var pad = 8;
            var r = found.rect;
            holeEl.style.display = 'block';
            holeEl.style.left = Math.max(0, r.left - pad) + 'px';
            holeEl.style.top = Math.max(0, r.top - pad) + 'px';
            holeEl.style.width = Math.min(window.innerWidth, r.width + pad * 2) + 'px';
            holeEl.style.height = Math.min(window.innerHeight, r.height + pad * 2) + 'px';
            placeCard(r);
        } else {
            holeEl.style.display = 'none';
            cardEl.style.left = '50%';
            cardEl.style.top = '50%';
            cardEl.style.transform = 'translate(-50%,-50%)';
        }
    }

    function placeCard(r) {
        var pad = 16;
        var cardW = Math.min(330, window.innerWidth - pad * 2);
        cardEl.style.maxWidth = 'none';
        cardEl.style.width = cardW + 'px';
        var cardH = cardEl.offsetHeight || 176;
        var spaceBelow = window.innerHeight - (r.bottom + 14);
        var top = (spaceBelow >= cardH + 12) ? (r.bottom + 14) : (r.top - cardH - 14);
        top = Math.max(pad, Math.min(top, window.innerHeight - cardH - pad));
        var left = Math.min(Math.max(pad, r.left), window.innerWidth - cardW - pad);
        cardEl.style.transform = 'none';
        cardEl.style.left = Math.max(pad, left) + 'px';
        cardEl.style.top = top + 'px';
    }

    function startTour() {
        if (tourActive) return;
        tourSteps = TOUR_HOME;
        if (!TOUR_HOME.length) return;
        if (!tourEl) buildTour();
        tourActive = true;
        tourIndex = 0;
        mascotaHiddenByTour = true;
        if (mascotaEl) mascotaEl.style.display = 'none';
        var tip = document.getElementById('d5Tip');
        if (tip) tip.hidden = true;
        hideBotpress(true);
        tourEl.hidden = false;
        goToStep(0);
    }

    function endTour() {
        tourActive = false;
        if (tourEl) tourEl.hidden = true;
        hideBotpress(false);
        lsSet(LS.tour, true);
        if (mascotaHiddenByTour && mascotaEl) { mascotaEl.style.display = ''; mascotaHiddenByTour = false; }
        say('¡Listo! Ya conoces lo principal. Toca a Chispa si quieres repetir el tour.');
        setTimeout(function () { if (!bubbleBusy()) showVerse(); }, 4500);
    }

    // ---------------------------------------------------------------- tips
    var TIPS = {
        'podcast.html': { sel: null, text: 'Dale play a un episodio: el reproductor aparece pegado abajo y puedes seguir navegando.' },
        'muro-espiritual.html': { sel: '#verse-container', text: 'Aquí está tu promesa del día. Más abajo puedes dejar tu petición de oración.' },
        'salud-mental.html': { sel: null, text: '¿Necesitas hablar con alguien? Puedes pedir acompañamiento en un solo click.' }
    };

    function showTip() {
        var tip = TIPS[page];
        if (!tip) return;
        var seen = lsGet(LS.tips, []);
        if (seen.indexOf(page) !== -1) return;
        var box = document.createElement('div');
        box.id = 'd5Tip';
        box.setAttribute('role', 'status');
        box.innerHTML =
            '<strong><span class="material-symbols-outlined">local_fire_department</span>Consejo de Chispa</strong>' +
            '<p>' + tip.text + '</p>' +
            '<button type="button">Entendido</button>';
        document.body.appendChild(box);

        var targetBox = null;
        if (tip.sel) {
            var found = rectOf(tip.sel);
            if (found) {
                targetBox = document.createElement('div');
                targetBox.id = 'd5Tip-target';
                document.body.appendChild(targetBox);
                var placeTarget = function () {
                    var r = found.el.getBoundingClientRect();
                    var pad = 6;
                    targetBox.style.left = (r.left - pad) + 'px';
                    targetBox.style.top = (r.top - pad) + 'px';
                    targetBox.style.width = Math.min(window.innerWidth, r.width + pad * 2) + 'px';
                    targetBox.style.height = Math.min(window.innerHeight, r.height + pad * 2) + 'px';
                };
                placeTarget();
                try { found.el.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'center' }); } catch (e) {}
                setTimeout(placeTarget, reduceMotion ? 60 : 500);
                window.addEventListener('resize', placeTarget);
                window.addEventListener('scroll', placeTarget, { passive: true });
            }
        }

        box.querySelector('button').addEventListener('click', function () {
            box.remove();
            if (targetBox) targetBox.remove();
            seen.push(page);
            lsSet(LS.tips, seen);
        });
    }

    // ---------------------------------------------------------------- mascota
    function say(text, ms) {
        var bubble = mascotaEl && mascotaEl.querySelector('.chispa-bubble');
        if (!bubble) return;
        bubble.querySelector('span').textContent = text;
        bubble.hidden = false;
        clearTimeout(say._t);
        say._t = setTimeout(function () { bubble.hidden = true; }, ms || 6000);
    }

    function bubbleBusy() {
        var bubble = mascotaEl && mascotaEl.querySelector('.chispa-bubble');
        return !!(bubble && !bubble.hidden);
    }

    var FALLBACK_VERSES = [
        { text: 'Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes en palabra, conducta, amor, espíritu, fe y pureza.', ref: '1 Timoteo 4:12' },
        { text: 'Acuérdate de tu Creador en los días de tu juventud, antes que vengan los días malos...', ref: 'Eclesiastés 12:1' },
        { text: '¿Con qué limpiará el joven su camino? Con guardar tu palabra.', ref: 'Salmo 119:9' },
        { text: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará.', ref: 'Deuteronomio 31:6' },
        { text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.', ref: 'Jeremías 29:11' },
        { text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.', ref: 'Isaías 41:10' }
    ];
    var VERSES = FALLBACK_VERSES.slice();
    var verseIdx = 0;

    function loadVerses() {
        if (!window.fetch) return;
        fetch('assets/data/versiculos.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
            if (!data || !data.length) return;
            for (var i = data.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = data[i]; data[i] = data[j]; data[j] = tmp;
            }
            VERSES = data;
            verseIdx = 0;
        }).catch(function () { /* usamos el respaldo */ });
    }

    function showVerse() {
        if (!VERSES.length) VERSES = FALLBACK_VERSES.slice();
        var v = VERSES[verseIdx % VERSES.length];
        verseIdx++;
        say('"' + v.text + '" — ' + v.ref, 9000);
    }

    var mascotaDrag = { active: false };
    var suppressClick = false;
    var lastUser = Date.now();
    var IDLE_PHRASES = ['¿Exploramos algo?', 'Puedes hacer el tour cuando quieras.', 'En el Muro de Fuego cada petición es una luz.', 'Dale play al podcast, está buenísimo.', 'Cuenta conmigo, estoy aquí.'];
    var PRAISE = ['¡Amén!', '¡Gracias por orar!', '¡Eso es interceder!', '¡Se nota el fuego!'];
    var WELCOME = ['¡Recibido!', '¡Bienvenido a la familia!', '¡Vamos con toda!', '¡Gracias por dar el paso!'];

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function jump() {
        if (reduceMotion) return;
        mascotaEl.classList.add('is-jump');
        clearTimeout(jump._t);
        jump._t = setTimeout(function () { mascotaEl.classList.remove('is-jump'); }, 640);
    }

    function celebrate() {
        if (!mascotaEl) return;
        mascotaEl.classList.add('is-happy');
        jump();
        clearTimeout(celebrate._t);
        celebrate._t = setTimeout(function () { mascotaEl.classList.remove('is-happy'); }, 1700);
    }

    function savePos() {
        lsSet('mjd5-pos-v2', { right: parseInt(mascotaEl.style.right, 10), bottom: parseInt(mascotaEl.style.bottom, 10) });
    }

    function restorePos() {
        var p = lsGet('mjd5-pos-v2', null);
        if (!p || typeof p.right !== 'number' || typeof p.bottom !== 'number' || isNaN(p.right) || isNaN(p.bottom)) return;
        var r = mascotaEl.getBoundingClientRect();
        mascotaEl.style.left = 'auto';
        mascotaEl.style.right = clamp(p.right, 8, window.innerWidth - r.width - 8) + 'px';
        mascotaEl.style.bottom = clamp(p.bottom, 8, window.innerHeight - r.height - 8) + 'px';
    }

    function initEyes(trigger) {
        var pups = trigger.querySelectorAll('.chispa-pupil');
        if (!pups.length) return;
        var tx = 0, ty = 0, raf = null;
        function apply() {
            raf = null;
            for (var i = 0; i < pups.length; i++) pups[i].style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
        }
        function schedule() { if (!raf) raf = requestAnimationFrame(apply); }
        function lookAt(px, py) {
            var r = trigger.getBoundingClientRect();
            var dx = px - (r.left + r.width / 2);
            var dy = py - (r.top + r.height / 2);
            var d = Math.sqrt(dx * dx + dy * dy) || 1;
            tx = (dx / d) * 1.9; ty = (dy / d) * 1.7;
            schedule();
        }
        function lookRandom() {
            var a = Math.random() * Math.PI * 2;
            tx = Math.cos(a) * 1.6; ty = Math.sin(a) * 1.4;
            schedule();
        }
        window.addEventListener('pointermove', function (e) {
            lastUser = Date.now();
            lookAt(e.clientX, e.clientY);
        }, { passive: true });
        setInterval(function () {
            if (document.hidden || mascotaDrag.active || tourActive) return;
            if (Date.now() - lastUser > 2600) lookRandom();
        }, 5200);
    }

    function initDrag(trigger) {
        var startX = 0, startY = 0, startRight = 0, startBottom = 0, w = 0, h = 0, moved = false;
        trigger.addEventListener('pointerdown', function (e) {
            if (e.button && e.button !== 0) return;
            var r = mascotaEl.getBoundingClientRect();
            mascotaDrag.active = true;
            moved = false;
            startX = e.clientX; startY = e.clientY;
            startRight = window.innerWidth - r.right; startBottom = window.innerHeight - r.bottom;
            w = r.width; h = r.height;
            try { trigger.setPointerCapture(e.pointerId); } catch (err) {}
        });
        trigger.addEventListener('pointermove', function (e) {
            if (!mascotaDrag.active) return;
            var dx = e.clientX - startX, dy = e.clientY - startY;
            if (!moved) {
                if (Math.sqrt(dx * dx + dy * dy) < 6) return;
                moved = true;
                mascotaEl.classList.add('is-drag');
            }
            mascotaEl.style.left = 'auto';
            mascotaEl.style.right = clamp(startRight - dx, 8, window.innerWidth - w - 8) + 'px';
            mascotaEl.style.bottom = clamp(startBottom - dy, 8, window.innerHeight - h - 8) + 'px';
            e.preventDefault();
        });
        function end() {
            if (!mascotaDrag.active) return;
            mascotaDrag.active = false;
            var wasMoved = moved;
            moved = false;
            mascotaEl.classList.remove('is-drag');
            if (wasMoved) {
                suppressClick = true;
                savePos();
                setTimeout(function () { suppressClick = false; }, 60);
            }
        }
        trigger.addEventListener('pointerup', end);
        trigger.addEventListener('pointercancel', end);
    }

    function buildMascota() {
        mascotaEl = document.createElement('div');
        mascotaEl.id = 'chispaD5';
        mascotaEl.innerHTML =
            '<div class="chispa-bubble" hidden><strong>Chispa</strong><span></span></div>' +
            '<div class="chispa-menu" role="menu">' +
            '<button type="button" data-act="tour"><span class="material-symbols-outlined">school</span>Hacer el tour</button>' +
            '<button type="button" data-act="wa"><span class="material-symbols-outlined">chat</span>Hablar por WhatsApp</button>' +
            '<button type="button" data-act="verse"><span class="material-symbols-outlined">auto_stories</span>Dame un versículo</button>' +
            '<button type="button" data-act="sound"><span class="material-symbols-outlined">' + (soundEnabled ? 'volume_up' : 'volume_off') + '</span><span class="lbl">Sonido: ' + (soundEnabled ? 'activado' : 'desactivado') + '</span></button>' +
            '<button type="button" data-act="close"><span class="material-symbols-outlined">close</span>Cerrar</button>' +
            '</div>' +
            '<button type="button" id="chispaTrigger" aria-label="Abrir a Chispa, la mascota de Misión Juvenil D5" aria-expanded="false">' + chispaSvg(64) + '</button>';
        document.body.appendChild(mascotaEl);
        restorePos();

        var menu = mascotaEl.querySelector('.chispa-menu');
        var trigger = mascotaEl.querySelector('#chispaTrigger');

        initEyes(trigger);
        initDrag(trigger);

        trigger.addEventListener('click', function () {
            if (suppressClick) return;
            var open = menu.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            var bubble = mascotaEl.querySelector('.chispa-bubble');
            if (open) { bubble.hidden = true; jump(); }
        });

        menu.addEventListener('click', function (e) {
            var b = e.target.closest('[data-act]');
            if (!b) return;
            var act = b.getAttribute('data-act');
            if (act === 'tour') { menu.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); startTour(); }
            else if (act === 'wa') {
                menu.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false');
                window.open('https://wa.me/573137159439?text=' + encodeURIComponent('Hola, quiero unirme a Misión Juvenil D5'), '_blank', 'noopener');
            }
            else if (act === 'verse') {
                menu.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false');
                jump();
                showVerse();
            }
            else if (act === 'sound') { setSound(!soundEnabled); }
            else if (act === 'close') { menu.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); }
        });
    }

    function setSound(on) {
        soundEnabled = on;
        lsSet(LS.sound, on);
        if (!mascotaEl) return;
        var btn = mascotaEl.querySelector('[data-act="sound"]');
        btn.querySelector('.material-symbols-outlined').textContent = on ? 'volume_up' : 'volume_off';
        btn.querySelector('.lbl').textContent = 'Sonido: ' + (on ? 'activado' : 'desactivado');
        if (on) { chimePlayed = false; playChime(); }
        say(on ? 'Sonido activado.' : 'Sonido silenciado.');
    }

    // ---------------------------------------------------------------- init
    function init() {
        // El sonido de entrada funciona en todas las páginas (incl. lanzamiento).
        armTaps();
        if (soundEnabled) armSound();
        else { /* aun así permitimos activarlo luego */ }

        document.addEventListener('pointerdown', function () { lastUser = Date.now(); }, true);

        if (isLanzamiento) return; // en el gate no mostramos mascota ni tour

        buildMascota();

        // Reacciones a la actividad del sitio
        window.addEventListener('d5:pray', function () {
            celebrate();
            say(pick(PRAISE));
        });
        window.addEventListener('d5:submit', function () {
            celebrate();
            say(pick(WELCOME));
        });

        // Saludo inicial
        setTimeout(function () {
            if (tourActive) return;
            say('¡Hola! Soy Chispa, tu guía en Misión Juvenil D5.');
        }, reduceMotion ? 200 : 1400);

        // Frases espontáneas cuando el usuario llevó un rato inactivo
        setInterval(function () {
            if (tourActive || document.hidden || mascotaDrag.active || bubbleBusy()) return;
            if (Date.now() - lastUser < 40000) return;
            say(pick(IDLE_PHRASES));
        }, 50000);

        // Versículos: Chispa comparte uno sin invadir otras burbujas
        loadVerses();
        setTimeout(function () {
            if (!tourActive && !bubbleBusy()) showVerse();
        }, reduceMotion ? 6000 : 12000);
        setInterval(function () {
            if (tourActive || document.hidden || mascotaDrag.active || bubbleBusy()) return;
            showVerse();
        }, 75000);

        // Tour sólo en la home, una vez.
        if (page === 'index.html' && !lsGet(LS.tour, false)) {
            setTimeout(function () {
                if (!tourActive) startTour();
            }, reduceMotion ? 400 : 2600);
        }

        // Micro-tip por página (excepto si va a arrancar el tour).
        if (page !== 'index.html') {
            setTimeout(showTip, reduceMotion ? 300 : 1800);
        }

        // Reposicionar en resize si hay tour activo
        window.addEventListener('resize', function () { if (tourActive) paintStep(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API de depuración
    window.ChispaD5 = {
        tour: function () { startTour(); },
        sound: setSound,
        sfx: sfx,
        verse: function () { showVerse(); },
        celebrate: celebrate,
        reset: function () { try { localStorage.removeItem(LS.tour); localStorage.removeItem(LS.tips); localStorage.removeItem('mjd5-pos-v2'); } catch (e) {} }
    };
})();
