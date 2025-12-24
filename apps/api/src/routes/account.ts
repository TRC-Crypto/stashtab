import { zValidator } from '@hono/zod-validator';
import { PrivyClient } from '@privy-io/server-auth';
import { getChain, getAddresses, ERC20_ABI, AAVE_POOL_ABI, rayToPercent } from '@stashtab/config';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { createPublicClient, http, type Address } from 'viem';
import { AuthenticationError, ErrorCode, ValidationError } from '../errors';
import { standardRateLimit, strictRateLimit } from '../middleware';
import { SendRequestSchema, WithdrawRequestSchema, DepositRequestSchema } from '../schemas';
import type { Env, User } from '../types';

const accountRoutes = new Hono<{ Bindings: Env }>();

// ============================================================================
// Helper: Get Authenticated User
// ============================================================================

async function getAuthenticatedUser(c: Context<{ Bindings: Env }>): Promise<User> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError(
      'Missing or invalid authorization header',
      ErrorCode.AUTH_MISSING_TOKEN
    );
  }

  const token = authHeader.slice(7);

  try {
    const privy = new PrivyClient(c.env.PRIVY_APP_ID, c.env.PRIVY_APP_SECRET);
    const claims = await privy.verifyAuthToken(token);

    if (!claims.userId) {
      throw new AuthenticationError('Invalid token', ErrorCode.AUTH_INVALID_TOKEN);
    }

    // Check for organization context (set by API key middleware)
    const org = c.get('organization') as { id: string } | undefined;
    let query = 'SELECT * FROM users WHERE privy_user_id = ?';
    const bindings: any[] = [claims.userId];

    // If organization context exists, filter by organization_id
    if (org) {
      query += ' AND organization_id = ?';
      bindings.push(org.id);
    }

    const result = await c.env.DB.prepare(query)
      .bind(...bindings)
      .first();

    const user = result as User | null;

    if (!user) {
      throw new AuthenticationError(
        'User not found. Please sign up first.',
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    // Set userId in context for logging
    c.set('userId', user.id);

    return user;
  } catch (err) {
    if (err instanceof AuthenticationError) {
      throw err;
    }
    throw new AuthenticationError('Authentication failed', ErrorCode.AUTH_INVALID_TOKEN);
  }
}

// Apply rate limiting
accountRoutes.use('/balance', standardRateLimit);
accountRoutes.use('/', standardRateLimit);
accountRoutes.use('/deposit', strictRateLimit);
accountRoutes.use('/send', strictRateLimit);
accountRoutes.use('/withdraw', strictRateLimit);

/**
 * GET /account
 * Get user account info including Safe address and balances
 */
accountRoutes.get('/', async (c) => {
  const user = await getAuthenticatedUser(c);

  const chainId = parseInt(c.env.CHAIN_ID);
  const chain = getChain(chainId);
  const addresses = getAddresses(chainId);

  const publicClient = createPublicClient({
    chain,
    transport: http(c.env.RPC_URL),
  });

  // Fetch balances in parallel
  const [safeBalance, aavePosition, reserveData] = await Promise.all([
    publicClient.readContract({
      address: addresses.USDC,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [user.safe_address as Address],
    }),
    publicClient.readContract({
      address: addresses.aUSDC,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [user.safe_address as Address],
    }),
    publicClient.readContract({
      address: addresses.AAVE_POOL,
      abi: AAVE_POOL_ABI,
      functionName: 'getReserveData',
      args: [addresses.USDC],
    }),
  ]);

  const totalDeposited = BigInt(user.total_deposited);
  const totalBalance = safeBalance + aavePosition;
  const yieldEarned = aavePosition > totalDeposited ? aavePosition - totalDeposited : 0n;

  return c.json({
    userId: user.id,
    safeAddress: user.safe_address,
    ownerAddress: user.owner_address,
    balance: {
      safeBalance: safeBalance.toString(),
      aaveBalance: aavePosition.toString(),
      totalBalance: totalBalance.toString(),
      totalDeposited: user.total_deposited,
      yieldEarned: yieldEarned.toString(),
    },
    yieldRate: {
      apyPercent: rayToPercent(BigInt(reserveData.currentLiquidityRate)),
      liquidityRate: reserveData.currentLiquidityRate.toString(),
      lastUpdated: Number(reserveData.lastUpdateTimestamp),
    },
  });
});

/**
 * GET /account/balance
 * Get user balance only (for refresh)
 */
accountRoutes.get('/balance', async (c) => {
  const user = await getAuthenticatedUser(c);

  const chainId = parseInt(c.env.CHAIN_ID);
  const chain = getChain(chainId);
  const addresses = getAddresses(chainId);

  const publicClient = createPublicClient({
    chain,
    transport: http(c.env.RPC_URL),
  });

  const [safeBalance, aavePosition, reserveData] = await Promise.all([
    publicClient.readContract({
      address: addresses.USDC,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [user.safe_address as Address],
    }),
    publicClient.readContract({
      address: addresses.aUSDC,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [user.safe_address as Address],
    }),
    publicClient.readContract({
      address: addresses.AAVE_POOL,
      abi: AAVE_POOL_ABI,
      functionName: 'getReserveData',
      args: [addresses.USDC],
    }),
  ]);

  const totalDeposited = BigInt(user.total_deposited);
  const totalBalance = safeBalance + aavePosition;
  const yieldEarned = aavePosition > totalDeposited ? aavePosition - totalDeposited : 0n;

  return c.json({
    balance: {
      safeBalance: safeBalance.toString(),
      aaveBalance: aavePosition.toString(),
      totalBalance: totalBalance.toString(),
      totalDeposited: user.total_deposited,
      yieldEarned: yieldEarned.toString(),
    },
    yieldRate: {
      apyPercent: rayToPercent(BigInt(reserveData.currentLiquidityRate)),
      liquidityRate: reserveData.currentLiquidityRate.toString(),
      lastUpdated: Number(reserveData.lastUpdateTimestamp),
    },
  });
});

/**
 * POST /account/deposit
 * Trigger deposit of USDC from Safe to Aave
 */
accountRoutes.post(
  '/deposit',
  zValidator('json', DepositRequestSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const _user = await getAuthenticatedUser(c);
    const body = c.req.valid('json');

    // In production, this would:
    // 1. Check Safe USDC balance
    // 2. Execute Safe transaction to supply to Aave
    // 3. Update total_deposited in database

    return c.json({
      message: 'Deposit initiated',
      status: 'pending',
      amount: body?.amount,
      note: 'Auto-sweep functionality would execute this automatically',
    });
  }
);

/**
 * POST /account/send
 * Send USDC to another address
 */
accountRoutes.post(
  '/send',
  zValidator('json', SendRequestSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const _user = await getAuthenticatedUser(c);
    const body = c.req.valid('json');

    // In production, this would:
    // 1. Check if recipient is another Stashtab user (internal transfer)
    // 2. Withdraw from Aave if needed
    // 3. Execute Safe transaction to transfer USDC
    // 4. If internal, trigger deposit on recipient's Safe

    return c.json({
      message: 'Transfer initiated',
      status: 'pending',
      to: body.to,
      amount: body.amount,
    });
  }
);

/**
 * POST /account/withdraw
 * Withdraw USDC from Aave to external address
 */
accountRoutes.post(
  '/withdraw',
  zValidator('json', WithdrawRequestSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const _user = await getAuthenticatedUser(c);
    const body = c.req.valid('json');

    // In production, this would:
    // 1. Execute Safe transaction to withdraw from Aave
    // 2. Execute Safe transaction to transfer USDC to destination
    // 3. Update database records

    return c.json({
      message: 'Withdrawal initiated',
      status: 'pending',
      to: body.to,
      amount: body.amount,
    });
  }
);

export { accountRoutes };
