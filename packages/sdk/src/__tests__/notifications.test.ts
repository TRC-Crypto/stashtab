import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNotificationHub } from '../notifications';
import { createEmailService, EmailBuilder } from '../notifications/email';
import { createExpoPushService, PushNotificationBuilder } from '../notifications/push';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ResendEmailService', () => {
  let emailService: ReturnType<typeof createEmailService>;

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = createEmailService({
      apiKey: 're_test_123',
      defaultFrom: { email: 'noreply@test.com', name: 'Test App' },
    });
  });

  describe('send', () => {
    it('should send an email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'email_123' }),
      });

      const result = await emailService.send({
        to: { email: 'user@example.com' },
        subject: 'Test Email',
        html: '<h1>Hello</h1>',
      });

      expect(result.status).toBe('sent');
      expect(result.id).toBe('email_123');
      expect(result.channel).toBe('email');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer re_test_123',
          }),
        })
      );
    });

    it('should handle failed sends', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid API key' }),
      });

      const result = await emailService.send({
        to: { email: 'user@example.com' },
        subject: 'Test',
        text: 'Test',
      });

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Invalid API key');
    });

    it('should support multiple recipients', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'email_123' }),
      });

      await emailService.send({
        to: [{ email: 'user1@example.com' }, { email: 'user2@example.com' }],
        subject: 'Test',
        text: 'Test',
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.to).toHaveLength(2);
    });
  });

  describe('sendBatch', () => {
    it('should send batch emails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 'email_1' }, { id: 'email_2' }],
          }),
      });

      const results = await emailService.sendBatch([
        { to: { email: 'user1@example.com' }, subject: 'Test 1', text: 'Test 1' },
        { to: { email: 'user2@example.com' }, subject: 'Test 2', text: 'Test 2' },
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('email_1');
      expect(results[1].id).toBe('email_2');
    });
  });
});

describe('EmailBuilder', () => {
  it('should build a valid email notification', () => {
    const email = new EmailBuilder()
      .to({ email: 'user@example.com', name: 'User' })
      .from({ email: 'sender@example.com' })
      .subject('Test Subject')
      .html('<h1>Hello</h1>')
      .text('Hello')
      .tags('test', 'example')
      .build();

    expect(email.to).toEqual({ email: 'user@example.com', name: 'User' });
    expect(email.subject).toBe('Test Subject');
    expect(email.html).toBe('<h1>Hello</h1>');
    expect(email.tags).toContain('test');
  });

  it('should throw without recipient', () => {
    expect(() => new EmailBuilder().subject('Test').html('<h1>Test</h1>').build()).toThrow(
      'Recipient is required'
    );
  });

  it('should throw without subject', () => {
    expect(() =>
      new EmailBuilder().to({ email: 'user@example.com' }).html('<h1>Test</h1>').build()
    ).toThrow('Subject is required');
  });

  it('should throw without content', () => {
    expect(() =>
      new EmailBuilder().to({ email: 'user@example.com' }).subject('Test').build()
    ).toThrow('Content');
  });
});

describe('ExpoPushService', () => {
  let pushService: ReturnType<typeof createExpoPushService>;

  beforeEach(() => {
    vi.clearAllMocks();
    pushService = createExpoPushService({
      accessToken: 'expo_token_123',
    });
  });

  describe('send', () => {
    it('should send a push notification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 'receipt_123', status: 'ok' }],
          }),
      });

      const result = await pushService.send({
        to: 'ExponentPushToken[abc123]',
        title: 'Test',
        body: 'Test message',
      });

      expect(result.status).toBe('sent');
      expect(result.id).toBe('receipt_123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer expo_token_123',
          }),
        })
      );
    });

    it('should handle push errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ status: 'error', message: 'DeviceNotRegistered' }],
          }),
      });

      const result = await pushService.send({
        to: 'ExponentPushToken[invalid]',
        title: 'Test',
        body: 'Test',
      });

      expect(result.status).toBe('failed');
      expect(result.error).toContain('DeviceNotRegistered');
    });
  });

  describe('isValidToken', () => {
    it('should validate Expo push tokens', () => {
      expect(pushService.isValidToken('ExponentPushToken[abc123]')).toBe(true);
      expect(pushService.isValidToken('invalid')).toBe(false);
      expect(pushService.isValidToken('ExponentPushToken')).toBe(false);
      expect(pushService.isValidToken('ExponentPushToken[]')).toBe(true);
    });
  });

  describe('sendBatch', () => {
    it('should batch send notifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 'r1', status: 'ok' },
              { id: 'r2', status: 'ok' },
            ],
          }),
      });

      const results = await pushService.sendBatch([
        { to: 'ExponentPushToken[1]', title: 'Test 1', body: 'Body 1' },
        { to: 'ExponentPushToken[2]', title: 'Test 2', body: 'Body 2' },
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('sent');
      expect(results[1].status).toBe('sent');
    });
  });
});

describe('PushNotificationBuilder', () => {
  it('should build a valid push notification', () => {
    const notification = new PushNotificationBuilder()
      .to('ExponentPushToken[abc123]')
      .title('New Message')
      .body('You have a new message')
      .data({ screen: 'messages' })
      .badge(1)
      .sound('default')
      .build();

    expect(notification.to).toBe('ExponentPushToken[abc123]');
    expect(notification.title).toBe('New Message');
    expect(notification.data).toEqual({ screen: 'messages' });
    expect(notification.badge).toBe(1);
  });

  it('should throw without token', () => {
    expect(() => new PushNotificationBuilder().title('Test').body('Test').build()).toThrow(
      'Recipient token'
    );
  });

  it('should throw without title', () => {
    expect(() => new PushNotificationBuilder().to('token').body('Test').build()).toThrow(
      'Title is required'
    );
  });
});

describe('NotificationHub', () => {
  let hub: ReturnType<typeof createNotificationHub>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'msg_123' }),
    });

    hub = createNotificationHub({
      email: {
        apiKey: 're_test_123',
        defaultFrom: { email: 'noreply@test.com' },
      },
      push: {
        accessToken: 'expo_token',
      },
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const result = await hub.sendWelcomeEmail({
        to: 'user@example.com',
        userName: 'John',
        safeAddress: '0x123...',
        appUrl: 'https://app.test.com',
      });

      expect(result).not.toBeNull();
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('sendTransactionEmail', () => {
    it('should send deposit notification', async () => {
      const result = await hub.sendTransactionEmail({
        to: 'user@example.com',
        type: 'deposit',
        amount: '100',
        currency: 'USDC',
        appUrl: 'https://app.test.com',
      });

      expect(result).not.toBeNull();

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.subject).toContain('Deposit Received');
    });
  });

  describe('sendPushNotification', () => {
    it('should send push notification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 'r1', status: 'ok' }] }),
      });

      const result = await hub.sendPushNotification({
        tokens: 'ExponentPushToken[abc]',
        title: 'Test',
        body: 'Test message',
      });

      expect(result).not.toBeNull();
    });
  });
});
