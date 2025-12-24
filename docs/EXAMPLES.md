# Implementation Examples

Common patterns for building financial products with Stashtab primitives.

## Neobank Implementation

A full-featured neobank combining all primitives.

```typescript
import { createStashtabPublicClient } from '@stashtab/sdk/client';
import { deploySafe } from '@stashtab/sdk/core/accounts';
import { createAaveService } from '@stashtab/sdk/yield/aave';
import { createOnrampService } from '@stashtab/sdk/fiat/onramp';
import { createTransferService } from '@stashtab/sdk/payments/transfers';
import { createPersonaService } from '@stashtab/sdk/compliance/kyc';

// Initialize clients
const publicClient = createStashtabPublicClient(8453);
const chainId = 8453;

// 1. User onboarding
async function onboardUser(userAddress: string) {
  // Deploy Safe account
  const safe = await deploySafe({
    owners: [userAddress],
    threshold: 1,
    chainId,
  });

  // KYC verification
  const kyc = createPersonaService({ apiKey: process.env.PERSONA_API_KEY });
  const session = await kyc.createSession({ userId: safe.address });

  return { safeAddress: safe.address, kycSession: session.id };
}

// 2. Deposit flow
async function deposit(amount: bigint, userSafeAddress: string) {
  // Supply to Aave automatically
  const aave = createAaveService({ chainId, publicClient });
  // Note: AaveService doesn't have a supply method - use Aave operations directly
  // This is a placeholder for the actual implementation
}

// 3. Yield earning
async function getBalance(userSafeAddress: string) {
  const aave = createAaveService({ chainId, publicClient });
  const yieldRate = await aave.getYieldRate();
  const balance = await aave.getUserBalance(userSafeAddress, 0n);
  return {
    total: balance.totalBalance,
    yieldEarned: balance.yieldEarned,
    apy: yieldRate.apyPercent,
  };
}

// 4. Send money
async function sendMoney(from: string, to: string, amount: bigint) {
  const transfer = createTransferService({ chainId: 8453 });
  return await transfer.transfer({
    from,
    to,
    amount,
    token: USDC_ADDRESS,
  });
}

// 5. Fiat onramp
async function buyCrypto(fiatAmount: number, recipientAddress: string) {
  const onramp = createOnrampService({ chainId: 8453 });
  const quote = await onramp.getBestRate({
    fiatAmount,
    fiatCurrency: 'USD',
    cryptoCurrency: 'USDC',
    recipientAddress,
  });
  const order = await onramp.createOrder({
    ...quote,
    provider: quote.provider,
  });
  return order.checkoutUrl;
}
```

---

## Payroll Platform

Streaming or batch payments for employee compensation.

### Streaming Payroll

```typescript
import { createStreamingPaymentService } from '@stashtab/sdk/payments/streaming';
import { createComplianceReportingService } from '@stashtab/sdk/compliance/reporting';

async function setupEmployeePayroll(employeeAddress: string, monthlySalary: bigint) {
  const streaming = createStreamingPaymentService({ chainId: 8453 });
  const reporting = createComplianceReportingService({ chainId: 8453 });

  // Create monthly salary stream
  const now = Math.floor(Date.now() / 1000);
  const stream = await streaming.createStream({
    recipient: employeeAddress,
    token: USDC_ADDRESS,
    amount: monthlySalary,
    startTime: now,
    endTime: now + 30 * 24 * 60 * 60, // 30 days
    cancelable: false,
  });

  // Record for compliance
  await reporting.recordTransaction({
    txHash: stream.txHash!,
    from: COMPANY_ADDRESS,
    to: employeeAddress,
    amount: monthlySalary,
    type: 'transfer',
    timestamp: now,
    metadata: { type: 'salary', streamId: stream.streamId },
  });

  return stream.streamId;
}
```

### Batch Payroll

