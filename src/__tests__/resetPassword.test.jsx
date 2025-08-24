import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../contexts/AuthContext', () => {
  return {
    useAuth: () => ({
      updatePassword: vi.fn(async (pwd) => {
        if (pwd === 'goodpassword') return { success: true }
        return { success: false, error: 'fail' }
      })
    })
  }
})

import ResetPasswordPage from '../pages/reset-password'

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    // ensure FR by default in tests
    try { localStorage.setItem('language', 'fr') } catch {}
  })

  test('shows recovery banner when sessionStorage flag is set', () => {
    try { sessionStorage.setItem('isPasswordRecovery', '1') } catch {}
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/Session chargée|تم تحميل الجلسة/i)).toBeInTheDocument()
  })

  test('validation errors are shown for short or mismatched passwords', async () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )
    const inputs = screen.getAllByPlaceholderText(/Mot de passe|Nouveau mot de passe|Confirmer/)
    fireEvent.change(inputs[0], { target: { value: 'short' } })
    fireEvent.change(inputs[1], { target: { value: 'short' } })
    fireEvent.click(
      screen.getByRole('button', { name: /Mettre à jour le mot de passe|تحديث كلمة المرور/ })
    )
    expect(await screen.findByText(/au moins 8 caractères/)).toBeInTheDocument()

    // mismatch
    fireEvent.change(inputs[0], { target: { value: 'goodpassword' } })
    fireEvent.change(inputs[1], { target: { value: 'differentpass' } })
    fireEvent.click(
      screen.getByRole('button', { name: /Mettre à jour le mot de passe|تحديث كلمة المرور/ })
    )
    expect(await screen.findByText(/ne correspondent pas/)).toBeInTheDocument()
  })

  test('happy path updates password and shows success state', async () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )
    const inputs = screen.getAllByPlaceholderText(/Mot de passe|Nouveau mot de passe|Confirmer/)
    fireEvent.change(inputs[0], { target: { value: 'goodpassword' } })
    fireEvent.change(inputs[1], { target: { value: 'goodpassword' } })
    fireEvent.click(
      screen.getByRole('button', { name: /Mettre à jour le mot de passe|تحديث كلمة المرور/ })
    )

    expect(await screen.findByText(/Mot de passe mis à jour/)).toBeInTheDocument()
    expect(screen.getByText(/Aller à la connexion/)).toBeInTheDocument()
  })
})
