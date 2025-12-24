/**
 * Morpho Finance yield integration
 *
 * Provides primitives for interacting with Morpho Blue protocol
 *
 * Documentation: https://docs.morpho.org/
 * Contract addresses: https://docs.morpho.org/contracts/addresses
 *
 * Morpho Blue is a peer-to-peer lending protocol that enables direct matching
 * between lenders and borrowers, potentially offering higher yields than
 * traditional liquidity pools.
 */

import { getAddresses, MORPHO_BLUE_ABI, ERC20_ABI } from '@stashtab/config';
import type { Address } from 'viem';
import { encodeFunctionData, keccak256, encodeAbiParameters } from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../../client';
import type { PrimitiveConfig, TransactionResult } from '../../core/types';
import { executeSafeTransaction } from '../../safe/safeOperations';
import type { SafeTransactionData } from '../../safe/types';

/**
 * Morpho market parameters
 * These uniquely identify a Morpho Blue market
 */
export interface MorphoMarketParams {
  loanToken: Address;
  collateralToken: Address;
  oracle: Address;
  irm: Address; // Interest Rate Model
  lltv: bigint; // Loan-to-Loan-Value (LTV) in basis points (e.g., 8000 = 80%)
}

/**
 * Morpho pool information
 */
export interface MorphoPool {
  marketId: string; // keccak256 hash of market params
  marketParams: MorphoMarketParams;
  totalSupplyAssets: bigint;
  totalSupplyShares: bigint;
  totalBorrowAssets: bigint;
  totalBorrowShares: bigint;
  lastUpdate: bigint;
  fee: bigint;
}

/**
 * Morpho position information
 */
export interface MorphoPosition {
  supplied: bigint;
  borrowed: bigint;
  collateral: bigint;
  supplyShares: bigint;
  borrowShares: bigint;
}

/**
 * Morpho yield rate information
 */
export interface MorphoYieldRate {
  supplyAPY: number;
  borrowAPY: number;
  utilizationRate: number;
  lastUpdated: number;
}

/**
 * Calculate market ID from market parameters
 */
function calculateMarketId(marketParams: MorphoMarketParams): string {
  const encoded = encodeAbiParameters(
    [
      { type: 'address', name: 'loanToken' },
      { type: 'address', name: 'collateralToken' },
      { type: 'address', name: 'oracle' },
      { type: 'address', name: 'irm' },
      { type: 'uint256', name: 'lltv' },
    ],
    [
      marketParams.loanToken,
      marketParams.collateralToken,
      marketParams.oracle,
      marketParams.irm,
      marketParams.lltv,
    ]
  );

  return keccak256(encoded);
}

/**
 * Morpho service interface
 */
export interface MorphoService {
  /**
   * Get pool/market information
   */
  getPool(marketParams: MorphoMarketParams): Promise<MorphoPool | null>;

  /**
   * Get user position
   */
  getPosition(
    userAddress: Address,
    marketParams: MorphoMarketParams
  ): Promise<MorphoPosition | null>;

  /**
   * Get current yield rates
   */
  getYieldRate(marketParams: MorphoMarketParams): Promise<MorphoYieldRate | null>;

  /**
   * Supply assets to Morpho
   */
  supply(
    marketParams: MorphoMarketParams,
    amount: bigint,
    onBehalfOf?: Address
  ): Promise<TransactionResult>;

  /**
   * Withdraw assets from Morpho
   */
  withdraw(
    marketParams: MorphoMarketParams,
    amount: bigint,
    to?: Address
  ): Promise<TransactionResult>;
}

/**
 * Create Morpho service instance
 *
 * @example
 * ```typescript
 * import { createMorphoService } from '@stashtab/sdk/yield/morpho';
 *
 * const morpho = createMorphoService({
 *   chainId: 8453,
 *   publicClient,
 *   walletClient, // Optional for read-only operations
 * });
 * ```
 *
 * @see https://docs.morpho.org/contracts/addresses for contract addresses
 */
export interface MorphoServiceConfig extends PrimitiveConfig {
  publicClient: StashtabPublicClient;
  walletClient?: StashtabWalletClient; // Optional, required for write operations
}

