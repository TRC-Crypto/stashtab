/**
 * Account Abstraction Interface
 *
 * Unified interface for all account types (Safe, EOA, ERC-4337, etc.)
 * Enables protocol-agnostic account management
 */

import type { Address, Hex } from 'viem';
import type { TransactionResult } from '../types';

/**
 * Account type
 */
export type AccountType = 'safe' | 'eoa' | 'erc4337';

/**
 * Transaction data for account execution
 */
export interface TransactionData {
  to: Address;
  value?: bigint;
  data?: Hex;
  gasLimit?: bigint;
  gasPrice?: bigint;
}

/**
 * Account abstraction interface
 *
 * All account types (Safe, EOA, ERC-4337) implement this interface
 */
export interface AccountAbstraction {
  /**
   * Account type identifier
   */
  readonly type: AccountType;

  /**
   * Account address
   */
  readonly address: Address;

  /**
   * Chain ID this account is on
   */
  readonly chainId: number;

  /**
   * Deploy the account (if not already deployed)
   *
   * For EOA accounts, this is a no-op (always returns success)
   * For Safe/ERC-4337, this deploys the contract
   */
  deploy(): Promise<TransactionResult>;

  /**
   * Execute a transaction from this account
   */
  executeTransaction(tx: TransactionData): Promise<TransactionResult>;

  /**
   * Sign a message with this account
   */
  signMessage(message: string | Hex): Promise<Hex>;

  /**
   * Check if the account is deployed
   *
   * For EOA, always returns true
   * For contract accounts, checks if contract exists
   */
  isDeployed(): Promise<boolean>;

  /**
   * Get account information
   */
  getInfo(): Promise<AccountInfo>;
}

/**
 * Account information
 */
export interface AccountInfo {
  address: Address;
  type: AccountType;
  chainId: number;
  deployed: boolean;
  owners?: Address[]; // For Safe accounts
  threshold?: number; // For Safe accounts
  nonce?: bigint; // Transaction nonce
}

/**
 * Account configuration
 */
export interface AccountConfig {
  chainId: number;
  address?: Address; // If provided, use existing account
  owners?: Address[]; // For Safe accounts
  threshold?: number; // For Safe accounts
  saltNonce?: bigint; // For Safe accounts
}
