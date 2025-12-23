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
import { getChain, getRpcUrl } from '@stashtab/config';

export type StashtabPublicClient = PublicClient<HttpTransport, Chain>;
export type StashtabWalletClient = WalletClient<HttpTransport, Chain, Account>;

/**
 * Create a public client for reading blockchain data
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

