import sqlite3
import time
import os
from colorama import Fore, init

init(autoreset=True)

def show_dashboard():
    while True:
        os.system("cls" if os.name == "nt" else "clear")
        print(f"{Fore.CYAN}╔══════════════════════════════════════════════════╗")
        print(f"{Fore.CYAN}║      🕸️  SHADOWTRAP - LIVE ATTACK DASHBOARD     ║")
        print(f"{Fore.CYAN}╚══════════════════════════════════════════════════╝\n")

        try:
            conn = sqlite3.connect("logs/attacks.db")
            c = conn.cursor()
            
            c.execute("SELECT COUNT(*) FROM attacks")
            total = c.fetchone()[0]
            
            c.execute("SELECT COUNT(DISTINCT ip) FROM attacks")
            unique_ips = c.fetchone()[0]
            
            print(f"{Fore.YELLOW}📊 Total Attacks: {Fore.RED}{total}")
            print(f"{Fore.YELLOW}🌍 Unique IPs:    {Fore.RED}{unique_ips}\n")
            
            print(f"{Fore.GREEN}━━━━━━━ TOP 5 USERNAMES ━━━━━━━")
            c.execute("SELECT username, COUNT(*) FROM attacks GROUP BY username ORDER BY COUNT(*) DESC LIMIT 5")
            for row in c.fetchall():
                print(f"  {Fore.WHITE}{row[0]:<20} {Fore.RED}{row[1]} times")
            
            print(f"\n{Fore.GREEN}━━━━━━━ TOP 5 PASSWORDS ━━━━━━━")
            c.execute("SELECT password, COUNT(*) FROM attacks GROUP BY password ORDER BY COUNT(*) DESC LIMIT 5")
            for row in c.fetchall():
                print(f"  {Fore.WHITE}{row[0]:<20} {Fore.RED}{row[1]} times")
            
            print(f"\n{Fore.GREEN}━━━━━━━ RECENT 5 ATTACKS ━━━━━━━")
            c.execute("SELECT timestamp, ip, username, password FROM attacks ORDER BY id DESC LIMIT 5")
            for row in c.fetchall():
                print(f"  {Fore.CYAN}{row[0][:19]} {Fore.RED}{row[1]:<15} {Fore.YELLOW}{row[2]}:{row[3]}")
            
            conn.close()
        except Exception as e:
            print(f"{Fore.RED}Database empty ya error: {e}")
        
        print(f"\n{Fore.MAGENTA}🔄 Refreshing in 5 seconds... (Ctrl+C to exit)")
        time.sleep(5)

if __name__ == "__main__":
    try:
        show_dashboard()
    except KeyboardInterrupt:
        print(f"\n{Fore.RED}Dashboard closed.")