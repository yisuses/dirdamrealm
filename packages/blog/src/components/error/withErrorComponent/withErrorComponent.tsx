import { Error } from '../../../pages/_error.page'

export interface WithErrorProps {
  error?: boolean
  statusCode?: number
}

export const withErrorComponent = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
): React.FC<P & WithErrorProps> => {
  return function WithErrorComponent({ error, statusCode, ...props }: WithErrorProps) {
    return error ? <Error statusCode={statusCode || 500} /> : <Component {...(props as P)} />
  }
}
