@echo off
title ZAIN AI ENTERPRISE BACKEND SERVICE
cd /d "C:\Users\nasee\Desktop\zain_ai_enterprise\web"
echo =======================================================
echo    ZAIN AI ENTERPRISE COMMAND ROTUNDA SERVICE
echo =======================================================
python -m uvicorn server:app --host 127.0.0.1 --port 8080
pause
