import { Table } from '@chakra-ui/react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ColumnHeader } from './ColumnHeader'

const renderHeader = () =>
  renderWithProviders(
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <ColumnHeader label="Código" hint="Forma parte de la dirección." />
        </Table.Row>
      </Table.Header>
    </Table.Root>,
  )

describe('ColumnHeader', () => {
  it('should show the label with a button that explains it', async () => {
    const user = userEvent.setup()
    renderHeader()

    expect(screen.getByRole('columnheader', { name: /Código/ })).toBeInTheDocument()
    await user.hover(screen.getByRole('button', { name: '¿Qué es «Código»?' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Forma parte de la dirección.')
  })

  it('should also explain it on keyboard focus', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.tab()

    expect(screen.getByRole('button', { name: '¿Qué es «Código»?' })).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Forma parte de la dirección.')
  })
})
