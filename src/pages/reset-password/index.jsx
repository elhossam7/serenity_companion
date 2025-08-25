import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const ResetPasswordPage = () => {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState('')
  const [lng, setLng] = useState('fr')
  const [fromRecovery, setFromRecovery] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr'
    setLng(savedLanguage)
    document.documentElement?.setAttribute('lang', savedLanguage)
    document.documentElement?.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr')

    // detect if we were redirected from Supabase PASSWORD_RECOVERY
    try {
      const flag = sessionStorage?.getItem('isPasswordRecovery')
      if (flag === '1') {
        setFromRecovery(true)
        sessionStorage?.removeItem('isPasswordRecovery')
      }
    } catch (_) {}
  }, [])

  const dict = {
    fr: {
      updated: 'Mot de passe mis à jour',
      youCanLogin: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
      gotoLogin: 'Aller à la connexion',
      setNew: 'Définir un nouveau mot de passe',
      newPass: 'Nouveau mot de passe',
      confirmPass: 'Confirmer le mot de passe',
      updating: 'Mise à jour…',
      update: 'Mettre à jour le mot de passe',
      minLen: 'Le mot de passe doit contenir au moins 8 caractères',
      mismatch: 'Les mots de passe ne correspondent pas',
      fail: 'Échec de la mise à jour du mot de passe'
    },
    ar: {
      updated: 'تم تحديث كلمة المرور',
      youCanLogin: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
      gotoLogin: 'الانتقال إلى صفحة الدخول',
      setNew: 'تعيين كلمة مرور جديدة',
      newPass: 'كلمة المرور الجديدة',
      confirmPass: 'تأكيد كلمة المرور',
      updating: 'جارٍ التحديث…',
      update: 'تحديث كلمة المرور',
      minLen: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل',
      mismatch: 'كلمتا المرور غير متطابقتين',
      fail: 'فشل تحديث كلمة المرور'
    }
  }
  const t = dict[lng] || dict.fr

  const onSubmit = async (e) => {
    e?.preventDefault()
    if (!password || password?.length < 8) {
      setError(t?.minLen)
      setStatus('error')
      return
    }
    if (password !== confirm) {
      setError(t?.mismatch)
      setStatus('error')
      return
    }
    setStatus('loading')
    setError('')
    const res = await updatePassword(password)
    if (!res?.success) {
      setError(res?.error || t?.fail)
      setStatus('error')
      return
    }
    setStatus('success')
  try { sessionStorage.removeItem('isPasswordRecovery') } catch (_) {}
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-10 pb-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 shadow-soft-lg cultural-pattern">
            {fromRecovery && (
              <div className="mb-4 p-3 rounded-md border border-info/30 bg-info/10 text-info text-sm">
                {lng === 'ar' ? 'تم تحميل الجلسة، الرجاء إدخال كلمة مرور جديدة.' : 'Session chargée, veuillez définir un nouveau mot de passe.'}
              </div>
            )}
            {status === 'success' ? (
              <div className="text-center">
                <h1 className="text-xl font-heading font-semibold mb-2 text-foreground">{t?.updated}</h1>
                <p className="text-muted-foreground mb-4">{t?.youCanLogin}</p>
                <a href="/user-login" className="text-primary underline">{t?.gotoLogin}</a>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <h1 className="text-xl font-heading font-semibold text-foreground">{t?.setNew}</h1>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder={t?.newPass}
                  className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm"
                  value={password}
                  onChange={(e) => setPassword(e?.target?.value)}
                  required
                  minLength={8}
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder={t?.confirmPass}
                  className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm"
                  value={confirm}
                  onChange={(e) => setConfirm(e?.target?.value)}
                  required
                  minLength={8}
                />
                {status === 'error' && (
                  <p className="text-error text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? t?.updating : t?.update}
                </button>
              </form>
            )}
          </div>
        </div>
  </main>
    </div>
  )
}

export default ResetPasswordPage
