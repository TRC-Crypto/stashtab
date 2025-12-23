'use client';

import { formatUSDC, getTransactionUrl } from '@stashtab/config';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'send' | 'receive';
  amount: bigint;
  timestamp: number;
  txHash?: string;
  to?: string;
  from?: string;
}

// Mock transactions for demo
const mockTransactions: Transaction[] = [];

export function TransactionList() {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

  if (mockTransactions.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-surface-200 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-zinc-400">No transactions yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            Deposit USDC to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {mockTransactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} chainId={chainId} />
        ))}
      </div>
    </div>
  );
}

function TransactionItem({
  transaction,
  chainId,
}: {
  transaction: Transaction;
  chainId: number;
}) {
  const { type, amount, timestamp, txHash } = transaction;

  const typeConfig = {
    deposit: { label: 'Deposit', icon: '↓', color: 'text-green-400' },
    withdraw: { label: 'Withdraw', icon: '↑', color: 'text-purple-400' },
    send: { label: 'Sent', icon: '↗', color: 'text-red-400' },
    receive: { label: 'Received', icon: '↙', color: 'text-green-400' },
  };

  const config = typeConfig[type];
  const isPositive = type === 'deposit' || type === 'receive';

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg bg-surface-200 flex items-center justify-center ${config.color}`}
        >
          {config.icon}
        </div>
        <div>
          <p className="text-white font-medium">{config.label}</p>
          <p className="text-zinc-500 text-sm">
            {new Date(timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-mono font-medium ${isPositive ? 'text-green-400' : 'text-white'}`}>
          {isPositive ? '+' : '-'}${formatUSDC(amount)}
        </p>
        {txHash && (
          <a
            href={getTransactionUrl(chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 text-xs hover:text-yield transition-colors"
          >
            View tx →
          </a>
        )}
      </div>
    </div>
  );
}

