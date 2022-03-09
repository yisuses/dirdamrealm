import { Story, Meta } from '@storybook/react'
import { Simple } from './Header'

export default {
  title: 'Header',
  component: Simple,
  argTypes: {},
} as Meta

const Template: Story = args => <Simple {...args} />

export const Default = Template.bind({})
Default.args = {}
