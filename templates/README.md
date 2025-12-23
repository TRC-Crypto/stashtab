# Stashtab Templates

Pre-configured templates for common neobank use cases. Choose the template that best fits your needs.

## Available Templates

### Crypto-Only

**Best for**: Crypto-native applications, DeFi protocols, wallet applications

**Features**:

- ✅ Crypto deposits and withdrawals
- ✅ Yield generation via Aave
- ✅ Send/receive functionality
- ❌ No fiat on/off ramps
- ❌ No KYC verification
- ✅ Basic email notifications

**Use Case**: Perfect for applications that only deal with crypto, don't need fiat integration, and want minimal compliance overhead.

**Setup**:

```bash
pnpm create-stashtab-app my-app --template crypto-only
```

### SaaS-Ready

**Best for**: White-label platforms, B2B SaaS, multi-brand deployments

**Features**:

- ✅ Full fiat on/off ramp support (Stripe + MoonPay)
- ✅ Complete KYC verification (Persona)
- ✅ Advanced notifications (Email + Push)
- ✅ Multi-tenant architecture hooks
- ✅ Custom branding support

**Use Case**: Perfect for building a white-label neobank platform that you can deploy for multiple clients.

**Setup**:

```bash
pnpm create-stashtab-app my-app --template saas-ready
```

### Compliant

**Best for**: Production deployments, regulated financial services, enterprise applications

**Features**:

- ✅ Full compliance features
- ✅ KYC required for sensitive operations
- ✅ Transaction limits and monitoring
- ✅ Security best practices
- ✅ Audit logging

**Use Case**: Production-ready configuration for regulated environments with full compliance features.

**Setup**:

```bash
pnpm create-stashtab-app my-app --template compliant
```

## Creating a Custom Template

You can create your own template by:

1. Copy an existing template directory
2. Modify `stashtab.config.ts` to match your needs
3. Add any custom files or configurations
4. Document your template in this README

## Template Structure

Each template includes:

- `stashtab.config.ts` - Main configuration file
- `README.md` - Template-specific documentation (optional)
- Any additional files needed for that template

## Choosing the Right Template

| Feature              | Crypto-Only | SaaS-Ready  | Compliant  |
| -------------------- | ----------- | ----------- | ---------- |
| Fiat On/Off Ramp     | ❌          | ✅          | ✅         |
| KYC Verification     | ❌          | ✅          | ✅         |
| Email Notifications  | ✅          | ✅          | ✅         |
| Push Notifications   | ❌          | ✅          | ✅         |
| Multi-Tenant Support | ❌          | ✅          | ❌         |
| Compliance Features  | ❌          | ❌          | ✅         |
| Best For             | Crypto apps | White-label | Production |

## Migration Between Templates

You can switch templates by:

1. Copy the `stashtab.config.ts` from your desired template
2. Update environment variables as needed
3. Run `pnpm setup` to reconfigure

**Note**: Switching templates may require database migrations or additional setup. Always test in a development environment first.

## Need Help?

- 📖 [Full Documentation](../docs/README.md)
- 🐛 [Report an Issue](https://github.com/TRC-Crypto/stashtab/issues)
- 💬 [Join Discord](https://discord.gg/stashtab) (coming soon)
