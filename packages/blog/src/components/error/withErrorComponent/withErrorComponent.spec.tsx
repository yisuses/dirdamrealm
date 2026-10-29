import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { withErrorComponent } from './withErrorComponent'

function Greeting({ name }: { name: string }) {
  return <p>Hello {name}</p>
}

const GreetingWithError = withErrorComponent(Greeting)

describe('withErrorComponent', () => {
  it('should render the wrapped component with its props when there is no error', () => {
    const { container } = renderWithProviders(<GreetingWithError name="Saúl" />)

    expect(screen.getByText('Hello Saúl')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render the error page with the given status code', () => {
    const { container } = renderWithProviders(<GreetingWithError name="Saúl" error statusCode={404} />)

    expect(screen.queryByText('Hello Saúl')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Esta página se ha ido a la grada')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should default to a 500 error page when no status code is given', () => {
    renderWithProviders(<GreetingWithError name="Saúl" error />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Algo no ha ido bien')
    expect(screen.getByRole('link', { name: 'Recargar la página' })).toBeInTheDocument()
  })
})
