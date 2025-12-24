# Demo Example

This directory contains minimal working examples for quickly trying Stashtab features.

## Examples

### Basic API Call

```typescript
import api from '@stashtab/sdk';

// Get account balance
const response = await api.getAccount();
console.log(response.data.balance.totalBalance);
```

### Generate QR Code

```typescript
import { QRCodeSVG } from 'qrcode.react';

function DepositQR({ address }: { address: string }) {
  return <QRCodeSVG value={address} size={200} />;
}
```

### Calculate Yield

```typescript
function calculateYield(amount: number, apy: number, days: number) {
  const yearlyYield = amount * (apy / 100);
  return (yearlyYield / 365) * days;
}

const yieldAmount = calculateYield(1000, 5.2, 30); // $4.27 for 30 days
```

## Integration Examples

See the main [examples](../README.md) directory for complete configuration examples.

## API Reference

For full API documentation, see [docs/API.md](../../docs/API.md).
