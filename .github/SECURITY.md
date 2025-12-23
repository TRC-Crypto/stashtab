# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: security@stashtab.app (if available)
2. **GitHub Security Advisories**: [Create a private security advisory](https://github.com/TRC-Crypto/stashtab/security/advisories/new)
3. **GitHub Issue Template**: Use the [security issue template](https://github.com/TRC-Crypto/stashtab/issues/new?template=security.md)

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version of Stashtab
2. **Secure Keys**: Never commit API keys or secrets
3. **Environment Variables**: Use secure storage for environment variables
4. **Database Backups**: Regularly backup your database
5. **Monitor Logs**: Monitor error logs for suspicious activity

### For Developers

1. **Dependencies**: Keep dependencies updated
2. **Secrets**: Never hardcode secrets
3. **Input Validation**: Always validate user input
4. **Error Handling**: Don't expose sensitive information in errors
5. **Security Headers**: Use security headers middleware

## Security Features

Stashtab includes several security features:

- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Security headers (CSP, XSS, HSTS)
- ✅ Request signing
- ✅ Error boundary components
- ✅ Secure authentication (Privy)
- ✅ Smart contract security (Safe)

## Known Security Considerations

### Smart Contracts

- Stashtab uses Safe smart contracts (audited)
- Aave v3 integration (audited)
- Always verify contract addresses

### Authentication

- Privy handles authentication securely
- Tokens are validated on every request
- No private keys stored server-side

### Database

- D1 database is encrypted at rest
- Use parameterized queries (already implemented)
- Regular backups recommended

### API Security

- Rate limiting enabled
- CORS configured
- Security headers set
- Input validation with Zod

## Security Audit Status

- **Current Status**: Not yet audited
- **Planned**: Security audit for v1.0.0
- **Scope**: Smart contracts, API, authentication

## Responsible Disclosure

We follow responsible disclosure practices:

1. **Private Reporting**: Report vulnerabilities privately
2. **No Public Disclosure**: Don't disclose publicly until fixed
3. **Timeline**: We'll work with you on a reasonable timeline
4. **Credit**: We'll credit you (if desired) after resolution

## Security Updates

Security updates are released as:

- **Patch releases** (0.0.X) for critical vulnerabilities
- **Minor releases** (0.X.0) for non-critical security improvements
- **Security advisories** for all security issues

## Related Documentation

- [SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md) - Pre-production security checklist
- [SECURITY.md](docs/SECURITY.md) - Security documentation
- [DEPLOY.md](docs/DEPLOY.md) - Secure deployment guide

## Contact

For security concerns:

- **Email**: security@stashtab.app (if available)
- **GitHub**: [Security Advisories](https://github.com/TRC-Crypto/stashtab/security/advisories)
