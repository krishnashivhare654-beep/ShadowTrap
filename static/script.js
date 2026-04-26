gsap.registerPlugin(ScrollTrigger);

const glow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
    gsap.to(glow, { x: e.clientX - 15, y: e.clientY - 15, duration: 0.1 });
});

// Optimized Animations
gsap.to(".home-panel", {
    scrollTrigger: { trigger: ".home-panel", start: "top top", scrub: 0.5 },
    scale: 0.4, opacity: 0, z: -800
});

gsap.from(".monitor-panel", {
    scrollTrigger: { trigger: ".monitor-panel", start: "top bottom", end: "top top", scrub: 0.5 },
    opacity: 0, scale: 0.9
});

gsap.from(".info-panel", {
    scrollTrigger: { trigger: ".info-panel", start: "top bottom", scrub: 0.5 },
    opacity: 0, y: 50
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
setInterval(update, 4000);
update();