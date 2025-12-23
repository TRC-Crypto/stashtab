'use client';

import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { BalanceCard } from '@/components/BalanceCard';
import { EarningsTicker } from '@/components/EarningsTicker';
import { QuickActions } from '@/components/QuickActions';
import { TransactionList } from '@/components/TransactionList';
import { useAccount } from '@/hooks/useAccount';

export default function DashboardPage() {
  const { user } = usePrivy();
  const { balance, yieldRate, isLoading } = useAccount();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">
          Welcome back{user?.email?.address ? `, ${user.email.address.split('@')[0]}` : ''}
        </p>
      </motion.div>

      {/* Main Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <BalanceCard balance={balance} yieldRate={yieldRate} isLoading={isLoading} />
      </motion.div>

      {/* Earnings Ticker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <EarningsTicker
          balance={balance?.aaveBalance ?? 0n}
          apyPercent={yieldRate?.apyPercent ?? 0}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <QuickActions />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TransactionList />
      </motion.div>
    </div>
  );
}

