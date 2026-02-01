# Context Limit Safety Protocol (v1.0)

## 1. Monitoring
- D OS monitors context usage during each turn.
- Alert Turan when usage exceeds 70%.

## 2. Compaction & Backup Process (Trigger at 80%)
- **Step 1: Deep Memory Flush.** Run `memory_search` and `memory_get` to summarize all active project states, decisions, and uncompleted tasks.
- **Step 2: File-Based Logging.** Write the current session's "distilled essence" into `memory/YYYY-MM-DD.md`.
- **Step 3: ERP Sync.** Ensure `erp-dashboard.md` and `daily-tracker.md` are 100% up to date.
- **Step 4: Git Backup.** Commit all changes and push to GitHub: `git add . && git commit -m "Backup: Context-driven sync" && git push origin main`.
- **Step 5: Compact Command.** Trigger OpenClaw's internal compaction to clear the history while keeping the "Essential Project Context".

## 3. Restoration
- Upon restart or compaction, immediately read `AGENTS.md`, `PROJECTS.md`, and the latest `memory/*.md` to restore the full operational mental model.
