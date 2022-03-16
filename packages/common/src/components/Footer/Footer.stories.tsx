import styled from '@emotion/styled'
import { Story, Meta } from '@storybook/react'
import { Footer } from './Footer'

export default {
  title: 'Footer',
  component: Footer,
  argTypes: {
    categories: {
      control: false,
    },
  },
  decorators: [
    Story => (
      <StyledTemplate>
        <Story />
      </StyledTemplate>
    ),
  ],
} as Meta

const Template: Story = args => <Footer {...args} />

export const Default = Template.bind({})
Default.args = {}

const StyledTemplate = styled.div`
  padding-top: 50px;
  height: 800px;
  display: flex;
  align-items: flex-end;
`
