let tChart, uChart;

function switchTab(tabName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    // Remove active class from all buttons
    document.querySelectorAll('.nav-links button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show the target section and button
    const targetSection = document.getElementById('tab-' + tabName);
    const targetBtn = document.getElementById('btn-' + tabName);
    
    if(targetSection && targetBtn) {
        targetSection.classList.add('active');
        targetBtn.classList.add('active');
    }
}

// Baki ka Chart aur Update logic same rahega...
function initCharts() {
    const ctx1 = document.getElementById('threatChart').getContext('2d');
    const ctx2 = document.getElementById('userChart').getContext('2d');
    tChart = new Chart(ctx1, { type: 'doughnut', data: { labels: ['Low', 'Med', 'Crit'], datasets: [{ data: [0,0,0], backgroundColor: ['#39ff14','#ffae00','#ff3131'], borderWidth: 0 }] }, options: { plugins: { legend: { position: 'bottom', labels: { color: '#666' } } } } });
    uChart = new Chart(ctx2, { type: 'bar', data: { labels: [], datasets: [{ data: [], backgroundColor: '#7000ff' }] }, options: { scales: { y: { beginAtZero: true, ticks: { color: '#333' } }, x: { ticks: { color: '#333' } } }, plugins: { legend: { display: false } } } });
}

function update() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        let html = "";
        data.recent_attacks.forEach(a => {
            const badge = a.threat_level === 'CRITICAL' ? 'badge-crit' : 'badge-med';
            html += `<tr><td>${a.timestamp.split(' ')[1]}</td><td style="color:var(--neon)">${a.ip}</td><td>${a.username}:${a.password}</td><td><span class="${badge}">${a.threat_level}</span></td><td><button class="replay-btn" onclick="startReplay('${a.command}')">REPLAY</button></td></tr>`;
        });
        document.getElementById('logsBody').innerHTML = html;
        tChart.data.datasets[0].data = [data.threat_dist.Low||0, data.threat_dist.Medium||0, data.threat_dist.CRITICAL||0];
        tChart.update();
        uChart.data.labels = data.top_users.labels;
        uChart.data.datasets[0].data = data.top_users.values;
        uChart.update();
    });
}

function startReplay(cmd) { document.getElementById('replayModal').style.display = 'flex'; document.getElementById('replayText').innerText = `root@ubuntu:~# ${cmd === "LOGIN_ATTEMPT" ? "exit" : cmd}`; }
function closeReplay() { document.getElementById('replayModal').style.display = 'none'; }

initCharts(); update(); setInterval(update, 5000);