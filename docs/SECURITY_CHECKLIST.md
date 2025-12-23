# Security Checklist

Pre-production security checklist for Stashtab deployments.

## Authentication & Authorization

- [ ] Privy App Secret is securely stored (not in code)
- [ ] API tokens are validated on every request
- [ ] User sessions expire appropriately
- [ ] Rate limiting is enabled and configured
- [ ] Admin endpoints require authentication
- [ ] Role-based access control (RBAC) implemented if needed

## API Security

- [ ] CORS is properly configured (not `*`)
- [ ] Security headers are enabled (CSP, XSS Protection, etc.)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] Request size limits configured
- [ ] Error messages don't expose sensitive information
- [ ] API versioning implemented

## Infrastructure

- [ ] Environment variables are stored securely (Cloudflare Secrets)
- [ ] Database credentials are not exposed
- [ ] RPC endpoints use HTTPS
- [ ] Cloudflare Workers are deployed to production
- [ ] D1 database backups are automated
- [ ] KV namespaces have appropriate TTLs
- [ ] Logs don't contain sensitive data (tokens, keys, etc.)

## Smart Contracts

- [ ] Smart contracts are audited (if using custom contracts)
- [ ] Safe contract addresses are verified
- [ ] Aave integration uses official contract addresses
- [ ] Transaction limits are enforced
- [ ] Gas limits are set appropriately
- [ ] Multi-sig considered for large balances

## Monitoring & Incident Response

- [ ] Error tracking configured (Sentry)
- [ ] Logging is comprehensive
- [ ] Alerts configured for critical errors
- [ ] Incident response plan documented
- [ ] Security contact information available
- [ ] Regular security audits scheduled

## Compliance

- [ ] KYC/AML compliance implemented (if required)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance (if serving EU users)
- [ ] Data retention policies implemented
- [ ] User data export functionality

## Testing

- [ ] Security testing performed
- [ ] Penetration testing completed
- [ ] Dependency vulnerabilities scanned
- [ ] Regular dependency updates scheduled
- [ ] Security patches applied promptly

## Documentation

- [ ] Security considerations documented
- [ ] Known risks documented
- [ ] Incident response procedures documented
- [ ] Security contact information available

## Deployment

- [ ] Production environment is separate from development
- [ ] Secrets are not committed to version control
- [ ] CI/CD pipelines are secure
- [ ] Deployment process is documented
- [ ] Rollback procedures are tested

## Post-Deployment

- [ ] Monitor error rates
- [ ] Review logs regularly
- [ ] Update dependencies regularly
- [ ] Review security advisories
- [ ] Conduct periodic security audits

## Quick Security Commands

```bash
# Check for dependency vulnerabilities
pnpm audit

# Run security tests
pnpm test

# Check environment variables
pnpm setup:check

# Review logs
npx wrangler tail

# Backup database
pnpm backup-db
```

## Security Contacts

- **Security Issues**: [security@stashtab.app](mailto:security@stashtab.app)
- **GitHub Security**: Use GitHub's private security advisory feature

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Cloudflare Security Best Practices](https://developers.cloudflare.com/workers/platform/security/)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

**Remember**: Security is an ongoing process, not a one-time checklist. Regularly review and update your security practices.
