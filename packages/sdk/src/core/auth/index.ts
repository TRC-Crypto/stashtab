/**
 * Authentication primitives
 *
 * Provides authentication abstractions for various auth providers
 */

/**
 * Authentication provider type
 */
export type AuthProvider = 'privy' | 'passkey' | 'wallet' | 'social';

/**
 * Authentication configuration
 */
export interface AuthConfig {
  provider: AuthProvider;
  chainId: number;
  options?: Record<string, unknown>;
}

/**
 * User authentication session
 */
export interface AuthSession {
  userId: string;
  address: string;
  provider: AuthProvider;
  expiresAt?: number;
}
