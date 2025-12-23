/**
 * Sumsub KYC Integration
 *
 * This is a stub implementation for Sumsub identity verification.
 * Sumsub provides global KYC/AML verification.
 *
 * To implement:
 * 1. Sign up for Sumsub (https://sumsub.com)
 * 2. Create applicant flow
 * 3. Get API credentials from dashboard
 * 4. Replace stub methods with actual Sumsub API calls
 *
 * @see https://docs.sumsub.com/reference
 */

import type {
  KYCService,
  KYCServiceConfig,
  VerificationRequest,
  VerificationSession,
  UserIdentity,
  SanctionsCheckResult,
  WebhookEvent,
} from './types';

export class SumsubKYCService implements KYCService {
  readonly name = 'sumsub';
  private config: KYCServiceConfig;
  private baseUrl: string;

  constructor(config: KYCServiceConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production' ? 'https://api.sumsub.com' : 'https://api.sumsub.com'; // Same URL, different app tokens
  }

  async createVerification(request: VerificationRequest): Promise<VerificationSession> {
    // TODO: Implement with Sumsub API
    // 1. Create applicant
    // const applicant = await fetch(`${this.baseUrl}/resources/applicants`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    //   body: JSON.stringify({
    //     externalUserId: request.userId,
    //     levelName: this.getLevelName(request.level),
    //   }),
    // });
    //
    // 2. Get access token for SDK
    // const token = await fetch(`${this.baseUrl}/resources/accessTokens`, {...});

    const applicantId = `app_${Date.now()}`;

    return {
      id: applicantId,
      userId: request.userId,
      status: 'pending',
      level: request.level,
      verificationUrl: `https://websdk.sumsub.com?accessToken=stub_token`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      createdAt: new Date(),
    };
  }

  async getVerification(verificationId: string): Promise<UserIdentity> {
    // TODO: Implement with Sumsub API
    // const response = await fetch(
    //   `${this.baseUrl}/resources/applicants/${verificationId}/one`,
    //   { headers: this.getHeaders() }
    // );

    return {
      id: verificationId,
      userId: 'user_123',
      status: 'pending',
      level: 'standard',
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getUserVerification(_userId: string): Promise<UserIdentity | null> {
    // TODO: Implement with Sumsub API
    // const response = await fetch(
    //   `${this.baseUrl}/resources/applicants/-;externalUserId=${userId}/one`,
    //   { headers: this.getHeaders() }
    // );

    return null;
  }

  async resumeVerification(verificationId: string): Promise<VerificationSession> {
    // TODO: Get new access token for existing applicant
    return {
      id: verificationId,
      userId: 'user_123',
      status: 'pending',
      level: 'standard',
      verificationUrl: `https://websdk.sumsub.com?accessToken=stub_token`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  async checkSanctions(_params: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    country?: string;
  }): Promise<SanctionsCheckResult> {
    // TODO: Implement with Sumsub screening API

    return {
      checked: true,
      checkedAt: new Date(),
      matched: false,
      lists: [],
      score: 0,
    };
  }

  async getVerificationUrl(_verificationId: string): Promise<string> {
    // TODO: Generate new access token and return SDK URL
    return `https://websdk.sumsub.com?accessToken=stub_token`;
  }

  verifyWebhook(_payload: string, _signature: string): boolean {
    // TODO: Implement Sumsub webhook verification
    // Sumsub signs webhooks with HMAC-SHA1

    if (!this.config.webhookSecret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    return this.config.environment === 'sandbox';
  }

  parseWebhook(payload: string): WebhookEvent {
    const data = JSON.parse(payload);

    return {
      id: data.id || `evt_${Date.now()}`,
      type: data.type || 'unknown',
      userId: data.externalUserId || '',
      verificationId: data.applicantId || '',
      status: this.mapSumsubStatus(data.reviewResult?.reviewAnswer),
      timestamp: new Date(data.createdAt || Date.now()),
      data: data,
    };
  }

  private mapSumsubStatus(reviewAnswer?: string): UserIdentity['status'] {
    const statusMap: Record<string, UserIdentity['status']> = {
      GREEN: 'approved',
      RED: 'declined',
      YELLOW: 'needs_review',
    };
    return statusMap[reviewAnswer || ''] || 'pending';
  }

  private getLevelName(level: VerificationRequest['level']): string {
    // Map our level names to Sumsub level names
    // These should match your Sumsub dashboard configuration
    const levelMap: Record<string, string> = {
      basic: 'basic-kyc-level',
      standard: 'standard-kyc-level',
      enhanced: 'enhanced-kyc-level',
    };
    return levelMap[level] || 'basic-kyc-level';
  }

  /**
   * Generate signed request headers for Sumsub API
   */
  private getHeaders(): Record<string, string> {
    // TODO: Implement proper Sumsub authentication
    // Sumsub uses HMAC-SHA256 signing of requests
    // See: https://docs.sumsub.com/reference/authentication

    return {
      'Content-Type': 'application/json',
      'X-App-Token': this.config.apiKey,
    };
  }
}

/**
 * Create a configured Sumsub KYC service
 */
export function createSumsubService(config: {
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  environment?: 'sandbox' | 'production';
}): SumsubKYCService {
  return new SumsubKYCService({
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    webhookSecret: config.webhookSecret,
    environment: config.environment || 'sandbox',
  });
}
