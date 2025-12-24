# Protocol Integrations

This document details the protocol integrations implemented in Stashtab v2.

## Implemented Integrations

### ✅ Sablier v2 Streaming Payments

**Status**: Fully implemented  
**Documentation**: https://docs.sablier.com/contracts/v2/core/lockup-linear  
**GraphQL API**: https://docs.sablier.com/api/overview

**Features**:

- Create linear payment streams
- Query stream information
- Calculate withdrawable amounts
- Cancel streams
- Full Safe integration for sender-side operations

**Contract Addresses**:

- Base Mainnet: `0xAFb979d9afAd1AD27C5eFf4E27226E3AB9e5d8F6`
- Base Sepolia: `0xAFb979d9afAd1AD27C5eFf4E27226E3AB9e5d8F6`

**Usage**:

```typescript
import { createStreamingPaymentService } from '@stashtab/sdk/payments/streaming';

const streaming = createStreamingPaymentService({ chainId: 8453 }, publicClient, walletClient);

const result = await streaming.createStream({
  sender: safeAddress,
  recipient: employeeAddress,
  token: usdcAddress,
  amount: parseUnits('5000', 6),
  startTime: Math.floor(Date.now() / 1000),
  endTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  cancelable: false,
  transferable: false,
  publicClient,
  walletClient,
  chainId: 8453,
});
```

**Note**: Recipient withdrawal operations require the recipient's wallet client, not the sender's Safe.

---

### ✅ Morpho Blue Yield Protocol

**Status**: Fully implemented  
**Documentation**: https://docs.morpho.org/  
**Contract Addresses**: https://docs.morpho.org/contracts/addresses

**Features**:

- Supply assets to Morpho markets
- Withdraw from Morpho positions
- Query market information
- Get user positions
- Calculate yield rates

**Contract Addresses**:

- Base Mainnet: `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb`
- Base Sepolia: `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb` (placeholder)

**Usage**:

```typescript
import { createMorphoService } from '@stashtab/sdk/yield/morpho';

const morpho = createMorphoService({ chainId: 8453 }, publicClient, walletClient);

// Define market parameters
const marketParams = {
  loanToken: usdcAddress,
  collateralToken: wethAddress,
  oracle: oracleAddress,
  irm: irmAddress,
  lltv: 800000000000000000n, // 80% LTV
};

// Supply to Morpho
await morpho.supply(marketParams, amount, safeAddress);

// Get position
const position = await morpho.getPosition(safeAddress, marketParams);
```

**Note**: Morpho requires market parameters (loan token, collateral token, oracle, IRM, LLTV) to identify markets. These must be provided by the caller.

---

### ✅ OFAC Sanctions Screening

**Status**: Partially implemented (Chainalysis integration structure)  
**Documentation**:

- Chainalysis: https://docs.chainalysis.com/
- Elliptic: https://www.elliptic.co/
- TRM Labs: https://www.trmlabs.com/

**Features**:

- Single address screening
- Bulk address screening
- Transaction validation hooks
- Configurable strict mode
- Multiple provider support (Chainalysis, Elliptic, TRM)

**Usage**:

```typescript
import { createSanctionsScreeningService } from '@stashtab/sdk/compliance/sanctions';

const screening = createSanctionsScreeningService({
  chainId: 8453,
  apiKey: process.env.CHAINALYSIS_API_KEY,
  provider: 'chainalysis',
});

// Check single address
const check = await screening.checkAddress(recipientAddress);
if (check.isSanctioned) {
  throw new Error('Address is sanctioned');
}

// Validate before transaction
const validation = await screening.validateForTransaction(recipientAddress);
if (!validation.allowed) {
  throw new Error('Transaction blocked: sanctioned address');
}
```

**Implementation Status**:

- ✅ Service structure and interfaces
- ✅ Chainalysis API integration structure
- ⚠️ Requires API key for production use
- ⚠️ Other providers (Elliptic, TRM) need implementation

---

## Contract Address Verification

**⚠️ Important**: The contract addresses in `packages/config/src/addresses.ts` should be verified against official protocol documentation:

1. **Sablier**: Verify at https://docs.sablier.com/contracts/v2/deployments
2. **Morpho**: Verify at https://docs.morpho.org/contracts/addresses
3. **Aave**: Already verified (existing integration)

If addresses differ, update `packages/config/src/addresses.ts` accordingly.

---

## Integration Best Practices

### Error Handling

All integrations include comprehensive error handling:

```typescript
try {
  const result = await service.operation(...);
  if (!result.success) {
    // Handle error from result.error
  }
} catch (error) {
  // Handle exception
}
```

### Gas Optimization

- **Batch Payments**: Uses Safe MultiSend for gas optimization
- **Streaming**: Single transaction for stream creation
- **Yield**: Direct protocol calls (no intermediate contracts)

### Security

- All transactions go through Safe smart accounts
- Token approvals are handled automatically
- Sanctions screening before transactions (when configured)

---

## Testing

Each integration should be tested:

1. **Unit Tests**: Test service methods with mocked clients
2. **Integration Tests**: Test against testnet contracts
3. **E2E Tests**: Test full flows with real transactions (testnet)

---

## Future Enhancements

### Sablier

- [ ] GraphQL indexer integration for `getUserStreams`
- [ ] Event parsing for stream creation
- [ ] Support for LockupDynamic (non-linear streams)

### Morpho

- [ ] Market discovery/listing
- [ ] IRM integration for accurate APY calculation
- [ ] Position health factor calculation

### Sanctions

- [ ] Elliptic API integration
- [ ] TRM Labs API integration
- [ ] Local caching for performance
- [ ] Rate limiting and retry logic

---

## References

- [Sablier v2 Documentation](https://docs.sablier.com/)
- [Morpho Blue Documentation](https://docs.morpho.org/)
- [Chainalysis API Documentation](https://docs.chainalysis.com/)
- [Aave v3 Documentation](https://docs.aave.com/)
