# Stashtab

**Open source DeFi neobank stack. Deposit, earn, send—on-chain.**

An open source reference implementation for building a DeFi-powered neobank. Deposit USDC, earn yield automatically via Aave, send to anyone—all abstracted for normal users.

**Not a company. Not a product. A public good.**

Fork it. Deploy it. Make it yours.

## Features

- **Instant Setup** - Sign up with email or social login via Privy. No seed phrases.
- **Auto Yield** - Your USDC is automatically deposited to Aave v3. Earn yield 24/7.
- **Send Anywhere** - Transfer to other users instantly or withdraw to any Ethereum address.
- **Smart Accounts** - Each user gets a Safe smart account for secure, programmable transactions.

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

### 3. Start Development

```bash
# Start all apps in development mode
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:8787

### 4. Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md) for step-by-step deployment instructions.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│                   (Next.js, Tailwind)                   │
│         Deposit · Balance · Send · Withdraw             │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                      Backend                            │
│               (Cloudflare Workers)                      │
│   Auth · Account Creation · Yield Ops · Transfers       │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   Infrastructure                        │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Privy     │  │    Safe     │  │    Aave     │     │
│  │   (Auth)    │  │  (Account)  │  │   (Yield)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│                        Base L2                          │
└─────────────────────────────────────────────────────────┘
```

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
- [Deployment](docs/DEPLOY.md) - Step-by-step deployment guide
- [Customization](docs/CUSTOMIZE.md) - White-label and branding guide
- [Security](docs/SECURITY.md) - Known risks, audit status, disclaimers

## Project Structure

```
stashtab/
├── apps/
│   ├── web/              # Next.js frontend (Cloudflare Pages)
│   └── api/              # Cloudflare Workers backend
├── packages/
│   ├── sdk/              # Core SDK (Safe, Aave, Privy)
│   ├── config/           # Shared ABIs, addresses, constants
│   └── eslint-config/    # Shared ESLint configurations
├── docs/                 # Documentation
├── turbo.json            # Turborepo config
└── package.json          # Root package.json
```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

MIT - See [LICENSE](LICENSE) for details.

---

**No token. No VC. No waitlist. Just code.**
