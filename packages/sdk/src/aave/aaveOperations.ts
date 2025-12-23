import {
  getAddresses,
  AAVE_POOL_ABI,
  AAVE_DATA_PROVIDER_ABI,
  ERC20_ABI,
  rayToPercent,
} from '@stashtab/config';
import type { Address } from 'viem';
import type { StashtabPublicClient } from '../client';
import type { YieldRate } from '../types';

/**
 * Get user's Aave position for USDC
 */
export async function getAaveUserPosition(
  publicClient: StashtabPublicClient,
  chainId: number,
  userAddress: Address
): Promise<{
  aTokenBalance: bigint;
  stableDebt: bigint;
  variableDebt: bigint;
  liquidityRate: bigint;
}> {
  const addresses = getAddresses(chainId);

  const result = await publicClient.readContract({
    address: addresses.AAVE_POOL_DATA_PROVIDER,
    abi: AAVE_DATA_PROVIDER_ABI,
    functionName: 'getUserReserveData',
    args: [addresses.USDC, userAddress],
  });

  return {
    aTokenBalance: result[0],
    stableDebt: result[1],
    variableDebt: result[2],
    liquidityRate: result[6],
  };
}

/**
 * Get Aave reserve data for USDC
 */
export async function getAaveReserveData(
  publicClient: StashtabPublicClient,
  chainId: number
): Promise<{
  liquidityRate: bigint;
  liquidityIndex: bigint;
  lastUpdateTimestamp: number;
}> {
  const addresses = getAddresses(chainId);

  const result = await publicClient.readContract({
    address: addresses.AAVE_POOL,
    abi: AAVE_POOL_ABI,
    functionName: 'getReserveData',
    args: [addresses.USDC],
  });

  return {
    liquidityRate: BigInt(result.currentLiquidityRate),
    liquidityIndex: BigInt(result.liquidityIndex),
    lastUpdateTimestamp: Number(result.lastUpdateTimestamp),
  };
}

/**
 * Get current supply APY for USDC
 */
export async function getCurrentAPY(
  publicClient: StashtabPublicClient,
  chainId: number
): Promise<YieldRate> {
  const reserveData = await getAaveReserveData(publicClient, chainId);

  return {
    apyPercent: rayToPercent(reserveData.liquidityRate),
    liquidityRate: reserveData.liquidityRate,
    lastUpdated: reserveData.lastUpdateTimestamp,
  };
}

/**
 * Get aUSDC balance for an address
 */
export async function getATokenBalance(
  publicClient: StashtabPublicClient,
  chainId: number,
  address: Address
): Promise<bigint> {
  const addresses = getAddresses(chainId);

  return publicClient.readContract({
    address: addresses.aUSDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
}

/**
 * Get USDC balance for an address
 */
export async function getUSDCBalance(
  publicClient: StashtabPublicClient,
  chainId: number,
  address: Address
): Promise<bigint> {
  const addresses = getAddresses(chainId);

  return publicClient.readContract({
    address: addresses.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
}
