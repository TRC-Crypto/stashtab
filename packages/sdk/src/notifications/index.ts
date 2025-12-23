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
export { ResendEmailService, createEmailService, EmailBuilder } from './email';
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

  async sendPushNotification(params: {
    tokens: string | string[];
    title: string;
    body: string;
    data?: Record<string, any>;
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
  };
  push?: {
    accessToken?: string;
  };
}): NotificationHub {
  const email = config?.email ? createEmailService(config.email) : undefined;

  const push = config?.push ? createExpoPushService(config.push) : undefined;

  return new NotificationHub(email, push);
}
