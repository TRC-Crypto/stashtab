# Stashtab API Documentation

The Stashtab API is a RESTful API built with [Hono](https://hono.dev) and deployed on Cloudflare Workers. It provides endpoints for user authentication, account management, and yield operations.

## Interactive Documentation

When running locally, access the interactive Swagger UI:

- **Local**: http://localhost:8787/docs

The OpenAPI specification is available at `/openapi.json`.

> **Note**: Production deployment URLs should be configured based on your deployment setup. Update the OpenAPI server configuration in `apps/api/src/openapi.ts` when deploying.

## Base URLs

| Environment | URL                                |
| ----------- | ---------------------------------- |
| Local       | `http://localhost:8787`            |
| Production  | Configure based on your deployment |

For production deployments, update the server URL in your deployment configuration and in `apps/api/src/openapi.ts`.

## Authentication

All authenticated endpoints require a Privy JWT token in the Authorization header:

```
Authorization: Bearer <privy-token>
```

### Getting a Token

1. User authenticates via Privy in the frontend
2. Frontend receives a JWT from Privy
3. Include this JWT in API requests

```typescript
// Frontend example
const token = await privy.getAccessToken();
const response = await fetch('http://localhost:8787/account', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Rate Limiting

Rate limits are applied per-user for authenticated endpoints and per-IP for public endpoints.

| Endpoint Type   | Limit       | Window   |
| --------------- | ----------- | -------- |
| Public (yield)  | 30 requests | 1 minute |
| Standard (read) | 60 requests | 1 minute |
| Strict (write)  | 10 requests | 1 minute |

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1703275200
```

When rate limited, you'll receive a `429 Too Many Requests` response with a `Retry-After` header.

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "additional context"
    }
  },
  "requestId": "abc-123-def-456"
}
```

### Error Codes Reference

#### Authentication Errors (401)

| Code                 | Description                      |
| -------------------- | -------------------------------- |
| `AUTH_MISSING_TOKEN` | No Authorization header provided |
| `AUTH_INVALID_TOKEN` | Token is invalid or malformed    |
| `AUTH_TOKEN_EXPIRED` | Token has expired                |
| `AUTH_NO_WALLET`     | User has no embedded wallet      |

#### Validation Errors (400)

| Code                     | Description                           |
| ------------------------ | ------------------------------------- |
| `VALIDATION_FAILED`      | Request body failed validation        |
| `INVALID_ADDRESS`        | Invalid Ethereum address format       |
| `INVALID_AMOUNT`         | Invalid amount (not positive integer) |
| `MISSING_REQUIRED_FIELD` | Required field is missing             |

#### Resource Errors (404)

| Code                 | Description                      |
| -------------------- | -------------------------------- |
| `USER_NOT_FOUND`     | User account doesn't exist       |
| `ACCOUNT_NOT_FOUND`  | Account not found                |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |

#### Business Logic Errors (422)

| Code                 | Description                         |
| -------------------- | ----------------------------------- |
| `INSUFFICIENT_FUNDS` | Not enough balance for operation    |
| `TRANSFER_FAILED`    | Transfer could not be completed     |
| `WITHDRAWAL_FAILED`  | Withdrawal could not be completed   |
| `SAFE_NOT_DEPLOYED`  | Safe smart account not yet deployed |

#### Rate Limiting (429)

| Code                  | Description                        |
| --------------------- | ---------------------------------- |
| `RATE_LIMIT_EXCEEDED` | Too many requests, try again later |

#### Server Errors (500)

| Code             | Description                |
| ---------------- | -------------------------- |
| `INTERNAL_ERROR` | Unexpected server error    |
| `DATABASE_ERROR` | Database operation failed  |
| `RPC_ERROR`      | Blockchain RPC call failed |

## Endpoints

### Health Check

```http
GET /
```

Returns API status and links to documentation.

**Response:**

```json
{
  "name": "Stashtab API",
  "version": "0.1.0",
  "status": "ok",
  "docs": "/docs",
  "openapi": "/openapi.json"
}
```

---

### Authentication

#### Create Account

```http
POST /auth/signup
Authorization: Bearer <privy-token>
```

Creates a new user account with a predicted Safe address. If the user already exists, returns existing account info.

**Response (201):**

```json
{
  "message": "Account created",
  "userId": "uuid",
  "safeAddress": "0x...",
  "ownerAddress": "0x..."
}
```

**Response (200 - existing user):**

```json
{
  "message": "User already exists",
  "userId": "uuid",
  "safeAddress": "0x..."
}
```

---

### Account

#### Get Account Information

```http
GET /account
Authorization: Bearer <privy-token>
```

Returns full account information including balances and yield rates.

**Response:**

```json
{
  "userId": "uuid",
  "safeAddress": "0x...",
  "ownerAddress": "0x...",
  "balance": {
    "safeBalance": "1000000",
    "aaveBalance": "5000000",
    "totalBalance": "6000000",
    "totalDeposited": "5500000",
    "yieldEarned": "500000"
  },
  "yieldRate": {
    "apyPercent": 5.24,
    "liquidityRate": "52400000000000000000000000",
    "lastUpdated": 1703275200
  }
}
```

#### Get Balance

```http
GET /account/balance
Authorization: Bearer <privy-token>
```

Returns current balance and yield rate (lighter endpoint for refreshing).

**Response:**

```json
{
  "balance": {
    "safeBalance": "1000000",
    "aaveBalance": "5000000",
    "totalBalance": "6000000",
    "totalDeposited": "5500000",
    "yieldEarned": "500000"
  },
  "yieldRate": {
    "apyPercent": 5.24,
    "liquidityRate": "52400000000000000000000000",
    "lastUpdated": 1703275200
  }
}
```

#### Send USDC

```http
POST /account/send
Authorization: Bearer <privy-token>
Content-Type: application/json

