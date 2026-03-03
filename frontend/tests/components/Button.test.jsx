import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../../src/components/Button'

test('prikazuje label na dugmetu', () => {
  render(<Button label="Klikni" />)

  expect(screen.getByRole('button', { name: 'Klikni' })).toBeInTheDocument()
})

test('poziva onClick kada se klikne', () => {
  const handleClick = vi.fn()

  render(<Button label="Klik" onClick={handleClick} />)

  fireEvent.click(screen.getByRole('button', { name: 'Klik' }))

  expect(handleClick).toHaveBeenCalledTimes(1)
})