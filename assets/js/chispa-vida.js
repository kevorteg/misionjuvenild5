/* =========================================================================
   chispa-vida.js — Chispa camina, vuela, se posa, duerme y juega contigo.
   Se carga DESPUÉS de experiencia-d5.js y toma el control del movimiento.
   - Roam ON en escritorio, OFF en celular (se recuerda con "Modo libre").
   - Camina por la franja inferior; se posa solo en títulos e imágenes.
   - Se pausa mientras alguien escribe y durante el tour.
   - Respeta prefers-reduced-motion y el interruptor de sonido.
   ========================================================================= */
(function () {
    'use strict';

    var PAGE = (window.location.pathname.replace(/\/+$/, '').split('/').pop() || 'index').toLowerCase().replace(/\.html$/, '');
    if (PAGE === 'lanzamiento' || PAGE === 'salud-mental') return;
    window.__chispaVida = true;

    var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var COARSE = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);
    var QUIET = matchMedia('(pointer:coarse) and (max-height:430px)');
    var KEY = 'mjd5-roam';

    var el, trg, menu, size = 80;
    var S = {
        x: 0, y: 0, vx: 0, vy: 0, mode: 'idle', dir: 1, tx: 0, ty: 0,
        perch: null, pf: .5, until: 0, t: 0, sq: 0, stay: false, perchRead: 0, pr: null
    };
    var enabled, lastAct = Date.now(), ptr = { x: 0, y: 0 };
    var pd = null, drag = false, samples = [], block = false, lastSpark = 0, roamBtn = null;
    var fyCache = -1, perchDirty = true, wasHidden = false;

    try {
        var stored = JSON.parse(localStorage.getItem(KEY));
        enabled = (stored === null || stored === undefined) ? !COARSE : !!stored;
    } catch (e) { enabled = !COARSE; }
    if (RM) enabled = false;

    // ------------------------------------------------------------ utilidades
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function auto() { return enabled && !RM && !QUIET.matches; }
    function maxX() { return Math.max(8, innerWidth - size - 8); }
    function snd(t) { if (window.ChispaD5 && window.ChispaD5.sfx) window.ChispaD5.sfx(t); }
    function talk(t, ms) {
        var D = window.ChispaD5;
        if (!D || !D.say) return;
        if (D.busy && D.busy()) return;
        D.say(t, ms || 3500);
    }
    function tourOpen() { var t = document.getElementById('d5Tour'); return !!(t && !t.hidden); }
    function isTyping() {
        var a = document.activeElement;
        if (!a) return false;
        var tag = a.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || a.isContentEditable === true;
    }
    function readSize() {
        if (!trg) return size;
        var w = trg.getBoundingClientRect().width;
        return w > 0 ? w : (innerWidth <= 640 ? 60 : 80);
    }
    function invalidate() { fyCache = -1; perchDirty = true; }

    function computeFloor() {
        var off = 8, nav = document.querySelector('.mobile-bottom-nav');
        if (nav && getComputedStyle(nav).display !== 'none') {
            var nr = nav.getBoundingClientRect();
            if (nr.height > 0 && nr.bottom > innerHeight - 96) off = Math.max(off, nr.height + 8);
        }
        var pb = document.getElementById('playerBar');
        if (pb && pb.offsetHeight) {
            var pt = pb.getBoundingClientRect().top;
            if (pt > 0 && pt < innerHeight) off = Math.max(off, innerHeight - pt + 8);
        }
        fyCache = innerHeight - size - off;
        return fyCache;
    }
    function floorY() { return fyCache < 0 ? computeFloor() : fyCache; }

    function go(mode, ms) { S.mode = mode; S.t = 0; S.until = performance.now() + (ms || 0); }

    function flyTo(x, y, perch, stay) {
        S.tx = clamp(x, 8, maxX());
        S.ty = clamp(y, 8, floorY());
        S.perch = perch || null;
        S.stay = !!stay;
        S.perchRead = 0; perchDirty = true;
        snd('lift');
        go('fly');
    }

    // ------------------------------------------------------------ pintado
    function apply(rot, sx, sy) {
        var left = S.x + size / 2 < innerWidth / 2;
        el.style.alignItems = left ? 'flex-start' : 'flex-end';
        el.style.left = left ? S.x + 'px' : 'auto';
        el.style.right = left ? 'auto' : (innerWidth - S.x - size) + 'px';
        el.style.bottom = (innerHeight - S.y - size) + 'px';
        trg.style.transformOrigin = '50% 90%';
        trg.style.rotate = (rot || 0).toFixed(1) + 'deg';
        trg.style.scale = (S.dir * (sx || 1) * (1 + S.sq * .6)).toFixed(3) + ' ' + ((sy || 1) * (1 - S.sq)).toFixed(3);
    }

    function spark() {
        if (RM || !document.body.animate) return;
        var d = document.createElement('i');
        d.style.cssText = 'position:fixed;z-index:54;pointer-events:none;width:8px;height:8px;border-radius:50%;background:#FFC64D;'
            + 'left:' + (S.x + size / 2 + rnd(-8, 8)) + 'px;top:' + (S.y + size * .75) + 'px';
        document.body.appendChild(d);
        var a = d.animate(
            [{ transform: 'translateY(0) scale(1)', opacity: .9 },
             { transform: 'translateY(' + rnd(12, 32) + 'px) scale(.2)', opacity: 0 }],
            { duration: 600, easing: 'ease-out' });
        a.onfinish = function () { d.remove(); };
    }

    // ------------------------------------------------------------ decisiones
    function safeToPerch(node) {
        if (!node || node.nodeType !== 1) return false;
        if (el.contains(node)) return false;
        if (node.closest('#chispaD5,.mobile-bottom-nav,nav,header,footer')) return false;
        if (node.closest('a,button,form,input,textarea,select,label,[contenteditable]')) return false;
        return true;
    }

    function pickPerch() {
        var list = document.querySelectorAll('h1,h2,h3,img'), ok = [];
        for (var i = 0; i < list.length; i++) {
            var node = list[i];
            if (!safeToPerch(node)) continue;
            var r = node.getBoundingClientRect();
            if (r.top <= size || r.top >= innerHeight - size * 2) continue;
            if (r.width < 60 || r.height < 20) continue;
            if (node.tagName === 'IMG' && (r.width < 140 || r.height < 80)) continue;
            ok.push(node);
        }
        return ok.length ? pick(ok) : null;
    }

    function think() {
        S.stay = false;
        var fy = floorY(), r = Math.random();
        if (r < .55) {
            if (S.y < fy - 4) { go('fall'); return; }
            var nx = rnd(8, maxX());
            if (Math.abs(nx - S.x) < 40) { go('idle', rnd(2500, 5000)); return; }
            S.tx = nx;
            go('walk');
        } else if (r < .87) {
            go('idle', rnd(3000, 7000));
        } else {
            var p = pickPerch();
            if (!p) { go('idle', rnd(2500, 5000)); return; }
            S.pf = rnd(.25, .75);
            var rc = p.getBoundingClientRect();
            flyTo(rc.left + rc.width * S.pf - size / 2, rc.top - size * .9, p, false);
        }
    }

    function sleep() {
        go('sleep');
        el.classList.add('is-sleep');
        talk('zZz...', 3500);
    }
    function wake() {
        el.classList.remove('is-sleep');
        go('idle', 600);
        talk('¡Ya desperté!', 2200);
    }

    // ------------------------------------------------------------ bucle
    var last = performance.now(), lastFloor = 0;
    function frame(now) {
        requestAnimationFrame(frame);
        var dt = Math.min(.05, (now - last) / 1000);
        last = now;
        if (!el || drag || document.hidden) return;
        if (el.style.display === 'none') { wasHidden = true; return; }
        if (RM) { apply(0, 1, 1); return; }
        if (menu.classList.contains('is-open') || isTyping() || tourOpen()) return;
        if (wasHidden) { wasHidden = false; invalidate(); S.y = floorY(); }
        if (now - lastFloor > 250) { lastFloor = now; fyCache = -1; }

        var fy = floorY(), rot = 0, sx = 1, sy = 1;
        S.t += dt;
        S.sq = Math.max(0, S.sq - dt * 1.4);
        S.x = clamp(S.x, 8, maxX());

        if (S.mode === 'idle') {
            if (S.y > fy) S.y = fy; else if (!S.stay && S.y < fy) S.y = fy;
            sy = 1 + Math.sin(S.t * 2) * .02;
            if (auto() && now > S.until) {
                if (Date.now() - lastAct > 60000 && S.y >= fy - 4) sleep(); else think();
            }

        } else if (S.mode === 'walk') {
            var dx = S.tx - S.x;
            if (Math.abs(dx) < 4) { go('idle', rnd(2500, 5500)); }
            else {
                S.dir = dx > 0 ? 1 : -1;
                S.x += S.dir * 45 * dt;
                S.y = fy;
                var w = Math.abs(Math.sin(S.t * 9));
                rot = Math.sin(S.t * 9) * 4;
                sy = 1 - w * .05; sx = 1 + w * .035;
            }

        } else if (S.mode === 'fly') {
            if (S.perch && (perchDirty || now - S.perchRead > 250)) { S.perchRead = now; S.pr = S.perch.getBoundingClientRect(); }
            if (S.perch && S.pr) {
                S.tx = clamp(S.pr.left + S.pr.width * S.pf - size / 2, 8, maxX());
                S.ty = clamp(S.pr.top - size * .9, 8, floorY());
            }
            perchDirty = false;
            var ax = S.tx - S.x, ay = S.ty - S.y, d = Math.hypot(ax, ay);
            if (d < 6) {
                S.x = S.tx; S.y = S.ty;
                if (S.perch) { snd('land'); go('perch', rnd(5000, 9000)); talk(pick(['¡Desde aquí se ve mejor!', '¡Mira qué vista!', 'Me quedo un ratito aquí.']), 3000); }
                else if (S.stay) { go('idle', 4000); }
                else { go('fall'); }
            } else {
                var sp = Math.min(180, 50 + d * 1.8) * dt;
                S.x += ax / d * sp;
                S.y += ay / d * sp + Math.sin(S.t * 8) * .5;
                S.dir = ax > 0 ? 1 : -1;
                rot = ax / d * 12;
                sx = 1.05; sy = .96;
                if (!S.perch && now - lastSpark > 110) { lastSpark = now; spark(); }
            }

        } else if (S.mode === 'perch') {
            if (S.perch && (perchDirty || now - S.perchRead > 250)) { S.perchRead = now; S.pr = S.perch.getBoundingClientRect(); }
            var pr2 = S.pr;
            if (!S.perch || !pr2 || pr2.top < -size || pr2.bottom > innerHeight + size || now > S.until) { S.perch = null; go('fall'); }
            else {
                S.x = clamp(pr2.left + pr2.width * S.pf - size / 2, 8, maxX());
                S.y = clamp(pr2.top - size * .9, 8, floorY());
                sy = 1 + Math.sin(S.t * 2) * .03;
            }

        } else if (S.mode === 'fall') {
            S.vy += 1600 * dt;
            S.y += S.vy * dt;
            S.x += S.vx * dt;
            S.vx *= (1 - dt * .6);
            if (S.x < 8) { S.x = 8; S.vx = Math.abs(S.vx) * .6; }
            if (S.x > maxX()) { S.x = maxX(); S.vx = -Math.abs(S.vx) * .6; }
            if (S.y < 8) { S.y = 8; S.vy = Math.abs(S.vy) * .5; }
            rot = clamp(S.vx / 25, -25, 25);
            if (S.y >= fy) {
                S.y = fy;
                if (Math.abs(S.vy) > 300) { S.vy = -S.vy * .45; S.sq = .22; }
                else { S.vy = 0; S.vx = 0; S.sq = .22; snd('land'); go('idle', 600); }
            }

        } else if (S.mode === 'follow') {
            var fx = ptr.x - size / 2, fyy = ptr.y - size - 12;
            var k = Math.min(1, dt * 4);
            S.dir = fx > S.x ? 1 : -1;
            rot = clamp((fx - S.x) * .05, -12, 12);
            S.x += (fx - S.x) * k;
            S.y += (fyy - S.y) * k;
            S.y = clamp(S.y, 8, fy);
            if (now - lastSpark > 130) { lastSpark = now; spark(); }
            if (now > S.until) { talk('¡Qué divertido!', 2500); go('fall'); }
        }

        apply(rot, sx, sy);
    }

    // ------------------------------------------------------------ interacción
    function activity() {
        if (tourOpen()) return;
        lastAct = Date.now();
        if (S.mode === 'sleep') wake();
    }

    function initInteraction() {
        trg.style.touchAction = 'none';

        trg.addEventListener('pointerdown', function (e) {
            if (e.button && e.button !== 0) return;
            pd = { x: e.clientX, y: e.clientY, gx: 0, gy: 0 };
            try { trg.setPointerCapture(e.pointerId); } catch (err) {}
        });

        trg.addEventListener('pointermove', function (e) {
            if (!pd) return;
            if (!drag) {
                if (Math.hypot(e.clientX - pd.x, e.clientY - pd.y) < 6) return;
                drag = true;
                pd.gx = e.clientX - S.x;
                pd.gy = e.clientY - S.y;
                S.perch = null;
                el.classList.add('is-drag');
                if (S.mode === 'sleep') el.classList.remove('is-sleep');
                snd('lift');
            }
            S.x = clamp(e.clientX - pd.gx, 8, maxX());
            S.y = clamp(e.clientY - pd.gy, 8, innerHeight - size - 8);
            samples.push({ x: S.x, y: S.y, t: performance.now() });
            if (samples.length > 5) samples.shift();
            apply(clamp((e.clientX - pd.x) * .1, -18, 18), 1.06, 1.06);
            e.preventDefault();
        });

        function release() {
            if (!pd) return;
            var wasDrag = drag;
            pd = null; drag = false;
            el.classList.remove('is-drag');
            if (!wasDrag) return;
            block = true;
            setTimeout(function () { block = false; }, 80);
            var a = samples[0], b = samples[samples.length - 1];
            S.vx = 0; S.vy = 0;
            if (a && b && b.t - a.t > 10) {
                S.vx = clamp((b.x - a.x) / ((b.t - a.t) / 1000), -1400, 1400);
                S.vy = clamp((b.y - a.y) / ((b.t - a.t) / 1000), -1400, 1400);
            }
            samples = [];
            lastAct = Date.now();
            if (RM) { go('idle', 1000); return; }
            go('fall');
            if (Math.hypot(S.vx, S.vy) > 600) talk(pick(['¡Wiiiii!', '¡Otra vez!', '¡Wow!']), 2000);
        }
        trg.addEventListener('pointerup', release);
        trg.addEventListener('pointercancel', release);

        // Evita que el final de un arrastre cuente como "click" (abrir menú)
        window.addEventListener('click', function (e) {
            if (block) { e.stopPropagation(); e.preventDefault(); block = false; }
        }, true);

        // Cariño: si el cursor se queda encima un momento, se pone feliz
        var petT = null;
        trg.addEventListener('pointerenter', function () {
            if (RM) return;
            petT = setTimeout(function () {
                if (window.ChispaD5 && window.ChispaD5.celebrate) window.ChispaD5.celebrate();
                talk(pick(['¡Me haces cosquillas!', '¡Qué bien!', '¡Gracias!']), 2000);
            }, 1200);
        });
        trg.addEventListener('pointerleave', function () { clearTimeout(petT); });

        // Doble click / doble toque en un espacio vacío: Chispa vuela hasta ahí
        document.addEventListener('dblclick', function (e) {
            if (!auto() || tourOpen() || isTyping()) return;
            if (e.target.closest && e.target.closest('a,button,input,textarea,select,label,#chispaD5')) return;
            activity();
            flyTo(e.clientX - size / 2, e.clientY - size / 2, null, false);
        });

        ['pointermove', 'pointerdown'].forEach(function (ev) {
            window.addEventListener(ev, function (e) { ptr.x = e.clientX; ptr.y = e.clientY; activity(); }, { passive: true });
        });
        window.addEventListener('keydown', activity);
        window.addEventListener('scroll', function () { perchDirty = true; activity(); }, { passive: true });
        window.addEventListener('resize', function () {
            size = readSize(); invalidate();
            S.x = clamp(S.x, 8, maxX()); S.y = clamp(S.y, 8, floorY());
        });
        window.addEventListener('orientationchange', function () { size = readSize(); invalidate(); });
    }

    function addMenuButton(act, icon, label, fn) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-act', act);
        b.innerHTML = '<span class="material-symbols-outlined">' + icon + '</span><span class="lbl">' + label + '</span>';
        b.addEventListener('click', fn);
        var close = menu.querySelector('[data-act="close"]');
        if (close) menu.insertBefore(b, close); else menu.appendChild(b);
        return b;
    }

    function closeMenu() {
        menu.classList.remove('is-open');
        trg.setAttribute('aria-expanded', 'false');
    }

    function roamLabel() { return 'Modo libre: ' + (enabled ? 'activado' : 'desactivado'); }

    function initMenu() {
        if (RM) return;
        if (COARSE) {
            addMenuButton('here', 'near_me', 'Ven aquí', function () {
                if (tourOpen()) return closeMenu();
                closeMenu(); activity(); S.perch = null;
                flyTo((innerWidth - size) / 2, Math.max(8, innerHeight * .45 - size / 2), null, true);
                talk('¡Aquí estoy!', 2500);
            });
        } else {
            addMenuButton('follow', 'my_location', 'Sígueme', function () {
                if (tourOpen()) return closeMenu();
                closeMenu(); activity(); S.perch = null;
                go('follow', 12000);
                talk('¡Te sigo! Mueve el cursor.', 3500);
            });
        }
        roamBtn = addMenuButton('roam', 'directions_walk', roamLabel(), function () {
            enabled = !enabled;
            try { localStorage.setItem(KEY, JSON.stringify(enabled)); } catch (e) {}
            roamBtn.querySelector('.lbl').textContent = roamLabel();
            closeMenu();
            if (!enabled) { S.perch = null; go('fall'); talk('Me quedo quieta. Puedes arrastrarme.', 3000); }
            else { go('idle', 800); talk('¡A explorar!', 2500); }
        });
    }

    // ------------------------------------------------------------ arranque
    function watchLayout() {
        ['playerSection', 'playerBar'].forEach(function (id) {
            var n = document.getElementById(id);
            if (!n) return;
            if (window.ResizeObserver) new ResizeObserver(invalidate).observe(n);
            if (window.MutationObserver) new MutationObserver(invalidate).observe(n, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
        });
        if (window.MutationObserver) {
            new MutationObserver(function (muts) {
                for (var i = 0; i < muts.length; i++) {
                    var added = muts[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        var n = added[j];
                        if (n.nodeType !== 1) continue;
                        if (n.id === 'playerBar' || n.id === 'playerSection' || (n.classList && n.classList.contains('mobile-bottom-nav'))) { invalidate(); return; }
                    }
                }
            }).observe(document.body, { childList: true, subtree: true });
        }
    }

    function boot() {
        var tries = 0;
        var iv = setInterval(function () {
            trg = document.getElementById('chispaTrigger');
            el = document.getElementById('chispaD5');
            if (!trg || !el) { if (++tries > 40) clearInterval(iv); return; }
            clearInterval(iv);

            menu = el.querySelector('.chispa-menu');
            var st = document.createElement('style');
            st.textContent = '.is-sleep .chispa-eyes{animation:none!important;transform:scaleY(.1)}';
            document.head.appendChild(st);

            size = readSize();
            var r = trg.getBoundingClientRect();
            S.x = r.width ? r.left : Math.max(8, innerWidth - size - 16);
            S.y = r.height ? r.top : Math.max(8, floorY());
            go('idle', rnd(3000, 6000));
            if (RM) apply(0, 1, 1);

            initInteraction();
            initMenu();
            watchLayout();
            requestAnimationFrame(frame);
        }, 150);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
