(function () {
    const footer = document.querySelector('footer');
    if (!footer || footer.querySelector('.footer-socials')) return;

    const campusColumn = [...footer.querySelectorAll('h4')]
        .find(title => title.textContent.includes('CAMPUS'))?.parentElement;
    if (!campusColumn) return;

    campusColumn.insertAdjacentHTML('beforeend', `
        <div class="footer-socials pt-4 mt-4 border-t border-neutral-700">
            <p class="font-headline font-black text-[10px] uppercase tracking-widest text-duo-yellow">REDES OFICIALES</p>
            <div class="flex flex-wrap gap-x-4 gap-y-2 mt-3 font-body font-bold text-[11px] text-neutral-300">
                <a class="footer-social-link inline-flex items-center gap-1.5 hover:text-white transition-colors" href="https://www.instagram.com/misionjuvenil_d5" target="_blank" rel="noopener"><span class="material-symbols-outlined !text-base">photo_camera</span>Instagram</a>
                <a class="footer-social-link inline-flex items-center gap-1.5 hover:text-white transition-colors" href="https://www.facebook.com/MisionJuvenilD5" target="_blank" rel="noopener"><span class="material-symbols-outlined !text-base">groups</span>Facebook</a>
                <a class="footer-social-link inline-flex items-center gap-1.5 hover:text-white transition-colors" href="https://www.youtube.com/@MisionJuvenil-ey7ql" target="_blank" rel="noopener"><span class="material-symbols-outlined !text-base">smart_display</span>YouTube</a>
                <a class="footer-social-link inline-flex items-center gap-1.5 hover:text-white transition-colors" href="https://open.spotify.com/show/74uFkpw2U8yMsExF5hXlPR" target="_blank" rel="noopener"><span class="material-symbols-outlined !text-base">headphones</span>Spotify</a>
            </div>
        </div>`);
})();
