/**
 * MoonPay Fiat On/Off-Ramp Integration
 *
 * This is a stub implementation for MoonPay's fiat-to-crypto services.
 * MoonPay supports both buying and selling crypto.
 *
 * To implement:
 * 1. Sign up for MoonPay (https://www.moonpay.com/business)
 * 2. Get API keys from dashboard
 * 3. Install: pnpm add @moonpay/moonpay-node-sdk
 * 4. Replace stub methods with actual MoonPay API calls
 *
 * @see https://dev.moonpay.com/docs
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
} from './types';

export class MoonPayService implements FiatService {
  readonly name = 'moonpay';
  private config: FiatServiceConfig;
  private baseUrl: string;

  constructor(config: FiatServiceConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.moonpay.com'
        : 'https://api.moonpay.com/sandbox';
  }

  async getQuote(request: QuoteRequest): Promise<Quote> {
    // TODO: Implement with MoonPay API
    // const response = await fetch(`${this.baseUrl}/v3/currencies/${request.cryptoCurrency}/quote`, {
    //   headers: { 'Api-Key': this.config.apiKey }
    // });

    const isOnRamp = request.type === 'on';
    const exchangeRate = 1.0;
    const serviceFee = request.amount * 0.045; // MoonPay ~4.5% fee
    const networkFee = 1.0;

    const cryptoAmount = isOnRamp
      ? (request.amount - serviceFee - networkFee) * exchangeRate
      : request.amount;

    const fiatAmount = isOnRamp
      ? request.amount
      : request.amount * exchangeRate + serviceFee + networkFee;

    return {
      id: `mp_quote_${Date.now()}`,
      type: request.type,
      fiatCurrency: request.fiatCurrency,
      cryptoCurrency: request.cryptoCurrency,
      fiatAmount,
      cryptoAmount: cryptoAmount.toFixed(6),
      exchangeRate,
      fees: {
        network: networkFee,
        service: serviceFee,
        total: serviceFee + networkFee,
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };
  }

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // TODO: Implement with MoonPay API
    // const response = await fetch(`${this.baseUrl}/v1/transactions`, {
    //   method: 'POST',
    //   headers: { 'Api-Key': this.config.apiKey },
    //   body: JSON.stringify({...})
    // });

    return {
      id: `mp_order_${Date.now()}`,
      quoteId: request.quoteId,
      status: 'pending',
      type: 'on',
      fiatCurrency: 'USD',
      cryptoCurrency: 'USDC',
      fiatAmount: 100,
      cryptoAmount: '94.50',
      walletAddress: request.walletAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getOrderStatus(orderId: string): Promise<Order> {
    // TODO: Implement with MoonPay API
    // const response = await fetch(`${this.baseUrl}/v1/transactions/${orderId}`, {
    //   headers: { 'Api-Key': this.config.apiKey }
    // });

    return {
      id: orderId,
      quoteId: 'quote_stub',
      status: 'processing',
      type: 'on',
      fiatCurrency: 'USD',
      cryptoCurrency: 'USDC',
      fiatAmount: 100,
      cryptoAmount: '94.50',
      walletAddress: '0x...',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.getOrderStatus(orderId);
    return {
      ...order,
      status: 'cancelled',
      updatedAt: new Date(),
    };
  }

  async getPaymentUrl(orderId: string): Promise<string> {
    // MoonPay uses a widget URL for payments
    const widgetUrl =
      this.config.environment === 'production'
        ? 'https://buy.moonpay.com'
        : 'https://buy-sandbox.moonpay.com';

    // TODO: Sign the URL with your secret key for security
    // const signature = crypto.createHmac('sha256', this.config.secretKey)
    //   .update(queryString).digest('base64');

    return `${widgetUrl}?apiKey=${this.config.apiKey}&transactionId=${orderId}`;
  }

  verifyWebhook(_payload: string, _signature: string): boolean {
    // TODO: Implement MoonPay webhook verification
    // MoonPay signs webhooks with HMAC-SHA256

    if (!this.config.webhookSecret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    // Stub: always return true in development
    return this.config.environment === 'sandbox';
  }

  async getSupportedCurrencies(): Promise<{
    fiat: FiatCurrency[];
    crypto: CryptoCurrency[];
  }> {
    // MoonPay supports many currencies
    return {
      fiat: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      crypto: ['USDC', 'ETH'],
    };
  }

  async getLimits(_currency: FiatCurrency): Promise<{
    min: number;
    max: number;
    daily: number;
    monthly: number;
  }> {
    // MoonPay typical limits (vary by KYC level)
    return {
      min: 20,
      max: 5000,
      daily: 10000,
      monthly: 50000,
    };
  }

  /**
   * Generate a widget URL for embedding MoonPay
   */
  getWidgetUrl(options: {
    walletAddress: string;
    cryptoCurrency?: CryptoCurrency;
    fiatCurrency?: FiatCurrency;
    fiatAmount?: number;
    email?: string;
    redirectUrl?: string;
  }): string {
    const baseUrl =
      this.config.environment === 'production'
        ? 'https://buy.moonpay.com'
        : 'https://buy-sandbox.moonpay.com';

    const params = new URLSearchParams({
      apiKey: this.config.apiKey,
      walletAddress: options.walletAddress,
      currencyCode: options.cryptoCurrency || 'usdc_base',
      baseCurrencyCode: options.fiatCurrency?.toLowerCase() || 'usd',
    });

    if (options.fiatAmount) {
      params.set('baseCurrencyAmount', options.fiatAmount.toString());
    }
    if (options.email) {
      params.set('email', options.email);
    }
    if (options.redirectUrl) {
      params.set('redirectURL', options.redirectUrl);
    }

    return `${baseUrl}?${params.toString()}`;
  }
}

/**
 * Create a configured MoonPay service instance
 */
export function createMoonPayService(config: {
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  environment?: 'sandbox' | 'production';
}): MoonPayService {
  return new MoonPayService({
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    webhookSecret: config.webhookSecret,
    environment: config.environment || 'sandbox',
  });
}
