/**
 * Streaming payment primitives
 *
 * Provides utilities for Sablier v2 streaming payments
 *
 * Documentation: https://docs.sablier.com/contracts/v2/core/lockup-linear
 * GraphQL API: https://docs.sablier.com/api/overview
 */

import { getAddresses, SABLIER_LOCKUP_LINEAR_ABI, ERC20_ABI } from '@stashtab/config';
import type { Address } from 'viem';
import { encodeFunctionData } from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../../client';
import type { PrimitiveConfig, TransactionResult } from '../../core/types';
import { executeSafeTransaction } from '../../safe/safeOperations';
import type { SafeTransactionData } from '../../safe/types';

/**
 * Payment stream configuration
 */
export interface PaymentStreamConfig extends PrimitiveConfig {
  recipient: Address;
  token: Address;
  amount: bigint; // Total amount to stream
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  cancelable?: boolean;
  transferable?: boolean;
  publicClient: StashtabPublicClient;
  walletClient: StashtabWalletClient;
  sender: Address; // Safe address sending the stream
}

/**
 * Payment stream status
 */
export type StreamStatus = 'pending' | 'active' | 'completed' | 'cancelled';

/**
 * Payment stream information
 */
export interface PaymentStream {
  streamId: string;
  sender: Address;
  recipient: Address;
  token: Address;
  totalAmount: bigint;
  remainingAmount: bigint;
  startTime: number;
  endTime: number;
  status: StreamStatus;
  ratePerSecond: bigint;
  withdrawnAmount: bigint;
  cliffTime?: number;
}

/**
 * Stream modification request
 */
export interface StreamModification {
  streamId: string;
  action: 'cancel' | 'pause' | 'resume' | 'update-amount' | 'transfer';
  recipient?: Address; // For transfer action
  amount?: bigint; // For update-amount action
}

/**
 * Stream modification result
 */
export interface StreamModificationResult extends TransactionResult {
  streamId: string;
  newStatus?: StreamStatus;
}

/**
 * Streaming payment service interface
 */
export interface StreamingPaymentService {
  /**
   * Create a new payment stream
   */
  createStream(config: PaymentStreamConfig): Promise<TransactionResult & { streamId?: string }>;

  /**
   * Get stream information
   */
  getStream(streamId: string): Promise<PaymentStream | null>;

  /**
   * Get all streams for a user
   */
  getUserStreams(userAddress: Address): Promise<PaymentStream[]>;

  /**
   * Calculate withdrawable amount
   */
  getWithdrawableAmount(streamId: string): Promise<bigint>;

  /**
   * Withdraw from stream
   */
  withdraw(streamId: string, amount?: bigint, to?: Address): Promise<TransactionResult>;

  /**
   * Modify stream (cancel, pause, etc.)
   */
  modifyStream(modification: StreamModification): Promise<StreamModificationResult>;
}

/**
 * Create streaming payment service
 *
 * @example
 * ```typescript
 * import { createStreamingPaymentService } from '@stashtab/sdk/payments/streaming';
 *
 * const streaming = createStreamingPaymentService({
 *   chainId: 8453,
 *   publicClient,
 *   walletClient, // Optional for read-only operations
 * });
 * ```
 *
 * Uses Sablier v2 LockupLinear contract for linear streaming payments
 *
 * @see https://docs.sablier.com/contracts/v2/core/lockup-linear
 */
export interface StreamingPaymentServiceConfig extends PrimitiveConfig {
  publicClient: StashtabPublicClient;
  walletClient?: StashtabWalletClient; // Optional, required for write operations
}

