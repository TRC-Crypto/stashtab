# Environment Variables Reference

This document provides a comprehensive reference for all environment variables used across Stashtab applications.

## Overview

Stashtab uses environment variables for configuration across:

- **Web App** (`apps/web`) - Next.js frontend
- **Admin Dashboard** (`apps/admin`) - Next.js admin interface
- **Mobile App** (`apps/mobile`) - Expo React Native app
- **API** (`apps/api`) - Cloudflare Workers backend

## Quick Start

1. Copy the example files:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/admin/.env.example apps/admin/.env.local
   cp apps/mobile/.env.example apps/mobile/.env.local
   cp apps/api/.dev.vars.example apps/api/.dev.vars
   ```

2. Fill in your values (see sections below)

3. For production, set these as secrets in Cloudflare Workers/Pages

## Web App (`apps/web`)

### Required Variables

| Variable                   | Description                                | Example                 |
| -------------------------- | ------------------------------------------ | ----------------------- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID for authentication    | `clp...`                |
| `NEXT_PUBLIC_CHAIN_ID`     | Chain ID (84532 = testnet, 8453 = mainnet) | `84532`                 |
| `NEXT_PUBLIC_API_URL`      | API endpoint URL                           | `http://localhost:8787` |

### Example

```bash
NEXT_PUBLIC_PRIVY_APP_ID=clp1234567890abcdef
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## Admin Dashboard (`apps/admin`)

Same variables as Web App:

| Variable                   | Description          | Example                 |
| -------------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID | `clp...`                |
| `NEXT_PUBLIC_CHAIN_ID`     | Chain ID             | `84532`                 |
| `NEXT_PUBLIC_API_URL`      | API endpoint URL     | `http://localhost:8787` |

## Mobile App (`apps/mobile`)

### Required Variables

| Variable                   | Description          | Example                 |
| -------------------------- | -------------------- | ----------------------- |
| `EXPO_PUBLIC_PRIVY_APP_ID` | Privy application ID | `clp...`                |
| `EXPO_PUBLIC_CHAIN_ID`     | Chain ID             | `84532`                 |
| `EXPO_PUBLIC_API_URL`      | API endpoint URL     | `http://localhost:8787` |

**Note**: Privy React Native integration is planned for v0.2.0. See [ROADMAP.md](../ROADMAP.md).

## API (`apps/api`)

### Core Configuration (Required)

| Variable           | Description              | Example                    |
| ------------------ | ------------------------ | -------------------------- |
| `PRIVY_APP_ID`     | Privy application ID     | `clp...`                   |
| `PRIVY_APP_SECRET` | Privy application secret | `secret_...`               |
| `CHAIN_ID`         | Chain ID                 | `84532`                    |
| `RPC_URL`          | RPC endpoint URL         | `https://sepolia.base.org` |
| `ENVIRONMENT`      | Environment name         | `development`              |

### Fiat Providers (Optional)

#### Stripe

