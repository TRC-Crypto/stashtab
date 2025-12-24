/**
 * Safe Protocol Integration
 *
 * Provides smart account management using Safe Protocol
 */

export { SafeService } from './SafeService';
export * from './safeOperations';
export * from './types';

/**
 * Factory function to create a SafeService instance
 *
 * @example
 * ```typescript
 * import { createSafeService } from '@stashtab/sdk/safe';
 *
 * const safe = createSafeService({
 *   chainId: 8453,
 *   publicClient,
 *   walletClient,
 * });
 *
 * const address = await safe.predictAddress(ownerAddress);
 * ```
 */
import type { StashtabPublicClient, StashtabWalletClient } from '../client';
import { SafeService } from './SafeService';

export interface SafeServiceConfig {
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient: StashtabWalletClient;
}

export function createSafeService(config: SafeServiceConfig): SafeService {
  return new SafeService(config.publicClient, config.walletClient, config.chainId);
}
