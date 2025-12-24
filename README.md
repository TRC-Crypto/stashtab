# Stashtab

**Onchain finance primitives. Open source.**

Composable primitives for building neobanks, payment apps, treasury tools, and any financial product that should run on-chain but feel like magic.

Wallet infrastructure. Yield routing. Stablecoin payments. Compliance hooks.
All MIT-licensed. All production-ready.

Fork it. Compose it. Ship it.

<!-- Badges -->
<div align="center">

[![CI](https://github.com/TRC-Crypto/stashtab/actions/workflows/ci.yml/badge.svg)](https://github.com/TRC-Crypto/stashtab/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/TRC-Crypto/stashtab/releases)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.14.2-orange.svg)](https://pnpm.io/)
[![Coverage](https://img.shields.io/badge/coverage-in_progress-lightgrey.svg)](https://github.com/TRC-Crypto/stashtab)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/TRC-Crypto/stashtab)

</div>

## What is Stashtab?

Stashtab is infrastructure for the transition to onchain finance.

Not a product. Not a company. A set of open-source primitives that anyone can use to build financial products on onchain rails.

As finance moves onchain, builders need composable tools—not monolithic stacks. Stashtab provides the primitives.

### The Primitives

- **Account Primitives** - Safe smart accounts, session keys, account abstraction
- **Yield Primitives** - Aave, Morpho, yield routing across protocols
- **Payment Primitives** - Transfers, batch payments, streaming (Sablier)
- **Fiat Primitives** - Onramps, offramps, provider routing
- **Compliance Primitives** - KYC, sanctions screening, transaction reporting

### What Stashtab Is

✅ Composable infrastructure primitives  
✅ Open-source (MIT licensed)  
✅ Production-ready SDK  
✅ Multi-chain support (Base, Arbitrum, Optimism, Polygon)  
✅ Protocol agnostic (works with any onchain protocol)  
✅ Zero vendor lock-in

### What Stashtab Is Not

❌ A token or token project  
❌ A company or VC-backed startup  
❌ A managed service  
❌ A closed ecosystem  
❌ A specific product category

## Who Uses Stashtab?

| Builder           | What They Build           | What They Need          |
| ----------------- | ------------------------- | ----------------------- |
| Fintech startups  | Neobanks, savings apps    | Full stack reference    |
| Payment companies | Stablecoin settlement     | Payments + fiat modules |
| Treasury teams    | Corporate cash management | Yield + multi-sig       |
| Payroll platforms | Crypto payroll            | Payments + compliance   |
| Remittance apps   | Cross-border transfers    | Payments + fiat + KYC   |
| Protocol teams    | User-facing products      | Auth + accounts + yield |

See [EXAMPLES.md](docs/EXAMPLES.md) for complete implementation patterns.

## Primitives Overview

### Core Primitives

- **Auth** - Privy, passkeys, social login, wallet connection
- **Accounts** - Safe deployment, session keys, account abstraction

### Yield Primitives

- **Aave** - Supply, borrow, yield earning on Aave v3
- **Morpho** - Peer-to-peer lending markets
- **Yield Router** - Multi-protocol optimization and routing

### Payment Primitives

- **Transfers** - Basic stablecoin transfers
- **Batch Payments** - Bulk processing with gas optimization
- **Streaming Payments** - Sablier-based continuous payments

### Fiat Primitives

- **Onramp** - Convert fiat to crypto (Stripe, MoonPay, Coinbase, Transak)
- **Offramp** - Convert crypto to fiat
- **Provider Routing** - Best rate selection across providers

### Compliance Primitives

- **KYC** - Persona, Sumsub integration
- **Sanctions Screening** - OFAC and sanctions list checking
- **Reporting** - Transaction reporting and compliance events

### Platform

- **Web App** - Next.js frontend with Tailwind CSS
- **Mobile App** - Expo/React Native with NativeWind (scaffolded)
- **Admin Dashboard** - User management, transaction monitoring, settings
- **API** - Cloudflare Workers with D1 database

### Integrations (Stubs)

- **Fiat On/Off Ramps** - Stripe, MoonPay patterns
- **Notifications** - Email (Resend), Push (Expo/FCM)
- **KYC/AML** - Persona, Sumsub patterns

### Developer Experience

- **CI/CD** - GitHub Actions for lint, test, build, deploy
- **Testing** - Vitest with example tests
- **Setup Wizard** - Interactive CLI to configure everything
- **API Documentation** - Interactive Swagger UI at `/docs`
- **Type-Safe API** - Zod validation with OpenAPI generation
- **Rate Limiting** - Built-in rate limiting with KV storage

## Quick Demo

Try Stashtab in action! Run the demo app locally:

```bash
pnpm --filter @stashtab/demo dev
# Visit http://localhost:3002
```

Or [view the interactive demo](docs/DEMO.md) documentation.

See live examples of:

- Deposit flow with QR codes
- Yield calculator
- Transaction sending
- API playground

## Getting Started in 5 Minutes

```bash
# 1. Clone the repo
git clone https://github.com/TRC-Crypto/stashtab.git
cd stashtab

# 2. Install dependencies
pnpm install

# 3. Run setup wizard
pnpm setup

# 4. Start development
pnpm dev
```

That's it! Your neobank is running locally. See [Quick Start](#quick-start) below for detailed setup.

## Getting Test Funds

For testing on Base Sepolia, get test USDC from the [Circle Faucet](https://faucet.circle.com/).

## Quick Start

### Using the SDK

```bash
pnpm add @stashtab/sdk
```

```typescript
import { deploySafe } from '@stashtab/sdk/core/accounts';
import { AaveService } from '@stashtab/sdk/yield/aave';
import { createOnrampService } from '@stashtab/sdk/fiat/onramp';

// Deploy a Safe account
const safe = await deploySafe({
  owners: [userAddress],
  threshold: 1,
  chainId: 8453, // Base
});

// Supply to Aave for yield
import { createAaveService } from '@stashtab/sdk/yield/aave';
import { createStashtabPublicClient } from '@stashtab/sdk/client';

const publicClient = createStashtabPublicClient(8453);
const aave = createAaveService({ chainId: 8453, publicClient });
const yieldRate = await aave.getYieldRate();

// Get fiat onramp quote
const onramp = createOnrampService({ chainId: 8453 });
const quote = await onramp.getBestRate({
  fiatAmount: 100,
  fiatCurrency: 'USD',
  cryptoCurrency: 'USDC',
  recipientAddress: safe.address,
});
```

See [PRIMITIVES.md](docs/PRIMITIVES.md) for detailed usage and [EXAMPLES.md](docs/EXAMPLES.md) for complete patterns.

### Running Reference Implementations

The monorepo includes reference implementations for testing and development:

```bash
git clone https://github.com/TRC-Crypto/stashtab.git
cd stashtab
pnpm install
pnpm dev
```

**Prerequisites:**

- Node.js 18+
- pnpm 9+
- [Privy](https://privy.io) account (free tier available)
- [Cloudflare](https://cloudflare.com) account (free tier available)

### 2. Configure Environment

Copy the example environment files:

```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local

# API (for local development)
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

Fill in your values (get Privy credentials from [dashboard.privy.io](https://dashboard.privy.io)).

### 3. Run Setup Wizard (Recommended)

```bash
pnpm setup
```

This interactive wizard will:

- Create Cloudflare D1 database and KV namespace
- Update wrangler.toml with your IDs
- Generate .env files
- Run database migrations

### 4. Start Development

```bash
# Start all apps
pnpm dev
```

- Web: http://localhost:3000
- Admin: http://localhost:3001
- API: http://localhost:8787
- API Docs: http://localhost:8787/docs

### 5. Deploy

**Option A: Automated Deployment (Recommended)**

```bash
pnpm deploy:auto
```

This will:

- Create all Cloudflare resources (D1, KV, Workers, Pages)
- Run database migrations
- Deploy all applications
- Provide deployment URLs

**Option B: Manual Deployment**

See [docs/DEPLOY.md](docs/DEPLOY.md) for step-by-step deployment instructions.

**Option C: One-Click Deploy**

Click the "Deploy to Cloudflare" button above or use GitHub Actions:

1. Go to Actions → One-Click Deploy
2. Click "Run workflow"
3. Select your environment and options
4. Click "Run workflow"

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Web    │  │  Mobile  │  │  Admin   │              │
│  │  (Next)  │  │  (Expo)  │  │ (Next)   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Cloudflare Workers API                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Auth   │  │ Account  │  │  Yield   │              │
│  │  (Privy) │  │  (Safe)  │  │ (Aave)   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Blockchain Layer (Base)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Safe   │  │   Aave   │  │   USDC    │              │
│  │ Wallets  │  │   v3     │  │ Stablecoin│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────────────────────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation with diagrams.

**High-Level Overview:**

- **Frontend**: Next.js web app, admin dashboard, and Expo mobile app
- **Backend**: Cloudflare Workers API with D1 database and KV cache
- **Infrastructure**: Privy (auth), Safe (smart accounts), Aave v3 (yield)
- **Integrations**: Stripe, MoonPay (fiat), Persona (KYC), Resend (email), Expo (push)

## Tech Stack

| Layer         | Technology         | Why                                               |
| ------------- | ------------------ | ------------------------------------------------- |
| Chain         | Base               | Low fees, Coinbase ecosystem, mainstream-friendly |
| Yield         | Aave v3            | Battle-tested, deep liquidity, simple integration |
| Stablecoin    | USDC               | Regulatory clarity, wide acceptance               |
| Smart Account | Safe               | Industry standard, modular, audited               |
| Auth          | Privy              | Social login, embedded wallets, recovery built-in |
| Backend       | Cloudflare Workers | Free tier, global edge, simple deploys            |
| Frontend      | Next.js 14         | Fast, familiar, easy to customize                 |

### Powered By

<div align="center">

[![Base](https://img.shields.io/badge/Powered%20by-Base-0052FF?logo=base&logoColor=white)](https://base.org)
[![Aave](https://img.shields.io/badge/Powered%20by-Aave-4C6EF5?logo=aave&logoColor=white)](https://aave.com)
[![Safe](https://img.shields.io/badge/Powered%20by-Safe-12FF80?logo=safe&logoColor=white)](https://safe.global)
[![Privy](https://img.shields.io/badge/Powered%20by-Privy-6366F1?logo=privy&logoColor=white)](https://privy.io)
[![Cloudflare](https://img.shields.io/badge/Powered%20by-Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://cloudflare.com)

</div>

## Documentation

### Getting Started

- [Philosophy](docs/PHILOSOPHY.md) - The post-DeFi thesis and project vision
- [Primitives Guide](docs/PRIMITIVES.md) - Deep dive into each primitive module
- [Examples](docs/EXAMPLES.md) - Common implementation patterns
- [Quick Start](docs/QUICKSTART.md) - Get up and running quickly

### Reference

- [Architecture](docs/ARCHITECTURE.md) - System architecture and composition patterns
- [API Reference](docs/API.md) - REST API documentation (reference implementation)
- [Deployment](docs/DEPLOY.md) - Deployment guide for reference apps

### Development

- [Customization](docs/CUSTOMIZE.md) - Customization guide
- [Integrations](docs/INTEGRATIONS.md) - Provider integration setup
- [Testing](docs/TESTING.md) - Testing guide
- [Security](docs/SECURITY.md) - Security best practices

### Community

- [Grants](docs/GRANTS.md) - Grant funding and applications
- [Sponsors](docs/SPONSORS.md) - Sponsor recognition and support

## Project Structure

```
stashtab/
├── .github/workflows/    # CI/CD (lint, test, build, deploy)
├── apps/
│   ├── web/              # Next.js web app (Cloudflare Pages)
│   ├── admin/            # Admin dashboard (Cloudflare Pages)
│   ├── mobile/           # Expo React Native app
│   └── api/              # Cloudflare Workers API
├── packages/
│   ├── sdk/              # Core SDK
│   │   ├── safe/         # Safe smart account operations
│   │   ├── aave/         # Aave yield operations
│   │   ├── fiat/         # Fiat on/off ramp stubs
│   │   ├── notifications/# Email & push notification stubs
│   │   └── kyc/          # KYC/AML stubs
│   ├── config/           # Shared ABIs, addresses, constants
│   └── eslint-config/    # Shared ESLint configurations
├── scripts/
│   └── setup.ts          # Interactive setup wizard
├── docs/                 # Documentation
└── vitest.config.ts      # Test configuration
```

## Built with Stashtab

See [docs/SHOWCASE.md](docs/SHOWCASE.md) for projects using Stashtab primitives.

Are you using Stashtab? [Let us know](https://github.com/TRC-Crypto/stashtab/issues/new?template=feature_request.md) and we'll feature you!

## Support Stashtab

Stashtab is maintained as a public good. If you're using it in production, consider supporting ongoing development:

- [GitHub Sponsors](https://github.com/sponsors/TRC-Crypto)
- See [docs/SPONSORS.md](docs/SPONSORS.md) for sponsorship tiers

Sponsors get listed in the README and early access to new features.

## Contributors

Thank you to all contributors who help make Stashtab better!

<!-- Contributors will be added via GitHub API -->

## Community

- 💬 [GitHub Discussions](https://github.com/TRC-Crypto/stashtab/discussions) - Ask questions and share ideas
- 🐛 [GitHub Issues](https://github.com/TRC-Crypto/stashtab/issues) - Report bugs and request features
- 📖 [Documentation](docs/) - Comprehensive guides and references

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

See our [Code of Conduct](CODE_OF_CONDUCT.md) for community guidelines.

## Support

- 📚 [Documentation](docs/) - Comprehensive guides
- 💬 [Discussions](https://github.com/TRC-Crypto/stashtab/discussions) - Community support
- 🐛 [Issues](https://github.com/TRC-Crypto/stashtab/issues) - Bug reports and feature requests

## License

MIT - See [LICENSE](LICENSE) for details.

---

**The future of finance is onchain. Stashtab helps you build it.**

_No token. No VC. No waitlist. Just code._
