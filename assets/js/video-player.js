/* Reproductor de VIDEO estilo Misión Juvenil D5 (popup/modal)
 * Videos locales MP4: elimina el error 153 de YouTube por completo.
 * Abrir con openVideoPlayer('ep9' | 'doc' | ...). */

// Cuando los MP4 viven en Cloudflare R2, ajusta esta constante
// (ej. MJ_MEDIA_BASE = 'https://<bucket>.r2.dev/'; mediaUrl devuelve la URL completa).
var MJ_MEDIA_BASE = 'https://pub-1da551c3ef58478dbee4fc941a3cab52.r2.dev/';
function mediaUrl(p) {
    return MJ_MEDIA_BASE ? MJ_MEDIA_BASE + p : p;
}

var MJ_VIDEOS = {
    ep1: { src: 'media/video/podcasts/ep1.mp4', poster: 'media/video/podcasts/ep1.jpg', title: 'La Primera Conversación', subtitle: 'Podcast D5 Fuego · Episodio 01', start: 0 },
    ep2: { src: 'media/video/podcasts/ep2.mp4', poster: 'media/video/podcasts/ep2.jpg', title: 'Inseguridades y Experiencias', subtitle: 'Podcast D5 Fuego · Episodio 02', start: 0 },
    ep3: { src: 'media/video/podcasts/ep3.mp4', poster: 'media/video/podcasts/ep3.jpg', title: 'Bienvenido a la U', subtitle: 'Podcast D5 Fuego · Episodio 03', start: 0 },
    ep5: { src: 'media/video/podcasts/ep5.mp4', poster: 'media/video/podcasts/ep5.jpg', title: 'Liderazgo que Enciende', subtitle: 'Podcast D5 Fuego · Episodio 05', start: 0 },
    ep6: { src: 'media/video/podcasts/ep6.mp4', poster: 'media/video/podcasts/ep6.jpg', title: 'Silenciar el Ruido Interior', subtitle: 'Podcast D5 Fuego · Episodio 06', start: 0 },
    ep7: { src: 'media/video/podcasts/ep7.mp4', poster: 'media/video/podcasts/ep7.jpg', title: 'Fe en Primera Línea', subtitle: 'Podcast D5 Fuego · Episodio 07', start: 0 },
    ep9: { src: 'media/video/podcasts/ep9.mp4', poster: 'media/video/podcasts/ep9.jpg', title: 'Desafíos en la Academia', subtitle: 'Podcast D5 Fuego · Episodio 09', start: 500 },
    doc: { src: 'media/video/documentales/documental-mj5.mp4', poster: 'media/video/documentales/documental-mj5.jpg', title: 'Documental MJ5 · Nuestra Historia', subtitle: 'Distrito 5 · Toda la trayectoria de Misión Juvenil', start: 0 }
};

