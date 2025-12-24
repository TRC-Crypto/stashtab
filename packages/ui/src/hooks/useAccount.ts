/**
 * useAccount Hook
 *
 * Hook for managing account state and operations
 */

import type { AccountInfo } from '@stashtab/sdk/core/accounts';
import { useState, useEffect } from 'react';
import type { Address } from 'viem';
import { useStashtabClient } from './useStashtabClient';

export interface UseAccountResult {
  address: Address | null;
  info: AccountInfo | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage account information
 *
 * @example
 * ```tsx
 * import { useAccount } from '@stashtab/ui/hooks';
 *
 * function AccountDisplay() {
 *   const { address, info, loading } = useAccount(userAddress);
 *
 *   if (loading) return <div>Loading...</div>;
 *   return <div>Account: {address}</div>;
 * }
 * ```
 */
export function useAccount(address: Address | null): UseAccountResult {
  const client = useStashtabClient();
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    if (!address) {
      setInfo(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, we'll need to detect and get account info
      // This is a placeholder - in production, you'd use account abstraction
      setInfo({
        address,
        type: 'eoa',
        chainId: client.chainId,
        deployed: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch account info'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [address, client.chainId]);

  return {
    address,
    info,
    loading,
    error,
    refresh,
  };
}
