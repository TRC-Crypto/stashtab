/**
 * API Key Authentication Middleware
 *
 * Validates API keys and sets organization context for tenant isolation
 */

import type { Context, Next } from 'hono';
import { AuthenticationError, ErrorCode } from '../errors';
import type { Env } from '../types';

/**
 * Organization context stored in Hono context
 */
export interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  api_key: string;
  branding?: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    domain?: string;
  };
}

/**
 * API Key Authentication Middleware
 *
 * Validates API key from header or query param and sets organization context
 *
 * Usage:
 * ```typescript
 * app.use('/api/*', apiKeyAuth());
 * ```
 */
export function apiKeyAuth() {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    // Get API key from header or query param
    const apiKey = c.req.header('X-API-Key') || c.req.query('api_key');

    if (!apiKey) {
      throw new AuthenticationError(
        'API key required. Provide X-API-Key header or api_key query parameter.',
        ErrorCode.AUTH_MISSING_TOKEN
      );
    }

    // Validate API key format (basic check)
    if (apiKey.length < 32) {
      throw new AuthenticationError('Invalid API key format', ErrorCode.AUTH_INVALID_TOKEN);
    }

    // Look up organization by API key
    const orgResult = await c.env.DB.prepare('SELECT * FROM organizations WHERE api_key = ?')
      .bind(apiKey)
      .first();

    if (!orgResult) {
      throw new AuthenticationError('Invalid API key', ErrorCode.AUTH_INVALID_TOKEN);
    }

    const org = orgResult as any;

    // Parse branding JSON if present
    let branding: OrganizationContext['branding'] | undefined;
    if (org.branding) {
      try {
        branding = typeof org.branding === 'string' ? JSON.parse(org.branding) : org.branding;
      } catch {
        // Invalid JSON, ignore
      }
    }

    // Set organization context
    const orgContext: OrganizationContext = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      api_key: org.api_key,
      branding,
    };

    c.set('organization', orgContext);

    await next();
  };
}

/**
 * Get organization from context
 *
 * Throws if organization not set (should be called after apiKeyAuth middleware)
 */
export function getOrganization(c: Context<{ Bindings: Env }>): OrganizationContext {
  const org = c.get('organization');
  if (!org) {
    throw new AuthenticationError(
      'Organization context not found. Ensure apiKeyAuth middleware is applied.',
      ErrorCode.AUTH_INVALID_TOKEN
    );
  }
  return org;
}
