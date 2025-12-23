'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yield flex items-center justify-center">
              <span className="text-black font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-xl text-white">Stashtab</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/TRC-Crypto/stashtab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-yield text-black font-medium hover:bg-yield-light transition-colors"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your money.
              <br />
              <span className="text-yield">Always earning.</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              An open source DeFi neobank stack. Deposit USDC, earn yield automatically, send to
              anyone. No seed phrases, no complexity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl bg-yield text-black font-semibold text-lg hover:bg-yield-light transition-all hover:scale-105"
            >
              Get Started
            </Link>
            <a
              href="https://github.com/TRC-Crypto/stashtab"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl border border-zinc-700 text-white font-semibold text-lg hover:border-zinc-500 transition-all hover:scale-105"
            >
              View Source
            </a>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            <FeatureCard
              title="Instant Setup"
              description="Sign up with email or social login. No seed phrases to manage, no wallets to install."
              icon="⚡"
            />
            <FeatureCard
              title="Auto Yield"
              description="Your USDC is automatically deposited to Aave v3. Earn yield 24/7 without lifting a finger."
              icon="📈"
            />
            <FeatureCard
              title="Send Anywhere"
              description="Transfer to other users instantly or withdraw to any Ethereum address."
              icon="🚀"
            />
          </motion.div>
        </div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-4xl mx-auto mt-32"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">Built on Battle-Tested Infrastructure</h2>
          <div className="flex flex-wrap justify-center gap-8 text-zinc-400">
            <TechBadge name="Base L2" />
            <TechBadge name="Aave v3" />
            <TechBadge name="Safe" />
            <TechBadge name="Privy" />
            <TechBadge name="USDC" />
          </div>
        </motion.div>

        {/* Open Source Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-3xl mx-auto mt-32 glass rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">100% Open Source</h3>
          <p className="text-zinc-400 mb-6">
            No token. No VC. No waitlist. Just code. Fork it, deploy it, make it yours.
          </p>
          <a
            href="https://github.com/TRC-Crypto/stashtab"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-yield hover:text-yield-light transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Star on GitHub
          </a>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            Stashtab is open source software. Use at your own risk.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="/docs" className="hover:text-white transition-colors">
              Docs
            </a>
            <a
              href="https://github.com/TRC-Crypto/stashtab"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="glass rounded-2xl p-6 text-left hover:border-zinc-600 transition-colors">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm">{description}</p>
    </div>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <div className="px-4 py-2 rounded-full border border-zinc-700 text-sm hover:border-zinc-500 transition-colors">
      {name}
    </div>
  );
}

