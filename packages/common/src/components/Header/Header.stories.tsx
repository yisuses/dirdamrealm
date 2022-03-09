import { Story, Meta } from '@storybook/react'
import { Header, HeaderProps } from './Header'

export default {
  title: 'Header',
  component: Header,
  argTypes: {},
} as Meta

const Template: Story<HeaderProps> = args => <Header {...args} />

export const Default = Template.bind({})
Default.args = {
  categories: ['Dashboard', 'Projects', 'Team'],
}
