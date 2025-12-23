'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { isAddress } from 'viem';
import { useAccount } from '@/hooks/useAccount';
import { formatUSDC, parseUSDC } from '@stashtab/config';

export default function SendPage() {
  const { balance, send } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableBalance = balance?.totalBalance ?? 0n;
  const isValidAddress = recipient && isAddress(recipient);
  const amountBigInt = amount ? parseUSDC(amount) : 0n;
  const isValidAmount = amountBigInt > 0n && amountBigInt <= availableBalance;
  const canSend = isValidAddress && isValidAmount && !isSending;

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      await send(recipient as `0x${string}`, amountBigInt);
      setSuccess(true);
      setRecipient('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  const handleMaxClick = () => {
    if (availableBalance > 0n) {
      setAmount(formatUSDC(availableBalance, 6));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Send</h1>
        <p className="text-zinc-400">Transfer USDC to any address</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        {/* Recipient Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Recipient Address</label>
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

        {/* Amount Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-400">Amount (USDC)</label>
            <button
              onClick={handleMaxClick}
              className="text-sm text-yield hover:text-yield-light transition-colors"
            >
              Max: ${formatUSDC(availableBalance)}
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
          {amount && !isValidAmount && amountBigInt > availableBalance && (
            <p className="text-red-400 text-sm mt-2">Insufficient balance</p>
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
            <p className="text-green-400 text-sm">Transfer successful!</p>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full py-4 rounded-xl bg-yield text-black font-semibold text-lg hover:bg-yield-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send USDC'}
        </button>
      </motion.div>
    </div>
  );
}
