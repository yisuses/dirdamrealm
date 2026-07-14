import path from 'path'
import { fileURLToPath } from 'url'

import babelParser from '@babel/eslint-parser'
import nextPlugin from '@next/eslint-plugin-next'
import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Preserved from the previous .eslintrc naming-convention config.
const namingConvention = [
  {
    selector: 'default',
    format: ['camelCase'],
    leadingUnderscore: 'forbid',
    trailingUnderscore: 'forbid',
    filter: { regex: '^(\\d+|\\dx\\w+)$', match: false },
  },
  { selector: 'variable', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
  { selector: ['function'], format: ['camelCase', 'PascalCase'] },
  { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
  { selector: 'class', format: ['PascalCase'] },
  { selector: 'classProperty', format: ['camelCase'] },
  { selector: 'enum', format: ['PascalCase'] },
  { selector: 'enumMember', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
  {
    selector: 'objectLiteralProperty',
    format: ['camelCase', 'snake_case', 'UPPER_CASE'],
    filter: { regex: '^(\\d+|\\dx\\w+)$', match: false },
  },
  { selector: ['typeAlias', 'interface'], format: ['PascalCase'] },
  { selector: ['typeProperty'], format: ['camelCase'] },
  { selector: ['typeParameter'], format: ['PascalCase'] },
]

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.out/**',
      '**/coverage/**',
      '**/.strapi/**',
      '**/generated/*.d.ts',
      '**/next-env.d.ts',
      'packages/blog/.storybook/**',
      'packages/api/**/types/*.d.ts',
    ],
  },

  // ---------- BLOG (TypeScript / React / Next) ----------
  {
    files: ['packages/blog/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      ...tseslint.configs.recommended,
      reactPlugin.configs.flat.recommended,
      prettierRecommended,
    ],
    plugins: { '@next/next': nextPlugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: path.join(rootDir, 'packages/blog'),
      },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: { project: path.join(rootDir, 'packages/blog/tsconfig.json') } },
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      // import/namespace is redundant with the TS compiler and false-positives on
      // namespace type-member access (Chakra v3 compound components, Sentry).
      'import/namespace': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/naming-convention': ['error', ...namingConvention],
    },
  },
  // .tsx — relaxed naming (was a warn-level override)
  {
    files: ['packages/blog/**/*.tsx'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'variable', format: ['camelCase', 'PascalCase'] },
        { selector: ['function'], format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
      ],
    },
  },
  // tests
  {
    files: ['packages/blog/**/*.{test,spec}.{ts,tsx}', 'packages/blog/**/tests.tsx'],
    rules: {
      'react/display-name': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },

  // ---------- API (JavaScript / Strapi) ----------
  {
    files: ['packages/api/**/*.js'],
    extends: [js.configs.recommended],
    // Register the @typescript-eslint plugin (rules kept off) so the pre-existing
    // `@typescript-eslint/*` eslint-disable directives in the Strapi source resolve.
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parser: babelParser,
      sourceType: 'module',
      parserOptions: { requireConfigFile: false, ecmaFeatures: { jsx: false } },
      globals: { ...globals.node, strapi: true },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'linebreak-style': ['error', 'unix'],
    },
  },
  // Strapi admin customization runs in the browser.
  {
    files: ['packages/api/src/admin/**/*.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
)
