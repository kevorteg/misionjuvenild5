/* Podcast D5 Fuego — Reproducir sticky compartido (home + podcast)
 * Extraído de podcast.html. Las funciones quedan globales para que
 * los `onclick="playEpisode(...)"` inline sigan funcionando. */

// ---- Datos de episodios (assets reales) ----
// El HERO (fondo + cajita) usa SIEMPRE el episodio de mayor número que tenga audio.
// Al agregar un episodio nuevo, cópialo con id epN y ¡el hero se actualiza solo!
// El resto de campos son opcionales: name, cat, date, dur, badge, desc.
var EPISODES = {
    ep9: { title: 'EP 09 | Desafíos que enfrentan los jóvenes cristianos en la academia', name: 'Desafíos que enfrentan los jóvenes cristianos en la academia', audio: 'media/audio/podcasts/podcast-ep9.mp3', img: 'media/audio/podcasts/minuatura ep 9.jpg', cat: 'Vida Universitaria', date: '28 Sep 2026', dur: '1:07:10', badge: 'Episodio 09 • Estreno', desc: 'Desafíos reales que enfrentan los jóvenes cristianos en la academia: identidad, fe y presión del entorno universitario.' },
    ep8: { title: 'EP 08 | El Poder del Propósito', name: 'El Poder del Propósito', audio: 'media/audio/podcasts/podcast-ep8.mp3', img: 'media/audio/podcasts/minuatura ep 8.jpg', cat: 'Devocionales Fuego', date: '12 Sep 2026', dur: '28:44', badge: 'Episodio 08 • Estreno', desc: '¿Para qué estás realmente en la universidad? Hablamos de vocación, miedo al futuro y cómo encontrar el porqué que enciende cada día.' },
    ep1: { title: 'EP 01 | La Primera Conversación', audio: 'media/audio/podcasts/podcast-ep1.mp3', img: 'media/img/podcasts/miniatura ep 1.webp' },
    ep2: { title: 'EP 02 | Inseguridades y Experiencias', audio: 'media/audio/podcasts/podcast-ep2.mp3', img: 'media/img/podcasts/miniatura ep 2.webp' },
    ep3: { title: 'EP 03 | Bienvenido a la U', audio: 'media/audio/podcasts/podcast-ep3.mp3', img: 'media/img/podcasts/minuatura ep 3.jpg' },
    ep5: { title: 'EP 05 | Liderazgo que Enciende', audio: 'media/audio/podcasts/podcast-ep5.mp3', img: 'media/img/podcasts/minuatura ep 5.jpg' },
    ep6: { title: 'EP 06 | Silenciar el Ruido Interior', audio: 'media/audio/podcasts/podcast-ep6.mp3', img: 'media/img/podcasts/minuatura ep 6.jpg' },
    ep7: { title: 'EP 07 | Fe en Primera Línea', audio: 'media/audio/podcasts/podcast-ep7.mp3', img: 'media/img/podcasts/minuatura ep 7.jpg' }
};

// ---- Referencias al reproductor sticky (existen en home y podcast) ----
// Media: cuando los MP3/MP4 viven en Cloudflare R2, ajusta esta constante
// (ej. MJ_MEDIA_BASE = 'https://<bucket>.r2.dev/'; mediaUrl devuelve la URL completa).
var MJ_MEDIA_BASE = 'https://pub-1da551c3ef58478dbee4fc941a3cab52.r2.dev/';
function mediaUrl(p) {
    return MJ_MEDIA_BASE ? MJ_MEDIA_BASE + p : p;
}
var audio = document.getElementById('playerAudio');
var playerTitle = document.getElementById('player-title');
var playerSubtitle = document.getElementById('player-subtitle');
var playerArt = document.getElementById('playerArt');
var playBtn = document.getElementById('playerPlayBtn');
var playIcon = document.getElementById('playerPlayIcon');
var currentTimeEl = document.getElementById('current-time');
var durationEl = document.getElementById('duration');
var scrubFill = document.getElementById('scrubFill');
var scrubThumb = document.getElementById('scrubThumb');
var speedBtn = document.getElementById('playbackSpeedBtn');
var playerBar = document.getElementById('playerBar');
var playerSectionRef = document.getElementById('playerSection');
var toastEl = document.getElementById('toast');
var episodeCardsEl = document.querySelectorAll('.episode-card');

