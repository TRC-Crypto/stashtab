# Upgrading Stashtab

This guide provides step-by-step instructions for upgrading Stashtab to a new version.

## Quick Upgrade

For patch releases (0.0.X) with bug fixes only:

```bash
# Update dependencies
pnpm install

# Restart services
pnpm dev
```

## Standard Upgrade Process

### 1. Check Current Version

```bash
# Check package.json
cat package.json | grep version

# Or check git tags
git tag --list
```

### 2. Review Changes

```bash
# Read CHANGELOG
cat CHANGELOG.md

# Check for breaking changes
grep -i "breaking" CHANGELOG.md
```

### 3. Backup

```bash
# Backup database
pnpm backup-db

# Backup configuration
cp stashtab.config.ts stashtab.config.ts.backup
cp apps/api/.dev.vars apps/api/.dev.vars.backup
```

### 4. Update Dependencies

```bash
# Update Stashtab
git pull origin main

# Or for specific version
git checkout v0.2.0

# Install dependencies
pnpm install --frozen-lockfile
```

### 5. Run Migrations

```bash
# Apply database migrations
pnpm migrate

# Or manually
wrangler d1 migrations apply stashtab-db
```

### 6. Update Configuration

Check for new environment variables or config changes:

```bash
# Compare example files
diff apps/api/.dev.vars.example apps/api/.dev.vars
```

### 7. Test

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### 8. Deploy

```bash
# Deploy to staging first
pnpm deploy:auto --env staging

# Test staging thoroughly

# Deploy to production
pnpm deploy:auto --env production
```

## Version-Specific Upgrades

### Upgrading to v0.2.0 (Planned)

**Prerequisites:**

- Current version: v0.1.0
- Node.js 18+
- pnpm 9+

**Steps:**

1. **Update Code**

   ```bash
   git pull origin main
   pnpm install
   ```

2. **No Database Migrations** (minor version)

3. **Update Environment Variables** (if new ones added)
   - Check [ENVIRONMENT.md](./ENVIRONMENT.md)
   - Add new variables to `.env` files

4. **Test**

   ```bash
   pnpm test
   pnpm dev
   ```

5. **Deploy**
   ```bash
   pnpm deploy:auto
   ```

### Upgrading to v1.0.0 (Planned)

**Prerequisites:**

- Current version: v0.x.x
- Backup database
- Test in staging

**Steps:**

1. **Review Breaking Changes**
   - Read [MIGRATION.md](./MIGRATION.md)
   - Check API changes
   - Review config changes

2. **Update Code**

   ```bash
   git checkout v1.0.0
   pnpm install
   ```

3. **Run Database Migrations**

   ```bash
   pnpm migrate
   ```

4. **Update Configuration**
   - Update `stashtab.config.ts` if schema changed
   - Update environment variables
   - Update API endpoints to `/v1/` if needed

5. **Update SDK Usage** (if applicable)
   - Check SDK changelog
   - Update method calls
   - Run tests

6. **Test Thoroughly**

   ```bash
   pnpm test
   pnpm test:e2e
   pnpm dev
   ```

7. **Deploy**

   ```bash
   # Staging first
   pnpm deploy:auto --env staging

   # Production after testing
   pnpm deploy:auto --env production
   ```

## Cloudflare-Specific Upgrades

### Updating Workers

```bash
# Update secrets if needed
wrangler secret put NEW_SECRET

# Deploy
wrangler deploy
```

### Updating Pages

1. Update code in repository
2. Cloudflare Pages auto-deploys on push
3. Or manually trigger in dashboard

### Updating D1 Database

```bash
# Apply migrations
wrangler d1 migrations apply stashtab-db --remote

# Or for local
wrangler d1 migrations apply stashtab-db --local
```

## Rollback

If upgrade fails:

### Quick Rollback

```bash
# Revert to previous version
git checkout v0.1.0
pnpm install
pnpm deploy:auto
```

### Database Rollback

```bash
# Restore from backup
# (Use your backup tool)

# Or restore specific migration
wrangler d1 migrations list stashtab-db
# Then restore previous state
```

## Troubleshooting Upgrades

### Dependency Conflicts

```bash
# Clear cache
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Migration Failures

1. Check migration logs
2. Verify database connection
3. Check for schema conflicts
4. Restore from backup if needed

### Build Failures

```bash
# Clear build cache
pnpm clean

# Rebuild
pnpm build
```

### Runtime Errors

1. Check error logs
2. Verify environment variables
3. Check API compatibility
4. Review CHANGELOG for known issues

## Best Practices

1. **Always Test in Staging First**
   - Never upgrade production without testing
   - Use staging environment identical to production

2. **Backup Before Upgrading**
   - Database backups
   - Configuration backups
   - Code backups (git tags)

3. **Read Release Notes**
   - Check CHANGELOG.md
   - Review breaking changes
   - Read migration guides

4. **Upgrade Incrementally**
   - Don't skip versions
   - Upgrade one version at a time
   - Test between versions

5. **Monitor After Upgrade**
   - Watch error logs
   - Monitor performance
   - Check user reports

## Automated Upgrades

### Using Dependabot

Dependabot is configured to:

- Check for dependency updates
- Create PRs for security updates
- Notify about new versions

### Manual Upgrade Script

```bash
#!/bin/bash
# upgrade.sh

set -e

echo "Backing up..."
pnpm backup-db

echo "Updating..."
git pull origin main
pnpm install --frozen-lockfile

echo "Migrating..."
pnpm migrate

echo "Testing..."
pnpm test
pnpm typecheck

echo "Upgrade complete!"
```

## Related Documentation

- [MIGRATION.md](./MIGRATION.md) - Detailed migration guide
- [VERSIONING.md](./VERSIONING.md) - Versioning strategy
- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [DEPLOY.md](./DEPLOY.md) - Deployment guide
