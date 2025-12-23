-- Migration: Add KYC and notification fields
-- This migration adds KYC status tracking and push notification support

-- Add KYC fields to users table
ALTER TABLE users ADD COLUMN kyc_status TEXT DEFAULT 'none';
-- Possible values: 'none', 'pending', 'in_review', 'approved', 'declined', 'expired'

ALTER TABLE users ADD COLUMN kyc_provider TEXT;
-- Possible values: 'persona', 'sumsub'

ALTER TABLE users ADD COLUMN kyc_inquiry_id TEXT;
-- The verification/inquiry ID from the KYC provider

ALTER TABLE users ADD COLUMN kyc_level TEXT DEFAULT 'none';
-- Possible values: 'none', 'basic', 'standard', 'enhanced'

ALTER TABLE users ADD COLUMN kyc_verified_at TEXT;
-- Timestamp when KYC was approved

ALTER TABLE users ADD COLUMN email TEXT;
-- User's email address (from Privy or entered)

-- Index for KYC status lookups
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_kyc_inquiry ON users(kyc_inquiry_id);

-- Push notification tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL, -- 'ios', 'android', 'web'
  device_id TEXT,
  enabled INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for push token lookups
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_enabled ON push_tokens(enabled);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY,
  email_enabled INTEGER DEFAULT 1,
  email_marketing INTEGER DEFAULT 0,
  push_enabled INTEGER DEFAULT 1,
  push_transactions INTEGER DEFAULT 1,
  push_security INTEGER DEFAULT 1,
  push_marketing INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification history for tracking sent notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'email', 'push'
  category TEXT NOT NULL, -- 'transaction', 'security', 'marketing', 'system'
  title TEXT NOT NULL,
  body TEXT,
  data TEXT, -- JSON string for additional data
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered', 'read'
  sent_at TEXT,
  delivered_at TEXT,
  read_at TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for notification lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Fiat orders table for tracking purchases
CREATE TABLE IF NOT EXISTS fiat_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'stripe', 'moonpay'
  provider_order_id TEXT,
  type TEXT NOT NULL, -- 'on', 'off'
  status TEXT DEFAULT 'pending',
  fiat_currency TEXT NOT NULL,
  crypto_currency TEXT NOT NULL,
  fiat_amount TEXT NOT NULL,
  crypto_amount TEXT,
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fiat order lookups
CREATE INDEX IF NOT EXISTS idx_fiat_orders_user ON fiat_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_fiat_orders_provider ON fiat_orders(provider);
CREATE INDEX IF NOT EXISTS idx_fiat_orders_status ON fiat_orders(status);

