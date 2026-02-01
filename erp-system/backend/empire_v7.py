import os
import json
import datetime
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_async_client, AsyncClient

app = FastAPI(title="Empire OS v7.0 Integrated Master")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_PATH = "/Users/gulzhanserikbay/.openclaw/workspace"
DB_PATH = f"{WORKSPACE_PATH}/erp-system/db/empire_v7.json"
LOG_FILE = f"{WORKSPACE_PATH}/logs/active.log.jsonl"
ENV_PATH = "/Users/gulzhanserikbay/Documents/turan-landing/frontend/.env"

# --- Supabase Config ---
def load_env():
    env_vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r") as f:
            for line in f:
                if "=" in line:
                    key, value = line.strip().split("=", 1)
                    env_vars[key] = value
    return env_vars

env = load_env()
SUPABASE_URL = env.get("VITE_SUPABASE_URL")
SUPABASE_KEY = env.get("VITE_SUPABASE_ANON_KEY")

# --- Core Context Files Sync ---
def get_empire_context():
    context = {}
    files = {
        "user": "USER.md",
        "identity": "IDENTITY.md",
        "soul": "SOUL.md",
        "mission": "memory/EMPIRE_OS.md",
        "standard": "memory/working-standard.md"
    }
    for key, filename in files.items():
        path = f"{WORKSPACE_PATH}/{filename}"
        if os.path.exists(path):
            with open(path, "r") as f:
                context[key] = f.read()
    return context

# --- Database Initialization ---
def init_db():
    if not os.path.exists(DB_PATH):
        initial_data = {
            "projects": [
                {"id": "P-001", "name": "Website Builder Service", "status": "Active", "description": "AI-powered rapid landing page generation.", "revenue_est": "$500/mo"}
            ],
            "agents": [
                {"id": "Emperor", "name": "Turan (Take)", "role": "CEO", "status": "Online", "kpi": "ROI"},
                {"id": "Core", "name": "D OS", "role": "CTO", "status": "Optimized", "kpi": "Sync"},
                {"id": "LeadScout", "name": "Lead Scout", "role": "Lead Gen", "status": "Idle", "kpi": "5 Leads/Day"},
                {"id": "WebsiteBuilder", "name": "Website Builder", "role": "Dev", "status": "Active", "kpi": "Speed"}
            ]
        }
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        with open(DB_PATH, "w") as f:
            json.dump(initial_data, f, indent=2)

# --- Endpoints ---
@app.get("/api/master-state")
async def get_master_state():
    db = json.load(open(DB_PATH))
    
    # Get Real-time Leads from Supabase
    leads = []
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            supabase: AsyncClient = await create_async_client(SUPABASE_URL, SUPABASE_KEY)
            res = await supabase.table("leads").select("*").order("created_at", desc=True).execute()
            leads = res.data
        except Exception as e:
            print(f"Supabase Error: {e}")

    # Get Logs
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            lines = f.readlines()
            logs = [json.loads(l) for l in lines[-50:]]

    return {
        "context": get_empire_context(),
        "logs": logs,
        "projects": db["projects"],
        "agents": db["agents"],
        "leads": leads
    }

@app.post("/api/command")
async def run_command(cmd: dict):
    try:
        import subprocess
        result = subprocess.run(cmd['command'], shell=True, capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    init_db()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
