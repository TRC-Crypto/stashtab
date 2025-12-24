// Client creation utilities
export {
  createStashtabPublicClient,
  createStashtabWalletClient,
  type StashtabPublicClient,
  type StashtabWalletClient,
} from './client';

// Convenience client (zero-config option)
export {
  createStashtabClient,
  type StashtabClient,
  type StashtabClientConfig,
} from './client-factory';

// Core primitives (auth, accounts, types)
export * from './core';

// Yield primitives (Aave, Morpho, router)
// Note: AaveService exports are handled via ./yield which re-exports from ./aave
export * from './yield';

// Payment primitives - export individually to avoid type conflicts
export * from './payments/batch';
export * from './payments/streaming';
// Export transfers separately (TransferRequest conflicts with legacy types)
// Note: SafeService, executeSafeTransaction, SafeTransactionData are exported from ./safe below
export {
  createTransferService,
  executeTransfer,
  type TransferRequest as PaymentTransferRequest,
  type BatchTransferRequest,
  type TransferService,
  type ExecuteTransferConfig,
} from './payments/transfers';

// Fiat primitives (onramp, offramp)
export * as fiat from './fiat';
export * from './fiat/onramp';
export * from './fiat/offramp';

// Compliance primitives (KYC, sanctions, reporting)
export * from './compliance';

// Legacy exports (for backward compatibility) - selective to avoid duplicates
// Note: SafeService, executeSafeTransaction, SafeTransactionData are exported via ./core above
// Note: AaveService, createAaveService, AaveServiceConfig are exported via ./yield above
export { createSafeService, predictSafeAddress, deploySafe, type SafeServiceConfig } from './safe';
export { verifyPrivyToken, type PrivyUser } from './privy';
// Export legacy types (excluding TransactionResult which is already in core/types)
export type {
  UserAccount,
  UserBalance,
  YieldRate,
  TransferRequest,
  SafeDeploymentResult,
  DepositRequest,
  WithdrawRequest,
} from './types';
export * as notifications from './notifications';
export * from './monitoring';
export * from './utils';
