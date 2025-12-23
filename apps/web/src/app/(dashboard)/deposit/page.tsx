'use client';

import { motion } from 'framer-motion';
import { DepositAddress } from '@/components/DepositAddress';
import { useAccount } from '@/hooks/useAccount';

export default function DepositPage() {
  const { safeAddress, isLoading } = useAccount();

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Deposit</h1>
        <p className="text-zinc-400">
          Send USDC to your account address to start earning yield
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DepositAddress address={safeAddress} isLoading={isLoading} />
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 glass rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">How it works</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yield/20 text-yield flex items-center justify-center font-semibold">
              1
            </span>
            <div>
              <p className="text-white font-medium">Send USDC</p>
              <p className="text-zinc-400 text-sm">
                Transfer USDC on Base network to the address above
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yield/20 text-yield flex items-center justify-center font-semibold">
              2
            </span>
            <div>
              <p className="text-white font-medium">Auto-deposit to Aave</p>
              <p className="text-zinc-400 text-sm">
                Your USDC is automatically supplied to Aave v3 to earn yield
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yield/20 text-yield flex items-center justify-center font-semibold">
              3
            </span>
            <div>
              <p className="text-white font-medium">Start earning</p>
              <p className="text-zinc-400 text-sm">
                Watch your balance grow in real-time on the dashboard
              </p>
            </div>
          </li>
        </ol>
      </motion.div>

      {/* Testnet Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
      >
        <p className="text-yellow-500 text-sm">
          <strong>Testnet Mode:</strong> This is running on Base Sepolia. Get test USDC from the{' '}
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Circle Faucet
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}

