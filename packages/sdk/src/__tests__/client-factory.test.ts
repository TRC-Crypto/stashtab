import type { Account } from 'viem';
import { describe, it, expect, vi } from 'vitest';
import { createStashtabClient } from '../client-factory';

const mockPublicClient = {
  readContract: vi.fn(),
  chain: { id: 8453 },
} as any;

const mockAccount: Account = {
  address: '0x1234567890123456789012345678901234567890' as const,
  type: 'json-rpc',
};

describe('createStashtabClient', () => {
  it('should create a client with all services', () => {
    const client = createStashtabClient({
      chainId: 8453,
      publicClient: mockPublicClient,
    });

    expect(client).toBeDefined();
    expect(client.chainId).toBe(8453);
    expect(client.publicClient).toBe(mockPublicClient);

    // Check yield services
    expect(client.yield.aave).toBeDefined();
    expect(client.yield.morpho).toBeDefined();
    expect(client.yield.router).toBeDefined();

    // Check payment services
    expect(client.payments.streaming).toBeDefined();
    expect(client.payments.batch).toBeDefined();
    expect(client.payments.transfer).toBeDefined();

    // Check compliance
    expect(client.compliance.sanctions).toBeDefined();
  });

  it('should create walletClient from account', () => {
    const client = createStashtabClient({
      chainId: 8453,
      account: mockAccount,
    });

    expect(client.walletClient).toBeDefined();
    expect(client.accounts.safe).not.toBeNull();
  });

  it('should allow read-only operations without wallet', async () => {
    const client = createStashtabClient({
      chainId: 8453,
      publicClient: mockPublicClient,
    });

    // Should be able to read
    expect(client.yield.aave).toBeDefined();
    expect(client.compliance.sanctions).toBeDefined();

    // Safe should be null without wallet
    expect(client.accounts.safe).toBeNull();
  });

  it('should use provided publicClient if given', () => {
    const customPublicClient = {
      readContract: vi.fn(),
      chain: { id: 8453 },
    } as any;

    const client = createStashtabClient({
      chainId: 8453,
      publicClient: customPublicClient,
    });

    expect(client.publicClient).toBe(customPublicClient);
  });
});
