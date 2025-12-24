/**
 * YieldDisplay Component
 *
 * Displays current yield rate and APY
 */

'use client';

import React from 'react';
import type { Address } from 'viem';
import { useYield } from '../../hooks/useYield';

export interface YieldDisplayProps {
  asset: Address;
  showOpportunities?: boolean;
  className?: string;
}

/**
 * YieldDisplay Component
 *
 * Shows current APY and yield opportunities
 *
 * @example
 * ```tsx
 * import { YieldDisplay } from '@stashtab/ui/components';
 *
 * <YieldDisplay
 *   asset={usdcAddress}
 *   showOpportunities={true}
 * />
 * ```
 */
export function YieldDisplay({
  asset,
  showOpportunities = false,
  className = '',
}: YieldDisplayProps) {
  const { apy, opportunities, loading, error } = useYield(asset);

  if (loading) {
    return (
      <div className={className}>
        <div className="text-sm text-gray-500">Loading yield data...</div>
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
      {apy !== null && <div className="text-xl font-semibold">{apy.toFixed(2)}% APY</div>}
      {showOpportunities && opportunities.length > 0 && (
        <div className="mt-2">
          <div className="text-sm font-medium mb-1">Other Opportunities:</div>
          {opportunities.map((opp, idx) => (
            <div key={idx} className="text-sm text-gray-600">
              {opp.protocol}: {opp.apy.toFixed(2)}% ({opp.risk} risk)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
