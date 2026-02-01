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

async def update_system():
    sb = await create_async_client(url, key)
    
    # 1. Update Leads
    await sb.table('leads').update({
        'status': 'completed', 
        'notes': 'Draft v1.0 generated in iOS 26 style. Path: src/pages/clients/abat-agency/Landing.tsx'
    }).ilike('business_name', '%abat agency%').execute()
    
    # 2. Log Operation
    await sb.table('operations').insert({
        'user': 'WebsiteBuilder', 
        'action': 'DRAFT_GENERATED', 
        'details': 'Landing page draft for Abat Agency complete. Styles: Glassmorphism, Tailwind, Framer Motion.'
    }).execute()
    
    # 3. Chat Notification
    await sb.table('internal_chat').insert({
        'sender': 'WebsiteBuilder', 
        'text': '🔥 DONE: Abat Agency landing page draft is ready. Emperor, please review at src/pages/clients/abat-agency/Landing.tsx'
    }).execute()
    
    print("✅ System updated after draft generation.")

if __name__ == "__main__":
    asyncio.run(update_system())