export function createMorphoService(config: MorphoServiceConfig): MorphoService {
  const { chainId, publicClient, walletClient } = config;
  const addresses = getAddresses(chainId);

  if (!walletClient) {
    // Service can still be created for read-only operations
    // Write operations will throw errors if walletClient is not provided
  }

  // Check if Morpho is supported on this chain
  const morphoAddress = addresses.MORPHO_BLUE;
  if (!morphoAddress) {
    throw new Error(`Morpho Blue is not deployed on chain ${chainId}`);
  }

  return {
    async getPool(marketParams: MorphoMarketParams): Promise<MorphoPool | null> {
      try {
        const marketId = calculateMarketId(marketParams);

        const market = await publicClient.readContract({
          address: morphoAddress,
          abi: MORPHO_BLUE_ABI,
          functionName: 'market',
          args: [marketParams],
        });

        // Market returns a tuple: [totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee]
        return {
          marketId,
          marketParams,
          totalSupplyAssets: market[0],
          totalSupplyShares: market[1],
          totalBorrowAssets: market[2],
          totalBorrowShares: market[3],
          lastUpdate: market[4],
          fee: market[5],
        };
      } catch (error) {
        console.error('Error fetching Morpho pool:', error);
        return null;
      }
    },

    async getPosition(
      userAddress: Address,
      marketParams: MorphoMarketParams
    ): Promise<MorphoPosition | null> {
      try {
        // Calculate position ID (typically keccak256(abi.encode(userAddress, marketId)))
        const marketId = calculateMarketId(marketParams);
        const positionId = keccak256(
          encodeAbiParameters(
            [{ type: 'address' }, { type: 'bytes32' }],
            [userAddress, marketId as `0x${string}`]
          )
        );

        const position = await publicClient.readContract({
          address: morphoAddress,
          abi: MORPHO_BLUE_ABI,
          functionName: 'position',
          args: [marketParams, positionId],
        });

        // Position returns a tuple: [supplyShares, borrowShares, collateral]
        const supplyShares = position[0];
        const borrowShares = position[1];
        const collateral = position[2];

        // Calculate actual asset amounts from shares
        // This requires market data to convert shares to assets
        const market = await this.getPool(marketParams);
        if (!market) {
          return null;
        }

        const supplied =
          market.totalSupplyShares > 0n
            ? (supplyShares * market.totalSupplyAssets) / market.totalSupplyShares
            : 0n;
        const borrowed =
          market.totalBorrowShares > 0n
            ? (borrowShares * market.totalBorrowAssets) / market.totalBorrowShares
            : 0n;

        return {
          supplied,
          borrowed,
          collateral,
          supplyShares,
          borrowShares,
        };
      } catch (error) {
        console.error('Error fetching Morpho position:', error);
        return null;
      }
    },

    async getYieldRate(marketParams: MorphoMarketParams): Promise<MorphoYieldRate | null> {
      try {
        const pool = await this.getPool(marketParams);
        if (!pool) {
          return null;
        }

        // Calculate utilization rate
        const utilizationRate =
          pool.totalSupplyAssets > 0n
            ? Number((pool.totalBorrowAssets * 10000n) / pool.totalSupplyAssets) / 100
            : 0;

        // APY calculation would require IRM (Interest Rate Model) interaction
        // For now, return placeholder values
        // In production, query the IRM contract for current rates
        return {
          supplyAPY: 0, // Would calculate from IRM
          borrowAPY: 0, // Would calculate from IRM
          utilizationRate,
          lastUpdated: Number(pool.lastUpdate),
        };
      } catch (error) {
        console.error('Error fetching Morpho yield rate:', error);
        return null;
      }
    },

    async supply(
      marketParams: MorphoMarketParams,
      amount: bigint,
      onBehalfOf?: Address
    ): Promise<TransactionResult> {
      if (!walletClient) {
        throw new Error('walletClient is required for supply operations');
      }

      const safeAddress = onBehalfOf || walletClient.account?.address;
      if (!safeAddress) {
        throw new Error('No address provided for supply');
      }

      // Check allowance
      const allowance = await publicClient.readContract({
        address: marketParams.loanToken,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [safeAddress, morphoAddress],
      });

      if (allowance < amount) {
        // Approve first
        const approveTx: SafeTransactionData = {
          to: marketParams.loanToken,
          value: 0n,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [morphoAddress, amount],
          }),
        };

        await executeSafeTransaction(publicClient, walletClient, safeAddress, approveTx);
      }

      // Supply to Morpho
      // Note: shares parameter - for exact amount, pass amount, Morpho will calculate shares
      const supplyTx: SafeTransactionData = {
        to: morphoAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: MORPHO_BLUE_ABI,
          functionName: 'supply',
          args: [
            marketParams,
            amount, // assets
            0n, // shares (0 = use assets amount)
            safeAddress, // onBehalfOf
            '0x' as `0x${string}`, // data
          ],
        }),
      };

      try {
        const txHash = await executeSafeTransaction(
          publicClient,
          walletClient,
          safeAddress,
          supplyTx
        );
        return {
          success: true,
          txHash,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to supply to Morpho',
        };
      }
    },

    async withdraw(
      marketParams: MorphoMarketParams,
      amount: bigint,
      to?: Address
    ): Promise<TransactionResult> {
      if (!walletClient) {
        throw new Error('walletClient is required for withdraw operations');
      }

      const safeAddress = walletClient.account?.address;
      if (!safeAddress) {
        throw new Error('Wallet client has no account');
      }

      const recipient = to || safeAddress;

      // Withdraw from Morpho
      const withdrawTx: SafeTransactionData = {
        to: morphoAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: MORPHO_BLUE_ABI,
          functionName: 'withdraw',
          args: [
            marketParams,
            amount, // assets
            0n, // shares (0 = use assets amount)
            safeAddress, // onBehalfOf
            recipient, // receiver
          ],
        }),
      };

      try {
        const txHash = await executeSafeTransaction(
          publicClient,
          walletClient,
          safeAddress,
          withdrawTx
        );
        return {
          success: true,
          txHash,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to withdraw from Morpho',
        };
      }
    },
  };
}
