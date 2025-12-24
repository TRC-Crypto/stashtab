import type { Address } from 'viem';
import { describe, it, expect, vi } from 'vitest';
import type { StashtabPublicClient } from '../client';
import { createSanctionsScreeningService } from '../compliance/sanctions';

const _mockPublicClient = {
  readContract: vi.fn(),
  chain: { id: 8453 },
} as unknown as StashtabPublicClient;

describe('createSanctionsScreeningService', () => {
  it('should create a SanctionsScreeningService instance', () => {
    const service = createSanctionsScreeningService({
      chainId: 8453,
    });

    expect(service).toBeDefined();
    expect(typeof service.checkAddress).toBe('function');
    expect(typeof service.checkAddresses).toBe('function');
    expect(typeof service.validateForTransaction).toBe('function');
  });

  it('should check address without API key (development mode)', async () => {
    const service = createSanctionsScreeningService({
      chainId: 8453,
    });

    const result = await service.checkAddress(
      '0x1234567890123456789012345678901234567890' as Address
    );

    expect(result).toBeDefined();
    expect(result.isSanctioned).toBe(false);
    expect(result.riskLevel).toBe('none');
    expect(result.checkedAt).toBeGreaterThan(0);
  });

  it('should validate transaction without blocking in non-strict mode', async () => {
    const service = createSanctionsScreeningService({
      chainId: 8453,
    });

    const validation = await service.validateForTransaction(
      '0x1234567890123456789012345678901234567890' as Address
    );

    expect(validation.allowed).toBe(true);
    expect(validation.checkResult).toBeDefined();
  });

  it('should handle bulk address checking', async () => {
    const service = createSanctionsScreeningService({
      chainId: 8453,
    });

    const addresses = [
      '0x1234567890123456789012345678901234567890',
      '0x0987654321098765432109876543210987654321',
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    ] as Address[];

    const result = await service.checkAddresses({ addresses });

    expect(result.totalChecked).toBe(3);
    expect(result.sanctionedCount).toBe(0);
    expect(result.results.size).toBe(3);
  });
});
