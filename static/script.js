gsap.registerPlugin(ScrollTrigger);

const glow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => { gsap.to(glow, { x: e.clientX - 15, y: e.clientY - 15, duration: 0.1 }); });

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
                <td><button class="replay-btn" onclick="startReplay('${a.command}')">REPLAY</button></td>
            </tr>`;
        });
        document.getElementById('logsBody').innerHTML = html;
    });
}

function startReplay(cmd) {
    document.getElementById('replayModal').style.display = 'block';
    const textElement = document.getElementById('replayText');
    textElement.innerText = "";
    let i = 0;
    const fullText = "root@ubuntu:~# " + cmd;
    
    function typeWriter() {
        if (i < fullText.length) {
            textElement.innerText += fullText.charAt(i);
            i++;
            setTimeout(typeWriter, 100); // Typing speed
        }
    }
    typeWriter();
}

function closeReplay() {
    document.getElementById('replayModal').style.display = 'none';
}

setInterval(update, 4000);
update();