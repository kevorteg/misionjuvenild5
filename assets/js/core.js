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
