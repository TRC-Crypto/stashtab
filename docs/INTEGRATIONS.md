# Integration Guide

This guide covers how to set up and configure all optional integrations in Stashtab.

## Table of Contents

- [Fiat On/Off Ramps](#fiat-onoff-ramps)
  - [Stripe](#stripe-card-on-ramp)
  - [MoonPay](#moonpay-global-coverage)
- [KYC/AML Compliance](#kycaml-compliance)
  - [Persona](#persona)
- [Notifications](#notifications)
  - [Email (Resend)](#email-notifications)
  - [Push (Expo)](#push-notifications)
- [Unified Notification Hub](#unified-notification-hub)
- [Webhooks](#webhooks)
- [Environment Variables](#environment-variables)
- [Testing](#testing-integrations)

---

## Fiat On/Off Ramps

Stashtab supports multiple fiat-to-crypto payment providers for purchasing and selling crypto.

### Stripe (Card On-Ramp)

Stripe Crypto On-ramp provides card payment processing for purchasing crypto. Users can buy USDC directly with their debit/credit cards.

**Features:**

- Card payments (Visa, Mastercard, Amex)
- Apple Pay & Google Pay support
- 160+ countries supported
- Instant crypto delivery to Safe wallet

**Setup:**

1. Sign up at [stripe.com](https://stripe.com)
2. Enable Crypto On-ramp in your [Stripe Dashboard](https://dashboard.stripe.com/settings/crypto)
3. Get your API keys from the [API Keys page](https://dashboard.stripe.com/apikeys)

4. Add environment variables:

```bash
# apps/api/.dev.vars
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. Configure in your code:

```typescript
import { createStripeService } from '@stashtab/sdk/fiat';

const stripe = createStripeService({
  apiKey: process.env.STRIPE_PUBLIC_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  environment: 'sandbox', // or "production"
});
```

6. Get a quote and create an order:

```typescript
// Get quote
const quote = await stripe.getQuote({
  type: 'on',
  fiatCurrency: 'USD',
  cryptoCurrency: 'USDC',
  amount: 100,
  amountType: 'fiat',
  walletAddress: userSafeAddress,
});

// Create order
const order = await stripe.createOrder({
  quoteId: quote.id,
  walletAddress: userSafeAddress,
  email: user.email,
});

// Get payment URL and redirect user
const paymentUrl = await stripe.getPaymentUrl(order.id);
```

7. For embedded widget (recommended):

```typescript
// Get client secret for Stripe Elements
const session = await stripe.createEmbeddedSession(userSafeAddress, {
  defaultCrypto: 'USDC',
  defaultAmount: 100,
});

// Use session.clientSecret with @stripe/stripe-js
```

**Webhook Events:**

- `crypto.onramp_session.updated` - Session status changed
- `crypto.onramp_session.completed` - Purchase completed
- `crypto.onramp_session.failed` - Purchase failed

---

### MoonPay (Global Coverage)

MoonPay supports buying AND selling crypto in 160+ countries with various payment methods.

**Features:**

- Card, bank transfer, Apple Pay, Google Pay
- On-ramp (buy) and off-ramp (sell)
- 80+ cryptocurrencies
- Widget and API integration

**Setup:**

1. Sign up at [moonpay.com/business](https://www.moonpay.com/business)
2. Complete business verification
3. Get API keys from the [dashboard](https://dashboard.moonpay.com)

4. Add environment variables:

```bash
MOONPAY_API_KEY=pk_live_...
MOONPAY_SECRET_KEY=sk_live_...
MOONPAY_WEBHOOK_SECRET=...
```

5. Configure:

```typescript
import { createMoonPayService } from '@stashtab/sdk/fiat';

const moonpay = createMoonPayService({
  apiKey: process.env.MOONPAY_API_KEY,
  secretKey: process.env.MOONPAY_SECRET_KEY,
  webhookSecret: process.env.MOONPAY_WEBHOOK_SECRET,
  environment: 'sandbox',
});
```

6. Generate widget URLs:

```typescript
// Buy widget (on-ramp)
const buyUrl = moonpay.getWidgetUrl({
  walletAddress: userSafeAddress,
  cryptoCurrency: 'USDC',
  fiatCurrency: 'USD',
  fiatAmount: 100,
  email: user.email,
  theme: 'dark',
});

// Sell widget (off-ramp)
const sellUrl = moonpay.getSellWidgetUrl({
  walletAddress: userSafeAddress,
  cryptoCurrency: 'USDC',
  quoteCurrencyCode: 'USD',
});
```

7. Embed in iframe or redirect:

```tsx
// React component
<iframe src={buyUrl} width="100%" height="600" frameBorder="0" allow="payment" />
```

---

## KYC/AML Compliance

### Persona

Persona provides modern identity verification with an excellent user experience.

**Features:**

- Document verification (ID, passport, driver's license)
- Selfie verification with liveness detection
- Database verification (SSN, address)
- Sanctions/PEP screening
- Customizable inquiry templates

**Setup:**

1. Sign up at [withpersona.com](https://withpersona.com)
2. Create an inquiry template in the [dashboard](https://app.withpersona.com/templates)
3. Get your API key and template ID

4. Add environment variables:

```bash
PERSONA_API_KEY=persona_sandbox_...
PERSONA_TEMPLATE_ID=itmpl_...
PERSONA_WEBHOOK_SECRET=...
```

5. Configure:

```typescript
import { createPersonaService } from '@stashtab/sdk/kyc';

const kyc = createPersonaService({
  apiKey: process.env.PERSONA_API_KEY,
  templateId: process.env.PERSONA_TEMPLATE_ID,
  webhookSecret: process.env.PERSONA_WEBHOOK_SECRET,
  environment: 'sandbox',
});
```

6. Create verification session:

```typescript
const session = await kyc.createVerification({
  userId: user.id,
  level: 'standard', // "basic" | "standard" | "enhanced"
  email: user.email,
  redirectUrl: 'https://yourapp.com/kyc/callback',
});

// Redirect user to verification
window.location.href = session.verificationUrl;
```

7. Check verification status:

```typescript
// Get status by inquiry ID
const verification = await kyc.getVerification(session.id);

// Or get by user ID
const userVerification = await kyc.getUserVerification(user.id);

if (verification.status === 'approved') {
  // User is verified!
  // Update your database
}
```

8. Run sanctions check:

```typescript
const result = await kyc.checkSanctions({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  country: 'US',
});

if (result.matched) {
  // User matched a sanctions list
  console.log('Matched lists:', result.lists);
}
```

**Verification Levels:**

| Level    | Documents Required             | Typical Use Case             |
| -------- | ------------------------------ | ---------------------------- |
| Basic    | Email + Phone                  | Small transactions (<$500)   |
| Standard | Government ID + Selfie         | Medium transactions (<$5000) |
| Enhanced | ID + Selfie + Proof of Address | Large transactions (>$5000)  |

---

## Notifications

### Email Notifications

Stashtab uses [Resend](https://resend.com) for transactional emails.

**Setup:**

1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain
3. Get your API key

4. Add environment variables:

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

5. Configure:

```typescript
import { createEmailService, EmailBuilder } from '@stashtab/sdk/notifications';

const email = createEmailService({
  apiKey: process.env.RESEND_API_KEY,
  defaultFrom: {
    email: 'noreply@yourdomain.com',
    name: 'Your App',
  },
});
```

6. Send with pre-built templates:

```typescript
import {
  welcomeEmailHtml,
  welcomeEmailText,
  transactionEmailHtml,
  transactionEmailText,
} from "@stashtab/sdk/notifications";

// Welcome email
await email.send({
  to: { email: user.email, name: user.name },
  subject: "Welcome to Your App",
  html: welcomeEmailHtml({
    userName: user.name,
    safeAddress: user.safeAddress,
    appUrl: "https://yourapp.com",
  }),
  text: welcomeEmailText({ ... }),
});

// Transaction email
await email.send({
  to: { email: user.email },
  subject: "Deposit Received",
  html: transactionEmailHtml({
    type: "deposit",
    amount: "100.00",
    currency: "USDC",
    txHash: "0x...",
    timestamp: new Date(),
    appUrl: "https://yourapp.com",
  }),
});
```

7. Or use the builder:

```typescript
await email.send(
  new EmailBuilder()
    .to({ email: 'user@example.com' })
    .from({ email: 'hello@yourapp.com', name: 'Your App' })
    .subject('Important Update')
    .html('<h1>Hello!</h1>')
    .text('Hello!')
    .tags('marketing', 'update')
    .build()
);
```

**Available Templates:**

- `welcomeEmailHtml/Text` - New user onboarding
- `transactionEmailHtml/Text` - Deposits, withdrawals, transfers
- `kycStatusEmailHtml/Text` - KYC verification updates
- `securityEmailHtml/Text` - Login alerts, security events

---

### Push Notifications

For mobile push notifications using Expo.

**Setup:**

1. (Optional) Get an Expo access token from [expo.dev](https://expo.dev)

2. Add environment variables:

```bash
EXPO_ACCESS_TOKEN=... # Optional, for higher rate limits
```

3. Configure:

```typescript
import { createExpoPushService, PushNotificationBuilder } from '@stashtab/sdk/notifications';

const push = createExpoPushService({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});
```

4. Send notifications:

```typescript
// Simple send
await push.send({
  to: userPushToken,
  title: 'Deposit Received',
  body: 'You received 100 USDC',
  data: { screen: 'dashboard' },
  sound: 'default',
});

// Using builder
await push.send(
  new PushNotificationBuilder()
    .to(userPushToken)
    .title('Security Alert')
    .body('New login detected from Chrome')
    .data({ screen: 'security' })
    .badge(1)
    .priority('high')
    .build()
);

// Batch send
await push.sendBatch([
  { to: token1, title: 'Alert', body: 'Message 1' },
  { to: token2, title: 'Alert', body: 'Message 2' },
]);
```

5. Check delivery status:

```typescript
const receipt = await push.getStatus(ticketId);
if (receipt.status === 'delivered') {
  // Notification was delivered
}
```

---

## Unified Notification Hub

For simplified notification management, use the NotificationHub:

```typescript
import { createNotificationHub } from '@stashtab/sdk/notifications';

const notifications = createNotificationHub({
  email: {
    apiKey: process.env.RESEND_API_KEY,
    defaultFrom: { email: 'noreply@yourapp.com', name: 'Your App' },
  },
  push: {
    accessToken: process.env.EXPO_ACCESS_TOKEN,
  },
});

// Send welcome email
await notifications.sendWelcomeEmail({
  to: user.email,
  userName: user.name,
  safeAddress: user.safeAddress,
  appUrl: 'https://yourapp.com',
});

// Send transaction notification (email + push)
await notifications.sendTransactionEmail({
  to: user.email,
  type: 'deposit',
  amount: '100.00',
  currency: 'USDC',
  appUrl: 'https://yourapp.com',
});

await notifications.sendTransactionPush({
  tokens: user.pushTokens,
  type: 'deposit',
  amount: '100.00',
  currency: 'USDC',
});

// Send KYC status update
await notifications.sendKYCStatusEmail({
  to: user.email,
  status: 'approved',
  appUrl: 'https://yourapp.com',
});

// Send security alert
await notifications.sendSecurityEmail({
  to: user.email,
  eventType: 'new_login',
  ipAddress: '192.168.1.1',
  location: 'San Francisco, US',
  appUrl: 'https://yourapp.com',
});
```

---

## Webhooks

All integrations support webhook verification. Here's how to handle them:

```typescript
// Stripe webhook
app.post('/webhooks/stripe', async (c) => {
  const payload = await c.req.text();
  const signature = c.req.header('Stripe-Signature') || '';

  if (!stripe.verifyWebhook(payload, signature)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const event = stripe.parseWebhookEvent(payload);
  if (event) {
    switch (event.type) {
      case 'crypto.onramp_session.completed':
        // Handle completed purchase
        await handlePurchaseComplete(event.orderId);
        break;
    }
  }

  return c.json({ received: true });
});

// MoonPay webhook
app.post('/webhooks/moonpay', async (c) => {
  const payload = await c.req.text();
  const signature = c.req.header('MoonPay-Signature') || '';

  if (!moonpay.verifyWebhook(payload, signature)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const event = moonpay.parseWebhookEvent(payload);
  // Handle event...

  return c.json({ received: true });
});

// Persona KYC webhook
app.post('/webhooks/kyc', async (c) => {
  const payload = await c.req.text();
  const signature = c.req.header('Persona-Signature') || '';

  if (!kyc.verifyWebhook(payload, signature)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const event = kyc.parseWebhook(payload);

  // Update user KYC status
  await db.users.update({
    where: { id: event.userId },
    data: { kycStatus: event.status },
  });

  return c.json({ received: true });
});
```

---

## Environment Variables

Complete list of environment variables for all integrations:

```bash
# ============================================
# Core (Required)
# ============================================
PRIVY_APP_ID=...
PRIVY_APP_SECRET=...
RPC_URL=https://sepolia.base.org
CHAIN_ID=84532

# ============================================
# Fiat Integration (Optional)
# ============================================
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MoonPay
MOONPAY_API_KEY=pk_test_...
MOONPAY_SECRET_KEY=sk_test_...
MOONPAY_WEBHOOK_SECRET=...

# ============================================
# KYC Integration (Optional)
# ============================================
PERSONA_API_KEY=persona_sandbox_...
PERSONA_TEMPLATE_ID=itmpl_...
PERSONA_WEBHOOK_SECRET=...

# ============================================
# Notifications (Optional)
# ============================================
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
EXPO_ACCESS_TOKEN=...
```

---

## Testing Integrations

All services have sandbox/test modes for development.

### Test Mode Configuration

```typescript
// Use sandbox environment
const stripe = createStripeService({
  apiKey: 'pk_test_...',
  secretKey: 'sk_test_...',
  environment: 'sandbox', // Important!
});

const moonpay = createMoonPayService({
  apiKey: 'pk_test_...',
  environment: 'sandbox',
});

const kyc = createPersonaService({
  apiKey: 'persona_sandbox_...',
  templateId: 'itmpl_sandbox_...',
  environment: 'sandbox',
});
```

### Test Data

**Stripe Test Cards:**

- `4242424242424242` - Successful payment
- `4000000000000002` - Declined payment
- `4000002760003184` - Requires authentication

**Persona Test:**

- Use the sandbox template ID
- Test IDs are auto-approved

**MoonPay Sandbox:**

- Use sandbox URLs (`buy-sandbox.moonpay.com`)
- Test mode completes transactions instantly

### Validation Script

Run `pnpm setup:check` to validate all configured integrations:

```bash
$ pnpm setup:check

📋 Checking configuration...

✅ PRIVY_APP_ID: Configured
✅ PRIVY_APP_SECRET: Configured
✅ Stripe API: Connected
✅ MoonPay API: Connected
✅ Persona API: Connected
✅ Resend API: Connected

All checks passed!
```
