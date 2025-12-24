/**
 * Fiat offramp primitives
 *
 * Provides utilities for converting crypto to fiat currency via various providers
 */

import type { Address } from 'viem';
import type { PrimitiveConfig } from '../../core/types';

/**
 * Offramp provider type
 */
export type OfframpProvider = 'stripe' | 'moonpay' | 'coinbase' | 'transak';

/**
 * Offramp quote request
 */
export interface OfframpQuoteRequest extends PrimitiveConfig {
  provider: OfframpProvider;
  cryptoAmount: bigint;
  cryptoCurrency: string; // e.g., 'USDC'
  fiatCurrency: string; // e.g., 'USD', 'EUR'
  recipientBankAccount?: string;
}

/**
 * Offramp quote
 */
export interface OfframpQuote {
  provider: OfframpProvider;
  cryptoAmount: bigint;
  cryptoCurrency: string;
  fiatAmount: number;
  fiatCurrency: string;
  fee: number;
  feePercentage: number;
  exchangeRate: number;
  estimatedArrival: number; // Minutes
  minAmount?: bigint;
  maxAmount?: bigint;
  expiresAt: number;
}

/**
 * Offramp withdrawal request
 */
export interface OfframpWithdrawalRequest extends OfframpQuoteRequest {
  from: Address;
  quoteId?: string;
  bankAccount?: {
    accountNumber: string;
    routingNumber?: string;
    accountType?: 'checking' | 'savings';
  };
  recipientInfo?: {
    name: string;
    email?: string;
  };
}

/**
 * Offramp withdrawal result
 */
export interface OfframpWithdrawalResult {
  withdrawalId: string;
  provider: OfframpProvider;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  estimatedArrival?: number;
}

/**
 * Offramp provider service interface
 */
export interface OfframpService {
  /**
   * Get quote for crypto to fiat conversion
   */
  getQuote(request: OfframpQuoteRequest): Promise<OfframpQuote>;

  /**
   * Initiate withdrawal
   */
  withdraw(request: OfframpWithdrawalRequest): Promise<OfframpWithdrawalResult>;

  /**
   * Get withdrawal status
   */
  getWithdrawalStatus(
    withdrawalId: string,
    provider: OfframpProvider
  ): Promise<OfframpWithdrawalResult>;

  /**
   * Get best rate across providers
   */
  getBestRate(request: Omit<OfframpQuoteRequest, 'provider'>): Promise<OfframpQuote>;
}

/**
 * Create offramp service
 */
export function createOfframpService(_config: PrimitiveConfig): OfframpService {
  // TODO: Implement provider abstraction and routing
  throw new Error('Offramp service not yet implemented');
}
