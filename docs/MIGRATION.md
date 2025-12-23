# Migration Guide

This guide helps you migrate between Stashtab versions, especially when breaking changes are introduced.

## Overview

Stashtab follows [Semantic Versioning](VERSIONING.md). Breaking changes are only introduced in major versions (X.0.0).

## Migration Process

1. **Review Changes**: Check [CHANGELOG.md](../CHANGELOG.md) for changes in your target version
2. **Backup**: Backup your database and configuration
3. **Update Dependencies**: Update Stashtab version
4. **Run Migrations**: Apply database migrations if needed
5. **Update Configuration**: Update config files if schema changed
6. **Test**: Verify everything works in staging first

## Version History

### v0.1.0 → v0.2.0 (Planned)

**Breaking Changes:**

- None expected (minor version)

**New Features:**

- Multi-chain support
- Enhanced mobile app
- Plugin system
- Webhooks

**Migration Steps:**

1. Update dependencies: `pnpm install`
2. No database migrations expected
3. Review new environment variables (if any)
4. Test in staging environment

### v0.2.0 → v1.0.0 (Planned)

**Breaking Changes:**

- API versioning (v1 endpoints)
- Database schema changes (if any)
- Configuration format changes

**Migration Steps:**

1. Review breaking changes in release notes
2. Run database migrations: `pnpm migrate`
3. Update API endpoints to v1
4. Update configuration files
5. Test thoroughly in staging

## Database Migrations

### Running Migrations

```bash
# Apply all pending migrations
pnpm migrate

# Or manually with wrangler
wrangler d1 migrations apply stashtab-db
```

### Creating Migrations

```bash
# Create a new migration
wrangler d1 migrations create stashtab-db add_new_table
```

## Configuration Changes

### Environment Variables

When new environment variables are added:

1. Check [ENVIRONMENT.md](./ENVIRONMENT.md) for new variables
2. Add to your `.env` files or Cloudflare secrets
3. Restart services

### Config Files

When `stashtab.config.ts` schema changes:

1. Review new schema in documentation
2. Update your config file
3. Run type check: `pnpm typecheck`

## API Changes

### Versioning

Stashtab uses URL-based API versioning:

- `/v1/account` - Version 1
- `/v2/account` - Version 2 (future)

### Deprecation Policy

1. **Deprecation Notice**: Features marked deprecated in one minor release
2. **Removal**: Deprecated features removed in next major release
3. **Migration Path**: Clear migration guide provided

### Example: API Endpoint Change

**Before (v0.1.0):**

```typescript
POST / account / deposit;
```

**After (v1.0.0):**

```typescript
POST / v1 / account / deposit;
```

**Migration:**

1. Update API calls to include `/v1` prefix
2. Update SDK if using `@stashtab/sdk`
3. Test all API integrations

## SDK Changes

### Breaking Changes

When SDK has breaking changes:

1. Check SDK changelog
2. Update import paths if changed
3. Update method signatures
4. Run tests

### Example: Method Signature Change

**Before:**

```typescript
await aaveService.supply(amount, userAddress);
```

**After:**

```typescript
await aaveService.supply({ amount, userAddress });
```

## Database Schema Changes

### Column Additions

New columns are added with defaults, no migration needed for reads.

### Column Removals

1. **Deprecation Period**: Column marked deprecated
2. **Data Migration**: Migrate data before removal
3. **Removal**: Column removed in next major version

### Table Changes

1. Review migration SQL
2. Backup database
3. Run migration
4. Verify data integrity

## Rollback Procedure

If migration fails:

1. **Stop Services**: Stop all Stashtab services
2. **Restore Database**: Restore from backup
3. **Revert Code**: Revert to previous version
4. **Restart**: Restart services
5. **Investigate**: Review migration logs

## Pre-Migration Checklist

- [ ] Read CHANGELOG.md for target version
- [ ] Backup database
- [ ] Backup configuration files
- [ ] Test in staging environment
- [ ] Review breaking changes
- [ ] Update dependencies
- [ ] Run migrations
- [ ] Update configuration
- [ ] Test all features
- [ ] Monitor for errors

## Post-Migration Checklist

- [ ] Verify all services running
- [ ] Check database integrity
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check API responses
- [ ] Verify notifications working
- [ ] Test admin dashboard
- [ ] Monitor performance

## Getting Help

If you encounter issues during migration:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review [CHANGELOG.md](../CHANGELOG.md)
3. Open a [GitHub Issue](https://github.com/TRC-Crypto/stashtab/issues)
4. Ask in [GitHub Discussions](https://github.com/TRC-Crypto/stashtab/discussions)

## Related Documentation

- [VERSIONING.md](./VERSIONING.md) - Versioning strategy
- [UPGRADING.md](./UPGRADING.md) - Upgrade instructions
- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [DEPLOY.md](./DEPLOY.md) - Deployment guide
