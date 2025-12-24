# Refactoring Plan: Clean, Simple, Professional SDK

## Executive Summary

**Goal**: Create the cleanest, simplest, most professional SDK that appeals to all developer types while maintaining robustness and modularity.

**Key Principles**:

1. **Consistency** - One pattern for everything
2. **Simplicity** - Zero-config for beginners, full control for experts
3. **Flexibility** - Works with Safe, EOA, or any account type
4. **Discoverability** - Clear exports, intuitive API
5. **Type Safety** - Full TypeScript without complexity

---

## Critical Issues & Solutions

### Issue 1: Inconsistent Service Creation ❌

**Current State**:

```typescript
// Pattern 1: Class constructor
const aave = new AaveService(publicClient, chainId);

// Pattern 2: Factory function (multiple params)
const morpho = createMorphoService(config, publicClient, walletClient);

// Pattern 3: Factory function (config only)
const streaming = createStreamingPaymentService(config, publicClient, walletClient);
```

**Solution**: Standardize on factory functions with consistent signature

```typescript
// All services follow this pattern:
interface ServiceConfig {
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient?: StashtabWalletClient; // Optional, lazy-loaded
}

// Usage:
const aave = createAaveService({ chainId: 8453, publicClient });
const morpho = createMorphoService({ chainId: 8453, publicClient });
const streaming = createStreamingService({ chainId: 8453, publicClient });
```

---

### Issue 2: Documentation Mismatch ❌

**Current State**: Docs show `new AaveService({ chainId: 8453 })` but actual API is `new AaveService(publicClient, chainId)`

**Solution**:

1. Fix all documentation to match actual API
2. Add factory functions for consistency
3. Update all examples

---

### Issue 3: Over-Abstraction ❌

**Current Structure**:

```
core/
  auth/      (just re-exports Privy)
  accounts/  (just re-exports Safe)
  types/     (could be root-level)
```

**Solution**: Flatten structure

```
auth/        (direct, no wrapper)
accounts/    (direct, no wrapper)
types/       (root-level shared types)
```

**Rationale**: Less nesting = easier discovery

---

### Issue 4: Safe-Centric Design ❌

**Current**: Everything requires Safe smart accounts

**Solution**: Make Safe optional, support EOA wallets

```typescript
// Auto-detect account type
async function transfer(params: TransferParams, options?: { walletClient? }) {
  const accountType = await detectAccountType(params.from);

  if (accountType === 'safe') {
    return executeSafeTransaction(...);
  } else {
    return executeEOATransaction(...);
  }
}
```

---

### Issue 5: Complex Client Setup ❌

**Current**: Developers must create clients manually

```typescript
const publicClient = createStashtabPublicClient(chainId, rpcUrl);
const walletClient = createStashtabWalletClient(chainId, account, rpcUrl);
const aave = new AaveService(publicClient, chainId);
```

**Solution**: Provide convenience client

```typescript
// Zero-config (auto-creates clients)
const client = createStashtabClient({ chainId: 8453 });
const aave = client.yield.aave;

// Custom RPC
const client = createStashtabClient({
  chainId: 8453,
  rpcUrl: 'https://custom-rpc.com',
});

// Full control
const aave = createAaveService({
  chainId: 8453,
  publicClient: myPublicClient,
});
```

---

## Proposed Architecture

### 1. Service Factory Pattern (Standardized)

```typescript
// Base interface for all services
interface BaseServiceConfig {
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient?: StashtabWalletClient;
}

// All services follow this pattern
function createService(config: BaseServiceConfig): Service {
  return {
    // Read operations (no wallet needed)
    async readOperation() { ... },

    // Write operations (wallet required)
    async writeOperation(params, options?: { walletClient? }) {
      const wallet = options?.walletClient || config.walletClient;
      if (!wallet) throw new Error('walletClient required');
      // ...
    }
  };
}
```

### 2. Convenience Client (Zero-Config)

```typescript
interface StashtabClientConfig {
  chainId: number;
  rpcUrl?: string;
  publicClient?: StashtabPublicClient; // Optional override
  walletClient?: StashtabWalletClient; // Optional override
}

function createStashtabClient(config: StashtabClientConfig) {
  const publicClient =
    config.publicClient || createStashtabPublicClient(config.chainId, config.rpcUrl);

  return {
    // Pre-configured services
    yield: {
      aave: createAaveService({ chainId: config.chainId, publicClient }),
      morpho: createMorphoService({ chainId: config.chainId, publicClient }),
      router: createYieldRouter({ chainId: config.chainId, publicClient }),
    },
    payments: {
      streaming: createStreamingService({ chainId: config.chainId, publicClient }),
      batch: createBatchService({ chainId: config.chainId, publicClient }),
      transfer: createTransferService({ chainId: config.chainId, publicClient }),
    },
    accounts: {
      safe: createSafeService({
        chainId: config.chainId,
        publicClient,
        walletClient: config.walletClient,
      }),
    },
    compliance: {
      sanctions: createSanctionsService({ chainId: config.chainId }),
      kyc: {
        persona: (apiKey: string) => createPersonaService({ apiKey }),
        sumsub: (config: SumsubConfig) => createSumsubService(config),
      },
    },
  };
}
```

### 3. Account Abstraction Layer

