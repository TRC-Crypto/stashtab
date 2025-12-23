/**
 * KYC/AML Services
 *
 * This module provides identity verification integrations for compliance.
 *
 * Supported providers:
 * - Persona: Modern identity verification
 * - Sumsub: Global KYC/AML platform
 *
 * Usage:
 * ```typescript
 * import { createPersonaService, createSumsubService } from '@stashtab/sdk/kyc';
 *
 * // Persona
 * const persona = createPersonaService({
 *   apiKey: 'persona_...',
 *   templateId: 'itmpl_...',
 *   environment: 'sandbox',
 * });
 *
 * // Create verification session
 * const session = await persona.createVerification({
 *   userId: 'user_123',
 *   level: 'standard',
 *   email: 'user@example.com',
 * });
 *
 * // Redirect user to verification
 * window.location.href = session.verificationUrl;
 *
 * // Check status later
 * const verification = await persona.getVerification(session.id);
 * if (verification.status === 'approved') {
 *   // User is verified
 * }
 * ```
 *
 * Verification Levels:
 * - basic: Email/phone verification only
 * - standard: ID document + selfie
 * - enhanced: Full KYC with address verification
 */

export * from "./types";
export { PersonaKYCService, createPersonaService } from "./persona";
export { SumsubKYCService, createSumsubService } from "./sumsub";

/**
 * Factory function to create a KYC service by provider
 */
export function createKYCService(
  provider: "persona" | "sumsub",
  config: {
    apiKey: string;
    secretKey?: string;
    templateId?: string;
    webhookSecret?: string;
    environment?: "sandbox" | "production";
  }
) {
  switch (provider) {
    case "persona":
      if (!config.templateId) {
        throw new Error("Persona requires a templateId");
      }
      return createPersonaService({
        apiKey: config.apiKey,
        templateId: config.templateId,
        webhookSecret: config.webhookSecret,
        environment: config.environment,
      });

    case "sumsub":
      if (!config.secretKey) {
        throw new Error("Sumsub requires a secretKey");
      }
      return createSumsubService({
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        webhookSecret: config.webhookSecret,
        environment: config.environment,
      });

    default:
      throw new Error(`Unknown KYC provider: ${provider}`);
  }
}

/**
 * Helper to determine required verification level based on transaction amount
 */
export function getRequiredVerificationLevel(
  amountUSD: number
): "basic" | "standard" | "enhanced" {
  // Example thresholds - adjust based on your compliance requirements
  if (amountUSD < 1000) {
    return "basic";
  } else if (amountUSD < 10000) {
    return "standard";
  } else {
    return "enhanced";
  }
}

/**
 * Check if user's verification is sufficient for a transaction
 */
export function isVerificationSufficient(
  userLevel: "basic" | "standard" | "enhanced" | undefined,
  requiredLevel: "basic" | "standard" | "enhanced"
): boolean {
  if (!userLevel) return false;

  const levelRanking = {
    basic: 1,
    standard: 2,
    enhanced: 3,
  };

  return levelRanking[userLevel] >= levelRanking[requiredLevel];
}

