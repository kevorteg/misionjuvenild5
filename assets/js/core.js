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
const verses = [
    { text: 'Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes en palabra, conducta, amor, espíritu, fe y pureza.', ref: '1 Timoteo 4:12' },
    { text: 'Acuérdate de tu Creador en los días de tu juventud...', ref: 'Eclesiastés 12:1' },
    { text: '¿Con qué limpiará el joven su camino? Con guardar tu palabra.', ref: 'Salmo 119:9' },
    { text: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará.', ref: 'Deuteronomio 31:6' },
    { text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.', ref: 'Jeremías 29:11' }
];

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
