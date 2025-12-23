/**
 * Application constants
 */

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// Maximum approval amount (uint256 max)
export const MAX_UINT256 = BigInt(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'
);

// Gas limits for common operations
export const GAS_LIMITS = {
  SAFE_DEPLOY: 500_000n,
  AAVE_SUPPLY: 300_000n,
  AAVE_WITHDRAW: 300_000n,
  ERC20_TRANSFER: 100_000n,
  ERC20_APPROVE: 60_000n,
};

// Minimum amounts (in USDC base units, i.e., 6 decimals)
export const MIN_DEPOSIT = 1_000_000n; // $1.00
export const MIN_WITHDRAW = 1_000_000n; // $1.00
export const MIN_SEND = 100_000n; // $0.10

// APY calculation
export const RAY = 10n ** 27n;
export const SECONDS_PER_YEAR = 31536000;

/**
 * Convert Aave ray rate to percentage APY
 */
export function rayToPercent(ray: bigint): number {
  return Number((ray * 10000n) / RAY) / 100;
}

/**
 * Format USDC amount to display string
 */
export function formatUSDC(amount: bigint, showDecimals = 2): string {
  const value = Number(amount) / 10 ** USDC_DECIMALS;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals,
    maximumFractionDigits: showDecimals,
  });
}

/**
 * Parse USDC string to base units
 */
export function parseUSDC(amount: string): bigint {
  const value = parseFloat(amount);
  if (isNaN(value) || value < 0) {
    throw new Error('Invalid USDC amount');
  }
  return BigInt(Math.floor(value * 10 ** USDC_DECIMALS));
}

