from flask import Flask, render_template, jsonify
import sqlite3
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
    if not os.path.exists(DB_PATH):
        return jsonify({'total_attacks': 0, 'unique_ips': 0, 'recent_attacks': []})
    
    conn = get_db_connection()
    c = conn.cursor()
    
    total_attacks = c.execute("SELECT COUNT(*) FROM attacks").fetchone()[0]
    unique_ips = c.execute("SELECT COUNT(DISTINCT ip) FROM attacks").fetchone()[0]
    unique_users = c.execute("SELECT COUNT(DISTINCT username) FROM attacks").fetchone()[0]
    unique_pass = c.execute("SELECT COUNT(DISTINCT password) FROM attacks").fetchone()[0]
    
    top_usernames = [dict(r) for r in c.execute("SELECT username, COUNT(*) as count FROM attacks GROUP BY username ORDER BY count DESC LIMIT 5")]
    
    recent_attacks = []
    for row in c.execute("SELECT * FROM attacks ORDER BY id DESC LIMIT 15"):
        recent_attacks.append({
            'timestamp': row['timestamp'],
            'ip': row['ip'],
            'location': row['location'],
            'username': row['username'],
            'password': row['password'],
            'command': row['command']
        })
    
    conn.close()
    return jsonify({
        'total_attacks': total_attacks,
        'unique_ips': unique_ips,
        'unique_usernames': unique_users,
        'unique_passwords': unique_pass,
        'top_usernames': top_usernames,
        'recent_attacks': recent_attacks
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)