import os
import json
import asyncio
import datetime
import subprocess
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_async_client, AsyncClient

app = FastAPI(title="Empire OS v9.5 Unified Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_PATH = "/Users/gulzhanserikbay/.openclaw/workspace"
ENV_PATH = "/Users/gulzhanserikbay/Documents/turan-landing/frontend/.env"

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

async def get_supabase():
    return await create_async_client(SUPABASE_URL, SUPABASE_KEY)

# --- The Bridge Sync Logic ---
async def sync_openclaw_to_supabase():
    """Syncs local OpenClaw state to Supabase for global visibility."""
    while True:
        try:
            sb = await get_supabase()
            # 1. Sync Sessions (Example: reading from OpenClaw internal API or logs)
            # For now, we simulate this by logging a "Heartbeat Sync"
            await sb.table("operations").insert({
                "agent_id": "Core",
                "action_type": "SYSTEM_SYNC",
                "details": "Synchronizing OpenClaw state with Empire OS Bridge."
            }).execute()
            
            await asyncio.sleep(300) # Every 5 mins
        except Exception as e:
            print(f"Bridge Sync Error: {e}")
            await asyncio.sleep(10)

# --- Endpoints ---
@app.get("/api/master-state")
async def get_master_state():
    sb = await get_supabase()
    try:
        # Integrated data fetch
        agents = await sb.table("agents").select("*").execute()
        leads = await sb.table("leads").select("*").order("created_at", desc=True).execute()
        ops = await sb.table("operations").select("*").order("timestamp", desc=True).limit(50).execute()
        chat = await sb.table("internal_chat").select("*").order("timestamp", desc=True).limit(50).execute()
        sessions = await sb.table("openclaw_sessions").select("*").execute()
        
        return {
            "agents": agents.data,
            "leads": leads.data,
            "operations": ops.data,
            "chat": chat.data,
            "sessions": sessions.data
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/chat/send")
async def send_chat_msg(msg: dict):
    sb = await get_supabase()
    await sb.table("internal_chat").insert({
        "sender": msg['sender'],
        "text": msg['text'],
        "type": msg.get('type', 'info')
    }).execute()
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            state = await get_master_state()
            await websocket.send_text(json.dumps(state))
            await asyncio.sleep(2)
    except WebSocketDisconnect: pass

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.create_task(sync_openclaw_to_supabase())
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
