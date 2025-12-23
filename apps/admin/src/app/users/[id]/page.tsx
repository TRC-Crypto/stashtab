'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import {
  getUser,
  getUserTransactions,
  formatCurrency,
  formatDate,
  type Transaction,
} from '@/lib/mockData';

export default function UserDetailPage() {
  const params = useParams();
  const user = getUser(params.id as string);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-2xl font-semibold mb-4">User Not Found</h1>
        <p className="text-zinc-400 mb-6">The user you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/users"
          className="px-4 py-2 bg-accent text-black rounded-lg hover:bg-accent-light"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  const transactions = getUserTransactions(user.id);

  const transactionColumns = [
    {
      key: 'type',
      header: 'Type',
      render: (tx: Transaction) => <span className="capitalize">{tx.type}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx: Transaction) => <span className="font-mono">{formatCurrency(tx.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (tx: Transaction) => <StatusBadge status={tx.status} />,
    },
    {
      key: 'txHash',
      header: 'Tx Hash',
      render: (tx: Transaction) =>
        tx.txHash ? (
          <a
            href={`https://basescan.org/tx/${tx.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-accent hover:text-accent-light"
          >
            {tx.txHash.slice(0, 10)}...
          </a>
        ) : (
          <span className="text-zinc-500">-</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (tx: Transaction) => (
        <span className="text-zinc-400">{formatDate(tx.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/users" className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{user.email}</h1>
          <p className="text-zinc-400 mt-1">User Details</p>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-surface-100 rounded-xl p-6 border border-surface-300">
          <h3 className="text-sm text-zinc-400 mb-4">Balance Overview</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Current Balance</p>
              <p className="text-2xl font-semibold">{formatCurrency(user.currentBalance)}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Deposited</p>
                <p className="font-medium">{formatCurrency(user.totalDeposited)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Yield Earned</p>
                <p className="font-medium text-green-400">+{formatCurrency(user.yieldEarned)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Card */}
        <div className="bg-surface-100 rounded-xl p-6 border border-surface-300">
          <h3 className="text-sm text-zinc-400 mb-4">Addresses</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Safe Address</p>
              <a
                href={`https://basescan.org/address/${user.safeAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-accent hover:text-accent-light break-all"
              >
                {user.safeAddress}
              </a>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Owner Address</p>
              <a
                href={`https://basescan.org/address/${user.ownerAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-accent hover:text-accent-light break-all"
              >
                {user.ownerAddress}
              </a>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-surface-100 rounded-xl p-6 border border-surface-300">
          <h3 className="text-sm text-zinc-400 mb-4">Account Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">KYC Status</p>
              <StatusBadge status={user.kycStatus} />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Joined</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Last Active</p>
              <p className="font-medium">{formatDate(user.lastActiveAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-lg text-sm transition-colors">
          Request KYC Review
        </button>
        <button className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-lg text-sm transition-colors">
          View on Explorer
        </button>
        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
          Suspend User
        </button>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        <DataTable
          columns={transactionColumns}
          data={transactions}
          keyField="id"
          emptyMessage="No transactions yet"
        />
      </div>
    </div>
  );
}
