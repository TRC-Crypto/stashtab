import type { Address } from 'viem';

/**
 * Contract addresses for Stashtab on supported chains
 */
export const ADDRESSES = {
  // Base Mainnet (Chain ID: 8453)
  8453: {
    // Stablecoins
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,

    // Aave v3 Protocol
    AAVE_POOL: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' as Address,
    AAVE_POOL_DATA_PROVIDER: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac' as Address,
    aUSDC: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB' as Address,

    // Safe Protocol
    SAFE_PROXY_FACTORY: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2' as Address,
    SAFE_SINGLETON: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552' as Address,
    SAFE_FALLBACK_HANDLER: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4' as Address,
    MULTI_SEND: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761' as Address,

    // Sablier v2 Protocol
    // LockupLinear contract for linear streaming payments
    // See: https://docs.sablier.com/contracts/v2/deployments
    SABLIER_LOCKUP_LINEAR: '0xAFb979d9afAd1AD27C5eFf4E27226E3AB9e5d8F6' as Address,

    // Morpho Blue Protocol
    // Main Morpho Blue contract
    // See: https://docs.morpho.org/contracts/addresses
    MORPHO_BLUE: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb' as Address,
  },

  // Base Sepolia Testnet (Chain ID: 84532)
  84532: {
    // Stablecoins (test USDC)
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address,

    // Aave v3 Protocol (Testnet)
    AAVE_POOL: '0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b' as Address,
    AAVE_POOL_DATA_PROVIDER: '0x2A0979257105834789bC6b9E1B00446DFbA8dFBa' as Address,
    aUSDC: '0x460b97BD498E1157530AEb3086301d5225b91216' as Address,

    // Safe Protocol
    SAFE_PROXY_FACTORY: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2' as Address,
    SAFE_SINGLETON: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552' as Address,
    SAFE_FALLBACK_HANDLER: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4' as Address,
    MULTI_SEND: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761' as Address,

    // Sablier v2 Protocol (testnet)
    // NOTE: Verify address against official documentation before production use
    SABLIER_LOCKUP_LINEAR: '0xAFb979d9afAd1AD27C5eFf4E27226E3AB9e5d8F6' as Address,

    // Morpho Blue Protocol (testnet - may not be available)
    // NOTE: Verify address against official documentation before production use
    MORPHO_BLUE: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb' as Address,
  },
} as const;

export type SupportedChainId = keyof typeof ADDRESSES;

export function getAddresses(chainId: number) {
  if (!(chainId in ADDRESSES)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return ADDRESSES[chainId as SupportedChainId];
}
