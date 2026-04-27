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
        return jsonify({'recent_attacks': []})
    
    conn = get_db_connection()
    c = conn.cursor()
    
    recent = [dict(r) for r in c.execute("SELECT * FROM attacks ORDER BY id DESC LIMIT 15")]
    threat_counts = c.execute("SELECT threat_level, COUNT(*) as count FROM attacks GROUP BY threat_level").fetchall()
    threat_dist = {row['threat_level']: row['count'] for row in threat_counts}
    
    user_counts = c.execute("SELECT username, COUNT(*) as count FROM attacks GROUP BY username ORDER BY count DESC LIMIT 5").fetchall()
    top_users = {'labels': [r['username'] for r in user_counts], 'values': [r['count'] for r in user_counts]}
    
    conn.close()
    return jsonify({'recent_attacks': recent, 'threat_dist': threat_dist, 'top_users': top_users})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)