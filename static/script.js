gsap.registerPlugin(ScrollTrigger);

// Custom Glow
const glow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => { 
    gsap.to(glow, { x: e.clientX - 15, y: e.clientY - 15, duration: 0.1 }); 
});

// 3D SCROLL ANIMATION
gsap.to(".home-panel", {
    scrollTrigger: { trigger: ".home-panel", start: "top top", scrub: 1 },
    z: -2000, opacity: 0, scale: 0.5, rotateX: 25
});

gsap.from(".monitor-panel", {
    scrollTrigger: { trigger: ".monitor-panel", start: "top bottom", end: "top top", scrub: 1 },
    z: 2000, opacity: 0, scale: 2, rotateX: -25
});

// REPLAY LOGIC
let typingTimer;
function startReplay(cmd, user, pass) {
    document.getElementById('replayModal').style.display = 'flex';
    const textElement = document.getElementById('replayText');
    textElement.innerText = "";
    clearTimeout(typingTimer);

    let fullText = "";
    if (cmd === "LOGIN_ATTEMPT" || cmd === "SESSION_ACTIVE") {
        fullText = `Connecting to host...\nUser: ${user}\nPass: ${pass}\n[SYSTEM]: AUTH_FAILURE_DETECTED\n[SYSTEM]: TERMINATING SESSION...`;
    } else {
        fullText = `root@ubuntu:~# ${cmd}\n[SYSTEM]: Command execution captured.`;
    }

    let i = 0;
    function typeWriter() {
        if (i < fullText.length) {
            textElement.innerText += fullText.charAt(i);
            i++;
            typingTimer = setTimeout(typeWriter, 40);
        }
    }
    typeWriter();
}

function closeReplay() {
    document.getElementById('replayModal').style.display = 'none';
    clearTimeout(typingTimer);
}

function update() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        document.getElementById('totalAttacks').innerText = data.total_attacks;
        let html = "";
        data.recent_attacks.forEach(a => {
            const badgeClass = `badge-${a.threat_level.toLowerCase()}`;
            html += `<tr>
                <td>${a.timestamp}</td>
                <td>${a.ip}</td>
                <td style="color:#ffae00">${a.location}</td>
                <td>${a.username}:${a.password}</td>
                <td><span class="badge ${badgeClass}">${a.threat_level}</span></td>
                <td><button onclick="startReplay('${a.command}', '${a.username}', '${a.password}')" style="background:var(--neon); border:none; padding:4px 10px; cursor:pointer;">REPLAY</button></td>
            </tr>`;
        });
        document.getElementById('logsBody').innerHTML = html;
    });
}
setInterval(update, 4000);
update();