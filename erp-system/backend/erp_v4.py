import os
import json
import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Empire ERP v4.0 Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "erp-system/db/empire_v4.json"

# --- Models ---
class Task(BaseModel):
    id: str
    title: str
    assignee: str
    status: str # 'pending', 'in_progress', 'completed', 'blocked'
    deadline: str
    stage: str # 'briefing', 'coding', 'review', 'done'

class Agent(BaseModel):
    id: str
    name: str
    role: str
    kpi: str
    status: str
    last_action: Optional[str]

class OperationRecord(BaseModel):
    timestamp: str
    user: str
    action: str
    details: str

# --- Database Logic ---
def init_db():
    if not os.path.exists(DB_PATH):
        initial_data = {
            "agents": [
                {"id": "Emperor", "name": "Turan (Take)", "role": "Strategic Vision / CEO", "kpi": "Revenue Growth / ROI", "status": "Online", "last_action": "Reviewing ERP"},
                {"id": "Core", "name": "D OS", "role": "Orchestrator / CTO", "kpi": "Agent Efficiency / Sync", "status": "Optimized", "last_action": "Architecting ERP v4"},
                {"id": "LeadScout", "name": "Lead Scout", "role": "Lead Gen / Market Research", "kpi": "5 High-intent Leads/Day", "status": "Scouting", "last_action": "Scanning Moltbook"},
                {"id": "EconomicHunter", "name": "Economic Hunter", "role": "Finance / Tokenomics", "kpi": "1 ROI Opportunity/Day", "status": "Idle", "last_action": "Analyzing virtual protocols"},
                {"id": "FrontendDev", "name": "Frontend Dev", "role": "UI/UX / Rapid Prototyping", "kpi": "Demo < 60 mins", "status": "Idle", "last_action": "Updating iOS 26 styles"},
                {"id": "WebsiteBuilder", "name": "Website Builder", "role": "Site Gen / Supabase", "kpi": "Draft < 2 hours", "status": "Active", "last_action": "Processing T-006"}
            ],
            "tasks": [
                {"id": "T-001", "title": "YouTube Shorts Automation", "assignee": "LeadScout", "status": "blocked", "deadline": "2026-02-01 18:00", "stage": "review"},
                {"id": "T-003", "title": "Moltbook Claim", "assignee": "EconomicHunter", "status": "pending", "deadline": "2026-02-01 20:00", "stage": "briefing"},
                {"id": "T-006", "title": "Abat Agency Landing Page", "assignee": "WebsiteBuilder", "status": "in_progress", "deadline": "2026-02-01 17:30", "stage": "coding"}
            ],
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

def log_op(user, action, details):
    db = get_db()
    db["operations"].insert(0, {
        "timestamp": datetime.datetime.now().isoformat(),
        "user": user,
        "action": action,
        "details": details
    })
    # Keep last 50 ops
    db["operations"] = db["operations"][:50]
    save_db(db)

# --- WebSocket Manager ---
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
            await connection.send_text(json.dumps(data))

manager = ConnectionManager()

# --- Endpoints ---
@app.get("/api/data")
async def fetch_data():
    return get_db()

@app.post("/api/operation")
async def create_op(op: dict):
    log_op(op['user'], op['action'], op['details'])
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
