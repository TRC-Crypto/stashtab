import { z } from 'zod';
import { AddressSchema } from './common';

/**
 * Yield endpoint schemas
 */

/**
 * Yield rate response schema
 */
export const YieldRateResponseSchema = z.object({
  asset: z.string().describe('Asset symbol (e.g., USDC)'),
  chainId: z.number().describe('Chain ID'),
  apyPercent: z.number().describe('Current APY as percentage'),
  liquidityRate: z.string().describe('Raw liquidity rate from Aave (ray units)'),
  liquidityIndex: z.string().describe('Liquidity index from Aave'),
  lastUpdated: z.number().describe('Unix timestamp of last update'),
  aTokenAddress: AddressSchema.describe('aToken contract address'),
  poolAddress: AddressSchema.describe('Aave pool contract address'),
});

/**
 * Historical yield entry schema
 */
export const YieldHistoryEntrySchema = z.object({
  timestamp: z.number(),
  apyPercent: z.number(),
});

/**
 * Historical yield response schema
 */
export const YieldHistoryResponseSchema = z.object({
  asset: z.string(),
  chainId: z.number(),
  history: z.array(YieldHistoryEntrySchema),
  period: z.enum(['1d', '7d', '30d', '90d']),
});

/**
 * Yield history not implemented response
 */
export const YieldHistoryNotImplementedSchema = z.object({
  message: z.string(),
  note: z.string().optional(),
});

// Type exports
export type YieldRateResponse = z.infer<typeof YieldRateResponseSchema>;
export type YieldHistoryEntry = z.infer<typeof YieldHistoryEntrySchema>;
export type YieldHistoryResponse = z.infer<typeof YieldHistoryResponseSchema>;

