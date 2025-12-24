/**
 * Core types and schemas shared across all Stashtab primitives
 */

import type { Address, Hash } from 'viem';

/**
 * Chain identifier
 */
export type ChainId = number;

/**
 * Supported chain names
 */
export type ChainName = 'base' | 'arbitrum' | 'optimism' | 'polygon';

/**
 * Base configuration for all primitives
 */
export interface PrimitiveConfig {
  chainId: ChainId;
  rpcUrl?: string;
}

/**
 * Transaction result
 *
 * Base type for transaction results across all primitives
 */
export interface TransactionResult {
  success: boolean;
  txHash?: Hash;
  error?: string;
  gasUsed?: bigint;
}

/**
 * @deprecated Use TransactionResult from '@stashtab/sdk/core/types' instead
 * This export is kept for backward compatibility
 */
export type { TransactionResult as LegacyTransactionResult };

/**
 * Address validation result
 */
export interface AddressValidationResult {
  isValid: boolean;
  normalized?: Address;
  error?: string;
}

/**
 * Amount validation result
 */
export interface AmountValidationResult {
  isValid: boolean;
  normalized?: bigint;
  error?: string;
}

/**
 * Protocol metadata
 */
export interface ProtocolMetadata {
  name: string;
  version: string;
  chainId: ChainId;
  address: Address;
  supported: boolean;
}

/**
 * Error with code
 */
export interface CodedError extends Error {
  code: string;
  details?: Record<string, unknown>;
}
