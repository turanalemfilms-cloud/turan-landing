-- Empire OS v9.5 Unified Bridge Schema
-- Run this in Supabase SQL Editor to unify OpenClaw and Empire OS

-- 1. DROP CONFLICTING TABLES
DROP TABLE IF EXISTS openclaw_sync CASCADE;
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS internal_chat CASCADE;

-- 2. OPERATIONS TABLE (The "Source of Truth" for all agent actions)
CREATE TABLE operations (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  agent_id TEXT NOT NULL, -- 'Core', 'LeadScout', 'WebsiteBuilder', etc.
  action_type TEXT NOT NULL, -- 'TOOL_CALL', 'FILE_EDIT', 'CHAT_MSG', 'API_REQUEST'
  tool_name TEXT, -- 'browser', 'exec', 'supabase', etc.
  details TEXT, -- Full description of the action
  status TEXT DEFAULT 'success', -- 'success', 'error', 'pending'
  metadata JSONB DEFAULT '{}' -- Store tool arguments or raw outputs
);

-- 3. INTERNAL CHAT / WAR ROOM (Consolidated Comms)
CREATE TABLE internal_chat (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender TEXT NOT NULL, -- Agent ID or 'Emperor'
  text TEXT NOT NULL,
  context_id TEXT, -- Link to a specific Task or Session
  type TEXT DEFAULT 'info' -- 'info', 'alert', 'success', 'system'
);

-- 4. AGENT SESSIONS (Bridging OpenClaw sessions to ERP)
CREATE TABLE openclaw_sessions (
  id TEXT PRIMARY KEY, -- OpenClaw Session Key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  agent_id TEXT,
  label TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'paused'
  transcript_summary TEXT
);

-- 5. INITIAL SYSTEM SEED
INSERT INTO internal_chat (sender, text, type)
VALUES ('System', 'Empire OS Bridge v9.5 Initialized. Listening for OpenClaw operations...', 'system');

-- 6. SECURITY & POLICIES
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE openclaw_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full Access" ON operations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access" ON internal_chat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access" ON openclaw_sessions FOR ALL USING (true) WITH CHECK (true);
