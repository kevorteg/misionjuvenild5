(function () {
    if (window.__mjd5MenuInitialized) return;
    window.__mjd5MenuInitialized = true;

    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').replace(/^\//, '');

    const navItems = [
        ['index.html', 'Inicio'],
        ['quienes-somos.html', '¿Quiénes Somos?'],
        ['impacto.html', '¿Qué Hacemos?'],
        ['calendario.html', 'Calendario']
    ];

    const isActive = (page) => currentPage === page || (page === 'index.html' && currentPage === '');

    const canUseMaterial = true;

    const icon = (name) => `
        <span class="material-symbols-outlined" aria-hidden="true">${name}</span>
    `;

    const navLink = (page, label, extraClass = '') => `
        <a class="${extraClass} hover:text-primary transition-colors py-2 ${isActive(page) ? 'text-primary border-b-2 border-primary' : ''}" href="${page}">${label}</a>
    `;

    const menuMarkup = `
    <div data-menu-topbar="shared" class="w-full bg-primary-container text-white text-xs font-semibold py-2 px-4 lg:px-8 border-b border-[#3684B3] relative z-50">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div class="flex items-center flex-wrap gap-4 sm:gap-6 font-body">
                <a class="inline-flex items-center gap-2 hover:text-white/80 transition-colors" href="mailto:info@misionjuvenild5.com">
                    <svg class="w-3.5 h-3.5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                    </svg>
                    <span>info@misionjuvenild5.com</span>
                </a>
                <a class="inline-flex items-center gap-2 hover:text-white/80 transition-colors" href="https://wa.me/573137159439" target="_blank" rel="noopener">
                    <svg class="w-3.5 h-3.5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path>
                    </svg>
                    <span>WhatsApp</span>
                </a>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-[11px] uppercase tracking-wider text-white/80 font-headline hidden md:inline">Síguenos:</span>
                <a aria-label="Instagram" class="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors" href="https://www.instagram.com/misionjuvenil_d5" target="_blank" rel="noopener">
                    <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                    </svg>
                </a>
                <a aria-label="Facebook" class="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors" href="https://www.facebook.com/MisionJuvenilD5" target="_blank" rel="noopener">
                    <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"></path>
                    </svg>
                </a>
                <a aria-label="YouTube" class="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors" href="https://www.youtube.com/@MisionJuvenil-ey7ql" target="_blank" rel="noopener">
                    <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                    </svg>
                </a>
                <a aria-label="Spotify" class="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors" href="https://open.spotify.com/show/74uFkpw2U8yMsExF5hXlPR" target="_blank" rel="noopener">
                    <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"></path>
                    </svg>
                </a>
            </div>
        </div>
    </div>

    <header class="sticky top-0 z-40 w-full bg-white border-b-2 border-slate-200 shadow-sm px-4 lg:px-8">
        <div class="max-w-7xl mx-auto h-20 flex items-center justify-between gap-6">
            <a class="flex items-center group flex-shrink-0" href="index.html">
                <img alt="Misión Juvenil D5" class="h-10 w-auto object-contain transition-transform group-hover:scale-105" src="media/img/logos/FULL.png">
            </a>

            <nav class="hidden xl:flex items-center gap-6 font-headline font-extrabold text-sm uppercase tracking-wider text-neutral-700">
                ${navItems.map(([page, label]) => navLink(page, label, page === 'index.html' ? 'text-primary border-b-2 border-primary' : '')).join('')}

                <div class="relative group py-2">
                    <a class="inline-flex items-center gap-1 hover:text-primary transition-colors uppercase font-headline font-extrabold text-sm focus:outline-none" href="#un-click">
                        <span>A un Click</span>
                        <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </a>
                    <div class="nav-dropdown nav-dropdown--wide absolute top-full pt-2 z-50" style="left:50%;width:min(64vw,820px);min-width:620px;max-width:820px;transform:translateX(-50%)">
                        <div class="bg-white border-[3px] border-neutral-200 shadow-[0_10px_30px_-12px_rgba(17,29,38,0.35)]">
                            <div class="flex items-center justify-between gap-4 px-5 py-3.5 bg-secondary-orange border-b-[3px] border-secondary-dark">
                                <div>
                                    <p class="font-headline font-black text-white text-[12px] uppercase tracking-wider leading-tight">Misión Juvenil A un Click</p>
                                    <p class="text-[9px] font-bold uppercase tracking-widest text-white/85 mt-1">El podcast oficial · episodio nuevo cada semana</p>
                                </div>
                                <a href="podcast.html" class="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-white text-secondary-dark border-2 border-secondary-dark font-headline font-black text-[10px] uppercase tracking-wider shadow-[0_3px_0_#C86018] hover:translate-y-0.5 hover:shadow-none active:translate-y-1 active:shadow-none transition-all">Ver todos</a>
                            </div>
                            <div class="flex gap-5 p-4 sm:p-5">
                                <div class="flex-1 min-w-0 border-r-[3px] border-neutral-100 pr-4 sm:pr-5">
                                    <p class="pb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-neutral-400">A un Click</p>
                                    <div class="divide-y divide-neutral-100">
                                        <a href="podcast.html" class="flex items-center gap-2.5 py-2.5 hover:bg-neutral-50 focus-visible:bg-neutral-50 transition-colors">
                                            <span class="material-symbols-outlined !text-lg text-secondary-orange flex-shrink-0">music_note</span>
                                            <span class="min-w-0 flex-1"><span class="block font-headline font-black text-[9px] uppercase tracking-wide text-neutral-800 leading-snug">Podcast D5 Fuego</span><span class="mt-0.5 block text-[8px] font-black uppercase tracking-wider text-neutral-400">Todos los episodios</span></span>
                                        </a>
                                        <a href="recursos.html" class="flex items-center gap-2.5 py-2.5 hover:bg-neutral-50 focus-visible:bg-neutral-50 transition-colors">
                                            <span class="material-symbols-outlined !text-lg text-primary flex-shrink-0">menu_book</span>
                                            <span class="min-w-0 flex-1"><span class="block font-headline font-black text-[9px] uppercase tracking-wide text-neutral-800 leading-snug">Recursos &amp; Guías</span><span class="mt-0.5 block text-[8px] font-black uppercase tracking-wider text-neutral-400">Para tu crecimiento</span></span>
                                        </a>
                                        <a href="muro-espiritual.html" class="flex items-center gap-2.5 py-2.5 hover:bg-neutral-50 focus-visible:bg-neutral-50 transition-colors">
                                            <span class="material-symbols-outlined !text-lg text-primary flex-shrink-0">volunteer_activism</span>
                                            <span class="min-w-0 flex-1"><span class="block font-headline font-black text-[9px] uppercase tracking-wide text-neutral-800 leading-snug">Muro Espiritual</span><span class="mt-0.5 block text-[8px] font-black uppercase tracking-wider text-neutral-400">Oración y peticiones</span></span>
                                        </a>
                                        <a href="digital.html" class="flex items-center gap-2.5 py-2.5 hover:bg-neutral-50 focus-visible:bg-neutral-50 transition-colors">
                                            <span class="material-symbols-outlined !text-lg text-primary flex-shrink-0">bolt</span>
                                            <span class="min-w-0 flex-1"><span class="block font-headline font-black text-[9px] uppercase tracking-wide text-neutral-800 leading-snug">A un Click Digital</span><span class="mt-0.5 block text-[8px] font-black uppercase tracking-wider text-neutral-400">Contenido breve</span></span>
                                        </a>
                                        <a href="https://open.spotify.com/show/74uFkpw2U8yMsExF5hXlPR" target="_blank" rel="noopener" class="flex items-center gap-2.5 py-2.5 hover:bg-neutral-50 focus-visible:bg-neutral-50 transition-colors">
                                            <span class="material-symbols-outlined !text-lg text-primary flex-shrink-0">podcasts</span>
                                            <span class="min-w-0 flex-1"><span class="block font-headline font-black text-[9px] uppercase tracking-wide text-neutral-800 leading-snug">Escuchar en Spotify</span><span class="mt-0.5 block text-[8px] font-black uppercase tracking-wider text-neutral-400">Streaming oficial</span></span>
                                        </a>
                                    </div>
                                </div>
                                <div class="w-[260px] shrink-0">
                                    <p class="pb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-neutral-400">Podcast destacado</p>
                                    <div class="space-y-3">
                                        <a href="podcast.html" class="group flex items-center gap-3 rounded-xl border-[2px] border-neutral-100 bg-neutral-50 p-2.5 transition-colors hover:border-secondary-orange hover:bg-orange-50"><span class="relative flex-shrink-0"><img src="media/audio/podcasts/minuatura ep 8.jpg" alt="Carátula del episodio 08" class="w-14 h-14 object-cover border-2 border-neutral-200"><span class="absolute -top-1.5 -left-1.5 px-1 py-0.5 font-headline font-black text-[8px] uppercase tracking-wider text-white bg-secondary-orange shadow-[0_2px_0_#C86018]">Ep 08</span></span><span class="min-w-0 flex-1"><span class="block font-headline font-black text-[10px] uppercase tracking-tight text-neutral-800 leading-snug">El Poder del Propósito</span><span class="mt-0.5 block text-[8px] font-black uppercase tracking-[0.16em] text-neutral-400">Propósito y fe</span></span></a>
                                        <a href="podcast.html" class="group flex items-center gap-3 rounded-xl border-[2px] border-neutral-100 bg-neutral-50 p-2.5 transition-colors hover:border-primary hover:bg-blue-50"><span class="relative flex-shrink-0"><img src="media/img/podcasts/minuatura ep 6.jpg" alt="Carátula del episodio 06" class="w-14 h-14 object-cover border-2 border-neutral-200"><span class="absolute -top-1.5 -left-1.5 px-1 py-0.5 font-headline font-black text-[8px] uppercase tracking-wider text-white bg-primary shadow-[0_2px_0_#02557D]">Ep 06</span></span><span class="min-w-0 flex-1"><span class="block font-headline font-black text-[10px] uppercase tracking-tight text-neutral-800 leading-snug">Silenciar el Ruido Interior</span><span class="mt-0.5 block text-[8px] font-black uppercase tracking-[0.16em] text-neutral-400">Descanso mental</span></span></a>
                                    </div>
                                    <div class="mt-4 border-t-[2px] border-neutral-100 pt-3"><p class="pb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-neutral-400">Descargables</p><div class="space-y-2 text-[10px] font-black uppercase tracking-wide text-neutral-700"><a href="recursos.html" class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 hover:border-primary hover:bg-blue-50">Guía de atención emocional</a><a href="recursos.html" class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 hover:border-primary hover:bg-blue-50">Checklist de oración y disciplina</a></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="relative group py-2">
                    <a class="inline-flex items-center gap-1 hover:text-primary transition-colors uppercase font-headline font-extrabold text-sm focus:outline-none" href="#servicios">
                        <span>Servicios</span>
                        <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </a>
                    <div class="nav-dropdown absolute top-full left-0 w-72 pt-2 z-50">
                        <div class="bg-white rounded-2xl p-2.5 border-[3px] border-neutral-200 shadow-[0_6px_0_#D5D5D5] space-y-1">
                            <a class="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all" href="salud-mental.html">
                                <img loading="lazy" class="w-14 h-11 rounded-lg object-cover flex-shrink-0" src="media/img/FOTOS HOME/about-mj.jpg" alt="Salud mental">
                                <div class="min-w-0">
                                    <span class="block text-xs font-black text-neutral-800">Salud Mental</span>
                                    <span class="block text-[10px] text-neutral-500 lowercase">Acompañamiento</span>
                                </div>
                            </a>
                            <a class="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all" href="colegios.html">
                                <img loading="lazy" class="w-14 h-11 rounded-lg object-cover flex-shrink-0" src="media/img/fotos colegios/IMG_20241120_081622.jpg" alt="Colegios">
                                <div class="min-w-0">
                                    <span class="block text-xs font-black text-neutral-800">Colegios</span>
                                    <span class="block text-[10px] text-neutral-500 lowercase">Pastoral</span>
                                </div>
                            </a>
                            <a class="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all" href="universidades.html">
                                <img loading="lazy" class="w-14 h-11 rounded-lg object-cover flex-shrink-0" src="media/img/Universidades fotos/Univalle_melendez/Melendez1.jpg" alt="Universidades">
                                <div class="min-w-0">
                                    <span class="block text-xs font-black text-neutral-800">Universidades</span>
                                    <span class="block text-[10px] text-neutral-500 lowercase">Círculos</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <a class="hover:text-primary transition-colors py-2" href="contacto.html">Contacto</a>
            </nav>

            <div class="flex items-center gap-3 flex-shrink-0">
                <a class="hidden xl:inline-flex btn-3d btn-3d-orange px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl font-headline font-black text-sm uppercase tracking-wider items-center gap-2" href="https://chat.whatsapp.com/FDTf5jQ5yfF4xSTOev0JeT" target="_blank" rel="noopener">
                    <span>¡UNIRME AHORA!</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
                <a class="mobile-join-action xl:hidden" href="https://chat.whatsapp.com/FDTf5jQ5yfF4xSTOev0JeT" target="_blank" rel="noopener" aria-label="Unirme ahora">
                    <span class="material-symbols-outlined">group_add</span>
                </a>
                <button id="menuToggle" class="xl:hidden btn-3d btn-3d-white w-11 h-11 rounded-2xl flex items-center justify-center" aria-label="Abrir navegación" aria-expanded="false">
                    <span class="material-symbols-outlined text-2xl" id="menuIcon">menu</span>
                </button>
            </div>
        </div>

        <div id="mobileMenu" class="hidden xl:hidden" aria-hidden="true">
            <div class="mobile-menu-shell font-headline font-extrabold text-sm uppercase tracking-wider text-neutral-700">
                <div class="mobile-menu-topline">
                    <div>
                        <p class="text-[10px] font-black tracking-[0.18em] text-secondary-orange">MISIÓN JUVENIL D5</p>
                        <p class="mt-1 text-base font-black text-neutral-900">NAVEGACIÓN</p>
                    </div>
                    <button id="mobileMenuClose" class="btn-3d btn-3d-white w-10 h-10 flex items-center justify-center" type="button" aria-label="Cerrar navegación">
                        <span class="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>
                <p class="mobile-app-section">PRINCIPAL</p>
                <a class="mobile-app-link ${isActive('index.html') ? 'text-primary' : ''}" href="index.html"><span>Inicio</span><span class="material-symbols-outlined">home</span></a>
                <a class="mobile-app-link ${isActive('quienes-somos.html') ? 'text-primary' : ''}" href="quienes-somos.html"><span>Quiénes somos</span><span class="material-symbols-outlined">groups</span></a>
                <a class="mobile-app-link ${isActive('impacto.html') ? 'text-primary' : ''}" href="impacto.html"><span>Qué hacemos</span><span class="material-symbols-outlined">insights</span></a>
                <a class="mobile-app-link ${isActive('calendario.html') ? 'text-primary' : ''}" href="calendario.html"><span>Calendario</span><span class="material-symbols-outlined">event</span></a>
                <p class="mobile-app-section">A UN CLICK</p>
                <a class="mobile-app-link ${isActive('podcast.html') ? 'text-primary' : ''}" href="podcast.html"><span>Podcast D5</span><span class="material-symbols-outlined">podcasts</span></a>
                <a class="mobile-app-link ${isActive('recursos.html') ? 'text-primary' : ''}" href="recursos.html"><span>Recursos</span><span class="material-symbols-outlined">menu_book</span></a>
                <a class="mobile-app-link ${isActive('muro-espiritual.html') ? 'text-primary' : ''}" href="muro-espiritual.html"><span>Muro espiritual</span><span class="material-symbols-outlined">volunteer_activism</span></a>
                <a class="mobile-app-link ${isActive('digital.html') ? 'text-primary' : ''}" href="digital.html"><span>A un Click</span><span class="material-symbols-outlined">bolt</span></a>
                <p class="mobile-app-section">SERVICIOS</p>
                <a class="mobile-app-link ${isActive('salud-mental.html') ? 'text-primary' : ''}" href="salud-mental.html"><span>Salud mental</span><span class="material-symbols-outlined">psychology</span></a>
                <a class="mobile-app-link ${isActive('colegios.html') ? 'text-primary' : ''}" href="colegios.html"><span>Colegios</span><span class="material-symbols-outlined">school</span></a>
                <a class="mobile-app-link ${isActive('universidades.html') ? 'text-primary' : ''}" href="universidades.html"><span>Universidades</span><span class="material-symbols-outlined">account_balance</span></a>
            </div>
        </div>
    </header>
    `;

    const existingHeader = document.querySelector('header');
    const pageHasTopbar = Boolean(existingHeader && existingHeader.previousElementSibling?.classList.contains('bg-primary-container'));
    if (existingHeader) {
        existingHeader.outerHTML = menuMarkup;
    } else {
        document.body.insertAdjacentHTML('beforeend', menuMarkup);
    }
    if (pageHasTopbar) {
        document.querySelector('[data-menu-topbar="shared"]')?.remove();
    }

    const menu = document.getElementById('mobileMenu');
    const toggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('mobileMenuClose');

    if (toggle && menu) {
        const setMenu = (open) => {
            menu.classList.toggle('hidden', !open);
            menu.setAttribute('aria-hidden', String(!open));
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
            const icon = document.getElementById('menuIcon');
            if (icon) icon.textContent = open ? 'close' : 'menu';
            document.body.classList.toggle('mobile-menu-open', open);
        };

        toggle.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
        if (menuClose) menuClose.addEventListener('click', () => setMenu(false));
        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    }

    const maybeBottomNav = document.querySelector('.mobile-bottom-nav');
    if (!maybeBottomNav && document.querySelector('header')) {
        const bottomNav = document.createElement('nav');
        bottomNav.className = 'mobile-bottom-nav';
        bottomNav.setAttribute('aria-label', 'Navegación principal móvil');
        bottomNav.innerHTML = `
            <a class="${isActive('index.html') ? 'active' : ''}" href="index.html"><span class="material-symbols-outlined">home</span><span>Inicio</span></a>
            <a class="${isActive('podcast.html') ? 'active' : ''}" href="podcast.html"><span class="material-symbols-outlined">podcasts</span><span>Podcast</span></a>
            <a class="${isActive('recursos.html') ? 'active' : ''}" href="recursos.html"><span class="material-symbols-outlined">menu_book</span><span>Recursos</span></a>
            <button class="${!['index.html', 'podcast.html', 'recursos.html'].includes(currentPage) ? 'active' : ''}" type="button" id="mobileBottomMenu" aria-label="Abrir más opciones"><span class="material-symbols-outlined">apps</span><span>Más</span></button>
        `;
        document.body.appendChild(bottomNav);

        const moreButton = document.getElementById('mobileBottomMenu');
        if (moreButton) {
            moreButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (toggle) setMenu(true);
            });
        }
    }
})();
