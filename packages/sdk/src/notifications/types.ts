/**
 * Notification Service Types
 *
 * These types define the interface for notification services
 * including email (Resend, SendGrid) and push notifications (Expo, FCM).
 */

export type NotificationChannel = "email" | "push" | "sms";
export type NotificationStatus = "pending" | "sent" | "delivered" | "failed" | "bounced";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface PushRecipient {
  token: string;
  platform: "ios" | "android" | "web";
}

export interface NotificationRecipient {
  userId: string;
  email?: EmailRecipient;
  push?: PushRecipient;
}

export interface EmailNotification {
  to: EmailRecipient | EmailRecipient[];
  from?: EmailRecipient;
  subject: string;
  html?: string;
  text?: string;
  template?: {
    id: string;
    data: Record<string, any>;
  };
  replyTo?: string;
  tags?: string[];
}

export interface PushNotification {
  to: string | string[]; // Push tokens
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  icon?: string;
  image?: string;
  clickAction?: string;
  priority?: "default" | "high";
  ttl?: number; // Time to live in seconds
}

export interface NotificationResult {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

export interface NotificationServiceConfig {
  apiKey: string;
  environment?: "development" | "production";
  defaultFrom?: EmailRecipient;
}

/**
 * Abstract interface for email notification services
 */
export interface EmailService {
  readonly name: string;

  /**
   * Send a single email
   */
  send(notification: EmailNotification): Promise<NotificationResult>;

  /**
   * Send batch emails
   */
  sendBatch(notifications: EmailNotification[]): Promise<NotificationResult[]>;

  /**
   * Get email delivery status
   */
  getStatus(id: string): Promise<NotificationResult>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: string, signature: string): boolean;
}

/**
 * Abstract interface for push notification services
 */
export interface PushService {
  readonly name: string;

  /**
   * Send a push notification
   */
  send(notification: PushNotification): Promise<NotificationResult>;

  /**
   * Send batch push notifications
   */
  sendBatch(notifications: PushNotification[]): Promise<NotificationResult[]>;

  /**
   * Get delivery status
   */
  getStatus(id: string): Promise<NotificationResult>;

  /**
   * Register a device token
   */
  registerDevice(userId: string, token: string, platform: "ios" | "android" | "web"): Promise<void>;

  /**
   * Unregister a device token
   */
  unregisterDevice(token: string): Promise<void>;
}

/**
 * Combined notification service interface
 */
export interface NotificationService {
  email?: EmailService;
  push?: PushService;

  /**
   * Send notification to user across all available channels
   */
  notify(
    recipient: NotificationRecipient,
    message: {
      title: string;
      body: string;
      template?: string;
      data?: Record<string, any>;
    },
    channels?: NotificationChannel[]
  ): Promise<NotificationResult[]>;
}

