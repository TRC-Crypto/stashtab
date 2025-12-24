import type { Address, Account } from 'viem';
import { describe, it, expect, vi } from 'vitest';
import type { StashtabPublicClient, StashtabWalletClient } from '../client';
import { detectAccountType } from '../core/accounts/detector';
import { createEOAAccount } from '../core/accounts/eoa';
import { createAccount, createAccountFromWallet } from '../core/accounts/factory';
import { createSafeAccount } from '../core/accounts/safe';

const mockPublicClient = {
  readContract: vi.fn(),
  getCode: vi.fn(),
  getTransactionCount: vi.fn(),
  chain: { id: 8453 },
} as unknown as StashtabPublicClient;

const mockWalletClient = {
  sendTransaction: vi.fn(),
  signMessage: vi.fn(),
  writeContract: vi.fn(),
  account: {
    address: '0x1234567890123456789012345678901234567890' as const,
    type: 'json-rpc' as const,
  },
} as unknown as StashtabWalletClient;

const mockAccount: Account = {
  address: '0x1234567890123456789012345678901234567890' as const,
  type: 'json-rpc',
};

describe('Account Abstraction', () => {
  describe('EOAAccount', () => {
    it('should create an EOA account', () => {
      const account = createEOAAccount({
        address: '0x1234567890123456789012345678901234567890' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        account: mockAccount,
      });

      expect(account.type).toBe('eoa');
      expect(account.address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should return true for isDeployed (EOA always deployed)', async () => {
      const account = createEOAAccount({
        address: '0x1234567890123456789012345678901234567890' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        account: mockAccount,
      });

      const deployed = await account.isDeployed();
      expect(deployed).toBe(true);
    });

    it('should return success for deploy (EOA no-op)', async () => {
      const account = createEOAAccount({
        address: '0x1234567890123456789012345678901234567890' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        account: mockAccount,
      });

      const result = await account.deploy();
      expect(result.success).toBe(true);
    });

    it('should get account info', async () => {
      mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(5);

      const account = createEOAAccount({
        address: '0x1234567890123456789012345678901234567890' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        account: mockAccount,
      });

      const info = await account.getInfo();
      expect(info.type).toBe('eoa');
      expect(info.deployed).toBe(true);
      expect(info.nonce).toBe(5n);
    });
  });

  describe('SafeAccount', () => {
    it('should create a Safe account', () => {
      const account = createSafeAccount({
        address: '0x0987654321098765432109876543210987654321' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        owners: ['0x1234567890123456789012345678901234567890' as Address],
        threshold: 1,
      });

      expect(account.type).toBe('safe');
    });

    it('should check if Safe is deployed', async () => {
      mockPublicClient.getCode = vi.fn().mockResolvedValue('0x1234');

      const account = createSafeAccount({
        address: '0x0987654321098765432109876543210987654321' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        owners: ['0x1234567890123456789012345678901234567890' as Address],
      });

      const deployed = await account.isDeployed();
      expect(deployed).toBe(true);
    });

    it('should return false if Safe not deployed', async () => {
      mockPublicClient.getCode = vi.fn().mockResolvedValue('0x');

      const account = createSafeAccount({
        address: '0x0987654321098765432109876543210987654321' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        owners: ['0x1234567890123456789012345678901234567890' as Address],
      });

      const deployed = await account.isDeployed();
      expect(deployed).toBe(false);
    });
  });

  describe('Account Factory', () => {
    it('should create account with auto-detection', async () => {
      mockPublicClient.getCode = vi.fn().mockResolvedValue('0x'); // EOA

      const account = await createAccount('auto', {
        address: '0x1234567890123456789012345678901234567890' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        account: mockAccount,
      });

      expect(account.type).toBe('eoa');
    });

    it('should create account from wallet', async () => {
      mockPublicClient.getCode = vi.fn().mockResolvedValue('0x'); // EOA

      const account = await createAccountFromWallet({
        address: '0x1234567890123456789012345678901234567890' as Address,
        chainId: 8453,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
        account: mockAccount,
      });

      expect(account.type).toBe('eoa');
    });
  });

  describe('Account Type Detection', () => {
    it('should detect EOA account', async () => {
      mockPublicClient.getCode = vi.fn().mockResolvedValue('0x');

      const type = await detectAccountType(
        '0x1234567890123456789012345678901234567890' as Address,
        mockPublicClient
      );

      expect(type).toBe('eoa');
    });

    it('should detect Safe account', async () => {
      mockPublicClient.getCode = vi.fn().mockResolvedValue('0x1234');
      mockPublicClient.readContract = vi.fn().mockResolvedValue([]); // getOwners returns empty array

      const type = await detectAccountType(
        '0x0987654321098765432109876543210987654321' as Address,
        mockPublicClient
      );

      expect(type).toBe('safe');
    });
  });
});
