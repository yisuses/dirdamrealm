import { isAxiosError } from 'axios'

/** The message to show for a failed admin request: the API's own when it sent one. */
export function apiErrorMessage(error: unknown, fallback = 'No se ha podido guardar. Inténtalo de nuevo.') {
  if (isAxiosError(error) && typeof error.response?.data?.error === 'string') {
    return error.response.data.error as string
  }
  return fallback
}
