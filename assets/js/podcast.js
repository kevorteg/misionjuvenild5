// Podcast Player & Dynamic Rendering Logic

let currentAudio = null;

// Audio player control
function toggleAudio(url, episodeId) {
    const playerBar = document.getElementById('custom-player');
    const audio = document.getElementById('audio-engine');

    if (currentAudio === url) {
        if (audio.paused) {
            audio.play();
            updatePlayIcons(episodeId, 'pause_circle');
        } else {
            audio.pause();
            updatePlayIcons(episodeId, 'play_circle');
        }
    } else {
        // Reset old icons
        updatePlayIcons(null, 'play_circle');

        audio.src = url;
        audio.play();
        updatePlayIcons(episodeId, 'pause_circle');

        currentAudio = url;
        playerBar.classList.add('active');
        playerBar.style.transform = 'translateY(0)';

        updatePlayerBarInfo(episodeId);
        updateHeroEpisode(episodeId); // Update hero when playing

        // Auto-scroll to Hero
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updatePlayIcons(activeId, iconType) {
    document.querySelectorAll('.episode-card').forEach(card => {
        const icon = card.querySelector('.material-symbols-outlined:not(.fill)');
        if (icon) icon.textContent = 'play_circle';
    });

    if (activeId) {
        const activeCards = document.querySelectorAll(`[onclick*="playEpisode('${activeId}')"]`);
        activeCards.forEach(card => {
            const icon = card.querySelector('.material-symbols-outlined:not(.fill)');
            if (icon) icon.textContent = iconType;
        });
    }
}

function updatePlayerBarInfo(id) {
    const ep = podcastEpisodes.find(e => e.id === id);
    if (!ep) return;

    const barImg = document.getElementById('player-thumb');
    const barTitle = document.getElementById('player-title');
    const barMeta = document.getElementById('player-category');

    if (barImg) barImg.src = ep.image;
    if (barTitle) barTitle.textContent = ep.title;
    if (barMeta) barMeta.textContent = `${ep.category} • ${ep.date}`;
    if (barMeta) barMeta.classList.add('text-white/60'); // Ensure visibility
}

function playEpisode(id) {
    const ep = podcastEpisodes.find(e => e.id === id);
    if (ep) {
        toggleAudio(ep.audio, id);
    }
}

// Global state
let currentCategory = 'all';
let currentView = 'grid';

function renderEpisodes() {
    const container = document.getElementById('episodes-container');
    if (!container) return;

    container.innerHTML = '';

    podcastEpisodes.forEach(ep => {
        const article = document.createElement('article');
        article.className = 'episode-card group relative flex flex-col gap-5 p-4 rounded-[40px] bg-white/5 hover:bg-white/[0.08] border border-white/5 transition-all cursor-pointer';
        article.dataset.category = ep.category;
        article.setAttribute('onclick', `playEpisode('${ep.id}')`);

        if (currentCategory !== 'all' && ep.category !== currentCategory) {
            article.style.display = 'none';
        }

        article.innerHTML = `
            <div class="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-[#1a1523] flex items-center justify-center image-container">
                <img src="${ep.image}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <span class="material-symbols-outlined text-white !text-6xl">play_circle</span>
                </div>
                <div class="category-badge-grid absolute top-4 left-4 ${getCategoryColor(ep.category)} text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-20">
                    ${ep.category}
                </div>
            </div>
            <div class="px-2 pb-2 flex flex-col gap-2">
                <div class="category-badge-list hidden ${getCategoryColor(ep.category)} text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest w-fit">
                    ${ep.category}
                </div>
                <h4 class="text-xl font-bold text-white group-hover:text-brand transition-colors italic leading-tight">
                    ${ep.title}
                </h4>
                <div class="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>${ep.date}</span>
                    <span class="text-brand">${ep.duration}</span>
                </div>
            </div>
        `;
        container.appendChild(article);
    });
}

function getCategoryColor(cat) {
    const colors = {
        'Apocalipsis': 'bg-[#449BD1]',
        'Espiritualidad': 'bg-brand',
        'Vida Cristiana': 'bg-secondary',
        'Salud Mental': 'bg-red-500/80',
        'Juventud': 'bg-orange-500/80'
    };
    return colors[cat] || 'bg-slate-500';
}

function updateHeroEpisode(id) {
    // If id is provided, find that episode, else use featured/first
    const heroEp = id ? podcastEpisodes.find(e => e.id === id) : (podcastEpisodes.find(e => e.featured) || podcastEpisodes[0]);
    if (!heroEp) return;

    const heroImg = document.getElementById('hero-image');
    const heroTitle = document.getElementById('hero-title');
    const heroDesc = document.getElementById('hero-desc');
    const heroMeta = document.getElementById('hero-meta');
    const heroBtn = document.getElementById('hero-play-btn');
    const heroBg = document.getElementById('hero-bg-trigger');

    if (heroImg) {
        heroImg.style.opacity = '0';
        setTimeout(() => {
            heroImg.src = heroEp.image;
            heroImg.style.opacity = '1';
        }, 300);
    }

    if (heroTitle) {
        heroTitle.innerHTML = `${heroEp.title.split('|')[0]} | <span class="text-white/80">${heroEp.title.split('|')[1] || ''}</span>`;
    }
    if (heroDesc) heroDesc.textContent = heroEp.description;
    if (heroMeta) {
        const metaSpan = heroMeta.querySelector('span:last-child');
        if (metaSpan) {
            metaSpan.textContent = id ? `Reproduciendo Ahora • ${heroEp.category}` : `Último Lanzamiento • ${heroEp.date}`;
            heroMeta.classList.remove('text-brand');
            heroMeta.classList.add('text-white'); // Fix blue/dark text issue
        }
    }
    if (heroBtn) {
        heroBtn.setAttribute('onclick', `playEpisode('${heroEp.id}')`);
        // Reset button state on episode change
        heroBtn.querySelector('span:last-child').textContent = 'Escuchar Podcast';
        heroBtn.querySelector('span:first-child').textContent = 'play_circle';
    }
    if (heroBg) heroBg.setAttribute('onclick', `playEpisode('${heroEp.id}')`);

    // Toggle NEW badge visibility
    const newBadge = document.getElementById('hero-badge-new');
    if (newBadge) {
        newBadge.style.display = heroEp.isNew ? 'block' : 'none';
    }

    // Sync visual state with actual audio engine
    const audio = document.getElementById('audio-engine');
    const heroTrigger = document.getElementById('hero-bg-trigger');
    if (audio && heroTrigger) {
        if (!audio.paused && audio.src.includes(heroEp.audio)) {
            heroTrigger.classList.add('is-playing');
            heroTrigger.classList.remove('is-paused');
        } else {
            heroTrigger.classList.remove('is-playing');
            heroTrigger.classList.remove('is-paused');
        }
    }
}

function filterEpisodes(category, btn) {
    currentCategory = category;

    // Update active button styles
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-brand', 'text-black', 'border-brand');
        b.classList.add('bg-white/5', 'text-slate-200', 'border-white/5');
    });

    btn.classList.add('active', 'bg-brand', 'text-black', 'border-brand');
    btn.classList.remove('bg-white/5', 'text-slate-200', 'border-white/5');

    renderEpisodes();
}

