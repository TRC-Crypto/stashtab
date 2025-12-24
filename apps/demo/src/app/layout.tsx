import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stashtab Demo - Interactive Showcase',
  description:
    'Try Stashtab features in action. Interactive demo of the open source DeFi neobank stack.',
  openGraph: {
    title: 'Stashtab Demo - Interactive Showcase',
    description:
      'Try Stashtab features in action. Interactive demo of the open source DeFi neobank stack.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] antialiased">{children}</body>
    </html>
  );
}
