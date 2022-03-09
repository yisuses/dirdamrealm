import theme from '../src/theme/theme'
import '@fontsource/roboto'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  chakra: {
    theme,
  },
}

const StoryTemplate = ({ children, ...rest }) => (
  <div style={{ margin: 10, marginTop: 40 }} {...rest}>
    {children}
  </div>
)

export const decorators = [
  Story => (
    <StoryTemplate>
      <Story />
    </StoryTemplate>
  ),
]
