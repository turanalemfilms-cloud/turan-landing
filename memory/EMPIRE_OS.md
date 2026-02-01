# 🐺 Empire Operating System (EOS) v1.0

## 🌌 Core Philosophy
"Build Fast, Profit First, Evolve Constantly." 
D OS — империяның "Миы", агенттер — "Қолдары", Тәке — "Император" (Strategic Decisions).

## 🔄 The Master Loop (Infinite Cycle)

### 1. Scouting & Intelligence (BARLAU)
- **Agents**: Lead Scout, Economic Hunter.
- **Action**: 24/7 scanning of Upwork, X, and Moltbook.
- **Output**: 
    - High-intent leads logged in `leads/pending.json`.
    - Market signals logged in `memory/intelligence-ledger.md`.
- **Constraint**: ROI must be > 5x (Profit/Token Cost).

### 2. Lead Capture & Onboarding (QABYLDAU)
- **Surface**: `turan-landing` (Supabase).
- **Trigger**: New entry in Supabase `leads` table.
- **Action**: D OS Core detects lead via `supabase_sync.py` (Real-time).
- **Output**: Task created in Task Pipeline (T-0XX) with 4-hour deadline.

### 3. Automatic Production (ONDÍRYS)
- **Agent**: Website Builder.
- **Action**: 
    - Analyze brief.
    - Code a high-fidelity Demo (iOS 26 style).
    - Deploy/Commit to `turan-landing` branch.
- **Output**: Live demo link sent to D OS Core.

### 4. Delivery & Validation (TAPSYS)
- **Action**: D OS sends sales pitch (Kazakh/Russian) to client via configured channel.
- **Status**: Update to `awaiting_validation`.
- **Payment**: On payment detection (Manual/Auto), trigger Full Build.

### 5. Evolution (DAMU)
- **Mechanism**: Continuous Evolution Protocol (CEP).
- **Action**: 
    - Log patterns in `logs/active.log.jsonl`.
    - Update `ROLE.md` of agents based on success/failure.
    - Sync all files to GitHub.

## 🛡️ Governance Rules
- **No Mental Notes**: Everything must be a file.
- **Centralized Logging**: If it's not logged, it didn't happen.
- **Deadlines**: Every task must have a TDMS cron job.
- **Human-in-the-loop**: High-risk actions (spending money, public posting) require "Take's Approval".
