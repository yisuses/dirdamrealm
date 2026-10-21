import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Mirrors the `@blog/*` paths in tsconfig.json.
    alias: { '@blog': path.resolve(import.meta.dirname, 'src') },
  },
  test: {
    // Every spec exercises plain functions or route handlers; none renders a component.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // The logic layer these unit tests target. Components, hooks and pages are not
      // unit-tested, so measuring them would only hold the thresholds out of reach.
      include: ['src/api/**/*.ts', 'src/utils/**/*.ts', 'src/app/api/**/*.ts'],
      exclude: ['**/*.d.ts', '**/*.mock.ts', '**/index.ts'],
      reporter: ['text', 'cobertura', 'lcov'],
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
})
