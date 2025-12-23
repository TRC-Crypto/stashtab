import { zValidator } from '@hono/zod-validator';
import { PrivyClient } from '@privy-io/server-auth';
import { createPersonaService } from '@stashtab/sdk/kyc';
import { createEmailService, NotificationHub } from '@stashtab/sdk/notifications';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';
import { AuthenticationError, ErrorCode, ValidationError } from '../errors';
import { standardRateLimit, strictRateLimit } from '../middleware';
import type { Env, User } from '../types';

const kycRoutes = new Hono<{ Bindings: Env }>();

// ============================================================================
// Request Schemas
// ============================================================================

const StartVerificationSchema = z.object({
  level: z.enum(['basic', 'standard', 'enhanced']).default('standard'),
  redirectUrl: z.string().url().optional(),
});

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
// Helper: Get KYC Service
// ============================================================================

function getKYCService(c: Context<{ Bindings: Env }>) {
  const apiKey = c.env.PERSONA_API_KEY;
  const templateId = c.env.PERSONA_TEMPLATE_ID;

  if (!apiKey || !templateId) {
    throw new ValidationError('KYC service not configured', {
      code: 'KYC_NOT_CONFIGURED',
    });
  }

  return createPersonaService({
    apiKey,
    templateId,
    webhookSecret: c.env.PERSONA_WEBHOOK_SECRET,
    environment: c.env.ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  });
}

// ============================================================================
// Rate Limiting
// ============================================================================

kycRoutes.use('/status', standardRateLimit);
kycRoutes.use('/start', strictRateLimit);
kycRoutes.use('/resume', standardRateLimit);

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /kyc/status
 * Get current KYC verification status
 */
kycRoutes.get('/status', async (c) => {
  const user = await getAuthenticatedUser(c);

  // Check if KYC is configured
  const kycEnabled = !!c.env.PERSONA_API_KEY;

  // Get user's KYC status from database
  const kycData = await c.env.DB.prepare(
    `SELECT kyc_status, kyc_provider, kyc_inquiry_id, kyc_level, kyc_verified_at
     FROM users WHERE id = ?`
  )
    .bind(user.id)
    .first();

  // If there's an active inquiry, fetch latest status from provider
  let providerStatus = null;
  if (kycData?.kyc_inquiry_id && kycData.kyc_status !== 'approved') {
    try {
      const kycService = getKYCService(c);
      const identity = await kycService.getVerification(kycData.kyc_inquiry_id as string);
      providerStatus = {
        status: identity.status,
        level: identity.level,
        firstName: identity.firstName,
        lastName: identity.lastName,
        documents: identity.documents?.length || 0,
        updatedAt: identity.updatedAt?.toISOString(),
      };

      // Update local status if changed
      if (identity.status !== kycData.kyc_status) {
        await c.env.DB.prepare(
          `UPDATE users SET 
           kyc_status = ?, 
           kyc_level = ?,
           kyc_verified_at = ?,
           updated_at = ?
           WHERE id = ?`
        )
          .bind(
            identity.status,
            identity.level,
            identity.status === 'approved' ? new Date().toISOString() : null,
            new Date().toISOString(),
            user.id
          )
          .run();
      }
    } catch (error) {
      console.error('Failed to fetch KYC status from provider:', error);
    }
  }

  return c.json({
    enabled: kycEnabled,
    required: kycEnabled, // Can be configured per feature
    status: (kycData?.kyc_status as string) || 'none',
    level: (kycData?.kyc_level as string) || 'none',
    provider: kycData?.kyc_provider || null,
    inquiryId: kycData?.kyc_inquiry_id || null,
    verifiedAt: kycData?.kyc_verified_at || null,
    providerStatus,
    canTransact: !kycEnabled || kycData?.kyc_status === 'approved',
  });
});

/**
 * POST /kyc/start
 * Start a new KYC verification session
 */
kycRoutes.post(
  '/start',
  zValidator('json', StartVerificationSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const user = await getAuthenticatedUser(c);
    const body = c.req.valid('json');

    // Check if user already has approved KYC
    const existingKYC = await c.env.DB.prepare(
      `SELECT kyc_status, kyc_inquiry_id FROM users WHERE id = ?`
    )
      .bind(user.id)
      .first();

    if (existingKYC?.kyc_status === 'approved') {
      return c.json({
        message: 'KYC already approved',
        status: 'approved',
        inquiryId: existingKYC.kyc_inquiry_id,
      });
    }

    const kycService = getKYCService(c);

    // Get user's email from database or Privy
    let email = (user as unknown as { email?: string }).email;
    if (!email) {
      try {
        const privy = new PrivyClient(c.env.PRIVY_APP_ID, c.env.PRIVY_APP_SECRET);
        const privyUser = await privy.getUser(user.privy_user_id);
        email = privyUser.email?.address;
      } catch {
        // Email is optional
      }
    }

    // Create new verification session
    const session = await kycService.createVerification({
      userId: user.id,
      level: body.level,
      email,
      redirectUrl: body.redirectUrl,
      referenceId: user.id,
    });

    // Update user's KYC status
    await c.env.DB.prepare(
      `UPDATE users SET 
       kyc_status = 'pending',
       kyc_provider = 'persona',
       kyc_inquiry_id = ?,
       kyc_level = ?,
       updated_at = ?
       WHERE id = ?`
    )
      .bind(session.id, body.level, new Date().toISOString(), user.id)
      .run();

    return c.json({
      session: {
        id: session.id,
        status: session.status,
        level: session.level,
        verificationUrl: session.verificationUrl,
        expiresAt: session.expiresAt.toISOString(),
      },
    });
  }
);

