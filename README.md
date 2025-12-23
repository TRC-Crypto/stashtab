# Stashtab

**Neobank-in-a-Box. Open source DeFi neobank stack.**

Everything you need to build a DeFi-powered neobank: web app, mobile app, admin dashboard, API, and integrations—all in one monorepo.

**Not a company. Not a product. A public good.**

Fork it. Deploy it. Make it yours.

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

## Features

### Core

- **Instant Setup** - Sign up with email or social login via Privy. No seed phrases.
- **Auto Yield** - Deposits automatically earn yield via Aave v3.
- **Smart Accounts** - Each user gets a Safe smart account.
- **Send Anywhere** - Transfer to other users or external wallets.

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

## Getting Test Funds

For testing on Base Sepolia, get test USDC from the [Circle Faucet](https://faucet.circle.com/).

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+
- [Privy](https://privy.io) account (free tier available)
- [Cloudflare](https://cloudflare.com) account (free tier available)

### 1. Clone and Install

```bash
git clone https://github.com/TRC-Crypto/stashtab.git
cd stashtab
pnpm install
```

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

## Architecture

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

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - How it all fits together
- [API Reference](docs/API.md) - REST API documentation and error codes
- [Deployment](docs/DEPLOY.md) - Step-by-step deployment guide
- [Customization](docs/CUSTOMIZE.md) - White-label and branding guide
- [Integrations](docs/INTEGRATIONS.md) - Fiat, notifications, KYC setup
- [Mobile App](docs/MOBILE.md) - React Native development guide
- [Admin Dashboard](docs/ADMIN.md) - Admin panel guide
- [Testing](docs/TESTING.md) - Testing guide
- [Security](docs/SECURITY.md) - Known risks, audit status, disclaimers

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

See [docs/SHOWCASE.md](docs/SHOWCASE.md) for projects using Stashtab.

Are you using Stashtab? [Let us know](https://github.com/TRC-Crypto/stashtab/issues/new?template=feature_request.md) and we'll feature you!

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

**No token. No VC. No waitlist. Just code.**
