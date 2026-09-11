(function () {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.getElementById('menuToggle');
    if (!menu || !toggle) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = [
        ['index.html', 'Inicio', 'home'],
        ['quienes-somos.html', 'Quiénes somos', 'groups'],
        ['impacto.html', 'Qué hacemos', 'insights'],
        ['podcast.html', 'Podcast D5', 'podcasts'],
        ['recursos.html', 'Recursos', 'menu_book'],
        ['muro-espiritual.html', 'Muro espiritual', 'volunteer_activism'],
        ['digital.html', 'A un Click', 'bolt'],
        ['salud-mental.html', 'Salud mental', 'psychology'],
        ['colegios.html', 'Colegios', 'school'],
        ['universidades.html', 'Universidades', 'account_balance'],
        ['contacto.html', 'Contacto', 'mail']
    ];

    const linkMarkup = (page, label, icon) => `<a class="mobile-app-link${currentPage === page ? ' text-primary' : ''}" href="${page}"><span>${label}</span><span class="material-symbols-outlined">${icon}</span></a>`;
    menu.className = 'hidden xl:hidden mobile-app-menu';
    menu.setAttribute('aria-hidden', 'true');
    menu.innerHTML = `
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
            ${links.slice(0, 3).map(item => linkMarkup(...item)).join('')}
            <p class="mobile-app-section">A UN CLICK</p>
            ${links.slice(3, 7).map(item => linkMarkup(...item)).join('')}
            <p class="mobile-app-section">SERVICIOS</p>
            ${links.slice(7).map(item => linkMarkup(...item)).join('')}
        </div>`;

    document.querySelectorAll('header a[href^="https://chat.whatsapp.com"]').forEach(cta => cta.classList.add('mobile-nav-cta'));
    const headerActions = toggle.parentElement;
    if (headerActions && !headerActions.querySelector('.mobile-join-action')) {
        headerActions.insertAdjacentHTML('afterbegin', '<a class="mobile-join-action" href="https://chat.whatsapp.com/FDTf5jQ5yfF4xSTOev0JeT" target="_blank" rel="noopener" aria-label="Unirme ahora"><span class="material-symbols-outlined">group_add</span></a>');
    }

    const oldToggle = toggle;
    const newToggle = oldToggle.cloneNode(true);
    oldToggle.replaceWith(newToggle);

    const setMenu = (open) => {
        menu.classList.toggle('hidden', !open);
        menu.setAttribute('aria-hidden', String(!open));
        newToggle.setAttribute('aria-expanded', String(open));
        newToggle.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
        document.body.classList.toggle('mobile-menu-open', open);
        const icon = newToggle.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = open ? 'close' : 'menu';
    };

    newToggle.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
    menu.querySelector('#mobileMenuClose').addEventListener('click', () => setMenu(false));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

    const header = document.querySelector('header');
    if (!header) return;
    header.insertAdjacentHTML('afterend', `
        <nav class="mobile-bottom-nav" aria-label="Navegación principal móvil">
            <a class="${currentPage === 'index.html' ? 'active' : ''}" href="index.html"><span class="material-symbols-outlined">home</span><span>Inicio</span></a>
            <a class="${currentPage === 'podcast.html' ? 'active' : ''}" href="podcast.html"><span class="material-symbols-outlined">podcasts</span><span>Podcast</span></a>
            <a class="${currentPage === 'recursos.html' ? 'active' : ''}" href="recursos.html"><span class="material-symbols-outlined">menu_book</span><span>Recursos</span></a>
            <a class="${!['index.html', 'podcast.html', 'recursos.html'].includes(currentPage) ? 'active' : ''}" href="#" id="mobileBottomMenu"><span class="material-symbols-outlined">apps</span><span>Más</span></a>
        </nav>`);

    document.getElementById('mobileBottomMenu').addEventListener('click', event => {
        event.preventDefault();
        setMenu(true);
    });
})();
