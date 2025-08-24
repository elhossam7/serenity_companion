import { render, screen } from '@testing-library/react'
import React from 'react'

function Hello({ name = 'world' }) {
  return <h1>Hello {name}</h1>
}

it('renders hello', () => {
  render(<Hello name="Serenity" />)
  expect(screen.getByText(/Hello Serenity/i)).toBeInTheDocument()
})
