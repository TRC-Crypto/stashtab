import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

/**
 * Request ID middleware
 *
 * Generates a unique request ID for each request and makes it available
 * throughout the request lifecycle for logging and error tracking.
 *
 * - Generates UUID v4 for each request
 * - Adds X-Request-Id response header
 * - Makes ID available via c.get('requestId')
 */

declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
  }
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Request ID middleware
 */
export const requestId = () => {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    // Check for existing request ID from upstream proxy
    const existingId = c.req.header('X-Request-Id');
    const id = existingId || generateUUID();

    // Store in context
    c.set('requestId', id);

    // Add to response headers
    c.header('X-Request-Id', id);

    await next();
  });
};

