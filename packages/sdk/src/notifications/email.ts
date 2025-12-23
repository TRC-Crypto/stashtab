/**
 * Resend Email Service Integration
 *
 * This is a stub implementation for Resend email service.
 * Resend is a modern email API for developers.
 *
 * To implement:
 * 1. Sign up for Resend (https://resend.com)
 * 2. Get API key from dashboard
 * 3. Install: pnpm add resend
 * 4. Replace stub methods with actual Resend API calls
 *
 * @see https://resend.com/docs
 */

import type {
  EmailService,
  EmailNotification,
  NotificationResult,
  NotificationServiceConfig,
  EmailRecipient,
} from "./types";

export class ResendEmailService implements EmailService {
  readonly name = "resend";
  private config: NotificationServiceConfig;

  constructor(config: NotificationServiceConfig) {
    this.config = config;
  }

  async send(notification: EmailNotification): Promise<NotificationResult> {
    // TODO: Implement with Resend API
    // const resend = new Resend(this.config.apiKey);
    // const result = await resend.emails.send({
    //   from: notification.from?.email || this.config.defaultFrom?.email,
    //   to: Array.isArray(notification.to) ? notification.to.map(r => r.email) : notification.to.email,
    //   subject: notification.subject,
    //   html: notification.html,
    //   text: notification.text,
    // });

    const recipients = Array.isArray(notification.to)
      ? notification.to
      : [notification.to];

    // Stub response
    return {
      id: `email_${Date.now()}`,
      channel: "email",
      status: "sent",
      recipient: recipients[0].email,
      sentAt: new Date(),
    };
  }

  async sendBatch(notifications: EmailNotification[]): Promise<NotificationResult[]> {
    // TODO: Implement with Resend batch API
    // const resend = new Resend(this.config.apiKey);
    // const result = await resend.batch.send(notifications.map(...));

    return Promise.all(notifications.map((n) => this.send(n)));
  }

  async getStatus(id: string): Promise<NotificationResult> {
    // TODO: Implement with Resend API
    // const resend = new Resend(this.config.apiKey);
    // const email = await resend.emails.get(id);

    return {
      id,
      channel: "email",
      status: "delivered",
      recipient: "user@example.com",
      sentAt: new Date(),
      deliveredAt: new Date(),
    };
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // TODO: Implement Resend webhook verification
    // Resend uses svix for webhooks

    if (!signature) {
      return false;
    }

    // Stub: always return true in development
    return this.config.environment === "development";
  }
}

/**
 * Create a configured Resend email service
 */
export function createEmailService(config: {
  apiKey: string;
  defaultFrom?: EmailRecipient;
  environment?: "development" | "production";
}): ResendEmailService {
  return new ResendEmailService({
    apiKey: config.apiKey,
    defaultFrom: config.defaultFrom || {
      email: "noreply@stashtab.app",
      name: "Stashtab",
    },
    environment: config.environment || "development",
  });
}

/**
 * Helper to build transactional emails
 */
export class EmailBuilder {
  private notification: Partial<EmailNotification> = {};

  to(recipient: EmailRecipient | EmailRecipient[]): this {
    this.notification.to = recipient;
    return this;
  }

  from(sender: EmailRecipient): this {
    this.notification.from = sender;
    return this;
  }

  subject(subject: string): this {
    this.notification.subject = subject;
    return this;
  }

  html(content: string): this {
    this.notification.html = content;
    return this;
  }

  text(content: string): this {
    this.notification.text = content;
    return this;
  }

  template(id: string, data: Record<string, any>): this {
    this.notification.template = { id, data };
    return this;
  }

  tags(...tags: string[]): this {
    this.notification.tags = tags;
    return this;
  }

  build(): EmailNotification {
    if (!this.notification.to) {
      throw new Error("Recipient is required");
    }
    if (!this.notification.subject) {
      throw new Error("Subject is required");
    }
    if (!this.notification.html && !this.notification.text && !this.notification.template) {
      throw new Error("Content (html, text, or template) is required");
    }

    return this.notification as EmailNotification;
  }
}

