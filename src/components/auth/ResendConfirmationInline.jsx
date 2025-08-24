import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const ResendConfirmationInline = ({ email }) => {
  const { resendEmailConfirmation } = useAuth()
  const [status, setStatus] = useState('idle') // idle | loading | sent | error
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('fr')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr'
    setLanguage(savedLanguage)
  }, [])

  if (!email) return null

  const onResend = async () => {
    setStatus('loading')
    setError('')
    const res = await resendEmailConfirmation(email)
    if (!res?.success) {
      setError(res?.error || 'Envoi impossible')
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onResend}
        disabled={status === 'loading'}
        className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
      >
        {status === 'loading' ? (language === 'ar' ? 'جار الإرسال…' : 'Envoi…') : (language === 'ar' ? 'إعادة إرسال بريد التأكيد' : 'Renvoyer l’email de confirmation')}
      </button>
      {status === 'sent' && (
        <p className="text-success text-sm mt-1">{language === 'ar' ? 'تم إرسال بريد التأكيد.' : 'Email de confirmation renvoyé.'}</p>
      )}
      {status === 'error' && (
        <p className="text-error text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export default ResendConfirmationInline
