import os
import json
from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict
import datetime

app = FastAPI(title="D OS - EMPIRE CORE")

# --- Centralized State ---
STATE_FILE = "erp-system/db/empire_state.json"

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {
        "emperor": {"name": "Turan (Take)", "role": "Strategic Vision"},
        "core": {"name": "D OS", "status": "Optimized", "tasks_orchestrated": 0},
        "agents": {
            "LeadScout": {"status": "Idle", "last_activity": None, "skills": ["Upwork", "X", "Moltbook"]},
            "EconomicHunter": {"status": "Idle", "last_activity": None, "skills": ["ROI", "Tokenomics"]},
            "FrontendDev": {"status": "Idle", "last_activity": None, "skills": ["React", "UI/UX"]},
            "WebsiteBuilder": {"status": "Active", "last_activity": None, "skills": ["Supabase", "Site Gen"]}
        },
        "global_tasks": []
    }

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

state = load_state()

# --- Real-time Notifications ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# --- Endpoints ---
@app.get("/api/state")
async def get_state():
    return state

@app.post("/api/agent/update")
async def update_agent(agent_id: str, data: dict):
    if agent_id in state["agents"]:
        state["agents"][agent_id].update(data)
        state["agents"][agent_id]["last_activity"] = datetime.datetime.now().isoformat()
        save_state(state)
        await manager.broadcast(json.dumps({"type": "AGENT_UPDATE", "id": agent_id}))
    return state["agents"].get(agent_id)

@app.post("/api/task/create")
async def create_task(task: dict):
    task["id"] = f"T-{len(state['global_tasks']) + 1:03d}"
    task["timestamp"] = datetime.datetime.now().isoformat()
    state["global_tasks"].append(task)
    save_state(state)
    await manager.broadcast(json.dumps({"type": "NEW_TASK", "task": task}))
    return task

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
