# 🏛️ Zain AI Enterprise — Autonomous Operations Command Center

[![Status: Operational](https://img.shields.io/badge/Status-Operational-brightgreen?style=for-the-badge)](https://github.com/suhailahmed-dev)
[![Engine: Python 3](https://img.shields.io/badge/Engine-Python%203%20%7C%20FastAPI-blue?style=for-the-badge&logo=python)](https://github.com/suhailahmed-dev)
[![Author: Suhail Ahmed](https://img.shields.io/badge/Architect-Suhail%20Ahmed%20Buledi-6f42c1?style=for-the-badge&logo=github)](https://github.com/suhailahmed-dev)

An enterprise multi-agent operations command center engineered to supervise, monitor, and coordinate 6 autonomous business and algorithmic trading departments from a centralized web cockpit.

---

## 🏛️ Enterprise Department Topology

```
                  ┌──────────────────────────────┐
                  │   ZAIN AI ENTERPRISE HQ      │
                  │  (Central Process Commander) │
                  └──────────────┬───────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
┌────┴────────────┐     ┌────────┴──────────┐     ┌──────────┴────────┐
│  ROOM 1: SOPHI  │     │ ROOM 2: MULTIMEDIA│     │   ROOM 3: EBAY    │
│  Crypto Engine  │     │ Video Autopilot   │     │  E-Commerce Bot   │
└─────────────────┘     └───────────────────┘     └───────────────────┘
     │                           │                           │
┌────┴────────────┐     ┌────────┴──────────┐     ┌──────────┴────────┐
│ ROOM 4: SOCIAL  │     │ ROOM 5: SITESELLER│     │  ROOM 6: FOREX    │
│ APEX Marketing  │     │ Lead Hunter       │     │  ZainForex MT5    │
└─────────────────┘     └───────────────────┘     └───────────────────┘
```

---

## ⚡ Core Capabilities

1. **Autonomous Process Supervisor (`core/commander.py`):**
   - Continuously audits department directories, active daemon states, and local runtime health.
   - Monitors live background Windows processes (e.g. `terminal64.exe` for MetaTrader 5 execution).
2. **Voice Announcer Daemon (`core/voice_announcer.py`):**
   - Dispatches spoken audio status alerts upon department state transitions or process errors.
3. **Enterprise Web Cockpit (`web/server.py`):**
   - High-contrast, dark-mode real-time operations dashboard presenting the live state, file inventory, and operational metrics of every department room.
4. **Department Registry (`config/departments.json`):**
   - Declarative JSON configuration mapping each business unit to its path, division, engine, and status.

---

## 🛠️ Tech Stack

- **Core Runtime**: Python 3, AsyncIO, PowerShell process telemetry
- **Web & Interface**: Python HTTP Server, HTML5, CSS3, Modern JavaScript
- **Audio & Alerts**: Neural Voice Announcer engine
- **State Management**: JSON persistent status telemetry (`status.json`)

---

## 🚦 Quickstart

```bash
# 1. Run the central enterprise service
start_empire_service.bat

# 2. Open Web Cockpit
# Open http://localhost:8080 in your browser
```
