import { Hono } from 'hono';
import { PrivyClient } from '@privy-io/server-auth';
import type { Env, User } from '../types';
import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getChain, getAddresses } from '@stashtab/config';

const authRoutes = new Hono<{ Bindings: Env }>();

/**
 * POST /auth/signup
 * Verify Privy token and create user account with Safe
 */
authRoutes.post('/signup', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    // Verify Privy token
    const privy = new PrivyClient(c.env.PRIVY_APP_ID, c.env.PRIVY_APP_SECRET);
    const claims = await privy.verifyAuthToken(token);

    if (!claims.userId) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Check if user already exists
    const existingResult = await c.env.DB.prepare(
      'SELECT * FROM users WHERE privy_user_id = ?'
    )
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
      return c.json({ error: 'No embedded wallet found' }, 400);
    }

    const ownerAddress = embeddedWallet.address as Address;

    // For now, we'll predict the Safe address without deploying
    // In production, you'd deploy the Safe here using a server wallet
    const chainId = parseInt(c.env.CHAIN_ID);
    const addresses = getAddresses(chainId);

    // Generate a deterministic Safe address based on owner
    // This is a simplified version - real implementation would use Safe SDK
    const safeAddress = await predictSafeAddress(ownerAddress, chainId, c.env.RPC_URL);

    // Create user in database
    const userId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO users (id, privy_user_id, safe_address, owner_address, total_deposited, created_at, updated_at)
       VALUES (?, ?, ?, ?, '0', datetime('now'), datetime('now'))`
    )
      .bind(userId, claims.userId, safeAddress, ownerAddress)
      .run();

    return c.json({
      message: 'Account created',
      userId,
      safeAddress,
      ownerAddress,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return c.json(
      { error: 'Authentication failed', message: err instanceof Error ? err.message : 'Unknown error' },
      401
    );
  }
});

/**
 * Predict Safe address for an owner
 * Simplified version - uses deterministic address generation
 */
async function predictSafeAddress(
  owner: Address,
  chainId: number,
  rpcUrl: string
): Promise<Address> {
  // In a real implementation, this would use the Safe SDK to predict
  // the address based on the proxy factory and singleton
  // For demo purposes, we'll generate a deterministic address

  const chain = getChain(chainId);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  // Create a deterministic "Safe-like" address by hashing owner + salt
  // This is a placeholder - real implementation would calculate actual Safe address
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

