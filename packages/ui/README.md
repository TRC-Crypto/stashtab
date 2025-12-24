# @stashtab/ui

React component library for Stashtab. Drop-in components for adding onchain finance capabilities to any React app.

## Installation

```bash
pnpm add @stashtab/ui @stashtab/sdk
```

## Quick Start

```tsx
import { StashtabProvider, AccountBalance, DepositButton } from '@stashtab/ui';

function App() {
  return (
    <StashtabProvider config={{ chainId: 8453 }}>
      <AccountBalance address={userAddress} />
      <DepositButton address={userAddress} />
    </StashtabProvider>
  );
}
```

## Components

### AccountBalance

Display account balance with yield earned.

```tsx
import { AccountBalance } from '@stashtab/ui';

<AccountBalance address={userAddress} showYield={true} />;
```

### DepositButton

Button that opens a modal with QR code for receiving deposits.

```tsx
import { DepositButton } from '@stashtab/ui';

<DepositButton address={userSafeAddress} buttonText="Receive Funds" />;
```

### SendForm

Form for sending payments with validation.

```tsx
import { SendForm } from '@stashtab/ui';

<SendForm
  from={userAddress}
  defaultToken={usdcAddress}
  onSuccess={(txHash) => console.log('Sent!', txHash)}
/>;
```

### YieldDisplay

Shows current APY and yield opportunities.

```tsx
import { YieldDisplay } from '@stashtab/ui';

<YieldDisplay asset={usdcAddress} showOpportunities={true} />;
```

## Hooks

### useStashtabClient

Access the Stashtab SDK client.

```tsx
import { useStashtabClient } from '@stashtab/ui';

function MyComponent() {
  const client = useStashtabClient();
  const apy = await client.yield.aave.getYieldRate();
}
```

### useBalance

Fetch account balance and yield information.

```tsx
import { useBalance } from '@stashtab/ui';

function BalanceDisplay() {
  const { balance, apy, loading } = useBalance(userAddress);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      Balance: {balance} USDC @ {apy}% APY
    </div>
  );
}
```

### useAccount

Manage account information.

```tsx
import { useAccount } from '@stashtab/ui';

function AccountDisplay() {
  const { address, info, loading } = useAccount(userAddress);

  if (loading) return <div>Loading...</div>;
  return <div>Account: {address}</div>;
}
```

### useYield

Fetch yield rates and opportunities.

```tsx
import { useYield } from '@stashtab/ui';

function YieldDisplay() {
  const { apy, opportunities } = useYield(usdcAddress);

  return <div>Current APY: {apy}%</div>;
}
```

### usePayments

Send payments.

```tsx
import { usePayments } from '@stashtab/ui';

function SendButton() {
  const { send, sending } = usePayments();

  const handleSend = async () => {
    const result = await send(recipientAddress, 1000n);
    if (result?.success) {
      console.log('Sent!', result.txHash);
    }
  };

  return (
    <button onClick={handleSend} disabled={sending}>
      Send
    </button>
  );
}
```

## Theming

Components use Tailwind CSS classes and can be customized via CSS variables or Tailwind config.

## Requirements

- React 18+
- TypeScript 5+
- Works with Next.js, Vite, Create React App, and other React frameworks
