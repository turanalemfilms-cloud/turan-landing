-- Empire ERP v9.1 Force-Setup Schema
-- Run this in Supabase SQL Editor

-- 1. DROP EXISTING TABLES TO ENSURE CLEAN STRUCTURE
-- Warning: This will delete current data in these tables.
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS internal_chat CASCADE;

-- 2. RECREATE TABLES WITH CORRECT SCHEMA
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  kpi TEXT,
  status TEXT DEFAULT 'idle',
  last_action TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  description TEXT,
  revenue_est TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE operations (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "user" TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT
);

CREATE TABLE internal_chat (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'info'
);

-- 3. SEED INITIAL DATA
INSERT INTO agents (id, name, role, kpi, status, last_action)
VALUES 
  ('Emperor', 'Turan (Take)', 'Strategic Vision / CEO', 'Revenue Growth', 'Online', 'Reviewing ERP'),
  ('Core', 'D OS', 'Orchestrator / CTO', 'System Sync', 'Optimized', 'Managing Supabase v9.1'),
  ('LeadScout', 'Lead Scout', 'Lead Gen', '5 Leads/Day', 'Idle', 'Monitoring X/Moltbook'),
  ('WebsiteBuilder', 'Website Builder', 'Site Gen', 'Draft < 2h', 'Active', 'Syncing Supabase Leads');

INSERT INTO projects (id, name, status, description, revenue_est)
VALUES 
  ('P-001', 'Website Builder Service', 'Active', 'AI-powered rapid landing page generation.', '$500/mo');

-- 4. SECURITY POLICIES (OPEN FOR INITIAL SETUP)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Full Access" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON operations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON internal_chat FOR ALL USING (true) WITH CHECK (true);
