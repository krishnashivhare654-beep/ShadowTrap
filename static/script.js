gsap.registerPlugin(ScrollTrigger);

// 1. Mouse Tracking & Big Cursor
const cursor = document.getElementById('cursor-visual');
window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.2 });
    
    // Create Water Ripple effect
    if (Math.random() > 0.9) { // Har move par nahi, thode gaps pe
        createRipple(e.clientX, e.clientY);
    }
});

function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => { ripple.remove(); }, 1000);
}

// 2. 3D Scrolling Animations
gsap.to(".home-panel", {
    scrollTrigger: { trigger: ".home-panel", start: "top top", scrub: 1 },
    scale: 0.2, opacity: 0, rotateX: 45, z: -1000
});

gsap.from(".monitor-panel", {
    scrollTrigger: { trigger: ".monitor-panel", start: "top bottom", end: "top center", scrub: 1 },
    scale: 2, opacity: 0, rotateX: -45, z: 1000
});

// 3. Live Data Fetching
function fetchStats() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        document.getElementById('totalAttacks').innerText = data.total_attacks;
        document.getElementById('uniqueIps').innerText = data.unique_ips;
        document.getElementById('uniqueUsers').innerText = data.unique_usernames;
        document.getElementById('uniquePass').innerText = data.unique_passwords;

        let html = "";
        data.recent_attacks.forEach(a => {
            html += `<tr><td>${a.timestamp}</td><td>${a.ip}</td><td style="color:#ffae00">${a.location}</td><td>${a.username}</td></tr>`;
        });
        document.getElementById('logsBody').innerHTML = html;
    });
}
setInterval(fetchStats, 3000);
fetchStats();