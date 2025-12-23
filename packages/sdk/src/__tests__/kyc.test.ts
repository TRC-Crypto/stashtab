import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPersonaService, type PersonaKYCService } from '../kyc/persona';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PersonaKYCService', () => {
  let kycService: PersonaKYCService;

  beforeEach(() => {
    vi.clearAllMocks();
    kycService = createPersonaService({
      apiKey: 'persona_test_key',
      templateId: 'tmpl_test_123',
      webhookSecret: 'webhook_secret',
      environment: 'sandbox',
    });
  });

  describe('createVerification', () => {
    it('should create a verification session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: 'inq_123',
              type: 'inquiry',
              attributes: {
                status: 'created',
                'reference-id': 'user_123',
                'created-at': new Date().toISOString(),
              },
            },
          }),
      });

      const session = await kycService.createVerification({
        userId: 'user_123',
        level: 'standard',
        email: 'user@example.com',
      });

      expect(session.id).toBe('inq_123');
      expect(session.userId).toBe('user_123');
      expect(session.status).toBe('not_started');
      expect(session.verificationUrl).toContain('withpersona.com/verify');
      expect(session.verificationUrl).toContain('inq_123');
    });

    it('should throw if template ID is missing', async () => {
      const serviceNoTemplate = createPersonaService({
        apiKey: 'test_key',
        templateId: '', // Empty template ID
        environment: 'sandbox',
      });

      await expect(
        serviceNoTemplate.createVerification({
          userId: 'user_123',
          level: 'standard',
        })
      ).rejects.toThrow('template ID is required');
    });
  });

  describe('getVerification', () => {
    it('should return verification details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: 'inq_123',
              type: 'inquiry',
              attributes: {
                status: 'approved',
                'reference-id': 'user_123',
                'name-first': 'John',
                'name-last': 'Doe',
                birthdate: '1990-01-01',
                'address-country-code': 'US',
                'created-at': '2024-01-01T00:00:00Z',
                'updated-at': '2024-01-01T00:00:00Z',
              },
            },
            included: [],
          }),
      });

      const identity = await kycService.getVerification('inq_123');

      expect(identity.id).toBe('inq_123');
      expect(identity.userId).toBe('user_123');
      expect(identity.status).toBe('approved');
      expect(identity.firstName).toBe('John');
      expect(identity.lastName).toBe('Doe');
      expect(identity.dateOfBirth).toBe('1990-01-01');
    });

    it('should map status correctly', async () => {
      const testCases = [
        { personaStatus: 'created', expected: 'not_started' },
        { personaStatus: 'pending', expected: 'pending' },
        { personaStatus: 'completed', expected: 'in_review' },
        { personaStatus: 'approved', expected: 'approved' },
        { personaStatus: 'declined', expected: 'declined' },
        { personaStatus: 'expired', expected: 'expired' },
        { personaStatus: 'needs_review', expected: 'needs_review' },
      ];

      for (const { personaStatus, expected } of testCases) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                id: 'inq_123',
                type: 'inquiry',
                attributes: {
                  status: personaStatus,
                  'reference-id': 'user_123',
                  'created-at': '2024-01-01T00:00:00Z',
                  'updated-at': '2024-01-01T00:00:00Z',
                },
              },
              included: [],
            }),
        });

        const identity = await kycService.getVerification('inq_123');
        expect(identity.status).toBe(expected);
      }
    });
  });

  describe('getUserVerification', () => {
    it('should return null if no verification exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [],
          }),
      });

      const result = await kycService.getUserVerification('user_without_kyc');

      expect(result).toBeNull();
    });

    it('should return the most recent verification', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 'inq_old',
                  attributes: {
                    status: 'expired',
                    'created-at': '2024-01-01T00:00:00Z',
                  },
                },
                {
                  id: 'inq_new',
                  attributes: {
                    status: 'approved',
                    'created-at': '2024-06-01T00:00:00Z',
                  },
                },
              ],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                id: 'inq_new',
                type: 'inquiry',
                attributes: {
                  status: 'approved',
                  'reference-id': 'user_123',
                  'created-at': '2024-06-01T00:00:00Z',
                  'updated-at': '2024-06-01T00:00:00Z',
                },
              },
              included: [],
            }),
        });

      const result = await kycService.getUserVerification('user_123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('inq_new');
    });
  });

  describe('resumeVerification', () => {
    it('should return resume URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: 'inq_123',
              type: 'inquiry',
              attributes: {
                status: 'pending',
                'reference-id': 'user_123',
                'created-at': '2024-01-01T00:00:00Z',
                'updated-at': '2024-01-01T00:00:00Z',
              },
            },
            included: [],
          }),
      });

      const session = await kycService.resumeVerification('inq_123');

      expect(session.verificationUrl).toContain('inq_123');
      expect(session.verificationUrl).toContain('resume=true');
    });
  });

  describe('checkSanctions', () => {
    it('should return no match for clean individual', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: 'rep_123',
              type: 'report/watchlist',
              attributes: {
                status: 'completed',
                'matched-lists': [],
              },
            },
          }),
      });

      const result = await kycService.checkSanctions({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        country: 'US',
      });

      expect(result.checked).toBe(true);
      expect(result.matched).toBe(false);
      expect(result.lists).toHaveLength(0);
    });

    it('should return match for sanctioned individual', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: 'rep_123',
              type: 'report/watchlist',
              attributes: {
                status: 'completed',
                'matched-lists': ['OFAC SDN', 'EU Sanctions'],
              },
            },
          }),
      });

      const result = await kycService.checkSanctions({
        firstName: 'Sanctioned',
        lastName: 'Person',
      });

      expect(result.checked).toBe(true);
      expect(result.matched).toBe(true);
      expect(result.lists).toContain('OFAC SDN');
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await kycService.checkSanctions({
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.checked).toBe(false);
      expect(result.matched).toBe(false);
    });
  });

  describe('verifyWebhook', () => {
    it('should return false without webhook secret', () => {
      const serviceNoSecret = createPersonaService({
        apiKey: 'test_key',
        templateId: 'tmpl_123',
        environment: 'sandbox',
      });

      const result = serviceNoSecret.verifyWebhook('payload', 'sig');
      expect(result).toBe(false);
    });

    it('should return false for invalid signature format', () => {
      const result = kycService.verifyWebhook('payload', 'invalid');
      expect(result).toBe(false);
    });

    it('should return false for expired timestamp', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      const signature = `t=${oldTimestamp},v1=somesignature`;

      const result = kycService.verifyWebhook('payload', signature);
      expect(result).toBe(false);
    });
  });

  describe('parseWebhook', () => {
    it('should parse webhook payload correctly', () => {
      const payload = JSON.stringify({
        data: {
          id: 'inq_123',
          type: 'inquiry',
          attributes: {
            status: 'approved',
            'reference-id': 'user_123',
            'updated-at': '2024-01-01T00:00:00Z',
          },
        },
      });

      const event = kycService.parseWebhook(payload);

      expect(event.type).toBe('inquiry');
      expect(event.verificationId).toBe('inq_123');
      expect(event.userId).toBe('user_123');
      expect(event.status).toBe('approved');
    });
  });

  describe('getVerificationUrl', () => {
    it('should return verification URL', async () => {
      const url = await kycService.getVerificationUrl('inq_123');

      expect(url).toContain('withpersona.com/verify');
      expect(url).toContain('inquiry-id=inq_123');
    });
  });
});
