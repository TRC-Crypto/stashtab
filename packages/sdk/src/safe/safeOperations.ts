import { getAddresses } from '@stashtab/config';
import {
  type Address,
  type Hash,
  type Hex,
  encodeFunctionData,
  encodeAbiParameters,
  keccak256,
  concat,
  getContractAddress,
  zeroAddress,
} from 'viem';
import type { StashtabPublicClient, StashtabWalletClient } from '../client';
import type { SafeConfig, SafeTransactionData } from './types';

// Safe Proxy Factory ABI (partial)
const SAFE_PROXY_FACTORY_ABI = [
  {
    type: 'function',
    name: 'createProxyWithNonce',
    inputs: [
      { name: '_singleton', type: 'address' },
      { name: 'initializer', type: 'bytes' },
      { name: 'saltNonce', type: 'uint256' },
    ],
    outputs: [{ name: 'proxy', type: 'address' }],
  },
  {
    type: 'function',
    name: 'proxyCreationCode',
    inputs: [],
    outputs: [{ type: 'bytes' }],
  },
] as const;

// Safe Singleton ABI (partial)
const SAFE_SINGLETON_ABI = [
  {
    type: 'function',
    name: 'setup',
    inputs: [
      { name: '_owners', type: 'address[]' },
      { name: '_threshold', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'data', type: 'bytes' },
      { name: 'fallbackHandler', type: 'address' },
      { name: 'paymentToken', type: 'address' },
      { name: 'payment', type: 'uint256' },
      { name: 'paymentReceiver', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'execTransaction',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'operation', type: 'uint8' },
      { name: 'safeTxGas', type: 'uint256' },
      { name: 'baseGas', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'refundReceiver', type: 'address' },
      { name: 'signatures', type: 'bytes' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'nonce',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getOwners',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'getThreshold',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'isOwner',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getTransactionHash',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'operation', type: 'uint8' },
      { name: 'safeTxGas', type: 'uint256' },
      { name: 'baseGas', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'refundReceiver', type: 'address' },
      { name: 'nonce', type: 'uint256' },
    ],
    outputs: [{ type: 'bytes32' }],
  },
] as const;

/**
 * Encode the Safe setup initializer data
 */
function encodeSetupData(config: SafeConfig, fallbackHandler: Address): Hex {
  return encodeFunctionData({
    abi: SAFE_SINGLETON_ABI,
    functionName: 'setup',
    args: [
      config.owners,
      BigInt(config.threshold),
      zeroAddress, // to (no module setup)
      '0x' as Hex, // data
      fallbackHandler,
      zeroAddress, // paymentToken
      0n, // payment
      zeroAddress, // paymentReceiver
    ],
  });
}

/**
 * Predict the address of a Safe before deployment
 */
export async function predictSafeAddress(
  publicClient: StashtabPublicClient,
  chainId: number,
  config: SafeConfig
): Promise<Address> {
  const addresses = getAddresses(chainId);
  const saltNonce = config.saltNonce ?? 0n;

  // Get proxy creation code
  const proxyCreationCode = (await publicClient.readContract({
    address: addresses.SAFE_PROXY_FACTORY,
    abi: SAFE_PROXY_FACTORY_ABI,
    functionName: 'proxyCreationCode',
  })) as Hex;

  // Encode initializer
  const initializer = encodeSetupData(config, addresses.SAFE_FALLBACK_HANDLER);

  // Calculate deployment data
  const deploymentData = concat([
    proxyCreationCode,
    encodeAbiParameters([{ type: 'address' }], [addresses.SAFE_SINGLETON]),
  ]);

  // Calculate salt
  const salt = keccak256(
    concat([keccak256(initializer), encodeAbiParameters([{ type: 'uint256' }], [saltNonce])])
  );

  // Calculate CREATE2 address
  const predictedAddress = getContractAddress({
    bytecode: deploymentData,
    from: addresses.SAFE_PROXY_FACTORY,
    opcode: 'CREATE2',
    salt,
  });

  return predictedAddress;
}

/**
 * Deploy a new Safe smart account
 */
