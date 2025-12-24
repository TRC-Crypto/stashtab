# Screenshots & Visual Guide

This document provides visual examples of Stashtab's user interface and features.

## Web Application

### Landing Page

The landing page provides an overview of Stashtab's features and value proposition.

**Key Features:**

- Hero section with value proposition
- Feature highlights
- Tech stack badges
- Call-to-action buttons

### Dashboard

The main dashboard shows:

- Current balance
- Yield earned
- APY rate
- Quick actions (deposit, send, withdraw)
- Recent transactions

### Deposit Flow

Users can deposit USDC by:

1. Viewing their Safe address
2. Scanning QR code
3. Sending USDC to the address
4. Automatic yield generation via Aave

### Send Flow

Users can send USDC to:

- Other Stashtab users (internal transfer)
- External Ethereum addresses
- With real-time balance updates

### Settings

User settings include:

- Account information
- Safe address
- Transaction history
- KYC status

## Mobile Application

Screenshots of the mobile app are available in [mobile-screenshots/](./mobile-screenshots/).

### Home Screen

The mobile app home screen shows:

- Balance overview with live yield ticker
- Quick actions (Deposit, Send, Buy)
- Recent activity feed
- Current APY display

### Deposit Screen

Mobile deposit flow with:

- QR code generation for Safe address
- Address display with copy functionality
- Transaction status polling
- Network indicator (Base Sepolia/Base)

### Send Screen

Mobile send interface with:

- Recipient address input with validation
- Amount selector with quick amounts
- Transaction preview with fees
- Real-time balance updates

## Admin Dashboard

### User Management

Admin can:

- View all users
- Filter and search
- View user details
- Manage user status

### Transaction Monitoring

Real-time transaction monitoring:

- All transactions
- Status tracking
- Filtering options
- Export capabilities

### Analytics

Admin analytics dashboard:

- User growth
- Transaction volume
- Revenue metrics
- Error rates

## Demo Application

The interactive demo app showcases Stashtab features without requiring authentication.

### Demo Home Page

Features:

- Hero section with value proposition
- Feature cards (Instant Setup, Auto Yield, Smart Accounts)
- Architecture diagram
- Tech stack showcase
- Call-to-action buttons

### Interactive Demo Page

Interactive features:

- **Deposit Flow**: QR code generation, address display, copy functionality
- **Yield Calculator**: Interactive calculator with timeframe selection
- **API Playground**: Example API requests and responses

See [DEMO.md](./DEMO.md) for more information about the demo app.

## API Documentation

### Swagger UI

Interactive API documentation at `/docs`:

- All endpoints
- Request/response schemas
- Try it out functionality
- Authentication examples

## Architecture Diagrams

### System Architecture

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

## Adding Screenshots

To add screenshots to this document:

1. Take screenshots of key features
2. Save to `docs/screenshots/` directory
3. Reference in this document using:

```markdown
![Feature Name](screenshots/feature-name.png)
```

## Video Tutorials

Video tutorials are planned for:

- Getting started
- Deployment
- Customization
- Integrations

See [QUICKSTART.md](./QUICKSTART.md) for video links when available.

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [QUICKSTART.md](./QUICKSTART.md) - Getting started guide
- [CUSTOMIZE.md](./CUSTOMIZE.md) - Customization guide
