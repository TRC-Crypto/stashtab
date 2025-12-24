import type { Address } from 'viem';
import { describe, it, expect, vi } from 'vitest';
import type { StashtabPublicClient, StashtabWalletClient } from '../client';
import { createStreamingPaymentService } from '../payments/streaming';

const mockPublicClient = {
  readContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  chain: { id: 8453 },
} as unknown as StashtabPublicClient;

const mockWalletClient = {
  writeContract: vi.fn(),
  account: {
    address: '0x1234567890123456789012345678901234567890' as const,
  },
} as unknown as StashtabWalletClient;

describe('createStreamingPaymentService', () => {
  it('should create a StreamingPaymentService instance', () => {
    const service = createStreamingPaymentService({
      chainId: 8453,
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
    });

    expect(service).toBeDefined();
    expect(typeof service.createStream).toBe('function');
    expect(typeof service.getStream).toBe('function');
    expect(typeof service.getWithdrawableAmount).toBe('function');
  });

  it('should allow creation without walletClient for read-only operations', () => {
    const service = createStreamingPaymentService({
      chainId: 8453,
      publicClient: mockPublicClient,
    });

    expect(service).toBeDefined();
    expect(typeof service.getStream).toBe('function');
    expect(typeof service.getWithdrawableAmount).toBe('function');
  });

  it('should throw error when walletClient is missing for createStream', async () => {
    const service = createStreamingPaymentService({
      chainId: 8453,
      publicClient: mockPublicClient,
    });

    const now = Math.floor(Date.now() / 1000);

    await expect(
      service.createStream({
        sender: '0x1234567890123456789012345678901234567890' as Address,
        recipient: '0x0987654321098765432109876543210987654321' as Address,
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
        amount: 1000n,
        startTime: now + 60,
        endTime: now + 86400,
        publicClient: mockPublicClient,
        walletClient: undefined as any, // Explicitly undefined to test error
        chainId: 8453,
      })
    ).rejects.toThrow('walletClient is required');
  });
});
