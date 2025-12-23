/**
 * Mock data for mobile app development
 * Replace with actual API calls when connecting to backend
 */

export interface UserAccount {
  id: string;
  email: string;
  safeAddress: string;
  balance: string;
  yieldEarned: string;
  apy: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'send' | 'receive';
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  address?: string;
  timestamp: string;
}

export const mockUser: UserAccount = {
  id: 'usr_1',
  email: 'user@example.com',
  safeAddress: '0x1234567890123456789012345678901234567890',
  balance: '5,127.45',
  yieldEarned: '127.45',
  apy: '5.24',
};

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    type: 'deposit',
    amount: '1,000.00',
    currency: 'USDC',
    status: 'completed',
    timestamp: '2024-12-22T14:30:00Z',
  },
  {
    id: 'tx_2',
    type: 'send',
    amount: '250.00',
    currency: 'USDC',
    status: 'completed',
    address: '0x9876...4321',
    timestamp: '2024-12-21T10:15:00Z',
  },
  {
    id: 'tx_3',
    type: 'receive',
    amount: '500.00',
    currency: 'USDC',
    status: 'completed',
    address: '0x5555...1111',
    timestamp: '2024-12-20T16:45:00Z',
  },
  {
    id: 'tx_4',
    type: 'withdrawal',
    amount: '100.00',
    currency: 'USDC',
    status: 'pending',
    address: '0x7777...3333',
    timestamp: '2024-12-22T15:00:00Z',
  },
];

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
