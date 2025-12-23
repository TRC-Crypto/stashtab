'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { isAddress } from 'viem';
import { useAccount } from '@/hooks/useAccount';
import { formatUSDC, parseUSDC } from '@stashtab/config';

export default function WithdrawPage() {
  const { balance, withdraw, isLoading } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableBalance = balance?.totalBalance ?? 0n;
  const isValidAddress = recipient && isAddress(recipient);
  const amountBigInt = amount ? parseUSDC(amount) : 0n;
  const isValidAmount = amountBigInt > 0n && amountBigInt <= availableBalance;
  const canWithdraw = isValidAddress && isValidAmount && !isWithdrawing;

  const handleWithdraw = async () => {
    if (!canWithdraw) return;

    setIsWithdrawing(true);
    setError(null);
    setSuccess(false);

    try {
      await withdraw(amountBigInt, recipient as `0x${string}`);
      setSuccess(true);
      setRecipient('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleMaxClick = () => {
    if (availableBalance > 0n) {
      setAmount(formatUSDC(availableBalance, 6));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Withdraw</h1>
        <p className="text-zinc-400">Withdraw your USDC to an external wallet</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        {/* Balance Info */}
        <div className="mb-6 p-4 rounded-xl bg-surface-100">
          <p className="text-zinc-400 text-sm mb-1">Available to withdraw</p>
          <p className="text-2xl font-bold text-white font-mono">
            ${formatUSDC(availableBalance)}
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-400">Amount (USDC)</label>
            <button
              onClick={handleMaxClick}
              className="text-sm text-yield hover:text-yield-light transition-colors"
            >
              Max
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-yield transition-colors font-mono text-2xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">USDC</span>
          </div>
          {amount && amountBigInt > availableBalance && (
            <p className="text-red-400 text-sm mt-2">Insufficient balance</p>
          )}
        </div>

        {/* Recipient Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Destination Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-yield transition-colors font-mono text-sm"
          />
          {recipient && !isValidAddress && (
            <p className="text-red-400 text-sm mt-2">Invalid Ethereum address</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-sm">Withdrawal successful!</p>
          </div>
        )}

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={!canWithdraw}
          className="w-full py-4 rounded-xl bg-yield text-black font-semibold text-lg hover:bg-yield-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWithdrawing ? 'Withdrawing...' : 'Withdraw USDC'}
        </button>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 p-4 rounded-xl bg-surface-100 border border-zinc-800"
      >
        <p className="text-zinc-400 text-sm">
          Withdrawals are processed from Aave first, then transferred to your destination address.
          This may take a few seconds.
        </p>
      </motion.div>
    </div>
  );
}

