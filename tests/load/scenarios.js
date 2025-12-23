/**
 * User Journey Load Tests
 *
 * Simulates realistic user flows under load.
 * Run with: k6 run tests/load/scenarios.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 10 concurrent users
    { duration: '2m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'], // Less than 5% errors
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8787';
const WEB_URL = __ENV.WEB_URL || 'http://localhost:3000';

export default function () {
  // Scenario: User visits landing page
  const landingRes = http.get(WEB_URL);
  check(landingRes, {
    'landing page loads': (r) => r.status === 200,
  });
  errorRate.add(landingRes.status !== 200);
  sleep(2);

  // Scenario: User checks yield rate
  const yieldRes = http.get(`${BASE_URL}/yield/rate`);
  check(yieldRes, {
    'yield rate available': (r) => r.status === 200,
  });
  errorRate.add(yieldRes.status !== 200);
  sleep(1);

  // Scenario: User checks health status
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check passes': (r) => r.status === 200,
  });
  errorRate.add(healthRes.status !== 200);
  sleep(1);
}
