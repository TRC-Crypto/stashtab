import type { Context } from 'hono';
import { ZodError } from 'zod';
import { APIError, ErrorCode, ValidationError, wrapError, RateLimitError } from '../errors';
import type { Env } from '../types';
import { captureException } from './sentry';

/**
 * Global Error Handler Middleware
 *
 * Catches all errors and transforms them into consistent JSON responses.
 * Handles:
 * - APIError instances (our custom errors)
 * - Zod validation errors
 * - Unknown errors (wrapped as internal errors)
 *
 * Response format:
 * {
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Human readable message",
 *     "details": { ... }  // optional
 *   },
 *   "requestId": "uuid"
 * }
 */

/**
 * Format Zod errors into a readable structure
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

/**
 * Global error handler
 */
export function errorHandler(err: Error, c: Context<{ Bindings: Env }>) {
  const requestId = c.get('requestId') || 'unknown';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationError = new ValidationError('Validation failed', {
      fields: formatZodErrors(err),
    });

    return c.json(validationError.toJSON(requestId), validationError.statusCode as 400);
  }

  // Handle our custom API errors
  if (err instanceof APIError) {
    // Special handling for rate limit errors
    if (err instanceof RateLimitError) {
      c.header('Retry-After', String(err.retryAfter));
    }

    return c.json(err.toJSON(requestId), err.statusCode as 400);
  }

  // Log unexpected errors
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      requestId,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    })
  );

  // Capture exception in Sentry
  captureException(err, {
    requestId,
    method: c.req.method,
    path: c.req.path,
    userId: c.get('userId'),
    url: c.req.url,
  });

  // Wrap unknown errors
  const wrappedError = wrapError(err);

  // In production, don't expose internal error details
  const isProduction = c.env.ENVIRONMENT === 'production';
  const response = {
    error: {
      code: wrappedError.code,
      message: isProduction ? 'An unexpected error occurred' : wrappedError.message,
    },
    requestId,
  };

  return c.json(response, wrappedError.statusCode as 500);
}

/**
 * Not found handler for 404 errors
 */
export function notFoundHandler(c: Context<{ Bindings: Env }>) {
  const requestId = c.get('requestId') || 'unknown';

  return c.json(
    {
      error: {
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
      requestId,
    },
    404
  );
}
