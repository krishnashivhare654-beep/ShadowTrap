"""
ShadowTrap Web Dashboard
Beautiful web interface to view honeypot attacks in real-time
"""

from flask import Flask, render_template, jsonify
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)

DB_PATH = "logs/attacks.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    """Returns all stats as JSON for live dashboard updates"""
    if not os.path.exists(DB_PATH):
        return jsonify({
            'total_attacks': 0,
            'unique_ips': 0,
            'unique_usernames': 0,
            'unique_passwords': 0,
            'top_usernames': [],
            'top_passwords': [],
            'top_ips': [],
            'recent_attacks': [],
            'attack_timeline': []
        })
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Total attacks
    c.execute("SELECT COUNT(*) as count FROM attacks")
    total_attacks = c.fetchone()['count']
    
    # Unique IPs
    c.execute("SELECT COUNT(DISTINCT ip) as count FROM attacks")
    unique_ips = c.fetchone()['count']
    
    # Unique usernames
    c.execute("SELECT COUNT(DISTINCT username) as count FROM attacks")
    unique_usernames = c.fetchone()['count']
    
    # Unique passwords
    c.execute("SELECT COUNT(DISTINCT password) as count FROM attacks")
    unique_passwords = c.fetchone()['count']
    
    # Top 10 usernames
    c.execute("SELECT username, COUNT(*) as count FROM attacks GROUP BY username ORDER BY count DESC LIMIT 10")
    top_usernames = [{'username': row['username'], 'count': row['count']} for row in c.fetchall()]
    
    # Top 10 passwords
    c.execute("SELECT password, COUNT(*) as count FROM attacks GROUP BY password ORDER BY count DESC LIMIT 10")
    top_passwords = [{'password': row['password'], 'count': row['count']} for row in c.fetchall()]
    
    # Top 10 IPs
    c.execute("SELECT ip, COUNT(*) as count FROM attacks GROUP BY ip ORDER BY count DESC LIMIT 10")
    top_ips = [{'ip': row['ip'], 'count': row['count']} for row in c.fetchall()]
    
    # Recent 20 attacks
    c.execute("SELECT timestamp, ip, username, password, command FROM attacks ORDER BY id DESC LIMIT 20")
    recent_attacks = []
    for row in c.fetchall():
        recent_attacks.append({
            'timestamp': row['timestamp'][:19].replace('T', ' '),
            'ip': row['ip'],
            'username': row['username'],
            'password': row['password'],
            'command': row['command']
        })
    
    # Attack timeline (last 24 hours grouped by hour)
    c.execute("""
        SELECT strftime('%H', timestamp) as hour, COUNT(*) as count 
        FROM attacks 
        WHERE timestamp >= datetime('now', '-24 hours')
        GROUP BY hour 
        ORDER BY hour
    """)
    timeline = [{'hour': row['hour'], 'count': row['count']} for row in c.fetchall()]
    
    conn.close()
    
    return jsonify({
        'total_attacks': total_attacks,
        'unique_ips': unique_ips,
        'unique_usernames': unique_usernames,
        'unique_passwords': unique_passwords,
        'top_usernames': top_usernames,
        'top_passwords': top_passwords,
        'top_ips': top_ips,
        'recent_attacks': recent_attacks,
        'attack_timeline': timeline
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🕸️  SHADOWTRAP WEB DASHBOARD")
    print("="*50)
    print("🌐 Dashboard URL: http://localhost:5000")
    print("📊 Live attack monitoring active")
    print("⚠️  Press Ctrl+C to stop")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=False)