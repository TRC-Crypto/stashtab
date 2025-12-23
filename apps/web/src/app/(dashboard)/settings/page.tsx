'use client';

import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { getAddressUrl } from '@stashtab/config';

export default function SettingsPage() {
  const { user, logout } = usePrivy();
  const { safeAddress } = useAccount();
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400">Manage your account</p>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>

        <div className="space-y-4">
          {/* Email */}
          {user?.email && (
            <div>
              <p className="text-sm text-zinc-400 mb-1">Email</p>
              <p className="text-white">{user.email.address}</p>
            </div>
          )}

          {/* User ID */}
          <div>
            <p className="text-sm text-zinc-400 mb-1">User ID</p>
            <p className="text-white font-mono text-sm">{user?.id}</p>
          </div>

          {/* Safe Address */}
          {safeAddress && (
            <div>
              <p className="text-sm text-zinc-400 mb-1">Smart Account Address</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono text-sm truncate">{safeAddress}</p>
                <a
                  href={getAddressUrl(chainId, safeAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yield hover:text-yield-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Network Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Network</h2>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yield animate-pulse" />
          <span className="text-white">{chainId === 8453 ? 'Base Mainnet' : 'Base Sepolia'}</span>
          <span className="px-2 py-1 rounded-full bg-yield/20 text-yield text-xs">
            {chainId === 8453 ? 'Production' : 'Testnet'}
          </span>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 border border-red-500/20"
      >
        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Signing out will disconnect your session. Your funds remain safe in your smart account.
        </p>
        <button
          onClick={logout}
          className="px-6 py-3 rounded-xl border border-red-500/50 text-red-400 font-medium hover:bg-red-500/10 transition-colors"
        >
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}

