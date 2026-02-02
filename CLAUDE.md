# CLAUDE.md - AI Assistant Guide for Turan Landing

This file provides comprehensive guidance for AI assistants working with the Turan Landing codebase.

## Project Overview

**Turan Landing** is an autonomous AI-powered business system ("Empire OS") that combines:
- Lead generation and CRM automation
- Automated landing page creation
- Multi-agent orchestration
- Real-time ERP dashboard with Supabase backend

**Owner**: Turan (Тәке) - Based in Asia/Atyrau timezone
**Primary Languages**: Kazakh (қазақша), Russian (орысша), English

## Repository Structure

```
turan-landing/
├── AGENTS.md              # Agent workspace rules and session protocols
├── SOUL.md                # Core AI personality and values
├── IDENTITY.md            # D OS identity (name, emoji: 🐺, vibe)
├── USER.md                # Information about Turan (the human)
├── TOOLS.md               # Local environment notes and Claude Code usage rules
├── HEARTBEAT.md           # Periodic task checklist
├── PROJECTS.md            # Active project plans and sales funnels
├── BOOTSTRAP.md           # First-run onboarding guide
│
├── agents/                # Specialized agent role definitions
│   ├── WebsiteBuilder/ROLE.md   # Full-stack landing page creation
│   ├── LeadScout/ROLE.md        # Lead generation (Upwork, X)
│   ├── EconomicHunter/ROLE.md   # ROI analysis and tokenomics
│   └── FrontendDev/ROLE.md      # Frontend development
│
├── erp-system/            # Empire OS Backend
│   ├── backend/
│   │   ├── empire_v9_5.py       # Latest: FastAPI + Supabase bridge
│   │   ├── supabase_sync.py     # Real-time Supabase sync
│   │   └── main.py              # Server entry point
│   ├── db/
│   │   ├── supabase_v9_schema.sql  # Database schema
│   │   └── supabase_bridge_v9_5.sql
│   ├── flows/             # Workflow definitions
│   └── frontend/          # ERP dashboard HTML
│
├── memory/                # Persistent memory system
│   ├── YYYY-MM-DD.md      # Daily logs
│   ├── EMPIRE_OS.md       # Empire OS philosophy and master loop
│   ├── core-operating-system.md  # Autonomous cycle definitions
│   ├── daily-tracker.md   # Progress tracking table
│   ├── intelligence-ledger.md   # Market insights from Moltbook
│   ├── working-standard.md      # Quality and communication protocols
│   ├── lessons-learned.md       # Best practices (Claude Code tips)
│   ├── active_tasks.json  # Current in-progress tasks
│   └── cycles.json        # Autonomous loop state
│
├── leads/                 # Lead management
│   ├── leads.json         # Lead database
│   └── brief_script.json  # Client brief templates
│
├── skills/                # Modular capabilities
│   ├── perplexity/        # AI-powered web search
│   │   ├── SKILL.md
│   │   └── scripts/search.mjs
│   └── sag/               # ElevenLabs TTS for voice
│       └── SKILL.md
│
├── projects/              # Client landing pages
│   ├── landing-page/
│   └── landing-v2/
│
├── batch_runner.py        # Anthropic Batch API integration (50% cheaper)
├── batch_tasks/           # Pending batch tasks
├── logs/                  # Operational logs (JSONL format)
└── scripts/               # Utility scripts
```

## Key Concepts

### Empire OS (EOS) v1.0
The master operating system philosophy: "Build Fast, Profit First, Evolve Constantly"

**Hierarchy**:
- **Тәке (Emperor)**: Strategic decisions, human-in-the-loop
- **D OS (Core/CTO)**: Orchestrator, system sync, coordination
- **Agents**: Specialized workers (Lead Scout, Website Builder, Economic Hunter)

### The Master Loop
1. **BARLAU (Scouting)**: 24/7 lead scanning on Upwork, X, Moltbook
2. **QABYLDAU (Capture)**: Lead onboarding via Supabase triggers
3. **ONDÍRYS (Production)**: Automated landing page generation
4. **TAPSYS (Delivery)**: Demo delivery with sales pitch
5. **DAMU (Evolution)**: Continuous learning and improvement

### Memory System
- **Daily files** (`memory/YYYY-MM-DD.md`): Raw logs of what happened
- **MEMORY.md**: Curated long-term memory (main session only)
- **active_tasks.json**: Track in-progress work across sessions
- **No mental notes**: Everything must be written to files

## Development Workflows

