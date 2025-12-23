/**
 * Stashtab Configuration
 *
 * This is the unified configuration file for your Stashtab neobank instance.
 * Customize this file to match your branding and feature requirements.
 *
 * After modifying this file, run `pnpm setup:check` to validate your configuration.
 */

import type { StashtabConfig } from './packages/config/src/types';

const config: StashtabConfig = {
  // ============================================================================
  // Application Identity
  // ============================================================================
  app: {
    name: 'Stashtab',
    description: 'Your DeFi savings account',
    url: 'https://stashtab.app',
    supportEmail: 'support@stashtab.app',
  },

  // ============================================================================
  // Blockchain Configuration
  // ============================================================================
  chain: {
    // Use 'base-sepolia' for testnet or 'base' for mainnet
    network: 'base-sepolia',
    // Custom RPC URL (optional - uses public RPC if not specified)
    rpcUrl: process.env.RPC_URL,
  },

  // ============================================================================
  // Authentication (Privy)
  // ============================================================================
  auth: {
    // Configure login methods (at least one required)
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
    // Session configuration
    session: {
      duration: '7d', // How long users stay logged in
      inactivityTimeout: '1h', // Auto-logout after inactivity
    },
  },

  // ============================================================================
  // Features Configuration
  // ============================================================================
  features: {
    // Fiat On/Off Ramp
    fiat: {
      enabled: false, // Set to true to enable fiat purchases
      providers: {
        stripe: {
          enabled: false,
          // Requires: STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY
        },
        moonpay: {
          enabled: false,
          // Requires: MOONPAY_API_KEY, MOONPAY_SECRET_KEY
        },
      },
      // Default fiat currency for quotes
      defaultCurrency: 'USD',
    },

    // KYC/Identity Verification
    kyc: {
      enabled: false, // Set to true to require KYC
      provider: 'persona', // 'persona' or 'sumsub'
      // Which features require KYC
      requiredFor: {
        send: false,
        withdraw: true,
        fiatPurchase: true,
        fiatSell: true,
      },
      // Verification levels
      levels: {
        basic: { limit: 500 }, // Basic verification limit
        standard: { limit: 5000 }, // Standard verification limit
        enhanced: { limit: 50000 }, // Enhanced verification limit
      },
    },

    // Notifications
    notifications: {
      enabled: true,
      email: {
        enabled: true,
        // Requires: RESEND_API_KEY
        types: {
          welcome: true,
          transactions: true,
          security: true,
          marketing: false,
        },
      },
      push: {
        enabled: false,
        // Requires: EXPO_ACCESS_TOKEN (optional)
        types: {
          transactions: true,
          security: true,
          marketing: false,
        },
      },
    },

    // Yield/Savings
    yield: {
      enabled: true,
      protocol: 'aave', // Currently only 'aave' supported
      autoDeposit: true, // Auto-deposit to Aave when funds received
      minDepositAmount: '1', // Minimum USDC to trigger auto-deposit
    },
  },

  // ============================================================================
  // Branding & Theming
  // ============================================================================
  branding: {
    // Logo URLs (use absolute URLs or paths in /public)
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg',
      icon: '/icon.svg',
    },
    // Color scheme
    colors: {
      // Primary accent color (used for buttons, links, highlights)
      primary: '#00d974',
      // Secondary color (used for secondary actions)
      secondary: '#6366f1',
      // Background colors
      background: '#0a0a0a',
      surface: '#18181b',
      // Text colors
      text: '#ffffff',
      textMuted: '#a1a1aa',
      // Status colors
      success: '#00d974',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    // Font configuration
    fonts: {
      heading: 'Space Grotesk, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    // Border radius for UI components
    borderRadius: {
      small: '8px',
      medium: '12px',
      large: '16px',
      full: '9999px',
    },
  },

  // ============================================================================
  // Limits & Restrictions
  // ============================================================================
  limits: {
    // Transaction limits (in USDC)
    send: {
      min: 1,
      max: 10000,
      daily: 25000,
    },
    withdraw: {
      min: 10,
      max: 10000,
      daily: 25000,
    },
    // Requires KYC for amounts above this
    kycThreshold: 500,
  },

  // ============================================================================
  // Development & Debug
  // ============================================================================
  dev: {
    // Enable debug logging
    debug: process.env.NODE_ENV === 'development',
    // Mock external services in development
    mockServices: false,
    // Show test mode banner
    showTestBanner: true,
  },
};

export default config;
