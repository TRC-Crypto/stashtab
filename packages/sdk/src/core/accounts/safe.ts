/**
 * Safe Account Implementation
 *
 * Wraps Safe smart account functionality in the account abstraction interface
 */

import type { Address, Hex } from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../../client';
import { deploySafe, executeSafeTransaction } from '../../safe/safeOperations';
import { SafeService } from '../../safe/SafeService';
import type { SafeTransactionData } from '../../safe/types';
import type { TransactionResult } from '../types';
import type { AccountAbstraction, AccountInfo, TransactionData } from './abstraction';

/**
 * Safe account implementation
 */
export class SafeAccount implements AccountAbstraction {
  readonly type = 'safe' as const;
  readonly address: Address;
  readonly chainId: number;

  private publicClient: StashtabPublicClient;
  private walletClient: StashtabWalletClient;
  private safeService: SafeService;
  private owners: Address[];
  private threshold: number;

  constructor(
    address: Address,
    chainId: number,
    publicClient: StashtabPublicClient,
    walletClient: StashtabWalletClient,
    owners: Address[],
    threshold: number = 1
  ) {
    this.address = address;
    this.chainId = chainId;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.owners = owners;
    this.threshold = threshold;
    this.safeService = new SafeService(publicClient, walletClient, chainId);
  }

  async deploy(): Promise<TransactionResult> {
    const isDeployed = await this.isDeployed();
    if (isDeployed) {
      return { success: true };
    }

    try {
      const result = await deploySafe(this.publicClient, this.walletClient, this.chainId, {
        owners: this.owners,
        threshold: this.threshold,
      });

      return {
        success: true,
        txHash: result.txHash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Safe deployment failed',
      };
    }
  }

  async executeTransaction(tx: TransactionData): Promise<TransactionResult> {
    const isDeployed = await this.isDeployed();
    if (!isDeployed) {
      return {
        success: false,
        error: 'Safe account not deployed. Call deploy() first.',
      };
    }

    try {
      const safeTx: SafeTransactionData = {
        to: tx.to,
        value: tx.value || 0n,
        data: tx.data || '0x',
      };

      const txHash = await executeSafeTransaction(
        this.publicClient,
        this.walletClient,
        this.address,
        safeTx
      );

      return {
        success: true,
        txHash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed',
      };
    }
  }

  async signMessage(message: string | Hex): Promise<Hex> {
    // Safe accounts use EIP-1271 for message signing
    // This requires the Safe to be deployed and the signer to be an owner
    const isDeployed = await this.isDeployed();
    if (!isDeployed) {
      throw new Error('Safe account not deployed. Cannot sign messages.');
    }

    // For now, we'll use the wallet client to sign
    // In production, this should use Safe's EIP-1271 signature verification
    const signer = this.walletClient.account;
    if (!signer) {
      throw new Error('No signer available');
    }

    try {
      const signature = await this.walletClient.signMessage({
        account: signer,
        message: typeof message === 'string' ? message : { raw: message },
      });

      return signature as Hex;
    } catch (error: any) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  async isDeployed(): Promise<boolean> {
    try {
      const code = await this.publicClient.getCode({
        address: this.address,
      });
      return code !== '0x';
    } catch {
      return false;
    }
  }

  async getInfo(): Promise<AccountInfo> {
    const deployed = await this.isDeployed();

    return {
      address: this.address,
      type: 'safe',
      chainId: this.chainId,
      deployed,
      owners: this.owners,
      threshold: this.threshold,
    };
  }
}

/**
 * Create a Safe account instance
 *
 * @example
 * ```typescript
 * import { createSafeAccount } from '@stashtab/sdk/core/accounts/safe';
 *
 * const account = createSafeAccount({
 *   address: safeAddress,
 *   chainId: 8453,
 *   publicClient,
 *   walletClient,
 *   owners: [ownerAddress],
 *   threshold: 1,
 * });
 * ```
 */
export interface SafeAccountConfig {
  address: Address;
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient: StashtabWalletClient;
  owners: Address[];
  threshold?: number;
}

export function createSafeAccount(config: SafeAccountConfig): SafeAccount {
  return new SafeAccount(
    config.address,
    config.chainId,
    config.publicClient,
    config.walletClient,
    config.owners,
    config.threshold || 1
  );
}
