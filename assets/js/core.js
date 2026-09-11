// Hero Slider Logic
function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.nav-dot');
    const heroBg = document.getElementById('hero-bg');

    if (!slides.length || !heroBg) return;

    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    const currentSlide = document.getElementById(`slide-${index}`);
    if (currentSlide) {
        currentSlide.classList.add('active');
        const dot = document.getElementById(`dot-${index}`);
        if (dot) dot.classList.add('active');

        // Update blurred background
        heroBg.style.backgroundImage = `url('${currentSlide.getAttribute('data-bg')}')`;
    }
}

// Initialize Global Interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Slider Auto-play
    let currentS = 1;
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        setInterval(() => {
            currentS = currentS >= slides.length ? 1 : currentS + 1;
            goToSlide(currentS);
        }, 8000);
    }

    // FAQ Reveal Logic (Accordion effect)
    const faqDetails = document.querySelectorAll('details');
    faqDetails.forEach(detail => {
        detail.addEventListener('toggle', () => {
            if (detail.open) {
                faqDetails.forEach(d => {
                    if (d !== detail) d.open = false;
                });
            }
        });
    });

    // Mobile menu toggle
    const menuBtn = document.querySelector('button.lg\\:hidden');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const nav = document.querySelector('nav');
            if (nav) {
                nav.classList.toggle('hidden');
                nav.classList.toggle('flex');
            }
        });
    }
});


function initRotatingVerses() {
    const verseText = document.getElementById('verse-text');
    const verseRef = document.getElementById('verse-ref');
    const container = document.getElementById('verse-container');

    if (!verseText || !verseRef || !container) return;

    let currentIndex = 0;

    function updateVerse() {
        container.style.opacity = 0;

        setTimeout(() => {
            verseText.textContent = '"' + verses[currentIndex].text + '"';
            verseRef.textContent = verses[currentIndex].ref;
            container.style.opacity = 1;

            currentIndex = (currentIndex + 1) % verses.length;
        }, 500); // Wait for fade out
    }

    // Initial call
    updateVerse();

    // Rotate every 8 seconds
    setInterval(updateVerse, 8000);
}

document.addEventListener('DOMContentLoaded', initRotatingVerses);


// Accordion Hero Slider Logic
class AccordionSlider {
    constructor() {
        this.slides = document.querySelectorAll(".mj-acc-slide");
        this.prevBtn = document.querySelector(".mj-acc-prev");
        this.nextBtn = document.querySelector(".mj-acc-next");
        this.currentIndex = 0;
        this.slideInterval = null;

        this.init();
    }

    init() {
        this.slides.forEach((slide, index) => {
            slide.addEventListener("click", () => this.setActiveSlide(index));
        });

        if (this.prevBtn) {
            this.prevBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.previousSlide();
            });
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.nextSlide();
            });
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") this.previousSlide();
            if (e.key === "ArrowRight") this.nextSlide();
        });

        this.startAutoSlide();
    }

    setActiveSlide(index) {
        this.slides.forEach((slide) => slide.classList.remove("active"));
        if (this.slides[index]) this.slides[index].classList.add("active");
        this.currentIndex = index;
        this.startAutoSlide(); // Reset timer
    }

    nextSlide() {
        if (!this.slides.length) return;
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.setActiveSlide(nextIndex);
    }

    previousSlide() {
        if (!this.slides.length) return;
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.setActiveSlide(prevIndex);
    }

    startAutoSlide() {
        clearInterval(this.slideInterval);
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 8000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('.mj-acc-slide')) {
        new AccordionSlider();
    }

    // Stats Counter Animation Logic
    const counters = document.querySelectorAll('.mj-stat-number');
    const speed = 200;

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText.replace('+', '').replace('%', '');
        const inc = target / speed;

        if (count < target) {
            const nextVal = Math.ceil(count + inc);
            if (counter.getAttribute('data-target') === '100') {
                counter.innerText = nextVal + '%';
            } else {
                counter.innerText = '+' + nextVal;
            }
            setTimeout(() => animateCounter(counter), 1);
        } else {
            counter.innerText = (counter.getAttribute('data-target') === '100' ? target + '%' : '+' + target);
        }
    };

    // Intersection Observer for Stats
    const observerOptions = {
        threshold: 0.5
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => statsObserver.observe(counter));

    // Render FAQ
    renderFAQ();

    // Render Salud Mental
    renderSaludMental();

    // Init Muro Espiritual
    if (document.getElementById('muro-grid')) {
        initMuro();
    }

    // Render Colegios
    renderColegiosGallery();

    // Render Universidades
    renderUniversidadesGallery();
});

