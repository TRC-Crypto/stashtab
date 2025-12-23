'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { base, baseSepolia } from 'viem/chains';
import { ToastProvider } from '@/components/Toast';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

export function Providers({ children }: { children: React.ReactNode }) {
  const chain = CHAIN_ID === 8453 ? base : baseSepolia;

  // During build time without Privy app ID, render children without Privy
  // This allows static generation to complete
  if (!PRIVY_APP_ID) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#00d974',
          logo: '/logo.svg',
          showWalletLoginFirst: false,
        },
        loginMethods: ['email', 'google', 'apple'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: chain,
        supportedChains: [base, baseSepolia],
      }}
    >
      <ToastProvider>{children}</ToastProvider>
    </PrivyProvider>
  );
}

