gsap.registerPlugin(ScrollTrigger);

const glow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
    gsap.to(glow, { x: e.clientX - 15, y: e.clientY - 15, duration: 0.2 });
});

// Home Panel - Shrinks and disappears
gsap.to(".home-panel", {
    scrollTrigger: { trigger: ".home-panel", start: "top top", scrub: 1 },
    scale: 0.5, opacity: 0, z: -1000
});

// Monitor Panel - Fades in from center
gsap.from(".monitor-panel", {
    scrollTrigger: { trigger: ".monitor-panel", start: "top bottom", end: "top top", scrub: 1 },
    opacity: 0, scale: 0.8, y: 100
});

// Info Panel - Slides up
gsap.from(".info-panel", {
    scrollTrigger: { trigger: ".info-panel", start: "top bottom", scrub: 1 },
    opacity: 0, y: 100
});

function update() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        document.getElementById('totalAttacks').innerText = data.total_attacks;
        document.getElementById('uniqueIps').innerText = data.unique_ips;
        let html = "";
        data.recent_attacks.forEach(a => {
            html += `<tr><td>${a.timestamp}</td><td>${a.ip}</td><td style="color:#ffae00">${a.location}</td><td>${a.username}:${a.password}</td><td style="color:#39ff14">${a.command}</td></tr>`;
        });
        document.getElementById('logsBody').innerHTML = html;
    });
}
setInterval(update, 3000);
update();