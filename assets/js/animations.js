/**
 * Misión Juvenil D5 - GSAP Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    initRevealAnimations();
    initBentoAnimations();
    initTimelineAnimations();
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

/**
 * Animations for the Quienes Somos timeline
 */
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineLine = document.querySelector('.timeline-line');

    if (!timelineItems.length) return;

    // Animate the vertical line drawing down
    if (timelineLine) {
        gsap.set(timelineLine, { transformOrigin: "top center", scaleY: 0 });
        gsap.to(timelineLine, {
            scrollTrigger: {
                trigger: timelineItems[0],
                start: "top center",
                endTrigger: timelineItems[timelineItems.length - 1],
                end: "bottom center",
                scrub: 1
            },
            scaleY: 1,
            ease: "none"
        });
    }

    // Animate each timeline item sliding in
    timelineItems.forEach((item, index) => {
        const isOdd = index % 2 !== 0;
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
            opacity: 0,
            x: isOdd ? 50 : -50,
            duration: 1,
            ease: "back.out(1.2)"
        });
    });
}
