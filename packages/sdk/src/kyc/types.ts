/**
 * KYC/AML Service Types
 *
 * These types define the interface for identity verification services
 * like Persona, Sumsub, Jumio, etc.
 */

export type VerificationStatus =
  | "not_started"
  | "pending"
  | "in_review"
  | "approved"
  | "declined"
  | "expired"
  | "needs_review";

export type VerificationLevel = "basic" | "standard" | "enhanced";

export type DocumentType =
  | "passport"
  | "drivers_license"
  | "national_id"
  | "residence_permit"
  | "utility_bill"
  | "bank_statement";

export interface UserIdentity {
  id: string;
  userId: string;
  status: VerificationStatus;
  level: VerificationLevel;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  documents: DocumentVerification[];
  riskScore?: number;
  sanctionsCheck?: SanctionsCheckResult;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  expiresAt?: Date;
}

export interface DocumentVerification {
  id: string;
  type: DocumentType;
  status: VerificationStatus;
  country: string;
  documentNumber?: string;
  expiryDate?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
}

export interface SanctionsCheckResult {
  checked: boolean;
  checkedAt?: Date;
  matched: boolean;
  lists?: string[];
  score?: number;
}

export interface VerificationRequest {
  userId: string;
  level: VerificationLevel;
  email?: string;
  phoneNumber?: string;
  referenceId?: string;
  redirectUrl?: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export interface VerificationSession {
  id: string;
  userId: string;
  status: VerificationStatus;
  level: VerificationLevel;
  verificationUrl: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  userId: string;
  verificationId: string;
  status: VerificationStatus;
  timestamp: Date;
  data: Record<string, any>;
}

export interface KYCServiceConfig {
  apiKey: string;
  secretKey?: string;
  environment: "sandbox" | "production";
  webhookSecret?: string;
  templateId?: string;
}

/**
 * Abstract interface for KYC/AML services
 */
export interface KYCService {
  readonly name: string;

  /**
   * Create a new verification session
   */
  createVerification(request: VerificationRequest): Promise<VerificationSession>;

  /**
   * Get verification status
   */
  getVerification(verificationId: string): Promise<UserIdentity>;

  /**
   * Get user's verification by user ID
   */
  getUserVerification(userId: string): Promise<UserIdentity | null>;

  /**
   * Resume an existing verification session
   */
  resumeVerification(verificationId: string): Promise<VerificationSession>;

  /**
   * Run sanctions/PEP screening
   */
  checkSanctions(params: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    country?: string;
  }): Promise<SanctionsCheckResult>;

  /**
   * Get verification URL for embedding
   */
  getVerificationUrl(verificationId: string): Promise<string>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: string, signature: string): boolean;

  /**
   * Parse webhook event
   */
  parseWebhook(payload: string): WebhookEvent;
}

