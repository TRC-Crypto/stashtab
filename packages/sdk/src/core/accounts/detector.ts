/**
 * Account Type Detection
 *
 * Auto-detect account type from address
 */

import type { Address } from 'viem';
import type { StashtabPublicClient } from '../../client';
import { predictSafeAddress } from '../../safe/safeOperations';
import type { AccountType } from './abstraction';

/**
 * Detect account type from address
 *
 * @example
 * ```typescript
 * import { detectAccountType } from '@stashtab/sdk/core/accounts/detector';
 *
 * const type = await detectAccountType(address, publicClient);
 * // Returns: 'safe' | 'eoa' | 'contract'
 * ```
 */
export async function detectAccountType(
  address: Address,
  publicClient: StashtabPublicClient
): Promise<AccountType | 'contract'> {
  try {
    // Check if address has contract code
    const code = await publicClient.getCode({ address });

    if (code === '0x') {
      // No contract code = EOA
      return 'eoa';
    }

    // Has contract code - could be Safe, ERC-4337, or other contract
    // For now, we'll check if it matches Safe contract patterns
    // In the future, we can add ERC-4337 detection

    // Check if it's a Safe by checking for Safe-specific function selectors
    // This is a simplified check - in production, you'd want more robust detection
    const isSafe = await isSafeContract(address, publicClient);

    if (isSafe) {
      return 'safe';
    }

    // Could be ERC-4337 or other contract type
    // For now, return 'contract' as generic type
    return 'contract';
  } catch (error) {
    // On error, default to EOA (most common case)
    console.warn('Error detecting account type:', error);
    return 'eoa';
  }
}

/**
 * Check if an address is a Safe contract
 *
 * This checks for Safe-specific function selectors
 */
async function isSafeContract(
  address: Address,
  publicClient: StashtabPublicClient
): Promise<boolean> {
  try {
    // Safe contracts have specific function selectors
    // Check for `getOwners()` function (0x a0e67e2b)
    // This is a simplified check - in production, use a more robust method

    // Try to read a Safe-specific function
    // If it doesn't revert, it's likely a Safe
    const SAFE_ABI = [
      {
        type: 'function',
        name: 'getOwners',
        inputs: [],
        outputs: [{ type: 'address[]' }],
        stateMutability: 'view',
      },
    ] as const;

    try {
      await publicClient.readContract({
        address,
        abi: SAFE_ABI,
        functionName: 'getOwners',
      });
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Check if an address could be a predicted Safe address
 *
 * Useful for detecting Safe accounts before deployment
 */
export async function isPredictedSafeAddress(
  address: Address,
  ownerAddress: Address,
  chainId: number,
  publicClient: StashtabPublicClient
): Promise<boolean> {
  try {
    const predictedAddress = await predictSafeAddress(publicClient, chainId, {
      owners: [ownerAddress],
      threshold: 1,
    });
    return predictedAddress.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
}
