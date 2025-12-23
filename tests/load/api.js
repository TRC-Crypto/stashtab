/**
 * API Load Tests using k6
 *
 * Run with: k6 run tests/load/api.js
 *
 * Install k6: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 }, // Stay at 20 users
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 }, // Stay at 50 users
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.01'], // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8787';

export default function () {
  // Test health endpoint
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  });
  errorRate.add(healthRes.status !== 200);
  apiResponseTime.add(healthRes.timings.duration);

  sleep(1);

  // Test yield rate endpoint
  const yieldRes = http.get(`${BASE_URL}/yield/rate`);
  check(yieldRes, {
    'yield rate status is 200': (r) => r.status === 200,
    'yield rate has APY': (r) => {
      try {
        const data = JSON.parse(r.body);
        return typeof data.apyPercent === 'number';
      } catch {
        return false;
      }
    },
  });
  errorRate.add(yieldRes.status !== 200);
  apiResponseTime.add(yieldRes.timings.duration);

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
