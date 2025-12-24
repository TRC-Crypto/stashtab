/**
 * Account abstraction primitives
 *
 * Provides unified account management for Safe, EOA, and other account types
 */

// Account abstraction interface
export type {
  AccountAbstraction,
  AccountType,
  AccountInfo,
  AccountConfig,
  TransactionData,
} from './abstraction';
// TransactionResult is exported from core/types, not from abstraction
export type { TransactionResult } from '../types';

// Import for legacy type alias
import type { AccountType } from './abstraction';

// Account implementations
export { EOAAccount, createEOAAccount, type EOAAccountConfig } from './eoa';
export { SafeAccount, createSafeAccount, type SafeAccountConfig } from './safe';

// Account factory and detection
export { createAccount, createAccountFromWallet } from './factory';
export { detectAccountType, isPredictedSafeAddress } from './detector';

// Migration utilities
export {
  migrateAssets,
  upgradeEOAToSafe,
  type MigrationResult,
  type MigrateAssetsConfig,
  type UpgradeEOAToSafeConfig,
} from './migration';

/**
 * @deprecated Use AccountType from './abstraction' instead
 */
export type LegacyAccountType = AccountType;

/**
 * @deprecated Use AccountInfo from './abstraction' instead
 */
export interface LegacyAccountInfo {
  address: string;
  type: 'safe' | 'eoa' | 'contract';
  chainId: number;
  deployed: boolean;
  owners?: string[];
  threshold?: number;
}

/**
 * Account deployment options
 */
export interface AccountDeploymentOptions {
  owners: string[];
  threshold?: number;
  saltNonce?: bigint;
}

/**
 * Session key configuration
 */
export interface SessionKeyConfig {
  validAfter: number;
  validUntil: number;
  permissions: string[];
}
