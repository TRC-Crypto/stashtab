import { Hono } from 'hono';
import { PrivyClient } from '@privy-io/server-auth';
import { createPublicClient, http, type Address } from 'viem';
import type { Env, User } from '../types';
import {
  getChain,
  getAddresses,
  formatUSDC,
  ERC20_ABI,
  AAVE_POOL_ABI,
  AAVE_DATA_PROVIDER_ABI,
  rayToPercent,
} from '@stashtab/config';

const accountRoutes = new Hono<{ Bindings: Env }>();

// Middleware to verify auth and get user
async function getAuthenticatedUser(c: any): Promise<User | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const privy = new PrivyClient(c.env.PRIVY_APP_ID, c.env.PRIVY_APP_SECRET);
    const claims = await privy.verifyAuthToken(token);

    if (!claims.userId) {
      return null;
    }

    const result = await c.env.DB.prepare('SELECT * FROM users WHERE privy_user_id = ?')
      .bind(claims.userId)
      .first();

    return result as User | null;
  } catch {
    return null;
  }
}

/**
 * GET /account
 * Get user account info including Safe address and balances
 */
accountRoutes.get('/', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

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
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

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
 * This would normally be triggered automatically when USDC is detected
 */
accountRoutes.post('/deposit', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json<{ amount?: string }>();

  // In production, this would:
  // 1. Check Safe USDC balance
  // 2. Execute Safe transaction to supply to Aave
  // 3. Update total_deposited in database

  return c.json({
    message: 'Deposit initiated',
    status: 'pending',
    note: 'Auto-sweep functionality would execute this automatically',
  });
});

/**
 * POST /account/send
 * Send USDC to another address
 */
accountRoutes.post('/send', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json<{ to: string; amount: string }>();

  if (!body.to || !body.amount) {
    return c.json({ error: 'Missing to or amount' }, 400);
  }

  // Validate address
  if (!/^0x[a-fA-F0-9]{40}$/.test(body.to)) {
    return c.json({ error: 'Invalid recipient address' }, 400);
  }

  const amount = BigInt(body.amount);
  if (amount <= 0n) {
    return c.json({ error: 'Invalid amount' }, 400);
  }

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
});

/**
 * POST /account/withdraw
 * Withdraw USDC from Aave to external address
 */
accountRoutes.post('/withdraw', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json<{ amount: string; to: string }>();

  if (!body.to || !body.amount) {
    return c.json({ error: 'Missing to or amount' }, 400);
  }

  // Validate address
  if (!/^0x[a-fA-F0-9]{40}$/.test(body.to)) {
    return c.json({ error: 'Invalid destination address' }, 400);
  }

  const amount = BigInt(body.amount);
  if (amount <= 0n) {
    return c.json({ error: 'Invalid amount' }, 400);
  }

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
});

export { accountRoutes };

