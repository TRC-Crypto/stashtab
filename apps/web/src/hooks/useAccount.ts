'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { Address } from 'viem';
import type { UserBalance, YieldRate } from '@stashtab/sdk';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface AccountState {
  safeAddress: Address | null;
  balance: UserBalance | null;
  yieldRate: YieldRate | null;
  isLoading: boolean;
  error: string | null;
}

export function useAccount() {
  const { user, authenticated, getAccessToken } = usePrivy();
  const [state, setState] = useState<AccountState>({
    safeAddress: null,
    balance: null,
    yieldRate: null,
    isLoading: true,
    error: null,
  });

  // Fetch account data
  const fetchAccount = useCallback(async () => {
    if (!authenticated) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${API_URL}/account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch account');
      }

      const data = await response.json();
      
      setState({
        safeAddress: data.safeAddress,
        balance: data.balance,
        yieldRate: data.yieldRate,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [authenticated, getAccessToken]);

  // Fetch balance only
  const refreshBalance = useCallback(async () => {
    if (!authenticated || !state.safeAddress) return;

    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${API_URL}/account/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      
      setState((prev) => ({
        ...prev,
        balance: data.balance,
        yieldRate: data.yieldRate,
      }));
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [authenticated, getAccessToken, state.safeAddress]);

  // Send USDC
  const send = useCallback(
    async (to: Address, amount: bigint) => {
      if (!authenticated) throw new Error('Not authenticated');

      const token = await getAccessToken();
      
      const response = await fetch(`${API_URL}/account/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, amount: amount.toString() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send');
      }

      // Refresh balance after send
      await refreshBalance();

      return response.json();
    },
    [authenticated, getAccessToken, refreshBalance]
  );

  // Withdraw USDC
  const withdraw = useCallback(
    async (amount: bigint, to: Address) => {
      if (!authenticated) throw new Error('Not authenticated');

      const token = await getAccessToken();
      
      const response = await fetch(`${API_URL}/account/withdraw`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount.toString(), to }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to withdraw');
      }

      // Refresh balance after withdraw
      await refreshBalance();

      return response.json();
    },
    [authenticated, getAccessToken, refreshBalance]
  );

  // Initial fetch
  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  // Periodic balance refresh
  useEffect(() => {
    if (!state.safeAddress) return;

    const interval = setInterval(refreshBalance, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [state.safeAddress, refreshBalance]);

  return {
    ...state,
    send,
    withdraw,
    refreshBalance,
    refetch: fetchAccount,
  };
}

