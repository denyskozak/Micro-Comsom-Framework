import { defineConfig, type UserConfig } from 'vitest/config';

const defaultCoverage = {
  provider: 'v8' as const,
  reporter: ['text', 'html', 'lcov']
};

export const createNodeVitestConfig = (overrides: UserConfig = {}): UserConfig =>
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      coverage: defaultCoverage,
      ...overrides.test
    },
    ...overrides
  });

export const createDomVitestConfig = (overrides: UserConfig = {}): UserConfig =>
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.test.tsx', 'src/**/*.spec.tsx'],
      coverage: defaultCoverage,
      ...overrides.test
    },
    ...overrides
  });