| Variable                | Description            | Where to Get                                             |
| ----------------------- | ---------------------- | -------------------------------------------------------- |
| `STRIPE_PUBLIC_KEY`     | Stripe publishable key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_SECRET_KEY`     | Stripe secret key      | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |

#### MoonPay

| Variable                 | Description        | Where to Get                                                         |
| ------------------------ | ------------------ | -------------------------------------------------------------------- |
| `MOONPAY_API_KEY`        | MoonPay API key    | [MoonPay Dashboard](https://dashboard.moonpay.com/settings/api_keys) |
| `MOONPAY_SECRET_KEY`     | MoonPay secret key | [MoonPay Dashboard](https://dashboard.moonpay.com/settings/api_keys) |
| `MOONPAY_WEBHOOK_SECRET` | Webhook secret     | [MoonPay Dashboard](https://dashboard.moonpay.com/settings/webhooks) |

### KYC Providers (Optional)

#### Persona

| Variable                 | Description         | Where to Get                                                            |
| ------------------------ | ------------------- | ----------------------------------------------------------------------- |
| `PERSONA_API_KEY`        | Persona API key     | [Persona Dashboard](https://app.withpersona.com/dashboard/settings/api) |
| `PERSONA_TEMPLATE_ID`    | Persona template ID | [Persona Templates](https://app.withpersona.com/dashboard/templates)    |
| `PERSONA_WEBHOOK_SECRET` | Webhook secret      | [Persona Webhooks](https://app.withpersona.com/dashboard/webhooks)      |

#### Sumsub

| Variable                | Description       | Where to Get                                     |
| ----------------------- | ----------------- | ------------------------------------------------ |
| `SUMSUB_APP_TOKEN`      | Sumsub app token  | [Sumsub Dashboard](https://sumsub.com/dashboard) |
| `SUMSUB_SECRET_KEY`     | Sumsub secret key | [Sumsub Dashboard](https://sumsub.com/dashboard) |
| `SUMSUB_WEBHOOK_SECRET` | Webhook secret    | [Sumsub Dashboard](https://sumsub.com/dashboard) |

**Note**: Sumsub integration is planned for v0.2.0. See [ROADMAP.md](../ROADMAP.md).

### Notification Providers (Optional)

#### Resend (Email)

| Variable            | Description          | Where to Get                                    |
| ------------------- | -------------------- | ----------------------------------------------- |
| `RESEND_API_KEY`    | Resend API key       | [Resend Dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Default sender email | Your verified domain email                      |

#### Expo (Push)

| Variable            | Description       | Where to Get                                                                         |
| ------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| `EXPO_ACCESS_TOKEN` | Expo access token | [Expo Dashboard](https://expo.dev/accounts/[account]/projects/[project]/credentials) |

### Monitoring (Optional)

#### Sentry

| Variable                    | Description               | Example                     |
| --------------------------- | ------------------------- | --------------------------- |
| `SENTRY_DSN`                | Sentry DSN                | `https://...@sentry.io/...` |
| `SENTRY_ENVIRONMENT`        | Environment name          | `development`               |
| `SENTRY_RELEASE`            | Release version           | `0.1.0`                     |
| `SENTRY_TRACES_SAMPLE_RATE` | Performance sampling rate | `0.1`                       |

## Environment-Specific Configuration

### Development

```bash
ENVIRONMENT=development
CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
```

### Staging

```bash
ENVIRONMENT=staging
CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
```

### Production

```bash
ENVIRONMENT=production
CHAIN_ID=8453
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

## Cloudflare Workers Configuration

For production deployments, set environment variables in Cloudflare:

1. **Workers**: Use `wrangler secret put VARIABLE_NAME`
2. **Pages**: Set in dashboard under Settings → Environment Variables

### Setting Secrets

```bash
# For Workers
wrangler secret put PRIVY_APP_SECRET
wrangler secret put STRIPE_SECRET_KEY
# etc.

# For Pages (via dashboard)
# Go to: Pages → Your Project → Settings → Environment Variables
```

## Validation

The setup wizard (`pnpm setup`) validates your environment configuration:

```bash
pnpm setup
```

Or check your configuration:

```bash
pnpm setup:check
```

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use secrets for sensitive values** - Use Cloudflare secrets for production
3. **Rotate keys regularly** - Especially for production
4. **Use different keys per environment** - Don't share dev/prod keys
5. **Limit API key permissions** - Only grant necessary permissions

## Troubleshooting

### Missing Variables

If you see errors about missing environment variables:

1. Check that `.env.local` (web/admin) or `.dev.vars` (API) exists
2. Verify variable names match exactly (case-sensitive)
3. Restart your development server after adding variables

### Invalid Values

- **Privy**: Verify app ID/secret at [dashboard.privy.io](https://dashboard.privy.io)
- **RPC URL**: Test connectivity: `curl https://sepolia.base.org`
- **Chain ID**: Must match your RPC URL's chain

### Production Issues

- Ensure all required variables are set in Cloudflare
- Check variable names match exactly
- Verify secrets are set (not just environment variables)

## Related Documentation

- [Deployment Guide](./DEPLOY.md) - Production deployment
- [Integrations Guide](./INTEGRATIONS.md) - Setting up providers
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
