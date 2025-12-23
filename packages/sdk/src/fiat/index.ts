/**
 * Fiat On/Off Ramp Services
 *
 * This module provides integrations with fiat-to-crypto payment providers.
 *
 * Supported providers:
 * - Stripe: Card payments for crypto on-ramp
 * - MoonPay: Full on/off-ramp with global coverage
 *
 * Usage:
 * ```typescript
 * import { createStripeService, createMoonPayService } from '@stashtab/sdk/fiat';
 *
 * // Stripe for card on-ramp
 * const stripe = createStripeService({
 *   apiKey: 'pk_...',
 *   secretKey: 'sk_...',
 *   environment: 'sandbox',
 * });
 *
 * // Get a quote
 * const quote = await stripe.getQuote({
 *   type: 'on',
 *   fiatCurrency: 'USD',
 *   cryptoCurrency: 'USDC',
 *   amount: 100,
 *   amountType: 'fiat',
 *   walletAddress: '0x...',
 * });
 *
 * // Create an order
 * const order = await stripe.createOrder({
 *   quoteId: quote.id,
 *   walletAddress: '0x...',
 * });
 *
 * // Redirect user to payment
 * const paymentUrl = await stripe.getPaymentUrl(order.id);
 * ```
 */

export * from './types';
export { StripeOnRampService, createStripeService } from './stripe';
export { MoonPayService, createMoonPayService } from './moonpay';

import { createMoonPayService } from './moonpay';
import { createStripeService } from './stripe';

/**
 * Factory function to create a fiat service by name
 */
export function createFiatService(
  provider: 'stripe' | 'moonpay',
  config: {
    apiKey: string;
    secretKey?: string;
    webhookSecret?: string;
    environment?: 'sandbox' | 'production';
  }
) {
  switch (provider) {
    case 'stripe': {
      if (!config.secretKey) {
        throw new Error('Stripe requires a secretKey');
      }
      return createStripeService({
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        webhookSecret: config.webhookSecret,
        environment: config.environment,
      });
    }
    case 'moonpay': {
      return createMoonPayService(config);
    }
    default:
      throw new Error(`Unknown fiat provider: ${provider}`);
  }
}
