# Customization Guide

Make Stashtab your own with white-labeling and customization.

## Branding

### App Name

Update the app name in these locations:

1. **package.json** - Root and app-level
2. **Frontend**:
   - `apps/web/src/app/layout.tsx` - Page title
   - `apps/web/src/components/Sidebar.tsx` - Logo text
   - `apps/web/src/app/page.tsx` - Landing page
3. **API**:
   - `apps/api/src/index.ts` - API name in health check

### Colors

The color scheme is defined in `apps/web/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      // Primary yield/accent color
      yield: {
        light: '#00ff88',
        DEFAULT: '#00d974',
        dark: '#00b861',
      },
      // Surface colors for dark theme
      surface: {
        50: '#18181b',
        100: '#1f1f23',
        200: '#27272a',
        300: '#3f3f46',
        400: '#52525b',
      },
    },
  },
}
```

To change the accent color:

1. Pick your color (e.g., blue `#3b82f6`)
2. Generate light/dark variants
3. Update the `yield` color object
4. Update CSS variables in `globals.css`

### Typography

Fonts are imported in `apps/web/src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:...');
```

To change fonts:

1. Choose fonts from Google Fonts or your source
2. Update the import URL
3. Update `tailwind.config.js` font families:

```javascript
fontFamily: {
  sans: ['Your Font', 'system-ui', 'sans-serif'],
  mono: ['Your Mono Font', 'monospace'],
},
```

### Logo

Replace the logo component in:

- `apps/web/src/components/Sidebar.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/login/page.tsx`

Current logo is a simple letter badge:

```tsx
<div className="w-8 h-8 rounded-lg bg-yield flex items-center justify-center">
  <span className="text-black font-bold text-lg">S</span>
</div>
```

Replace with your SVG or image:

```tsx
<Image src="/logo.svg" alt="Logo" width={32} height={32} />
```

## Features

### Enable/Disable Features

Control which features are available by modifying the navigation:

```tsx
// apps/web/src/components/Sidebar.tsx
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/deposit', label: 'Deposit', icon: DepositIcon },
  // Comment out to disable:
  // { href: '/send', label: 'Send', icon: SendIcon },
  { href: '/withdraw', label: 'Withdraw', icon: WithdrawIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];
```

### Add Custom Pages

1. Create a new page in `apps/web/src/app/(dashboard)/`:

```tsx
// apps/web/src/app/(dashboard)/rewards/page.tsx
export default function RewardsPage() {
  return (
    <div>
      <h1>Rewards</h1>
      {/* Your content */}
    </div>
  );
}
```

2. Add to navigation in `Sidebar.tsx`

### Modify Yield Display

The earnings ticker in `EarningsTicker.tsx` can be customized:

```tsx
// Change decimal precision
const formattedValue = displayValue.toFixed(8); // Default is 10

// Change update frequency
const interval = setInterval(() => {
  // ...
}, 100); // Default is 50ms
```

## API Customization

### Add New Endpoints

Create new route files in `apps/api/src/routes/`:

```typescript
// apps/api/src/routes/rewards.ts
import { Hono } from 'hono';
import type { Env } from '../types';

const rewardsRoutes = new Hono<{ Bindings: Env }>();

rewardsRoutes.get('/', async (c) => {
  return c.json({ rewards: [] });
});

export { rewardsRoutes };
```

Register in `apps/api/src/index.ts`:

```typescript
import { rewardsRoutes } from './routes/rewards';
app.route('/rewards', rewardsRoutes);
```

### Custom Database Tables

Add migrations in `apps/api/migrations/`:

```sql
-- 0002_rewards.sql
CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Apply with:

```bash
npx wrangler d1 execute stashtab-db --file=migrations/0002_rewards.sql
```

## SDK Customization

### Add New Yield Sources

Create a new service in `packages/sdk/src/`:

```typescript
// packages/sdk/src/compound/CompoundService.ts
export class CompoundService {
  async supply(amount: bigint): Promise<Hash> {
    // Implement Compound supply
  }

  async withdraw(amount: bigint): Promise<Hash> {
    // Implement Compound withdraw
  }
}
```

### Multi-Chain Support

Add chain configurations to `packages/config/src/`:

```typescript
// packages/config/src/addresses.ts
export const ADDRESSES = {
  // Base
  8453: {
    /* ... */
  },
  84532: {
    /* ... */
  },
  // Optimism
  10: {
    USDC: '0x...',
    AAVE_POOL: '0x...',
    // ...
  },
};
```

## Environment Variables

### Frontend Variables

All frontend env vars must be prefixed with `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=xxx
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_APP_NAME=YourApp
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
```

### Backend Variables

Set via Cloudflare secrets:

```bash
npx wrangler secret put CUSTOM_API_KEY
```

Access in code:

```typescript
const apiKey = c.env.CUSTOM_API_KEY;
```

## Theming Examples

### Dark Mode (Default)

The default theme uses a dark color scheme with green accents.

### Light Mode

To add light mode support:

1. Add light mode colors to Tailwind config
2. Update `globals.css` with light mode variables
3. Add theme toggle component
4. Use `dark:` prefixes for dark-specific styles

### Alternative Color Schemes

#### Blue Theme

```javascript
yield: {
  light: '#60a5fa',
  DEFAULT: '#3b82f6',
  dark: '#2563eb',
},
```

#### Purple Theme

```javascript
yield: {
  light: '#c084fc',
  DEFAULT: '#a855f7',
  dark: '#9333ea',
},
```

#### Orange Theme

```javascript
yield: {
  light: '#fdba74',
  DEFAULT: '#f97316',
  dark: '#ea580c',
},
```

## Deployment Variations

### Self-Hosted API

Instead of Cloudflare Workers, deploy the API to:

- Your own Node.js server
- AWS Lambda
- Google Cloud Functions

You'll need to adapt the database layer (replace D1 with PostgreSQL, etc.)

### Alternative Frontend Hosting

Instead of Cloudflare Pages, deploy the frontend to:

- Vercel
- Netlify
- AWS Amplify

Update the build commands accordingly in your hosting provider's settings.

### Custom Domain

1. Add domain to Cloudflare Pages (Settings > Custom domains)
2. Update CORS origins in API (`apps/api/src/index.ts`)
3. Update `NEXT_PUBLIC_API_URL` environment variable
4. Update Privy allowed origins in Privy dashboard
