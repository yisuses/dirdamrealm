import { useQueryClient } from 'react-query'

export function useGetAbout() {
  const queryClient = useQueryClient()
  const about = queryClient.getQueryData<About>('about')

  return about
}
