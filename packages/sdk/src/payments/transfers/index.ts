/**
 * Transfer payment primitives
 *
 * Provides basic stablecoin transfer functionality with account abstraction support
 */

// Re-export Safe operations for transfer functionality (backward compatibility)
export { SafeService } from '../../safe/SafeService';
export { executeSafeTransaction } from '../../safe/safeOperations';
export type { SafeTransactionData } from '../../safe/types';

import type { Address } from 'viem';
import type { AccountAbstraction } from '../../core/accounts/abstraction';
import type { PrimitiveConfig, TransactionResult } from '../../core/types';

/**
 * Transfer request
 */
export interface TransferRequest extends PrimitiveConfig {
  from: Address;
  to: Address;
  amount: bigint;
  token: Address; // Token address (e.g., USDC)
  gasOptimized?: boolean;
}

/**
 * Batch transfer request
 */
export interface BatchTransferRequest extends PrimitiveConfig {
  from: Address;
  transfers: Array<{
    to: Address;
    amount: bigint;
    token: Address;
  }>;
}

/**
 * Transfer service interface
 */
export interface TransferService {
  /**
   * Execute single transfer
   */
  transfer(request: TransferRequest): Promise<TransactionResult>;

  /**
   * Estimate gas for transfer
   */
  estimateGas(request: TransferRequest): Promise<bigint>;

  /**
   * Validate transfer request
   */
  validate(request: TransferRequest): Promise<{
    valid: boolean;
    errors: string[];
  }>;
}

/**
 * Create transfer service
 *
 * @example
 * ```typescript
 * import { createTransferService } from '@stashtab/sdk/payments/transfers';
 *
 * const transfer = createTransferService({ chainId: 8453 });
 * ```
 */
export interface TransferServiceConfig extends PrimitiveConfig {
  publicClient?: any; // Optional, for future use
  walletClient?: any; // Optional, for future use
}

export function createTransferService(_config: TransferServiceConfig): TransferService {
  // TODO: Implement transfer service using account abstraction
  // For now, return a stub that throws helpful errors
  return {
    async transfer(_request: TransferRequest): Promise<TransactionResult> {
      throw new Error(
        'Transfer service not yet implemented. Use executeTransfer() with account abstraction for now.'
      );
    },
    async estimateGas(_request: TransferRequest): Promise<bigint> {
      throw new Error(
        'Transfer service not yet implemented. Use account abstraction directly for now.'
      );
    },
    async validate(_request: TransferRequest): Promise<{ valid: boolean; errors: string[] }> {
      const errors: string[] = [];
      if (!_request.from) errors.push('from address is required');
      if (!_request.to) errors.push('to address is required');
      if (!_request.amount || _request.amount <= 0n) errors.push('amount must be positive');
      if (!_request.token) errors.push('token address is required');
      return { valid: errors.length === 0, errors };
    },
  };
}

/**
 * Execute transfer using account abstraction
 *
 * Works with any account type (Safe, EOA, etc.)
 *
 * @example
 * ```typescript
 * import { executeTransfer } from '@stashtab/sdk/payments/transfers';
 *
 * const result = await executeTransfer({
 *   account: myAccount, // AccountAbstraction instance
 *   to: recipientAddress,
 *   amount: 1000n,
 *   token: usdcAddress,
 * });
 * ```
 */
export interface ExecuteTransferConfig {
  account: AccountAbstraction;
  to: Address;
  amount: bigint;
  token: Address;
}

export async function executeTransfer(config: ExecuteTransferConfig): Promise<TransactionResult> {
  const { account, to, amount, token } = config;

  // Import ERC20 ABI for token transfer
  const { ERC20_ABI } = await import('@stashtab/config/abis');
  const { encodeFunctionData } = await import('viem');

  // Encode ERC20 transfer
  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [to, amount],
  });

  // Execute transaction using account abstraction
  return account.executeTransaction({
    to: token,
    value: 0n,
    data,
  });
}
