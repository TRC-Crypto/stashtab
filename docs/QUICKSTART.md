# Quick Start Guide

**Deploy your neobank in under 5 minutes**

This guide will walk you through deploying Stashtab to production. For detailed instructions, see [DEPLOY.md](./DEPLOY.md).

## Prerequisites

Before you begin, make sure you have:

- [ ] Node.js 18+ installed
- [ ] pnpm 9+ installed (`npm install -g pnpm`)
- [ ] A [Privy](https://privy.io) account (free tier available)
- [ ] A [Cloudflare](https://cloudflare.com) account (free tier available)
- [ ] Git installed

## Step 1: Clone and Install (30 seconds)

```bash
git clone https://github.com/TRC-Crypto/stashtab.git
cd stashtab
pnpm install
```

## Step 2: Set Up Privy (2 minutes)

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

## Step 3: Run Setup Wizard (1 minute)

```bash
pnpm setup
```

The setup wizard will:

- Create Cloudflare D1 database
- Create KV namespace
- Update `wrangler.toml` with your IDs
- Generate `.env` files
- Run database migrations

**Note**: You'll need to be logged into Cloudflare (`npx wrangler login`).

## Step 4: Configure Environment Variables

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_CHAIN_ID=84532
```

Edit `apps/api/.dev.vars` (for local development):

```env
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
RPC_URL=https://sepolia.base.org
ENVIRONMENT=development
CHAIN_ID=84532
```

## Step 5: Start Development (30 seconds)

```bash
pnpm dev
```

This starts:

- **Web App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **API**: http://localhost:8787
- **API Docs**: http://localhost:8787/docs

## Step 6: Deploy to Production (1 minute)

### Option A: Automated Deployment (Recommended)

```bash
pnpm deploy:auto
```

This will:

- Create all Cloudflare resources
- Run database migrations
- Deploy all applications
- Provide deployment URLs

### Option B: One-Click Deploy via GitHub Actions

1. Push your code to GitHub
2. Go to **Actions** → **One-Click Deploy**
3. Click **Run workflow**
4. Select your environment
5. Click **Run workflow**

### Option C: Manual Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed manual deployment instructions.

## Next Steps

### 1. Test Your Deployment

- Visit your web app URL
- Sign up with email
- Test deposit/withdraw flows
- Check API documentation

### 2. Configure Custom Domain (Optional)

1. Add your domain in Cloudflare dashboard
2. Update CORS settings in API if needed
3. Update environment variables with your domain

### 3. Set Up Monitoring

- View logs: `npx wrangler tail`
- Check analytics in Cloudflare dashboard
- Set up error tracking (see [INTEGRATIONS.md](./INTEGRATIONS.md))

### 4. Enable GitHub Actions (Optional)

Add these secrets to your repository:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET`

Then push to `main` branch to auto-deploy.

## Troubleshooting

### "Invalid Privy token"

- Check that `PRIVY_APP_SECRET` is set correctly
- Verify the token is being passed in Authorization header

### "Database error"

- Ensure D1 migrations have been applied
- Check `database_id` in `wrangler.toml` matches your database

### "RPC error"

- Verify `RPC_URL` is accessible
- Consider using a dedicated RPC provider for reliability

### "CORS error"

- Add your frontend domain to API CORS origins in `apps/api/src/index.ts`
- Redeploy the API after changes

For more help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Video Tutorial

<iframe width="560" height="315" src="https://www.youtube.com/embed/PLACEHOLDER" title="Stashtab Quick Start" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

_Video tutorial coming soon. Check back for updates!_

## Need Help?

- 📖 [Full Documentation](./README.md)
- 🐛 [Report an Issue](https://github.com/TRC-Crypto/stashtab/issues)
- 💬 [Join Discord](https://discord.gg/stashtab) (coming soon)
- 📧 [Email Support](mailto:support@stashtab.app)

---

**Ready to customize?** Check out [CUSTOMIZE.md](./CUSTOMIZE.md) for branding and white-label options.
