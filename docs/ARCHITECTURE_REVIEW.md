# Architecture Review & Simplification Plan

## Critical Issues Identified

### 1. **Inconsistent API Patterns** ⚠️

**Problem**: Mixed patterns confuse developers

- `new AaveService(publicClient, chainId)` - Class constructor
- `createMorphoService(config, publicClient, walletClient)` - Factory function
- `createStreamingPaymentService(config, publicClient, walletClient)` - Factory with multiple params

**Impact**: Developers must learn different patterns for each service

**Solution**: Standardize on factory functions with consistent signatures

---

### 2. **Client Dependency Complexity** ⚠️

**Problem**: Services require both `publicClient` and `walletClient` even for read-only operations

**Current**:

```typescript
const morpho = createMorphoService(
  { chainId: 8453 },
  publicClient, // Required even for read-only
  walletClient // Required even for read-only
);
```

**Better**:

```typescript
// Read-only operations
const morpho = createMorphoService({ chainId: 8453, publicClient });

// Write operations (lazy load walletClient)
await morpho.supply(..., { walletClient });
```

**Impact**: Forces developers to create wallet clients even when not needed

---

### 3. **Over-Abstraction** ⚠️

**Problem**: Too many layers

- `core/types` - Could be just `types`
- `core/auth` - Just re-exports Privy
- `core/accounts` - Just re-exports Safe
- `payments/transfers` - Minimal value, just wraps Safe

**Impact**: Cognitive overhead, harder to discover functionality

---

### 4. **Safe-Centric Design** ⚠️

**Problem**: Everything assumes Safe smart accounts

- Batch payments require Safe
- Streaming payments require Safe
- Transfers require Safe

**Impact**: Excludes developers using EOA wallets or other account abstraction

**Solution**: Make Safe optional, support EOA wallets

---

### 5. **Documentation Mismatch** ⚠️

**Problem**: Examples show incorrect usage

```typescript
// Docs show:
const aave = new AaveService({ chainId: 8453 }); // ❌ Wrong

// Actual:
const aave = new AaveService(publicClient, chainId); // ✅ Correct
```

**Impact**: Developers copy-paste broken code

---

### 6. **Export Complexity** ⚠️

**Problem**: Too many export paths, confusing defaults

- `@stashtab/sdk` - Everything (noisy)
- `@stashtab/sdk/yield` - Re-exports everything
- `@stashtab/sdk/core/accounts` - Deep nesting
- `@stashtab/sdk/safe` - Legacy path

**Impact**: Hard to know what to import

---

## Simplification Plan

### Phase 1: Standardize Service Creation

**Goal**: One consistent pattern for all services

**Pattern**:

```typescript
// Read-only services (no wallet needed)
const service = createService({ chainId, publicClient });

// Write services (wallet optional, lazy-loaded)
const service = createService({ chainId, publicClient, walletClient? });
```

**Changes**:

1. Make `walletClient` optional in all factory functions
2. Accept wallet client in method calls for write operations
3. Support both Safe and EOA wallets

---

### Phase 2: Simplify Structure

**Current**:

```
core/
  auth/      (just re-exports)
  accounts/  (just re-exports)
  types/     (could be root-level)
```

**Proposed**:

```
auth/        (direct, no core wrapper)
accounts/    (direct, no core wrapper)
types/       (root-level shared types)
```

**Rationale**: Remove unnecessary nesting

---

### Phase 3: Make Safe Optional

**Current**: Everything requires Safe

**Proposed**:

```typescript
// Option 1: Use Safe (current)
await transfer({ from: safeAddress, to, amount, token }, { walletClient });

// Option 2: Use EOA wallet
await transfer({ from: eoaAddress, to, amount, token }, { walletClient });

// Service detects account type automatically
```

---

### Phase 4: Clean Exports

**Current**: Everything exported from root, deep paths available

**Proposed**:

```typescript
// Main entry - clean, curated exports
import {
  createAaveService,
  createMorphoService,
  createStreamingService,
  // ... only essential exports
} from '@stashtab/sdk';

// Deep imports for advanced use
import { AaveService } from '@stashtab/sdk/yield/aave';
```

---

## Recommended Refactoring

### 1. Service Factory Pattern (Standardize)

```typescript
// All services follow this pattern:
interface ServiceConfig {
  chainId: number;
  publicClient: StashtabPublicClient;
  walletClient?: StashtabWalletClient; // Optional
}

function createService(config: ServiceConfig): Service {
  // Implementation
}
```

### 2. Account Abstraction Layer

```typescript
// Support multiple account types
type Account = SafeAccount | EOAAccount;

interface SafeAccount {
  type: 'safe';
  address: Address;
  walletClient: StashtabWalletClient;
}

interface EOAAccount {
  type: 'eoa';
  address: Address;
  walletClient: StashtabWalletClient;
}

// Services auto-detect and handle appropriately
```

### 3. Simplified Imports

```typescript
// Main SDK - clean exports
export {
  // Yield
  createAaveService,
  createMorphoService,
  createYieldRouter,

  // Payments
  createStreamingService,
  createBatchPaymentService,
  createTransferService,

  // Accounts
  deploySafe,
  predictSafeAddress,

  // Compliance
  createSanctionsService,
  createKYCService,

  // Types
  type TransactionResult,
  type PrimitiveConfig,
  // ...
} from './exports';
```

---

## Developer Experience Improvements

### 1. Zero-Config Quick Start

```typescript
import { createStashtabClient } from '@stashtab/sdk';

// Auto-configures everything
const client = createStashtabClient({
  chainId: 8453,
  rpcUrl: 'https://...', // Optional
});

// Services are pre-configured
const aave = client.yield.aave;
const payments = client.payments;
```

### 2. Progressive Enhancement

```typescript
// Level 1: Simple (auto-configured)
const client = createStashtabClient({ chainId: 8453 });

// Level 2: Custom RPC
const client = createStashtabClient({
  chainId: 8453,
  rpcUrl: customRpc,
});

// Level 3: Full control
const aave = createAaveService({
  chainId: 8453,
  publicClient: myPublicClient,
});
```

### 3. Type Safety Without Complexity

```typescript
// Types are inferred, no manual typing needed
const result = await aave.supply(usdcAddress, amount, safeAddress);
// result is automatically TransactionResult
```

---

## Third-Party Viability Checklist

- [x] Modular - Each primitive is independent
- [ ] Simple - Consistent patterns across all services
- [ ] Flexible - Works with Safe, EOA, or custom accounts
- [ ] Well-documented - Examples match actual API
- [ ] Type-safe - Full TypeScript support
- [ ] Framework-agnostic - Works with any framework
- [ ] Chain-agnostic - Multi-chain support
- [ ] Zero dependencies - Minimal external deps (only viem, config)

---

## Action Items

1. **Standardize service creation** - One pattern for all
2. **Make walletClient optional** - Lazy-load when needed
3. **Support EOA wallets** - Don't force Safe
4. **Simplify structure** - Remove unnecessary nesting
5. **Fix documentation** - Examples must match code
6. **Clean exports** - Clear main entry, deep imports for advanced
7. **Add convenience client** - Zero-config option for beginners

---

## Questions to Answer

1. **Do we need the "core" folder?** → Probably not, flatten it
2. **Should everything require Safe?** → No, make it optional
3. **Is the yield router too complex?** → Maybe, simplify or make it optional
4. **Are we exporting too much?** → Yes, curate main exports
5. **Should we have a convenience client?** → Yes, for beginners
