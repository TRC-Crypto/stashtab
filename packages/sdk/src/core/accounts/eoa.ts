/**
 * EOA (Externally Owned Account) Implementation
 *
 * Support for traditional Ethereum wallets (MetaMask, WalletConnect, etc.)
 */

import type { Address, Hex, Account } from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../../client';
import type { TransactionResult } from '../types';
import type { AccountAbstraction, AccountInfo, TransactionData } from './abstraction';

/**
 * EOA account implementation
 */
export class EOAAccount implements AccountAbstraction {
  readonly type = 'eoa' as const;
  readonly address: Address;
  readonly chainId: number;

  private publicClient: StashtabPublicClient;
  private walletClient: StashtabWalletClient;
  private account: Account;

  constructor(
    address: Address,
    chainId: number,
    publicClient: StashtabPublicClient,
    walletClient: StashtabWalletClient,
    account: Account
  ) {
    this.address = address;
    this.chainId = chainId;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.account = account;
  }

  async deploy(): Promise<TransactionResult> {
    // EOA accounts don't need deployment
    return { success: true };
  }

  async executeTransaction(tx: TransactionData): Promise<TransactionResult> {
    try {
      const hash = await this.walletClient.sendTransaction({
        account: this.account,
        to: tx.to,
        value: tx.value || 0n,
        data: tx.data,
        gas: tx.gasLimit,
        gasPrice: tx.gasPrice,
      });

      return {
        success: true,
        txHash: hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed',
      };
    }
  }

  async signMessage(message: string | Hex): Promise<Hex> {
    try {
      const signature = await this.walletClient.signMessage({
        account: this.account,
        message: typeof message === 'string' ? message : { raw: message },
      });

      return signature as Hex;
    } catch (error: any) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  async isDeployed(): Promise<boolean> {
    // EOA accounts are always "deployed" (they exist by definition)
    return true;
  }

  async getInfo(): Promise<AccountInfo> {
    const nonce = await this.publicClient.getTransactionCount({
      address: this.address,
    });

    return {
      address: this.address,
      type: 'eoa',
      chainId: this.chainId,
      deployed: true,
      nonce: BigInt(nonce),
    };
  }
}

/**
 * Create an EOA account instance
 *
 * @example
 * ```typescript
 * import { createEOAAccount } from '@stashtab/sdk/core/accounts/eoa';
 *
 * const account = createEOAAccount({
 *   address: userAddress,
 *   chainId: 8453,
 *   publicClient,
 *   walletClient,
 *   account: walletAccount,
 * });
 * ```
 */
export interface EOAAccountConfig {
  address: Address;
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient: StashtabWalletClient;
  account: Account;
}

export function createEOAAccount(config: EOAAccountConfig): EOAAccount {
  return new EOAAccount(
    config.address,
    config.chainId,
    config.publicClient,
    config.walletClient,
    config.account
  );
}
