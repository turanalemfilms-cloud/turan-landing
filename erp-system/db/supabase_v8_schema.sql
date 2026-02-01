-- Empire ERP v8.0 Database Schema
-- Run this in Supabase SQL Editor

-- 1. Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  kpi TEXT,
  status TEXT DEFAULT 'idle',
  last_action TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT,
  description TEXT,
  revenue_est TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Operational Logs Table
CREATE TABLE IF NOT EXISTS operations (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "user" TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT
);

-- 4. Internal Agent Chat Table
CREATE TABLE IF NOT EXISTS internal_chat (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'info' -- 'info', 'alert', 'success'
);

-- Initial Data
INSERT INTO agents (id, name, role, kpi, status, last_action)
VALUES 
  ('Emperor', 'Turan (Take)', 'Strategic Vision / CEO', 'Revenue Growth', 'Online', 'Directing Expansion'),
  ('Core', 'D OS', 'Orchestrator / CTO', 'System Sync', 'Optimized', 'Migrating to Supabase'),
  ('LeadScout', 'Lead Scout', 'Lead Gen', '5 Leads/Day', 'Idle', 'Waiting'),
  ('WebsiteBuilder', 'Website Builder', 'Site Gen', 'Draft < 2h', 'Active', 'Processing Leads')
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, name, status, description, revenue_est)
VALUES 
  ('P-001', 'Website Builder Service', 'Active', 'AI-powered rapid landing page generation.', '$500/mo')
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON agents FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON operations FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON internal_chat FOR ALL USING (true);
