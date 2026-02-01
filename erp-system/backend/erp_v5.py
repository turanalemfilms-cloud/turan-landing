import os
import json
import datetime
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_async_client, AsyncClient

app = FastAPI(title="Empire ERP v5.0 Master")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "erp-system/db/empire_v5.json"
ENV_PATH = "frontend/.env" if os.path.exists("frontend/.env") else "/Users/gulzhanserikbay/Documents/turan-landing/frontend/.env"

# --- Models ---
class Project(BaseModel):
    id: str
    name: str
    status: str
    description: str
    revenue_est: str

class AgentUpdate(BaseModel):
    id: str
    status: str
    last_action: str

# --- Database Logic ---
def init_db():
    if not os.path.exists(DB_PATH):
        initial_data = {
            "agents": [
                {"id": "Emperor", "name": "Turan (Take)", "role": "Strategic Vision / CEO", "kpi": "Revenue Growth", "status": "Online", "last_action": "Directing ERP Expansion"},
                {"id": "Core", "name": "D OS", "role": "Orchestrator / CTO", "kpi": "System Uptime / Sync", "status": "Optimized", "last_action": "Upgrading ERP to v5.0"},
                {"id": "LeadScout", "name": "Lead Scout", "role": "Lead Gen", "kpi": "5 Leads/Day", "status": "Idle", "last_action": "Ready for orders"},
                {"id": "WebsiteBuilder", "name": "Website Builder", "role": "Site Gen", "kpi": "Draft < 2h", "status": "Active", "last_action": "Processing Abat Agency"}
            ],
            "projects": [
                {"id": "P-001", "name": "Website Builder Service", "status": "Active", "description": "AI-powered rapid landing page generation.", "revenue_est": "$500/mo"}
            ],
            "crm_leads": [],
            "operations": []
        }
        with open(DB_PATH, "w") as f:
            json.dump(initial_data, f, indent=2)

def get_db():
    with open(DB_PATH, "r") as f:
        return json.load(f)

def save_db(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2)

async def log_op(user, action, details):
    db = get_db()
    db["operations"].insert(0, {
        "timestamp": datetime.datetime.now().isoformat(),
        "user": user,
        "action": action,
        "details": details
    })
    db["operations"] = db["operations"][:100]
    save_db(db)
    await manager.broadcast()

# --- Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    async def broadcast(self):
        data = get_db()
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(data))
            except: pass

manager = ConnectionManager()

# --- Endpoints ---
@app.get("/api/data")
async def fetch_data():
    return get_db()

@app.post("/api/projects/add")
async def add_project(project: Project):
    db = get_db()
    db["projects"].append(project.dict())
    save_db(db)
    await log_op("Emperor", "PROJECT_ADD", f"New project: {project.name}")
    return {"status": "ok"}

@app.post("/api/agent/update")
async def update_agent(update: AgentUpdate):
    db = get_db()
    for a in db["agents"]:
        if a["id"] == update.id:
            a["status"] = update.status
            a["last_action"] = update.last_action
    save_db(db)
    await manager.broadcast()
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    await websocket.send_text(json.dumps(get_db()))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    init_db()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
