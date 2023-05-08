import { aboutMapper } from './aboutMapper'

describe('aboutMapper', () => {
  it('should map an aboutEntity with all attributes correctly', () => {
    const aboutEntity = {
      id: 1,
      attributes: {
        email: 'john.doe@example.com',
        instagram: 'johndoe',
        instagramUrl: 'https://www.instagram.com/johndoe/',
        twitter: 'johndoe',
        twitterUrl: 'https://twitter.com/johndoe',
        name: 'John Doe',
        display: true,
        linkedin: 'johndoe',
        linkedinUrl: 'https://www.linkedin.com/in/johndoe/',
        facebook: 'johndoe',
        facebookUrl: 'https://www.facebook.com/johndoe/',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        createdAt: '2022-04-01T12:00:00.000Z',
        updatedAt: '2022-04-01T12:00:00.000Z',
        locale: 'en',
      },
    }

    const expectedAbout = {
      id: 1,
      email: 'john.doe@example.com',
      instagram: 'johndoe',
      instagramUrl: 'https://www.instagram.com/johndoe/',
      twitter: 'johndoe',
      twitterUrl: 'https://twitter.com/johndoe',
      name: 'John Doe',
      display: true,
      linkedin: 'johndoe',
      linkedinUrl: 'https://www.linkedin.com/in/johndoe/',
      facebook: 'johndoe',
      facebookUrl: 'https://www.facebook.com/johndoe/',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      createdAt: '2022-04-01T12:00:00.000Z',
      updatedAt: '2022-04-01T12:00:00.000Z',
      locale: 'en',
    }

    expect(aboutMapper(aboutEntity)).toEqual(expectedAbout)
  })

  it('should map an aboutEntity with missing attributes correctly', () => {
    const aboutEntity = {
      id: 1,
      attributes: {
        name: 'John Doe',
        display: true,
        createdAt: '2022-04-01T12:00:00.000Z',
        updatedAt: '2022-04-01T12:00:00.000Z',
        locale: 'en',
      },
    }

    const expectedAbout = {
      id: 1,
      name: 'John Doe',
      display: true,
      createdAt: '2022-04-01T12:00:00.000Z',
      updatedAt: '2022-04-01T12:00:00.000Z',
      locale: 'en',
    }

    expect(aboutMapper(aboutEntity)).toEqual(expectedAbout)
  })

  it('should map an aboutEntity with null attributes correctly', () => {
    const aboutEntity = {
      id: 1,
      attributes: {
        display: true,
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-02T00:00:00.000Z',
        locale: 'en',
        email: undefined,
        instagram: undefined,
        instagramUrl: undefined,
        twitter: undefined,
        twitterUrl: undefined,
        name: undefined,
        linkedin: undefined,
        linkedinUrl: undefined,
        facebook: undefined,
        facebookUrl: undefined,
        description: undefined,
      },
    }

    const expected: About = {
      id: 1,
      display: true,
      createdAt: '2022-01-01T00:00:00.000Z',
      updatedAt: '2022-01-02T00:00:00.000Z',
      locale: 'en',
    }

    const actual = aboutMapper(aboutEntity)

    expect(actual).toEqual(expected)
  })
})
