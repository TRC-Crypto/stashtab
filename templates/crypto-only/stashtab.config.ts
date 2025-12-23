import { defineConfig } from '../../stashtab.config';

/**
 * Crypto-Only Template
 *
 * Minimal configuration for a crypto-only neobank without fiat on/off ramps or KYC.
 * Perfect for:
 * - Crypto-native applications
 * - DeFi protocols
 * - Wallet applications
 * - Testing and development
 */

export default defineConfig({
  app: {
    name: 'Stashtab Crypto',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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

  // No fiat integrations
  fiat: undefined,

  // No KYC required
  kyc: undefined,

  // Basic email notifications only
  notifications: {
    email: {
      apiKey: process.env.RESEND_API_KEY || '',
      defaultFrom: {
        email: 'noreply@stashtab.app',
        name: 'Stashtab',
      },
    },
  },

  features: {
    fiatOnRampEnabled: false,
    fiatOffRampEnabled: false,
    kycEnabled: false,
    notificationsEnabled: true,
  },
});