/**
 * POST /kyc/resume
 * Resume an existing KYC verification session
 */
kycRoutes.post('/resume', async (c) => {
  const user = await getAuthenticatedUser(c);

  // Get existing inquiry ID
  const existingKYC = await c.env.DB.prepare(
    `SELECT kyc_status, kyc_inquiry_id, kyc_level FROM users WHERE id = ?`
  )
    .bind(user.id)
    .first();

  if (!existingKYC?.kyc_inquiry_id) {
    throw new ValidationError('No existing verification to resume', {
      code: 'NO_VERIFICATION',
    });
  }

  if (existingKYC.kyc_status === 'approved') {
    return c.json({
      message: 'KYC already approved',
      status: 'approved',
    });
  }

  const kycService = getKYCService(c);

  const session = await kycService.resumeVerification(existingKYC.kyc_inquiry_id as string);

  return c.json({
    session: {
      id: session.id,
      status: session.status,
      level: session.level,
      verificationUrl: session.verificationUrl,
      expiresAt: session.expiresAt.toISOString(),
    },
  });
});

/**
 * POST /kyc/webhook
 * Handle KYC provider webhooks
 */
kycRoutes.post('/webhook', async (c) => {
  const payload = await c.req.text();
  const signature = c.req.header('Persona-Signature') || '';

  // Get KYC service for verification
  let kycService;
  try {
    kycService = getKYCService(c);
  } catch {
    return c.json({ error: 'KYC not configured' }, 500);
  }

  // Verify webhook signature
  if (!kycService.verifyWebhook(payload, signature)) {
    console.error('Invalid KYC webhook signature');
    return c.json({ error: 'Invalid signature' }, 401);
  }

  // Parse webhook event
  const event = kycService.parseWebhook(payload);
  console.log(`KYC webhook: ${event.type} - ${event.verificationId} - ${event.status}`);

  // Find user by inquiry ID
  const userResult = await c.env.DB.prepare(
    `SELECT id, privy_user_id FROM users WHERE kyc_inquiry_id = ?`
  )
    .bind(event.verificationId)
    .first();

  if (userResult) {
    const user = userResult as { id: string; privy_user_id: string };

    // Update user's KYC status
    await c.env.DB.prepare(
      `UPDATE users SET 
       kyc_status = ?,
       kyc_verified_at = ?,
       updated_at = ?
       WHERE id = ?`
    )
      .bind(
        event.status,
        event.status === 'approved' ? new Date().toISOString() : null,
        new Date().toISOString(),
        user.id
      )
      .run();

    // Send notification on status change
    try {
      // Get user's email from Privy
      const privy = new PrivyClient(c.env.PRIVY_APP_ID, c.env.PRIVY_APP_SECRET);
      const privyUser = await privy.getUser(user.privy_user_id);
      const userEmail = privyUser.linkedAccounts.find((acc) => acc.type === 'email')?.address;

      if (userEmail && c.env.RESEND_API_KEY && c.env.RESEND_FROM_EMAIL) {
        const emailService = createEmailService({
          apiKey: c.env.RESEND_API_KEY,
          defaultFrom: {
            email: c.env.RESEND_FROM_EMAIL,
            name: 'Stashtab',
          },
        });

        const notificationHub = new NotificationHub({ email: emailService });

        await notificationHub.sendKYCStatusEmail({
          to: userEmail,
          status: event.status as 'pending' | 'in_review' | 'approved' | 'declined' | 'expired',
          appUrl:
            c.env.ENVIRONMENT === 'production'
              ? 'https://app.stashtab.app'
              : 'http://localhost:3000',
        });
      }
    } catch (error) {
      // Log error but don't fail the webhook
      console.error('Failed to send KYC status notification:', error);
    }
  }

  return c.json({ received: true, processed: !!user });
});

/**
 * GET /kyc/requirements
 * Get KYC requirements for features
 */
kycRoutes.get('/requirements', async (c) => {
  const kycEnabled = !!c.env.PERSONA_API_KEY;

  return c.json({
    enabled: kycEnabled,
    features: {
      deposit: { required: false },
      send: { required: kycEnabled, level: 'basic' },
      withdraw: { required: kycEnabled, level: 'standard' },
      fiat_purchase: { required: kycEnabled, level: 'standard' },
      fiat_sell: { required: kycEnabled, level: 'enhanced' },
    },
    levels: {
      basic: {
        name: 'Basic',
        description: 'Email and phone verification',
        documents: [],
        limits: { daily: 500, monthly: 2000 },
      },
      standard: {
        name: 'Standard',
        description: 'Government ID verification',
        documents: ['passport', 'drivers_license', 'national_id'],
        limits: { daily: 5000, monthly: 20000 },
      },
      enhanced: {
        name: 'Enhanced',
        description: 'Full identity verification with address proof',
        documents: ['passport', 'drivers_license', 'national_id', 'utility_bill'],
        limits: { daily: 50000, monthly: 200000 },
      },
    },
  });
});

export { kycRoutes };
