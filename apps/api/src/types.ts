import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  // D1 Database
  DB: D1Database;
  // KV Namespace for caching
  CACHE: KVNamespace;
  // Environment variables
  PRIVY_APP_ID: string;
  PRIVY_APP_SECRET: string;
  RPC_URL: string;
  CHAIN_ID: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

/**
 * Context variables available in request handlers
 * Set by middleware and accessible via c.get('key')
 */
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    userId?: string;
  }
}

export interface User {
  id: string;
  privy_user_id: string;
  safe_address: string;
  owner_address: string;
  total_deposited: string;
  created_at: string;
  updated_at: string;
}

export interface PrivyClaims {
  userId: string;
  appId: string;
  issuer: string;
  issuedAt: number;
  expiration: number;
}

