# ⚙️ Empire Operating System (EOS) Standard Workflow

## 1. Intelligence & Acquisition (BARLAU)
- **Monitoring**: Lead Scout & Economic Hunter scan Upwork (RSS/API), X (Bird), and Moltbook (API) 24/7.
- **Filtering**: Every opportunity is passed through the **ROI Hunter** logic (Profit > 5x Token Cost).
- **Registration**: Validated leads are injected into Supabase `leads` table with status `new`.

## 2. Real-time Orchestration (QABYLDAU)
- **Detection**: `erp-system/backend/supabase_sync.py` (Polling/Real-time) detects the new entry.
- **Assignment**: D OS Core creates a **Task ID** (T-XXX) and assigns a specialized agent.
- **Initialization**: A TDMS (Tactical Deadline) is set via `cron`.

## 3. Autonomous Production (ONDÍRYS)
- **Agent Action**: **Website Builder** triggers a sub-agent session to:
    - Clone the boilerplate/repo.
    - Generate React/Tailwind code based on the brief.
    - Update the internal **Agent Chat** with progress updates.
- **Visibility**: Every "Tool Call" and "File Edit" is logged to the Supabase `operations` table.

## 4. Delivery & Growth (TAPSYS & DAMU)
- **Review**: Turan (Emperor) reviews the draft via the ERP "Website CRM" tab.
- **Pitch**: D OS Core sends the automated pitch to the client.
- **Self-Update**: Post-completion, the **CEP (Continuous Evolution Protocol)** analyzes the task log and updates the agent's `ROLE.md` to refine future performance.

## 🛡️ Governance
- **Truth Source**: Supabase is the only database.
- **Communication**: All inter-agent comms happen in the ERP **Internal Chat**.
- **Authority**: High-risk actions require manual Emperor approval.
