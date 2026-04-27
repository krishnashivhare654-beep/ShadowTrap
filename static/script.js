gsap.registerPlugin(ScrollTrigger);

// Stage Transitions
let tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

tl.to(".home-sec", { z: -500, opacity: 0, autoAlpha: 0, duration: 1 })
  .fromTo(".chart-sec", { z: 500, opacity: 0, autoAlpha: 0 }, { z: 0, opacity: 1, autoAlpha: 1, duration: 1 })
  .to(".chart-sec", { z: -500, opacity: 0, autoAlpha: 0, duration: 1 })
  .fromTo(".monitor-sec", { z: 500, opacity: 0, autoAlpha: 0 }, { z: 0, opacity: 1, autoAlpha: 1, duration: 1 });

// Charts & Update Logic
let tChart, uChart;
function initCharts() {
    tChart = new Chart(document.getElementById('threatChart'), {
        type: 'doughnut',
        data: { labels: ['Low', 'Med', 'CRIT'], datasets: [{ data: [0,0,0], backgroundColor: ['#39ff14','#ffae00','#ff3131'] }] },
        options: { plugins: { legend: { labels: { color: '#fff' } } } }
    });
    uChart = new Chart(document.getElementById('userChart'), {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Targets', data: [], backgroundColor: '#00f2fe' }] },
        options: { scales: { y: { ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } } }
    });
}

function update() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        let html = "";
        data.recent_attacks.forEach(a => {
            const badge = a.threat_level === 'CRITICAL' ? 'badge-critical' : 'badge-medium';
            html += `<tr><td>${a.timestamp}</td><td>${a.ip}</td><td>${a.location}</td><td>${a.username}</td><td><span class="${badge}">${a.threat_level}</span></td><td><button onclick="startReplay('${a.command}')">REPLAY</button></td></tr>`;
        });
        document.getElementById('logsBody').innerHTML = html;
        tChart.data.datasets[0].data = [data.threat_dist.Low||0, data.threat_dist.Medium||0, data.threat_dist.CRITICAL||0];
        tChart.update();
        uChart.data.labels = data.top_users.labels;
        uChart.data.datasets[0].data = data.top_users.values;
        uChart.update();
    });
}

function startReplay(cmd) {
    document.getElementById('replayModal').style.display = 'flex';
    document.getElementById('replayText').innerText = "root@ubuntu:~# " + cmd;
}
function closeReplay() { document.getElementById('replayModal').style.display = 'none'; }

initCharts(); update(); setInterval(update, 5000);