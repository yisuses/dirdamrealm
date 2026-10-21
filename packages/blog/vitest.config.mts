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
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/*.stories.tsx', '**/*.mock.{ts,tsx}', '**/*.handlers.{ts,tsx}', 'src/index.ts'],
      reporter: ['text', 'cobertura', 'lcov'],
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
})
