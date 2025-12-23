import type { Address, Hash } from 'viem';

/**
 * User account information
 */
export interface UserAccount {
  userId: string;
  safeAddress: Address;
  ownerAddress: Address;
  createdAt: number;
}

/**
 * Balance breakdown for a user
 */
export interface UserBalance {
  // USDC sitting in Safe (not yet supplied to Aave)
  safeBalance: bigint;
  // USDC supplied to Aave (aUSDC balance)
  aaveBalance: bigint;
  // Total balance (safe + aave)
  totalBalance: bigint;
  // Total amount ever deposited
  totalDeposited: bigint;
  // Yield earned (aave - deposited)
  yieldEarned: bigint;
}

/**
 * Current yield rate information
 */
export interface YieldRate {
  // Current APY as percentage (e.g., 4.5 for 4.5%)
  apyPercent: number;
  // Raw liquidity rate from Aave (in ray)
  liquidityRate: bigint;
  // Last update timestamp
  lastUpdated: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean;
  txHash?: Hash;
  error?: string;
}

/**
 * Safe deployment result
 */
export interface SafeDeploymentResult {
  success: boolean;
  safeAddress?: Address;
  txHash?: Hash;
  error?: string;
}

/**
 * Transfer request
 */
export interface TransferRequest {
  to: Address;
  amount: bigint;
}

/**
 * Deposit request (supply to Aave)
 */
export interface DepositRequest {
  amount: bigint;
}

/**
 * Withdraw request (from Aave)
 */
export interface WithdrawRequest {
  amount: bigint;
  to: Address;
}