(function () {
    var overlay, video, svgPlay, svgPause, lblPlay, curEl, durEl, fill, thumb, titleEl, subEl, btnSpeed, speedIdx = 0, speeds = [1, 1.25, 1.5];

    function fmt(s) {
        if (!isFinite(s)) return '00:00';
        s = Math.floor(s);
        var m = Math.floor(s / 60), h = Math.floor(m / 60);
        var ss = String(s % 60).padStart(2, '0');
        if (h > 0) { return h + ':' + String(m % 60).padStart(2, '0') + ':' + ss; }
        return String(m).padStart(2, '0') + ':' + ss;
    }

    if (!document.getElementById('mjVideoOverlay')) {
        var style = document.createElement('style');
        style.textContent = requirePlayerCss();
        document.head.appendChild(style);

        var wrap = document.createElement('div');
        wrap.innerHTML = playerMarkup();
        document.body.appendChild(wrap);

        overlay = document.getElementById('mjVideoOverlay');
        video = document.getElementById('mjVideoEl');
        svgPlay = document.getElementById('mjVPlayIcon');
        svgPause = document.getElementById('mjVPauseIcon');
        lblPlay = document.getElementById('mjVPlayLabel');
        curEl = document.getElementById('mjVCurTime');
        durEl = document.getElementById('mjVDur');
        fill = document.getElementById('mjVFill');
        thumb = document.getElementById('mjVThumb');
        titleEl = document.getElementById('mjVTitle');
        subEl = document.getElementById('mjVSubtitle');
        btnSpeed = document.getElementById('mjVSpeed');

        document.getElementById('mjVClose').addEventListener('click', closePlayer);
        document.getElementById('mjVPlay').addEventListener('click', togglePlay);
        document.getElementById('mjVBack').addEventListener('click', function () { video.currentTime = Math.max(0, video.currentTime - 15); });
        document.getElementById('mjVFwd').addEventListener('click', function () { video.currentTime = Math.min(video.duration || 1e9, video.currentTime + 15); });
        btnSpeed.addEventListener('click', function () { speedIdx = (speedIdx + 1) % speeds.length; video.playbackRate = speeds[speedIdx]; btnSpeed.textContent = speeds[speedIdx] + 'x'; });
        document.getElementById('mjVDownload').addEventListener('click', function () {
            var a = document.createElement('a');
            a.href = video.currentSrc;
            a.download = video.currentSrc.split('/').pop();
            document.body.appendChild(a); a.click(); a.remove();
        });
        document.getElementById('mjVFull').addEventListener('click', function () {
            if (document.fullscreenElement) { document.exitFullscreen(); } else { overlay.querySelector('.mjv-panel').requestFullscreen(); }
        });
        document.getElementById('mjVScrub').addEventListener('click', function (e) {
            if (!video.duration) return;
            var r = this.getBoundingClientRect();
            video.currentTime = ((e.clientX - r.left) / r.width) * video.duration;
        });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) closePlayer(); });

        video.addEventListener('play', setPlaying);
        video.addEventListener('pause', setPlaying);
        video.addEventListener('loadedmetadata', function () { if (durEl) durEl.textContent = fmt(video.duration); });
        video.addEventListener('timeupdate', function () {
            if (curEl) curEl.textContent = fmt(video.currentTime);
            if (video.duration) {
                var pct = (video.currentTime / video.duration) * 100;
                if (fill) fill.style.width = pct + '%';
                if (thumb) thumb.style.left = 'calc(' + pct + '% - 6px)';
            }
        });
        video.addEventListener('ended', function () { if (video instanceof HTMLVideoElement) { /* mantiene boton en play */ } });

        document.addEventListener('keydown', function (e) {
            if (overlay.classList.contains('mjv-open')) {
                if (e.key === 'Escape') closePlayer();
                if (e.key === ' ') { e.preventDefault(); togglePlay(); }
            }
        });
    }

    function setPlaying() {
        var isPlay = video.paused;
        if (svgPlay) svgPlay.style.display = isPlay ? 'block' : 'none';
        if (svgPause) svgPause.style.display = isPlay ? 'none' : 'block';
        if (lblPlay) lblPlay.textContent = isPlay ? 'play_arrow' : 'pause';
    }

    function togglePlay() {
        if (!video.currentSrc) return;
        if (video.paused) { video.play().catch(function () { }); } else { video.pause(); }
    }

    function closePlayer() {
        if (!overlay) return;
        overlay.classList.remove('mjv-open');
        document.body.style.overflow = '';
        video.pause();
    }

    window.openVideoPlayer = function (key, startOverride) {
        var cfg = MJ_VIDEOS[key];
        if (!cfg || !overlay) return;
        if (titleEl) titleEl.textContent = cfg.title;
        if (subEl) subEl.textContent = cfg.subtitle;
        var start = (typeof startOverride === 'number') ? startOverride : cfg.start;
        video.src = mediaUrl(cfg.src);
        video.poster = mediaUrl(cfg.poster || '');
        fill.style.width = '0%';
        thumb.style.left = '-6px';
        if (curEl) curEl.textContent = '00:00';
        if (durEl) durEl.textContent = '00:00';
        overlay.classList.add('mjv-open');
        document.body.style.overflow = 'hidden';
        var onMeta = function () {
            video.removeEventListener('loadedmetadata', onMeta);
            if (start > 0) video.currentTime = start;
            video.play().catch(function () { });
        };
        video.addEventListener('loadedmetadata', onMeta);
    };

    window.closeVideoPlayer = closePlayer;

    function playerMarkup() {
        return '' +
            '<div id="mjVideoOverlay" class="mjv-overlay" role="dialog" aria-modal="true" aria-label="Reproductor de video">' +
            '<div class="mjv-panel">' +
            '<div class="mjv-head">' +
            '<div class="mjv-head-left">' +
            '<span class="mjv-eyebrow">Misión Juvenil · En Video</span>' +
            '<span id="mjVTitle" class="mjv-title">Documental MJ5</span>' +
            '<span id="mjVSubtitle" class="mjv-subtitle">Distrito 5</span>' +
            '</div>' +
            '<button id="mjVClose" class="mjv-btn mjv-btn-close" aria-label="Cerrar reproductor"><span class="material-symbols-outlined">close</span></button>' +
            '</div>' +
            '<video id="mjVideoEl" class="mjv-video" playsinline controlslist="nodownload"></video>' +
            '<div class="mjv-controls">' +
            '<div class="mjv-row">' +
            '<span id="mjVCurTime" class="mjv-time">00:00</span>' +
            '<div id="mjVScrub" class="mjv-scrub"><div id="mjVFill" class="mjv-fill"></div><div id="mjVThumb" class="mjv-thumb"></div></div>' +
            '<span id="mjVDur" class="mjv-time">00:00</span>' +
            '</div>' +
            '<div class="mjv-row mjv-buttons">' +
            '<button id="mjVBack" class="mjv-btn" aria-label="Retroceder 15 segundos"><span class="material-symbols-outlined">replay</span></button>' +
            '<button id="mjVPlay" class="mjv-btn mjv-btn-play" aria-label="Reproducir / Pausar">' +
            '<svg id="mjVPlayIcon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>' +
            '<svg id="mjVPauseIcon" style="display:none" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>' +
            '</button>' +
            '<button id="mjVFwd" class="mjv-btn" aria-label="Avanzar 15 segundos"><span class="material-symbols-outlined">forward_media</span></button>' +
            '<button id="mjVSpeed" class="mjv-btn mjv-speed" aria-label="Velocidad">1x</button>' +
            '<button id="mjVDownload" class="mjv-btn" aria-label="Descargar video"><span class="material-symbols-outlined">download</span></button>' +
            '<button id="mjVFull" class="mjv-btn" aria-label="Pantalla completa"><span class="material-symbols-outlined">fullscreen</span></button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function requirePlayerCss() {
        return '' +
            '.mjv-overlay{position:fixed;inset:0;z-index:9999;background:rgba(10,16,20,.88);display:none;align-items:center;justify-content:center;padding:16px;overflow:auto}' +
            '.mjv-overlay.mjv-open{display:flex}' +
            '.mjv-panel{width:min(940px,100%);background:#26323C;border:3px solid #F58634;box-shadow:0 10px 40px rgba(0,0,0,.55);display:flex;flex-direction:column}' +
            '.mjv-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px 14px;background:linear-gradient(180deg,#1F2E3D,#26323C);border-bottom:2px solid rgba(255,255,255,.12)}' +
            '.mjv-head-left{display:flex;flex-direction:column;gap:2px;min-width:0}' +
            '.mjv-eyebrow{font-family:"Nunito Sans",sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.18em;font-size:10px;color:#F58634}' +
            '.mjv-title{font-family:"Nunito Sans",sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;font-size:16px;line-height:1.1;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            '.mjv-subtitle{font-family:"Nunito Sans",sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:.08em;font-size:10px;color:#B9C2CC}' +
            '.mjv-video{width:100%;aspect-ratio:16/9;background:#000;display:block}' +
            '.mjv-controls{padding:12px 14px;display:flex;flex-direction:column;gap:10px}' +
            '.mjv-row{display:flex;align-items:center;gap:10px}' +
            '.mjv-buttons{justify-content:center;flex-wrap:wrap}' +
            '.mjv-time{font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:11px;color:#fff;min-width:38px;text-align:center}' +
            '.mjv-scrub{flex:1;height:12px;background:#161F26;border:2px solid #39464F;position:relative;cursor:pointer}' +
            '.mjv-fill{position:absolute;left:0;top:0;height:100%;width:0;background:#F58634}' +
            '.mjv-thumb{position:absolute;top:50%;transform:translateY(-50%);width:12px;height:12px;background:#fff;border:2px solid #F58634;left:-6px}' +
            '.mjv-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:#39464F;border:2px solid #4A5863;color:#fff;cursor:pointer;box-shadow:0 3px 0 #1A222A;transition:transform .05s ease,box-shadow .05s ease}' +
            '.mjv-btn:hover{background:#4A5863}' +
            '.mjv-btn:active{transform:translateY(3px);box-shadow:0 0 0 #1A222A}' +
            '.mjv-btn .material-symbols-outlined{font-size:18px}' +
            '.mjv-btn-play{width:48px;height:48px;background:#F58634;border-color:#C86018;box-shadow:0 4px 0 #C86018;border-radius:0}' +
            '.mjv-btn-play svg{width:24px;height:24px;fill:#fff;display:block}' +
            '.mjv-btn-close{background:#F58634;border-color:#C86018;box-shadow:0 3px 0 #C86018;width:38px;height:38px}' +
            '.mjv-speed{font-family:"Nunito Sans",sans-serif;font-weight:900;font-size:11px;text-transform:uppercase}' +
            '.mjv-panel:fullscreen{width:100vw;height:100vh;border-radius:0}' +
            '.mjv-panel:fullscreen .mjv-video{flex:1}' +
            '.mjv-panel:fullscreen .mjv-controls{position:static}' +
            '*,.mjv-panel,.mjv-video,.mjv-controls,.mjv-head{-webkit-border-radius:0!important;-moz-border-radius:0!important;border-radius:0!important}';
    }
})();