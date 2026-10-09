import json
import os
import subprocess
import sys
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "config", "departments.json")
STATUS_FILE = os.path.join(BASE_DIR, "status.json")

try:
    from voice_announcer import speak
except ImportError:
    from core.voice_announcer import speak

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def check_process(process_name: str) -> bool:
    try:
        output = subprocess.check_output(
            ["powershell", "-Command", f"Get-Process -Name '{process_name}' -ErrorAction SilentlyContinue"],
            text=True
        )
        return len(output.strip()) > 0
    except Exception:
        return False

def audit_departments():
    cfg = load_config()
    results = {}
    
    # Check MT5 process for Forex Bot
    mt5_running = check_process("terminal64")
    
    for dep_key, info in cfg["departments"].items():
        exists = os.path.exists(info["path"])
        file_count = 0
        if exists:
            try:
                file_count = len(os.listdir(info["path"]))
            except Exception:
                pass
        
        live_status = info["status"]
        if dep_key == "room_6_forex_ladla":
            live_status = "ONLINE (Active MT5)" if mt5_running else "OFFLINE (MT5 Stopped)"
        elif exists and file_count > 0:
            if live_status == "standby":
                live_status = "READY (Assets Verified)"
        else:
            live_status = "NOT INSTALLED" if not exists else "EMPTY"
            
        results[dep_key] = {
            "id": info["id"],
            "name": info["name"],
            "division": info["division"],
            "path": info["path"],
            "exists": exists,
            "file_count": file_count,
            "status": live_status
        }
        
    state = {
        "timestamp": datetime.now().isoformat(),
        "mt5_running": mt5_running,
        "departments": results
    }
    
    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)
        
    return state

def display_status():
    state = audit_departments()
    print("=" * 70)
    print("        🏢 ZAIN AI ENTERPRISE — COMMAND HQ STATUS REPORT        ")
    print("=" * 70)
    print(f"Timestamp: {state['timestamp']}")
    print(f"MT5 Terminal Live: {'🟢 YES' if state['mt5_running'] else '🔴 NO'}")
    print("-" * 70)
    print(f"{'ROOM':<8} | {'DEPARTMENT NAME':<30} | {'STATUS':<22}")
    print("-" * 70)
    for k, v in state["departments"].items():
        print(f"{v['id']:<8} | {v['name']:<30} | {v['status']:<22}")
    print("=" * 70)

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "status"
    if action == "status":
        display_status()
    elif action == "announce":
        msg = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "زین اے آئی انٹرپرائز کمانڈر ایکٹو ہے۔ تمام محکمے تیار ہیں۔"
        display_status()
        speak(msg)
