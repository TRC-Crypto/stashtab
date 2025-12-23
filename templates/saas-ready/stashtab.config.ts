import { defineConfig } from '../../stashtab.config';

/**
 * SaaS-Ready Template
 *
 * Multi-tenant ready configuration for white-label SaaS deployments.
 * Includes:
 * - Full fiat on/off ramp support
 * - KYC verification
 * - Multi-tenant architecture hooks
 * - Advanced notifications
 *
 * Perfect for:
 * - White-label neobank platforms
 * - B2B SaaS applications
 * - Multi-brand deployments
 */

export default defineConfig({
  app: {
    name: 'Stashtab SaaS',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@stashtab.app',
    environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  },

  blockchain: {
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532'),
    rpcUrl: process.env.RPC_URL || 'https://sepolia.base.org',
  },

  auth: {
    privy: {
      appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
      appSecret: process.env.PRIVY_APP_SECRET || '',
    },
  },

  // Full fiat support
  fiat: {
    stripe: {
      apiKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    },
    moonpay: {
      apiKey: process.env.MOONPAY_API_KEY || '',
      secretKey: process.env.MOONPAY_SECRET_KEY || '',
      webhookSecret: process.env.MOONPAY_WEBHOOK_SECRET || '',
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    },
  },

  // Full KYC support
  kyc: {
    persona: {
      apiKey: process.env.PERSONA_API_KEY || '',
      templateId: process.env.PERSONA_TEMPLATE_ID || '',
      webhookSecret: process.env.PERSONA_WEBHOOK_SECRET || '',
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    },
  },

  // Full notification support
  notifications: {
    email: {
      apiKey: process.env.RESEND_API_KEY || '',
      defaultFrom: {
        email: process.env.EMAIL_FROM || 'noreply@stashtab.app',
        name: process.env.EMAIL_FROM_NAME || 'Stashtab',
      },
    },
    push: {
      apiKey: process.env.EXPO_ACCESS_TOKEN || '',
      expoAccessToken: process.env.EXPO_ACCESS_TOKEN || '',
    },
  },

  features: {
    fiatOnRampEnabled: true,
    fiatOffRampEnabled: true,
    kycEnabled: true,
    notificationsEnabled: true,
  },
});
