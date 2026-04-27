gsap.registerPlugin(ScrollTrigger);

// 3D Scroll
gsap.to(".home-panel", { scrollTrigger: { trigger: ".home-panel", start: "top top", scrub: 1 }, z: -1000, opacity: 0 });
gsap.from(".chart-panel", { scrollTrigger: { trigger: ".chart-panel", start: "top bottom", end: "top top", scrub: 1 }, scale: 0.5, opacity: 0 });
gsap.from(".monitor-panel", { scrollTrigger: { trigger: ".monitor-panel", start: "top bottom", scrub: 1 }, z: 1000, opacity: 0 });

// Chart Global Variables
let tChart, uChart;

function initCharts() {
    const ctx1 = document.getElementById('threatChart').getContext('2d');
    const ctx2 = document.getElementById('userChart').getContext('2d');

    tChart = new Chart(ctx1, {
        type: 'doughnut',
        data: { labels: ['Low', 'Medium', 'CRITICAL'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#39ff14', '#ffae00', '#ff3131'] }] },
        options: { plugins: { legend: { labels: { color: '#fff', font: { family: 'Share Tech Mono' } } } } }
    });

    uChart = new Chart(ctx2, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Top Targets', data: [], backgroundColor: '#00f2fe' }] },
        options: { scales: { y: { ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } } }
    });
}

function update() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        // Update Table
        let html = "";
        data.recent_attacks.forEach(a => {
            const badgeClass = `badge-${a.threat_level.toLowerCase()}`;
            html += `<tr><td>${a.timestamp}</td><td>${a.ip}</td><td>${a.location}</td><td>${a.username}:${a.password}</td><td><span class="badge ${badgeClass}">${a.threat_level}</span></td><td><button onclick="startReplay('${a.command}', '${a.username}', '${a.password}')">REPLAY</button></td></tr>`;
        });
        document.getElementById('logsBody').innerHTML = html;

        // Update Charts
        tChart.data.datasets[0].data = [data.threat_dist.Low || 0, data.threat_dist.Medium || 0, data.threat_dist.CRITICAL || 0];
        tChart.update();

        uChart.data.labels = data.top_users.labels;
        uChart.data.datasets[0].data = data.top_users.values;
        uChart.update();
    });
}

initCharts();
setInterval(update, 5000);
update();

// Cursor & Replay logic remains same...