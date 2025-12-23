import type { Address, Hash, Hex } from 'viem';

export interface SafeTransactionData {
  to: Address;
  value: bigint;
  data: Hex;
  operation?: 0 | 1; // 0 = Call, 1 = DelegateCall
}

export interface SafeConfig {
  owners: Address[];
  threshold: number;
  saltNonce?: bigint;
}

export interface EncodedSafeTransaction {
  to: Address;
  value: bigint;
  data: Hex;
  operation: number;
  safeTxGas: bigint;
  baseGas: bigint;
  gasPrice: bigint;
  gasToken: Address;
  refundReceiver: Address;
  nonce: bigint;
}

