# Stashtab UI Components Guide

Complete guide to using Stashtab React components in your application.

## Overview

`@stashtab/ui` provides drop-in React components for adding onchain finance capabilities to any React app. All components are:

- **Zero-config**: Auto-initialize SDK client
- **Themeable**: Via CSS variables or Tailwind config
- **Type-safe**: Full TypeScript support
- **Framework-agnostic**: Works with Next.js, Vite, CRA, etc.

## Setup

### 1. Install Dependencies

```bash
pnpm add @stashtab/ui @stashtab/sdk
```

### 2. Wrap Your App

```tsx
import { StashtabProvider } from '@stashtab/ui';

function App() {
  return (
    <StashtabProvider config={{ chainId: 8453 }}>
      <YourApp />
    </StashtabProvider>
  );
}
```

## Components

### AccountBalance

Displays account balance with yield earned.

**Props:**

- `address` (required): Account address
- `showYield` (optional): Show yield earned (default: true)
- `className` (optional): Additional CSS classes

**Example:**

```tsx
<AccountBalance address={userAddress} showYield={true} />
```

### DepositButton

Button that opens a modal with QR code for receiving deposits.

**Props:**

- `address` (required): Account address to receive funds
- `token` (optional): Token address (defaults to native/USDC)
- `className` (optional): Additional CSS classes
- `buttonText` (optional): Button text (default: "Deposit")

**Example:**

```tsx
<DepositButton address={userSafeAddress} buttonText="Receive Funds" />
```

### SendForm

Form for sending payments with validation.

**Props:**

- `from` (required): Sender address
- `defaultToken` (optional): Default token address
- `onSuccess` (optional): Callback on successful send
- `onError` (optional): Callback on error
- `className` (optional): Additional CSS classes

**Example:**

```tsx
<SendForm
  from={userAddress}
  defaultToken={usdcAddress}
  onSuccess={(txHash) => console.log('Sent!', txHash)}
  onError={(error) => console.error('Error:', error)}
/>
```

### YieldDisplay

Shows current APY and yield opportunities.

**Props:**

- `asset` (required): Asset address
- `showOpportunities` (optional): Show other opportunities (default: false)
- `className` (optional): Additional CSS classes

**Example:**

```tsx
<YieldDisplay asset={usdcAddress} showOpportunities={true} />
```

## Hooks

### useStashtabClient

Access the Stashtab SDK client.

```tsx
const client = useStashtabClient();
const apy = await client.yield.aave.getYieldRate();
```

### useBalance

Fetch account balance and yield information.

**Returns:**

- `balance`: Safe balance
- `yieldEarned`: Yield earned
- `totalBalance`: Total balance (safe + yield)
- `apy`: Current APY percentage
- `loading`: Loading state
- `error`: Error state
- `refresh`: Function to refresh data

**Example:**

```tsx
const { balance, apy, loading } = useBalance(userAddress);
```

### useAccount

Manage account information.

**Returns:**

- `address`: Account address
- `info`: Account info object
- `loading`: Loading state
- `error`: Error state
- `refresh`: Function to refresh data

**Example:**

```tsx
const { address, info, loading } = useAccount(userAddress);
```

### useYield

Fetch yield rates and opportunities.

**Returns:**

- `apy`: Current APY
- `opportunities`: Array of yield opportunities
- `loading`: Loading state
- `error`: Error state
- `refresh`: Function to refresh data

**Example:**

```tsx
const { apy, opportunities } = useYield(usdcAddress);
```

### usePayments

Send payments.

**Returns:**

- `sending`: Sending state
- `error`: Error state
- `send`: Function to send payment

**Example:**

```tsx
const { send, sending } = usePayments();

const handleSend = async () => {
  const result = await send(recipientAddress, 1000n, usdcAddress);
  if (result?.success) {
    console.log('Sent!', result.txHash);
  }
};
```

## Complete Example

```tsx
import {
  StashtabProvider,
  AccountBalance,
  DepositButton,
  SendForm,
  YieldDisplay,
} from '@stashtab/ui';

function NeobankApp() {
  const userAddress = '0x...'; // User's Safe address

  return (
    <StashtabProvider config={{ chainId: 8453 }}>
      <div className="container mx-auto p-4">
        <h1>My Neobank</h1>

        <div className="my-4">
          <AccountBalance address={userAddress} />
        </div>

        <div className="my-4">
          <YieldDisplay asset={usdcAddress} />
        </div>

        <div className="my-4 flex gap-4">
          <DepositButton address={userAddress} />
        </div>

        <div className="my-4">
          <SendForm from={userAddress} />
        </div>
      </div>
    </StashtabProvider>
  );
}
```

## Theming

Components use Tailwind CSS classes. Customize via:

1. **CSS Variables**: Override Tailwind config
2. **Tailwind Config**: Extend theme in `tailwind.config.js`
3. **Component Props**: Pass `className` prop for custom styling

## Framework Integration

### Next.js

Works out of the box. Use in `app/` or `pages/` directory.

### Vite

Install and use normally. No special configuration needed.

### Create React App

Works with CRA. May need to configure Tailwind CSS.

## TypeScript

All components and hooks are fully typed. Import types as needed:

```tsx
import type { AccountBalanceProps, UseBalanceResult } from '@stashtab/ui';
```
