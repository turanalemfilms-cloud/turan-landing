import os
import json
import asyncio
from supabase import create_async_client, AsyncClient

# Load environment variables from frontend .env
ENV_PATH = "/Users/gulzhanserikbay/Documents/turan-landing/frontend/.env"
WORKSPACE_PATH = "/Users/gulzhanserikbay/.openclaw/workspace"

def load_env():
    env_vars = {}
    with open(ENV_PATH, "r") as f:
        for line in f:
            if "=" in line:
                key, value = line.strip().split("=", 1)
                env_vars[key] = value
    return env_vars

env = load_env()
url: str = env.get("VITE_SUPABASE_URL")
key: str = env.get("VITE_SUPABASE_ANON_KEY")

async def process_lead(supabase: AsyncClient, lead):
    print(f"🔥 ACTION TAKEN: New Lead from {lead.get('name')} for {lead.get('business_name')}")
    # Log to central logging
    log_entry = {
        "timestamp": os.popen("date -u +%Y-%m-%dT%H:%M:%SZ").read().strip(),
        "event": "NEW_LEAD_DETECTED",
        "details": f"Lead from {lead.get('name')} ({lead.get('business_name')}) is being processed via ROBUST ASYNC sync."
    }
    with open(f"{WORKSPACE_PATH}/logs/active.log.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")
    
    # Update status immediately
    try:
        await supabase.table("leads").update({"status": "in_progress", "notes": "D OS Core active."}).eq("id", lead.get("id")).execute()
    except Exception as e:
        print(f"⚠️ Status update failed: {e}")

async def check_new_leads(supabase: AsyncClient):
    print("🛰️ Scanning for new leads...")
    try:
        response = await supabase.table("leads").select("*").eq("status", "new").execute()
        leads = response.data
        if leads:
            for lead in leads:
                await process_lead(supabase, lead)
        else:
            print("✅ No new leads found.")
    except Exception as e:
        print(f"❌ Scan Error: {str(e)}")

async def main():
    supabase: AsyncClient = await create_async_client(url, key)
    
    print("⚡ Starting Robust Lead Monitor (Polling Mode for Stability)...")
    try:
        while True:
            await check_new_leads(supabase)
            # Poll every 1 minute for near real-time without channel errors
            await asyncio.sleep(60)
    except Exception as e:
        print(f"❌ Monitor Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
