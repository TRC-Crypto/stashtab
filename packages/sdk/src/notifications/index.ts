/**
 * Notification Services
 *
 * This module provides email and push notification integrations.
 *
 * Supported services:
 * - Email: Resend (modern email API)
 * - Push: Expo Push (for React Native), FCM (for web/Android)
 *
 * Usage:
 * ```typescript
 * import {
 *   createEmailService,
 *   createExpoPushService,
 *   EmailBuilder,
 *   PushNotificationBuilder,
 * } from '@stashtab/sdk/notifications';
 *
 * // Email
 * const email = createEmailService({
 *   apiKey: 're_...',
 *   defaultFrom: { email: 'noreply@yourdomain.com', name: 'Your App' },
 * });
 *
 * await email.send(
 *   new EmailBuilder()
 *     .to({ email: 'user@example.com' })
 *     .subject('Welcome!')
 *     .html('<h1>Hello</h1>')
 *     .build()
 * );
 *
 * // Push
 * const push = createExpoPushService();
 *
 * await push.send(
 *   new PushNotificationBuilder()
 *     .to('ExponentPushToken[...]')
 *     .title('New Deposit')
 *     .body('You received 100 USDC')
 *     .data({ screen: 'dashboard' })
 *     .build()
 * );
 * ```
 */

export * from './types';
export {
  ResendEmailService,
  createEmailService,
  EmailBuilder,
  RESEND_WEBHOOK_EVENTS,
} from './email';
export {
  ExpoPushService,
  FCMPushService,
  createExpoPushService,
  createFCMPushService,
  PushNotificationBuilder,
} from './push';

import { createEmailService } from './email';
import { createExpoPushService } from './push';

// Email templates
export { welcomeEmailHtml, welcomeEmailText, type WelcomeEmailData } from './templates/welcome';
export {
  transactionEmailHtml,
  transactionEmailText,
  type TransactionEmailData,
  type TransactionType,
} from './templates/transaction';
export {
  kycStatusEmailHtml,
  kycStatusEmailText,
  type KYCEmailData,
  type KYCStatus,
} from './templates/kyc';
export {
  securityEmailHtml,
  securityEmailText,
  type SecurityEmailData,
  type SecurityEventType,
} from './templates/security';

/**
 * Unified notification service that combines email and push
 */
export class NotificationHub {
  constructor(
    private email?: ReturnType<typeof createEmailService>,
    private push?: ReturnType<typeof createExpoPushService>
  ) {}

  async sendWelcomeEmail(params: {
    to: string;
    userName?: string;
    safeAddress: string;
    appUrl: string;
  }) {
    if (!this.email) {
      console.warn('Email service not configured');
      return null;
    }

    const { welcomeEmailHtml, welcomeEmailText } = await import('./templates/welcome');

    return this.email.send({
      to: { email: params.to },
      subject: 'Welcome to Stashtab',
      html: welcomeEmailHtml(params),
      text: welcomeEmailText(params),
      tags: ['welcome', 'onboarding'],
    });
  }

  async sendTransactionEmail(params: {
    to: string;
    type: 'deposit' | 'withdrawal' | 'send' | 'receive';
    amount: string;
    currency: string;
    txHash?: string;
    appUrl: string;
  }) {
    if (!this.email) {
      console.warn('Email service not configured');
      return null;
    }

    const { transactionEmailHtml, transactionEmailText } = await import('./templates/transaction');

    const subjects = {
      deposit: 'Deposit Received',
      withdrawal: 'Withdrawal Complete',
      send: 'Transfer Sent',
      receive: 'Transfer Received',
    };

    return this.email.send({
      to: { email: params.to },
      subject: `${subjects[params.type]} - ${params.amount} ${params.currency}`,
      html: transactionEmailHtml({
        ...params,
        timestamp: new Date(),
      }),
      text: transactionEmailText({
        ...params,
        timestamp: new Date(),
      }),
      tags: ['transaction', params.type],
    });
  }

  async sendKYCStatusEmail(params: {
    to: string;
    userName?: string;
    status: 'pending' | 'in_review' | 'approved' | 'declined' | 'expired';
    reason?: string;
    appUrl: string;
  }) {
    if (!this.email) {
      console.warn('Email service not configured');
      return null;
    }

    const { kycStatusEmailHtml, kycStatusEmailText } = await import('./templates/kyc');

    const subjects = {
      pending: 'Identity Verification Started',
      in_review: 'Verification Under Review',
      approved: 'Identity Verified Successfully',
      declined: 'Verification Not Approved',
      expired: 'Verification Session Expired',
    };

    return this.email.send({
      to: { email: params.to },
      subject: subjects[params.status],
      html: kycStatusEmailHtml(params),
      text: kycStatusEmailText(params),
      tags: ['kyc', params.status],
    });
  }

  async sendSecurityEmail(params: {
    to: string;
    userName?: string;
    eventType:
      | 'new_login'
      | 'new_device'
      | 'password_changed'
      | 'email_changed'
      | 'large_withdrawal'
      | 'suspicious_activity';
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    amount?: string;
    currency?: string;
    appUrl: string;
  }) {
    if (!this.email) {
      console.warn('Email service not configured');
      return null;
    }

    const { securityEmailHtml, securityEmailText } = await import('./templates/security');

    const subjects = {
      new_login: 'New Login Detected',
      new_device: 'New Device Login',
      password_changed: 'Password Changed',
      email_changed: 'Email Address Changed',
      large_withdrawal: 'Large Withdrawal Alert',
      suspicious_activity: 'Security Alert',
    };

    return this.email.send({
      to: { email: params.to },
      subject: `🔐 ${subjects[params.eventType]}`,
      html: securityEmailHtml({
        ...params,
        timestamp: new Date(),
      }),
      text: securityEmailText({
        ...params,
        timestamp: new Date(),
      }),
      tags: ['security', params.eventType],
    });
  }

  async sendPushNotification(params: {
    tokens: string | string[];
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: 'default' | null;
    badge?: number;
  }) {
    if (!this.push) {
      console.warn('Push service not configured');
      return null;
    }

    return this.push.send({
      to: params.tokens,
      title: params.title,
      body: params.body,
      data: params.data,
      sound: params.sound ?? 'default',
      badge: params.badge,
    });
  }

  async sendTransactionPush(params: {
    tokens: string | string[];
    type: 'deposit' | 'withdrawal' | 'send' | 'receive';
    amount: string;
    currency: string;
  }) {
    if (!this.push) {
      console.warn('Push service not configured');
      return null;
    }

    const titles = {
      deposit: 'Deposit Received',
      withdrawal: 'Withdrawal Complete',
      send: 'Transfer Sent',
      receive: 'Transfer Received',
    };

    const isIncoming = params.type === 'deposit' || params.type === 'receive';
    const prefix = isIncoming ? '+' : '-';

    return this.push.send({
      to: params.tokens,
      title: titles[params.type],
      body: `${prefix}${params.amount} ${params.currency}`,
      data: {
        type: 'transaction',
        transactionType: params.type,
        screen: 'dashboard',
      },
      sound: 'default',
    });
  }
}

/**
 * Create a unified notification hub
 */
export function createNotificationHub(config?: {
  email?: {
    apiKey: string;
    defaultFrom?: { email: string; name?: string };
    webhookSecret?: string;
  };
  push?: {
    accessToken?: string;
    environment?: 'development' | 'production';
  };
}): NotificationHub {
  const email = config?.email ? createEmailService(config.email) : undefined;
  const push = config?.push ? createExpoPushService(config.push) : undefined;

  return new NotificationHub(email, push);
}
