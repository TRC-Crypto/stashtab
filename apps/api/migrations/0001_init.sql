-- Stashtab Database Schema
-- This migration creates the initial database structure

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  privy_user_id TEXT UNIQUE NOT NULL,
  safe_address TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  total_deposited TEXT DEFAULT '0',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_privy_id ON users(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_users_safe_address ON users(safe_address);

-- Transactions table for history
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdraw', 'send', 'receive', 'supply', 'redeem'
  amount TEXT NOT NULL,
  to_address TEXT,
  from_address TEXT,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TEXT NOT NULL,
  confirmed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for user transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

