import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

/**
 * Structured JSON Logger Middleware
 *
 * Logs each request with structured JSON format suitable for log aggregation.
 * Compatible with Cloudflare Logpush and most log management systems.
 *
 * Log fields:
 * - timestamp: ISO 8601 timestamp
 * - requestId: Unique request identifier
 * - method: HTTP method
 * - path: Request path
 * - status: HTTP status code
 * - duration: Request duration in ms
 * - userAgent: User-Agent header
 * - ip: Client IP address
 * - userId: Authenticated user ID (if available)
 * - error: Error message (if request failed)
 */

declare module 'hono' {
  interface ContextVariableMap {
    userId?: string;
  }
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  requestId: string;
  method: string;
  path: string;
  status?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: string;
  query?: Record<string, string>;
}

/**
 * Get client IP from various headers
 */
function getClientIP(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Real-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Structured logger middleware
 */
export const structuredLogger = () => {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const start = Date.now();
    const requestId = c.get('requestId') || 'unknown';
    const method = c.req.method;
    const path = c.req.path;
    const userAgent = c.req.header('User-Agent');
    const ip = getClientIP(c);

    // Parse query params for logging
    const url = new URL(c.req.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      // Don't log sensitive params
      if (!['token', 'key', 'secret', 'password'].includes(key.toLowerCase())) {
        query[key] = value;
      }
    });

    // Log request start
    const startEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      requestId,
      method,
      path,
      userAgent,
      ip,
      ...(Object.keys(query).length > 0 && { query }),
    };
    console.log(JSON.stringify(startEntry));

    try {
      await next();
    } catch (error) {
      // Log error
      const duration = Date.now() - start;
      const errorEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        requestId,
        method,
        path,
        status: 500,
        duration,
        userAgent,
        ip,
        userId: c.get('userId'),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error(JSON.stringify(errorEntry));
      throw error;
    }

    // Log response
    const duration = Date.now() - start;
    const status = c.res.status;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    const endEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId,
      method,
      path,
      status,
      duration,
      userAgent,
      ip,
      userId: c.get('userId'),
    };
    console.log(JSON.stringify(endEntry));
  });
};

/**
 * Helper to log custom events with request context
 */
export function logEvent(
  c: { get: (key: string) => string | undefined },
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    requestId: c.get('requestId') || 'unknown',
    userId: c.get('userId'),
    message,
    ...data,
  };
  console.log(JSON.stringify(entry));
}

