/**
 * Aave v3 Protocol Integration
 *
 * Provides yield generation through Aave v3 lending protocol
 */

export { AaveService } from './AaveService';
export * from './aaveOperations';

/**
 * Factory function to create an AaveService instance
 *
 * @example
 * ```typescript
 * import { createAaveService } from '@stashtab/sdk/yield/aave';
 *
 * const aave = createAaveService({
 *   chainId: 8453,
 *   publicClient,
 * });
 *
 * const yieldRate = await aave.getYieldRate();
 * ```
 */
import type { StashtabPublicClient } from '../client';
import { AaveService } from './AaveService';

export interface AaveServiceConfig {
  chainId: number;
  publicClient: StashtabPublicClient;
}

export function createAaveService(config: AaveServiceConfig): AaveService {
  return new AaveService(config.publicClient, config.chainId);
}
