/**
 * Batch payment primitives
 *
 * Provides utilities for batch/bulk payment processing with gas optimization
 */

import { getAddresses } from '@stashtab/config';
import { ERC20_ABI } from '@stashtab/config/abis/erc20';
import type { Address, Hash, Hex } from 'viem';
import { encodeFunctionData, encodeAbiParameters } from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../../client';
import type { PrimitiveConfig, TransactionResult } from '../../core/types';
import { executeSafeTransaction } from '../../safe/safeOperations';
import type { SafeTransactionData } from '../../safe/types';

/**
 * Individual payment in a batch
 */
export interface BatchPayment {
  to: Address;
  amount: bigint;
  id?: string; // Optional identifier for tracking
  data?: Hex; // Optional transaction data
  token?: Address; // Optional token address (defaults to native token)
}

/**
 * Batch payment request
 */
export interface BatchPaymentRequest extends PrimitiveConfig {
  payments: BatchPayment[];
  from: Address; // Safe address
  token?: Address; // Default token for payments (if not specified per payment)
  gasOptimization?: boolean; // Whether to optimize gas usage
  publicClient: StashtabPublicClient;
  walletClient: StashtabWalletClient;
}

/**
 * Batch payment result
 */
export interface BatchPaymentResult extends TransactionResult {
  successfulPayments: number;
  failedPayments: number;
  paymentResults: Array<{
    payment: BatchPayment;
    success: boolean;
    txHash?: Hash;
    error?: string;
  }>;
  totalGasUsed?: bigint;
  estimatedGas?: bigint;
}

/**
 * Batch payment estimation
 */
export interface BatchPaymentEstimation {
  totalGas: bigint;
  gasPerPayment: bigint;
  totalCost: bigint; // In native token
  isOptimized: boolean;
  estimatedTime: number; // In seconds
}

/**
 * MultiSend contract ABI (minimal)
 */
const MULTI_SEND_ABI = [
  {
    type: 'function',
    name: 'multiSend',
    inputs: [{ name: 'transactions', type: 'bytes' }],
    outputs: [],
    stateMutability: 'payable',
  },
] as const;

/**
 * Encode batch payments for MultiSend
 */
function encodeBatchTransactions(payments: BatchPayment[], defaultToken: Address | undefined): Hex {
  // MultiSend format: each transaction is 21 bytes:
  // - 1 byte: operation (0 = call, 1 = delegatecall)
  // - 20 bytes: to address
  // - variable: value (uint256, 32 bytes)
  // - variable: data length (uint256, 32 bytes)
  // - variable: data (bytes)

  const transactions: Hex[] = [];

  for (const payment of payments) {
    const token = payment.token || defaultToken;
    const operation = 0; // Call operation
    const to = token || payment.to; // If token specified, transfer to token contract
    const value = token ? 0n : payment.amount; // Native token value
    const data = token
      ? encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [payment.to, payment.amount],
        })
      : payment.data || '0x';

    // Encode transaction
    const encoded = encodeAbiParameters(
      [
        { type: 'uint8', name: 'operation' },
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'value' },
        { type: 'uint256', name: 'dataLength' },
        { type: 'bytes', name: 'data' },
      ],
      [operation, to, value, BigInt(data.length - 2) / 2n, data]
    );

    transactions.push(encoded as Hex);
  }

  // Concatenate all transactions
  return `0x${transactions.map((tx) => tx.slice(2)).join('')}` as Hex;
}

/**
 * Batch payment service interface
 */
export interface BatchPaymentService {
  /**
   * Estimate gas and costs for batch payment
   */
  estimate(request: BatchPaymentRequest): Promise<BatchPaymentEstimation>;

  /**
   * Execute batch payment
   */
  execute(request: BatchPaymentRequest): Promise<BatchPaymentResult>;

  /**
   * Validate batch payment request
   */
  validate(request: BatchPaymentRequest): Promise<{
    valid: boolean;
    errors: string[];
  }>;
}

/**
 * Create batch payment service
 *
 * @example
 * ```typescript
 * import { createBatchPaymentService } from '@stashtab/sdk/payments/batch';
 *
 * const batch = createBatchPaymentService({
 *   chainId: 8453,
 *   publicClient,
 *   walletClient, // Optional for read-only operations
 * });
 * ```
 */
export interface BatchPaymentServiceConfig extends PrimitiveConfig {
  publicClient: StashtabPublicClient;
  walletClient?: StashtabWalletClient; // Optional, required for execute operations
}

