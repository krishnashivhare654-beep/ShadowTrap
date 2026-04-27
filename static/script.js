gsap.registerPlugin(ScrollTrigger);

// STAGE 1: Fast Exit
gsap.to(".home-panel", {
    scrollTrigger: { trigger: ".home-panel", start: "top top", scrub: 0.5 },
    z: -1500, opacity: 0, ease: "power1.inOut"
});

// STAGE 2: Charts (Faster Entry/Exit)
gsap.fromTo(".chart-panel", 
    { z: 1000, opacity: 0 }, 
    { scrollTrigger: { trigger: ".home-panel", start: "20% top", end: "60% top", scrub: 0.5 }, z: 0, opacity: 1 }
);
gsap.to(".chart-panel", {
    scrollTrigger: { trigger: ".home-panel", start: "70% top", scrub: 0.5 },
    z: -1000, opacity: 0
});

// STAGE 3: Monitor (Instant appearance)
gsap.fromTo(".monitor-panel", 
    { z: 1200, opacity: 0 }, 
    { scrollTrigger: { trigger: ".home-panel", start: "75% top", scrub: 0.5 }, z: 0, opacity: 1 }
);

// Chart Update optimization
function update() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        // Sirf tab update karo jab data badle (optional, but keep it simple for now)
        requestAnimationFrame(() => {
            // ... (Aapka purana table update logic)
            tChart.update('none'); // 'none' se animation lag kam hoga
            uChart.update('none');
        });
    });
}