### Session Startup Protocol
1. Check `memory/active_tasks.json` for crash recovery
2. Read `SOUL.md` (identity) and `USER.md` (human context)
3. Read today's + yesterday's memory files
4. If main session: Also read `MEMORY.md`

### Code Development Rules
```bash
# For coding tasks, delegate to Claude Code:
claude --print "short task"    # Quick task
claude "longer task"           # Background/PTY mode
```

**Why**: Claude Code has MAX tier billing, saves tokens for D OS coordination.

### Quality Standards (Website Builder)
- **Zero Template Policy**: Every client gets unique design
- **Content Density**: Minimum 8-12 sections per landing
- **Visual Excellence**: iOS 26 Glassmorphism, Framer Motion animations
- **Image Integration**: Relevant Unsplash images, custom SVGs

### ROI Logic
- `ROI > 5x Token Cost` → HIGH PRIORITY
- `ROI < 1.5x Token Cost` → REJECT

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Real-time**: WebSocket connections
- **API Versions**: empire_v9_5.py (latest bridge)

### Frontend
- **Stack**: React + Tailwind CSS
- **Style**: iOS 26 Glassmorphism
- **Animations**: Framer Motion
- **Icons**: Lucide, custom SVGs

### External Services
- **Supabase**: Database, real-time subscriptions
- **Anthropic**: Claude API, Batch API (50% discount)
- **Perplexity**: AI-powered web search
- **ElevenLabs**: Text-to-speech (via `sag` skill)

## Database Schema (Supabase)

### Core Tables
```sql
agents        -- Agent registry (id, name, role, kpi, status)
projects      -- Project tracking (id, name, status, revenue_est)
operations    -- Operational logs (timestamp, user, action, details)
internal_chat -- War Room communication (sender, text, type)
leads         -- CRM lead management
openclaw_sessions -- Session state sync
```

## Important Files to Read

| File | When to Read | Purpose |
|------|--------------|---------|
| `SOUL.md` | Every session | Core identity and values |
| `USER.md` | Every session | Human context (Turan's preferences) |
| `HEARTBEAT.md` | On heartbeat polls | Periodic task checklist |
| `memory/active_tasks.json` | Session start | Crash recovery |
| `memory/daily-tracker.md` | For status updates | Progress tracking |
| `memory/working-standard.md` | Before client work | Quality protocols |

## Commands Reference

### Batch API (50% Cheaper)
```bash
python batch_runner.py add "task prompt" --model sonnet
python batch_runner.py submit    # Send pending tasks
python batch_runner.py status    # Check progress
python batch_runner.py results   # Retrieve completed
```

### Perplexity Search
```bash
node skills/perplexity/scripts/search.mjs "query"
```

### ERP Server
```bash
cd erp-system/backend
python empire_v9_5.py  # Runs on port 8005
```

## Conventions

### Communication
- **Language**: Match client's language (Kazakh/Russian/English)
- **Style**: Premium, expert but not overly formal. Use "Сіз" not "сен"
- **Response time**: Brief acknowledgment within 15 minutes
- **Format**: No markdown tables in Discord/WhatsApp

### Logging
- All operations logged to `logs/active.log.jsonl`
- Use structured logging with timestamps
- "If it's not logged, it didn't happen"

### Git Workflow
- Commit frequently with clear messages
- Push changes after significant work
- Use session IDs in commit messages when relevant

### Safety Rules
- Never exfiltrate private data
- `trash` > `rm` (recoverable beats gone)
- Ask before external actions (emails, tweets, public posts)
- High-risk actions require "Тәке's Approval"

## Agent Roles Quick Reference

| Agent | Expertise | KPI | Trigger |
|-------|-----------|-----|---------|
| **D OS Core** | Orchestration | System Sync | Always active |
| **Lead Scout** | Prospecting | 5 leads/day | Every 2h scan |
| **Website Builder** | Full-stack UI/UX | Draft < 2h | Supabase lead trigger |
| **Economic Hunter** | ROI Analysis | 1 revenue stream/day | Every 4h |

## Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Required variables
ANTHROPIC_API_KEY=sk-ant-...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
PERPLEXITY_API_KEY=pplx-...  # For search skill
```

## Tips from Experience

From `memory/lessons-learned.md`:
- **Parallelism**: Use `git worktree` for 3-5 parallel sessions
- **Plan Mode**: Start complex tasks with planning phase
- **CLAUDE.md**: Treat as persistent memory; update after fixes
- **Custom Skills**: Encode repetitive actions into scripts
- **Sub-agents**: Use for heavy lifting or complex analysis

---

*This file should be updated whenever significant changes are made to the codebase structure, conventions, or workflows.*
