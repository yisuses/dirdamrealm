import { useQueryClient } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AdminProviders } from './AdminProviders'

function Probe() {
  const client = useQueryClient()
  return <p>{client.getDefaultOptions().queries?.retry === false ? 'sin reintentos' : 'con reintentos'}</p>
}

describe('AdminProviders', () => {
  it('should provide the theme and a query client that does not retry failed admin requests', () => {
    render(
      <AdminProviders>
        <Probe />
      </AdminProviders>,
    )

    expect(screen.getByText('sin reintentos')).toBeInTheDocument()
  })
})
