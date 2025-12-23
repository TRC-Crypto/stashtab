import { z } from 'zod';
import { AddressSchema } from './common';

/**
 * Auth endpoint schemas
 */

/**
 * Signup response schema
 */
export const SignupResponseSchema = z.object({
  message: z.string(),
  userId: z.string().uuid(),
  safeAddress: AddressSchema,
  ownerAddress: AddressSchema,
});

/**
 * User already exists response
 */
export const UserExistsResponseSchema = z.object({
  message: z.literal('User already exists'),
  userId: z.string().uuid(),
  safeAddress: AddressSchema,
});

// Type exports
export type SignupResponse = z.infer<typeof SignupResponseSchema>;
export type UserExistsResponse = z.infer<typeof UserExistsResponseSchema>;