function renderFAQ() {
    const container = document.getElementById('faq-container');
    if (!container || typeof faqData === 'undefined') return;

    container.innerHTML = '';

    faqData.forEach(faq => {
        const item = document.createElement('div');
        item.className = 'mj-faq-item';
        item.innerHTML = `
            <div class="mj-faq-header" onclick="this.parentElement.classList.toggle('active')">
                <h4>${faq.question}</h4>
                <span class="material-symbols-outlined mj-faq-icon">expand_more</span>
            </div>
            <div class="mj-faq-content">
                <p>${faq.answer}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderSaludMental() {
    if (typeof saludMentalData === 'undefined') return;

    const titleEl = document.getElementById('sm-title');
    if (titleEl) titleEl.textContent = saludMentalData.title;

    const descEl = document.getElementById('sm-description');
    if (descEl) descEl.textContent = saludMentalData.description;

    const cardsContainer = document.getElementById('sm-cards-container');
    if (cardsContainer) {
        cardsContainer.innerHTML = '';
        saludMentalData.cards.forEach(card => {
            const wrapper = document.createElement('div');
            wrapper.className = 'glass-card p-8 rounded-3xl';

            let contentHtml = '';
            if (card.type === 'text') {
                contentHtml = card.content.map(p => `<p class="text-slate-400 text-sm leading-relaxed mb-6 last:mb-0">${p}</p>`).join('');
            } else if (card.type === 'list') {
                const listItems = card.items.map(item => `
                    <li class="flex items-start gap-3">
                        <span class="text-brand material-symbols-outlined text-sm">${item.icon}</span>
                        <span class="text-slate-400 text-xs">${item.text}</span>
                    </li>
                `).join('');
                contentHtml = `<ul class="space-y-4">${listItems}</ul>`;
            }

            wrapper.innerHTML = `
                <h3 class="text-xl font-bold mb-4 italic">${card.title}</h3>
                ${contentHtml}
            `;
            cardsContainer.appendChild(wrapper);
        });
    }

    const ctaTitle = document.getElementById('sm-cta-title');
    if (ctaTitle) ctaTitle.textContent = saludMentalData.cta.title;

    const ctaDesc = document.getElementById('sm-cta-desc');
    if (ctaDesc) ctaDesc.textContent = saludMentalData.cta.description;

    const ctaBtn = document.getElementById('sm-cta-btn');
    if (ctaBtn) {
        ctaBtn.href = saludMentalData.cta.buttonLink;
        const ctaIcon = document.getElementById('sm-cta-icon');
        if (ctaIcon) ctaIcon.textContent = saludMentalData.cta.buttonIcon;
        const ctaText = document.getElementById('sm-cta-text');
        if (ctaText) ctaText.textContent = saludMentalData.cta.buttonText;
    }
}

// Muro Espiritual Logic
function initMuro() {
    renderTestimonials();
    setupTestimonialForm();
}

function renderTestimonials() {
    const container = document.getElementById('muro-grid');
    if (!container || typeof muroData === 'undefined') return;

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

// Render Colegios Gallery
function renderColegiosGallery() {
    const container = document.getElementById('colegios-gallery');
    if (!container || typeof colegiosGallery === 'undefined') return;

    container.innerHTML = colegiosGallery.map(item => `
        <div class="group relative rounded-3xl overflow-hidden aspect-square md:aspect-[4/3] bg-black/40 border border-white/5 reveal">
            <img src="${item.img}" alt="${item.titulo}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 class="text-xl font-bold text-white mb-2 italic">\${item.titulo}</h3>
                <p class="text-slate-300 text-sm font-sans line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 uppercase tracking-wide">\${item.descripcion}</p>
            </div>
        </div>
    `).join('');
}

// Render Universidades Gallery
function renderUniversidadesGallery() {
    const container = document.getElementById('universidades-gallery');
    if (!container || typeof universidadesGallery === 'undefined') return;

    container.innerHTML = universidadesGallery.map(item => `
        <div class="group relative rounded-3xl overflow-hidden aspect-square md:aspect-[4/3] bg-black/40 border border-white/5 reveal">
            <img src="${item.img}" alt="${item.titulo}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 class="text-xl font-bold text-white mb-2 italic">\${item.titulo}</h3>
                <p class="text-slate-300 text-sm font-sans line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 uppercase tracking-wide">\${item.descripcion}</p>
            </div>
        </div>
    `).join('');
}

