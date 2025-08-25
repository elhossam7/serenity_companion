import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const ForgotPasswordInline = ({ defaultEmail = '' }) => {
  const { requestPasswordReset } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(defaultEmail)
  const [status, setStatus] = useState('idle') // idle | loading | sent | error
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('fr')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr'
    setLanguage(savedLanguage)
  }, [])

  const onSubmit = async (e) => {
    e?.preventDefault()
    setStatus('loading')
    setError('')
    const res = await requestPasswordReset(email)
    if (!res?.success) {
      setError(res?.error || 'Unable to send reset link')
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-body text-primary hover:text-primary/80 transition-colors"
        >
          {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
        </button>
      ) : (
        <div role="group" aria-label={language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Réinitialiser le mot de passe'} className="space-y-2">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder={language === 'ar' ? 'your@email.com' : 'votre@email.com'}
            value={email}
            onChange={(e) => setEmail(e?.target?.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(e) } }}
            className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm"
          />
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onSubmit}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (language === 'ar' ? 'جار الإرسال…' : 'Envoi…') : (language === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Envoyer le lien de réinitialisation')}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setStatus('idle'); setError('') }}
              className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
            >
              {language === 'ar' ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
          {status === 'sent' && (
            <p className="text-success text-sm">{language === 'ar' ? 'تحقق من بريدك الإلكتروني للحصول على الرابط.' : 'Vérifiez votre email pour le lien.'}</p>
          )}
          {status === 'error' && (
            <p className="text-error text-sm">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ForgotPasswordInline
