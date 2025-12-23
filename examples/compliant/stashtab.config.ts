/**
 * Compliant Configuration Example
 *
 * Full KYC and fiat integration for a production-ready neobank.
 * Includes all compliance features required for regulated environments.
 *
 * Perfect for:
 * - Production deployments
 * - Regulated financial services
 * - Enterprise applications
 *
 * Required environment variables:
 * - PRIVY_APP_ID, PRIVY_APP_SECRET
 * - STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * - MOONPAY_API_KEY, MOONPAY_SECRET_KEY, MOONPAY_WEBHOOK_SECRET
 * - PERSONA_API_KEY, PERSONA_TEMPLATE_ID, PERSONA_WEBHOOK_SECRET
 * - RESEND_API_KEY
 * - EXPO_ACCESS_TOKEN
 */

import type { StashtabConfig } from '../../packages/config/src/types';

const config: StashtabConfig = {
  app: {
    name: 'SecureBank',
    description: 'Your compliant DeFi savings account',
    url: 'https://securebank.finance',
    supportEmail: 'support@securebank.finance',
  },

  chain: {
    network: 'base', // Production mainnet
    rpcUrl: process.env.RPC_URL,
  },

  auth: {
    methods: {
      email: true,
      sms: true, // Enable for 2FA
      google: true,
      apple: true,
      twitter: false,
      discord: false,
      github: false,
      wallet: true,
    },
    session: {
      duration: '24h', // Shorter for security
      inactivityTimeout: '30m',
    },
  },

  features: {
    // Full fiat integration
    fiat: {
      enabled: true,
      providers: {
        stripe: { enabled: true },
        moonpay: { enabled: true },
      },
      defaultCurrency: 'USD',
    },

    // KYC required for all sensitive operations
    kyc: {
      enabled: true,
      provider: 'persona',
      requiredFor: {
        send: false, // No KYC for small sends
        withdraw: true,
        fiatPurchase: true,
        fiatSell: true,
      },
      levels: {
        basic: { limit: 500 }, // Basic email verification
        standard: { limit: 10000 }, // ID verification
        enhanced: { limit: 100000 }, // Full verification + proof of address
      },
    },

    // Full notification suite
    notifications: {
      enabled: true,
      email: {
        enabled: true,
        types: {
          welcome: true,
          transactions: true,
          security: true,
          marketing: false, // Opt-in only
        },
      },
      push: {
        enabled: true,
        types: {
          transactions: true,
          security: true,
          marketing: false,
        },
      },
    },

    yield: {
      enabled: true,
      protocol: 'aave',
      autoDeposit: true,
      minDepositAmount: '10', // Higher minimum for production
    },
  },

  branding: {
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg',
      icon: '/icon.svg',
    },
    colors: {
      primary: '#2563eb', // Professional blue
      secondary: '#7c3aed',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      success: '#22c55e',
      warning: '#eab308',
      error: '#dc2626',
    },
    fonts: {
      heading: 'Plus Jakarta Sans, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    borderRadius: {
      small: '8px',
      medium: '12px',
      large: '16px',
      full: '9999px',
    },
  },

  limits: {
    send: {
      min: 1,
      max: 50000,
      daily: 100000,
    },
    withdraw: {
      min: 50,
      max: 50000,
      daily: 100000,
    },
    kycThreshold: 500, // Require KYC above $500
  },

  dev: {
    debug: false,
    mockServices: false,
    showTestBanner: false,
  },
};

export default config;
