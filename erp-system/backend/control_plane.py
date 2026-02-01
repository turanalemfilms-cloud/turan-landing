import os
import json
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List

app = FastAPI(title="D OS Control Plane (EOS)")

# --- Models ---
class WorkflowRun(BaseModel):
    flow_id: str
    data: dict

# --- Workflow Engine ---
async def execute_flow(flow_id: str, input_data: dict):
    flow_path = f"erp-system/flows/{flow_id}.json"
    if not os.path.exists(flow_path):
        return {"error": "Flow not found"}
    
    with open(flow_path, "r") as f:
        flow = json.load(f)
    
    print(f"🌀 Starting Flow: {flow['name']}")
    for step in flow['steps']:
        print(f"➡️ Executing Step {step['step']}: {flow['name']}")
        # Integration logic here: call subprocesses, agents, etc.
        # This is where we'd build the "n8n" style execution.
    
    # Log completion
    with open("logs/active.log.jsonl", "a") as f:
        log = {"timestamp": "...", "event": "FLOW_COMPLETE", "details": f"Flow {flow_id} finished."}
        f.write(json.dumps(log) + "\n")

# --- Endpoints ---
@app.get("/api/health")
async def health():
    return {"status": "EOS_ACTIVE", "core": "D OS v3.0"}

@app.post("/api/workflow/run")
async def trigger_flow(run: WorkflowRun, background_tasks: BackgroundTasks):
    background_tasks.add_task(execute_flow, run.flow_id, run.data)
    return {"status": "QUEUED", "flow_id": run.flow_id}

@app.get("/api/dashboard")
async def get_dashboard():
    # Merge all local intelligence into one JSON for the UI
    with open("memory/erp-dashboard.md", "r") as f:
        erp = f.read()
    return {"erp": erp}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
