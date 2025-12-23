import { z } from 'zod';

/**
 * Common Zod schemas used across the API
 */

/**
 * Ethereum address validation
 * Must be 0x followed by 40 hex characters
 */
export const AddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
  .transform((val) => val.toLowerCase() as `0x${string}`);

/**
 * BigInt amount as string
 * Must be a positive integer string (no decimals)
 */
export const AmountSchema = z
  .string()
  .regex(/^\d+$/, 'Amount must be a positive integer string')
  .refine((val) => BigInt(val) > 0n, 'Amount must be greater than 0');

/**
 * Pagination parameters
 */
export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, 'Page must be at least 1'),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
});

/**
 * Standard error response shape
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
  requestId: z.string().optional(),
});

/**
 * Standard success message response
 */
export const MessageResponseSchema = z.object({
  message: z.string(),
});

/**
 * Authorization header schema
 */
export const AuthHeaderSchema = z.object({
  authorization: z
    .string()
    .regex(/^Bearer .+$/, 'Authorization header must be Bearer token'),
});

// Type exports for use in route handlers
export type Address = z.infer<typeof AddressSchema>;
export type Amount = z.infer<typeof AmountSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

