import { zValidator } from '@hono/zod-validator';
import { PrivyClient } from '@privy-io/server-auth';
import { createStripeService, createMoonPayService } from '@stashtab/sdk/fiat';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';
import { AuthenticationError, ErrorCode, ValidationError } from '../errors';
import { standardRateLimit, strictRateLimit } from '../middleware';
import type { Env, User } from '../types';

const fiatRoutes = new Hono<{ Bindings: Env }>();

// ============================================================================
// Request Schemas
// ============================================================================

const GetQuoteSchema = z.object({
  provider: z.enum(['stripe', 'moonpay']).default('stripe'),
  type: z.enum(['on', 'off']).default('on'),
  fiatCurrency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('USD'),
  cryptoCurrency: z.enum(['USDC', 'ETH']).default('USDC'),
  amount: z.number().positive().min(10).max(50000),
  amountType: z.enum(['fiat', 'crypto']).default('fiat'),
});

const CreateOrderSchema = z.object({
  provider: z.enum(['stripe', 'moonpay']).default('stripe'),
  quoteId: z.string().min(1),
  email: z.string().email().optional(),
  redirectUrl: z.string().url().optional(),
});

// WebhookSchema removed - not currently used

// ============================================================================
// Helper: Get Authenticated User
// ============================================================================

