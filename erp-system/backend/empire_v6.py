import os
import json
import datetime
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Empire OS v6.0 Ultimate")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_PATH = "/Users/gulzhanserikbay/.openclaw/workspace"
DB_PATH = f"{WORKSPACE_PATH}/erp-system/db/empire_v6.json"

# --- Centralized Logging Integration ---
LOG_FILE = f"{WORKSPACE_PATH}/logs/active.log.jsonl"

def get_real_logs():
    if not os.path.exists(LOG_FILE): return []
    with open(LOG_FILE, "r") as f:
        lines = f.readlines()
    return [json.loads(l) for l in lines[-100:]] # Get last 100 actual logs

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
            "custom_data": {}
        }
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        with open(DB_PATH, "w") as f:
            json.dump(initial_data, f, indent=2)

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            try: await connection.send_text(json.dumps(data))
            except: pass

manager = ConnectionManager()

# --- Endpoints ---
@app.get("/api/master-state")
async def get_master_state():
    db = json.load(open(DB_PATH))
    return {
        "context": get_empire_context(),
        "logs": get_real_logs(),
        "projects": db["projects"],
        "agents": [
            {"id": "Emperor", "name": "Turan (Take)", "role": "CEO", "status": "Online", "kpi": "ROI"},
            {"id": "Core", "name": "D OS", "role": "CTO", "status": "Optimized", "kpi": "Sync"},
            {"id": "WebsiteBuilder", "name": "Website Builder", "role": "Dev", "status": "Active", "kpi": "Speed"}
        ]
    }

@app.post("/api/projects/add")
async def add_project(project: dict):
    db = json.load(open(DB_PATH))
    db["projects"].append(project)
    with open(DB_PATH, "w") as f: json.dump(db, f, indent=2)
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Poll every 2 seconds for workspace-wide changes and broadcast
            state = await get_master_state()
            await websocket.send_text(json.dumps(state))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    init_db()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
