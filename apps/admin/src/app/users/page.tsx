"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import {
  mockUsers,
  formatCurrency,
  formatAddress,
  formatDate,
  type User,
} from "@/lib/mockData";

export default function UsersPage() {
  const router = useRouter();

  const columns = [
    {
      key: "email",
      header: "Email",
      render: (user: User) => (
        <span className="font-medium">{user.email}</span>
      ),
    },
    {
      key: "safeAddress",
      header: "Safe Address",
      render: (user: User) => (
        <span className="font-mono text-zinc-400">
          {formatAddress(user.safeAddress)}
        </span>
      ),
    },
    {
      key: "currentBalance",
      header: "Balance",
      render: (user: User) => (
        <span className="font-mono">
          {formatCurrency(user.currentBalance)}
        </span>
      ),
    },
    {
      key: "yieldEarned",
      header: "Yield Earned",
      render: (user: User) => (
        <span className="font-mono text-green-400">
          +{formatCurrency(user.yieldEarned)}
        </span>
      ),
    },
    {
      key: "kycStatus",
      header: "KYC Status",
      render: (user: User) => <StatusBadge status={user.kycStatus} />,
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user: User) => (
        <span className="text-zinc-400">{formatDate(user.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-zinc-400 mt-1">Manage your platform users</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search users..."
            className="px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
          <select className="px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent">
            <option value="">All KYC Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="not_started">Not Started</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-100 rounded-lg p-4 border border-surface-300">
          <p className="text-sm text-zinc-400">Total Users</p>
          <p className="text-xl font-semibold mt-1">{mockUsers.length}</p>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 border border-surface-300">
          <p className="text-sm text-zinc-400">KYC Approved</p>
          <p className="text-xl font-semibold mt-1 text-green-400">
            {mockUsers.filter((u) => u.kycStatus === "approved").length}
          </p>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 border border-surface-300">
          <p className="text-sm text-zinc-400">KYC Pending</p>
          <p className="text-xl font-semibold mt-1 text-yellow-400">
            {mockUsers.filter((u) => u.kycStatus === "pending").length}
          </p>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 border border-surface-300">
          <p className="text-sm text-zinc-400">Total Balance</p>
          <p className="text-xl font-semibold mt-1">
            {formatCurrency(
              mockUsers
                .reduce((sum, u) => sum + parseFloat(u.currentBalance), 0)
                .toFixed(2)
            )}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={mockUsers}
        keyField="id"
        onRowClick={(user) => router.push(`/users/${user.id}`)}
        emptyMessage="No users found"
      />
    </div>
  );
}

