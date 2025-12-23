import { getAddresses, ERC20_ABI, AAVE_POOL_ABI, MAX_UINT256 } from '@stashtab/config';
import type { Address, Hash } from 'viem';
import { encodeFunctionData } from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../client';
import {
  predictSafeAddress,
  deploySafe,
  executeSafeTransaction,
  isSafeDeployed,
  getSafeOwners,
} from './safeOperations';
import type { SafeTransactionData } from './types';

/**
 * Service for managing Safe smart accounts
 */
export class SafeService {
  constructor(
    private publicClient: StashtabPublicClient,
    private walletClient: StashtabWalletClient,
    private chainId: number
  ) {}

  private get addresses() {
    return getAddresses(this.chainId);
  }

  /**
   * Predict the Safe address for a given owner
   */
  async predictAddress(owner: Address, saltNonce = 0n): Promise<Address> {
    return predictSafeAddress(this.publicClient, this.chainId, {
      owners: [owner],
      threshold: 1,
      saltNonce,
    });
  }

  /**
   * Deploy a new Safe for an owner
   */
  async deploy(owner: Address, saltNonce = 0n): Promise<{ safeAddress: Address; txHash: Hash }> {
    return deploySafe(this.publicClient, this.walletClient, this.chainId, {
      owners: [owner],
      threshold: 1,
      saltNonce,
    });
  }

  /**
   * Check if a Safe is deployed
   */
  async isDeployed(safeAddress: Address): Promise<boolean> {
    return isSafeDeployed(this.publicClient, safeAddress);
  }

  /**
   * Get Safe owners
   */
  async getOwners(safeAddress: Address): Promise<Address[]> {
    return getSafeOwners(this.publicClient, safeAddress);
  }

  /**
   * Execute a generic transaction through the Safe
   */
  async executeTransaction(safeAddress: Address, transaction: SafeTransactionData): Promise<Hash> {
    return executeSafeTransaction(this.publicClient, this.walletClient, safeAddress, transaction);
  }

  /**
   * Transfer ERC20 tokens from the Safe
   */
  async transferERC20(
    safeAddress: Address,
    token: Address,
    to: Address,
    amount: bigint
  ): Promise<Hash> {
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, amount],
    });

    return this.executeTransaction(safeAddress, {
      to: token,
      value: 0n,
      data,
    });
  }

  /**
   * Approve ERC20 spending from the Safe
   */
  async approveERC20(
    safeAddress: Address,
    token: Address,
    spender: Address,
    amount: bigint = MAX_UINT256
  ): Promise<Hash> {
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });

    return this.executeTransaction(safeAddress, {
      to: token,
      value: 0n,
      data,
    });
  }

  /**
   * Supply USDC to Aave from the Safe
   */
  async supplyToAave(safeAddress: Address, amount: bigint): Promise<Hash> {
    // First, approve Aave Pool to spend USDC
    const currentAllowance = await this.publicClient.readContract({
      address: this.addresses.USDC,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [safeAddress, this.addresses.AAVE_POOL],
    });

    if (currentAllowance < amount) {
      await this.approveERC20(safeAddress, this.addresses.USDC, this.addresses.AAVE_POOL);
      // Wait a bit for the approval to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Supply to Aave
    const data = encodeFunctionData({
      abi: AAVE_POOL_ABI,
      functionName: 'supply',
      args: [
        this.addresses.USDC,
        amount,
        safeAddress, // onBehalfOf
        0, // referralCode
      ],
    });

    return this.executeTransaction(safeAddress, {
      to: this.addresses.AAVE_POOL,
      value: 0n,
      data,
    });
  }

  /**
   * Withdraw USDC from Aave through the Safe
   */
  async withdrawFromAave(safeAddress: Address, amount: bigint, to: Address): Promise<Hash> {
    const data = encodeFunctionData({
      abi: AAVE_POOL_ABI,
      functionName: 'withdraw',
      args: [this.addresses.USDC, amount, to],
    });

    return this.executeTransaction(safeAddress, {
      to: this.addresses.AAVE_POOL,
      value: 0n,
      data,
    });
  }
}
