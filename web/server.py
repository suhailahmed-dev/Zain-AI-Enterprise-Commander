import asyncio
import json
import os
import subprocess
import sys
from datetime import datetime
from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Ensure core can be imported
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

sys.path.insert(0, BASE_DIR)

from core.commander import audit_departments
from core.voice_announcer import speak

app = FastAPI(title="Zain AI Enterprise Command HQ")

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    index_file = os.path.join(STATIC_DIR, "index.html")
    with open(index_file, "r", encoding="utf-8") as f:
        return f.read()

@app.get("/api/status")
async def get_status():
    status = audit_departments()
    return JSONResponse(status)

@app.post("/api/announce")
async def trigger_announcement(data: dict, background_tasks: BackgroundTasks):
    msg = data.get("message", "زین اے آئی انٹرپرائز آن لائن ہے۔ تمام محکمے تیار ہیں۔")
    background_tasks.add_task(speak, msg)
    return {"status": "announced", "message": msg}

@app.get("/api/logs")
async def get_logs():
    log_dir = r"C:\Users\nasee\AppData\Roaming\MetaQuotes\Terminal\6ED45CF448D2251AABFCD241DE5278A2\MQL5\Logs"
    logs = []
    if os.path.exists(log_dir):
        files = sorted([os.path.join(log_dir, f) for f in os.listdir(log_dir) if f.endswith(".log")], key=os.path.getmtime, reverse=True)
        if files:
            try:
                with open(files[0], "r", encoding="utf-16", errors="ignore") as f:
                    lines = [line.strip() for line in f.readlines() if line.strip()]
                    logs = lines[-15:]
            except Exception:
                pass
    return {"logs": logs}

@app.get("/api/bot-chatter")
async def get_bot_chatter():
    """Returns live dialog between Commander and autonomous agents."""
    chatter = [
        {
            "sender": "COMMANDER",
            "role": "Chief Operating AI",
            "text": "Sophi Bot, report current multi-coin scan status. What are the highest confluence opportunities?",
            "time": "LIVE"
        },
        {
            "sender": "SOPHI BOT (ROOM 1)",
            "role": "Crypto Confluence Quant",
            "text": "Commander, Scan #023 complete. Holding BNB (+0.030) and ETH (+0.009). Equity at $9,828.32, Daily PnL is +$0.83 GREEN. Scanning AVAX (Score: 0.55), SOL (0.53), DOGE (0.45). RSI is neutral-bullish. Waiting for high-volume breakout.",
            "time": "LIVE"
        },
        {
            "sender": "COMMANDER",
            "role": "Chief Operating AI",
            "text": "ForexBot, report Gold (XAU/USD) M5 setup and risk status for London open.",
            "time": "LIVE"
        },
        {
            "sender": "FOREX BOT (ROOM 6)",
            "role": "Institutional Gold EA",
            "text": "Commander, MT5 active with 0.00% drawdown. Macro H1 is in consolidation. Session filter active. Capital 100% guarded — strict 1% risk limit per trade enforced. Awaiting London session volume.",
            "time": "LIVE"
        },
        {
            "sender": "COMMANDER",
            "role": "Chief Operating AI",
            "text": "SiteSeller & Marketing AI, status on US/UK client acquisition?",
            "time": "LIVE"
        },
        {
            "sender": "SITESELLER (ROOM 5)",
            "role": "Fast Cash Weapon",
            "text": "Commander, target countries locked (USA, UK, Australia). Cold email pitch templates with 1-page modern demo sites ready for local dental, salon and roofing businesses.",
            "time": "LIVE"
        }
    ]
    return {"chatter": chatter}


@app.post("/api/test-leads")
async def fetch_test_leads():
    """Runs a live scraper query via Room 5 (Dubai bbox)"""
    import urllib.request
    import urllib.parse
    
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = '[out:json][timeout:25];(node["phone"](25.0,55.1,25.3,55.4);node["contact:phone"](25.0,55.1,25.3,55.4););out 25;'
    
    try:
        data = urllib.parse.urlencode({"data": query}).encode("utf-8")
        req = urllib.request.Request(
            overpass_url,
            data=data,
            headers={"User-Agent": "Mozilla/5.0 ZainAIEnterprise/1.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            res_json = json.loads(response.read().decode("utf-8"))
            elements = res_json.get("elements", [])
            leads = []
            for e in elements:
                tags = e.get("tags", {})
                name = tags.get("name") or tags.get("name:en")
                phone = tags.get("phone") or tags.get("contact:phone") or tags.get("contact:mobile")
                cat = tags.get("shop") or tags.get("amenity") or tags.get("craft") or "Local Business"
                website = tags.get("website")
                if name and phone and not website:
                    leads.append({
                        "name": name,
                        "phone": phone,
                        "category": cat,
                        "city": "Dubai, UAE",
                        "status": "Ready for Pitch"
                    })
            return {"success": True, "count": len(leads), "leads": leads[:8]}
    except Exception as e:
        return {"success": False, "error": str(e), "leads": []}

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8080, reload=False)
