import paramiko
import sqlite3
import datetime
import requests
import threading
import socket

# --- CONFIGURATION ---
PORT = 2222
DB_PATH = "logs/attacks.db"

# Database Setup
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS attacks 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, ip TEXT, 
                  location TEXT, username TEXT, password TEXT, command TEXT, threat_level TEXT)''')
    conn.commit()
    conn.close()

def get_location(ip):
    try:
        if ip == "127.0.0.1" or ip.startswith("192.168") or ip.startswith("10."):
            return "Local Network (Admin)"
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=5).json()
        if response.get('status') == 'success':
            return f"{response['city']}, {response['country']}"
        return "Unknown Location"
    except:
        return "Offline/Local"

def log_to_db(ip, user, password, cmd, level):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    location = get_location(ip)
    cursor.execute("INSERT INTO attacks (timestamp, ip, location, username, password, command, threat_level) VALUES (?,?,?,?,?,?,?)",
                   (ts, ip, location, user, password, cmd, level))
    conn.commit()
    conn.close()

class HoneyServer(paramiko.ServerInterface):
    def __init__(self, client_ip):
        self.client_ip = client_ip
    def check_auth_password(self, username, password):
        log_to_db(self.client_ip, username, password, "LOGIN_ATTEMPT", "Medium")
        return paramiko.AUTH_SUCCESSFUL
    def check_channel_request(self, kind, chanid):
        return paramiko.OPEN_SUCCEEDED if kind == "session" else paramiko.OPEN_FAILED

def handle_connection(client, addr):
    client_ip = addr[0]
    transport = paramiko.Transport(client)
    host_key = paramiko.RSAKey.generate(2048)
    transport.add_server_key(host_key)
    server = HoneyServer(client_ip)
    transport.start_server(server=server)
    chan = transport.accept(20)
    if chan:
        chan.send("Welcome to Ubuntu 20.04.4 LTS\r\n")
        while True:
            chan.send("root@ubuntu:~# ")
            cmd = ""
            while not cmd.endswith("\r"):
                char = chan.recv(1).decode()
                cmd += char
                chan.send(char)
            cmd = cmd.strip()
            if cmd == "exit": break
            level = "CRITICAL" if any(x in cmd for x in ["rm", "wget", "curl", "sudo"]) else "Low"
            log_to_db(client_ip, "root", "N/A", cmd, level)
            chan.send("\r\nCommand Not Found or Access Denied\r\n")
    transport.close()

def start_engine():
    init_db()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('0.0.0.0', PORT))
    sock.listen(100)
    print(f"[*] ShadowTrap Engine Active on Port {PORT}")
    while True:
        client, addr = sock.accept()
        threading.Thread(target=handle_connection, args=(client, addr)).start()

if __name__ == "__main__":
    start_engine()