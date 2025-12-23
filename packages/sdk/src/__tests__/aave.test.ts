import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AaveService } from '../aave/AaveService';

// Mock the client
const mockPublicClient = {
  readContract: vi.fn(),
  chain: { id: 84532 },
} as any;

describe('AaveService', () => {
  let aaveService: AaveService;

  beforeEach(() => {
    vi.clearAllMocks();
    aaveService = new AaveService(mockPublicClient, 84532);
  });

  describe('calculateYieldPerSecond', () => {
    it('should return 0 for zero balance', () => {
      const result = aaveService.calculateYieldPerSecond(0n, 5.0);
      expect(result).toBe(0n);
    });

    it('should return 0 for zero APY', () => {
      const result = aaveService.calculateYieldPerSecond(1000000n, 0);
      expect(result).toBe(0n);
    });

    it('should calculate correct yield per second', () => {
      // 1000 USDC at 5% APY
      const balance = 1000_000000n; // 1000 USDC (6 decimals)
      const apy = 5.0; // 5% APY

      const yieldPerSecond = aaveService.calculateYieldPerSecond(balance, apy);

      // Expected: 1000 * 0.05 / 31536000 ≈ 0.00000158 USDC/second
      // In 6 decimals: ~1.58 units per second
      expect(yieldPerSecond).toBeGreaterThan(0n);

      // Verify rough magnitude (should be ~1-2 for this example)
      expect(yieldPerSecond).toBeLessThan(10n);
    });

    it('should scale with balance', () => {
      // Use larger balances to avoid integer division rounding to 0
      const smallBalance = 10000_000000n; // 10,000 USDC
      const largeBalance = 1000000_000000n; // 1,000,000 USDC
      const apy = 5.0;

      const smallYield = aaveService.calculateYieldPerSecond(smallBalance, apy);
      const largeYield = aaveService.calculateYieldPerSecond(largeBalance, apy);

      // Both should be non-zero
      expect(smallYield).toBeGreaterThan(0n);
      expect(largeYield).toBeGreaterThan(0n);

      // Large balance should yield ~100x more
      expect(largeYield).toBeGreaterThan(smallYield * 90n);
      expect(largeYield).toBeLessThan(smallYield * 110n);
    });
  });

  describe('formatBalance', () => {
    it('should format USDC balance correctly', () => {
      const balance = 1234_567890n; // 1234.567890 USDC
      const formatted = aaveService.formatBalance(balance, 2);
      // Uses toLocaleString which adds commas and rounds
      expect(formatted).toBe('1,234.57');
    });

    it('should handle zero balance', () => {
      const formatted = aaveService.formatBalance(0n, 2);
      expect(formatted).toBe('0.00');
    });

    it('should handle small amounts', () => {
      const balance = 1n; // 0.000001 USDC
      const formatted = aaveService.formatBalance(balance, 6);
      expect(formatted).toBe('0.000001');
    });
  });

  describe('getUserBalance', () => {
    it('should calculate yield earned correctly', async () => {
      const safeAddress = '0x1234567890123456789012345678901234567890' as const;
      const totalDeposited = 1000_000000n; // 1000 USDC deposited

      // Mock: Safe has 0 USDC, Aave has 1050 USDC (earned 50 USDC yield)
      mockPublicClient.readContract
        .mockResolvedValueOnce(0n) // USDC balance
        .mockResolvedValueOnce(1050_000000n); // aUSDC balance

      const balance = await aaveService.getUserBalance(safeAddress, totalDeposited);

      expect(balance.safeBalance).toBe(0n);
      expect(balance.aaveBalance).toBe(1050_000000n);
      expect(balance.totalBalance).toBe(1050_000000n);
      expect(balance.yieldEarned).toBe(50_000000n);
    });

    it('should handle no yield scenario', async () => {
      const safeAddress = '0x1234567890123456789012345678901234567890' as const;
      const totalDeposited = 1000_000000n;

      mockPublicClient.readContract.mockResolvedValueOnce(0n).mockResolvedValueOnce(1000_000000n); // Same as deposited

      const balance = await aaveService.getUserBalance(safeAddress, totalDeposited);

      expect(balance.yieldEarned).toBe(0n);
    });
  });
});
