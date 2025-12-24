# Integration Templates

Starter templates for integrating Stashtab into popular frameworks.

## Available Templates

- **Rails** - Ruby on Rails integration
- **Django** - Python/Django integration
- **Express** - Node.js/Express integration

## Quick Start

Each template includes:

- SDK initialization
- Example controllers/views
- Configuration files
- README with setup instructions

## Rails Template

```bash
# Clone template
git clone https://github.com/TRC-Crypto/stashtab/templates/rails-stashtab.git my-app
cd my-app

# Install dependencies
bundle install
npm install

# Configure
cp .env.example .env
# Edit .env with your API key

# Run
rails server
```

See [templates/rails-stashtab/README.md](templates/rails-stashtab/README.md) for details.

## Django Template

```bash
# Clone template
git clone https://github.com/TRC-Crypto/stashtab/templates/django-stashtab.git my-app
cd my-app

# Install dependencies
pip install -r requirements.txt
npm install

# Configure
cp .env.example .env
# Edit .env with your API key

# Run
python manage.py runserver
```

See [templates/django-stashtab/README.md](templates/django-stashtab/README.md) for details.

## Express Template

```bash
# Clone template
git clone https://github.com/TRC-Crypto/stashtab/templates/express-stashtab.git my-app
cd my-app

# Install dependencies
pnpm install

# Configure
cp .env.example .env
# Edit .env with your API key

# Run
pnpm dev
```

See [templates/express-stashtab/README.md](templates/express-stashtab/README.md) for details.

## Common Patterns

All templates follow similar patterns:

### 1. SDK Initialization

```typescript
// Express example
import { createStashtabClient } from '@stashtab/sdk';

const client = createStashtabClient({
  chainId: parseInt(process.env.CHAIN_ID || '8453'),
  rpcUrl: process.env.RPC_URL,
});
```

### 2. Balance Endpoint

```typescript
// Express example
router.get('/balance/:address', async (req, res) => {
  const balance = await client.yield.aave.getUserBalance(req.params.address, 0n);
  res.json({ balance: balance.totalBalance.toString() });
});
```

### 3. Send Payment

```typescript
// Express example
router.post('/send', async (req, res) => {
  const { to, amount, token } = req.body;
  const result = await client.payments.transfer.transfer({
    from: req.user.address,
    to,
    amount: BigInt(amount),
    token,
    chainId: 8453,
  });
  res.json(result);
});
```

## Customization

All templates are fully customizable:

- Add your own routes
- Customize UI/styling
- Add authentication
- Integrate with your database

## Support

For template-specific help:

- Check template README
- GitHub Issues: https://github.com/TRC-Crypto/stashtab/issues
- Documentation: https://github.com/TRC-Crypto/stashtab#readme
