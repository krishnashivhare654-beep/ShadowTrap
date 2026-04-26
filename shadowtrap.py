"""
ShadowTrap - Intelligent SSH HoneyPot
Author: Krishna
"""

import socket
import threading
import paramiko
import logging
import sqlite3
import os
from datetime import datetime
from colorama import Fore, init

init(autoreset=True)

HOST_KEY = paramiko.RSAKey.generate(2048)
LISTEN_IP = "0.0.0.0"
LISTEN_PORT = 2222
DB_PATH = "logs/attacks.db"

os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    filename="logs/honeypot.log",
    level=logging.INFO,
    format="%(asctime)s - %(message)s"
)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS attacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        ip TEXT,
        username TEXT,
        password TEXT,
        command TEXT
    )''')
    conn.commit()
    conn.close()

def log_attack(ip, username, password, command="LOGIN_ATTEMPT"):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO attacks (timestamp, ip, username, password, command) VALUES (?, ?, ?, ?, ?)",
              (datetime.now().isoformat(), ip, username, password, command))
    conn.commit()
    conn.close()

class HoneyPotServer(paramiko.ServerInterface):
    def __init__(self, client_ip):
        self.client_ip = client_ip
        self.event = threading.Event()

    def check_auth_password(self, username, password):
        print(f"{Fore.RED}[⚠️ ATTACK DETECTED] {self.client_ip} → {username}:{password}")
        logging.info(f"ATTACK | IP: {self.client_ip} | User: {username} | Pass: {password}")
        log_attack(self.client_ip, username, password)
        return paramiko.AUTH_FAILED

    def get_allowed_auths(self, username):
        return "password"

    def check_channel_request(self, kind, chanid):
        if kind == "session":
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True

def handle_connection(client, addr):
    client_ip = addr[0]
    print(f"{Fore.YELLOW}[+] New connection from {client_ip}")
    transport = None
    try:
        transport = paramiko.Transport(client)
        transport.add_server_key(HOST_KEY)
        transport.local_version = "SSH-2.0-OpenSSH_7.4"

        server = HoneyPotServer(client_ip)
        transport.start_server(server=server)

        channel = transport.accept(20)
        if channel is None:
            return

        server.event.wait(10)
        channel.send("\r\nWelcome to Ubuntu 20.04 LTS\r\n".encode())
        channel.send("root@server:~# ".encode())

        command_buffer = ""
        while True:
            data = channel.recv(1024).decode("utf-8", errors="ignore")
            if not data:
                break
            
            if data == "\r" or data == "\n":
                if command_buffer.strip():
                    print(f"{Fore.CYAN}[CMD] {client_ip} → {command_buffer}")
                    log_attack(client_ip, "session", "session", command_buffer)
                    channel.send(f"\r\nbash: {command_buffer}: command not found\r\n".encode())
                command_buffer = ""
                channel.send("root@server:~# ".encode())
            else:
                command_buffer += data
                channel.send(data.encode())

    except Exception as e:
        logging.error(f"Error: {e}")
    finally:
        try:
            if transport:
                transport.close()
        except:
            pass

def start_honeypot():
    init_db()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((LISTEN_IP, LISTEN_PORT))
    sock.listen(100)

    print(f"{Fore.GREEN}╔══════════════════════════════════════════╗")
    print(f"{Fore.GREEN}║   🕸️  SHADOWTRAP HONEYPOT ACTIVE  🕸️    ║")
    print(f"{Fore.GREEN}║   Listening on {LISTEN_IP}:{LISTEN_PORT}        ║")
    print(f"{Fore.GREEN}╚══════════════════════════════════════════╝")

    while True:
        try:
            client, addr = sock.accept()
            threading.Thread(target=handle_connection, args=(client, addr), daemon=True).start()
        except KeyboardInterrupt:
            print(f"\n{Fore.RED}[!] ShadowTrap shutting down...")
            break

if __name__ == "__main__":
    start_honeypot()