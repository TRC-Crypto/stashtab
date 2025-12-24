/**
 * Sablier v2 LockupLinear ABI
 *
 * Based on Sablier v2 documentation: https://docs.sablier.com/contracts/v2/core/lockup-linear
 *
 * Sablier v2 uses LockupLinear for linear streaming payments
 */

export const SABLIER_LOCKUP_LINEAR_ABI = [
  {
    type: 'function',
    name: 'createWithDurations',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'lockup', type: 'address' },
      {
        name: 'broker',
        type: 'tuple',
        components: [
          { name: 'account', type: 'address' },
          { name: 'fee', type: 'uint256' },
        ],
      },
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'totalAmount', type: 'uint128' },
      { name: 'asset', type: 'address' },
      { name: 'cancelable', type: 'bool' },
      { name: 'transferable', type: 'bool' },
      {
        name: 'durations',
        type: 'tuple',
        components: [
          { name: 'cliff', type: 'uint40' },
          { name: 'total', type: 'uint40' },
        ],
      },
      {
        name: 'range',
        type: 'tuple',
        components: [
          { name: 'start', type: 'uint40' },
          { name: 'end', type: 'uint40' },
        ],
      },
    ],
    outputs: [{ name: 'streamId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'streamId', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint128' },
    ],
    outputs: [{ name: 'amount', type: 'uint128' }],
  },
  {
    type: 'function',
    name: 'cancel',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'streamId', type: 'uint256' }],
    outputs: [
      { name: 'senderAmount', type: 'uint128' },
      { name: 'recipientAmount', type: 'uint128' },
    ],
  },
  {
    type: 'function',
    name: 'getStream',
    stateMutability: 'view',
    inputs: [{ name: 'streamId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'recipient', type: 'address' },
          {
            name: 'amounts',
            type: 'tuple',
            components: [
              { name: 'deposited', type: 'uint128' },
              { name: 'withdrawn', type: 'uint128' },
              { name: 'refunded', type: 'uint128' },
            ],
          },
          { name: 'asset', type: 'address' },
          {
            name: 'segments',
            type: 'tuple[]',
            components: [
              { name: 'amount', type: 'uint128' },
              { name: 'exponent', type: 'uint64' },
              { name: 'milestone', type: 'uint40' },
            ],
          },
          { name: 'cancelable', type: 'bool' },
          { name: 'transferable', type: 'bool' },
          { name: 'startTime', type: 'uint40' },
          { name: 'endTime', type: 'uint40' },
          { name: 'cliffTime', type: 'uint40' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'withdrawableAmountOf',
    stateMutability: 'view',
    inputs: [{ name: 'streamId', type: 'uint256' }],
    outputs: [{ name: 'amount', type: 'uint128' }],
  },
  {
    type: 'function',
    name: 'refundableAmountOf',
    stateMutability: 'view',
    inputs: [{ name: 'streamId', type: 'uint256' }],
    outputs: [{ name: 'amount', type: 'uint128' }],
  },
] as const;