```typescript
import { createBatchPaymentService } from '@stashtab/sdk/payments/batch';

async function processPayroll(employees: Array<{ address: string; amount: bigint }>) {
  const batch = createBatchPaymentService({ chainId: 8453 });

  const payments = employees.map((emp) => ({
    to: emp.address,
    amount: emp.amount,
    id: `payroll-${emp.address}-${Date.now()}`,
  }));

  const result = await batch.execute({
    from: COMPANY_SAFE_ADDRESS,
    payments,
    gasOptimization: true,
  });

  return {
    successful: result.successfulPayments,
    failed: result.failedPayments,
    txHash: result.txHash,
  };
}
```

---

## Treasury Management

Corporate cash management with yield optimization.

```typescript
import { createYieldRouter } from '@stashtab/sdk/yield/router';
import { deploySafe } from '@stashtab/sdk/core/accounts';
import { createComplianceReportingService } from '@stashtab/sdk/compliance/reporting';

async function setupTreasury(owners: string[], initialDeposit: bigint) {
  // Deploy multi-sig Safe for treasury
  const treasury = await deploySafe({
    owners,
    threshold: Math.ceil(owners.length / 2), // Majority
    chainId: 8453,
  });

  // Setup yield router
  const router = createYieldRouter({
    chainId: 8453,
    strategy: 'balanced', // Balance APY and risk
    riskTolerance: 'low',
  });

  // Get yield recommendation
  const recommendation = await router.recommend(USDC_ADDRESS, initialDeposit, {
    strategy: 'balanced',
    chainId: 8453,
  });

  // Route deposit to optimal protocol
  await router.deposit(USDC_ADDRESS, initialDeposit, {
    strategy: 'balanced',
    chainId: 8453,
  });

  return {
    treasuryAddress: treasury.address,
    recommendedProtocol: recommendation.recommendedProtocol,
    expectedAPY: recommendation.expectedAPY,
  };
}

async function rebalanceTreasury(treasuryAddress: string, amount: bigint) {
  const router = createYieldRouter({
    chainId: 8453,
    strategy: 'highest-apy',
  });

  // Get current opportunities
  const opportunities = await router.getOpportunities(USDC_ADDRESS);

  // Route to highest APY
  await router.deposit(USDC_ADDRESS, amount, {
    strategy: 'highest-apy',
    chainId: 8453,
  });
}
```

---

## Remittance App

Cross-border money transfers with fiat on/off ramps.

```typescript
import { createTransferService } from '@stashtab/sdk/payments/transfers';
import { createOnrampService } from '@stashtab/sdk/fiat/onramp';
import { createOfframpService } from '@stashtab/sdk/fiat/offramp';
import { createSanctionsScreeningService } from '@stashtab/sdk/compliance/sanctions';
import { createPersonaService } from '@stashtab/sdk/compliance/kyc';

async function sendRemittance(
  senderAddress: string,
  recipientAddress: string,
  fiatAmount: number,
  fiatCurrency: string
) {
  // 1. KYC check (if required)
  const kyc = createPersonaService({ apiKey: process.env.PERSONA_API_KEY });
  const senderKYC = await kyc.getStatus(senderAddress);
  if (!senderKYC.verified) {
    throw new Error('Sender must complete KYC');
  }

  // 2. Sanctions screening
  const screening = createSanctionsScreeningService({ chainId: 8453 });
  const check = await screening.checkAddress(recipientAddress);
  if (check.isSanctioned) {
    throw new Error('Cannot send to sanctioned address');
  }

  // 3. Convert fiat to crypto (onramp)
  const onramp = createOnrampService({ chainId: 8453 });
  const quote = await onramp.getBestRate({
    fiatAmount,
    fiatCurrency,
    cryptoCurrency: 'USDC',
    recipientAddress: senderAddress, // Fund sender first
  });
  const order = await onramp.createOrder({ ...quote, provider: quote.provider });

  // 4. Wait for onramp completion, then transfer
  // (In production, use webhooks or polling)
  const transfer = createTransferService({ chainId: 8453 });
  const cryptoAmount = parseUnits(quote.cryptoAmount.toString(), 6);
  await transfer.transfer({
    from: senderAddress,
    to: recipientAddress,
    amount: cryptoAmount,
    token: USDC_ADDRESS,
  });

  // 5. Recipient can offramp to their local currency
  return {
    orderId: order.orderId,
    cryptoAmount,
    recipientAddress,
  };
}

async function cashOut(recipientAddress: string, cryptoAmount: bigint, targetCurrency: string) {
  const offramp = createOfframpService({ chainId: 8453 });
  const withdrawal = await offramp.withdraw({
    from: recipientAddress,
    cryptoAmount,
    cryptoCurrency: 'USDC',
    fiatCurrency: targetCurrency,
  });
  return withdrawal;
}
```

