import { PrivyClient } from '@privy-io/server-auth';
import { getChain } from '@stashtab/config';
import { Hono } from 'hono';
import type { Address } from 'viem';
import { AuthenticationError, DatabaseError, ErrorCode } from '../errors';
import { strictRateLimit } from '../middleware';
import type { Env, User } from '../types';

const authRoutes = new Hono<{ Bindings: Env }>();

// Apply strict rate limiting to auth routes
authRoutes.use('*', strictRateLimit);

/**
 * POST /auth/signup
 * Verify Privy token and create user account with Safe
 */
authRoutes.post('/signup', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError(
      'Missing or invalid authorization header',
      ErrorCode.AUTH_MISSING_TOKEN
    );
  }

  const token = authHeader.slice(7);

  // Verify Privy token
  const privy = new PrivyClient(c.env.PRIVY_APP_ID, c.env.PRIVY_APP_SECRET);
  let claims;
  try {
    claims = await privy.verifyAuthToken(token);
  } catch (err) {
    throw new AuthenticationError(
      'Invalid or expired authentication token',
      ErrorCode.AUTH_INVALID_TOKEN
    );
  }

  if (!claims.userId) {
    throw new AuthenticationError('Invalid token: missing user ID', ErrorCode.AUTH_INVALID_TOKEN);
  }

  // Check if user already exists
  const existingResult = await c.env.DB.prepare('SELECT * FROM users WHERE privy_user_id = ?')
    .bind(claims.userId)
    .first();

  const existingUser = existingResult as User | null;

  if (existingUser) {
    return c.json({
      message: 'User already exists',
      userId: existingUser.id,
      safeAddress: existingUser.safe_address,
    });
  }

  // Get Privy user details to get their embedded wallet
  const privyUser = await privy.getUser(claims.userId);
  const embeddedWallet = privyUser.linkedAccounts.find(
    (account) => account.type === 'wallet' && account.walletClientType === 'privy'
  );

  if (!embeddedWallet || !('address' in embeddedWallet)) {
    throw new AuthenticationError(
      'No embedded wallet found. Please create a wallet first.',
      ErrorCode.AUTH_NO_WALLET
    );
  }

  const ownerAddress = embeddedWallet.address as Address;

  // Predict Safe address
  const chainId = parseInt(c.env.CHAIN_ID);
  const safeAddress = await predictSafeAddress(ownerAddress, chainId, c.env.RPC_URL);

  // Create user in database
  const userId = crypto.randomUUID();
  try {
    await c.env.DB.prepare(
      `INSERT INTO users (id, privy_user_id, safe_address, owner_address, total_deposited, created_at, updated_at)
       VALUES (?, ?, ?, ?, '0', datetime('now'), datetime('now'))`
    )
      .bind(userId, claims.userId, safeAddress, ownerAddress)
      .run();
  } catch (err) {
    throw new DatabaseError('Failed to create user account');
  }

  // Set userId in context for logging
  c.set('userId', userId);

  return c.json({
    message: 'Account created',
    userId,
    safeAddress,
    ownerAddress,
  });
});

/**
 * Predict Safe address for an owner
 * Uses deterministic address generation based on owner + chain
 */
async function predictSafeAddress(
  owner: Address,
  chainId: number,
  _rpcUrl: string
): Promise<Address> {
  // Validate chain is supported
  const _chain = getChain(chainId);

  // Create a deterministic "Safe-like" address by hashing owner + salt
  // In production, this would use the Safe SDK to calculate actual Safe address
  const encoder = new TextEncoder();
  const data = encoder.encode(`safe-${owner}-${chainId}-0`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Take last 40 characters (20 bytes) for address
  return `0x${hashHex.slice(-40)}` as Address;
}

export { authRoutes };
