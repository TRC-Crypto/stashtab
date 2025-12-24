# White-Label API Guide

Complete guide to using Stashtab as a white-label backend-as-a-service.

## Overview

Stashtab's white-label API enables you to run your own branded fintech application using Stashtab's infrastructure. Each organization (tenant) gets:

- Isolated user data
- Custom branding (logo, colors, domain)
- Configurable features (yield, payments, fiat)
- API key authentication
- Webhook support

## Setup

### 1. Create Organization

```bash
curl -X POST https://api.stashtab.dev/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Fintech",
    "slug": "my-fintech"
  }'
```

Response:

```json
{
  "id": "org_123...",
  "name": "My Fintech",
  "slug": "my-fintech",
  "api_key": "sk_live_...",
  "created_at": 1234567890
}
```

**Save the API key** - it's only shown once!

### 2. Configure Settings

```bash
curl -X PATCH https://api.stashtab.dev/organizations/me/settings \
  -H "X-API-Key: sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "chain_id": 8453,
    "rpc_url": "https://mainnet.base.org",
    "enabled_features": {
      "yield": true,
      "payments": true,
      "fiat": false
    },
    "webhook_url": "https://myapp.com/webhooks/stashtab"
  }'
```

### 3. Customize Branding

```bash
curl -X PATCH https://api.stashtab.dev/organizations/me \
  -H "X-API-Key: sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "branding": {
      "logo_url": "https://myapp.com/logo.png",
      "primary_color": "#0066FF",
      "secondary_color": "#00CCFF",
      "domain": "myapp.com"
    }
  }'
```

## API Key Authentication

All API requests require an API key in one of two ways:

### Header (Recommended)

```bash
curl -H "X-API-Key: sk_live_..." https://api.stashtab.dev/account/balance
```

### Query Parameter

```bash
curl "https://api.stashtab.dev/account/balance?api_key=sk_live_..."
```

## Tenant Isolation

All API endpoints automatically filter data by organization:

- **Users**: Only users belonging to your organization
- **Transactions**: Only transactions for your users
- **Accounts**: Only accounts for your users

No additional filtering needed - it's automatic!

## Using with SDK

```typescript
import { createStashtabClient } from '@stashtab/sdk';

// Initialize with organization's chain_id and RPC
const client = createStashtabClient({
  chainId: 8453, // From organization settings
  rpcUrl: 'https://mainnet.base.org', // From organization settings
});

// All operations are scoped to your organization
const balance = await client.yield.aave.getUserBalance(userAddress, 0n);
```

## Webhooks

Configure a webhook URL to receive events:

```json
{
  "webhook_url": "https://myapp.com/webhooks/stashtab"
}
```

Events sent to your webhook:

- `user.created`
- `transaction.confirmed`
- `kyc.approved`
- `kyc.rejected`

## CORS Configuration

For custom domains, configure CORS in your organization settings:

```json
{
  "branding": {
    "domain": "myapp.com"
  }
}
```

The API will automatically allow requests from `https://myapp.com`.

## Best Practices

1. **Rotate API Keys**: Regularly rotate API keys for security
2. **Use Environment Variables**: Never commit API keys to code
3. **Monitor Usage**: Track API usage and set up alerts
4. **Test on Testnet**: Use testnet for development
5. **Webhook Security**: Verify webhook signatures

## Rate Limits

API rate limits are per organization:

- **Standard**: 100 requests/minute
- **Strict**: 10 requests/minute (for sensitive operations)

## Support

For white-label support:

- GitHub Issues: https://github.com/TRC-Crypto/stashtab/issues
- Documentation: https://github.com/TRC-Crypto/stashtab#readme