export function createStreamingPaymentService(
  config: StreamingPaymentServiceConfig
): StreamingPaymentService {
  const { chainId, publicClient, walletClient } = config;
  const addresses = getAddresses(chainId);

  return {
    async createStream(
      streamConfig: PaymentStreamConfig
    ): Promise<TransactionResult & { streamId?: string }> {
      if (!walletClient) {
        throw new Error('walletClient is required for createStream operations');
      }

      const {
        sender,
        recipient,
        token,
        amount,
        startTime,
        endTime,
        cancelable = false,
        transferable = false,
        publicClient: pc,
        walletClient: wc,
      } = streamConfig;

      // Ensure walletClient is available
      if (!wc) {
        throw new Error('walletClient is required in streamConfig for createStream');
      }

      // Validate time range
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      const now = Math.floor(Date.now() / 1000);
      if (startTime < now) {
        throw new Error('Start time must be in the future');
      }

      // Calculate durations
      const cliffDuration = 0; // No cliff by default
      const totalDuration = endTime - startTime;

      // Check token allowance first
      const sablierAddress = addresses.SABLIER_LOCKUP_LINEAR;
      const allowance = await pc.readContract({
        address: token,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [sender, sablierAddress],
      });

      if (allowance < amount) {
        // Need to approve first
        const approveTx: SafeTransactionData = {
          to: token,
          value: 0n,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [sablierAddress, amount],
          }),
        };

        await executeSafeTransaction(pc, wc, sender, approveTx);
      }

      // Create stream via Safe
      const createStreamTx: SafeTransactionData = {
        to: sablierAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: SABLIER_LOCKUP_LINEAR_ABI,
          functionName: 'createWithDurations',
          args: [
            sender, // lockup (sender is the lockup address)
            { account: '0x0000000000000000000000000000000000000000' as Address, fee: 0n }, // broker (no broker)
            sender, // sender
            recipient, // recipient
            amount, // totalAmount
            token, // asset
            cancelable, // cancelable
            transferable, // transferable
            { cliff: cliffDuration, total: totalDuration }, // durations (uint40 - timestamps)
            { start: startTime, end: endTime }, // range (uint40 - timestamps)
          ],
        }),
      };

      try {
        const txHash = await executeSafeTransaction(pc, wc, sender, createStreamTx);

        // Wait for transaction and extract streamId from events
        const _receipt = await pc.waitForTransactionReceipt({ hash: txHash });

        // Parse streamId from event (would need to decode event logs)
        // For now, return transaction hash as streamId placeholder
        // In production, decode the CreateLockupLinearStream event

        return {
          success: true,
          txHash,
          streamId: txHash, // Placeholder - should extract from event
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create stream',
        };
      }
    },

    async getStream(streamId: string): Promise<PaymentStream | null> {
      const sablierAddress = addresses.SABLIER_LOCKUP_LINEAR;

      try {
        // Parse streamId (could be uint256 or txHash)
        const streamIdBigInt = BigInt(streamId);

        const stream = await publicClient.readContract({
          address: sablierAddress,
          abi: SABLIER_LOCKUP_LINEAR_ABI,
          functionName: 'getStream',
          args: [streamIdBigInt],
        });

        const totalAmount = stream.amounts.deposited;
        const withdrawnAmount = stream.amounts.withdrawn;
        const remainingAmount = totalAmount - withdrawnAmount;
        const duration = Number(stream.endTime - stream.startTime);
        const ratePerSecond = duration > 0 ? totalAmount / BigInt(duration) : 0n;

        // Determine status
        const now = Math.floor(Date.now() / 1000);
        let status: StreamStatus;
        if (stream.amounts.refunded > 0n) {
          status = 'cancelled';
        } else if (now < Number(stream.startTime)) {
          status = 'pending';
        } else if (now >= Number(stream.endTime)) {
          status = 'completed';
        } else {
          status = 'active';
        }

        return {
          streamId: streamId,
          sender: stream.sender,
          recipient: stream.recipient,
          token: stream.asset,
          totalAmount,
          remainingAmount,
          startTime: Number(stream.startTime),
          endTime: Number(stream.endTime),
          status,
          ratePerSecond,
          withdrawnAmount,
          cliffTime: stream.cliffTime ? Number(stream.cliffTime) : undefined,
        };
      } catch (error) {
        console.error('Error fetching stream:', error);
        return null;
      }
    },

    async getUserStreams(_userAddress: Address): Promise<PaymentStream[]> {
      // This would require querying Sablier's GraphQL indexer
      // For now, return empty array
      // In production, use: https://indexer.hyperindex.xyz/53b7e25/v1/graphql
      throw new Error(
        'getUserStreams requires Sablier GraphQL indexer integration. ' +
          'See https://docs.sablier.com/api/overview for implementation details.'
      );
    },

    async getWithdrawableAmount(streamId: string): Promise<bigint> {
      const sablierAddress = addresses.SABLIER_LOCKUP_LINEAR;

      try {
        const streamIdBigInt = BigInt(streamId);
        const amount = await publicClient.readContract({
          address: sablierAddress,
          abi: SABLIER_LOCKUP_LINEAR_ABI,
          functionName: 'withdrawableAmountOf',
          args: [streamIdBigInt],
        });

        return amount;
      } catch (error) {
        console.error('Error fetching withdrawable amount:', error);
        return 0n;
      }
    },

    async withdraw(_streamId: string, _amount?: bigint, _to?: Address): Promise<TransactionResult> {
      // This requires the recipient's wallet, not the sender's Safe
      // For now, throw error indicating this should be called from recipient's context
      throw new Error(
        'Withdraw must be called by the recipient using their own wallet. ' +
          'This method should be implemented in the recipient-facing SDK.'
      );
    },

    async modifyStream(modification: StreamModification): Promise<StreamModificationResult> {
      if (!walletClient) {
        throw new Error('walletClient is required for modifyStream operations');
      }

      const { streamId, action } = modification;

      if (action === 'cancel') {
        const sablierAddress = addresses.SABLIER_LOCKUP_LINEAR;

        // Get stream to find sender
        const stream = await this.getStream(streamId);
        if (!stream) {
          throw new Error('Stream not found');
        }

        // Cancel requires sender's wallet
        const cancelTx: SafeTransactionData = {
          to: sablierAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: SABLIER_LOCKUP_LINEAR_ABI,
            functionName: 'cancel',
            args: [BigInt(streamId)],
          }),
        };

        try {
          const txHash = await executeSafeTransaction(
            publicClient,
            walletClient,
            stream.sender,
            cancelTx
          );

          return {
            success: true,
            txHash,
            streamId,
            newStatus: 'cancelled',
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cancel stream',
            streamId,
          };
        }
      }

      // Other actions (pause, resume, update-amount, transfer) may not be supported
      // in LockupLinear - check Sablier docs
      throw new Error(`Action ${action} not yet implemented for Sablier LockupLinear`);
    },
  };
}
