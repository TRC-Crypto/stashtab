import type { Address } from 'viem';
import { getAddresses, formatUSDC, SECONDS_PER_YEAR, RAY } from '@stashtab/config';
import type { StashtabPublicClient } from '../client';
import type { UserBalance, YieldRate } from '../types';
import {
  getAaveUserPosition,
  getAaveReserveData,
  getCurrentAPY,
  getATokenBalance,
  getUSDCBalance,
} from './aaveOperations';

/**
 * Service for interacting with Aave v3 protocol
 */
export class AaveService {
  constructor(
    private publicClient: StashtabPublicClient,
    private chainId: number
  ) {}

  private get addresses() {
    return getAddresses(this.chainId);
  }

  /**
   * Get current yield rate
   */
  async getYieldRate(): Promise<YieldRate> {
    return getCurrentAPY(this.publicClient, this.chainId);
  }

  /**
   * Get user's complete balance breakdown
   */
  async getUserBalance(safeAddress: Address, totalDeposited: bigint): Promise<UserBalance> {
    const [safeBalance, aaveBalance] = await Promise.all([
      getUSDCBalance(this.publicClient, this.chainId, safeAddress),
      getATokenBalance(this.publicClient, this.chainId, safeAddress),
    ]);

    const totalBalance = safeBalance + aaveBalance;
    const yieldEarned = aaveBalance > totalDeposited ? aaveBalance - totalDeposited : 0n;

    return {
      safeBalance,
      aaveBalance,
      totalBalance,
      totalDeposited,
      yieldEarned,
    };
  }

  /**
   * Get aUSDC balance only
   */
  async getAavePosition(address: Address): Promise<bigint> {
    return getATokenBalance(this.publicClient, this.chainId, address);
  }

  /**
   * Get USDC balance in Safe
   */
  async getSafeUSDCBalance(safeAddress: Address): Promise<bigint> {
    return getUSDCBalance(this.publicClient, this.chainId, safeAddress);
  }

  /**
   * Calculate yield per second based on current APY and balance
   */
  calculateYieldPerSecond(balance: bigint, apyPercent: number): bigint {
    if (balance === 0n || apyPercent === 0) return 0n;

    // Convert APY to per-second rate
    // yield_per_second = balance * (apy / 100) / seconds_per_year
    const apyBigInt = BigInt(Math.floor(apyPercent * 1e6)); // 6 decimal precision
    const yieldPerSecond = (balance * apyBigInt) / (BigInt(SECONDS_PER_YEAR) * 1_000_000n);

    return yieldPerSecond;
  }

  /**
   * Format balance for display
   */
  formatBalance(amount: bigint, showDecimals = 2): string {
    return formatUSDC(amount, showDecimals);
  }
}

