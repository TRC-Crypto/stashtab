# Stashtab v2 Migration Guide

This document outlines the changes in Stashtab v2 and how to migrate from v1.

## Overview

Stashtab v2 introduces a new modular primitive architecture, shifting from a "neobank stack" to "onchain finance primitives."

## What Changed

### Philosophy

**v1**: "Neobank-in-a-Box" - Complete stack for building DeFi neobanks  
**v2**: "Onchain Finance Primitives" - Composable infrastructure for any financial product

### Package Structure

The SDK is now organized into modular primitives:

```
packages/sdk/src/
├── core/              # Core infrastructure
│   ├── auth/         # Authentication
│   ├── accounts/     # Account abstraction
│   └── types/        # Shared types
├── yield/            # Yield generation
│   ├── (aave)       # Aave v3 (existing)
│   ├── morpho/      # Morpho Finance (new)
│   └── router/      # Yield routing (new)
├── payments/         # Payment primitives
│   ├── transfers/   # Basic transfers
│   ├── batch/       # Batch payments (new)
│   └── streaming/   # Streaming payments (new)
├── fiat/             # Fiat primitives
│   ├── onramp/      # Fiat to crypto
│   └── offramp/     # Crypto to fiat
└── compliance/       # Compliance primitives
    ├── (kyc)        # KYC (existing)
    ├── sanctions/   # Sanctions screening (new)
    └── reporting/   # Transaction reporting (new)
```

### Multi-Chain Support

v2 adds support for multiple chains:

- Base (existing)
- Arbitrum (new)
- Optimism (new)
- Polygon (new)

## Migration Path

### Backward Compatibility

All v1 exports remain available for backward compatibility:

```typescript
// v1 style (still works)
import { AaveService } from '@stashtab/sdk';
import { deploySafe } from '@stashtab/sdk';
import { createPersonaService } from '@stashtab/sdk/kyc';
```

### New Primitive-Based Imports

v2 introduces organized primitive exports:

```typescript
// v2 style (recommended)
import { AaveService } from '@stashtab/sdk/yield';
import { deploySafe } from '@stashtab/sdk/core/accounts';
import { createPersonaService } from '@stashtab/sdk/compliance';
```

### Multi-Chain Usage

v2 requires specifying chainId:

```typescript
// v1 (Base only)
const aave = new AaveService(publicClient);

// v2 (multi-chain)
const aave = new AaveService(publicClient, 8453); // Base
const aave = new AaveService(publicClient, 42161); // Arbitrum
```

## New Features

### Yield Router

```typescript
import { createYieldRouter } from '@stashtab/sdk/yield/router';

const router = createYieldRouter({
  chainId: 8453,
  strategy: 'highest-apy',
});

const recommendation = await router.recommend(usdcAddress, amount);
```

### Batch Payments

```typescript
import { createBatchPaymentService } from '@stashtab/sdk/payments/batch';

const batch = createBatchPaymentService({ chainId: 8453 });
await batch.execute({
  from: senderAddress,
  payments: [
    { to: address1, amount: amount1 },
    { to: address2, amount: amount2 },
  ],
});
```

### Streaming Payments

```typescript
import { createStreamingPaymentService } from '@stashtab/sdk/payments/streaming';

const streaming = createStreamingPaymentService({ chainId: 8453 });
await streaming.createStream({
  recipient: employeeAddress,
  token: usdcAddress,
  amount: monthlySalary,
  startTime: now,
  endTime: now + 30 * 24 * 60 * 60,
});
```

### Sanctions Screening

```typescript
import { createSanctionsScreeningService } from '@stashtab/sdk/compliance/sanctions';

const screening = createSanctionsScreeningService({ chainId: 8453 });
const check = await screening.checkAddress(recipientAddress);
```

## Breaking Changes

### None (for now)

v2 maintains full backward compatibility. All v1 code will continue to work.

Future versions may deprecate old exports in favor of the new primitive structure.

## Timeline

- **v2.0.0**: New primitive structure (backward compatible)
- **v2.1.0**: New primitive implementations (Morpho, batch payments, etc.)
- **v3.0.0**: Deprecate old exports (future)

## Need Help?

- See [PRIMITIVES.md](docs/PRIMITIVES.md) for detailed primitive documentation
- See [EXAMPLES.md](docs/EXAMPLES.md) for implementation patterns
- Open an issue on GitHub for questions
