const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chakra-ui/storybook-addon',
    'storybook-react-i18next',
    'storybook-addon-next',
  ],
  features: {
    postcss: false,
  },
  core: {
    builder: 'webpack5',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript-plugin',
  },
  webpackFinal: async (config, { isServer }) => {
    const fileLoaderRule = config.module.rules.find(rule => rule.test && rule.test.test('.svg'))
    fileLoaderRule.exclude = /\.svg$/

    config.module.rules.push({
      test: /\.svg$/,
      issuer: { and: [/\.(js|ts)x?$/] },
      use: [
        {
          loader: '@svgr/webpack',
          // https://react-svgr.com/docs/webpack/#passing-options
          options: {
            svgo: true,
            // @link https://github.com/svg/svgo#configuration
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: { removeViewBox: false },
                  },
                },
              ],
              multipass: false,
              datauri: 'base64',
              js2svg: {
                indent: 2,
                pretty: false,
              },
            },
          },
        },
      ],
    })

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@components': resolve('../src/components'),
        '@api': resolve('../src/api'),
        '@hooks': resolve('../src/hooks'),
        '@utils': resolve('../src/utils'),
      },
      fallback: {
        ...(config.resolve || {}).fallback,
        ...(!isServer && { fs: false }),
      },
    }

    // Return the altered config
    return config
  },
}
