-- Multi-tenant support for white-label API
-- Migration 0003: Add organizations and tenant isolation

-- Organizations/Workspaces table
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  branding JSON, -- { logo_url, primary_color, secondary_color, domain }
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Link users to organizations
-- Note: This will fail if users table doesn't exist yet (run 0001_init.sql first)
-- In production, you'd use ALTER TABLE IF COLUMN NOT EXISTS or similar
-- For now, we'll assume the column doesn't exist yet
ALTER TABLE users ADD COLUMN organization_id TEXT REFERENCES organizations(id);

-- Organization-specific settings
CREATE TABLE IF NOT EXISTS organization_settings (
  organization_id TEXT PRIMARY KEY REFERENCES organizations(id),
  chain_id INTEGER NOT NULL DEFAULT 8453,
  rpc_url TEXT,
  enabled_features JSON, -- { yield: true, payments: true, fiat: false }
  webhook_url TEXT,
  created_at INTEGER NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_api_key ON organizations(api_key);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

