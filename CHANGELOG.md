# Changelog

All notable changes to Stashtab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Automated deployment script (`pnpm deploy:auto`)
- One-click deploy via GitHub Actions
- Interactive getting started guide
- Template marketplace (crypto-only, SaaS-ready, compliant)
- Comprehensive monitoring and observability (Sentry, health checks)
- Enhanced error handling with retry logic
- E2E testing with Playwright
- Load testing with k6
- Security hardening (security headers, input sanitization)
- Database backup automation
- Enhanced caching middleware
- Performance documentation
- Security checklist
- Troubleshooting guide
- Quick start guide

### Changed

- Enhanced setup wizard with provider selection
- Improved error messages and user experience
- Enhanced API documentation
- Updated deployment workflows

### Fixed

- TypeScript errors in notification services
- Linting errors across codebase
- Mobile build configuration for CI

## [0.1.0] - 2024-12-23

### Added

- Initial release
- Core neobank functionality:
  - User authentication via Privy
  - Safe smart account creation
  - Aave v3 yield generation
  - Deposit, send, and withdraw flows
- Web application (Next.js)
- Mobile application (Expo/React Native)
- Admin dashboard
- Cloudflare Workers API
- Database migrations
- Fiat on/off ramp integrations (Stripe, MoonPay)
- KYC/AML integration (Persona)
- Email notifications (Resend)
- Push notifications (Expo, FCM)
- Comprehensive documentation
- CI/CD pipelines
- Testing infrastructure

[Unreleased]: https://github.com/TRC-Crypto/stashtab/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/TRC-Crypto/stashtab/releases/tag/v0.1.0
