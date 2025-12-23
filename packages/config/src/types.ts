/**
 * Stashtab Configuration Types
 *
 * Type definitions for the unified stashtab.config.ts configuration file.
 */

export interface StashtabConfig {
  /** Application identity and metadata */
  app: AppConfig;
  /** Blockchain/chain configuration */
  chain: ChainConfig;
  /** Authentication configuration */
  auth: AuthConfig;
  /** Feature flags and configurations */
  features: FeaturesConfig;
  /** Branding and theming */
  branding: BrandingConfig;
  /** Transaction and operational limits */
  limits: LimitsConfig;
  /** Development/debug settings */
  dev: DevConfig;
}

export interface AppConfig {
  /** Application name displayed in UI */
  name: string;
  /** Short description for meta tags */
  description: string;
  /** Production URL */
  url: string;
  /** Support email address */
  supportEmail?: string;
}

export interface ChainConfig {
  /** Network identifier */
  network: 'base' | 'base-sepolia';
  /** Custom RPC URL (optional) */
  rpcUrl?: string;
}

export interface AuthConfig {
  /** Enabled login methods */
  methods: {
    email: boolean;
    sms: boolean;
    google: boolean;
    apple: boolean;
    twitter: boolean;
    discord: boolean;
    github: boolean;
    wallet: boolean;
  };
  /** Session configuration */
  session: {
    /** Session duration (e.g., '7d', '24h') */
    duration: string;
    /** Inactivity timeout (e.g., '1h', '30m') */
    inactivityTimeout: string;
  };
}

export interface FeaturesConfig {
  /** Fiat on/off ramp configuration */
  fiat: FiatConfig;
  /** KYC/identity verification configuration */
  kyc: KYCConfig;
  /** Notification configuration */
  notifications: NotificationsConfig;
  /** Yield/savings configuration */
  yield: YieldConfig;
}

export interface FiatConfig {
  /** Enable fiat functionality */
  enabled: boolean;
  /** Provider configurations */
  providers: {
    stripe: {
      enabled: boolean;
    };
    moonpay: {
      enabled: boolean;
    };
  };
  /** Default fiat currency */
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
}

export interface KYCConfig {
  /** Enable KYC requirement */
  enabled: boolean;
  /** KYC provider */
  provider: 'persona' | 'sumsub';
  /** Features that require KYC */
  requiredFor: {
    send: boolean;
    withdraw: boolean;
    fiatPurchase: boolean;
    fiatSell: boolean;
  };
  /** Verification level limits */
  levels: {
    basic: { limit: number };
    standard: { limit: number };
    enhanced: { limit: number };
  };
}

export interface NotificationsConfig {
  /** Enable notifications globally */
  enabled: boolean;
  /** Email notification config */
  email: {
    enabled: boolean;
    types: {
      welcome: boolean;
      transactions: boolean;
      security: boolean;
      marketing: boolean;
    };
  };
  /** Push notification config */
  push: {
    enabled: boolean;
    types: {
      transactions: boolean;
      security: boolean;
      marketing: boolean;
    };
  };
}

export interface YieldConfig {
  /** Enable yield features */
  enabled: boolean;
  /** DeFi protocol to use */
  protocol: 'aave';
  /** Auto-deposit to yield protocol */
  autoDeposit: boolean;
  /** Minimum amount to trigger auto-deposit */
  minDepositAmount: string;
}

export interface BrandingConfig {
  /** Logo configuration */
  logo: {
    light: string;
    dark: string;
    icon: string;
  };
  /** Color scheme */
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    success: string;
    warning: string;
    error: string;
  };
  /** Font configuration */
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  /** Border radius values */
  borderRadius: {
    small: string;
    medium: string;
    large: string;
    full: string;
  };
}

export interface LimitsConfig {
  /** Send transaction limits */
  send: TransactionLimits;
  /** Withdraw transaction limits */
  withdraw: TransactionLimits;
  /** Amount threshold that requires KYC */
  kycThreshold: number;
}

export interface TransactionLimits {
  /** Minimum transaction amount */
  min: number;
  /** Maximum single transaction */
  max: number;
  /** Daily limit */
  daily: number;
}

export interface DevConfig {
  /** Enable debug logging */
  debug: boolean;
  /** Mock external services */
  mockServices: boolean;
  /** Show test mode banner in UI */
  showTestBanner: boolean;
}

/**
 * Get chain ID from network name
 */
export function getChainIdFromNetwork(network: ChainConfig['network']): number {
  return network === 'base' ? 8453 : 84532;
}

/**
 * Get default RPC URL for network
 */
export function getDefaultRpcUrl(network: ChainConfig['network']): string {
  return network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
}

/**
 * Parse duration string to milliseconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(d|h|m|s)$/);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return 0;
  }
}
