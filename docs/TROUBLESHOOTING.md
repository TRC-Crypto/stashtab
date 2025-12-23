# Troubleshooting Guide

Common issues and solutions when deploying and using Stashtab.

## Table of Contents

- [Setup Issues](#setup-issues)
- [Deployment Issues](#deployment-issues)
- [Runtime Issues](#runtime-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Transaction Issues](#transaction-issues)

## Setup Issues

### "Cannot find module" errors

**Problem**: Missing dependencies after cloning.

**Solution**:

```bash
pnpm install
```

If that doesn't work:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Setup wizard fails

**Problem**: `pnpm setup` fails with authentication errors.

**Solution**:

1. Make sure you're logged into Cloudflare:
   ```bash
   npx wrangler login
   ```
2. Verify your Cloudflare account has access to Workers and D1
3. Check that you have the necessary permissions

### Environment variables not loading

**Problem**: Environment variables aren't being read.

**Solution**:

1. Make sure `.env.local` files are in the correct locations:
   - `apps/web/.env.local`
   - `apps/api/.dev.vars` (for local development)
2. Restart your development server
3. Check for typos in variable names

## Deployment Issues

### "Invalid Cloudflare API token"

**Problem**: Deployment fails with authentication error.

**Solution**:

1. Generate a new API token at https://dash.cloudflare.com/profile/api-tokens
2. Make sure the token has these permissions:
   - Account: Workers Scripts:Edit
   - Account: Workers KV Storage:Edit
   - Account: D1:Edit
   - Account: Cloudflare Pages:Edit
3. Update the secret in GitHub Actions or your local environment

### "Resource already exists"

**Problem**: D1 database or KV namespace already exists.

**Solution**:

1. Check existing resources:
   ```bash
   npx wrangler d1 list
   npx wrangler kv:namespace list
   ```
2. Either delete the existing resource or update `wrangler.toml` to use it
3. Use `--skip-resources` flag if deploying to existing infrastructure:
   ```bash
   pnpm deploy:auto --skip-resources
   ```

### Build fails in CI/CD

**Problem**: GitHub Actions build fails.

**Solution**:

1. Check build logs for specific errors
2. Verify all environment variables are set in GitHub Secrets
3. Make sure Node.js version matches (should be 20)
4. Check that `pnpm-lock.yaml` is committed

### Pages deployment fails

**Problem**: Cloudflare Pages deployment fails.

**Solution**:

1. Check build output directory (should be `.next`)
2. Verify build command: `pnpm build`
3. Check environment variables are set in Pages dashboard
4. Review build logs in Cloudflare dashboard

## Runtime Issues

### API returns 500 errors

**Problem**: API endpoints return internal server errors.

**Solution**:

1. Check API logs:
   ```bash
   npx wrangler tail
   ```
2. Verify database migrations have been applied
3. Check that all required environment variables are set
4. Verify RPC URL is accessible

### CORS errors

**Problem**: Frontend can't make requests to API.

**Solution**:

1. Add your frontend domain to CORS origins in `apps/api/src/index.ts`:
   ```typescript
   app.use(
     '*',
     cors({
       origin: ['http://localhost:3000', 'https://your-domain.com'],
     })
   );
   ```
2. Redeploy the API after changes
3. Check browser console for specific CORS error details

### Slow API responses

**Problem**: API takes too long to respond.

**Solution**:

1. Check RPC provider latency
2. Consider using a dedicated RPC provider (Alchemy, Infura)
3. Enable caching for frequently accessed data
4. Check database query performance

## Database Issues

### "Database not found"

**Problem**: D1 database doesn't exist.

**Solution**:

1. Create the database:
   ```bash
   npx wrangler d1 create stashtab-db
   ```
2. Update `wrangler.toml` with the database ID
3. Run migrations:
   ```bash
   npx wrangler d1 execute stashtab-db --file=migrations/0001_init.sql
   ```

### Migration fails

**Problem**: Database migrations fail to apply.

**Solution**:

1. Check migration file syntax
2. Verify database exists and is accessible
3. Check for conflicting migrations:
   ```bash
   npx wrangler d1 execute stashtab-db --command="SELECT name FROM sqlite_master WHERE type='table';"
   ```
4. Apply migrations one at a time to identify the failing one

### Data not persisting

**Problem**: Data disappears after deployment.

**Solution**:

1. Verify you're using the correct database (check `wrangler.toml`)
2. Make sure migrations have been applied to production
3. Check that you're not accidentally using local database in production

## Authentication Issues

### "Invalid Privy token"

**Problem**: Authentication fails.

**Solution**:

1. Verify `PRIVY_APP_SECRET` is set correctly
2. Check that token is being passed in Authorization header
3. Verify Privy app is configured correctly in dashboard
4. Check token expiration (tokens expire after 24 hours)

### Users can't sign up

**Problem**: Sign up flow fails.

**Solution**:

1. Check Privy dashboard for app configuration
2. Verify embedded wallets are enabled
3. Check browser console for errors
4. Verify Privy App ID matches in frontend

### Wallet creation fails

**Problem**: Embedded wallet creation fails.

**Solution**:

1. Check Privy dashboard → Embedded Wallets settings
2. Verify wallet creation trigger is set correctly
3. Check API logs for backend errors
4. Verify RPC URL is accessible

## Transaction Issues

### Transactions fail silently

**Problem**: Transactions don't complete.

**Solution**:

1. Check transaction status in admin dashboard
2. Verify user has sufficient balance
3. Check RPC provider is responding
4. Verify gas prices are reasonable
5. Check Safe contract deployment status

### "Insufficient funds" error

**Problem**: Transaction fails with insufficient funds.

**Solution**:

1. Verify user balance in database
2. Check on-chain balance matches database
3. Account for gas fees
4. Check for pending transactions

### Safe not deployed

**Problem**: Safe smart account doesn't exist.

**Solution**:

1. Check Safe deployment status:
   ```bash
   # Query Safe address prediction
   # Deploy Safe if needed
   ```
2. Verify deployment transaction succeeded
3. Check RPC provider connectivity
4. Verify deployment gas was sufficient

### Yield not accruing

**Problem**: Deposits don't earn yield.

**Solution**:

1. Verify funds are supplied to Aave
2. Check Aave APY is greater than 0
3. Verify time has passed (yield accrues over time)
4. Check Aave contract addresses are correct
5. Verify RPC is connected to correct network

## Getting More Help

If you're still experiencing issues:

1. **Check Logs**: Use `npx wrangler tail` to see real-time API logs
2. **Review Documentation**: See [docs/](./README.md) for detailed guides
3. **Search Issues**: Check [GitHub Issues](https://github.com/TRC-Crypto/stashtab/issues)
4. **Report Bug**: Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Logs (if available)

## Diagnostic Commands

Run these commands to diagnose issues:

```bash
# Check Cloudflare authentication
npx wrangler whoami

# List D1 databases
npx wrangler d1 list

# List KV namespaces
npx wrangler kv:namespace list

# View API logs
npx wrangler tail

# Check database schema
npx wrangler d1 execute stashtab-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Test API endpoint
curl https://your-api.workers.dev/health
```

## Common Error Codes

| Code                 | Meaning               | Solution                                 |
| -------------------- | --------------------- | ---------------------------------------- |
| `AUTH_INVALID_TOKEN` | Invalid Privy token   | Check `PRIVY_APP_SECRET`                 |
| `DATABASE_ERROR`     | Database query failed | Check database connection and migrations |
| `RPC_ERROR`          | RPC provider error    | Verify RPC URL and provider status       |
| `INSUFFICIENT_FUNDS` | Not enough balance    | Check user balance and gas fees          |
| `SAFE_NOT_DEPLOYED`  | Safe account missing  | Deploy Safe smart account                |
| `VALIDATION_FAILED`  | Invalid request data  | Check request payload format             |

---

**Still stuck?** Open an issue on [GitHub](https://github.com/TRC-Crypto/stashtab/issues) or join our [Discord](https://discord.gg/stashtab) (coming soon).
