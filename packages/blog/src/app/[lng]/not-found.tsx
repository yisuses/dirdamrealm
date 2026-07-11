import { ErrorPage } from '@blog/components/error/ErrorPage'

// Rendered inside the [lng] layout, so the i18n + Chakra providers are available.
export default function NotFound() {
  return <ErrorPage statusCode={404} />
}