var currentId = 'ep9';
var speeds = [1.0, 1.25, 1.5];
var speedIdx = 0;
var toastTimer = null;

function fmt(sec) {
    if (!isFinite(sec)) return '00:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('opacity-0', 'pointer-events-none');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add('opacity-0', 'pointer-events-none'); }, 2200);
}

function markPlaying(id) {
    episodeCardsEl.forEach(function (c) { c.classList.remove('playing'); });
    var active = document.querySelector('.episode-card[data-id="' + id + '"]');
    if (active) active.classList.add('playing');
}

function playEpisode(id) {
    var ep = EPISODES[id];
    if (!ep) return;
    if (!ep.audio) {
        showToast('EP 07: estreno muy pronto');
        return;
    }
    currentId = id;
    if (playerTitle) playerTitle.textContent = ep.title;
    if (playerSubtitle) playerSubtitle.textContent = 'Podcast D5 Fuego';
    if (playerArt) playerArt.src = ep.img;
    audio.src = mediaUrl(ep.audio);
    audio.currentTime = 0;
    markPlaying(id);
    openPlayer();
    audio.play().then(function () {
        showToast('Reproduciendo ' + ep.title);
    }).catch(function () {
        if (playIcon) playIcon.textContent = 'play_arrow';
        showToast('No se pudo cargar el audio');
    });
}

function getCurrentId() {
    return currentId;
}

