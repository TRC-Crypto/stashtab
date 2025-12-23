import type { Address } from 'viem';

/**
 * Privy user information extracted from token
 */
export interface PrivyUser {
  userId: string;
  walletAddress?: Address;
  email?: string;
  createdAt: number;
}

/**
 * Verify a Privy access token and extract user info
 * This should be called on the backend with the Privy server SDK
 *
 * @param token - The Privy access token from the frontend
 * @param appSecret - Your Privy app secret (never expose this on frontend!)
 * @param appId - Your Privy app ID
 */
export async function verifyPrivyToken(
  _token: string,
  _appSecret: string,
  _appId: string
): Promise<PrivyUser | null> {
  // This is a placeholder - actual implementation uses @privy-io/server-auth
  // The real verification happens in the API using the Privy server SDK
  //
  // Example usage in Cloudflare Worker:
  // import { PrivyClient } from '@privy-io/server-auth';
  // const privy = new PrivyClient(appId, appSecret);
  // const claims = await privy.verifyAuthToken(token);

  throw new Error('verifyPrivyToken should only be called on the server side');
}

/**
 * Extract wallet address from Privy user
 */
export function getWalletFromPrivyUser(user: PrivyUser): Address | null {
  return user.walletAddress ?? null;
}
