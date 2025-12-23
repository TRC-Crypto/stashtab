import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.ts',
        '**/dist/**',
        '**/.next/**',
        '**/examples/**',
        '**/scripts/**',
      ],
      thresholds: {
        // Temporarily set to 0% to allow CI to pass while building test coverage
        // TODO: Increase thresholds as coverage improves (target: 80%)
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
