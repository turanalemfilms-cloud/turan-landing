from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_PATH = "/Users/gulzhanserikbay/.openclaw/workspace"

@app.get("/api/status")
async def get_status():
    try:
        with open(f"{WORKSPACE_PATH}/memory/erp-dashboard.md", "r") as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/logs")
async def get_logs():
    try:
        with open(f"{WORKSPACE_PATH}/logs/active.log.jsonl", "r") as f:
            lines = f.readlines()
        return {"logs": [json.loads(l) for l in lines[-20:]]}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
