# Integration Guide

This guide covers how to wire up the optional integrations in Stashtab.

## Fiat On/Off Ramps

Stashtab includes stubs for fiat-to-crypto payment providers.

### Stripe (Card On-Ramp)

Stripe provides card payment processing for purchasing crypto.

**Setup:**

1. Sign up at [stripe.com](https://stripe.com)
2. Enable Crypto On-ramp in your dashboard
3. Install the SDK:

```bash
pnpm add stripe @stripe/stripe-js
```

4. Configure in your API:

```typescript
import { createStripeService } from "@stashtab/sdk/fiat";

const stripe = createStripeService({
  apiKey: process.env.STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  environment: "production",
});
```

5. Create a quote and order:

```typescript
const quote = await stripe.getQuote({
  type: "on",
  fiatCurrency: "USD",
  cryptoCurrency: "USDC",
  amount: 100,
  amountType: "fiat",
  walletAddress: userSafeAddress,
});

const order = await stripe.createOrder({
  quoteId: quote.id,
  walletAddress: userSafeAddress,
});

// Redirect user to payment
const paymentUrl = await stripe.getPaymentUrl(order.id);
```

### MoonPay (Global Coverage)

MoonPay supports buying and selling crypto in 160+ countries.

**Setup:**

1. Sign up at [moonpay.com/business](https://www.moonpay.com/business)
2. Get API keys from dashboard
3. Configure:

```typescript
import { createMoonPayService } from "@stashtab/sdk/fiat";

const moonpay = createMoonPayService({
  apiKey: process.env.MOONPAY_API_KEY,
  secretKey: process.env.MOONPAY_SECRET_KEY,
  environment: "production",
});

// Generate widget URL
const widgetUrl = moonpay.getWidgetUrl({
  walletAddress: userSafeAddress,
  cryptoCurrency: "USDC",
  fiatCurrency: "USD",
  email: user.email,
});
```

## Email Notifications

Stashtab uses Resend for transactional emails.

### Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Install:

```bash
pnpm add resend
```

4. Configure:

```typescript
import { createEmailService, EmailBuilder } from "@stashtab/sdk/notifications";

const email = createEmailService({
  apiKey: process.env.RESEND_API_KEY,
  defaultFrom: {
    email: "noreply@yourdomain.com",
    name: "Your App",
  },
});
```

5. Send emails:

```typescript
// Using templates
import { welcomeEmailHtml, welcomeEmailText } from "@stashtab/sdk/notifications";

await email.send({
  to: { email: user.email },
  subject: "Welcome to Your App",
  html: welcomeEmailHtml({
    userName: user.name,
    safeAddress: user.safeAddress,
    appUrl: "https://yourapp.com",
  }),
  text: welcomeEmailText({ ... }),
});

// Using builder
await email.send(
  new EmailBuilder()
    .to({ email: "user@example.com" })
    .subject("Transaction Confirmed")
    .html("<h1>Your deposit was received</h1>")
    .tags("transaction", "deposit")
    .build()
);
```

## Push Notifications

### Expo Push (React Native)

For the mobile app, use Expo Push notifications:

```typescript
import { createExpoPushService, PushNotificationBuilder } from "@stashtab/sdk/notifications";

const push = createExpoPushService({
  accessToken: process.env.EXPO_ACCESS_TOKEN, // Optional
});

// Send notification
await push.send(
  new PushNotificationBuilder()
    .to(userPushToken)
    .title("Deposit Received")
    .body("You received 100 USDC")
    .data({ screen: "dashboard" })
    .build()
);
```

### Firebase Cloud Messaging (FCM)

For web push notifications:

```typescript
import { createFCMPushService } from "@stashtab/sdk/notifications";

const fcm = createFCMPushService({
  serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT,
});
```

## KYC/AML Compliance

### Persona

Modern identity verification for fintech.

**Setup:**

1. Sign up at [withpersona.com](https://withpersona.com)
2. Create an inquiry template
3. Configure:

```typescript
import { createPersonaService } from "@stashtab/sdk/kyc";

const kyc = createPersonaService({
  apiKey: process.env.PERSONA_API_KEY,
  templateId: process.env.PERSONA_TEMPLATE_ID,
  webhookSecret: process.env.PERSONA_WEBHOOK_SECRET,
  environment: "production",
});
```

4. Create verification:

```typescript
const session = await kyc.createVerification({
  userId: user.id,
  level: "standard",
  email: user.email,
});

// Redirect user to verification
window.location.href = session.verificationUrl;

// Check status later
const verification = await kyc.getVerification(session.id);
if (verification.status === "approved") {
  // User is verified
}
```

### Sumsub

Global KYC/AML platform.

```typescript
import { createSumsubService } from "@stashtab/sdk/kyc";

const kyc = createSumsubService({
  apiKey: process.env.SUMSUB_APP_TOKEN,
  secretKey: process.env.SUMSUB_SECRET_KEY,
  environment: "production",
});
```

### Verification Levels

Use the helper functions to determine required verification:

```typescript
import { getRequiredVerificationLevel, isVerificationSufficient } from "@stashtab/sdk/kyc";

// Determine required level based on amount
const required = getRequiredVerificationLevel(transactionAmount);
// Returns: "basic" | "standard" | "enhanced"

// Check if user's verification is sufficient
const canProceed = isVerificationSufficient(user.kycLevel, required);
```

## Webhooks

All integrations support webhook verification:

```typescript
// In your API webhook handler
app.post("/webhooks/stripe", async (c) => {
  const payload = await c.req.text();
  const signature = c.req.header("stripe-signature");

  if (!stripe.verifyWebhook(payload, signature)) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  const event = JSON.parse(payload);
  // Handle event...
});

app.post("/webhooks/kyc", async (c) => {
  const payload = await c.req.text();
  const signature = c.req.header("x-persona-signature");

  if (!kyc.verifyWebhook(payload, signature)) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  const event = kyc.parseWebhook(payload);
  // Handle verification status change...
});
```

## Environment Variables

Add these to your `.dev.vars` (API) or `.env.local` (web):

```bash
# Fiat Ramps
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
MOONPAY_API_KEY=pk_...
MOONPAY_SECRET_KEY=sk_...

# Email
RESEND_API_KEY=re_...

# Push
EXPO_ACCESS_TOKEN=...

# KYC
PERSONA_API_KEY=persona_...
PERSONA_TEMPLATE_ID=itmpl_...
PERSONA_WEBHOOK_SECRET=...
```

## Testing Integrations

All services have sandbox/test modes. Use the `environment: "sandbox"` option during development:

```typescript
const stripe = createStripeService({
  apiKey: "pk_test_...",
  secretKey: "sk_test_...",
  environment: "sandbox",
});
```

The stub implementations return mock data, so you can develop the UI flow without real API calls.