function switchView(view, btn) {
    currentView = view;
    const container = document.getElementById('episodes-container');
    document.querySelectorAll('.view-btn').forEach(b => {
        b.classList.remove('active', 'bg-white/10', 'text-brand');
        b.classList.add('text-slate-500');
    });
    btn.classList.add('active', 'bg-white/10', 'text-brand');
    btn.classList.remove('text-slate-500');

    if (view === 'list') {
        container.classList.add('list-view');
        container.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    } else {
        container.classList.remove('list-view');
        container.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    }
}

// Player functions
function togglePlay() {
    const audio = document.getElementById('audio-engine');
    const btnIcon = document.querySelector('#main-play-btn span');
    if (!audio) return;

    if (audio.paused) {
        audio.play();
        if (btnIcon) btnIcon.textContent = 'pause';
    } else {
        audio.pause();
        if (btnIcon) btnIcon.textContent = 'play_arrow';
    }
}

function updateProgress() {
    const audio = document.getElementById('audio-engine');
    const progress = document.getElementById('progress-bar');
    const dot = document.getElementById('progress-dot');
    const currentTimeEl = document.getElementById('current-time');

    if (!audio || !progress) return;

    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    if (dot) dot.style.left = `${percent}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function seekTo(event) {
    const audio = document.getElementById('audio-engine');
    const container = document.getElementById('progress-bar-container');
    if (!audio || !container) return;

    const rect = container.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
}

function setVolume(val) {
    const audio = document.getElementById('audio-engine');
    if (audio) audio.volume = val;
}

function toggleMute() {
    const audio = document.getElementById('audio-engine');
    const icon = document.getElementById('volume-icon');
    if (!audio) return;

    if (audio.muted) {
        audio.muted = false;
        if (icon) icon.textContent = 'volume_up';
    } else {
        audio.muted = true;
        if (icon) icon.textContent = 'volume_off';
    }
}

function closePlayer() {
    const playerBar = document.getElementById('custom-player');
    const audio = document.getElementById('audio-engine');
    if (playerBar) playerBar.style.transform = 'translateY(100%)';
    if (audio) audio.pause();
    updatePlayIcons(null, 'play_circle');
}

function downloadCurrentAudio() {
    const audio = document.getElementById('audio-engine');
    if (audio && audio.src) {
        // Find metadata for current audio to get a nice title
        const ep = podcastEpisodes.find(e => audio.src.includes(encodeURI(e.audio)) || audio.src.includes(e.audio));
        const filename = ep ? ep.title : 'Podcast-MJ';
        handleDownload(audio.src, filename);
    }
}

/**
 * ROBUST DOWNLOAD FUNCTION - Global Fix
 */
async function handleDownload(url, filename) {
    if (!url || url === '#' || url === 'undefined') {
        console.warn('Invalid download URL');
        return;
    }

    const extension = url.split('.').pop().split(/[?#]/)[0] || 'mp3';
    let cleanName = filename.replace(/[/\\?%*:|"<>]/g, '-').trim();
    if (!cleanName.toLowerCase().endsWith('.' + extension.toLowerCase())) {
        cleanName += '.' + extension;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();

        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = cleanName;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        }, 300);
    } catch (error) {
        console.warn("Fallback download used:", error);
        const a = document.createElement('a');
        a.href = url;
        a.download = cleanName;
        a.click();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateHeroEpisode();
    renderEpisodes();

    const audio = document.getElementById('audio-engine');
    if (audio) {
        audio.ontimeupdate = updateProgress;
        audio.onloadedmetadata = () => {
            const durationEl = document.getElementById('duration');
            if (durationEl) durationEl.textContent = formatTime(audio.duration);
        };
        audio.onplay = () => {
            const btnIcon = document.querySelector('#main-play-btn span');
            if (btnIcon) btnIcon.textContent = 'pause';

            const heroTrigger = document.getElementById('hero-bg-trigger');
            const heroPlayBtn = document.getElementById('hero-play-btn');

            if (heroTrigger) {
                heroTrigger.classList.add('is-playing');
                heroTrigger.classList.remove('is-paused');
            }

            if (heroPlayBtn) {
                const icon = heroPlayBtn.querySelector('span:first-child');
                const text = heroPlayBtn.querySelector('span:last-child');
                if (icon) icon.textContent = 'pause_circle';
                if (text) text.textContent = 'Reproduciendo...';
                heroPlayBtn.classList.add('bg-white', 'text-brand');
                heroPlayBtn.classList.remove('bg-brand', 'text-black');
            }
        };
        audio.onpause = () => {
            const btnIcon = document.querySelector('#main-play-btn span');
            if (btnIcon) btnIcon.textContent = 'play_arrow';

            const heroTrigger = document.getElementById('hero-bg-trigger');
            const heroPlayBtn = document.getElementById('hero-play-btn');

            if (heroTrigger) {
                heroTrigger.classList.add('is-paused');
            }

            if (heroPlayBtn) {
                const icon = heroPlayBtn.querySelector('span:first-child');
                const text = heroPlayBtn.querySelector('span:last-child');
                if (icon) icon.textContent = 'play_circle';
                if (text) text.textContent = 'Continuar Escuchando';
                heroPlayBtn.classList.remove('bg-white', 'text-brand');
                heroPlayBtn.classList.add('bg-brand', 'text-black');
            }
        };
        audio.onended = () => {
            updatePlayIcons(null, 'play_circle');
        };
    }
});