import React, { useEffect, useState } from 'react';
import Button from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ConsentGate = () => {
  const { userProfile, updateProfile } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [visible, setVisible] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (userProfile && userProfile.id) {
      const accepted = userProfile?.consent_accepted_at || userProfile?.has_consented;
      if (!accepted) {
        setAgree(false);
        setVisible(true);
      } else {
        setAgree(true);
        setVisible(false);
      }
    }
  }, [userProfile]);

  const handleAccept = async () => {
    await updateProfile({ has_consented: true, consent_accepted_at: new Date().toISOString() });
    setVisible(false);
  };

  const handleDecline = () => {
    // Minimal behavior: keep modal open or sign out in a stricter policy
    setVisible(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-soft-xl max-w-lg w-full border border-border p-6">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
          {lang === 'ar' ? 'يتطلب الموافقة' : lang === 'fr' ? 'Consentement requis' : 'Consent Required'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {lang === 'ar' ? 'يرجى مراجعة والموافقة على' : lang === 'fr' ? 'Veuillez consulter et accepter notre' : 'Please review and accept our'}
          {' '}
          <a href="/privacy" className="text-primary underline">{lang === 'ar' ? 'سياسة الخصوصية' : lang === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}</a>
          {', '}
          <a href="/terms" className="text-primary underline">{lang === 'ar' ? 'الشروط' : lang === 'fr' ? 'Conditions' : 'Terms'}</a>
          {' '}
          {lang === 'ar' ? 'و' : lang === 'fr' ? 'et' : 'and'}{' '}
          <a href="/disclaimers" className="text-primary underline">{lang === 'ar' ? 'إخلاء المسؤولية' : lang === 'fr' ? 'Avertissements' : 'Disclaimers'}</a>
          {' '}
          {lang === 'ar' ? 'للمتابعة.' : lang === 'fr' ? 'pour continuer.' : 'to continue.'}
        </p>
        <div className="flex items-center space-x-2 mb-4">
          <input id="agree" type="checkbox" className="w-4 h-4" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
          <label htmlFor="agree" className="text-sm text-foreground">
            {lang === 'ar' ? 'أوافق' : lang === 'fr' ? 'J\'accepte' : 'I agree'}
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={handleDecline}>{lang === 'ar' ? 'إلغاء' : lang === 'fr' ? 'Annuler' : 'Cancel'}</Button>
          <Button variant="primary" disabled={!agree} onClick={handleAccept}>
            {lang === 'ar' ? 'موافقة' : lang === 'fr' ? 'Accepter' : 'Accept'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentGate;
