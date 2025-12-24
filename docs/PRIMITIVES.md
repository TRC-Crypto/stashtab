# Primitives Guide

This document provides a deep dive into each Stashtab primitive module, when to use them, and how to compose them.

## Overview

Stashtab is organized as composable primitives. Each primitive is a self-contained module that solves one specific problem in onchain finance.

## Core Primitives

### Auth (`core/auth`)

**Purpose**: User authentication and session management

**When to use**:

- User login/signup flows
- Session management
- Identity verification

**Integrations**: Privy, passkeys, social login, wallet connection

**Example**:

```typescript
import { verifyPrivyToken } from '@stashtab/sdk/core/auth';

const user = await verifyPrivyToken(token);
```

---

### Accounts (`core/accounts`)

**Purpose**: Account abstraction and smart account management

**When to use**:

- Deploying Safe smart accounts
- Managing account ownership
- Session keys and permissions

**Integrations**: Safe Protocol

**Example**:

```typescript
import { deploySafe } from '@stashtab/sdk/core/accounts';

const safe = await deploySafe({
  owners: [userAddress],
  threshold: 1,
  chainId: 8453,
});
```

---

### Types (`core/types`)

**Purpose**: Shared types and schemas

**When to use**: Imported by other modules, not directly used

**Includes**: Base types, transaction results, validation types

---

## Yield Primitives

### Aave (`yield/aave`)

**Purpose**: Aave v3 protocol integration

**When to use**:

- Supply assets to earn yield
- Borrow against collateral
- Check APY rates
- Withdraw supplied assets

**Supported chains**: Base, Arbitrum, Optimism, Polygon

**Example**:

```typescript
import { createAaveService } from '@stashtab/sdk/yield/aave';
import { createStashtabPublicClient } from '@stashtab/sdk/client';

const publicClient = createStashtabPublicClient(8453);
const aave = createAaveService({ chainId: 8453, publicClient });
const yieldRate = await aave.getYieldRate();
```

---

### Morpho (`yield/morpho`)

**Purpose**: Morpho Finance protocol integration

**When to use**:

- Peer-to-peer lending markets
- Alternative yield source to Aave
- Higher APY opportunities (with different risk profiles)

**Supported chains**: Base, Arbitrum, Optimism (mainnet only)

**Example**:

```typescript
import { createMorphoService } from '@stashtab/sdk/yield/morpho';

const morpho = createMorphoService({ chainId: 8453 });
await morpho.supply('wETH-USDC', amount);
```

---

### Yield Router (`yield/router`)

**Purpose**: Multi-protocol yield optimization

**When to use**:

- Automatically route deposits to best APY
- Compare protocols side-by-side
- Risk-adjusted yield selection
- Multi-protocol diversification

**Strategies**:

- `highest-apy`: Route to highest APY protocol
- `lowest-risk`: Route to safest protocol
- `balanced`: Balance APY and risk
- `manual`: Let user choose

**Example**:

```typescript
import { createYieldRouter } from '@stashtab/sdk/yield/router';

const router = createYieldRouter({
  chainId: 8453,
  strategy: 'highest-apy',
});

const recommendation = await router.recommend(usdcAddress, amount);
await router.deposit(usdcAddress, amount, routerConfig);
```

---

## Payment Primitives

### Transfers (`payments/transfers`)

**Purpose**: Basic stablecoin transfers

**When to use**:

- Single transfers between addresses
- Simple send functionality
- Direct token transfers

**Example**:

```typescript
import { createTransferService } from '@stashtab/sdk/payments/transfers';

const transfer = createTransferService({ chainId: 8453 });
await transfer.transfer({
  from: senderAddress,
  to: recipientAddress,
  amount: parseUnits('100', 6),
  token: usdcAddress,
});
```

---

### Batch Payments (`payments/batch`)

**Purpose**: Bulk payment processing with gas optimization

**When to use**:

- Payroll systems
- Distributing rewards
- Bulk payouts
- Airdrops

**Features**:

- Gas optimization strategies
- Partial failure handling
- Progress tracking

**Example**:

```typescript
import { createBatchPaymentService } from '@stashtab/sdk/payments/batch';

const batch = createBatchPaymentService({ chainId: 8453 });
const result = await batch.execute({
  from: senderAddress,
  payments: [
    { to: address1, amount: amount1 },
    { to: address2, amount: amount2 },
    // ... more payments
  ],
  gasOptimization: true,
});
```

---

### Streaming Payments (`payments/streaming`)

**Purpose**: Sablier-based streaming payments

**When to use**:

- Salary streaming
- Subscription payments
- Vesting schedules
- Continuous payouts

**Example**:

```typescript
import { createStreamingPaymentService } from '@stashtab/sdk/payments/streaming';

const streaming = createStreamingPaymentService({ chainId: 8453 });
const stream = await streaming.createStream({
  recipient: employeeAddress,
  token: usdcAddress,
  amount: parseUnits('5000', 6),
  startTime: now,
  endTime: now + 30 * 24 * 60 * 60, // 30 days
});
```

