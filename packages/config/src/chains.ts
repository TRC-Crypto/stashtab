import { base, baseSepolia, type Chain } from 'viem/chains';

/**
 * Supported chains configuration
 */
export const SUPPORTED_CHAINS = {
  8453: base,
  84532: baseSepolia,
} as const;

export type SupportedChain = (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];

export function getChain(chainId: number): Chain {
  if (!(chainId in SUPPORTED_CHAINS)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
}

/**
 * Default chain for the application
 * Set to Base Sepolia for testnet development
 */
export const DEFAULT_CHAIN_ID = 84532;

/**
 * RPC URLs
 */
export const RPC_URLS: Record<number, string> = {
  8453: 'https://mainnet.base.org',
  84532: 'https://sepolia.base.org',
};

export function getRpcUrl(chainId: number, customRpcUrl?: string): string {
  if (customRpcUrl) return customRpcUrl;
  if (!(chainId in RPC_URLS)) {
    throw new Error(`No RPC URL for chain ID: ${chainId}`);
  }
  return RPC_URLS[chainId];
}

/**
 * Block explorer URLs
 */
export const BLOCK_EXPLORER_URLS: Record<number, string> = {
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
};

export function getBlockExplorerUrl(chainId: number): string {
  return BLOCK_EXPLORER_URLS[chainId] || 'https://basescan.org';
}

export function getTransactionUrl(chainId: number, txHash: string): string {
  return `${getBlockExplorerUrl(chainId)}/tx/${txHash}`;
}

export function getAddressUrl(chainId: number, address: string): string {
  return `${getBlockExplorerUrl(chainId)}/address/${address}`;
}

