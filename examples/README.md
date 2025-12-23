# Stashtab Configuration Examples

This directory contains example configurations for different deployment scenarios.

## Examples

### 1. Basic (`./basic/`)

Minimal setup for getting started. No fiat integration, no KYC - just core yield functionality.

**Best for:**

- Learning the platform
- Development and testing
- Simple yield applications
- MVP deployments

**Features enabled:**

- ✅ Yield earning (Aave)
- ✅ Send/receive USDC
- ✅ Email notifications
- ❌ Fiat purchases
- ❌ KYC verification

```bash
# Copy to use
cp examples/basic/stashtab.config.ts stashtab.config.ts
```

---

### 2. Compliant (`./compliant/`)

Full-featured configuration with KYC and fiat integration. Production-ready for regulated environments.

**Best for:**

- Production deployments
- Regulated financial services
- Enterprise applications
- Full-service neobank

**Features enabled:**

- ✅ Yield earning (Aave)
- ✅ Send/receive USDC
- ✅ Email + Push notifications
- ✅ Stripe + MoonPay fiat
- ✅ Persona KYC verification
- ✅ Transaction limits with KYC gates

**Required environment variables:**

```bash
PRIVY_APP_ID=...
PRIVY_APP_SECRET=...
STRIPE_PUBLIC_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
MOONPAY_API_KEY=...
MOONPAY_SECRET_KEY=...
PERSONA_API_KEY=...
PERSONA_TEMPLATE_ID=...
RESEND_API_KEY=...
EXPO_ACCESS_TOKEN=...
```

```bash
# Copy to use
cp examples/compliant/stashtab.config.ts stashtab.config.ts
```

---

### 3. Custom Branding (`./custom-branding/`)

Demonstrates white-label customization with a completely custom theme.

**Best for:**

- White-label deployments
- Brand-conscious applications
- Custom theme implementations
- Agency/SaaS deployments

**Highlights:**

- Custom color scheme (coral/orange theme)
- Custom typography
- Modified border radius
- Full branding override

```bash
# Copy to use
cp examples/custom-branding/stashtab.config.ts stashtab.config.ts
```

---

## Using Examples

1. **Copy the example config:**

   ```bash
   cp examples/<example>/stashtab.config.ts stashtab.config.ts
   ```

2. **Update with your values:**
   - Change `app.name`, `app.url`, etc.
   - Update branding colors and fonts
   - Configure feature flags

3. **Set environment variables:**
   - See `.env.example` for required variables
   - Run `pnpm setup` to configure interactively

4. **Validate configuration:**
   ```bash
   pnpm setup:check
   ```

---

## Creating Custom Configurations

Start from one of the examples and customize:

```typescript
// stashtab.config.ts
import type { StashtabConfig } from './packages/config/src/types';

const config: StashtabConfig = {
  app: {
    name: 'My Neobank',
    description: 'Custom DeFi savings',
    url: 'https://myneobank.com',
  },

  chain: {
    network: 'base-sepolia', // or 'base' for mainnet
  },

  // ... customize other settings

  branding: {
    colors: {
      primary: '#your-brand-color',
      // ...
    },
  },
};

export default config;
```

---

## Configuration Schema

See `packages/config/src/types.ts` for the full TypeScript schema of all available options.

Key sections:

- `app` - Application identity
- `chain` - Blockchain configuration
- `auth` - Login methods and session settings
- `features` - Enable/disable fiat, KYC, notifications, yield
- `branding` - Colors, fonts, logos
- `limits` - Transaction limits and KYC thresholds
- `dev` - Debug and development settings
