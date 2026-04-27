let tChart, uChart;

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.getElementById('btn-' + tabName).classList.add('active');
}

function initCharts() {
    tChart = new Chart(document.getElementById('threatChart'), {
        type: 'doughnut',
        data: { labels: ['Low', 'Med', 'Crit'], datasets: [{ data: [0,0,0], backgroundColor: ['#39ff14','#ffae00','#ff3131'], borderWidth: 0 }] },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#666' } } } }
    });
    uChart = new Chart(document.getElementById('userChart'), {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: '#7000ff' }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#333' } }, x: { ticks: { color: '#333' } } } }
    });
}

function update() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        let html = "";
        data.recent_attacks.forEach(a => {
            const badge = a.threat_level === 'CRITICAL' ? 'badge-crit' : 'badge-med';
            html += `<tr><td>${a.timestamp.split(' ')[1]}</td><td style="color:var(--neon)">${a.ip}</td><td style="color:#ffae00">${a.location}</td><td><span class="${badge}">${a.threat_level}</span></td><td><button onclick="startReplay('${a.command}')">REPLAY</button></td></tr>`;
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
    document.getElementById('replayText').innerText = "root@ubuntu:~# " + (cmd === "LOGIN_ATTEMPT" ? "exit" : cmd);
}

initCharts(); update(); setInterval(update, 5000);