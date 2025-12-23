/**
 * Mock data for admin dashboard development
 * Replace with actual API calls when connecting to backend
 */

export interface User {
  id: string;
  email: string;
  safeAddress: string;
  ownerAddress: string;
  totalDeposited: string;
  currentBalance: string;
  yieldEarned: string;
  kycStatus: "not_started" | "pending" | "approved" | "declined";
  createdAt: string;
  lastActiveAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: "deposit" | "withdrawal" | "send" | "receive" | "yield";
  amount: string;
  currency: string;
  status: "pending" | "completed" | "failed";
  txHash?: string;
  toAddress?: string;
  fromAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: string;
  totalWithdrawals: string;
  tvl: string;
  apy: string;
  newUsersToday: number;
  transactionsToday: number;
}

// Mock users
export const mockUsers: User[] = [
  {
    id: "usr_1",
    email: "alice@example.com",
    safeAddress: "0x1234567890123456789012345678901234567890",
    ownerAddress: "0xabc1234567890123456789012345678901234567",
    totalDeposited: "5000.00",
    currentBalance: "5127.45",
    yieldEarned: "127.45",
    kycStatus: "approved",
    createdAt: "2024-01-15T10:30:00Z",
    lastActiveAt: "2024-12-22T14:30:00Z",
  },
  {
    id: "usr_2",
    email: "bob@example.com",
    safeAddress: "0x2345678901234567890123456789012345678901",
    ownerAddress: "0xdef2345678901234567890123456789012345678",
    totalDeposited: "10000.00",
    currentBalance: "10312.88",
    yieldEarned: "312.88",
    kycStatus: "approved",
    createdAt: "2024-02-20T15:45:00Z",
    lastActiveAt: "2024-12-21T09:15:00Z",
  },
  {
    id: "usr_3",
    email: "carol@example.com",
    safeAddress: "0x3456789012345678901234567890123456789012",
    ownerAddress: "0x1233456789012345678901234567890123456789",
    totalDeposited: "2500.00",
    currentBalance: "2543.21",
    yieldEarned: "43.21",
    kycStatus: "pending",
    createdAt: "2024-11-10T08:00:00Z",
    lastActiveAt: "2024-12-20T16:45:00Z",
  },
  {
    id: "usr_4",
    email: "dave@example.com",
    safeAddress: "0x4567890123456789012345678901234567890123",
    ownerAddress: "0x4564567890123456789012345678901234567890",
    totalDeposited: "500.00",
    currentBalance: "506.78",
    yieldEarned: "6.78",
    kycStatus: "not_started",
    createdAt: "2024-12-01T12:00:00Z",
    lastActiveAt: "2024-12-22T10:00:00Z",
  },
  {
    id: "usr_5",
    email: "eve@example.com",
    safeAddress: "0x5678901234567890123456789012345678901234",
    ownerAddress: "0x7895678901234567890123456789012345678901",
    totalDeposited: "25000.00",
    currentBalance: "25892.15",
    yieldEarned: "892.15",
    kycStatus: "approved",
    createdAt: "2024-03-05T09:30:00Z",
    lastActiveAt: "2024-12-22T08:00:00Z",
  },
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "tx_1",
    userId: "usr_1",
    userEmail: "alice@example.com",
    type: "deposit",
    amount: "1000.00",
    currency: "USDC",
    status: "completed",
    txHash: "0xabc123...",
    createdAt: "2024-12-22T14:30:00Z",
  },
  {
    id: "tx_2",
    userId: "usr_2",
    userEmail: "bob@example.com",
    type: "withdrawal",
    amount: "500.00",
    currency: "USDC",
    status: "completed",
    txHash: "0xdef456...",
    toAddress: "0x999...",
    createdAt: "2024-12-22T12:15:00Z",
  },
  {
    id: "tx_3",
    userId: "usr_3",
    userEmail: "carol@example.com",
    type: "send",
    amount: "250.00",
    currency: "USDC",
    status: "completed",
    txHash: "0xghi789...",
    toAddress: "0x888...",
    createdAt: "2024-12-22T11:00:00Z",
  },
  {
    id: "tx_4",
    userId: "usr_5",
    userEmail: "eve@example.com",
    type: "deposit",
    amount: "5000.00",
    currency: "USDC",
    status: "pending",
    createdAt: "2024-12-22T15:00:00Z",
  },
  {
    id: "tx_5",
    userId: "usr_4",
    userEmail: "dave@example.com",
    type: "deposit",
    amount: "100.00",
    currency: "USDC",
    status: "failed",
    createdAt: "2024-12-22T10:30:00Z",
  },
];

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalDeposits: "2,450,000.00",
  totalWithdrawals: "890,000.00",
  tvl: "1,560,000.00",
  apy: "5.24",
  newUsersToday: 23,
  transactionsToday: 156,
};

// Helper functions
export function getUser(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getUserTransactions(userId: string): Transaction[] {
  return mockTransactions.filter((t) => t.userId === userId);
}

export function formatCurrency(amount: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(amount));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

