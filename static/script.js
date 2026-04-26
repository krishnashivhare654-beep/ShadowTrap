// Live Time Display
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('liveTime').textContent = `[${time}]`;
}
setInterval(updateTime, 1000);
updateTime();

// Chart instances
let usernameChart = null;
let passwordChart = null;

// Initialize Charts
function initCharts() {
    Chart.defaults.color = '#00ff41';
    Chart.defaults.font.family = 'Share Tech Mono';
    
    const usernameCtx = document.getElementById('usernameChart').getContext('2d');
    usernameChart = new Chart(usernameCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Attempts',
                data: [],
                backgroundColor: 'rgba(255, 0, 64, 0.6)',
                borderColor: '#ff0040',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 255, 65, 0.1)' },
                    ticks: { color: '#00ff41' }
                },
                x: {
                    grid: { color: 'rgba(0, 255, 65, 0.1)' },
                    ticks: { color: '#00ff41' }
                }
            }
        }
    });

    const passwordCtx = document.getElementById('passwordChart').getContext('2d');
    passwordChart = new Chart(passwordCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Attempts',
                data: [],
                backgroundColor: 'rgba(255, 136, 0, 0.6)',
                borderColor: '#ff8800',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 255, 65, 0.1)' },
                    ticks: { color: '#00ff41' }
                },
                x: {
                    grid: { color: 'rgba(0, 255, 65, 0.1)' },
                    ticks: { color: '#00ff41' }
                }
            }
        }
    });
}

// Animate counter
function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = (target - current) / 20;
    let value = current;
    
    const interval = setInterval(() => {
        value += increment;
        if ((increment > 0 && value >= target) || (increment < 0 && value <= target)) {
            element.textContent = target;
            clearInterval(interval);
        } else {
            element.textContent = Math.floor(value);
        }
    }, 30);
}

// Fetch and update data
async function fetchData() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        // Update stat cards
        animateNumber(document.getElementById('totalAttacks'), data.total_attacks);
        animateNumber(document.getElementById('uniqueIps'), data.unique_ips);
        animateNumber(document.getElementById('uniqueUsernames'), data.unique_usernames);
        animateNumber(document.getElementById('uniquePasswords'), data.unique_passwords);
        
        // Update username chart
        if (usernameChart && data.top_usernames.length > 0) {
            usernameChart.data.labels = data.top_usernames.map(u => u.username);
            usernameChart.data.datasets[0].data = data.top_usernames.map(u => u.count);
            usernameChart.update();
        }
        
        // Update password chart
        if (passwordChart && data.top_passwords.length > 0) {
            passwordChart.data.labels = data.top_passwords.map(p => p.password);
            passwordChart.data.datasets[0].data = data.top_passwords.map(p => p.count);
            passwordChart.update();
        }
        
        // Update IP list
        const ipList = document.getElementById('ipList');
        if (data.top_ips.length > 0) {
            ipList.innerHTML = data.top_ips.map(ip => `
                <div class="ip-item">
                    <span class="ip-addr">🌐 ${ip.ip}</span>
                    <span class="ip-count">${ip.count} attacks</span>
                </div>
            `).join('');
        }
        
        // Update attacks table
        const tbody = document.getElementById('attacksBody');
        if (data.recent_attacks.length > 0) {
            tbody.innerHTML = data.recent_attacks.map(attack => `
                <tr>
                    <td>🕐 ${attack.timestamp}</td>
                    <td style="color: #ff0040;">${attack.ip}</td>
                    <td style="color: #ffdd00;">${attack.username}</td>
                    <td style="color: #ff8800;">${attack.password}</td>
                    <td style="color: #00d4ff;">${attack.command}</td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initCharts();
    fetchData();
    // Refresh every 2 seconds
    setInterval(fetchData, 2000);
});