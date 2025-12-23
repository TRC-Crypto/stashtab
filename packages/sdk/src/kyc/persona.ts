/**
 * Persona KYC Integration
 *
 * This is a stub implementation for Persona identity verification.
 * Persona provides modern identity verification for fintech.
 *
 * To implement:
 * 1. Sign up for Persona (https://withpersona.com)
 * 2. Create an inquiry template
 * 3. Get API key from dashboard
 * 4. Install: pnpm add persona
 * 5. Replace stub methods with actual Persona API calls
 *
 * @see https://docs.withpersona.com/docs
 */

import type {
  KYCService,
  KYCServiceConfig,
  VerificationRequest,
  VerificationSession,
  UserIdentity,
  SanctionsCheckResult,
  WebhookEvent,
} from "./types";

export class PersonaKYCService implements KYCService {
  readonly name = "persona";
  private config: KYCServiceConfig;
  private baseUrl: string;

  constructor(config: KYCServiceConfig) {
    this.config = config;
    this.baseUrl = config.environment === "production"
      ? "https://api.withpersona.com/api/v1"
      : "https://api.withpersona.com/api/v1"; // Persona uses same URL with sandbox templates
  }

  async createVerification(request: VerificationRequest): Promise<VerificationSession> {
    // TODO: Implement with Persona API
    // const response = await fetch(`${this.baseUrl}/inquiries`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.config.apiKey}`,
    //     'Content-Type': 'application/json',
    //     'Persona-Version': '2023-01-05',
    //   },
    //   body: JSON.stringify({
    //     data: {
    //       attributes: {
    //         'inquiry-template-id': this.config.templateId,
    //         'reference-id': request.userId,
    //       },
    //     },
    //   }),
    // });

    const sessionId = `inq_${Date.now()}`;

    return {
      id: sessionId,
      userId: request.userId,
      status: "pending",
      level: request.level,
      verificationUrl: `https://withpersona.com/verify?inquiry-id=${sessionId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };
  }

  async getVerification(verificationId: string): Promise<UserIdentity> {
    // TODO: Implement with Persona API
    // const response = await fetch(`${this.baseUrl}/inquiries/${verificationId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${this.config.apiKey}`,
    //     'Persona-Version': '2023-01-05',
    //   },
    // });

    return {
      id: verificationId,
      userId: "user_123",
      status: "pending",
      level: "standard",
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getUserVerification(userId: string): Promise<UserIdentity | null> {
    // TODO: Implement with Persona API
    // Search for inquiries by reference-id
    // const response = await fetch(`${this.baseUrl}/inquiries?filter[reference-id]=${userId}`, {...});

    return null;
  }

  async resumeVerification(verificationId: string): Promise<VerificationSession> {
    // TODO: Implement with Persona API
    // const response = await fetch(`${this.baseUrl}/inquiries/${verificationId}/resume`, {...});

    return {
      id: verificationId,
      userId: "user_123",
      status: "pending",
      level: "standard",
      verificationUrl: `https://withpersona.com/verify?inquiry-id=${verificationId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  async checkSanctions(params: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    country?: string;
  }): Promise<SanctionsCheckResult> {
    // TODO: Implement with Persona Reports API
    // const response = await fetch(`${this.baseUrl}/reports/watchlist`, {
    //   method: 'POST',
    //   headers: {...},
    //   body: JSON.stringify({
    //     data: {
    //       attributes: {
    //         'name-first': params.firstName,
    //         'name-last': params.lastName,
    //         'birthdate': params.dateOfBirth,
    //       },
    //     },
    //   }),
    // });

    return {
      checked: true,
      checkedAt: new Date(),
      matched: false,
      lists: [],
      score: 0,
    };
  }

  async getVerificationUrl(verificationId: string): Promise<string> {
    // Persona verification URLs can be opened directly
    return `https://withpersona.com/verify?inquiry-id=${verificationId}`;
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // TODO: Implement Persona webhook verification
    // Persona uses HMAC-SHA256

    if (!this.config.webhookSecret) {
      console.warn("Webhook secret not configured");
      return false;
    }

    // Stub: always return true in sandbox
    return this.config.environment === "sandbox";
  }

  parseWebhook(payload: string): WebhookEvent {
    const data = JSON.parse(payload);

    return {
      id: data.data?.id || `evt_${Date.now()}`,
      type: data.data?.attributes?.status || "unknown",
      userId: data.data?.attributes?.["reference-id"] || "",
      verificationId: data.data?.id || "",
      status: this.mapPersonaStatus(data.data?.attributes?.status),
      timestamp: new Date(data.data?.attributes?.["updated-at"] || Date.now()),
      data: data.data?.attributes || {},
    };
  }

  private mapPersonaStatus(personaStatus: string): UserIdentity["status"] {
    const statusMap: Record<string, UserIdentity["status"]> = {
      created: "not_started",
      pending: "pending",
      completed: "in_review",
      approved: "approved",
      declined: "declined",
      expired: "expired",
      needs_review: "needs_review",
    };
    return statusMap[personaStatus] || "pending";
  }
}

/**
 * Create a configured Persona KYC service
 */
export function createPersonaService(config: {
  apiKey: string;
  templateId: string;
  webhookSecret?: string;
  environment?: "sandbox" | "production";
}): PersonaKYCService {
  return new PersonaKYCService({
    apiKey: config.apiKey,
    templateId: config.templateId,
    webhookSecret: config.webhookSecret,
    environment: config.environment || "sandbox",
  });
}

