import os
import json
import asyncio
from supabase import create_client, Client

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
supabase: Client = create_client(url, key)

async def check_new_leads():
    print("🛰️ Checking for new leads in Supabase...")
    # ... logic remains the same ...

async def realtime_listener():
    print("⚡ Starting Real-time Lead Listener...")
    try:
        # Real-time listener for Supabase inserts
        channel = supabase.channel('public:leads')
        
        def on_insert(payload):
            lead = payload['new']
            print(f"🔥 IMMEDIATE ACTION: New Lead from {lead['name']}")
            # Trigger D OS logic instantly
            log_entry = {
                "timestamp": os.popen("date -u +%Y-%m-%dT%H:%M:%SZ").read().strip(),
                "event": "IMMEDIATE_LEAD_DETECTED",
                "details": f"Lead from {lead['name']} detected via REAL-TIME sync."
            }
            with open(f"{WORKSPACE_PATH}/logs/active.log.jsonl", "a") as f:
                f.write(json.dumps(log_entry) + "\n")
            
            # Update status immediately
            supabase.table("leads").update({"status": "in_progress"}).eq("id", lead["id"]).execute()

        channel.on('postgres_changes', event='INSERT', table='leads', callback=on_insert).subscribe()
        
        while True:
            await asyncio.sleep(1)
    except Exception as e:
        print(f"❌ Real-time Error: {str(e)}")

if __name__ == "__main__":
    # Run both periodic check and realtime listener
    loop = asyncio.get_event_loop()
    loop.create_task(check_new_leads())
    loop.run_until_complete(realtime_listener())
