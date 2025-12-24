/**
 * Core primitives
 *
 * Authentication, account abstraction, and shared types
 */

export * from './auth';
export * from './accounts';
// Types exported selectively to avoid TransactionResult conflict
// Note: TransactionResult is exported via ./accounts, so we don't export it here
export type {
  ChainId,
  ChainName,
  PrimitiveConfig,
  AddressValidationResult,
  AmountValidationResult,
  ProtocolMetadata,
  CodedError,
} from './types';
