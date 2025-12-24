import {
  base,
  baseSepolia,
  arbitrum,
  arbitrumSepolia,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  type Chain,
} from 'viem/chains';

/**
 * Supported chains configuration
 * Multi-chain support for onchain finance primitives
 */
export const SUPPORTED_CHAINS = {
  // Base
  8453: base,
  84532: baseSepolia,
  // Arbitrum
  42161: arbitrum,
  421614: arbitrumSepolia,
  // Optimism
  10: optimism,
  11155420: optimismSepolia,
  // Polygon
  137: polygon,
  80002: polygonAmoy,
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
 * RPC URLs for supported chains
 */
export const RPC_URLS: Record<number, string> = {
  // Base
  8453: 'https://mainnet.base.org',
  84532: 'https://sepolia.base.org',
  // Arbitrum
  42161: 'https://arb1.arbitrum.io/rpc',
  421614: 'https://sepolia-rollup.arbitrum.io/rpc',
  // Optimism
  10: 'https://mainnet.optimism.io',
  11155420: 'https://sepolia.optimism.io',
  // Polygon
  137: 'https://polygon-rpc.com',
  80002: 'https://rpc-amoy.polygon.technology',
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
  // Base
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
  // Arbitrum
  42161: 'https://arbiscan.io',
  421614: 'https://sepolia.arbiscan.io',
  // Optimism
  10: 'https://optimistic.etherscan.io',
  11155420: 'https://sepolia-optimism.etherscan.io',
  // Polygon
  137: 'https://polygonscan.com',
  80002: 'https://amoy.polygonscan.com',
};

export function getBlockExplorerUrl(chainId: number): string {
  return BLOCK_EXPLORER_URLS[chainId] || 'https://basescan.org';
}

/**
 * Chain metadata
 */
export interface ChainMetadata {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  protocolSupport: {
    aave: boolean;
    morpho: boolean;
    safe: boolean;
  };
}

/**
 * Chain metadata for all supported chains
 */
export const CHAIN_METADATA: Record<number, ChainMetadata> = {
  // Base
  8453: {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: false,
    protocolSupport: { aave: true, morpho: true, safe: true },
  },
  84532: {
    id: 84532,
    name: 'Base Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: true,
    protocolSupport: { aave: true, morpho: false, safe: true },
  },
  // Arbitrum
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: false,
    protocolSupport: { aave: true, morpho: true, safe: true },
  },
  421614: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: true,
    protocolSupport: { aave: true, morpho: false, safe: true },
  },
  // Optimism
  10: {
    id: 10,
    name: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: false,
    protocolSupport: { aave: true, morpho: true, safe: true },
  },
  11155420: {
    id: 11155420,
    name: 'Optimism Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: true,
    protocolSupport: { aave: true, morpho: false, safe: true },
  },
  // Polygon
  137: {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    isTestnet: false,
    protocolSupport: { aave: true, morpho: false, safe: true },
  },
  80002: {
    id: 80002,
    name: 'Polygon Amoy',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    isTestnet: true,
    protocolSupport: { aave: true, morpho: false, safe: true },
  },
};

export function getChainMetadata(chainId: number): ChainMetadata | undefined {
  return CHAIN_METADATA[chainId];
}

export function getTransactionUrl(chainId: number, txHash: string): string {
  return `${getBlockExplorerUrl(chainId)}/tx/${txHash}`;
}

export function getAddressUrl(chainId: number, address: string): string {
  return `${getBlockExplorerUrl(chainId)}/address/${address}`;
}
