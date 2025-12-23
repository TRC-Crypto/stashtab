/**
 * Enhanced Caching Middleware
 *
 * Provides HTTP response caching with configurable TTL and cache keys.
 * Uses Cloudflare KV for storage.
 *
 * Features:
 * - Configurable cache TTL
 * - Custom cache key generation
 * - Cache invalidation support
 * - Cache hit/miss metrics
 */

import { metrics } from '@stashtab/sdk/monitoring';
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

export interface CacheConfig {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (c: { req: { method: string; url: string; path: string } }) => string;
  skip?: (c: { req: { method: string } }) => boolean;
  vary?: string[]; // Headers to include in cache key
}

const DEFAULT_TTL = 60; // 1 minute default

/**
 * Generate cache key from request
 */
function defaultKeyGenerator(c: { req: { method: string; url: string; path: string } }): string {
  const url = new URL(c.req.url);
  return `cache:${c.req.method}:${c.req.path}:${url.search}`;
}

/**
 * Cache middleware factory
 */
export const cacheMiddleware = (config: CacheConfig = {}) => {
  const { ttl = DEFAULT_TTL, keyGenerator = defaultKeyGenerator, skip, vary = [] } = config;

  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    // Skip caching for non-GET requests by default
    if (skip?.(c) || c.req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    let cacheKey = keyGenerator(c);

    // Add vary headers to cache key if specified
    if (vary.length > 0) {
      const varyValues = vary
        .map((header) => c.req.header(header.toLowerCase()))
        .filter(Boolean)
        .join(':');
      if (varyValues) {
        cacheKey = `${cacheKey}:vary:${varyValues}`;
      }
    }

    try {
      // Try to get from cache
      const cached = await c.env.CACHE.get(cacheKey);

      if (cached) {
        // Cache hit
        metrics.increment('cache.hits', 1, { path: c.req.path });
        const data = JSON.parse(cached);
        return c.json(data, 200, {
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
        });
      }

      // Cache miss - execute handler
      metrics.increment('cache.misses', 1, { path: c.req.path });
      await next();

      // Cache successful responses (status 200-299)
      const status = c.res.status;
      if (status >= 200 && status < 300) {
        const response = await c.res
          .clone()
          .json()
          .catch(() => null);
        if (response) {
          await c.env.CACHE.put(cacheKey, JSON.stringify(response), {
            expirationTtl: ttl,
          });
          c.header('X-Cache', 'MISS');
          c.header('X-Cache-Key', cacheKey);
        }
      }
    } catch (error) {
      // If caching fails, continue without cache
      console.error('Cache error:', error);
      metrics.increment('cache.errors', 1);
      await next();
    }
  });
};

/**
 * Pre-configured cache middleware for common use cases
 */

/**
 * Short cache (30 seconds) - for frequently changing data
 */
export const shortCache = cacheMiddleware({ ttl: 30 });

/**
 * Medium cache (5 minutes) - for moderately stable data
 */
export const mediumCache = cacheMiddleware({ ttl: 300 });

/**
 * Long cache (1 hour) - for stable data
 */
export const longCache = cacheMiddleware({ ttl: 3600 });

/**
 * Cache with user-specific keys
 */
export const userCache = cacheMiddleware({
  keyGenerator: (c) => {
    const userId = c.req.header('X-User-Id') || 'anonymous';
    return `cache:user:${userId}:${c.req.method}:${c.req.path}`;
  },
});

/**
 * Invalidate cache entry
 */
export async function invalidateCache(cache: KVNamespace, pattern: string): Promise<void> {
  // Note: KV doesn't support pattern deletion
  // In production, you'd maintain a list of keys or use a different strategy
  // This is a simplified version
  try {
    await cache.delete(pattern);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Clear all cache entries (use with caution)
 */
export async function clearCache(_cache: KVNamespace): Promise<void> {
  // Note: KV doesn't support bulk deletion
  // This would need to be implemented with a key list
  console.warn('Bulk cache clearing not supported in KV. Use invalidateCache for specific keys.');
}
