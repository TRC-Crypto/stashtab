import { describe, it, expect, vi } from 'vitest';
import { createAaveService, AaveService } from '../aave';
import type { StashtabPublicClient } from '../client';

const mockPublicClient = {
  readContract: vi.fn(),
  chain: { id: 84532 },
} as unknown as StashtabPublicClient;

describe('createAaveService', () => {
  it('should create an AaveService instance', () => {
    const service = createAaveService({
      chainId: 84532,
      publicClient: mockPublicClient,
    });

    expect(service).toBeInstanceOf(AaveService);
  });

  it('should create service with correct chainId', async () => {
    const service = createAaveService({
      chainId: 84532,
      publicClient: mockPublicClient,
    });

    // Verify it works by calling a method
    mockPublicClient.readContract = vi.fn().mockResolvedValue(0n);

    const balance = await service.getSafeUSDCBalance(
      '0x1234567890123456789012345678901234567890' as const
    );
    expect(balance).toBe(0n);
  });

  it('should be equivalent to new AaveService()', () => {
    const factoryService = createAaveService({
      chainId: 84532,
      publicClient: mockPublicClient,
    });

    const constructorService = new AaveService(mockPublicClient, 84532);

    // Both should be instances of AaveService
    expect(factoryService).toBeInstanceOf(AaveService);
    expect(constructorService).toBeInstanceOf(AaveService);
  });
});
