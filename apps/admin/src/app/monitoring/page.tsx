'use client';

import { Activity, AlertCircle, CheckCircle2, Clock, Server, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  latency?: number;
  lastCheck?: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: HealthCheck[];
}

export default function MonitoringPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

  const fetchHealth = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (!response.ok) {
        throw new Error('Failed to fetch health status');
      }
      const data = await response.json();
      setHealthStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Server className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading health status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={fetchHealth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
        <p className="text-gray-500">Real-time health status and metrics</p>
      </div>

      {/* Overall Status */}
      <div className="mb-8">
        <div
          className={`p-6 rounded-lg border-2 ${
            healthStatus?.status === 'healthy'
              ? 'border-green-500 bg-green-50'
              : healthStatus?.status === 'degraded'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-red-500 bg-red-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(healthStatus?.status || 'unknown')}
              <div>
                <h2 className="text-2xl font-semibold mb-1">
                  Overall Status:{' '}
                  <span className={getStatusColor(healthStatus?.status || 'unknown')}>
                    {healthStatus?.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </h2>
                <p className="text-sm text-gray-600">
                  Last updated:{' '}
                  {healthStatus?.timestamp
                    ? new Date(healthStatus.timestamp).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchHealth}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Service Health Checks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Service Health</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthStatus?.checks.map((check) => (
            <div
              key={check.service}
              className={`p-4 rounded-lg border ${
                check.status === 'healthy'
                  ? 'border-green-200 bg-green-50'
                  : check.status === 'degraded'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <h3 className="font-semibold">{check.service}</h3>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                  {check.status.toUpperCase()}
                </span>
              </div>
              {check.message && <p className="text-sm text-gray-600 mb-2">{check.message}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {check.latency !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {check.latency}ms
                  </div>
                )}
                {check.lastCheck && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {new Date(check.lastCheck).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href={`${apiUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            API Documentation
          </a>
          <a
            href={`${apiUrl}/health`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Health Check JSON
          </a>
          <a
            href={`${apiUrl}/health/live`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Liveness Probe
          </a>
          <a
            href={`${apiUrl}/health/ready`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Readiness Probe
          </a>
        </div>
      </div>
    </div>
  );
}