export async function deploySafe(
  publicClient: StashtabPublicClient,
  walletClient: StashtabWalletClient,
  chainId: number,
  config: SafeConfig
): Promise<{ safeAddress: Address; txHash: Hash }> {
  const addresses = getAddresses(chainId);
  const saltNonce = config.saltNonce ?? 0n;

  // Encode initializer
  const initializer = encodeSetupData(config, addresses.SAFE_FALLBACK_HANDLER);

  // Predict address first
  const safeAddress = await predictSafeAddress(publicClient, chainId, config);

  // Check if already deployed
  const code = await publicClient.getCode({ address: safeAddress });
  if (code && code !== '0x') {
    throw new Error(`Safe already deployed at ${safeAddress}`);
  }

  // Deploy via proxy factory
  const txHash = await walletClient.writeContract({
    address: addresses.SAFE_PROXY_FACTORY,
    abi: SAFE_PROXY_FACTORY_ABI,
    functionName: 'createProxyWithNonce',
    args: [addresses.SAFE_SINGLETON, initializer, saltNonce],
  });

  // Wait for deployment
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return { safeAddress, txHash };
}

/**
 * Execute a transaction through a Safe
 * This requires the caller to be an owner of the Safe
 */
export async function executeSafeTransaction(
  publicClient: StashtabPublicClient,
  walletClient: StashtabWalletClient,
  safeAddress: Address,
  transaction: SafeTransactionData
): Promise<Hash> {
  // Get current nonce
  const nonce = await publicClient.readContract({
    address: safeAddress,
    abi: SAFE_SINGLETON_ABI,
    functionName: 'nonce',
  });

  // Get transaction hash for signing
  const txHash = await publicClient.readContract({
    address: safeAddress,
    abi: SAFE_SINGLETON_ABI,
    functionName: 'getTransactionHash',
    args: [
      transaction.to,
      transaction.value,
      transaction.data,
      transaction.operation ?? 0,
      0n, // safeTxGas
      0n, // baseGas
      0n, // gasPrice
      zeroAddress, // gasToken
      zeroAddress, // refundReceiver
      nonce,
    ],
  });

  // Sign the transaction hash
  const ownerAddress = walletClient.account?.address;
  if (!ownerAddress) {
    throw new Error('Wallet client has no account');
  }

  const signature = await walletClient.signMessage({
    message: { raw: txHash as Hex },
  });

  // Encode signature in Safe format (r, s, v)
  // For a single owner with threshold 1, we can use a simpler approach
  const encodedSignature = encodeOwnerSignature(ownerAddress, signature);

  // Execute the transaction
  const execTxHash = await walletClient.writeContract({
    address: safeAddress,
    abi: SAFE_SINGLETON_ABI,
    functionName: 'execTransaction',
    args: [
      transaction.to,
      transaction.value,
      transaction.data,
      transaction.operation ?? 0,
      0n, // safeTxGas
      0n, // baseGas
      0n, // gasPrice
      zeroAddress, // gasToken
      zeroAddress, // refundReceiver
      encodedSignature,
    ],
  });

  return execTxHash;
}

/**
 * Encode an owner signature for Safe transaction execution
 */
function encodeOwnerSignature(owner: Address, signature: Hex): Hex {
  // For EIP-1271 compatible signature with a single owner
  // The signature format is: {bytes32 r}{bytes32 s}{uint8 v}
  return signature;
}

/**
 * Check if a Safe is deployed at the given address
 */
export async function isSafeDeployed(
  publicClient: StashtabPublicClient,
  safeAddress: Address
): Promise<boolean> {
  const code = await publicClient.getCode({ address: safeAddress });
  return code !== undefined && code !== '0x';
}

/**
 * Get Safe owners
 */
export async function getSafeOwners(
  publicClient: StashtabPublicClient,
  safeAddress: Address
): Promise<Address[]> {
  return (await publicClient.readContract({
    address: safeAddress,
    abi: SAFE_SINGLETON_ABI,
    functionName: 'getOwners',
  })) as Address[];
}
