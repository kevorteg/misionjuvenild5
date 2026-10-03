(function () {
    'use strict';

    var stage = document.getElementById('fuego-stage');
    var canvas = document.getElementById('fuego-canvas');
    var label = document.getElementById('fuego-label');
    var totalEl = document.getElementById('fuego-total');
    var grid = document.getElementById('wall-grid');
    var scrollBtn = document.getElementById('fuego-scroll');
    if (!stage || !canvas || !grid || !canvas.getContext) return;

    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var embers = [];
    var raf = null;
    var active = null;

    function rnd(seed) {
        var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return x - Math.floor(x);
    }

    function soundOn() {
        try { return localStorage.getItem('mjd5-sound') !== 'false'; } catch (e) { return true; }
    }

    function ping() {
        if (window.ChispaD5 && typeof window.ChispaD5.sfx === 'function') {
            window.ChispaD5.sfx('pray');
            return;
        }
        if (!soundOn()) return;
        try {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            muro._ctx = muro._ctx || new Ctx();
            var c = muro._ctx;
            if (c.state === 'suspended') c.resume();
            var t = c.currentTime;
            var osc = c.createOscillator(), g = c.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, t);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
            osc.connect(g).connect(c.destination);
            osc.start(t);
            osc.stop(t + 0.36);
        } catch (e) { /* sin audio */ }
    }

    function infoOf(card) {
        var authorEl = card.querySelector('.font-headline.font-black.text-xs');
        var p = card.querySelector('p');
        var countEl = card.querySelector('.prayer-btn .count');
        var text = p ? p.textContent.trim() : '';
        return {
            author: authorEl ? authorEl.textContent.trim() : 'Petición',
            snippet: text.length > 110 ? text.slice(0, 110) + '…' : text,
            count: parseInt(countEl ? countEl.textContent : '0', 10) || 0,
            testimonio: card.getAttribute('data-category') === 'testimonios'
        };
    }

    function visible(card) {
        return card.style.display !== 'none';
    }

    function layout() {
        if (!W || !H) return;
        var cards = grid.querySelectorAll('.feed-card');
        var n = cards.length;
        var prev = {};
        for (var k = 0; k < embers.length; k++) { prev[embers[k].card.__fuegoId || ''] = embers[k]; }
        embers = [];
        for (var i = 0; i < n; i++) {
            var card = cards[i];
            if (!card.__fuegoId) card.__fuegoId = 'e' + i + '_' + Math.floor(Math.random() * 1e6);
            var info = infoOf(card);
            var old = prev[card.__fuegoId];
            var ang = i * 2.399963;
            var rad = Math.sqrt((i + 0.5) / n);
            embers.push({
                card: card,
                isTestimonio: info.testimonio,
                count: info.count,
                bright: Math.max(0.28, Math.min(1, info.count / 90)),
                baseX: W * (0.12 + 0.76 * (0.5 + Math.cos(ang) * red(rad))),
                baseY: H * (0.5 + Math.sin(ang) * rad * 0.34),
                x: 0, y: 0,
                r: 4.5 + Math.min(9, info.count / 14),
                phase: rnd(i * 3.3) * Math.PI * 2,
                drift: 5 + rnd(i + 2) * 9,
                hot: old ? old.hot : 0,
                hidden: !visible(card)
            });
        }
        updateTotal();
    }

    function red(v) { return Math.max(0.06, Math.min(1, v)); }

    function updateTotal() {
        if (!totalEl) return;
        var sum = 0;
        var cards = grid.querySelectorAll('.feed-card');
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i].querySelector('.prayer-btn .count');
            sum += parseInt(c ? c.textContent : '0', 10) || 0;
        }
        totalEl.textContent = sum.toLocaleString('es-CO');
    }

    function draw(t) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < embers.length; i++) {
            var e = embers[i];
            if (e.hidden) continue;
            e.hot = e.hot > 0.002 ? e.hot * 0.94 : 0;
            var bob = reduce ? 0 : Math.sin(t * 0.0009 + e.phase) * e.drift;
            var x = e.baseX, y = e.baseY + bob;
            e.x = x; e.y = y;
            var heat = Math.min(1, e.bright + e.hot);
            var rr = e.r * (1 + e.hot * 0.6);
            var glowR = rr * (3.2 + e.hot * 2.6);
            var col = e.isTestimonio ? '255,198,77' : '245,134,52';
            var g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
            g.addColorStop(0, 'rgba(' + col + ',' + (0.5 * heat + 0.2).toFixed(3) + ')');
            g.addColorStop(0.45, 'rgba(' + col + ',' + (0.2 * heat).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(' + col + ',0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, glowR, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, rr, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,' + Math.round(200 + 45 * heat) + ',' + Math.round(110 + 90 * heat) + ',' + (0.7 + 0.3 * heat).toFixed(2) + ')';
            ctx.fill();

            if (e.hot > 0.05) {
                ctx.beginPath();
                ctx.arc(x, y, rr * (2 + e.hot * 2), 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,220,150,' + (e.hot * 0.5).toFixed(3) + ')';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    function loop(t) {
        draw(t);
        raf = requestAnimationFrame(loop);
    }

    function hit(px, py) {
        var best = null, bestD = 1e9;
        for (var i = 0; i < embers.length; i++) {
            var e = embers[i];
            if (e.hidden) continue;
            var d = Math.hypot(px - e.x, py - e.y);
            if (d < Math.max(e.r + 16, 24) && d < bestD) { best = e; bestD = d; }
        }
        return best;
    }

    function localPos(ev) {
        var r = stage.getBoundingClientRect();
        return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }

    function showLabel(e) {
        if (!label) return;
        var info = infoOf(e.card);
        label.innerHTML = '<div style="font-family:Rubik,sans-serif;font-weight:900;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#C86018;margin-bottom:.2rem">' + info.author + '</div>' +
            '<div style="font-family:\'Nunito Sans\',sans-serif;font-weight:700;font-size:12px;line-height:1.35;color:#111d26;margin-bottom:.3rem">' + info.snippet + '</div>' +
            '<div style="font-family:Rubik,sans-serif;font-weight:900;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:#006491">' + info.count + ' oraciones · toca la brasa</div>';
        label.classList.remove('hidden');
        var lw = label.offsetWidth || 200, lh = label.offsetHeight || 90;
        var left = e.x + 18;
        if (left + lw > W) left = e.x - lw - 18;
        var top = e.y - lh / 2;
        top = Math.max(6, Math.min(top, H - lh - 6));
        left = Math.max(6, Math.min(left, W - lw - 6));
        label.style.left = left + 'px';
        label.style.top = top + 'px';
    }

    function hideLabel() {
        if (label) label.classList.add('hidden');
        if (stage) stage.style.cursor = 'default';
        active = null;
    }

    function burst(e, withSound) {
        if (!e) return;
        e.hot = 1;
        if (withSound) ping();
        var tr = e.card.querySelector('.prayer-btn');
        if (tr && tr.animate) {
            tr.animate(
                [{ boxShadow: '0 0 0 4px #F58634' }, { boxShadow: '0 0 0 0 rgba(245,134,52,0)' }],
                { duration: 900, easing: 'ease-out' }
            );
        }
    }

    function focusCard(e) {
        if (!e) return;
        burst(e, true);
        try { e.card.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'center' }); }
        catch (err) { try { e.card.scrollIntoView(); } catch (e2) {} }
        if (e.card.animate) {
            e.card.animate(
                [{ filter: 'brightness(1.12)' }, { filter: 'brightness(1)' }],
                { duration: 700, easing: 'ease-out' }
            );
        }
    }

    stage.addEventListener('pointermove', function (ev) {
        var p = localPos(ev);
        var e = hit(p.x, p.y);
        active = e;
        if (e) { stage.style.cursor = 'pointer'; showLabel(e); }
        else { hideLabel(); }
    });
    stage.addEventListener('pointerleave', hideLabel);
    stage.addEventListener('click', function (ev) {
        var p = localPos(ev);
        var e = hit(p.x, p.y);
        if (e) focusCard(e);
    });

    if (scrollBtn) {
        scrollBtn.addEventListener('click', function () {
            try { grid.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' }); }
            catch (e) { grid.scrollIntoView(); }
        });
    }

    function resize() {
        var r = stage.getBoundingClientRect();
        W = Math.max(1, r.width);
        H = Math.max(1, r.height);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        layout();
        draw(reduce ? 0 : performance.now());
    }

    function observeGrid() {
        if (!('MutationObserver' in window)) return;
        var mo = new MutationObserver(function () { layout(); });
        mo.observe(grid, { childList: true, subtree: false });
        var cards = grid.querySelectorAll('.feed-card');
        for (var i = 0; i < cards.length; i++) {
            mo.observe(cards[i], { characterData: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        }
    }

    function wrap(name) {
        var orig = window[name];
        if (typeof orig !== 'function') return;
        window[name] = function () {
            var r = orig.apply(this, arguments);
            try {
                if (name === 'incrementPrayer' && arguments[0]) {
                    var card = arguments[0].closest ? arguments[0].closest('.feed-card') : null;
                    if (card) {
                        for (var i = 0; i < embers.length; i++) {
                            if (embers[i].card === card) {
                                embers[i].count++;
                                embers[i].bright = Math.max(embers[i].bright, Math.min(1, embers[i].count / 90));
                                burst(embers[i], false);
                                break;
                            }
                        }
                    }
                    try { window.dispatchEvent(new CustomEvent('d5:pray')); } catch (e) {}
                }
                if (name === 'filterFeed') {
                    for (var j = 0; j < embers.length; j++) embers[j].hidden = !visible(embers[j].card);
                }
                updateTotal();
            } catch (e) { /* noop */ }
            return r;
        };
    }

    if (window.ResizeObserver) {
        new ResizeObserver(resize).observe(stage);
    } else {
        window.addEventListener('resize', resize);
    }

    wrap('incrementPrayer');
    wrap('filterFeed');
    observeGrid();

    resize();
    if (reduce) {
        draw(0);
    } else {
        raf = requestAnimationFrame(loop);
    }

    window.addEventListener('pagehide', function () { if (raf) cancelAnimationFrame(raf); });
})();