function togglePlayState() {
    if (!audio || !audio.src) {
        playEpisode('ep9');
        return;
    }
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

audio.addEventListener('play', function () {
    if (playIcon) playIcon.textContent = 'pause';
});
audio.addEventListener('pause', function () {
    if (playIcon) playIcon.textContent = 'play_arrow';
});

audio.addEventListener('loadedmetadata', function () {
    if (durationEl) durationEl.textContent = fmt(audio.duration);
});
audio.addEventListener('timeupdate', function () {
    if (currentTimeEl) currentTimeEl.textContent = fmt(audio.currentTime);
    if (audio.duration) {
        var pct = (audio.currentTime / audio.duration) * 100;
        if (scrubFill) scrubFill.style.width = pct + '%';
        if (scrubThumb) scrubThumb.style.left = pct + '%';
    }
});
audio.addEventListener('ended', function () {
    if (playIcon) playIcon.textContent = 'play_arrow';
    showToast('Episodio finalizado');
});

function seekRelative(sec) {
    if (!audio.src) {
        playEpisode('ep9');
        return;
    }
    audio.currentTime = Math.min(Math.max(audio.currentTime + sec, 0), audio.duration || 0);
}

function handleScrubClick(e) {
    if (!audio.duration) return;
    var rect = e.currentTarget.getBoundingClientRect();
    var ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
}

function cyclePlaybackSpeed() {
    speedIdx = (speedIdx + 1) % speeds.length;
    audio.playbackRate = speeds[speedIdx];
    if (speedBtn) speedBtn.textContent = speeds[speedIdx].toFixed(2).replace(/\.00$/, '.0') + 'x';
}

// ---- Likes ----
function toggleCardLike(el) {
    var on = el.dataset.liked === '1';
    el.dataset.liked = on ? '0' : '1';
    el.classList.toggle('text-error', !on);
    var counter = el.querySelector('.like-counter');
    if (counter) {
        var val = parseInt(counter.textContent, 10) || 0;
        counter.textContent = on ? val - 1 : val + 1;
    }
    showToast(on ? 'Quitaste tu me gusta' : '¡Gracias por tu me gusta!');
}
function togglePlayerLike() {
    var btn = document.getElementById('playerLikeBtn');
    if (!btn) return;
    var liked = btn.dataset.liked === '1';
    btn.dataset.liked = liked ? '0' : '1';
    var ico = btn.querySelector('.icon-heart');
    if (ico) ico.classList.toggle('!fill-current', !liked);
    btn.classList.toggle('text-secondary-orange', !liked);
    btn.classList.toggle('border-secondary-orange', !liked);
    showToast(liked ? 'Quitado de favoritos' : 'Guardado en tus favoritos');
}

// ---- Descargar / Compartir ----
function downloadAsset(id) {
    var ep = EPISODES[id];
    if (!ep || !ep.audio) {
        showToast('Audio disponible próximamente');
        return;
    }
    var a = document.createElement('a');
    a.href = mediaUrl(ep.audio);
    a.download = ep.title + '.mp3';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Descargando ' + ep.title);
}
function shareCurrentEpisode() {
    var ep = EPISODES[currentId];
    var text = '🎙️ Podcast D5 Fuego | ' + (ep ? ep.title : '') + ' — Misión Juvenil D5';
    if (navigator.share) {
        navigator.share({ title: 'Podcast D5 Fuego', text: text }).catch(function () {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { showToast('Enlace copiado'); });
    } else {
        showToast('Comparte a un amigo');
    }
}

// ---- Minimizar / abrir reproductor ----
function minimizePlayer() {
    if (playerSectionRef) playerSectionRef.classList.remove('hidden');
    if (playerBar) playerBar.style.display = 'none';
    var chip = document.getElementById('miniOpenBtn');
    if (chip) {
        chip.classList.remove('hidden');
        chip.style.display = 'flex';
    }
}
function openPlayer() {
    if (playerSectionRef) playerSectionRef.classList.remove('hidden');
    if (playerBar) playerBar.style.display = '';
    var chip = document.getElementById('miniOpenBtn');
    if (chip) {
        chip.classList.add('hidden');
        chip.classList.remove('flex');
        chip.style.display = '';
    }
}

// ---- HERO DINÁMICO (solo si existe el héroe de podcast.html) ----
function renderLatestEpisode() {
    var ids = Object.keys(EPISODES).filter(function (k) {
        return /^ep\d+$/.test(k) && EPISODES[k].audio;
    });
    if (!ids.length) return;
    ids.sort(function (a, b) { return parseInt(a.slice(2), 10) - parseInt(b.slice(2), 10); });
    var id = ids[ids.length - 1];
    var ep = EPISODES[id];
    var num = id.slice(2);
    var set = function (idEl, v) {
        var el = document.getElementById(idEl);
        if (el) el.textContent = v || '';
    };
    var bg = document.getElementById('hero-bg');
    if (bg) bg.src = ep.img;
    var art = document.getElementById('heroCardArt');
    if (art) {
        art.src = ep.img;
        art.alt = ep.title;
    }
    set('heroCardTitle', ep.name || ep.title.replace(/^EP \d+ \| /, ''));
    set('heroCardCat', ep.cat || 'Podcast D5 Fuego');
    set('heroCardDate', ep.date || '');
    set('heroCardDur', ep.dur || '');
    set('heroCardBadge', ep.badge || ('Episodio ' + num + ' • Nuevo'));
    set('heroCardDesc', ep.desc || '');
    var btn = document.getElementById('heroPlayBtn');
    if (btn) btn.onclick = function () { playEpisode(id); };
}
renderLatestEpisode();

// ---- Autoplay por URL (?episode=ep8&autoplay=1) ----
var requestedEpisode = new URLSearchParams(window.location.search).get('episode');
var shouldAutoplay = new URLSearchParams(window.location.search).get('autoplay') === '1';
if (shouldAutoplay && requestedEpisode && EPISODES[requestedEpisode]) {
    playEpisode(requestedEpisode);
}
