/**
 * Compliance primitives
 *
 * KYC, sanctions screening, and transaction reporting
 */

// Re-export existing KYC module (keep legacy export for compatibility)
export * as kyc from '../kyc';

// Re-export KYC functions directly for convenience
export { createPersonaService, PersonaKYCService } from '../kyc/persona';
export { createSumsubService, SumsubKYCService } from '../kyc/sumsub';
// Export KYC types but exclude SanctionsCheckResult (exported by sanctions module)
export type {
  KYCService,
  KYCServiceConfig,
  VerificationRequest,
  VerificationSession,
  UserIdentity,
  WebhookEvent,
  DocumentVerification,
  VerificationStatus,
  VerificationLevel,
} from '../kyc/types';

// Export new compliance modules
export * from './sanctions';
export * from './reporting';
