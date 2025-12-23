# Contributing to Stashtab

Thank you for your interest in contributing to Stashtab! This document provides guidelines and information for contributors.

## Code of Conduct

Be respectful and inclusive. We welcome contributions from everyone regardless of background or experience level.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, browser)

### Suggesting Features

1. Check existing issues/discussions
2. Create a new issue with:
   - Use case description
   - Proposed solution
   - Alternatives considered

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests and linting: `pnpm lint && pnpm typecheck`
5. Commit with clear messages
6. Push and create a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/stashtab.git
cd stashtab

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

## Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Run Prettier before committing: `pnpm format`
- Ensure no linting errors: `pnpm lint`

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add withdrawal confirmation modal
fix: correct balance calculation for edge case
docs: update deployment guide for Cloudflare
refactor: simplify Safe transaction encoding
```

## Testing

- Test your changes locally
- Ensure existing functionality isn't broken
- Add tests for new features when applicable

## Documentation

- Update docs if your changes affect usage
- Add comments for complex logic
- Update README if adding new features

## Questions?

Open a discussion or issue if you need help!

