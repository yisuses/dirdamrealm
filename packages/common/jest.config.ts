import packageJson from './package.json'
const packageName = packageJson.name.replace('@whe/', '')

export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  rootDir: '../..',
  roots: [`<rootDir>/packages/${packageName}`],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts', `<rootDir>/packages/${packageName}/src/setupTests.ts`],
  testRegex: `(packages/${packageName}/.*/__tests__/.*|\\.(test|spec))\\.tsx?$`,
  moduleDirectories: ['node_modules'],
  modulePaths: [`<rootDir>/packages/${packageName}/src/`],
  name: packageName,
  displayName: packageName,
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(svg|png)$': '<rootDir>/__mocks__/assetsMock.js',
  },
}
