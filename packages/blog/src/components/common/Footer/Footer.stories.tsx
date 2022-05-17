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

const Template: Story<FooterProps> = args => <Footer {...args} />

export const Default = Template.bind({})
Default.args = {
  categories: [
    { url: '/dashboard', name: 'Dashboard', localizedName: 'Dashboard', code: 'DASH' },
    { url: '/projects', name: 'Projects', localizedName: 'Projects', code: 'PROJ' },
    { url: '/team', name: 'Team', localizedName: 'Team', code: 'TEAM' },
  ],
}

const StyledTemplate = styled.div`
  padding-top: 50px;
  height: 400px;
  display: flex;
  align-items: flex-end;
`