---

## Fiat Primitives

### Onramp (`fiat/onramp`)

**Purpose**: Convert fiat to crypto

**When to use**:

- User deposits
- Buying crypto with card/bank
- Initial funding

**Supported providers**: Stripe, MoonPay, Coinbase, Transak

**Example**:

```typescript
import { createOnrampService } from '@stashtab/sdk/fiat/onramp';

const onramp = createOnrampService({ chainId: 8453 });
const quote = await onramp.getBestRate({
  fiatAmount: 100,
  fiatCurrency: 'USD',
  cryptoCurrency: 'USDC',
  recipientAddress: userAddress,
});
```

---

### Offramp (`fiat/offramp`)

**Purpose**: Convert crypto to fiat

**When to use**:

- User withdrawals
- Cashing out
- Bank transfers

**Supported providers**: Stripe, MoonPay, Coinbase, Transak

**Example**:

```typescript
import { createOfframpService } from '@stashtab/sdk/fiat/offramp';

const offramp = createOfframpService({ chainId: 8453 });
const withdrawal = await offramp.withdraw({
  from: userAddress,
  cryptoAmount: parseUnits('100', 6),
  cryptoCurrency: 'USDC',
  fiatCurrency: 'USD',
  bankAccount: { accountNumber: '...', routingNumber: '...' },
});
```

---

## Compliance Primitives

### KYC (`compliance/kyc`)

**Purpose**: Know Your Customer verification

**When to use**:

- User onboarding
- Compliance requirements
- Risk assessment

**Supported providers**: Persona, Sumsub

**Example**:

```typescript
import { createPersonaService } from '@stashtab/sdk/compliance/kyc';

const kyc = createPersonaService({ apiKey: '...' });
const session = await kyc.createSession({ userId: '...' });
```

---

### Sanctions Screening (`compliance/sanctions`)

**Purpose**: OFAC and sanctions list screening

**When to use**:

- Before transactions
- User onboarding
- Compliance checks

**Example**:

```typescript
import { createSanctionsScreeningService } from '@stashtab/sdk/compliance/sanctions';

const screening = createSanctionsScreeningService({ chainId: 8453 });
const check = await screening.checkAddress(recipientAddress);
if (check.isSanctioned) {
  throw new Error('Address is sanctioned');
}
```

---

### Reporting (`compliance/reporting`)

**Purpose**: Transaction reporting and compliance events

**When to use**:

- Audit trails
- Regulatory reporting
- Transaction history
- Compliance monitoring

**Example**:

```typescript
import { createComplianceReportingService } from '@stashtab/sdk/compliance/reporting';

const reporting = createComplianceReportingService({
  chainId: 8453,
  enabled: true,
});

await reporting.recordTransaction({
  txHash: '0x...',
  from: senderAddress,
  to: recipientAddress,
  amount: parseUnits('100', 6),
  type: 'transfer',
  timestamp: Date.now(),
});
```

---

## Composition Patterns

### Neobank Pattern

```typescript
// Combine: accounts + yield + payments + fiat + compliance
const safe = await deploySafe({ owners: [userAddress] });
const aave = new AaveService({ chainId: 8453 });
await aave.supply('USDC', depositAmount, safe.address);
const onramp = createOnrampService({ chainId: 8453 });
// ... etc
```

### Payroll Pattern

```typescript
// Combine: payments (batch or streaming) + compliance
const batch = createBatchPaymentService({ chainId: 8453 });
const reporting = createComplianceReportingService({ chainId: 8453 });
// Process payroll with compliance tracking
```

### Treasury Pattern

```typescript
// Combine: yield router + accounts + reporting
const router = createYieldRouter({ chainId: 8453, strategy: 'balanced' });
await router.deposit(usdcAddress, treasuryAmount, config);
// Track all yield operations
```

---

## Architecture Decisions

### Why Primitives?

Primitives enable:

- **Composability**: Mix and match what you need
- **Flexibility**: No lock-in to one stack
- **Maintainability**: Small, focused modules
- **Testability**: Each primitive can be tested independently

### Why Multi-Chain?

Finance is global. Different chains offer different advantages:

- **Base**: Low fees, Coinbase ecosystem
- **Arbitrum**: High throughput, low latency
- **Optimism**: EVM compatibility, ecosystem
- **Polygon**: Mass market access

### Why Multiple Yield Protocols?

Different protocols serve different needs:

- **Aave**: Battle-tested, deep liquidity
- **Morpho**: Peer-to-peer, potentially higher yields
- **Router**: Optimize across protocols

---

## Getting Started

1. **Identify your needs**: Which primitives do you need?
2. **Install SDK**: `pnpm add @stashtab/sdk`
3. **Import primitives**: `import { ... } from '@stashtab/sdk/[primitive]'`
4. **Compose**: Combine primitives into your product
5. **Deploy**: Ship your financial product

See [EXAMPLES.md](./EXAMPLES.md) for complete implementation patterns.
