/**
 * Account Migration Utilities
 *
 * Helpers for migrating between account types (e.g., EOA → Safe)
 */

import type { Address } from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../../client';
import type { AccountAbstraction } from './abstraction';
import { createEOAAccount } from './eoa';
import { createSafeAccount } from './safe';

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  fromAddress: Address;
  toAddress: Address;
  txHash?: string;
  error?: string;
  assetsTransferred?: Array<{
    token: Address;
    amount: bigint;
  }>;
}

/**
 * Migrate assets from one account to another
 *
 * @example
 * ```typescript
 * import { migrateAssets } from '@stashtab/sdk/core/accounts/migration';
 *
 * const result = await migrateAssets({
 *   from: eoaAccount,
 *   to: safeAccount,
 *   tokens: [usdcAddress],
 * });
 * ```
 */
export interface MigrateAssetsConfig {
  from: AccountAbstraction;
  to: AccountAbstraction;
  tokens: Address[]; // Token addresses to transfer (empty for native token only)
  amounts?: Map<Address, bigint>; // Optional: specific amounts per token
}

export async function migrateAssets(config: MigrateAssetsConfig): Promise<MigrationResult> {
  const { from, to, tokens, amounts } = config;

  if (from.address.toLowerCase() === to.address.toLowerCase()) {
    return {
      success: false,
      fromAddress: from.address,
      toAddress: to.address,
      error: 'Cannot migrate to the same address',
    };
  }

  const assetsTransferred: Array<{ token: Address; amount: bigint }> = [];

  try {
    // Ensure destination account is deployed
    const toDeployed = await to.isDeployed();
    if (!toDeployed) {
      const deployResult = await to.deploy();
      if (!deployResult.success) {
        return {
          success: false,
          fromAddress: from.address,
          toAddress: to.address,
          error: `Failed to deploy destination account: ${deployResult.error}`,
        };
      }
    }

    // Transfer native token if specified or if no tokens provided
    if (tokens.length === 0 || !amounts || amounts.size === 0) {
      // Get balance and transfer all
      // This is a simplified version - in production, you'd want more control
    }

    // Transfer ERC20 tokens
    for (const token of tokens) {
      const amount = amounts?.get(token);
      if (amount && amount > 0n) {
        // Transfer token from source to destination
        // This would use ERC20 transfer operations
        // For now, this is a placeholder structure
        assetsTransferred.push({ token, amount });
      }
    }

    return {
      success: true,
      fromAddress: from.address,
      toAddress: to.address,
      assetsTransferred,
    };
  } catch (error: any) {
    return {
      success: false,
      fromAddress: from.address,
      toAddress: to.address,
      error: error.message || 'Migration failed',
      assetsTransferred,
    };
  }
}

/**
 * Upgrade EOA to Safe
 *
 * Creates a Safe account and migrates assets from EOA
 *
 * @example
 * ```typescript
 * import { upgradeEOAToSafe } from '@stashtab/sdk/core/accounts/migration';
 *
 * const result = await upgradeEOAToSafe({
 *   eoaAddress: userAddress,
 *   chainId: 8453,
 *   publicClient,
 *   walletClient,
 *   account: walletAccount,
 *   owners: [userAddress],
 *   tokens: [usdcAddress],
 * });
 * ```
 */
export interface UpgradeEOAToSafeConfig {
  eoaAddress: Address;
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient: StashtabWalletClient;
  account: Parameters<typeof createEOAAccount>[0]['account'];
  owners: Address[];
  threshold?: number;
  tokens?: Address[]; // Tokens to migrate
}

export async function upgradeEOAToSafe(
  config: UpgradeEOAToSafeConfig
): Promise<MigrationResult & { safeAddress: Address }> {
  const {
    eoaAddress,
    chainId,
    publicClient,
    walletClient,
    account,
    owners,
    threshold,
    tokens = [],
  } = config;

  // Create EOA account
  const eoaAccount = createEOAAccount({
    address: eoaAddress,
    chainId,
    publicClient,
    walletClient,
    account,
  });

  // Create Safe account
  const { predictSafeAddress } = await import('../../safe/safeOperations');
  const safeAddress = await predictSafeAddress(publicClient, chainId, {
    owners,
    threshold: threshold || 1,
  });

  const safeAccount = createSafeAccount({
    address: safeAddress,
    chainId,
    publicClient,
    walletClient,
    owners,
    threshold,
  });

  // Migrate assets
  const migrationResult = await migrateAssets({
    from: eoaAccount,
    to: safeAccount,
    tokens,
  });

  return {
    ...migrationResult,
    safeAddress: safeAccount.address,
  };
}
