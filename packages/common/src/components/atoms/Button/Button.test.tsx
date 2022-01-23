import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  test('it renders successfully', () => {
    render(<Button text="hola" />)
    const buttonElement = screen.getByText(/hola/i)
    expect(buttonElement).toBeInTheDocument()
  })

  test('it renders text property', () => {
    render(<Button text="hola" />)
    const buttonElement = screen.getByText(/hola/i)
    expect(buttonElement).toBeInTheDocument()
  })
})
