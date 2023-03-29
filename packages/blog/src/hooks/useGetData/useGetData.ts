import { QueryKey, useQueryClient } from '@tanstack/react-query'

function useGetData<T>(key: QueryKey): T | undefined
function useGetData<T>(key: QueryKey, defaultValue: T): T
function useGetData<T>(key: QueryKey, defaultValue?: T): T | undefined {
  const queryClient = useQueryClient()
  const data = queryClient.getQueryData<T>(key)
  return data ?? defaultValue
}

export { useGetData }
