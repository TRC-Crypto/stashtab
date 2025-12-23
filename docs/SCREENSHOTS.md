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

### Home Screen

The mobile app home screen shows:

- Balance overview
- Quick actions
- Recent activity

### Deposit Screen

Mobile deposit flow with:

- QR code scanner
- Address display
- Copy to clipboard

### Send Screen

Mobile send interface with:

- Recipient input
- Amount selector
- Transaction preview

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
