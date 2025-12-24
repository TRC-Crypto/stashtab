# Testing Guide

Stashtab uses Vitest for unit and integration testing.

## Overview

The testing setup includes:

- Vitest as the test runner
- Example tests for SDK services
- API route tests
- CI/CD integration via GitHub Actions

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
pnpm --filter @stashtab/sdk test
pnpm --filter @stashtab/api test
```

## Test Structure

```
packages/sdk/src/__tests__/
├── aave.test.ts      # AaveService unit tests
└── safe.test.ts      # SafeService unit tests

apps/api/src/__tests__/
└── auth.test.ts      # Auth route tests
```

## Writing Tests

### Unit Tests (SDK)

Test service methods with mocked dependencies:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AaveService } from '../aave/AaveService';

// Mock the client
const mockPublicClient = {
  readContract: vi.fn(),
  chain: { id: 84532 },
} as any;

describe('AaveService', () => {
  let service: AaveService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createAaveService({ chainId: 84532, publicClient: mockPublicClient });
  });

  it('should calculate yield per second', () => {
    const result = service.calculateYieldPerSecond(1000_000000n, 5.0);
    expect(result).toBeGreaterThan(0n);
  });

  it('should format balance correctly', () => {
    const formatted = service.formatBalance(1234_567890n, 2);
    expect(formatted).toBe('1234.56');
  });
});
```

### API Route Tests

Test API endpoints with mocked environment:

```typescript
import { describe, it, expect, vi } from 'vitest';

const mockEnv = {
  DB: {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    run: vi.fn(),
  },
  PRIVY_APP_ID: 'test-app-id',
  PRIVY_APP_SECRET: 'test-secret',
};

describe('Auth API', () => {
  it('should validate required fields', () => {
    // Test validation logic
  });

  it('should create user with Safe address', async () => {
    mockEnv.DB.first.mockResolvedValue(null);
    mockEnv.DB.run.mockResolvedValue({ success: true });

    // Test user creation
  });
});
```

### Integration Tests

Test multiple components working together:

```typescript
describe('User Flow', () => {
  it('should complete signup flow', async () => {
    // 1. Create user
    // 2. Predict Safe address
    // 3. Store in database
    // 4. Return user data
  });
});
```

## Mocking

### Viem Functions

```typescript
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    encodeFunctionData: vi.fn().mockReturnValue('0xmockeddata'),
  };
});
```

### External Services

```typescript
vi.mock('@privy-io/server-auth', () => ({
  PrivyClient: vi.fn().mockImplementation(() => ({
    verifyAuthToken: vi.fn().mockResolvedValue({
      userId: 'test-user',
    }),
  })),
}));
```

### Cloudflare Bindings

```typescript
const mockDB = {
  prepare: (sql: string) => ({
    bind: (...args: any[]) => ({
      first: vi.fn(),
      all: vi.fn(),
      run: vi.fn(),
    }),
  }),
};

const mockKV = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};
```

## Test Coverage

### Generating Coverage Reports

Generate coverage reports locally:

```bash
# Generate coverage report
pnpm test -- --coverage

# View HTML report
open coverage/index.html
```

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  exclude: [
    "node_modules/",
    "**/*.test.ts",
    "**/*.config.ts",
    "**/dist/**",
    "**/.next/**",
  ],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

### Coverage Goals

Stashtab aims for:

- **Minimum**: 80% coverage across all packages
- **Critical Paths**: 90%+ coverage (auth, transactions, KYC)
- **SDK**: 85%+ coverage (core business logic)

### Coverage Reports in CI

Coverage reports are generated automatically in CI:

- Reports are uploaded as artifacts
- Available for 30 days
- Can be downloaded from GitHub Actions

### Improving Coverage

1. **Identify Gaps**: Review coverage report
2. **Add Tests**: Write tests for uncovered code
3. **Focus on Critical Paths**: Prioritize business logic
4. **Maintain Thresholds**: Don't let coverage drop below 80%

### Coverage Exclusions

The following are excluded from coverage:

- Test files themselves
- Configuration files
- Build outputs
- Type definitions
- Example code

## CI/CD Integration

Tests run automatically on pull requests via GitHub Actions (`.github/workflows/ci.yml`):

```yaml
test:
  name: Test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm test
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// Good - tests behavior
it('should return formatted currency', () => {
  expect(formatUSDC(1000000n)).toBe('1.00');
});

// Bad - tests implementation details
it('should call toFixed with 2', () => {
  // ...
});
```

### 2. Use Descriptive Test Names

```typescript
// Good
it('should return 0 yield for zero balance');
it('should handle user not found error');

// Bad
it('test1');
it('works');
```

### 3. Isolate Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Reset state
});
```

### 4. Test Edge Cases

```typescript
describe('calculateYieldPerSecond', () => {
  it('should return 0 for zero balance');
  it('should return 0 for zero APY');
  it('should handle very large balances');
  it('should handle very small APY');
});
```

### 5. Use Test Fixtures

```typescript
// __tests__/fixtures.ts
export const mockUser = {
  id: 'usr_1',
  email: 'test@example.com',
  safeAddress: '0x1234...',
};

export const mockTransaction = {
  id: 'tx_1',
  type: 'deposit',
  amount: '100.00',
};
```

## Debugging Tests

### Run Single Test

```bash
pnpm test -- --filter "should calculate yield"
```

### Debug Mode

```bash
pnpm test -- --inspect-brk
```

### Verbose Output

```bash
pnpm test -- --reporter verbose
```

## Adding Tests for New Features

1. Create test file alongside implementation:
   - `myFeature.ts` → `__tests__/myFeature.test.ts`

2. Start with happy path tests

3. Add edge cases and error handling

4. Ensure tests pass in CI before merging
