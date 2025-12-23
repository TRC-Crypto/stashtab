/**
 * Security Middleware
 *
 * Implements security headers and protections:
 * - Content Security Policy
 * - XSS Protection
 * - Frame Options
 * - HSTS
 * - Content Type Options
 */

import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

/**
 * Security headers middleware
 */
export const securityHeaders = () => {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    await next();

    // Content Security Policy
    c.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.privy.io https://*.cloudflare.com; frame-ancestors 'none';"
    );

    // XSS Protection
    c.header('X-XSS-Protection', '1; mode=block');

    // Prevent MIME type sniffing
    c.header('X-Content-Type-Options', 'nosniff');

    // Frame Options (prevent clickjacking)
    c.header('X-Frame-Options', 'DENY');

    // Referrer Policy
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    c.header(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );

    // HSTS (only in production)
    if (c.env.ENVIRONMENT === 'production') {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
  });
};

/**
 * Input sanitization helper
 */
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize request body
 */
export function sanitizeBody(body: unknown): unknown {
  if (typeof body === 'string') {
    return sanitizeInput(body);
  }
  if (Array.isArray(body)) {
    return body.map(sanitizeBody);
  }
  if (body && typeof body === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      sanitized[sanitizeInput(key)] = sanitizeBody(value);
    }
    return sanitized;
  }
  return body;
}
