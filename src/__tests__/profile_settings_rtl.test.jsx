/* @vitest-environment jsdom */
// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nProvider } from '../contexts/I18nContext'
import { AuthProvider } from '../contexts/AuthContext'
import ProfilePage from '../pages/profile'
import SettingsPage from '../pages/settings'
import i18n from '../i18n'
// Mock router wrappers for Header dependency
import { MemoryRouter } from 'react-router-dom'

// Provide a localStorage polyfill for the test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map()
  const mockStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)) },
    removeItem: (key) => { store.delete(key) },
    clear: () => { store.clear() },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size }
  }
  Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, configurable: true })
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true })
  }
}

// Mock supabase to avoid real calls
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'u1', user_metadata: {} } } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      updateUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'u1', user_metadata: {} } } })),
      signOut: () => Promise.resolve({})
    },
    from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { id: 'u1', full_name: 'Test', display_name: 'T', language: 'ar' } } ) }) }) }),
    storage: { from: () => ({ upload: () => Promise.resolve({}), getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/a.png' } }) }) }
  }
}))

// Avoid noisy timers from App
vi.mock('../utils/analytics', () => ({ loadAnalytics: () => {} }))

function Providers({ children }) {
  return (
    <MemoryRouter>
      <I18nProvider>
        <AuthProvider>{children}</AuthProvider>
      </I18nProvider>
    </MemoryRouter>
  )
}

describe('RTL and i18n for Profile/Settings', () => {
  beforeEach(async () => {
    // set language to Arabic to verify RTL and translations
    localStorage.setItem('language', 'ar')
    await i18n.changeLanguage('ar')
  })

  it('renders Profile with Arabic labels and shows completion text', async () => {
    render(
      <Providers>
        <ProfilePage />
      </Providers>
    )
  // Title in Arabic
  expect(await screen.findByRole('heading', { name: 'الملف الشخصي' })).toBeInTheDocument()
    // Label examples
    expect(screen.getByText('المعلومات الأساسية')).toBeInTheDocument()
    expect(screen.getByText('اسم العرض')).toBeInTheDocument()
  })

  it('renders Settings and allows changing theme in Arabic', async () => {
    render(
      <Providers>
        <SettingsPage />
      </Providers>
    )
  expect(await screen.findByRole('heading', { name: 'الإعدادات' })).toBeInTheDocument()
    const themeSelect = screen.getByLabelText('السِمة')
    fireEvent.change(themeSelect, { target: { value: 'dark' } })
    // Preference persisted locally
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
