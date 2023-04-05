/* eslint-disable @typescript-eslint/naming-convention */

import path from 'path'
import { getTsconfig } from 'get-tsconfig'
import { pathsToModuleNameMapper } from 'ts-jest'
import packageJson from './package.json'

const tsConfigFile = './tsconfig.json'

const getTsConfigBasePaths = (tsConfigFile: string) => {
  const parsedTsConfig = getTsconfig(tsConfigFile)
  if (parsedTsConfig === null) {
    throw new Error(`Cannot find tsconfig file: ${tsConfigFile}`)
  }
  const tsPaths = parsedTsConfig.config.compilerOptions?.paths
  return tsPaths
    ? pathsToModuleNameMapper(tsPaths, {
        prefix: '<rootDir>/src',
      })
    : {}
}

export default {
  displayName: `${packageJson.name}:unit`,
  testEnvironment: 'jsdom',
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
    ...getTsConfigBasePaths(tsConfigFile),
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!*.config.js',
    '!jest.config.ts',
    '!*.d.ts',
    '!**/pages/*_*.tsx',
    '!.storybook/**',
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
