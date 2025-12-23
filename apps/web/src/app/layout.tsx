import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

// Force dynamic rendering for all pages (required for Privy auth)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Stashtab - DeFi Neobank',
  description: 'Deposit, earn yield, send money—all on-chain, abstracted for everyone.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

