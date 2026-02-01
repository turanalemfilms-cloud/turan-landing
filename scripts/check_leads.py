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

async def get_leads():
    sb = await create_async_client(url, key)
    res = await sb.table("leads").select("*").eq("status", "in_progress").execute()
    print(f"COUNT: {len(res.data)}")
    for l in res.data:
        print(f"LEAD: {l['business_name']} | DESC: {l['business_description']}")

if __name__ == "__main__":
    asyncio.run(get_leads())
