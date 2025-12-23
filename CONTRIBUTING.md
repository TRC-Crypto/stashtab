# Contributing to Stashtab

Thank you for your interest in contributing to Stashtab! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

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

## Development Workflow

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/stashtab.git
cd stashtab
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes

- Write clean, maintainable code
- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Run E2E tests (if applicable)
pnpm test:e2e
```

### 5. Commit Your Changes

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in transaction flow"
git commit -m "docs: update API documentation"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Project Structure

```
stashtab/
├── apps/           # Applications (web, admin, mobile, api)
├── packages/       # Shared packages (sdk, config)
├── docs/           # Documentation
├── scripts/        # Utility scripts
├── e2e/            # End-to-end tests
└── tests/          # Load tests
```

## Code Organization

- **Apps**: Self-contained applications
- **Packages**: Shared code used across apps
- **SDK**: Core business logic and integrations
- **Config**: Shared configuration and constants

## Testing Guidelines

### Unit Tests

- Test individual functions and methods
- Mock external dependencies
- Aim for >80% coverage

### Integration Tests

- Test component interactions
- Test API endpoints
- Test database operations

### E2E Tests

- Test complete user flows
- Test critical paths
- Keep tests maintainable

## Documentation Guidelines

- Update relevant docs when adding features
- Add code comments for complex logic
- Include examples in documentation
- Keep README up to date

## Review Process

1. All PRs require at least one review
2. CI must pass (lint, test, build)
3. Code must follow style guidelines
4. Documentation must be updated

## Getting Help

- 📖 Check [documentation](docs/)
- 💬 Open a [discussion](https://github.com/TRC-Crypto/stashtab/discussions)
- 🐛 Report a [bug](https://github.com/TRC-Crypto/stashtab/issues/new?template=bug_report.md)
- 💡 Suggest a [feature](https://github.com/TRC-Crypto/stashtab/issues/new?template=feature_request.md)

Thank you for contributing to Stashtab! 🚀
