import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Mirrors tsconfig.json: the `@blog/*` paths, and `baseUrl: src`, which lets layout.tsx
    // import `app-providers` bare.
    alias: {
      '@blog': path.resolve(import.meta.dirname, 'src'),
      'app-providers': path.resolve(import.meta.dirname, 'src/app-providers.tsx'),
    },
  },
  // tsconfig keeps `jsx: preserve` for Next; tests need it compiled.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    setupFiles: ['./vitest.setup.ts'],
    projects: [
      {
        extends: true,
        // Plain functions, mappers and route handlers.
        test: { name: 'unit', environment: 'node', include: ['src/**/*.spec.ts', 'scripts/**/*.spec.ts'] },
      },
      {
        extends: true,
        // Components, hooks and pages render React, so they need a DOM.
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.spec.tsx'],
          setupFiles: ['./vitest.setup.dom.tsx'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.stories.tsx',
        '**/*.mock.ts',
        '**/index.ts',
        '**/index.tsx',
        'src/test/**',
        // Declarative: table definitions and generated SQL, exercised by the queries' tests.
        'src/db/schema.ts',
        'src/db/migrations/**',
      ],
      reporter: ['text', 'cobertura', 'lcov'],
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
})
