# Admin Dashboard Guide

The admin dashboard provides operators with tools to manage users, monitor transactions, and configure the platform.

## Overview

The admin app is a Next.js application that runs on port 3001 to avoid conflicts with the main web app.

Features:
- Dashboard with key metrics
- User management (list, detail, search)
- Transaction monitoring
- Platform settings

## Getting Started

### Development

```bash
# Start all apps
pnpm dev

# Or start admin only
cd apps/admin
pnpm dev
```

Access at: http://localhost:3001

### Project Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with sidebar
│   │   ├── page.tsx           # Redirect to dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Dashboard page
│   │   ├── users/
│   │   │   ├── page.tsx       # User list
│   │   │   └── [id]/
│   │   │       └── page.tsx   # User detail
│   │   ├── transactions/
│   │   │   └── page.tsx       # Transaction list
│   │   └── settings/
│   │       └── page.tsx       # Platform settings
│   ├── components/
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── StatsCard.tsx      # Metric display card
│   │   ├── DataTable.tsx      # Generic data table
│   │   └── StatusBadge.tsx    # Status indicator
│   └── lib/
│       └── mockData.ts        # Mock data for development
├── package.json
└── tailwind.config.js
```

## Connecting to the API

### Admin API Routes

Add admin routes to your API (`apps/api/src/routes/admin.ts`):

```typescript
import { Hono } from "hono";
import type { Env } from "../types";

const adminRoutes = new Hono<{ Bindings: Env }>();

// List users with pagination
adminRoutes.get("/users", async (c) => {
  const { page = "1", limit = "20", search } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = "SELECT * FROM users";
  const params: any[] = [];

  if (search) {
    query += " WHERE email LIKE ?";
    params.push(`%${search}%`);
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);

  const users = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(users);
});

// Get user detail
adminRoutes.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(id).first();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

// List transactions
adminRoutes.get("/transactions", async (c) => {
  const { page = "1", limit = "50", type, status } = c.req.query();

  let query = "SELECT * FROM transactions";
  const conditions: string[] = [];
  const params: any[] = [];

  if (type) {
    conditions.push("type = ?");
    params.push(type);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  const transactions = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(transactions);
});

// Dashboard stats
adminRoutes.get("/stats", async (c) => {
  const [userCount, txCount, deposits, withdrawals] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM users").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM transactions WHERE DATE(created_at) = DATE('now')").first(),
    c.env.DB.prepare("SELECT SUM(CAST(amount AS REAL)) as total FROM transactions WHERE type = 'deposit'").first(),
    c.env.DB.prepare("SELECT SUM(CAST(amount AS REAL)) as total FROM transactions WHERE type = 'withdrawal'").first(),
  ]);

  return c.json({
    totalUsers: userCount?.count || 0,
    transactionsToday: txCount?.count || 0,
    totalDeposits: deposits?.total || 0,
    totalWithdrawals: withdrawals?.total || 0,
  });
});

export { adminRoutes };
```

### Fetching Data in Admin App

Replace mock data with API calls:

```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getStats() {
  const res = await fetch(`${API_URL}/admin/stats`);
  return res.json();
}

export async function getUsers(params?: { page?: number; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.search) searchParams.set("search", params.search);

  const res = await fetch(`${API_URL}/admin/users?${searchParams}`);
  return res.json();
}

export async function getUser(id: string) {
  const res = await fetch(`${API_URL}/admin/users/${id}`);
  return res.json();
}

export async function getTransactions(params?: {
  page?: number;
  type?: string;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.type) searchParams.set("type", params.type);
  if (params?.status) searchParams.set("status", params.status);

  const res = await fetch(`${API_URL}/admin/transactions?${searchParams}`);
  return res.json();
}
```

## Authentication

The admin dashboard should have its own authentication, separate from user auth.

### Simple Approach (Password)

Add admin password check in API:

```typescript
adminRoutes.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const adminKey = authHeader?.replace("Bearer ", "");

  if (adminKey !== c.env.ADMIN_API_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
```

### Better Approach (Privy)

Use Privy with email allowlist for admin users.

## Deployment

### Cloudflare Pages

```bash
cd apps/admin
pnpm build
npx wrangler pages deploy .next --project-name=stashtab-admin
```

### Environment Variables

Set in Cloudflare Pages dashboard:
- `NEXT_PUBLIC_API_URL` - Your API URL

## Customization

### Adding Admin Features

1. Create new page in `src/app/`:

```tsx
// src/app/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      {/* Your content */}
    </div>
  );
}
```

2. Add to sidebar navigation in `src/components/Sidebar.tsx`

### Theming

The admin uses a blue accent color to distinguish from the main app. Customize in `tailwind.config.js`:

```js
colors: {
  accent: {
    light: "#60a5fa",
    DEFAULT: "#3b82f6",
    dark: "#2563eb",
  },
}
```

## Security Considerations

1. **Separate domain** - Deploy admin to a different subdomain (e.g., admin.yourapp.com)
2. **IP allowlist** - Consider restricting access by IP
3. **Audit logging** - Log all admin actions
4. **2FA** - Enable two-factor authentication for admin accounts
5. **Rate limiting** - Protect admin endpoints from abuse