export function createBatchPaymentService(config: BatchPaymentServiceConfig): BatchPaymentService {
  const { chainId: _chainId, publicClient: _publicClient, walletClient: _walletClient } = config;

  return {
    async estimate(request: BatchPaymentRequest): Promise<BatchPaymentEstimation> {
      const { payments } = request;

      // Base gas for single transaction
      const _baseGas = 21000n;

      // ERC20 transfer gas
      const erc20TransferGas = 65000n;

      // Safe execution overhead
      const safeOverhead = 25000n;

      // Calculate estimated gas
      const useMultiSend = request.gasOptimization !== false && payments.length > 1;

      if (useMultiSend) {
        // MultiSend batches all transactions into one
        const multiSendGas = 50000n; // MultiSend contract overhead
        const perPaymentGas = 10000n; // Per payment in batch
        const totalGas = safeOverhead + multiSendGas + perPaymentGas * BigInt(payments.length);

        return {
          totalGas,
          gasPerPayment: totalGas / BigInt(payments.length),
          totalCost: 0n, // Would need gas price to calculate
          isOptimized: true,
          estimatedTime: 30, // Estimated 30 seconds for batch
        };
      } else {
        // Individual transactions
        const totalGas = BigInt(payments.length) * (safeOverhead + erc20TransferGas);

        return {
          totalGas,
          gasPerPayment: safeOverhead + erc20TransferGas,
          totalCost: 0n,
          isOptimized: false,
          estimatedTime: 30 * payments.length, // Sequential execution
        };
      }
    },

    async execute(request: BatchPaymentRequest): Promise<BatchPaymentResult> {
      const { payments, from, publicClient, walletClient, chainId, token, gasOptimization } =
        request;
      const addresses = getAddresses(chainId);

      // Validate first
      const validation = await this.validate(request);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join('; '),
          successfulPayments: 0,
          failedPayments: payments.length,
          paymentResults: payments.map((p) => ({
            payment: p,
            success: false,
            error: 'Validation failed',
          })),
        };
      }

      const useMultiSend = gasOptimization !== false && payments.length > 1 && addresses.MULTI_SEND;

      if (useMultiSend) {
        // Use MultiSend for batch optimization
        try {
          const transactions = encodeBatchTransactions(payments, token);

          const safeTx: SafeTransactionData = {
            to: addresses.MULTI_SEND,
            value: 0n,
            data: encodeFunctionData({
              abi: MULTI_SEND_ABI,
              functionName: 'multiSend',
              args: [transactions],
            }),
          };

          const txHash = await executeSafeTransaction(publicClient, walletClient, from, safeTx);

          return {
            success: true,
            txHash,
            successfulPayments: payments.length,
            failedPayments: 0,
            paymentResults: payments.map((p) => ({
              payment: p,
              success: true,
              txHash,
            })),
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            successfulPayments: 0,
            failedPayments: payments.length,
            paymentResults: payments.map((p) => ({
              payment: p,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            })),
          };
        }
      } else {
        // Execute individual transactions (fallback or when MultiSend not available)
        const results: BatchPaymentResult['paymentResults'] = [];
        let successCount = 0;
        let failCount = 0;

        for (const payment of payments) {
          try {
            const transferToken = payment.token || token;

            if (transferToken) {
              // ERC20 transfer
              const safeTx: SafeTransactionData = {
                to: transferToken,
                value: 0n,
                data: encodeFunctionData({
                  abi: ERC20_ABI,
                  functionName: 'transfer',
                  args: [payment.to, payment.amount],
                }),
              };

              const txHash = await executeSafeTransaction(publicClient, walletClient, from, safeTx);

              results.push({
                payment,
                success: true,
                txHash,
              });
              successCount++;
            } else {
              // Native token transfer
              const safeTx: SafeTransactionData = {
                to: payment.to,
                value: payment.amount,
                data: payment.data || '0x',
              };

              const txHash = await executeSafeTransaction(publicClient, walletClient, from, safeTx);

              results.push({
                payment,
                success: true,
                txHash,
              });
              successCount++;
            }
          } catch (error) {
            results.push({
              payment,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            failCount++;
          }
        }

        return {
          success: failCount === 0,
          successfulPayments: successCount,
          failedPayments: failCount,
          paymentResults: results,
        };
      }
    },

    async validate(request: BatchPaymentRequest): Promise<{
      valid: boolean;
      errors: string[];
    }> {
      const errors: string[] = [];

      if (!request.payments || request.payments.length === 0) {
        errors.push('No payments provided');
      }

      if (request.payments.length > 100) {
        errors.push('Too many payments (max 100)');
      }

      for (const payment of request.payments) {
        if (!payment.to) {
          errors.push(`Payment missing recipient address: ${payment.id || 'unknown'}`);
        }

        if (!payment.amount || payment.amount <= 0n) {
          errors.push(`Payment has invalid amount: ${payment.id || payment.to}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
  };
}
