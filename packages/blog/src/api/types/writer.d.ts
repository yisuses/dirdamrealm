type WriterResponseEntity = {
  name: string
  createdAt: string
  updatedAt: string
  avatar: string | null
}

type WriterResponse = StrapiData<WriterResponseEntity>

type Writer = WriterResponseEntity & { id: number }
