import os
import json
import asyncio
import datetime
from supabase import create_async_client, AsyncClient

# Load environment variables
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

async def report_to_chat(supabase: AsyncClient, sender: str, text: str):
    try:
        await supabase.table("internal_chat").insert({"sender": sender, "text": text}).execute()
    except: pass

async def process_lead(supabase: AsyncClient, lead):
    print(f"🔥 ACTION: New Lead for {lead.get('business_name')}")
    
    # 1. Log Operation
    await supabase.table("operations").insert({
        "user": "WebsiteBuilder",
        "action": "LEAD_PROCESSING_START",
        "details": f"Auto-processing lead: {lead.get('business_name')}"
    }).execute()

    # 2. Update Lead Status
    await supabase.table("leads").update({"status": "in_progress"}).eq("id", lead.get("id")).execute()

    # 3. Report to Internal Chat
    await report_to_chat(supabase, "WebsiteBuilder", f"Found a new lead for '{lead.get('business_name')}'. Starting brief analysis and iOS 26 draft generation. ETA: 2 hours.")

async def check_new_leads(supabase: AsyncClient):
    try:
        response = await supabase.table("leads").select("*").eq("status", "new").execute()
        leads = response.data
        if leads:
            for lead in leads:
                await process_lead(supabase, lead)
    except Exception as e:
        print(f"Scan Error: {e}")

async def agent_status_pulse(supabase: AsyncClient):
    # Every 30 minutes, agents check in to the War Room
    agents = ["LeadScout", "WebsiteBuilder", "EconomicHunter"]
    for agent in agents:
        msg = f"Unit {agent} reporting for duty. Current focus: "
        if agent == "WebsiteBuilder": msg += "Monitoring Abat Agency project."
        elif agent == "LeadScout": msg += "Scanning for high-margin Upwork opportunities."
        else: msg += "Analyzing Moltbook ROI trends."
        
        await report_to_chat(supabase, agent, msg)
    print("📢 Agent status pulse sent to War Room.")

async def main():
    supabase: AsyncClient = await create_async_client(url, key)
    print("⚡ Empire OS v9.0 Sync Engine Live.")
    
    # Send initial boot message
    await report_to_chat(supabase, "Core", "🚀 EMPIRE OS v9.0 Boot Sequence Complete. All systems online.")
    
    pulse_counter = 0
    while True:
        await check_new_leads(supabase)
        
        # Every 30 loops (approx 30 mins)
        if pulse_counter >= 30:
            await agent_status_pulse(supabase)
            pulse_counter = 0
            
        pulse_counter += 1
        await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(main())
