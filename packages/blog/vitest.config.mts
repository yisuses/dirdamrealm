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
    // next-auth's ESM build imports `next/server` without an extension, which Node's resolver
    // rejects; letting Vite process it resolves the import the way Next's bundler does.
    server: { deps: { inline: ['next-auth'] } },
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
          // Form tests type character by character; on a loaded CI runner 5s is not always enough.
          testTimeout: 15000,
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