async function getAuthenticatedUser(c: Context<{ Bindings: Env }>): Promise<User> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError(
      'Missing or invalid authorization header',
      ErrorCode.AUTH_MISSING_TOKEN
    );
  }

  const token = authHeader.slice(7);

  try {
    const privy = new PrivyClient(c.env.PRIVY_APP_ID, c.env.PRIVY_APP_SECRET);
    const claims = await privy.verifyAuthToken(token);

    if (!claims.userId) {
      throw new AuthenticationError('Invalid token', ErrorCode.AUTH_INVALID_TOKEN);
    }

    const result = await c.env.DB.prepare('SELECT * FROM users WHERE privy_user_id = ?')
      .bind(claims.userId)
      .first();

    const user = result as User | null;

    if (!user) {
      throw new AuthenticationError(
        'User not found. Please sign up first.',
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    c.set('userId', user.id);
    return user;
  } catch (err) {
    if (err instanceof AuthenticationError) {
      throw err;
    }
    throw new AuthenticationError('Authentication failed', ErrorCode.AUTH_INVALID_TOKEN);
  }
}

// ============================================================================
// Helper: Get Fiat Service
// ============================================================================

function getFiatService(c: Context<{ Bindings: Env }>, provider: 'stripe' | 'moonpay') {
  if (provider === 'stripe') {
    return createStripeService({
      apiKey: c.env.STRIPE_PUBLIC_KEY || '',
      secretKey: c.env.STRIPE_SECRET_KEY || '',
      webhookSecret: c.env.STRIPE_WEBHOOK_SECRET,
      environment: c.env.ENVIRONMENT === 'production' ? 'production' : 'sandbox',
    });
  }

  return createMoonPayService({
    apiKey: c.env.MOONPAY_API_KEY || '',
    secretKey: c.env.MOONPAY_SECRET_KEY,
    webhookSecret: c.env.MOONPAY_WEBHOOK_SECRET,
    environment: c.env.ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  });
}

// ============================================================================
// Rate Limiting
// ============================================================================

fiatRoutes.use('/quote', standardRateLimit);
fiatRoutes.use('/order', strictRateLimit);
fiatRoutes.use('/order/*', standardRateLimit);
fiatRoutes.use('/providers', standardRateLimit);

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /fiat/providers
 * Get available fiat providers and their status
 */
fiatRoutes.get('/providers', async (c) => {
  const stripeEnabled = !!c.env.STRIPE_SECRET_KEY;
  const moonpayEnabled = !!c.env.MOONPAY_API_KEY;

  const providers = [];

  if (stripeEnabled) {
    const stripe = getFiatService(c, 'stripe');
    const currencies = await stripe.getSupportedCurrencies();
    const limits = await stripe.getLimits('USD');

    providers.push({
      id: 'stripe',
      name: 'Stripe',
      enabled: true,
      supportedCurrencies: currencies,
      limits,
      features: ['card', 'apple_pay', 'google_pay'],
      onRamp: true,
      offRamp: false,
    });
  }

  if (moonpayEnabled) {
    const moonpay = getFiatService(c, 'moonpay');
    const currencies = await moonpay.getSupportedCurrencies();
    const limits = await moonpay.getLimits('USD');

    providers.push({
      id: 'moonpay',
      name: 'MoonPay',
      enabled: true,
      supportedCurrencies: currencies,
      limits,
      features: ['card', 'bank_transfer', 'apple_pay', 'google_pay'],
      onRamp: true,
      offRamp: true,
    });
  }

  return c.json({
    providers,
    defaultProvider: stripeEnabled ? 'stripe' : moonpayEnabled ? 'moonpay' : null,
  });
});

/**
 * POST /fiat/quote
 * Get a quote for fiat-to-crypto conversion
 */
fiatRoutes.post(
  '/quote',
  zValidator('json', GetQuoteSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const user = await getAuthenticatedUser(c);
    const body = c.req.valid('json');

    const service = getFiatService(c, body.provider);

    const quote = await service.getQuote({
      type: body.type,
      fiatCurrency: body.fiatCurrency,
      cryptoCurrency: body.cryptoCurrency,
      amount: body.amount,
      amountType: body.amountType,
      walletAddress: user.safe_address,
    });

    // Store quote for later order creation
    await c.env.CACHE.put(
      `fiat:quote:${quote.id}`,
      JSON.stringify({
        ...quote,
        userId: user.id,
        walletAddress: user.safe_address,
        provider: body.provider,
      }),
      { expirationTtl: 900 } // 15 minutes
    );

    return c.json({
      quote: {
        ...quote,
        expiresAt: quote.expiresAt.toISOString(),
      },
      walletAddress: user.safe_address,
    });
  }
);

/**
 * POST /fiat/order
 * Create an order from an accepted quote
 */
fiatRoutes.post(
  '/order',
  zValidator('json', CreateOrderSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const user = await getAuthenticatedUser(c);
    const body = c.req.valid('json');

    // Retrieve stored quote
    const storedQuote = await c.env.CACHE.get(`fiat:quote:${body.quoteId}`);
    if (!storedQuote) {
      throw new ValidationError('Quote expired or not found', {
        code: 'QUOTE_NOT_FOUND',
      });
    }

    const quoteData = JSON.parse(storedQuote);

    // Verify quote belongs to this user
    if (quoteData.userId !== user.id) {
      throw new AuthenticationError(
        'Quote does not belong to this user',
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    const service = getFiatService(c, body.provider);

    const order = await service.createOrder({
      quoteId: body.quoteId,
      walletAddress: user.safe_address,
      email: body.email,
      redirectUrl: body.redirectUrl,
    });

    // Store order for webhook processing
    await c.env.CACHE.put(
      `fiat:order:${order.id}`,
      JSON.stringify({
        ...order,
        userId: user.id,
        provider: body.provider,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }),
      { expirationTtl: 86400 } // 24 hours
    );

    // Record transaction in database
    await c.env.DB.prepare(
      `INSERT INTO transactions (id, user_id, type, amount, status, created_at)
       VALUES (?, ?, 'fiat_purchase', ?, 'pending', ?)`
    )
      .bind(order.id, user.id, order.fiatAmount.toString(), new Date().toISOString())
      .run();

    // Get payment URL
    const paymentUrl = await service.getPaymentUrl(order.id);

    return c.json({
      order: {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
      paymentUrl,
    });
  }
);

/**
 * GET /fiat/order/:orderId
 * Get the status of an order
 */
fiatRoutes.get('/order/:orderId', async (c) => {
  const user = await getAuthenticatedUser(c);
  const orderId = c.req.param('orderId');

  // First check our cache for the provider
  const cachedOrder = await c.env.CACHE.get(`fiat:order:${orderId}`);

  if (!cachedOrder) {
    throw new ValidationError('Order not found', {
      code: 'ORDER_NOT_FOUND',
    });
  }

  const orderData = JSON.parse(cachedOrder);

  // Verify order belongs to this user
  if (orderData.userId !== user.id) {
    throw new AuthenticationError(
      'Order does not belong to this user',
      ErrorCode.AUTH_INVALID_TOKEN
    );
  }

  const service = getFiatService(c, orderData.provider);
  const order = await service.getOrderStatus(orderId);

  // Update cached order status
  await c.env.CACHE.put(
    `fiat:order:${orderId}`,
    JSON.stringify({
      ...orderData,
      ...order,
      updatedAt: order.updatedAt.toISOString(),
    }),
    { expirationTtl: 86400 }
  );

  return c.json({
    order: {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.completedAt?.toISOString(),
    },
  });
});

/**
 * GET /fiat/widget-url
 * Get embedded widget URL for provider
 */
fiatRoutes.get('/widget-url', async (c) => {
  const user = await getAuthenticatedUser(c);
  const provider = (c.req.query('provider') as 'stripe' | 'moonpay') || 'stripe';
  const amount = c.req.query('amount');
  const currency = c.req.query('currency') as 'USDC' | 'ETH' | undefined;

  const service = getFiatService(c, provider);

  if (provider === 'moonpay' && 'getWidgetUrl' in service) {
    const moonpay = service as ReturnType<typeof createMoonPayService>;
    const widgetUrl = moonpay.getWidgetUrl({
      walletAddress: user.safe_address,
      cryptoCurrency: currency || 'USDC',
      fiatAmount: amount ? parseFloat(amount) : undefined,
      theme: 'dark',
    });

    return c.json({ widgetUrl, provider: 'moonpay' });
  }

  if (provider === 'stripe' && 'createEmbeddedSession' in service) {
    const stripe = service as ReturnType<typeof createStripeService>;
    const session = await stripe.createEmbeddedSession(user.safe_address, {
      defaultCrypto: currency || 'USDC',
      defaultAmount: amount ? parseFloat(amount) : undefined,
    });

    return c.json({
      sessionId: session.sessionId,
      clientSecret: session.clientSecret,
      provider: 'stripe',
    });
  }

  throw new ValidationError('Invalid provider', { code: 'INVALID_PROVIDER' });
});

/**
 * POST /fiat/webhook/:provider
 * Handle webhooks from fiat providers
 */
fiatRoutes.post('/webhook/:provider', async (c) => {
  const provider = c.req.param('provider') as 'stripe' | 'moonpay';

  if (!['stripe', 'moonpay'].includes(provider)) {
    return c.json({ error: 'Invalid provider' }, 400);
  }

  const service = getFiatService(c, provider);
  const payload = await c.req.text();

  // Get signature header
  const signature =
    provider === 'stripe'
      ? c.req.header('Stripe-Signature') || ''
      : c.req.header('MoonPay-Signature') || '';

  // Verify webhook
  if (!service.verifyWebhook(payload, signature)) {
    console.error(`Invalid ${provider} webhook signature`);
    return c.json({ error: 'Invalid signature' }, 401);
  }

  // Parse event
  let event;
  if (provider === 'stripe' && 'parseWebhookEvent' in service) {
    const stripe = service as ReturnType<typeof createStripeService>;
    event = stripe.parseWebhookEvent(payload);
  } else if (provider === 'moonpay' && 'parseWebhookEvent' in service) {
    const moonpay = service as ReturnType<typeof createMoonPayService>;
    event = moonpay.parseWebhookEvent(payload);
  }

  if (!event) {
    return c.json({ received: true, processed: false });
  }

  console.log(`Fiat webhook: ${provider} - ${event.type} - ${event.orderId}`);

  // Get cached order
  const cachedOrder = await c.env.CACHE.get(`fiat:order:${event.orderId}`);

  if (cachedOrder) {
    const orderData = JSON.parse(cachedOrder);

    // Update order status in cache
    await c.env.CACHE.put(
      `fiat:order:${event.orderId}`,
      JSON.stringify({
        ...orderData,
        status: event.status,
        updatedAt: new Date().toISOString(),
      }),
      { expirationTtl: 86400 }
    );

    // Update transaction in database
    await c.env.DB.prepare(`UPDATE transactions SET status = ?, confirmed_at = ? WHERE id = ?`)
      .bind(
        event.status === 'completed' ? 'confirmed' : event.status,
        event.status === 'completed' ? new Date().toISOString() : null,
        event.orderId
      )
      .run();

    // If completed, update user's total deposited
    if (event.status === 'completed' && 'cryptoAmount' in event.data) {
      await c.env.DB.prepare(`UPDATE users SET total_deposited = total_deposited + ? WHERE id = ?`)
        .bind(event.data.cryptoAmount, orderData.userId)
        .run();
    }
  }

  return c.json({ received: true, processed: true });
});

/**
 * GET /fiat/history
 * Get user's fiat transaction history
 */
fiatRoutes.get('/history', async (c) => {
  const user = await getAuthenticatedUser(c);
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  const transactions = await c.env.DB.prepare(
    `SELECT * FROM transactions 
     WHERE user_id = ? AND type = 'fiat_purchase'
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(user.id, limit, offset)
    .all();

  return c.json({
    transactions: transactions.results,
    pagination: {
      limit,
      offset,
      hasMore: transactions.results.length === limit,
    },
  });
});

export { fiatRoutes };
