import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import type { StorybookConfig } from '@storybook/nextjs'

const currentDir = dirname(fileURLToPath(import.meta.url))
const resolve = (p: string) => join(currentDir, p)

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  webpackFinal: async config => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rules = (config.module?.rules ?? []) as any[]
    const fileLoaderRule = rules.find(rule => rule?.test instanceof RegExp && rule.test.test('.svg'))
    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/
    rules.push({
      test: /\.svg$/,
      issuer: { and: [/\.(js|ts)x?$/] },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
              multipass: false,
              datauri: 'base64',
              js2svg: { indent: 2, pretty: false },
            },
          },
        },
      ],
    })

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        // Single @blog alias mirrors tsconfig baseUrl:src (covers @blog/core, @blog/themes, etc.)
        '@blog': resolve('../src'),
        // Next 16 removed next/config; stub it defensively for @storybook/nextjs.
        'next/config': resolve('next-config-stub.js'),
      },
    }
    return config
  },
}

export default config
