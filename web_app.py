from flask import Flask, render_template, jsonify
import sqlite3
import requests
import os

app = Flask(__name__)
DB_PATH = "logs/attacks.db"

def get_geo_info(ip):
    try:
        if ip in ["127.0.0.1", "localhost"]: 
            return {"city": "Bhopal", "country": "India", "lat": 23.25, "lon": 77.4}
        res = requests.get(f"http://ip-api.com/json/{ip}?fields=status,country,city,lat,lon", timeout=3).json()
        if res.get('status') == 'success':
            return res
    except: pass
    return {"city": "Unknown", "country": "Unknown", "lat": 0, "lon": 0}

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index(): return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    if not os.path.exists(DB_PATH): return jsonify({'total_attacks': 0, 'recent_attacks': []})
    conn = get_db_connection()
    c = conn.cursor()
    recent = [dict(r) for r in c.execute("SELECT * FROM attacks ORDER BY id DESC LIMIT 15")]
    total = c.execute("SELECT COUNT(*) FROM attacks").fetchone()[0]
    conn.close()
    return jsonify({'total_attacks': total, 'recent_attacks': recent})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)