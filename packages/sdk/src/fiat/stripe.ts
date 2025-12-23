/**
 * Stripe Fiat On-Ramp Integration
 *
 * This is a stub implementation for Stripe's fiat-to-crypto on-ramp.
 * Stripe provides card payment processing for purchasing crypto.
 *
 * To implement:
 * 1. Sign up for Stripe (https://stripe.com)
 * 2. Enable Stripe Crypto On-ramp (https://stripe.com/docs/crypto/onramp)
 * 3. Install: pnpm add stripe @stripe/stripe-js
 * 4. Replace stub methods with actual Stripe API calls
 *
 * @see https://stripe.com/docs/crypto/onramp
 */

import type {
  FiatService,
  FiatServiceConfig,
  Quote,
  QuoteRequest,
  Order,
  CreateOrderRequest,
  FiatCurrency,
  CryptoCurrency,
} from "./types";

export class StripeOnRampService implements FiatService {
  readonly name = "stripe";
  private config: FiatServiceConfig;

  constructor(config: FiatServiceConfig) {
    this.config = config;
  }

  async getQuote(request: QuoteRequest): Promise<Quote> {
    // TODO: Implement with Stripe Crypto Onramp API
    // const stripe = new Stripe(this.config.secretKey);
    // const session = await stripe.crypto.onrampSessions.create({...});

    // Stub response for development
    const exchangeRate = 1.0; // USDC is 1:1 with USD
    const serviceFee = request.amount * 0.015; // 1.5% fee
    const networkFee = 0.5; // Fixed network fee

    return {
      id: `quote_${Date.now()}`,
      type: "on",
      fiatCurrency: request.fiatCurrency,
      cryptoCurrency: request.cryptoCurrency,
      fiatAmount: request.amount,
      cryptoAmount: ((request.amount - serviceFee - networkFee) * exchangeRate).toFixed(6),
      exchangeRate,
      fees: {
        network: networkFee,
        service: serviceFee,
        total: serviceFee + networkFee,
      },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };
  }

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // TODO: Implement with Stripe Crypto Onramp API
    // Create a checkout session and return the order

    return {
      id: `order_${Date.now()}`,
      quoteId: request.quoteId,
      status: "pending",
      type: "on",
      fiatCurrency: "USD",
      cryptoCurrency: "USDC",
      fiatAmount: 100,
      cryptoAmount: "98.50",
      walletAddress: request.walletAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getOrderStatus(orderId: string): Promise<Order> {
    // TODO: Implement with Stripe API
    // const session = await stripe.crypto.onrampSessions.retrieve(orderId);

    return {
      id: orderId,
      quoteId: "quote_stub",
      status: "processing",
      type: "on",
      fiatCurrency: "USD",
      cryptoCurrency: "USDC",
      fiatAmount: 100,
      cryptoAmount: "98.50",
      walletAddress: "0x...",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async cancelOrder(orderId: string): Promise<Order> {
    // TODO: Implement cancellation logic
    const order = await this.getOrderStatus(orderId);
    return {
      ...order,
      status: "cancelled",
      updatedAt: new Date(),
    };
  }

  async getPaymentUrl(orderId: string): Promise<string> {
    // TODO: Return actual Stripe checkout URL
    // const session = await stripe.checkout.sessions.create({...});
    // return session.url;

    const baseUrl = this.config.environment === "production"
      ? "https://checkout.stripe.com"
      : "https://checkout.stripe.com/test";

    return `${baseUrl}/pay/${orderId}`;
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // TODO: Implement with Stripe webhook verification
    // const event = stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);

    if (!this.config.webhookSecret) {
      console.warn("Webhook secret not configured");
      return false;
    }

    // Stub: always return true in development
    return this.config.environment === "sandbox";
  }

  async getSupportedCurrencies(): Promise<{
    fiat: FiatCurrency[];
    crypto: CryptoCurrency[];
  }> {
    return {
      fiat: ["USD", "EUR", "GBP"],
      crypto: ["USDC", "ETH"],
    };
  }

  async getLimits(currency: FiatCurrency): Promise<{
    min: number;
    max: number;
    daily: number;
    monthly: number;
  }> {
    // Stripe typical limits
    return {
      min: 10,
      max: 10000,
      daily: 25000,
      monthly: 100000,
    };
  }
}

/**
 * Create a configured Stripe service instance
 */
export function createStripeService(config: {
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  environment?: "sandbox" | "production";
}): StripeOnRampService {
  return new StripeOnRampService({
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    webhookSecret: config.webhookSecret,
    environment: config.environment || "sandbox",
  });
}

