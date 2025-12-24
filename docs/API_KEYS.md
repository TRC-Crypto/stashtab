# API Key Management Guide

How to manage API keys for Stashtab white-label API.

## Getting Your API Key

When you create an organization, you receive an API key:

```bash
curl -X POST https://api.stashtab.dev/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "My App", "slug": "my-app"}'
```

Response includes `api_key` - **save this immediately!**

## Using API Keys

### Header (Recommended)

```bash
curl -H "X-API-Key: sk_live_..." https://api.stashtab.dev/account/balance
```

### Query Parameter

```bash
curl "https://api.stashtab.dev/account/balance?api_key=sk_live_..."
```

## API Key Format

- **Test**: `sk_test_...`
- **Live**: `sk_live_...`
- **Length**: 64 characters
- **Format**: Alphanumeric

## Security Best Practices

1. **Never Commit Keys**: Use environment variables
2. **Rotate Regularly**: Generate new keys periodically
3. **Use Test Keys**: Use test keys for development
4. **Restrict Access**: Limit who has access to keys
5. **Monitor Usage**: Watch for unusual activity

## Environment Variables

```bash
# .env
STASHTAB_API_KEY=sk_live_...
STASHTAB_API_URL=https://api.stashtab.dev
```

```typescript
// config.ts
export const config = {
  apiKey: process.env.STASHTAB_API_KEY!,
  apiUrl: process.env.STASHTAB_API_URL || 'https://api.stashtab.dev',
};
```

## Key Rotation

Currently, API key rotation requires creating a new organization. Future versions will support key rotation without creating new organizations.

## Revoking Keys

To revoke an API key, contact support or delete the organization (this deletes all associated data).

## Testing Keys

Use test keys for development:

```bash
# Test environment
STASHTAB_API_KEY=sk_test_...
STASHTAB_API_URL=https://api-test.stashtab.dev
```

## Error Responses

Invalid API key:

```json
{
  "error": "Invalid API key",
  "code": "AUTH_INVALID_TOKEN"
}
```

Missing API key:

```json
{
  "error": "API key required. Provide X-API-Key header or api_key query parameter.",
  "code": "AUTH_MISSING_TOKEN"
}
```
