'use client';

import { formatUSDC } from '@stashtab/config';
import type { UserBalance, YieldRate } from '@stashtab/sdk';

interface BalanceCardProps {
  balance: UserBalance | null;
  yieldRate: YieldRate | null;
  isLoading: boolean;
}

export function BalanceCard({ balance, yieldRate, isLoading }: BalanceCardProps) {
  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8 animate-pulse">
        <div className="h-4 w-24 bg-surface-300 rounded mb-4" />
        <div className="h-12 w-48 bg-surface-300 rounded mb-6" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-surface-300 rounded" />
          <div className="h-16 bg-surface-300 rounded" />
          <div className="h-16 bg-surface-300 rounded" />
        </div>
      </div>
    );
  }

  const totalBalance = balance?.totalBalance ?? 0n;
  const yieldEarned = balance?.yieldEarned ?? 0n;
  const apy = yieldRate?.apyPercent ?? 0;

  return (
    <div className="glass rounded-2xl p-8">
      {/* Total Balance */}
      <div className="mb-6">
        <p className="text-zinc-400 text-sm mb-2">Total Balance</p>
        <h2 className="text-5xl font-bold text-white font-mono">
          ${formatUSDC(totalBalance)}
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Yield Earned */}
        <div className="bg-surface-100 rounded-xl p-4">
          <p className="text-zinc-400 text-xs mb-1">Yield Earned</p>
          <p className="text-yield font-semibold font-mono text-lg">
            +${formatUSDC(yieldEarned)}
          </p>
        </div>

        {/* Current APY */}
        <div className="bg-surface-100 rounded-xl p-4">
          <p className="text-zinc-400 text-xs mb-1">Current APY</p>
          <p className="text-white font-semibold text-lg">{apy.toFixed(2)}%</p>
        </div>

        {/* In Aave */}
        <div className="bg-surface-100 rounded-xl p-4">
          <p className="text-zinc-400 text-xs mb-1">Earning Yield</p>
          <p className="text-white font-semibold font-mono text-lg">
            ${formatUSDC(balance?.aaveBalance ?? 0n)}
          </p>
        </div>
      </div>
    </div>
  );
}

