type AboutResponseEntity = {
  email?: string
  instagram?: string
  instagramUrl?: string
  twitter?: string
  twitterUrl?: string
  name?: string
  display: boolean
  linkedin?: string
  linkedinUrl?: string
  facebook?: string
  facebookUrl?: string
  description?: string
  createdAt: string
  updatedAt: string
  locale: string
}

type AboutResponse = StrapiSingleResponse<AboutResponseEntity>

type About = AboutResponseEntity & { id: number }
