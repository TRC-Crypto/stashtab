/**
 * SendForm Component
 *
 * Form for sending payments
 */

'use client';

import React, { useState } from 'react';
import type { Address } from 'viem';
import { isAddress } from 'viem';
import { usePayments } from '../../hooks/usePayments';

export interface SendFormProps {
  from: Address;
  defaultToken?: Address;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * SendForm Component
 *
 * Form for sending payments with validation
 *
 * @example
 * ```tsx
 * import { SendForm } from '@stashtab/ui/components';
 *
 * <SendForm
 *   from={userAddress}
 *   defaultToken={usdcAddress}
 *   onSuccess={(txHash) => console.log('Sent!', txHash)}
 * />
 * ```
 */
export function SendForm({
  from: _from,
  defaultToken,
  onSuccess,
  onError,
  className = '',
}: SendFormProps) {
  const { send, sending, error } = usePayments();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(defaultToken || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate recipient address
    if (!isAddress(recipient)) {
      setValidationError('Invalid recipient address');
      return;
    }

    // Validate amount
    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e6)); // Assuming 6 decimals
    if (amountBigInt <= 0n) {
      setValidationError('Amount must be greater than 0');
      return;
    }

    // Validate token
    if (!token || !isAddress(token)) {
      setValidationError('Invalid token address');
      return;
    }

    try {
      const result = await send(recipient as Address, amountBigInt, token as Address);

      if (result?.success && result.txHash) {
        onSuccess?.(result.txHash);
        setRecipient('');
        setAmount('');
      } else {
        const error = new Error(result?.error || 'Send failed');
        setValidationError(error.message);
        onError?.(error);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Send failed');
      setValidationError(error.message);
      onError?.(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-1">Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <input
          type="number"
          step="0.000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {!defaultToken && (
        <div>
          <label className="block text-sm font-medium mb-1">Token Address</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
      )}

      {(error || validationError) && (
        <div className="text-sm text-red-500">{error?.message || validationError}</div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