```typescript
type AccountType = 'safe' | 'eoa';

interface Account {
  type: AccountType;
  address: Address;
  walletClient?: StashtabWalletClient;
}

async function detectAccountType(
  address: Address,
  publicClient: StashtabPublicClient
): Promise<AccountType> {
  const code = await publicClient.getCode({ address });
  return code && code !== '0x' ? 'safe' : 'eoa';
}

async function executeTransaction(
  account: Account,
  transaction: TransactionData,
  publicClient: StashtabPublicClient
): Promise<TransactionResult> {
  if (account.type === 'safe') {
    return executeSafeTransaction(
      publicClient,
      account.walletClient!,
      account.address,
      transaction
    );
  } else {
    return executeEOATransaction(account.walletClient!, transaction);
  }
}
```

### 4. Clean Export Structure

```typescript
// packages/sdk/src/index.ts

// Main exports - curated, clean
export {
  // Convenience client (recommended for beginners)
  createStashtabClient,
  type StashtabClient,

  // Service factories (for advanced users)
  createAaveService,
  createMorphoService,
  createStreamingService,
  createBatchPaymentService,
  createTransferService,
  createSafeService,
  createSanctionsService,
  createYieldRouter,

  // Account operations
  deploySafe,
  predictSafeAddress,
  detectAccountType,

  // Types
  type TransactionResult,
  type PrimitiveConfig,
  type AccountType,
  type Account,
} from './exports';

// Re-export client utilities
export {
  createStashtabPublicClient,
  createStashtabWalletClient,
  type StashtabPublicClient,
  type StashtabWalletClient,
} from './client';
```

### 5. Simplified Directory Structure

```
packages/sdk/src/
├── index.ts              # Main exports (curated)
├── client.ts             # Client creation utilities
├── exports.ts            # All exports organized
├── types.ts              # Shared types (root-level)
│
├── accounts/             # Account abstraction (no "core" wrapper)
│   ├── safe.ts
│   ├── eoa.ts
│   └── index.ts
│
├── yield/
│   ├── aave.ts
│   ├── morpho.ts
│   ├── router.ts
│   └── index.ts
│
├── payments/
│   ├── streaming.ts
│   ├── batch.ts
│   ├── transfer.ts
│   └── index.ts
│
├── compliance/
│   ├── sanctions.ts
│   ├── kyc/
│   │   ├── persona.ts
│   │   ├── sumsub.ts
│   │   └── index.ts
│   └── index.ts
│
└── utils/
    ├── account-detection.ts
    ├── transaction-execution.ts
    └── index.ts
```

---

## Migration Strategy

### Phase 1: Add Factory Functions (Non-Breaking)

```typescript
// Keep existing class-based API
export class AaveService { ... }

// Add factory function
export function createAaveService(config: BaseServiceConfig): AaveService {
  return new AaveService(config.publicClient, config.chainId);
}
```

### Phase 2: Add Convenience Client (Non-Breaking)

```typescript
export function createStashtabClient(config: StashtabClientConfig) {
  // Implementation
}
```

### Phase 3: Update Documentation

- Fix all examples to use factory functions
- Add convenience client examples
- Update migration guide

### Phase 4: Deprecate Old Patterns (Future)

```typescript
// Mark as deprecated (but still work)
/** @deprecated Use createAaveService instead */
export class AaveService { ... }
```

---

## Developer Experience Improvements

### 1. Zero-Config Quick Start

```typescript
import { createStashtabClient } from '@stashtab/sdk';

// That's it! Everything is pre-configured
const client = createStashtabClient({ chainId: 8453 });

// Use services immediately
const apy = await client.yield.aave.getYieldRate();
```

### 2. Progressive Enhancement

```typescript
// Level 1: Simple (auto-configured)
const client = createStashtabClient({ chainId: 8453 });

// Level 2: Custom RPC
const client = createStashtabClient({
  chainId: 8453,
  rpcUrl: 'https://custom-rpc.com',
});

// Level 3: Full control
const aave = createAaveService({
  chainId: 8453,
  publicClient: myPublicClient,
});
```

### 3. Type Safety Without Complexity

```typescript
// Types are inferred automatically
const result = await client.yield.aave.getYieldRate();
// result is automatically YieldRate

// No manual typing needed
const stream = await client.payments.streaming.createStream({
  recipient: '0x...',
  token: '0x...',
  amount: 1000n,
  startTime: Math.floor(Date.now() / 1000),
  endTime: Math.floor(Date.now() / 1000) + 86400,
});
```

---

## Third-Party Viability Checklist

- [x] **Modular** - Each primitive is independent
- [ ] **Simple** - Consistent patterns (needs refactoring)
- [ ] **Flexible** - Works with Safe, EOA, or custom accounts (needs refactoring)
- [ ] **Well-documented** - Examples match actual API (needs fixing)
- [x] **Type-safe** - Full TypeScript support
- [x] **Framework-agnostic** - Works with any framework
- [x] **Chain-agnostic** - Multi-chain support
- [x] **Zero dependencies** - Minimal external deps

---

## Implementation Priority

1. **High Priority** (Do First):
   - Add factory functions for all services
   - Fix documentation examples
   - Add convenience client
   - Make walletClient optional

2. **Medium Priority**:
   - Flatten directory structure
   - Add account abstraction layer
   - Support EOA wallets

3. **Low Priority** (Future):
   - Deprecate old patterns
   - Remove "core" folder
   - Add more convenience methods

---

## Success Metrics

- [ ] All services use factory pattern
- [ ] Documentation examples work out-of-the-box
- [ ] Zero-config option available
- [ ] Support for both Safe and EOA wallets
- [ ] TypeScript types are fully inferred
- [ ] No breaking changes for existing users

---

## Next Steps

1. Review this plan
2. Prioritize which issues to fix first
3. Implement factory functions
4. Add convenience client
5. Update all documentation
6. Test with real-world examples
