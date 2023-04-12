import styled from '@emotion/styled'
import { StoryFn, Meta } from '@storybook/react'
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

const Template: StoryFn<FooterProps> = args => <Footer {...args} />

export const Default = Template.bind({})
Default.args = {
  categories: [
    { url: '/dashboard', name: 'Dashboard', localizedName: 'Dashboard', code: 'DASH' },
    { url: '/projects', name: 'Projects', localizedName: 'Projects', code: 'PROJ' },
    { url: '/team', name: 'Team', localizedName: 'Team', code: 'TEAM' },
  ],
  about: {
    id: 2,
    email: 'bla',
    instagram: 'bla',
    instagramUrl: 'bla',
    twitter: 'bla',
    twitterUrl: 'bla',
    name: 'bla',
    display: true,
    linkedin: 'bla',
    linkedinUrl: 'bla',
    facebook: 'bla',
    facebookUrl: 'bla',
    description: 'bla',
    createdAt: 'bla',
    updatedAt: 'bla',
    locale: 'es',
  },
}

const StyledTemplate = styled.div`
  padding-top: 50px;
  height: 400px;
  display: flex;
  align-items: flex-end;
`
