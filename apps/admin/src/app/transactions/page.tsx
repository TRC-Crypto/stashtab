"use client";

import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import {
  mockTransactions,
  formatCurrency,
  formatDate,
  type Transaction,
} from "@/lib/mockData";

export default function TransactionsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTransactions = mockTransactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (tx: Transaction) => (
        <span className="font-mono text-zinc-400">{tx.id}</span>
      ),
    },
    {
      key: "userEmail",
      header: "User",
      render: (tx: Transaction) => (
        <span className="font-medium">{tx.userEmail}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (tx: Transaction) => (
        <span className={`capitalize px-2 py-1 rounded text-xs font-medium ${
          tx.type === "deposit" ? "bg-green-500/20 text-green-400" :
          tx.type === "withdrawal" ? "bg-orange-500/20 text-orange-400" :
          tx.type === "send" ? "bg-blue-500/20 text-blue-400" :
          tx.type === "receive" ? "bg-purple-500/20 text-purple-400" :
          "bg-zinc-500/20 text-zinc-400"
        }`}>
          {tx.type}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (tx: Transaction) => (
        <span className="font-mono font-medium">
          {formatCurrency(tx.amount)} {tx.currency}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (tx: Transaction) => <StatusBadge status={tx.status} />,
    },
    {
      key: "txHash",
      header: "Tx Hash",
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
      key: "createdAt",
      header: "Date",
      render: (tx: Transaction) => (
        <span className="text-zinc-400">{formatDate(tx.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-zinc-400 mt-1">View all platform transactions</p>
        </div>
        <button className="px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg text-sm font-medium transition-colors">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
          <option value="send">Sends</option>
          <option value="receive">Receives</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="text"
          placeholder="Search by user or tx hash..."
          className="px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent flex-1 min-w-[200px]"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-100 rounded-lg p-4 border border-surface-300">
          <p className="text-sm text-zinc-400">Total Transactions</p>
          <p className="text-xl font-semibold mt-1">{filteredTransactions.length}</p>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 border border-surface-300">
          <p className="text-sm text-zinc-400">Completed</p>
          <p className="text-xl font-semibold mt-1 text-green-400">
            {filteredTransactions.filter((t) => t.status === "completed").length}
          </p>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 border border-surface-300">
          <p className="text-sm text-zinc-400">Pending</p>
          <p className="text-xl font-semibold mt-1 text-yellow-400">
            {filteredTransactions.filter((t) => t.status === "pending").length}
          </p>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 border border-surface-300">
          <p className="text-sm text-zinc-400">Failed</p>
          <p className="text-xl font-semibold mt-1 text-red-400">
            {filteredTransactions.filter((t) => t.status === "failed").length}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        keyField="id"
        emptyMessage="No transactions found"
      />
    </div>
  );
}

