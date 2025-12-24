import { describe, it, expect, vi } from 'vitest';
import type { StashtabPublicClient, StashtabWalletClient } from '../client';
import { createSafeService, SafeService } from '../safe';

const mockPublicClient = {
  readContract: vi.fn(),
  getCode: vi.fn(),
  chain: { id: 84532 },
} as unknown as StashtabPublicClient;

const mockWalletClient = {
  writeContract: vi.fn(),
  account: {
    address: '0x1234567890123456789012345678901234567890' as const,
  },
} as unknown as StashtabWalletClient;

describe('createSafeService', () => {
  it('should create a SafeService instance', () => {
    const service = createSafeService({
      chainId: 84532,
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
    });

    expect(service).toBeInstanceOf(SafeService);
  });

  it('should be equivalent to new SafeService()', () => {
    const factoryService = createSafeService({
      chainId: 84532,
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
    });

    const constructorService = new SafeService(mockPublicClient, mockWalletClient, 84532);

    expect(factoryService).toBeInstanceOf(SafeService);
    expect(constructorService).toBeInstanceOf(SafeService);
  });
});
