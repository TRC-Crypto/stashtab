/**
 * Stashtab API Routes
 *
 * Example routes for Stashtab integration
 */

import { Router } from 'express';
import { getStashtabClient } from '../lib/stashtab';
import type { Address } from 'viem';

const router = Router();

/**
 * GET /stashtab/balance/:address
 * Get account balance
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const client = getStashtabClient();
    const address = req.params.address as Address;

    const balance = await client.yield.aave.getUserBalance(address, 0n);

    res.json({
      address,
      safeBalance: balance.safeBalance.toString(),
      yieldEarned: balance.yieldEarned.toString(),
      totalBalance: balance.totalBalance.toString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to fetch balance',
    });
  }
});

/**
 * GET /stashtab/yield-rate
 * Get current yield rate (APY)
 */
router.get('/yield-rate', async (req, res) => {
  try {
    const client = getStashtabClient();
    const yieldRate = await client.yield.aave.getYieldRate();

    res.json({
      apy: yieldRate.apyPercent,
      apyRaw: yieldRate.apyRaw.toString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to fetch yield rate',
    });
  }
});

/**
 * POST /stashtab/send
 * Send payment (placeholder - requires account abstraction)
 */
router.post('/send', async (req, res) => {
  try {
    const { from, to, amount, token } = req.body;

    if (!from || !to || !amount || !token) {
      return res.status(400).json({
        error: 'Missing required fields: from, to, amount, token',
      });
    }

    // This is a placeholder - in production, you'd use account abstraction
    // to execute the transfer
    res.status(501).json({
      error: 'Send functionality requires account abstraction implementation',
      message: 'Use executeTransfer() with account abstraction for production',
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to send payment',
    });
  }
});

export default router;
