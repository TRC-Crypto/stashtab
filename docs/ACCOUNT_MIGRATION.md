# Account Migration Guide

This guide explains how to migrate between different account types in Stashtab.

## Overview

Stashtab supports multiple account types:

- **EOA** (Externally Owned Account) - Traditional Ethereum wallets
- **Safe** - Smart contract wallets with multi-sig support
- **ERC-4337** - Account abstraction wallets (future)

You can migrate assets between account types as your needs evolve.

## Migration Scenarios

### EOA → Safe

Upgrade from a simple wallet to a Safe smart account for enhanced security and features.

```typescript
import { upgradeEOAToSafe } from '@stashtab/sdk/core/accounts/migration';
import { createAccountFromWallet } from '@stashtab/sdk/core/accounts/factory';

// Your existing EOA wallet
const eoaAccount = await createAccountFromWallet({
  address: userAddress,
  chainId: 8453,
  publicClient,
  walletClient,
  account: walletAccount,
});

// Upgrade to Safe
const result = await upgradeEOAToSafe({
  eoaAddress: userAddress,
  chainId: 8453,
  publicClient,
  walletClient,
  account: walletAccount,
  owners: [userAddress], // Can add more owners later
  threshold: 1,
  tokens: [usdcAddress], // Tokens to migrate
});

if (result.success) {
  console.log(`Migrated to Safe: ${result.safeAddress}`);
  console.log(`Transaction: ${result.txHash}`);
}
```

### Migrate Assets Between Accounts

Transfer assets from one account to another (any account type).

```typescript
import { migrateAssets } from '@stashtab/sdk/core/accounts/migration';

const result = await migrateAssets({
  from: sourceAccount, // Any AccountAbstraction
  to: destinationAccount, // Any AccountAbstraction
  tokens: [usdcAddress, daiAddress],
  amounts: new Map([
    [usdcAddress, 1000n],
    [daiAddress, 500n],
  ]),
});

if (result.success) {
  console.log('Migration complete');
  console.log('Assets transferred:', result.assetsTransferred);
}
```

## Best Practices

1. **Test First**: Always test migrations on testnet before mainnet
2. **Verify Balances**: Check balances before and after migration
3. **Gas Costs**: Account for gas costs when migrating
4. **Backup**: Ensure you have backups of all private keys/seed phrases

## Account Type Comparison

| Feature    | EOA         | Safe     | ERC-4337 |
| ---------- | ----------- | -------- | -------- |
| Deployment | None        | Required | Required |
| Multi-sig  | No          | Yes      | Depends  |
| Recovery   | Seed phrase | Owners   | Depends  |
| Gas Cost   | Lower       | Higher   | Medium   |
| Security   | Medium      | High     | High     |

## Migration Checklist

- [ ] Verify source account has sufficient balance
- [ ] Calculate gas costs
- [ ] Backup all credentials
- [ ] Test on testnet first
- [ ] Verify destination account is deployed
- [ ] Execute migration
- [ ] Verify balances after migration
- [ ] Update application to use new account
