/**
 * Custom Branding Example
 *
 * White-label configuration showing how to completely customize
 * the look and feel of your Stashtab instance.
 *
 * Perfect for:
 * - White-label deployments
 * - Brand-conscious applications
 * - Custom theme implementations
 */

import type { StashtabConfig } from '../../packages/config/src/types';

const config: StashtabConfig = {
  app: {
    name: 'Acme Finance',
    description: 'Earn yield on your stablecoins with Acme',
    url: 'https://finance.acme.com',
    supportEmail: 'help@acme.com',
  },

  chain: {
    network: 'base-sepolia',
  },

  auth: {
    methods: {
      email: true,
      sms: false,
      google: true,
      apple: true,
      twitter: false,
      discord: false,
      github: false,
      wallet: true,
    },
    session: {
      duration: '7d',
      inactivityTimeout: '1h',
    },
  },

  features: {
    fiat: {
      enabled: true,
      providers: {
        stripe: { enabled: true },
        moonpay: { enabled: false },
      },
      defaultCurrency: 'USD',
    },

    kyc: {
      enabled: true,
      provider: 'persona',
      requiredFor: {
        send: false,
        withdraw: true,
        fiatPurchase: true,
        fiatSell: true,
      },
      levels: {
        basic: { limit: 500 },
        standard: { limit: 5000 },
        enhanced: { limit: 50000 },
      },
    },

    notifications: {
      enabled: true,
      email: {
        enabled: true,
        types: {
          welcome: true,
          transactions: true,
          security: true,
          marketing: true,
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
      minDepositAmount: '1',
    },
  },

  // Custom branding - Orange/coral theme inspired by fintech aesthetic
  branding: {
    logo: {
      light: '/branding/acme-logo-light.svg',
      dark: '/branding/acme-logo-dark.svg',
      icon: '/branding/acme-icon.svg',
    },
    colors: {
      // Coral/orange accent - distinctive and energetic
      primary: '#ff6b35',
      secondary: '#f7c59f',
      // Dark charcoal background for modern look
      background: '#1a1a2e',
      surface: '#16213e',
      // Cream text for warmth
      text: '#fef9ef',
      textMuted: '#a5a5a5',
      // Status colors that complement the theme
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
    },
    fonts: {
      // Distinctive heading font
      heading: 'Clash Display, sans-serif',
      // Clean body font
      body: 'Satoshi, sans-serif',
      // Modern mono font
      mono: 'IBM Plex Mono, monospace',
    },
    borderRadius: {
      // More rounded for friendly feel
      small: '10px',
      medium: '16px',
      large: '24px',
      full: '9999px',
    },
  },

  limits: {
    send: {
      min: 1,
      max: 25000,
      daily: 50000,
    },
    withdraw: {
      min: 25,
      max: 25000,
      daily: 50000,
    },
    kycThreshold: 1000,
  },

  dev: {
    debug: true,
    mockServices: false,
    showTestBanner: true,
  },
};

export default config;
