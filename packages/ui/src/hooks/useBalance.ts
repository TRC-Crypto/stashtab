/**
 * useBalance Hook
 *
 * Hook for fetching and managing account balance
 */

import { useState, useEffect } from 'react';
import type { Address } from 'viem';
import { useStashtabClient } from './useStashtabClient';

export interface UseBalanceResult {
  balance: bigint | null;
  yieldEarned: bigint | null;
  totalBalance: bigint | null;
  apy: number | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch account balance and yield information
 *
 * @example
 * ```tsx
 * import { useBalance } from '@stashtab/ui/hooks';
 *
 * function BalanceDisplay() {
 *   const { balance, apy, loading } = useBalance(userAddress);
 *
 *   if (loading) return <div>Loading...</div>;
 *   return <div>Balance: {balance} USDC @ {apy}% APY</div>;
 * }
 * ```
 */
export function useBalance(address: Address | null): UseBalanceResult {
  const client = useStashtabClient();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [yieldEarned, setYieldEarned] = useState<bigint | null>(null);
  const [totalBalance, setTotalBalance] = useState<bigint | null>(null);
  const [apy, setApy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    if (!address) {
      setBalance(null);
      setYieldEarned(null);
      setTotalBalance(null);
      setApy(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch balance and yield rate
      const [balanceResult, yieldRate] = await Promise.all([
        client.yield.aave.getUserBalance(address, 0n),
        client.yield.aave.getYieldRate(),
      ]);

      setBalance(balanceResult.safeBalance);
      setYieldEarned(balanceResult.yieldEarned);
      setTotalBalance(balanceResult.totalBalance);
      setApy(yieldRate.apyPercent);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    // Refresh every 30 seconds
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [address, client.chainId]);

  return {
    balance,
    yieldEarned,
    totalBalance,
    apy,
    loading,
    error,
    refresh,
  };
}
