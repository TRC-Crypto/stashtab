/**
 * Stashtab Provider
 *
 * React context provider for Stashtab SDK client
 * Provides zero-config access to all Stashtab services
 */

'use client';

import type { StashtabClient, StashtabClientConfig } from '@stashtab/sdk';
import { createStashtabClient } from '@stashtab/sdk';
import React, { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * Stashtab context
 */
const StashtabContext = createContext<StashtabClient | null>(null);

/**
 * Stashtab Provider Props
 */
export interface StashtabProviderProps {
  config: StashtabClientConfig;
  children: ReactNode;
}

/**
 * Stashtab Provider Component
 *
 * Wraps your app to provide Stashtab SDK client to all components
 *
 * @example
 * ```tsx
 * import { StashtabProvider } from '@stashtab/ui';
 *
 * function App() {
 *   return (
 *     <StashtabProvider config={{ chainId: 8453 }}>
 *       <YourApp />
 *     </StashtabProvider>
 *   );
 * }
 * ```
 */
export function StashtabProvider({ config, children }: StashtabProviderProps) {
  const client = useMemo(() => {
    return createStashtabClient(config);
  }, [config.chainId, config.rpcUrl, config.publicClient, config.walletClient, config.account]);

  return <StashtabContext.Provider value={client}>{children}</StashtabContext.Provider>;
}

/**
 * Hook to access Stashtab client
 *
 * @example
 * ```tsx
 * import { useStashtabClient } from '@stashtab/ui';
 *
 * function MyComponent() {
 *   const client = useStashtabClient();
 *   const apy = await client.yield.aave.getYieldRate();
 * }
 * ```
 */
export function useStashtabClient(): StashtabClient {
  const client = useContext(StashtabContext);

  if (!client) {
    throw new Error('useStashtabClient must be used within StashtabProvider');
  }

  return client;
}
