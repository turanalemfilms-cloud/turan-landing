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
    try:
        response = supabase.table("leads").select("*").eq("status", "new").execute()
        leads = response.data
        
        if not leads:
            print("✅ No new leads found.")
            return

        for lead in leads:
            print(f"🔥 New Lead Detected: {lead['business_name']} ({lead['name']})")
            # Log to central logging
            log_entry = {
                "timestamp": os.popen("date -u +%Y-%m-%dT%H:%M:%SZ").read().strip(),
                "event": "NEW_LEAD_DETECTED",
                "details": f"Lead from {lead['name']} for {lead['business_name']} is being processed."
            }
            with open(f"{WORKSPACE_PATH}/logs/active.log.jsonl", "a") as f:
                f.write(json.dumps(log_entry) + "\n")
            
            # Spawn Website Builder to handle this
            # Note: In a real scenario, we'd trigger a sub-agent session here.
            # For now, we update status to show we've acknowledged it.
            supabase.table("leads").update({"status": "in_progress", "notes": "D OS WebsiteBuilder is analyzing the brief."}).eq("id", lead["id"]).execute()
            print(f"⚡ Status updated for {lead['business_name']}")

    except Exception as e:
        print(f"❌ Error checking leads: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_new_leads())
