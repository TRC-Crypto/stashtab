/**
 * Convenience client factory
 *
 * Provides a zero-config option for beginners with pre-configured services
 *
 * @example
 * ```typescript
 * import { createStashtabClient } from '@stashtab/sdk';
 *
 * // Zero-config (auto-creates clients)
 * const client = createStashtabClient({ chainId: 8453 });
 *
 * // Use services immediately
 * const apy = await client.yield.aave.getYieldRate();
 * ```
 */

import type { Account } from 'viem';
import { createAaveService } from './aave';
import { createStashtabPublicClient, createStashtabWalletClient } from './client';
import type { StashtabPublicClient, StashtabWalletClient } from './client';
import { createSanctionsScreeningService } from './compliance/sanctions';
import { createBatchPaymentService } from './payments/batch';
import { createStreamingPaymentService } from './payments/streaming';
import { createTransferService } from './payments/transfers';
import { createSafeService } from './safe';
import { createMorphoService } from './yield/morpho';
import { createYieldRouter } from './yield/router';

/**
 * Configuration for the convenience client
 */
export interface StashtabClientConfig {
  chainId: number;
  rpcUrl?: string;
  publicClient?: StashtabPublicClient; // Optional override
  walletClient?: StashtabWalletClient; // Optional override
  account?: Account; // For auto-creating walletClient
}

/**
 * Pre-configured Stashtab client with all services
 */
export interface StashtabClient {
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient?: StashtabWalletClient;

  yield: {
    aave: ReturnType<typeof createAaveService>;
    morpho: ReturnType<typeof createMorphoService>;
    router: ReturnType<typeof createYieldRouter>;
  };

  payments: {
    streaming: ReturnType<typeof createStreamingPaymentService>;
    batch: ReturnType<typeof createBatchPaymentService>;
    transfer: ReturnType<typeof createTransferService>;
  };

  accounts: {
    safe: ReturnType<typeof createSafeService> | null; // null if no walletClient
  };

  compliance: {
    sanctions: ReturnType<typeof createSanctionsScreeningService>;
  };
}

/**
 * Create a convenience client with pre-configured services
 *
 * This is the recommended entry point for beginners. All services are
 * pre-configured and ready to use.
 *
 * @example
 * ```typescript
 * // Zero-config
 * const client = createStashtabClient({ chainId: 8453 });
 *
 * // With custom RPC
 * const client = createStashtabClient({
 *   chainId: 8453,
 *   rpcUrl: 'https://custom-rpc.com'
 * });
 *
 * // With wallet (for write operations)
 * const client = createStashtabClient({
 *   chainId: 8453,
 *   account: myAccount
 * });
 * ```
 */
export function createStashtabClient(config: StashtabClientConfig): StashtabClient {
  const {
    chainId,
    rpcUrl,
    publicClient: providedPublicClient,
    walletClient: providedWalletClient,
    account,
  } = config;

  // Create or use provided clients
  const publicClient = providedPublicClient || createStashtabPublicClient(chainId, rpcUrl);
  const walletClient =
    providedWalletClient ||
    (account ? createStashtabWalletClient(chainId, account, rpcUrl) : undefined);

  // Create all services
  const aave = createAaveService({ chainId, publicClient });
  const morpho = createMorphoService({ chainId, publicClient, walletClient });
  const router = createYieldRouter({ chainId, strategy: 'balanced' });

  const streaming = createStreamingPaymentService({ chainId, publicClient, walletClient });
  const batch = createBatchPaymentService({ chainId, publicClient, walletClient });
  const transfer = createTransferService({ chainId });

  const safe = walletClient ? createSafeService({ chainId, publicClient, walletClient }) : null;

  const sanctions = createSanctionsScreeningService({ chainId });

  return {
    chainId,
    publicClient,
    walletClient,
    yield: {
      aave,
      morpho,
      router,
    },
    payments: {
      streaming,
      batch,
      transfer,
    },
    accounts: {
      safe,
    },
    compliance: {
      sanctions,
    },
  };
}
