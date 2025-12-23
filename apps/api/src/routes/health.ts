import { healthChecks } from '@stashtab/sdk/monitoring';
import { Hono } from 'hono';
import type { Env } from '../types';

const healthRoutes = new Hono<{ Bindings: Env }>();

/**
 * Basic health check endpoint
 * GET /health
 */
healthRoutes.get('/health', async (c) => {
  const checks = healthChecks.getAll();
  const overallStatus = healthChecks.getOverallStatus();

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return c.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: checks.map((check) => ({
        service: check.service,
        status: check.status,
        message: check.message,
        latency: check.latency,
        lastCheck: check.lastCheck?.toISOString(),
      })),
    },
    statusCode
  );
});

/**
 * Liveness probe (Kubernetes-style)
 * GET /health/live
 */
healthRoutes.get('/health/live', async (c) => {
  return c.json({ status: 'alive' }, 200);
});

/**
 * Readiness probe (Kubernetes-style)
 * GET /health/ready
 */
healthRoutes.get('/health/ready', async (c) => {
  // Check if database is accessible
  try {
    await c.env.DB.prepare('SELECT 1').first();
    return c.json({ status: 'ready' }, 200);
  } catch (error) {
    return c.json({ status: 'not ready', error: 'Database unavailable' }, 503);
  }
});

export { healthRoutes };
