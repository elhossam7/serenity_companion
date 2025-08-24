import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('../contexts/AuthContext', () => {
  return {
    useAuth: () => ({
      requestPasswordReset: vi.fn(async () => ({ success: true })),
      resendEmailConfirmation: vi.fn(async () => ({ success: true }))
    })
  }
})

import ForgotPasswordInline from '../components/auth/ForgotPasswordInline'
import ResendConfirmationInline from '../components/auth/ResendConfirmationInline'

describe('Auth inline helpers', () => {
  test('ForgotPasswordInline sends request and shows success', async () => {
    render(<ForgotPasswordInline defaultEmail="test@example.com" />)
    fireEvent.click(screen.getByText(/Mot de passe oublié|نسيت/))
    fireEvent.click(screen.getByRole('button', { name: /Envoyer|إرسال/ }))
    expect(await screen.findByText(/Vérifiez|تحقق/)).toBeInTheDocument()
  })

  test('ResendConfirmationInline triggers resend', async () => {
    render(<ResendConfirmationInline email="test@example.com" />)
    fireEvent.click(screen.getByRole('button'))
    expect(await screen.findByText(/renvoyé|تم إرسال/)).toBeInTheDocument()
  })
})
