/**
 * Basic API Usage Example
 *
 * This example shows how to use the Stashtab SDK to interact with the API.
 */

import { StashtabClient } from '@stashtab/sdk';

// Initialize the client
const client = new StashtabClient({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  token: process.env.PRIVY_TOKEN, // Privy JWT token
});

// Example: Get account balance
async function getBalance() {
  try {
    const account = await client.getAccount();
    console.log('Total Balance:', account.balance.totalBalance);
    console.log('Yield Earned:', account.balance.yieldEarned);
    console.log('APY:', account.yieldRate.apyPercent + '%');
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

// Example: Send USDC
async function sendUSDC(to: string, amount: string) {
  try {
    const result = await client.send(to, amount);
    console.log('Transaction sent:', result);
  } catch (error) {
    console.error('Error sending USDC:', error);
  }
}

// Example: Get yield rate
async function getYieldRate() {
  try {
    const rate = await client.getYieldRate();
    console.log('Current APY:', rate.apyPercent + '%');
    console.log('Liquidity Rate:', rate.liquidityRate);
  } catch (error) {
    console.error('Error fetching yield rate:', error);
  }
}

export { getBalance, sendUSDC, getYieldRate };
