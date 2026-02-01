-- Empire ERP v9.0 Robust Database Schema
-- Run this in Supabase SQL Editor

-- 1. Drop existing tables if they conflict (DANGEROUS: Only use for fresh setup)
-- DROP TABLE IF EXISTS agents CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS operations CASCADE;
-- DROP TABLE IF EXISTS internal_chat CASCADE;

-- 2. Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  kpi TEXT,
  status TEXT DEFAULT 'idle',
  last_action TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  description TEXT,
  revenue_est TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Operational Logs Table
CREATE TABLE IF NOT EXISTS operations (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "user" TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT
);

-- 5. Internal Agent Chat Table
CREATE TABLE IF NOT EXISTS internal_chat (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'info'
);

-- 6. Seed Initial Data
INSERT INTO agents (id, name, role, kpi, status, last_action)
VALUES 
  ('Emperor', 'Turan (Take)', 'Strategic Vision / CEO', 'Revenue Growth', 'Online', 'Reviewing ERP'),
  ('Core', 'D OS', 'Orchestrator / CTO', 'System Sync', 'Optimized', 'Managing Supabase v9.0'),
  ('LeadScout', 'Lead Scout', 'Lead Gen', '5 Leads/Day', 'Idle', 'Monitoring X/Moltbook'),
  ('WebsiteBuilder', 'Website Builder', 'Site Gen', 'Draft < 2h', 'Active', 'Syncing Supabase Leads')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  last_action = EXCLUDED.last_action;

INSERT INTO projects (id, name, status, description, revenue_est)
VALUES 
  ('P-001', 'Website Builder Service', 'Active', 'AI-powered rapid landing page generation.', '$500/mo')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  description = EXCLUDED.description;

-- 7. Security (Optional: Disable if testing locally)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write" ON operations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write" ON internal_chat FOR ALL USING (true) WITH CHECK (true);
