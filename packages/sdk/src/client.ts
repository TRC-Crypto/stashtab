import { getChain, getRpcUrl } from '@stashtab/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Chain,
  type PublicClient,
  type WalletClient,
  type HttpTransport,
} from 'viem';

export type StashtabPublicClient = PublicClient<HttpTransport, Chain>;
export type StashtabWalletClient = WalletClient<HttpTransport, Chain, Account>;

/**
 * Create a public client for reading blockchain data
 *
 * @example
 * ```typescript
 * import { createStashtabPublicClient } from '@stashtab/sdk/client';
 *
 * const publicClient = createStashtabPublicClient(8453); // Base mainnet
 * ```
 */
export function createStashtabPublicClient(chainId: number, rpcUrl?: string): StashtabPublicClient {
  const chain = getChain(chainId);
  const transport = http(getRpcUrl(chainId, rpcUrl));

  return createPublicClient({
    chain,
    transport,
  });
}

/**
 * Create a wallet client for signing transactions
 *
 * @example
 * ```typescript
 * import { createStashtabWalletClient } from '@stashtab/sdk/client';
 *
 * const walletClient = createStashtabWalletClient(8453, account);
 * ```
 */
export function createStashtabWalletClient(
  chainId: number,
  account: Account,
  rpcUrl?: string
): StashtabWalletClient {
  const chain = getChain(chainId);
  const transport = http(getRpcUrl(chainId, rpcUrl));

  return createWalletClient({
    chain,
    transport,
    account,
  });
}
