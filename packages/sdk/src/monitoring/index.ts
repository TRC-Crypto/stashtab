/**
 * Monitoring Utilities
 *
 * Shared monitoring and observability utilities for the Stashtab SDK.
 * Provides consistent monitoring across all applications.
 */

export interface Metric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  latency?: number;
  lastCheck?: Date;
}

/**
 * Simple metrics collector
 * In production, this would integrate with a metrics service like Datadog, CloudWatch, etc.
 */
class MetricsCollector {
  private metrics: Metric[] = [];

  /**
   * Record a metric
   */
  record(metric: Metric): void {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp || new Date(),
    });

    // In production, send to metrics service
    // For now, log it (intentional - metrics logging)
    // eslint-disable-next-line no-console
    console.log('[Metrics]', metric);
  }

  /**
   * Increment a counter
   */
  increment(name: string, value = 1, tags?: Record<string, string>): void {
    this.record({
      name,
      value,
      unit: 'count',
      tags,
    });
  }

  /**
   * Record a gauge value
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.record({
      name,
      value,
      unit: 'gauge',
      tags,
    });
  }

  /**
   * Record a timing/duration
   */
  timing(name: string, durationMs: number, tags?: Record<string, string>): void {
    this.record({
      name,
      value: durationMs,
      unit: 'ms',
      tags,
    });
  }

  /**
   * Get recent metrics
   */
  getMetrics(limit = 100): Metric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Clear metrics (useful for testing)
   */
  clear(): void {
    this.metrics = [];
  }
}

/**
 * Health check manager
 */
class HealthCheckManager {
  private checks: Map<string, HealthCheck> = new Map();

  /**
   * Register a health check
   */
  register(check: HealthCheck): void {
    this.checks.set(check.service, check);
  }

  /**
   * Update health check status
   */
  update(service: string, status: HealthCheck['status'], message?: string, latency?: number): void {
    const check = this.checks.get(service);
    if (check) {
      check.status = status;
      check.message = message;
      check.latency = latency;
      check.lastCheck = new Date();
    } else {
      this.register({
        service,
        status,
        message,
        latency,
        lastCheck: new Date(),
      });
    }
  }

  /**
   * Get all health checks
   */
  getAll(): HealthCheck[] {
    return Array.from(this.checks.values());
  }

  /**
   * Get overall health status
   */
  getOverallStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const checks = this.getAll();
    if (checks.length === 0) {
      return 'healthy';
    }

    const unhealthy = checks.filter((c) => c.status === 'unhealthy').length;
    const degraded = checks.filter((c) => c.status === 'degraded').length;

    if (unhealthy > 0) {
      return 'unhealthy';
    }
    if (degraded > 0) {
      return 'degraded';
    }
    return 'healthy';
  }
}

// Singleton instances
export const metrics = new MetricsCollector();
export const healthChecks = new HealthCheckManager();

/**
 * Helper to measure async function execution time
 */
export async function measureTiming<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    metrics.timing(name, duration, tags);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metrics.timing(`${name}.error`, duration, { ...tags, error: 'true' });
    throw error;
  }
}

/**
 * Helper to measure sync function execution time
 */
export function measureTimingSync<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;
    metrics.timing(name, duration, tags);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metrics.timing(`${name}.error`, duration, { ...tags, error: 'true' });
    throw error;
  }
}
