# Deployment Guide

Deploy your own Stashtab instance in 2 hours.

## Prerequisites

Before starting, you'll need:

- [ ] Node.js 18+ and pnpm 9+
- [ ] A [Privy](https://privy.io) account
- [ ] A [Cloudflare](https://cloudflare.com) account (for both API and frontend)
- [ ] Base Sepolia testnet ETH for gas

## Step 1: Clone and Install

```bash
git clone https://github.com/TRC-Crypto/stashtab.git
cd stashtab
pnpm install
```

## Step 2: Set Up Privy

1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app
3. Configure login methods:
   - Enable **Email**
   - Enable **Google** (optional)
   - Enable **Apple** (optional)
4. Under "Embedded Wallets":
   - Enable "Create embedded wallets for users"
   - Set creation trigger to "On login"
5. Copy your **App ID** and **App Secret**

## Step 3: Set Up Cloudflare

### Create D1 Database

```bash
cd apps/api

# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create stashtab-db

# Note the database_id from the output
```

### Create KV Namespace

```bash
# Create KV namespace for caching
npx wrangler kv:namespace create CACHE

# Note the id from the output
```

### Update wrangler.toml

Edit `apps/api/wrangler.toml` with your IDs:

```toml
[[d1_databases]]
binding = "DB"
database_name = "stashtab-db"
database_id = "YOUR_D1_DATABASE_ID"  # Replace this

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_NAMESPACE_ID"  # Replace this
```

### Run Database Migration

```bash
# Apply migration locally first
npx wrangler d1 execute stashtab-db --local --file=migrations/0001_init.sql

# Apply to production
npx wrangler d1 execute stashtab-db --file=migrations/0001_init.sql
```

### Set Secrets

```bash
# Set Privy secrets
npx wrangler secret put PRIVY_APP_ID
# Enter your Privy App ID

npx wrangler secret put PRIVY_APP_SECRET
# Enter your Privy App Secret

# Set RPC URL (can use public RPC for testnet)
npx wrangler secret put RPC_URL
# Enter: https://sepolia.base.org
```

### Deploy API

```bash
npx wrangler deploy
```

Note your API URL (e.g., `https://stashtab-api.your-subdomain.workers.dev`)

## Step 4: Configure Frontend

Create `apps/web/.env.local`:

```env
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# API URL (from Cloudflare deployment)
NEXT_PUBLIC_API_URL=https://stashtab-api.your-subdomain.workers.dev

# Chain (84532 = Base Sepolia)
NEXT_PUBLIC_CHAIN_ID=84532
```

## Step 5: Deploy Frontend (Cloudflare Pages)

### Option A: Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > Workers & Pages
3. Click "Create" > "Pages" > "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `cd apps/web && pnpm install && pnpm build`
   - **Build output directory**: `apps/web/.next`
   - **Root directory**: `/` (leave as root)
6. Add environment variables:
   - `NEXT_PUBLIC_PRIVY_APP_ID`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_CHAIN_ID`
7. Click "Save and Deploy"

### Option B: Wrangler CLI

```bash
cd apps/web

# Build the Next.js app
pnpm build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=stashtab-web
```

### Option C: Git Integration (CI/CD)

Once connected via the dashboard, every push to `main` will automatically deploy.

## Step 6: Configure Privy Allowed Origins

1. Go to Privy dashboard > Settings > Allowed Origins
2. Add your deployed frontend URL
3. Add `localhost:3000` for local development

## Step 7: Test End-to-End

1. Visit your deployed frontend
2. Click "Sign In" and create an account
3. Go to Deposit and copy your Safe address
4. Get test USDC from [Circle Faucet](https://faucet.circle.com/)
5. Send test USDC to your Safe address
6. Verify balance appears on dashboard

## Mainnet Deployment

For mainnet deployment, update:

1. **Chain ID**: Change to `8453` (Base mainnet)
2. **RPC URL**: Use a reliable RPC provider (Alchemy, Infura)
3. **Contract addresses**: Mainnet addresses are already in config

### Important Mainnet Considerations

- Ensure adequate testing on testnet first
- Consider implementing deposit limits
- Add monitoring and alerting
- Review [SECURITY.md](SECURITY.md) thoroughly

## Troubleshooting

### "Invalid Privy token"

- Check that `PRIVY_APP_SECRET` is set correctly
- Verify the token is being passed in Authorization header

### "Database error"

- Ensure D1 migrations have been applied
- Check database_id in wrangler.toml matches your database

### "RPC error"

- Verify RPC_URL is accessible
- Consider using a dedicated RPC provider for reliability

### "CORS error"

- Add your frontend domain to API CORS origins in `apps/api/src/index.ts`
- Redeploy the API after changes

## Monitoring

### Cloudflare Analytics

View API metrics in Cloudflare dashboard:

- Request count and latency
- Error rates
- Geographic distribution

### Custom Logging

Add structured logging to track:

- User signups
- Transaction volumes
- Error patterns

```typescript
console.log(
  JSON.stringify({
    event: 'user_signup',
    userId: user.id,
    timestamp: Date.now(),
  })
);
```

## Updating

To update your deployment:

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
pnpm install

# Redeploy API
cd apps/api
npx wrangler deploy

# Redeploy frontend (if using Git integration, just push to main)
cd ../web
npx wrangler pages deploy .next --project-name=stashtab-web
```
