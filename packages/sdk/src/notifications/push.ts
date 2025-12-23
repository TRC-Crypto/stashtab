/**
 * Push Notification Service Integration
 *
 * This is a stub implementation for push notifications.
 * Supports Expo Push (for React Native) and FCM (for web/Android).
 *
 * To implement:
 * 1. For Expo: Use expo-notifications and Expo Push API
 * 2. For FCM: Set up Firebase project and use firebase-admin
 * 3. Replace stub methods with actual API calls
 *
 * @see https://docs.expo.dev/push-notifications/overview/
 * @see https://firebase.google.com/docs/cloud-messaging
 */

import type {
  PushService,
  PushNotification,
  NotificationResult,
  NotificationServiceConfig,
} from "./types";

export class ExpoPushService implements PushService {
  readonly name = "expo";
  private config: NotificationServiceConfig;

  constructor(config: NotificationServiceConfig) {
    this.config = config;
  }

  async send(notification: PushNotification): Promise<NotificationResult> {
    // TODO: Implement with Expo Push API
    // const messages = [{
    //   to: notification.to,
    //   title: notification.title,
    //   body: notification.body,
    //   data: notification.data,
    //   sound: notification.sound || 'default',
    //   badge: notification.badge,
    // }];
    //
    // const response = await fetch('https://exp.host/--/api/v2/push/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //   },
    //   body: JSON.stringify(messages),
    // });

    const tokens = Array.isArray(notification.to)
      ? notification.to
      : [notification.to];

    // Stub response
    return {
      id: `push_${Date.now()}`,
      channel: "push",
      status: "sent",
      recipient: tokens[0],
      sentAt: new Date(),
    };
  }

  async sendBatch(notifications: PushNotification[]): Promise<NotificationResult[]> {
    // TODO: Implement with Expo batch API
    // Expo supports sending up to 100 messages in a single request

    return Promise.all(notifications.map((n) => this.send(n)));
  }

  async getStatus(id: string): Promise<NotificationResult> {
    // TODO: Implement with Expo receipts API
    // const response = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
    //   method: 'POST',
    //   body: JSON.stringify({ ids: [id] }),
    // });

    return {
      id,
      channel: "push",
      status: "delivered",
      recipient: "ExponentPushToken[...]",
      sentAt: new Date(),
      deliveredAt: new Date(),
    };
  }

  async registerDevice(
    userId: string,
    token: string,
    platform: "ios" | "android" | "web"
  ): Promise<void> {
    // TODO: Store device token in your database
    // await db.pushTokens.upsert({
    //   userId,
    //   token,
    //   platform,
    //   updatedAt: new Date(),
    // });

    console.log(`Registered device for user ${userId}: ${token} (${platform})`);
  }

  async unregisterDevice(token: string): Promise<void> {
    // TODO: Remove device token from database
    // await db.pushTokens.delete({ token });

    console.log(`Unregistered device: ${token}`);
  }

  /**
   * Validate Expo push token format
   */
  isValidToken(token: string): boolean {
    return token.startsWith("ExponentPushToken[") && token.endsWith("]");
  }
}

export class FCMPushService implements PushService {
  readonly name = "fcm";
  private config: NotificationServiceConfig;

  constructor(config: NotificationServiceConfig) {
    this.config = config;
  }

  async send(notification: PushNotification): Promise<NotificationResult> {
    // TODO: Implement with Firebase Admin SDK
    // const admin = require('firebase-admin');
    // const message = {
    //   notification: {
    //     title: notification.title,
    //     body: notification.body,
    //   },
    //   data: notification.data,
    //   token: notification.to,
    // };
    // const response = await admin.messaging().send(message);

    const tokens = Array.isArray(notification.to)
      ? notification.to
      : [notification.to];

    return {
      id: `fcm_${Date.now()}`,
      channel: "push",
      status: "sent",
      recipient: tokens[0],
      sentAt: new Date(),
    };
  }

  async sendBatch(notifications: PushNotification[]): Promise<NotificationResult[]> {
    // TODO: Implement with FCM sendMulticast
    return Promise.all(notifications.map((n) => this.send(n)));
  }

  async getStatus(id: string): Promise<NotificationResult> {
    // FCM doesn't have a receipt API like Expo
    // You'd need to track delivery via your own webhook
    return {
      id,
      channel: "push",
      status: "sent",
      recipient: "fcm_token",
      sentAt: new Date(),
    };
  }

  async registerDevice(
    userId: string,
    token: string,
    platform: "ios" | "android" | "web"
  ): Promise<void> {
    console.log(`Registered FCM device for user ${userId}: ${token} (${platform})`);
  }

  async unregisterDevice(token: string): Promise<void> {
    console.log(`Unregistered FCM device: ${token}`);
  }
}

/**
 * Create Expo push service
 */
export function createExpoPushService(config?: {
  accessToken?: string;
  environment?: "development" | "production";
}): ExpoPushService {
  return new ExpoPushService({
    apiKey: config?.accessToken || "",
    environment: config?.environment || "development",
  });
}

/**
 * Create FCM push service
 */
export function createFCMPushService(config: {
  serviceAccountKey: string;
  environment?: "development" | "production";
}): FCMPushService {
  return new FCMPushService({
    apiKey: config.serviceAccountKey,
    environment: config.environment || "development",
  });
}

/**
 * Helper to build push notifications
 */
export class PushNotificationBuilder {
  private notification: Partial<PushNotification> = {};

  to(tokens: string | string[]): this {
    this.notification.to = tokens;
    return this;
  }

  title(title: string): this {
    this.notification.title = title;
    return this;
  }

  body(body: string): this {
    this.notification.body = body;
    return this;
  }

  data(data: Record<string, any>): this {
    this.notification.data = data;
    return this;
  }

  badge(count: number): this {
    this.notification.badge = count;
    return this;
  }

  sound(sound: string): this {
    this.notification.sound = sound;
    return this;
  }

  priority(priority: "default" | "high"): this {
    this.notification.priority = priority;
    return this;
  }

  build(): PushNotification {
    if (!this.notification.to) {
      throw new Error("Recipient token(s) required");
    }
    if (!this.notification.title) {
      throw new Error("Title is required");
    }
    if (!this.notification.body) {
      throw new Error("Body is required");
    }

    return this.notification as PushNotification;
  }
}

