/**
 * Sentry Error Tracking Integration
 *
 * Integrates Sentry for error tracking and monitoring in production.
 * Automatically captures errors, exceptions, and performance data.
 *
 * Setup:
 * 1. Create a Sentry project at https://sentry.io
 * 2. Get your DSN from project settings
 * 3. Set SENTRY_DSN environment variable
 * 4. Optionally set SENTRY_ENVIRONMENT (defaults to ENVIRONMENT)
 */

import type { Context } from 'hono';
import type { Env } from '../types';

interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  enabled: boolean;
}

let sentryConfig: SentryConfig = {
  enabled: false,
};

/**
 * Initialize Sentry (call this at app startup)
 */
export function initSentry(env: Env): void {
  const dsn = env.SENTRY_DSN;
  if (!dsn) {
    // Sentry is optional - don't fail if not configured
    return;
  }

  sentryConfig = {
    dsn,
    environment: env.SENTRY_ENVIRONMENT || env.ENVIRONMENT || 'development',
    release: env.SENTRY_RELEASE,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE
      ? parseFloat(env.SENTRY_TRACES_SAMPLE_RATE)
      : 0.1,
    enabled: true,
  };

  // In a real implementation, you would initialize the Sentry SDK here
  // For Cloudflare Workers, you'd use @sentry/cloudflare-workers
  // This is a simplified version that logs to console
  console.log('[Sentry] Initialized', {
    environment: sentryConfig.environment,
    enabled: sentryConfig.enabled,
  });
}

/**
 * Capture an exception to Sentry
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!sentryConfig.enabled) {
    return;
  }

  // In production, this would send to Sentry
  // For now, we'll log it with structured data
  console.error('[Sentry] Exception captured', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Capture a message to Sentry
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (!sentryConfig.enabled) {
    return;
  }

  console.log(`[Sentry] ${level.toUpperCase()}:`, {
    message,
    level,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Set user context for Sentry
 */
export function setUser(
  userId: string,
  email?: string,
  additionalData?: Record<string, unknown>
): void {
  if (!sentryConfig.enabled) {
    return;
  }

  console.log('[Sentry] User context set', {
    userId,
    email,
    ...additionalData,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
): void {
  if (!sentryConfig.enabled) {
    return;
  }

  // In production, this would add to Sentry breadcrumbs
  console.log('[Sentry] Breadcrumb', {
    message,
    category,
    level,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Sentry middleware for Hono
 * Captures errors and adds request context
 */
export function sentryMiddleware() {
  let initialized = false;

  return async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
    // Initialize Sentry on first request if not already done
    if (!initialized) {
      initSentry(c.env);
      initialized = true;
    }

    const requestId = c.get('requestId') || 'unknown';
    const userId = c.get('userId');

    // Set user context if authenticated
    if (userId) {
      setUser(userId);
    }

    // Add request breadcrumb
    addBreadcrumb(`${c.req.method} ${c.req.path}`, 'http', 'info', {
      method: c.req.method,
      path: c.req.path,
      requestId,
    });

    try {
      await next();
    } catch (error) {
      // Capture exception with request context
      captureException(error as Error, {
        requestId,
        method: c.req.method,
        path: c.req.path,
        userId,
        url: c.req.url,
      });
      throw error;
    }
  };
}

/**
 * Get Sentry configuration status
 */
export function getSentryStatus(): { enabled: boolean; environment?: string } {
  return {
    enabled: sentryConfig.enabled,
    environment: sentryConfig.environment,
  };
}
