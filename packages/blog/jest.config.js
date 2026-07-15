const path = require('path')

const { pathsToModuleNameMapper } = require('ts-jest')

const packageJson = require('./package.json')
const { compilerOptions } = require('./tsconfig.json')

const getTsConfigBasePaths = () => {
  const tsPaths = compilerOptions.paths
  return tsPaths
    ? pathsToModuleNameMapper(tsPaths, {
        prefix: '<rootDir>/src',
      })
    : {}
}

module.exports = {
  displayName: `${packageJson.name}:unit`,
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  rootDir: './',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFiles: ['<rootDir>/jest.setup.tsx'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        isolatedModules: true,
      },
    ],
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.svg$': path.resolve(__dirname, './jest/svg-transformer.js'),
    '.+\\.(png|jpg|gif|ttf|woff|woff2|mp4)$': path.resolve(__dirname, './jest/stub.js'),
    '^.+\\.(css|less|scss|sass)$': path.resolve(__dirname, './jest/stub.js'),
  },
  moduleNameMapper: {
    '^.+\\.(css|less|sass|scss)$': path.resolve(__dirname, './jest/file-mock.js'),
    '^.+\\.(png|jpg|gif|ttf|woff|woff2|mp4)$': path.resolve(__dirname, './jest/file-mock.js'),
    ...getTsConfigBasePaths(),
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!coverage',
    '!*.config.js',
    '!jest.config.js',
    '!*.d.ts',
    '!**/pages/*_*.tsx',
    '!.storybook/**',
    '!**/utils/storybook/**',
    '!**/*.stories.tsx',
    '!**/src/index.ts',
    '!**/**.mock.{ts,tsx}',
    '!**/**.handlers.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageReporters: ['text', 'cobertura', 'lcov'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  modulePathIgnorePatterns: ['.next'],
}
