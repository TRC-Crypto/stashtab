# Stashtab Demo

The Stashtab demo application provides an interactive showcase of core features without requiring authentication or real transactions.

## Accessing the Demo

The demo is available at: `http://localhost:3002` (when running locally)

> **Note**: To deploy the demo app, follow the deployment instructions below. Production URLs should be configured based on your hosting provider.

## Features

### Interactive Demo Page (`/demo`)

#### Deposit Flow

- **QR Code Generation**: See how Safe addresses are displayed as QR codes
- **Address Display**: View the full Safe address with copy functionality
- **Instructions**: Learn how the deposit process works

#### Yield Calculator

- **Interactive Calculator**: Input deposit amount and APY to calculate yield
- **Timeframe Selection**: Calculate yield for day, week, month, or year
- **Real-time Updates**: See yield calculations update instantly

#### API Playground

- **Example Endpoints**: View example API requests and responses
- **Code Examples**: See how to interact with the Stashtab API
- **Documentation Links**: Quick access to full API documentation

### Home Page

#### Feature Showcase

- **Instant Setup**: Learn about social login and embedded wallets
- **Auto Yield**: Understand automatic yield generation via Aave
- **Smart Accounts**: Discover Safe smart account integration

#### Architecture Overview

- **Visual Flow**: See how the system architecture works
- **Tech Stack**: Learn about the technologies powering Stashtab
- **Integration Points**: Understand how components connect

## Running Locally

```bash
# From the root directory
pnpm dev

# The demo app will be available at http://localhost:3002
```

## Building for Production

```bash
# Build the demo app
pnpm --filter @stashtab/demo build

# The static files will be in apps/demo/out/
```

## Deployment

The demo app is configured for static export and can be deployed to:

- **Cloudflare Pages**: Automatic deployment via GitHub Actions
- **Vercel**: Connect the repository and deploy
- **Netlify**: Static site deployment
- **Any static hosting**: Upload the `out/` directory

## Customization

The demo app uses the same styling and components as the main web app, making it easy to customize:

- **Colors**: Edit `apps/demo/tailwind.config.js`
- **Content**: Modify `apps/demo/src/app/page.tsx` and `apps/demo/src/app/demo/page.tsx`
- **Styling**: Update `apps/demo/src/app/globals.css`

## Screenshots

See [SCREENSHOTS.md](./SCREENSHOTS.md) for visual examples of the demo app.

## Related Documentation

- [API Reference](./API.md) - Full API documentation
- [Architecture](./ARCHITECTURE.md) - System architecture details
- [Quick Start](../README.md#quick-start) - Getting started guide
