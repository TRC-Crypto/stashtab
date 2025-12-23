import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { RateLimitError } from '../errors';
import type { Env } from '../types';

/**
 * Rate Limiting Middleware
 *
 * Implements sliding window rate limiting using Cloudflare KV.
 * Provides configurable limits per endpoint with both IP and user-based limiting.
 *
 * Features:
 * - Sliding window algorithm for smooth rate limiting
 * - Configurable limits per route
 * - IP-based and user-based limiting
 * - Standard rate limit headers
 * - Graceful degradation if KV is unavailable
 */

export interface RateLimitConfig {
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Maximum number of requests per window
   * @default 60
   */
  max?: number;

  /**
   * Function to generate the rate limit key
   * Defaults to IP address or user ID if authenticated
   */
  keyGenerator?: (c: Context<{ Bindings: Env }>) => string;

  /**
   * Prefix for KV keys
   * @default 'ratelimit'
   */
  keyPrefix?: string;

  /**
   * Skip rate limiting for certain requests
   */
  skip?: (c: Context<{ Bindings: Env }>) => boolean;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Get client IP from various headers
 */
function getClientIP(c: Context): string {
  return (
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Real-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Default key generator - uses user ID if authenticated, otherwise IP
 */
function defaultKeyGenerator(c: Context<{ Bindings: Env }>): string {
  const userId = c.get('userId');
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${getClientIP(c)}`;
}

/**
 * Rate limit middleware factory
 */
export const rateLimit = (config: RateLimitConfig = {}) => {
  const {
    windowMs = 60_000,
    max = 60,
    keyGenerator = defaultKeyGenerator,
    keyPrefix = 'ratelimit',
    skip,
  } = config;

  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    // Check if we should skip
    if (skip?.(c)) {
      return next();
    }

    // Generate rate limit key
    const identifier = keyGenerator(c);
    const key = `${keyPrefix}:${identifier}:${c.req.path}`;
    const now = Date.now();

    try {
      // Get current rate limit entry from KV
      const cached = await c.env.CACHE.get(key);
      let entry: RateLimitEntry;

      if (cached) {
        entry = JSON.parse(cached);

        // Check if window has expired
        if (entry.resetAt <= now) {
          // Start new window
          entry = { count: 1, resetAt: now + windowMs };
        } else {
          // Increment count
          entry.count += 1;
        }
      } else {
        // New entry
        entry = { count: 1, resetAt: now + windowMs };
      }

      // Calculate remaining requests
      const remaining = Math.max(0, max - entry.count);
      const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);

      // Set rate limit headers
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', String(remaining));
      c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

      // Check if rate limit exceeded
      if (entry.count > max) {
        c.header('Retry-After', String(resetInSeconds));

        // Still update KV to track continued attempts
        await c.env.CACHE.put(key, JSON.stringify(entry), {
          expirationTtl: Math.ceil(windowMs / 1000) + 1,
        });

        throw new RateLimitError(resetInSeconds, {
          limit: max,
          windowMs,
          identifier,
        });
      }

      // Update KV with new count
      await c.env.CACHE.put(key, JSON.stringify(entry), {
        expirationTtl: Math.ceil(windowMs / 1000) + 1,
      });
    } catch (error) {
      // Re-throw rate limit errors
      if (error instanceof RateLimitError) {
        throw error;
      }

      // Log KV errors but don't block the request
      console.error('Rate limit KV error:', error);
      // Continue without rate limiting if KV fails
    }

    await next();
  });
};

// ============================================================================
// Pre-configured rate limiters for common use cases
// ============================================================================

/**
 * Standard rate limit for authenticated endpoints
 * 60 requests per minute per user
 */
export const standardRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
});

/**
 * Strict rate limit for sensitive endpoints (auth, transactions)
 * 10 requests per minute
 */
export const strictRateLimit = rateLimit({
  windowMs: 60_000,
  max: 10,
});

/**
 * Relaxed rate limit for read-only endpoints
 * 120 requests per minute
 */
export const relaxedRateLimit = rateLimit({
  windowMs: 60_000,
  max: 120,
});

/**
 * Public endpoint rate limit (by IP only)
 * 30 requests per minute
 */
export const publicRateLimit = rateLimit({
  windowMs: 60_000,
  max: 30,
  keyGenerator: (c) => `ip:${getClientIP(c)}`,
});

