/**
 * Account Factory
 *
 * Create account instances with auto-detection
 */

import type { Address, Account } from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../../client';
import { predictSafeAddress } from '../../safe/safeOperations';
import type { AccountAbstraction, AccountConfig } from './abstraction';
import { detectAccountType } from './detector';
import { createEOAAccount } from './eoa';
import { createSafeAccount } from './safe';

/**
 * Create an account instance
 *
 * Auto-detects account type if 'auto' is specified, or creates the specified type
 *
 * @example
 * ```typescript
 * import { createAccount } from '@stashtab/sdk/core/accounts/factory';
 *
 * // Auto-detect
 * const account = await createAccount('auto', {
 *   address: userAddress,
 *   chainId: 8453,
 *   publicClient,
 *   walletClient,
 *   account: walletAccount,
 * });
 *
 * // Explicit Safe
 * const safe = await createAccount('safe', {
 *   chainId: 8453,
 *   owners: [ownerAddress],
 *   publicClient,
 *   walletClient,
 * });
 *
 * // Explicit EOA
 * const eoa = await createAccount('eoa', {
 *   address: userAddress,
 *   chainId: 8453,
 *   publicClient,
 *   walletClient,
 *   account: walletAccount,
 * });
 * ```
 */
export async function createAccount(
  type: 'safe' | 'eoa' | 'auto',
  config: AccountConfig & {
    publicClient: StashtabPublicClient;
    walletClient: StashtabWalletClient;
    account?: Account; // Required for EOA
    owners?: Address[]; // Required for Safe
  }
): Promise<AccountAbstraction> {
  const { chainId, publicClient, walletClient, address, owners, threshold } = config;

  if (type === 'safe') {
    if (!owners || owners.length === 0) {
      throw new Error('owners array is required for Safe accounts');
    }

    // If address not provided, predict it
    const safeAddress =
      address ||
      (await predictSafeAddress(publicClient, chainId, {
        owners,
        threshold: threshold || 1,
      }));

    return createSafeAccount({
      address: safeAddress,
      chainId,
      publicClient,
      walletClient,
      owners,
      threshold,
    });
  }

  if (type === 'eoa') {
    if (!address) {
      throw new Error('address is required for EOA accounts');
    }
    if (!config.account) {
      throw new Error('account (wallet account) is required for EOA accounts');
    }

    return createEOAAccount({
      address,
      chainId,
      publicClient,
      walletClient,
      account: config.account,
    });
  }

  // Auto-detect
  if (!address) {
    throw new Error('address is required for auto-detection');
  }

  const detectedType = await detectAccountType(address, publicClient);

  if (detectedType === 'safe') {
    // For Safe, we need owners - try to get them or use provided
    if (!owners || owners.length === 0) {
      // Try to read owners from Safe contract
      // For now, throw error - in production, read from contract
      throw new Error('owners array is required for Safe accounts. Cannot auto-detect owners.');
    }

    return createSafeAccount({
      address,
      chainId,
      publicClient,
      walletClient,
      owners,
      threshold,
    });
  }

  // Default to EOA
  if (!config.account) {
    throw new Error('account (wallet account) is required for EOA accounts');
  }

  return createEOAAccount({
    address,
    chainId,
    publicClient,
    walletClient,
    account: config.account,
  });
}

/**
 * Create account from wallet connection
 *
 * Convenience function for creating accounts from connected wallets
 *
 * @example
 * ```typescript
 * import { createAccountFromWallet } from '@stashtab/sdk/core/accounts/factory';
 *
 * const account = await createAccountFromWallet({
 *   address: walletAddress,
 *   chainId: 8453,
 *   publicClient,
 *   walletClient,
 *   account: walletAccount,
 * });
 * ```
 */
export async function createAccountFromWallet(config: {
  address: Address;
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient: StashtabWalletClient;
  account: Account;
}): Promise<AccountAbstraction> {
  return createAccount('auto', config);
}
