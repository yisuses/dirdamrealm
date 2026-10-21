import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { SelectMenu, type SelectMenuOption } from './SelectMenu'

const options: SelectMenuOption[] = [
  { value: '', label: 'Todas' },
  { value: 'ENG', label: 'Ingeniería' },
  { value: 'HIS', label: 'Historia y pensamiento' },
]

describe('SelectMenu', () => {
  it('should show the selected option on the trigger', () => {
    const { container } = renderWithProviders(
      <SelectMenu options={options} value="ENG" label="Categoría" onChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Categoría' })).toHaveTextContent('Ingeniería')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should fall back to the first option for an unknown value', () => {
    renderWithProviders(<SelectMenu options={options} value="NOPE" label="Categoría" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Categoría' })).toHaveTextContent('Todas')
  })

  it('should render an empty trigger without options', () => {
    renderWithProviders(<SelectMenu options={[]} value="" label="Categoría" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Categoría' })).toHaveTextContent('')
  })

  it('should list the options and report the one picked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<SelectMenu options={options} value="ENG" label="Categoría" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Categoría' }))
    const items = await screen.findAllByRole('menuitem')
    expect(items.map(item => item.textContent)).toEqual(['Todas', 'Ingeniería', 'Historia y pensamiento'])
    expect(screen.getByRole('menu')).toMatchSnapshot()

    await user.click(screen.getByRole('menuitem', { name: 'Historia y pensamiento' }))

    expect(onChange).toHaveBeenCalledWith('HIS')
  })
})
