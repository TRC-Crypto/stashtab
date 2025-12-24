# Express.js Stashtab Template

Express.js template for integrating Stashtab into your Node.js application.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# CHAIN_ID=8453
# RPC_URL=https://mainnet.base.org

# Run development server
pnpm dev
```

## Features

- Express.js server setup
- Stashtab SDK integration
- Example routes (balance, yield rate, send)
- TypeScript support
- Environment variable configuration

## API Endpoints

### GET /stashtab/balance/:address

Get account balance.

```bash
curl http://localhost:3000/stashtab/balance/0x...
```

### GET /stashtab/yield-rate

Get current yield rate (APY).

```bash
curl http://localhost:3000/stashtab/yield-rate
```

### POST /stashtab/send

Send payment (placeholder - requires account abstraction).

```bash
curl -X POST http://localhost:3000/stashtab/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x...",
    "to": "0x...",
    "amount": "1000000",
    "token": "0x..."
  }'
```

## Customization

### Add Authentication

```typescript
import { authenticate } from './middleware/auth';

router.get('/balance/:address', authenticate, async (req, res) => {
  // ...
});
```

### Add Database

```typescript
import { db } from './lib/database';

router.get('/balance/:address', async (req, res) => {
  // Save to database
  await db.balances.create({ address, balance });
  // ...
});
```

## Next Steps

1. Add your own routes
2. Integrate with your database
3. Add authentication
4. Deploy to production

## Documentation

- [Stashtab SDK Docs](https://github.com/TRC-Crypto/stashtab#readme)
- [Express.js Docs](https://expressjs.com/)
