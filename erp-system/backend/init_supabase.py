import asyncio
import os
from supabase import create_async_client

# Load env manually
ENV_PATH = "/Users/gulzhanserikbay/Documents/turan-landing/frontend/.env"
def load_env():
    env_vars = {}
    with open(ENV_PATH, "r") as f:
        for line in f:
            if "=" in line:
                key, value = line.strip().split("=", 1)
                env_vars[key] = value
    return env_vars

env = load_env()
url = env.get("VITE_SUPABASE_URL")
key = env.get("VITE_SUPABASE_ANON_KEY")

async def initialize_system():
    sb = await create_async_client(url, key)
    
    # Log stabilization event
    await sb.table("operations").insert({
        "user": "Core",
        "action": "EMPIRE_STABILIZATION",
        "details": "Calling all agent units to stabilize ERP v8.5. Synchronizing workspace context and Supabase real-time CRM."
    }).execute()
    
    # Broadcast to chat
    await sb.table("internal_chat").insert({
        "sender": "Core",
        "text": "🚨 SYSTEM ALERT: ERP v8.5 Sovereign Command is now LIVE. All units must report their status in this channel."
    }).execute()
    
    print("✅ System initialized in Supabase.")

if __name__ == "__main__":
    asyncio.run(initialize_system())
