import { DataTable } from '@/components/DataTable';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  mockDashboardStats,
  mockTransactions,
  formatCurrency,
  formatDate,
  type Transaction,
} from '@/lib/mockData';

export default function DashboardPage() {
  const recentTransactions = mockTransactions.slice(0, 5);

  const transactionColumns = [
    {
      key: 'userEmail',
      header: 'User',
    },
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
      key: 'createdAt',
      header: 'Time',
      render: (tx: Transaction) => (
        <span className="text-zinc-400">{formatDate(tx.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Overview of your neobank platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={mockDashboardStats.totalUsers.toLocaleString()}
          change={`+${mockDashboardStats.newUsersToday} today`}
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Total Value Locked"
          value={`$${mockDashboardStats.tvl}`}
          change="+8.2% this week"
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Current APY"
          value={`${mockDashboardStats.apy}%`}
          change="Aave v3 Base"
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
        <StatsCard
          title="Transactions Today"
          value={mockDashboardStats.transactionsToday.toString()}
          change="+12% vs yesterday"
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
      </div>

      {/* Volume Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Deposits"
          value={`$${mockDashboardStats.totalDeposits}`}
          change="All time"
          changeType="neutral"
        />
        <StatsCard
          title="Total Withdrawals"
          value={`$${mockDashboardStats.totalWithdrawals}`}
          change="All time"
          changeType="neutral"
        />
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <a href="/transactions" className="text-accent hover:text-accent-light text-sm">
            View all →
          </a>
        </div>
        <DataTable columns={transactionColumns} data={recentTransactions} keyField="id" />
      </div>
    </div>
  );
}
