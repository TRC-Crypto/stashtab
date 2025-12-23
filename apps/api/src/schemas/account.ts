import { z } from 'zod';
import { AddressSchema, AmountSchema } from './common';

/**
 * Account endpoint schemas
 */

/**
 * Balance breakdown schema
 */
export const BalanceSchema = z.object({
  safeBalance: z.string().describe('USDC balance in Safe (raw units)'),
  aaveBalance: z.string().describe('aUSDC balance in Aave (raw units)'),
  totalBalance: z.string().describe('Total balance (raw units)'),
  totalDeposited: z.string().describe('Total amount deposited (raw units)'),
  yieldEarned: z.string().describe('Yield earned from Aave (raw units)'),
});

/**
 * Yield rate schema
 */
export const YieldRateSchema = z.object({
  apyPercent: z.number().describe('Current APY as percentage (e.g., 5.24)'),
  liquidityRate: z.string().describe('Raw liquidity rate from Aave'),
  lastUpdated: z.number().describe('Unix timestamp of last update'),
});

/**
 * Full account response schema
 */
export const AccountResponseSchema = z.object({
  userId: z.string().uuid(),
  safeAddress: AddressSchema,
  ownerAddress: AddressSchema,
  balance: BalanceSchema,
  yieldRate: YieldRateSchema,
});

/**
 * Balance-only response schema (for refresh endpoint)
 */
export const BalanceResponseSchema = z.object({
  balance: BalanceSchema,
  yieldRate: YieldRateSchema,
});

/**
 * Send request schema
 */
export const SendRequestSchema = z.object({
  to: AddressSchema.describe('Recipient Ethereum address'),
  amount: AmountSchema.describe('Amount to send in raw USDC units (6 decimals)'),
});

/**
 * Withdraw request schema
 */
export const WithdrawRequestSchema = z.object({
  to: AddressSchema.describe('Destination Ethereum address'),
  amount: AmountSchema.describe('Amount to withdraw in raw USDC units (6 decimals)'),
});

/**
 * Deposit request schema
 */
export const DepositRequestSchema = z.object({
  amount: AmountSchema.optional().describe('Amount to deposit (optional, defaults to full balance)'),
});

/**
 * Transaction initiated response
 */
export const TransactionInitiatedSchema = z.object({
  message: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  to: AddressSchema.optional(),
  amount: z.string().optional(),
  txHash: z.string().optional(),
  note: z.string().optional(),
});

// Type exports
export type Balance = z.infer<typeof BalanceSchema>;
export type YieldRate = z.infer<typeof YieldRateSchema>;
export type AccountResponse = z.infer<typeof AccountResponseSchema>;
export type BalanceResponse = z.infer<typeof BalanceResponseSchema>;
export type SendRequest = z.infer<typeof SendRequestSchema>;
export type WithdrawRequest = z.infer<typeof WithdrawRequestSchema>;
export type DepositRequest = z.infer<typeof DepositRequestSchema>;
export type TransactionInitiated = z.infer<typeof TransactionInitiatedSchema>;

