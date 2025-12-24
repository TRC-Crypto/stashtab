/**
 * usePayments Hook
 *
 * Hook for payment operations
 */

import type { TransactionResult } from '@stashtab/sdk/core/types';
import { useState, useCallback } from 'react';
import type { Address } from 'viem';
import { useStashtabClient } from './useStashtabClient';

export interface UsePaymentsResult {
  sending: boolean;
  error: Error | null;
  send: (to: Address, amount: bigint, token?: Address) => Promise<TransactionResult | null>;
}

/**
 * Hook for sending payments
 *
 * @example
 * ```tsx
 * import { usePayments } from '@stashtab/ui/hooks';
 *
 * function SendButton() {
 *   const { send, sending } = usePayments();
 *
 *   const handleSend = async () => {
 *     const result = await send(recipientAddress, 1000n);
 *     if (result?.success) {
 *       console.log('Sent!', result.txHash);
 *     }
 *   };
 *
 *   return <button onClick={handleSend} disabled={sending}>Send</button>;
 * }
 * ```
 */
export function usePayments(): UsePaymentsResult {
  const client = useStashtabClient();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(
    async (_to: Address, _amount: bigint, _token?: Address): Promise<TransactionResult | null> => {
      if (!client.walletClient) {
        setError(new Error('Wallet client not available. Connect a wallet first.'));
        return null;
      }

      setSending(true);
      setError(null);

      try {
        // For now, this is a placeholder
        // In production, you'd use account abstraction to execute the transfer
        throw new Error('Payment execution not yet implemented. Use account abstraction directly.');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Payment failed');
        setError(error);
        return { success: false, error: error.message };
      } finally {
        setSending(false);
      }
    },
    [client]
  );

  return {
    sending,
    error,
    send,
  };
}
