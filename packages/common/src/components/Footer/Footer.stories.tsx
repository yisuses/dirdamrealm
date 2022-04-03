import styled from '@emotion/styled'
import { Story, Meta } from '@storybook/react'
import { Footer, FooterProps } from './Footer'

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

const Template: Story<FooterProps> = args => <Footer {...args}>Footer</Footer>

export const Default = Template.bind({})
Default.args = {
  version: '1.0',
  copyright: '© 2022 White Emotion. All rights reserved',
}

const StyledTemplate = styled.div`
  padding-top: 50px;
  height: 800px;
  display: flex;
  align-items: flex-end;
`
