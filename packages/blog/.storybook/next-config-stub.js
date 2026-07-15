// Stub for `next/config`, removed in Next 16 (the app migrated off
// publicRuntimeConfig/serverRuntimeConfig to the next.config `env` block).
// Kept defensively in case @storybook/nextjs references next/config.
module.exports = {
  __esModule: true,
  default: () => ({ publicRuntimeConfig: {}, serverRuntimeConfig: {} }),
  setConfig: () => undefined,
}
