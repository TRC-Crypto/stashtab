import { Hono } from 'hono';
import { createPublicClient, http } from 'viem';
import type { Env } from '../types';
import { getChain, getAddresses, AAVE_POOL_ABI, rayToPercent } from '@stashtab/config';

const yieldRoutes = new Hono<{ Bindings: Env }>();

/**
 * GET /yield/rate
 * Get current Aave supply APY for USDC
 */
yieldRoutes.get('/rate', async (c) => {
  const chainId = parseInt(c.env.CHAIN_ID);
  const chain = getChain(chainId);
  const addresses = getAddresses(chainId);

  // Check cache first
  const cacheKey = `yield-rate-${chainId}`;
  const cached = await c.env.CACHE.get(cacheKey);

  if (cached) {
    return c.json(JSON.parse(cached));
  }

  const publicClient = createPublicClient({
    chain,
    transport: http(c.env.RPC_URL),
  });

  const reserveData = await publicClient.readContract({
    address: addresses.AAVE_POOL,
    abi: AAVE_POOL_ABI,
    functionName: 'getReserveData',
    args: [addresses.USDC],
  });

  const response = {
    asset: 'USDC',
    chainId,
    apyPercent: rayToPercent(BigInt(reserveData.currentLiquidityRate)),
    liquidityRate: reserveData.currentLiquidityRate.toString(),
    liquidityIndex: reserveData.liquidityIndex.toString(),
    lastUpdated: Number(reserveData.lastUpdateTimestamp),
    aTokenAddress: addresses.aUSDC,
    poolAddress: addresses.AAVE_POOL,
  };

  // Cache for 60 seconds
  await c.env.CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 60 });

  return c.json(response);
});

/**
 * GET /yield/history
 * Get historical yield data (placeholder)
 */
yieldRoutes.get('/history', async (c) => {
  // In production, this would fetch historical APY data
  // from a database or indexer

  return c.json({
    message: 'Historical yield data not yet implemented',
    note: 'Would show APY over time',
  });
});

export { yieldRoutes };

