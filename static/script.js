let tChart, uChart;

function initCharts() {
    const ctx1 = document.getElementById('threatChart').getContext('2d');
    const ctx2 = document.getElementById('userChart').getContext('2d');

    tChart = new Chart(ctx1, {
        type: 'doughnut',
        data: { labels: ['Low', 'Med', 'Crit'], datasets: [{ data: [0,0,0], backgroundColor: ['#39ff14','#ffae00','#ff3131'], borderWidth: 0 }] },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#666', font: { family: 'Share Tech Mono' } } } } }
    });

    uChart = new Chart(ctx2, {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: '#7000ff' }] },
        options: { scales: { y: { beginAtZero: true, ticks: { color: '#333' } }, x: { ticks: { color: '#333' } } }, plugins: { legend: { display: false } } }
    });
}

function update() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        let html = "";
        data.recent_attacks.forEach(a => {
            const badge = a.threat_level === 'CRITICAL' ? 
                '<span style="color:#ff3131; border:1px solid #ff3131; padding:2px 5px;">CRITICAL</span>' : 
                '<span style="color:#ffae00; border:1px solid #ffae00; padding:2px 5px;">MEDIUM</span>';
            
            html += `<tr>
                <td>${a.timestamp.split(' ')[1]}</td>
                <td style="color:var(--neon)">${a.ip}</td>
                <td>${a.username}:${a.password}</td>
                <td>${badge}</td>
                <td><button class="replay-btn" onclick="startReplay('${a.command}', '${a.username}', '${a.location}')">REPLAY</button></td>
            </tr>`;
        });
        document.getElementById('logsBody').innerHTML = html;

        tChart.data.datasets[0].data = [data.threat_dist.Low||0, data.threat_dist.Medium||0, data.threat_dist.CRITICAL||0];
        tChart.update();

        uChart.data.labels = data.top_users.labels;
        uChart.data.datasets[0].data = data.top_users.values;
        uChart.update();
    });
}

function startReplay(cmd, user, loc) {
    document.getElementById('replayModal').style.display = 'flex';
    const text = document.getElementById('replayText');
    const displayCmd = cmd === "LOGIN_ATTEMPT" ? "exit (Authentication Failed)" : cmd;
    text.innerHTML = `[SESSION_FORENSICS]\n------------------\nUSER: ${user}\nSOURCE: ${loc}\n\nroot@ubuntu:~# ${displayCmd}\n\n[END_OF_LOG]`;
}

function closeReplay() { document.getElementById('replayModal').style.display = 'none'; }

initCharts(); update(); setInterval(update, 5000);