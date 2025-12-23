/**
 * Fiat On/Off Ramp Types
 *
 * These types define the interface for fiat integration services
 * like Stripe, MoonPay, Transak, etc.
 */

export type FiatCurrency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";
export type CryptoCurrency = "USDC" | "ETH";
export type RampType = "on" | "off";

export interface Quote {
  id: string;
  type: RampType;
  fiatCurrency: FiatCurrency;
  cryptoCurrency: CryptoCurrency;
  fiatAmount: number;
  cryptoAmount: string;
  exchangeRate: number;
  fees: {
    network: number;
    service: number;
    total: number;
  };
  expiresAt: Date;
}

export interface QuoteRequest {
  type: RampType;
  fiatCurrency: FiatCurrency;
  cryptoCurrency: CryptoCurrency;
  amount: number;
  amountType: "fiat" | "crypto";
  walletAddress: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  quoteId: string;
  status: OrderStatus;
  type: RampType;
  fiatCurrency: FiatCurrency;
  cryptoCurrency: CryptoCurrency;
  fiatAmount: number;
  cryptoAmount: string;
  walletAddress: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface CreateOrderRequest {
  quoteId: string;
  walletAddress: string;
  email?: string;
  redirectUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account" | "apple_pay" | "google_pay";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface FiatServiceConfig {
  apiKey: string;
  secretKey?: string;
  environment: "sandbox" | "production";
  webhookSecret?: string;
}

/**
 * Abstract interface for fiat ramp services
 */
export interface FiatService {
  /**
   * Service identifier
   */
  readonly name: string;

  /**
   * Get a quote for fiat-to-crypto or crypto-to-fiat conversion
   */
  getQuote(request: QuoteRequest): Promise<Quote>;

  /**
   * Create an order from an accepted quote
   */
  createOrder(request: CreateOrderRequest): Promise<Order>;

  /**
   * Get the status of an existing order
   */
  getOrderStatus(orderId: string): Promise<Order>;

  /**
   * Cancel a pending order
   */
  cancelOrder(orderId: string): Promise<Order>;

  /**
   * Get payment URL for completing the order
   */
  getPaymentUrl(orderId: string): Promise<string>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: string, signature: string): boolean;

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): Promise<{
    fiat: FiatCurrency[];
    crypto: CryptoCurrency[];
  }>;

  /**
   * Get transaction limits
   */
  getLimits(currency: FiatCurrency): Promise<{
    min: number;
    max: number;
    daily: number;
    monthly: number;
  }>;
}