---

## Payment Settlement Platform

Merchant settlement with batch processing.

```typescript
import { createBatchPaymentService } from '@stashtab/sdk/payments/batch';
import { createYieldRouter } from '@stashtab/sdk/yield/router';

async function settleMerchantPayments(
  merchantPayments: Array<{ merchantId: string; amount: bigint }>
) {
  const batch = createBatchPaymentService({ chainId: 8453 });

  // Convert merchant IDs to addresses (from your DB)
  const payments = merchantPayments.map((payment) => ({
    to: getMerchantAddress(payment.merchantId),
    amount: payment.amount,
    id: `settlement-${payment.merchantId}-${Date.now()}`,
  }));

  // Execute batch settlement
  const result = await batch.execute({
    from: SETTLEMENT_SAFE_ADDRESS,
    payments,
    gasOptimization: true,
  });

  // Auto-invest remaining funds in yield
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0n);
  const remaining = (await getBalance(SETTLEMENT_SAFE_ADDRESS)) - totalPaid;

  if (remaining > MIN_YIELD_DEPOSIT) {
    const router = createYieldRouter({
      chainId: 8453,
      strategy: 'highest-apy',
    });
    await router.deposit(USDC_ADDRESS, remaining, {
      strategy: 'highest-apy',
      chainId: 8453,
    });
  }

  return result;
}
```

---

## Savings App

Simple yield-earning savings account.

```typescript
import { deploySafe } from '@stashtab/sdk/core/accounts';
import { createYieldRouter } from '@stashtab/sdk/yield/router';
import { createOnrampService } from '@stashtab/sdk/fiat/onramp';
import { createOfframpService } from '@stashtab/sdk/fiat/offramp';

class SavingsApp {
  private router = createYieldRouter({
    chainId: 8453,
    strategy: 'balanced',
  });

  async createAccount(userAddress: string) {
    const safe = await deploySafe({
      owners: [userAddress],
      threshold: 1,
      chainId: 8453,
    });
    return safe.address;
  }

  async deposit(accountAddress: string, amount: bigint) {
    // Route to best yield protocol
    await this.router.deposit(USDC_ADDRESS, amount, {
      strategy: 'highest-apy',
      chainId: 8453,
    });
  }

  async getBalance(accountAddress: string) {
    const opportunities = await this.router.getOpportunities(USDC_ADDRESS);
    // Sum balances across protocols
    // Return total balance and yield earned
  }

  async withdraw(accountAddress: string, amount: bigint) {
    // Withdraw from yield protocol
    // Return to user's Safe
  }
}
```

---

## Best Practices

### Error Handling

Always handle errors gracefully:

```typescript
try {
  await transfer.transfer({ from, to, amount, token });
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    // Handle insufficient funds
  } else if (error.code === 'RATE_LIMITED') {
    // Retry with backoff
  } else {
    // Log and alert
  }
}
```

### Gas Optimization

Use batch payments when possible:

```typescript
// Instead of multiple transfers
for (const payment of payments) {
  await transfer.transfer(payment); // Expensive
}

// Use batch payment
await batch.execute({ payments }); // Optimized
```

### Compliance

Always screen addresses and record transactions:

```typescript
// Screen before transaction
const check = await screening.checkAddress(recipientAddress);
if (check.isSanctioned) {
  throw new Error('Sanctioned address');
}

// Record after transaction
await reporting.recordTransaction({
  txHash,
  from,
  to,
  amount,
  type: 'transfer',
});
```

---

## Next Steps

1. Choose your pattern based on use case
2. Adapt the code to your needs
3. Add your business logic
4. Deploy and iterate

For more details on specific primitives, see [PRIMITIVES.md](./PRIMITIVES.md).
