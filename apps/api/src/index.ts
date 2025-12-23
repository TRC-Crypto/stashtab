import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId, structuredLogger, errorHandler, notFoundHandler } from './middleware';
import { openAPISpec } from './openapi';
import { accountRoutes } from './routes/account';
import { authRoutes } from './routes/auth';
import { fiatRoutes } from './routes/fiat';
import { kycRoutes } from './routes/kyc';
import { yieldRoutes } from './routes/yield';
import type { Env } from './types';

// ============================================================================
// App Configuration
// ============================================================================

const app = new Hono<{ Bindings: Env }>();

// ============================================================================
// Global Middleware (order matters!)
// ============================================================================

// 1. Request ID - first so all logs have it
app.use('*', requestId());

// 2. Structured logging
app.use('*', structuredLogger());

// 3. CORS
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow localhost for development
      if (origin?.includes('localhost')) return origin;
      // Allow your production domains
      if (origin?.includes('stashtab.dev')) return origin;
      if (origin?.includes('stashtab.com')) return origin;
      // Cloudflare Pages preview URLs
      if (origin?.includes('.pages.dev')) return origin;
      return null;
    },
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: [
      'X-Request-Id',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
  })
);

// ============================================================================
// OpenAPI Documentation
// ============================================================================

// Serve OpenAPI spec
app.get('/openapi.json', (c) => {
  return c.json(openAPISpec);
});

// Swagger UI
app.get(
  '/docs',
  swaggerUI({
    url: '/openapi.json',
    persistAuthorization: true,
  })
);

// ============================================================================
// Health Check
// ============================================================================

app.get('/', (c) => {
  return c.json({
    name: 'Stashtab API',
    version: '0.1.0',
    status: 'ok',
    docs: '/docs',
    openapi: '/openapi.json',
  });
});

// ============================================================================
// Routes
// ============================================================================

app.route('/auth', authRoutes);
app.route('/account', accountRoutes);
app.route('/yield', yieldRoutes);
app.route('/fiat', fiatRoutes);
app.route('/kyc', kycRoutes);

// ============================================================================
// Error Handlers
// ============================================================================

app.notFound(notFoundHandler);
app.onError(errorHandler);

// ============================================================================
// Export
// ============================================================================

export default app;
