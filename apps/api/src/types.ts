import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  // D1 Database
  DB: D1Database;
  // KV Namespace for caching
  CACHE: KVNamespace;
  // Core environment variables
  PRIVY_APP_ID: string;
  PRIVY_APP_SECRET: string;
  RPC_URL: string;
  CHAIN_ID: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  // Fiat on/off ramp providers (optional)
  STRIPE_PUBLIC_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  MOONPAY_API_KEY?: string;
  MOONPAY_SECRET_KEY?: string;
  MOONPAY_WEBHOOK_SECRET?: string;
  // KYC providers (optional)
  PERSONA_API_KEY?: string;
  PERSONA_TEMPLATE_ID?: string;
  PERSONA_WEBHOOK_SECRET?: string;
  SUMSUB_APP_TOKEN?: string;
  SUMSUB_SECRET_KEY?: string;
  SUMSUB_WEBHOOK_SECRET?: string;
  // Notification providers (optional)
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  EXPO_ACCESS_TOKEN?: string;
  // Monitoring (optional)
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  SENTRY_RELEASE?: string;
  SENTRY_TRACES_SAMPLE_RATE?: string;
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
