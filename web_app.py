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
    total = c.execute("SELECT COUNT(*) FROM attacks").fetchone()[0]
    ips = c.execute("SELECT COUNT(DISTINCT ip) FROM attacks").fetchone()[0]
    recent = [dict(r) for r in c.execute("SELECT * FROM attacks ORDER BY id DESC LIMIT 15")]
    conn.close()
    return jsonify({'total_attacks': total, 'unique_ips': ips, 'recent_attacks': recent})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)