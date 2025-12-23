import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMoonPayService, type MoonPayService } from '../fiat/moonpay';
import { createStripeService, type StripeOnRampService } from '../fiat/stripe';
import type { QuoteRequest } from '../fiat/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('StripeOnRampService', () => {
  let stripeService: StripeOnRampService;

  beforeEach(() => {
    vi.clearAllMocks();
    stripeService = createStripeService({
      apiKey: 'pk_test_123',
      secretKey: 'sk_test_123',
      webhookSecret: 'whsec_test',
      environment: 'sandbox',
    });
  });

  describe('getQuote', () => {
    it('should generate a valid quote', async () => {
      const request: QuoteRequest = {
        type: 'on',
        fiatCurrency: 'USD',
        cryptoCurrency: 'USDC',
        amount: 100,
        amountType: 'fiat',
        walletAddress: '0x1234567890123456789012345678901234567890',
      };

      const quote = await stripeService.getQuote(request);

      expect(quote).toHaveProperty('id');
      expect(quote.type).toBe('on');
      expect(quote.fiatCurrency).toBe('USD');
      expect(quote.cryptoCurrency).toBe('USDC');
      expect(quote.fiatAmount).toBe(100);
      expect(quote.fees).toHaveProperty('network');
      expect(quote.fees).toHaveProperty('service');
      expect(quote.fees).toHaveProperty('total');
      expect(quote.expiresAt).toBeInstanceOf(Date);
    });

    it('should calculate fees correctly', async () => {
      const request: QuoteRequest = {
        type: 'on',
        fiatCurrency: 'USD',
        cryptoCurrency: 'USDC',
        amount: 1000,
        amountType: 'fiat',
        walletAddress: '0x1234567890123456789012345678901234567890',
      };

      const quote = await stripeService.getQuote(request);

      // Service fee should be ~1.5%
      expect(quote.fees.service).toBeGreaterThan(0);
      expect(quote.fees.service).toBeLessThan(request.amount * 0.05); // Max 5%

      // Network fee should be present
      expect(quote.fees.network).toBeGreaterThan(0);

      // Total should be sum
      expect(quote.fees.total).toBe(quote.fees.network + quote.fees.service);
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return supported currencies', async () => {
      const currencies = await stripeService.getSupportedCurrencies();

      expect(currencies.fiat).toContain('USD');
      expect(currencies.fiat).toContain('EUR');
      expect(currencies.crypto).toContain('USDC');
    });
  });

  describe('getLimits', () => {
    it('should return limits for USD', async () => {
      const limits = await stripeService.getLimits('USD');

      expect(limits.min).toBeGreaterThan(0);
      expect(limits.max).toBeGreaterThan(limits.min);
      expect(limits.daily).toBeGreaterThan(limits.max);
      expect(limits.monthly).toBeGreaterThan(limits.daily);
    });
  });

  describe('verifyWebhook', () => {
    it('should return false if webhook secret not configured', () => {
      const serviceNoSecret = createStripeService({
        apiKey: 'pk_test_123',
        secretKey: 'sk_test_123',
        environment: 'sandbox',
      });

      const result = serviceNoSecret.verifyWebhook('payload', 'signature');
      expect(result).toBe(false);
    });

    it('should return false for invalid signature format', () => {
      const result = stripeService.verifyWebhook('payload', 'invalid');
      expect(result).toBe(false);
    });
  });
});

describe('MoonPayService', () => {
  let moonpayService: MoonPayService;

  beforeEach(() => {
    vi.clearAllMocks();
    moonpayService = createMoonPayService({
      apiKey: 'pk_test_123',
      secretKey: 'sk_test_123',
      webhookSecret: 'webhook_secret',
      environment: 'sandbox',
    });
  });

  describe('getWidgetUrl', () => {
    it('should generate a valid widget URL', () => {
      const url = moonpayService.getWidgetUrl({
        walletAddress: '0x1234567890123456789012345678901234567890',
        cryptoCurrency: 'USDC',
        fiatCurrency: 'USD',
        fiatAmount: 100,
      });

      expect(url).toContain('buy-sandbox.moonpay.com');
      expect(url).toContain('apiKey=');
      expect(url).toContain('walletAddress=');
      expect(url).toContain('baseCurrencyAmount=100');
    });

    it('should sign URL when secret key is present', () => {
      const url = moonpayService.getWidgetUrl({
        walletAddress: '0x1234567890123456789012345678901234567890',
      });

      expect(url).toContain('signature=');
    });

    it('should include theme parameter', () => {
      const url = moonpayService.getWidgetUrl({
        walletAddress: '0x1234567890123456789012345678901234567890',
        theme: 'dark',
      });

      expect(url).toContain('theme=dark');
    });
  });

  describe('getSellWidgetUrl', () => {
    it('should generate sell widget URL', () => {
      const url = moonpayService.getSellWidgetUrl({
        walletAddress: '0x1234567890123456789012345678901234567890',
        cryptoCurrency: 'USDC',
        quoteCurrencyCode: 'USD',
      });

      expect(url).toContain('sell-sandbox.moonpay.com');
      expect(url).toContain('refundWalletAddress=');
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return fallback currencies on API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const currencies = await moonpayService.getSupportedCurrencies();

      expect(currencies.fiat).toContain('USD');
      expect(currencies.crypto).toContain('USDC');
    });
  });

  describe('createOrder', () => {
    it('should create a pending order', async () => {
      const order = await moonpayService.createOrder({
        quoteId: 'quote_123',
        walletAddress: '0x1234567890123456789012345678901234567890',
        email: 'test@example.com',
      });

      expect(order.id).toContain('mp_order_');
      expect(order.status).toBe('pending');
      expect(order.quoteId).toBe('quote_123');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel local orders', async () => {
      const order = await moonpayService.createOrder({
        quoteId: 'quote_123',
        walletAddress: '0x1234567890123456789012345678901234567890',
      });

      const cancelled = await moonpayService.cancelOrder(order.id);

      expect(cancelled.status).toBe('cancelled');
    });
  });
});
