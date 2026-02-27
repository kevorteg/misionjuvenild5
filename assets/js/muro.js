/**
 * MURO ESPIRITUAL - LOGIC
 * Dynamic masonry rendering and community interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initMuro();
});

function initMuro() {
    renderTestimonials();
    setupTestimonialForm();
}

function renderTestimonials() {
    const container = document.getElementById('muro-grid');
    if (!container) return;

    container.innerHTML = muroData.map(item => createTestimonialCard(item)).join('');

    // Animate entrance
    gsap.from('.muro-card', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: container,
            start: 'top 80%'
        }
    });
}

function createTestimonialCard(item) {
    const colorClasses = {
        brand: 'border-l-brand hover:shadow-brand/20',
        blue: 'border-l-blue-500 hover:shadow-blue-500/20',
        purple: 'border-l-purple-500 hover:shadow-purple-500/20'
    };

    return `
        <div class="muro-card ${item.size === 'large' ? 'lg:col-span-2' : ''} glass-container p-8 rounded-3xl border-l-[6px] ${colorClasses[item.colorVariant]} transition-all duration-500 hover:-translate-y-2 group">
            <div class="flex justify-between items-start mb-6">
                <span class="material-symbols-outlined text-brand opacity-20 group-hover:opacity-100 transition-opacity text-4xl">format_quote</span>
                <span class="text-[10px] font-bold text-white/20 uppercase tracking-widest">${item.date}</span>
            </div>
            
            <p class="text-white font-serif italic ${item.size === 'large' ? 'text-2xl leading-relaxed' : 'text-lg leading-snug'} mb-8">
                "${item.message}"
            </p>
            
            <div class="flex items-center gap-4 mt-auto">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center font-black text-brand text-xs">
                    ${item.author.charAt(0)}
                </div>
                <div>
                    <h4 class="text-white font-bold text-sm tracking-wide">${item.author}</h4>
                    <p class="text-slate-500 text-[10px] font-medium uppercase tracking-widest">${item.location}</p>
                </div>
            </div>
        </div>
    `;
}

function setupTestimonialForm() {
    const btn = document.getElementById('share-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            alert('¡Gracias por querer compartir! Esta función de envío estará disponible pronto en la integración con el backend.');
        });
    }
}
