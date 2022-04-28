import styled from '@emotion/styled'
import { Story, Meta } from '@storybook/react'
import { PostCard, PostCardProps } from './PostCard'

export default {
  title: 'PostCard',
  component: PostCard,
  argTypes: {
    categories: {
      control: false,
    },
  },
  decorators: [
    Story => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
  ],
} as Meta

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
`

const Template: Story<PostCardProps> = args => <PostCard {...args} />

export const Default = Template.bind({})
Default.args = {
  categories: [{ key: '1', label: 'Travel' }],
  imageUrl:
    'https://images.unsplash.com/photo-1547994770-e5d8509b114d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  date: '2019-12-12',
  title: 'Dream destinations to visit this year in Paris',
  description:
    'Progressively incentivize cooperative systems through technically sound functionalities. Credibly productivate seamless data with flexible schemas.',
}

export const MultipleCategories = Template.bind({})
MultipleCategories.args = {
  categories: [
    { key: '1', label: 'Travel' },
    { key: '2', label: 'Lifestyle' },
    { key: '3', label: 'Lifestyle' },
    { key: '8', label: 'Paranormal activity' },
    { key: '4', label: 'Lifestyle' },
    { key: '6', label: 'Lifestyle' },
    { key: '7', label: 'Lifestyle' },
    { key: '9', label: 'Paranormal activity' },
    { key: '5', label: 'Paranormal activity' },
  ],
  imageUrl:
    'https://images.unsplash.com/photo-1547994770-e5d8509b114d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  date: '2019-12-12',
  title: 'Dream destinations to visit this year in Paris',
  description:
    'Progressively incentivize cooperative systems through technically sound functionalities. Credibly productivate seamless data with flexible schemas.',
}
