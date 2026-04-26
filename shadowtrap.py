import socket
import threading
import paramiko
import sqlite3
import os
import requests
from datetime import datetime
from colorama import Fore, init

init(autoreset=True)

HOST_KEY = paramiko.RSAKey.generate(2048)
LISTEN_IP = "0.0.0.0"
LISTEN_PORT = 2222
DB_PATH = "logs/attacks.db"
os.makedirs("logs", exist_ok=True)

db_lock = threading.Lock()

def get_geo_info(ip):
    try:
        current_ip = ip
        if ip in ["127.0.0.1", "localhost"]:
            current_ip = requests.get('https://api.ipify.org', timeout=3).text
        res = requests.get(f"http://ip-api.com/json/{current_ip}?fields=status,country,city", timeout=3).json()
        if res.get('status') == 'success':
            return f"{res.get('city')}, {res.get('country')}"
    except: pass
    return "Unknown Location"

def init_db():
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS attacks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT, ip TEXT, location TEXT, 
            username TEXT, password TEXT, command TEXT
        )''')
        conn.commit()
        conn.close()

def log_attack(ip, username, password, command="LOGIN_ATTEMPT"):
    location = get_geo_info(ip)
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("INSERT INTO attacks (timestamp, ip, location, username, password, command) VALUES (?, ?, ?, ?, ?, ?)",
                  (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), ip, location, username, password, command))
        conn.commit()
        conn.close()

class ShadowServer(paramiko.ServerInterface):
    def __init__(self, client_ip):
        self.client_ip = client_ip
        self.event = threading.Event()

    def check_auth_password(self, username, password):
        print(f"{Fore.RED}[⚠️ ATTACK] {self.client_ip} | User: {username} | Pass: {password}")
        log_attack(self.client_ip, username, password)
        return paramiko.AUTH_SUCCESSFUL 

    def get_allowed_auths(self, username): return "password"
    def check_channel_request(self, kind, chanid): return paramiko.OPEN_SUCCEEDED if kind == "session" else paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED
    def check_channel_shell_request(self, channel): self.event.set(); return True
    def check_channel_pty_request(self, *args): return True

def handle_connection(client, addr):
    client_ip = addr[0]
    transport = paramiko.Transport(client)
    transport.add_server_key(HOST_KEY)
    transport.local_version = "SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5"
    server = ShadowServer(client_ip)
    try:
        transport.start_server(server=server)
        channel = transport.accept(20)
        if not channel: return
        server.event.wait(5)
        channel.send("\r\nWelcome to Ubuntu 20.04.4 LTS\r\nroot@ubuntu:~# ")
        cmd_buf = ""
        while True:
            char = channel.recv(1).decode("utf-8", errors="ignore")
            if not char: break
            if char == "\r":
                channel.send("\r\n")
                if cmd_buf.strip():
                    log_attack(client_ip, "root", "SUCCESS", cmd_buf.strip())
                    if cmd_buf.strip() == "ls": channel.send("bin  boot  etc  home  root  var\r\n")
                    else: channel.send(f"bash: {cmd_buf.strip()}: command not found\r\n")
                channel.send("root@ubuntu:~# ")
                cmd_buf = ""
            elif char == "\x7f":
                if cmd_buf: cmd_buf = cmd_buf[:-1]; channel.send("\b \b")
            else:
                cmd_buf += char; channel.send(char)
    except: pass
    finally: transport.close()

def main():
    init_db()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("0.0.0.0", 2222))
    sock.listen(100)
    print(f"{Fore.CYAN}🕸️ SHADOWTRAP ENGINE ACTIVE ON PORT 2222")
    while True:
        client, addr = sock.accept()
        threading.Thread(target=handle_connection, args=(client, addr), daemon=True).start()

if __name__ == "__main__": main()