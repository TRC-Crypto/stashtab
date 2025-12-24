/**
 * useYield Hook
 *
 * Hook for fetching yield rates and opportunities
 */

import { useState, useEffect } from 'react';
import type { Address } from 'viem';
import { useStashtabClient } from './useStashtabClient';

export interface UseYieldResult {
  apy: number | null;
  opportunities: Array<{
    protocol: string;
    apy: number;
    risk: string;
  }>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch yield rates and opportunities
 *
 * @example
 * ```tsx
 * import { useYield } from '@stashtab/ui/hooks';
 *
 * function YieldDisplay() {
 *   const { apy, opportunities } = useYield(usdcAddress);
 *
 *   return <div>Current APY: {apy}%</div>;
 * }
 * ```
 */
export function useYield(asset: Address | null): UseYieldResult {
  const client = useStashtabClient();
  const [apy, setApy] = useState<number | null>(null);
  const [opportunities, setOpportunities] = useState<UseYieldResult['opportunities']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    if (!asset) {
      setApy(null);
      setOpportunities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch yield rate from Aave
      const yieldRate = await client.yield.aave.getYieldRate();
      setApy(yieldRate.apyPercent);

      // Fetch opportunities from yield router
      const opps = await client.yield.router.getOpportunities(asset, client.publicClient);
      setOpportunities(
        opps.map((opp) => ({
          protocol: opp.protocol,
          apy: opp.apy,
          risk: opp.risk,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch yield data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    // Refresh every 60 seconds
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [asset, client.chainId]);

  return {
    apy,
    opportunities,
    loading,
    error,
    refresh,
  };
}
