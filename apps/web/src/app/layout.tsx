import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

// Force dynamic rendering for all pages (required for Privy auth)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Stashtab - DeFi Neobank | Open Source Neobank-in-a-Box',
  description:
    'Open source DeFi neobank stack. Deposit, earn yield, send money—all on-chain, abstracted for everyone. Built with Next.js, React Native, Cloudflare Workers, Aave, and Safe.',
  keywords: [
    'defi',
    'neobank',
    'crypto',
    'web3',
    'ethereum',
    'aave',
    'safe',
    'base',
    'open-source',
    'react-native',
    'nextjs',
    'cloudflare',
    'crypto-banking',
    'smart-wallet',
    'yield-farming',
    'stablecoin',
  ],
  authors: [{ name: 'Stashtab' }],
  creator: 'Stashtab',
  publisher: 'Stashtab',
  metadataBase: new URL('https://github.com/TRC-Crypto/stashtab'),
  openGraph: {
    title: 'Stashtab - DeFi Neobank | Open Source Neobank-in-a-Box',
    description:
      'Open source DeFi neobank stack. Deposit, earn yield, send money—all on-chain, abstracted for everyone.',
    url: 'https://github.com/TRC-Crypto/stashtab',
    siteName: 'Stashtab',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stashtab - DeFi Neobank',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stashtab - DeFi Neobank | Open Source Neobank-in-a-Box',
    description:
      'Open source DeFi neobank stack. Deposit, earn yield, send money—all on-chain, abstracted for everyone.',
    images: ['/twitter-image.png'],
    creator: '@T4yl0rC',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  alternates: {
    canonical: 'https://github.com/TRC-Crypto/stashtab',
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
