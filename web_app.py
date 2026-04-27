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
        return jsonify({'total_attacks': 0, 'recent_attacks': []})
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Summary data
    total = c.execute("SELECT COUNT(*) FROM attacks").fetchone()[0]
    
    # Threat Level distribution
    threat_counts = c.execute("SELECT threat_level, COUNT(*) as count FROM attacks GROUP BY threat_level").fetchall()
    threat_dist = {row['threat_level']: row['count'] for row in threat_counts}
    
    # Top Usernames
    user_counts = c.execute("SELECT username, COUNT(*) as count FROM attacks GROUP BY username ORDER BY count DESC LIMIT 5").fetchall()
    user_labels = [row['username'] for row in user_counts]
    user_values = [row['count'] for row in user_counts]
    
    recent = [dict(r) for r in c.execute("SELECT * FROM attacks ORDER BY id DESC LIMIT 15")]
    conn.close()
    
    return jsonify({
        'total_attacks': total,
        'threat_dist': threat_dist,
        'top_users': {'labels': user_labels, 'values': user_values},
        'recent_attacks': recent
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)