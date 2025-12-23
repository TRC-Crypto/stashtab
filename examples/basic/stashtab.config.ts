/**
 * Basic Configuration Example
 *
 * Minimal setup for getting started with Stashtab.
 * No fiat integration, no KYC - just core yield functionality.
 *
 * Perfect for:
 * - Learning the platform
 * - Development and testing
 * - Simple yield applications
 */

import type { StashtabConfig } from '../../packages/config/src/types';

const config: StashtabConfig = {
  app: {
    name: 'My Savings App',
    description: 'Simple DeFi savings account',
    url: 'https://mysavings.app',
  },

  chain: {
    network: 'base-sepolia', // Use testnet for development
  },

  auth: {
    methods: {
      email: true, // Email login
      sms: false,
      google: true, // Google OAuth
      apple: false,
      twitter: false,
      discord: false,
      github: false,
      wallet: true, // MetaMask, etc.
    },
    session: {
      duration: '7d',
      inactivityTimeout: '1h',
    },
  },

  features: {
    // No fiat purchases - users must already have crypto
    fiat: {
      enabled: false,
      providers: {
        stripe: { enabled: false },
        moonpay: { enabled: false },
      },
      defaultCurrency: 'USD',
    },

    // No KYC required
    kyc: {
      enabled: false,
      provider: 'persona',
      requiredFor: {
        send: false,
        withdraw: false,
        fiatPurchase: false,
        fiatSell: false,
      },
      levels: {
        basic: { limit: 500 },
        standard: { limit: 5000 },
        enhanced: { limit: 50000 },
      },
    },

    // Basic email notifications only
    notifications: {
      enabled: true,
      email: {
        enabled: true,
        types: {
          welcome: true,
          transactions: true,
          security: true,
          marketing: false,
        },
      },
      push: {
        enabled: false,
        types: {
          transactions: false,
          security: false,
          marketing: false,
        },
      },
    },

    // Core yield feature
    yield: {
      enabled: true,
      protocol: 'aave',
      autoDeposit: true,
      minDepositAmount: '1',
    },
  },

  branding: {
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg',
      icon: '/icon.svg',
    },
    colors: {
      primary: '#10b981', // Emerald
      secondary: '#6366f1',
      background: '#111827',
      surface: '#1f2937',
      text: '#ffffff',
      textMuted: '#9ca3af',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'Fira Code, monospace',
    },
    borderRadius: {
      small: '6px',
      medium: '10px',
      large: '14px',
      full: '9999px',
    },
  },

  limits: {
    send: {
      min: 1,
      max: 10000,
      daily: 50000,
    },
    withdraw: {
      min: 10,
      max: 10000,
      daily: 50000,
    },
    kycThreshold: 999999, // No KYC threshold (disabled)
  },

  dev: {
    debug: true,
    mockServices: false,
    showTestBanner: true,
  },
};

export default config;