{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "1000000"
}
```

Send USDC to another address. Amount is in raw USDC units (6 decimals).

**Response:**

```json
{
  "message": "Transfer initiated",
  "status": "pending",
  "to": "0x...",
  "amount": "1000000"
}
```

#### Withdraw USDC

```http
POST /account/withdraw
Authorization: Bearer <privy-token>
Content-Type: application/json

{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "1000000"
}
```

Withdraw USDC from Aave to an external address.

**Response:**

```json
{
  "message": "Withdrawal initiated",
  "status": "pending",
  "to": "0x...",
  "amount": "1000000"
}
```

---

### Yield

#### Get Current Yield Rate

```http
GET /yield/rate
```

Get the current Aave supply APY for USDC. Results are cached for 60 seconds.

**Response:**

```json
{
  "asset": "USDC",
  "chainId": 84532,
  "apyPercent": 5.24,
  "liquidityRate": "52400000000000000000000000",
  "liquidityIndex": "1000000000000000000000000000",
  "lastUpdated": 1703275200,
  "aTokenAddress": "0x...",
  "poolAddress": "0x..."
}
```

#### Get Historical Yield (Not Implemented)

```http
GET /yield/history?period=7d
```

Get historical APY data over time. Currently returns a placeholder response.

**Query Parameters:**

- `period`: `1d`, `7d`, `30d`, or `90d` (default: `7d`)

---

## Request Tracking

All requests include a unique request ID:

- Included in response header: `X-Request-Id`
- Included in error responses: `requestId` field

Use this ID when reporting issues for faster debugging.

## Extending the API

### Adding New Routes

1. Create schema in `src/schemas/`:

```typescript
// src/schemas/myFeature.ts
import { z } from 'zod';

export const MyRequestSchema = z.object({
  field: z.string(),
});
```

2. Create route file with OpenAPI definitions:

```typescript
// src/routes/myFeature.ts
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { MyRequestSchema } from '../schemas';

const myRoute = createRoute({
  method: 'post',
  path: '/my-endpoint',
  tags: ['MyFeature'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: MyRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
  },
});

const myFeatureRoutes = new OpenAPIHono();

myFeatureRoutes.openapi(myRoute, async (c) => {
  const body = c.req.valid('json');
  // Handle request
  return c.json({ success: true });
});

export { myFeatureRoutes };
```

3. Register in `src/index.ts`:

```typescript
import { myFeatureRoutes } from './routes/myFeature';

app.route('/my-feature', myFeatureRoutes);
```

### Adding Custom Errors

```typescript
import { APIError, ErrorCode } from '../errors';

// Throw typed errors
throw new APIError(ErrorCode.VALIDATION_FAILED, 'Custom error message', { field: 'details' });
```

## Local Development

```bash
# Start the API
cd apps/api
pnpm dev

# API available at http://localhost:8787
# Swagger UI at http://localhost:8787/docs
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```
