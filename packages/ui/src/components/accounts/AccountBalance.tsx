/**
 * AccountBalance Component
 *
 * Displays account balance with yield earned
 */

'use client';

import React from 'react';
import type { Address } from 'viem';
import { useBalance } from '../../hooks/useBalance';

export interface AccountBalanceProps {
  address: Address;
  showYield?: boolean;
  className?: string;
}

/**
 * Format balance for display
 */
function formatBalance(balance: bigint | null, decimals: number = 6): string {
  if (balance === null) return '0.00';

  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const fraction = balance % divisor;

  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmed = fractionStr.replace(/\.?0+$/, '');

  return `${whole}.${trimmed}`;
}

/**
 * AccountBalance Component
 *
 * Displays the total balance and yield earned for an account
 *
 * @example
 * ```tsx
 * import { AccountBalance } from '@stashtab/ui/components';
 *
 * <AccountBalance
 *   address={userAddress}
 *   showYield={true}
 * />
 * ```
 */
export function AccountBalance({ address, showYield = true, className = '' }: AccountBalanceProps) {
  const { totalBalance, yieldEarned, apy, loading, error } = useBalance(address);

  if (loading) {
    return (
      <div className={className}>
        <div className="text-sm text-gray-500">Loading balance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="text-sm text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="text-2xl font-bold">{formatBalance(totalBalance)} USDC</div>
      {showYield && yieldEarned !== null && yieldEarned > 0n && (
        <div className="text-sm text-green-500">+{formatBalance(yieldEarned)} yield earned</div>
      )}
      {showYield && apy !== null && (
        <div className="text-sm text-gray-500">{apy.toFixed(2)}% APY</div>
      )}
    </div>
  );
}
