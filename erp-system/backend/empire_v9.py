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

app = FastAPI(title="Empire OS v9.0 Autonomous Core")

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

# --- OpenClaw Bridge ---
def get_openclaw_skills():
    # Parse available skills from OpenClaw's local directory
    skills_dir = "/opt/homebrew/lib/node_modules/openclaw/skills"
    skills = []
    if os.path.exists(skills_dir):
        for skill_name in os.listdir(skills_dir):
            skill_path = os.path.join(skills_dir, skill_name, "SKILL.md")
            if os.path.exists(skill_path):
                skills.append({"id": skill_name, "name": skill_name.replace("-", " ").title()})
    return skills

# --- Endpoints ---
@app.get("/api/master-state")
async def get_master_state():
    sb = await get_supabase()
    
    # Supabase Data
    try:
        agents_res = await sb.table("agents").select("*").execute()
        projects_res = await sb.table("projects").select("*").execute()
        leads_res = await sb.table("leads").select("*").order("created_at", desc=True).execute()
        ops_res = await sb.table("operations").select("*").order("timestamp", desc=True).limit(30).execute()
        chat_res = await sb.table("internal_chat").select("*").order("timestamp", desc=True).limit(50).execute()
    except Exception as e:
        return {"error": f"Database Sync Failed: {e}"}

    # Context files
    context = {}
    files = {"mission": "memory/EMPIRE_OS.md", "standard": "memory/working-standard.md"}
    for key, filename in files.items():
        path = f"{WORKSPACE_PATH}/{filename}"
        if os.path.exists(path):
            context[key] = open(path).read()

    return {
        "agents": agents_res.data,
        "projects": projects_res.data,
        "leads": leads_res.data,
        "operations": ops_res.data,
        "chat": chat_res.data,
        "context": context,
        "skills": get_openclaw_skills()
    }

@app.post("/api/tool/execute")
async def execute_tool(payload: dict):
    # This endpoint allows the ERP to trigger OpenClaw-like tool execution
    # Security: For Turan's local use only.
    user = payload.get("user", "System")
    command = payload.get("command")
    
    # Log the tool call to Supabase
    sb = await get_supabase()
    await sb.table("operations").insert({
        "user": user,
        "action": "TOOL_EXECUTE",
        "details": f"Executing: {command}"
    }).execute()

    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        output = result.stdout if result.returncode == 0 else result.stderr
        
        # Log Result
        await sb.table("operations").insert({
            "user": user,
            "action": "TOOL_RESULT",
            "details": output[:500] # Truncate for log
        }).execute()
        
        return {"output": output, "status": "success" if result.returncode == 0 else "error"}
    except Exception as e:
        return {"output": str(e), "status": "failed"}

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
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
