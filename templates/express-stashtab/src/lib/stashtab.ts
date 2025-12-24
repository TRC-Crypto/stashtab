/**
 * Stashtab SDK Initialization
 *
 * Configure and initialize the Stashtab SDK client
 */

import { createStashtabClient } from '@stashtab/sdk';
import type { StashtabClient } from '@stashtab/sdk';

let client: StashtabClient | null = null;

/**
 * Get or create Stashtab client
 *
 * Singleton pattern - creates client on first call
 */
export function getStashtabClient(): StashtabClient {
  if (!client) {
    const chainId = parseInt(process.env.CHAIN_ID || '8453');
    const rpcUrl = process.env.RPC_URL;

    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }

    client = createStashtabClient({
      chainId,
      rpcUrl,
    });
  }

  return client;
}
