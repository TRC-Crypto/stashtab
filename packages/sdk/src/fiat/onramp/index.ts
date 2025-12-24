/**
 * Fiat onramp primitives
 *
 * Provides utilities for converting fiat currency to crypto via various providers
 */

export * from '../stripe';
export * from '../moonpay';

import type { Address } from 'viem';
import type { PrimitiveConfig } from '../../core/types';

/**
 * Onramp provider type
 */
export type OnrampProvider = 'stripe' | 'moonpay' | 'coinbase' | 'transak';

/**
 * Onramp quote request
 */
export interface OnrampQuoteRequest extends PrimitiveConfig {
  provider: OnrampProvider;
  fiatAmount: number;
  fiatCurrency: string; // e.g., 'USD', 'EUR'
  cryptoCurrency: string; // e.g., 'USDC'
  recipientAddress: Address;
}

/**
 * Onramp quote
 */
export interface OnrampQuote {
  provider: OnrampProvider;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount: bigint;
  cryptoCurrency: string;
  fee: number;
  feePercentage: number;
  exchangeRate: number;
  estimatedArrival: number; // Minutes
  expiresAt: number;
}

/**
 * Onramp order request
 */
export interface OnrampOrderRequest extends OnrampQuoteRequest {
  quoteId?: string;
  paymentMethod?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Onramp order result
 */
export interface OnrampOrderResult {
  orderId: string;
  provider: OnrampProvider;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  checkoutUrl?: string;
  expiresAt?: number;
}

/**
 * Onramp provider service interface
 */
export interface OnrampService {
  /**
   * Get quote for fiat to crypto conversion
   */
  getQuote(request: OnrampQuoteRequest): Promise<OnrampQuote>;

  /**
   * Create onramp order
   */
  createOrder(request: OnrampOrderRequest): Promise<OnrampOrderResult>;

  /**
   * Get order status
   */
  getOrderStatus(orderId: string, provider: OnrampProvider): Promise<OnrampOrderResult>;

  /**
   * Get best rate across providers
   */
  getBestRate(request: Omit<OnrampQuoteRequest, 'provider'>): Promise<OnrampQuote>;
}

/**
 * Create onramp service
 */
export function createOnrampService(_config: PrimitiveConfig): OnrampService {
  // TODO: Implement provider abstraction and routing
  throw new Error('Onramp service not yet implemented');
}
