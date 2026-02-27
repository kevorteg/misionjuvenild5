/**
 * Misión Juvenil D5 - GSAP Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    initRevealAnimations();
    initBentoAnimations();
});

/**
 * Entrance animations for sections
 */
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    revealElements.forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.2
        });
    });
}

/**
 * Special animations for Hero/Bento components
 */
function initBentoAnimations() {
    const items = document.querySelectorAll('.bento-item');

    items.forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 90%",
            },
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            delay: index * 0.1,
            ease: "back.out(1.7)"
        });
    });
}
