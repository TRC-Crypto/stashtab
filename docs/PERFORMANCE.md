# Performance Guide

Performance optimization guide for Stashtab deployments.

## Performance Targets

- **API Response Time**: < 200ms (p95)
- **Page Load Time**: < 2s (First Contentful Paint)
- **Time to Interactive**: < 3s
- **Database Query Time**: < 50ms (p95)
- **Cache Hit Rate**: > 80%

## Caching Strategy

### API Caching

Use the cache middleware for frequently accessed endpoints:

```typescript
import { shortCache, mediumCache, longCache } from './middleware/cache';

// Short cache for frequently changing data
yieldRoutes.get('/rate', shortCache(), async (c) => {
  // ...
});

// Medium cache for moderately stable data
app.get('/account/:id', mediumCache(), async (c) => {
  // ...
});

// Long cache for stable data
app.get('/config', longCache(), async (c) => {
  // ...
});
```

### Frontend Caching

- Use Next.js ISR (Incremental Static Regeneration) for static pages
- Implement React Query for API data caching
- Use browser caching for static assets

## Database Optimization

### Indexes

Ensure indexes exist on frequently queried columns:

```sql
CREATE INDEX IF NOT EXISTS idx_users_privy_user_id ON users(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
```

### Query Optimization

- Use prepared statements
- Limit result sets with `LIMIT`
- Avoid N+1 queries
- Use pagination for large datasets

## RPC Optimization

### Connection Pooling

Use a dedicated RPC provider with connection pooling:

- Alchemy
- Infura
- QuickNode

### Request Batching

Batch multiple RPC calls when possible:

```typescript
// Instead of multiple calls
const balance1 = await getBalance(address1);
const balance2 = await getBalance(address2);

// Batch them
const balances = await batchGetBalances([address1, address2]);
```

## Frontend Optimization

### Code Splitting

- Use dynamic imports for large components
- Split routes with Next.js automatic code splitting
- Lazy load non-critical components

### Image Optimization

- Use Next.js Image component
- Optimize images before upload
- Use appropriate image formats (WebP, AVIF)

### Bundle Size

- Monitor bundle size with `@next/bundle-analyzer`
- Remove unused dependencies
- Use tree-shaking

## Monitoring

### Metrics to Track

- API response times
- Error rates
- Cache hit rates
- Database query times
- RPC call latency
- Frontend performance metrics

### Tools

- Cloudflare Analytics (built-in)
- Sentry (error tracking)
- Custom metrics via monitoring SDK

## Load Testing

Run load tests regularly:

```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io

# Run load tests
k6 run tests/load/api.js
k6 run tests/load/scenarios.js
```

## Performance Budgets

Set performance budgets in your CI/CD:

```yaml
# .github/workflows/performance.yml
- name: Performance Budget Check
  run: |
    # Check bundle size
    # Check API response times
    # Fail if budgets exceeded
```

## Best Practices

1. **Cache Aggressively**: Cache everything that can be cached
2. **Minimize RPC Calls**: Batch and cache RPC responses
3. **Optimize Database Queries**: Use indexes and pagination
4. **Monitor Continuously**: Set up alerts for performance degradation
5. **Test Regularly**: Run load tests before major releases

## Troubleshooting

### Slow API Responses

1. Check database query times
2. Review RPC provider latency
3. Check cache hit rates
4. Review error logs for bottlenecks

### High Database Load

1. Add missing indexes
2. Optimize slow queries
3. Implement query result caching
4. Consider read replicas (if using external DB)

### Frontend Performance Issues

1. Check bundle size
2. Review network requests
3. Optimize images and assets
4. Implement code splitting

---

For more information, see:

- [Cloudflare Workers Performance](https://developers.cloudflare.com/workers/platform/limits/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
