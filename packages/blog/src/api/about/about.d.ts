type AboutResponseEntity = {
  email?: string
  instagram?: string
  twitter?: string
  name?: string
  display: boolean
  linkedin?: string
  facebook?: string
  description?: string
  createdAt: string
  updatedAt: string
  locale: string
}

type AboutResponse = StrapiSingleResponse<AboutResponseEntity>

type About = AboutResponseEntity & { id: number }
