import type { Address } from 'viem';
import { describe, it, expect, vi } from 'vitest';
import type { StashtabPublicClient, StashtabWalletClient } from '../client';
import { createMorphoService } from '../yield/morpho';

const mockPublicClient = {
  readContract: vi.fn(),
  getCode: vi.fn(),
  chain: { id: 8453 },
} as unknown as StashtabPublicClient;

const mockWalletClient = {
  writeContract: vi.fn(),
  account: {
    address: '0x1234567890123456789012345678901234567890' as const,
  },
} as unknown as StashtabWalletClient;

describe('createMorphoService', () => {
  it('should create a MorphoService instance', () => {
    const service = createMorphoService({
      chainId: 8453,
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
    });

    expect(service).toBeDefined();
    expect(typeof service.getPool).toBe('function');
    expect(typeof service.getPosition).toBe('function');
    expect(typeof service.getYieldRate).toBe('function');
  });

  it('should allow creation without walletClient for read-only operations', () => {
    const service = createMorphoService({
      chainId: 8453,
      publicClient: mockPublicClient,
    });

    expect(service).toBeDefined();
    expect(typeof service.getPool).toBe('function');
  });

  it('should throw error when walletClient is missing for write operations', async () => {
    const service = createMorphoService({
      chainId: 8453,
      publicClient: mockPublicClient,
    });

    const marketParams = {
      loanToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
      collateralToken: '0x4200000000000000000000000000000000000006' as Address,
      oracle: '0x0000000000000000000000000000000000000000' as Address,
      irm: '0x0000000000000000000000000000000000000000' as Address,
      lltv: 800000000000000000n,
    };

    await expect(service.supply(marketParams, 1000n)).rejects.toThrow(
      'walletClient is required for supply operations'
    );
  });

  it('should throw error when chain is not supported', () => {
    expect(() => {
      createMorphoService({
        chainId: 999999, // Non-existent chain
        publicClient: mockPublicClient,
      });
    }).toThrow('Unsupported chain ID');
  });
});
