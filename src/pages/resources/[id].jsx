import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { wellnessService } from '../../services/wellnessService';
import { findMatchingGoalByTaxonomy } from '../../utils/categoryTaxonomy';
import { analyticsService } from '../../services/analyticsService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const ResourceDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const startGuided = new URLSearchParams(location.search).get('start') === 'guided';
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language;
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guidedActive, setGuidedActive] = useState(startGuided);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await wellnessService.getResourceById(id);
        if (!mounted) return;
        setResource(res?.data || null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [id]);

  const desc = () => {
    if (!resource) return '';
    if (lang === 'ar') return resource.description_ar || resource.description || resource.description_fr || '';
    if (lang === 'en') return resource.description_en || resource.description || resource.description_fr || resource.description_ar || '';
    return resource.description_fr || resource.description || resource.description_en || '';
  };

  // Simple guided steps generator based on category/duration
  const guidedSteps = () => {
    const total = resource?.duration_minutes || 5;
    const cat = (resource?.category || '').toLowerCase();
    if (cat === 'breathing' || cat === 'mindfulness') {
      return [
        { key: 'prep', label: lang === 'ar' ? 'التحضير' : lang === 'fr' ? 'Préparation' : 'Preparation', seconds: 30, text: lang === 'ar' ? 'اجلس في مكان مريح وخذ نفسًا عميقًا.' : lang === 'fr' ? 'Asseyez-vous confortablement et prenez une profonde inspiration.' : 'Sit comfortably and take a deep breath.' },
        { key: 'cycle1', label: '1/3', seconds: Math.max(60, total * 60 * 0.4), text: lang === 'ar' ? 'تنفّس 4-4-6: شهيق 4، حبس 4، زفير 6.' : lang === 'fr' ? 'Respiration 4-4-6: Inhale 4, retenez 4, expirez 6.' : 'Breathing 4-4-6: Inhale 4, hold 4, exhale 6.' },
        { key: 'cycle2', label: '2/3', seconds: Math.max(45, total * 60 * 0.3), text: lang === 'ar' ? 'حافظ على وتيرة مريحة.' : lang === 'fr' ? 'Gardez un rythme confortable.' : 'Keep a comfortable pace.' },
        { key: 'reflect', label: lang === 'ar' ? 'ختام' : lang === 'fr' ? 'Clôture' : 'Wrap-up', seconds: 30, text: lang === 'ar' ? 'لاحظ أي تغيّر في جسمك ومشاعرك.' : lang === 'fr' ? 'Remarquez tout changement dans votre corps et vos émotions.' : 'Notice any change in body and feelings.' },
      ];
    }
    // generic movement or others
    return [
      { key: 'warmup', label: lang === 'ar' ? 'تهيئة' : lang === 'fr' ? 'Échauffement' : 'Warm-up', seconds: 45, text: lang === 'ar' ? 'حركات لطيفة للرقبة والكتفين.' : lang === 'fr' ? 'Mouvements doux du cou et des épaules.' : 'Gentle neck and shoulder movements.' },
      { key: 'main', label: 'Main', seconds: Math.max(60, total * 60 * 0.6), text: lang === 'ar' ? 'تمدد بسيط وحركات بطيئة.' : lang === 'fr' ? 'Étirements simples et mouvements lents.' : 'Simple stretches and slow movements.' },
      { key: 'cool', label: lang === 'ar' ? 'استرخاء' : lang === 'fr' ? 'Retour au calme' : 'Cool-down', seconds: 30, text: lang === 'ar' ? 'تنفّس بعمق واسترخِ.' : lang === 'fr' ? 'Respirez profondément et détendez-vous.' : 'Breathe deeply and relax.' },
    ];
  };

  useEffect(() => {
    if (!guidedActive) return;
    const steps = guidedSteps();
    setSecondsLeft(Math.ceil(steps[stepIndex]?.seconds || 0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guidedActive, stepIndex, resource]);

  useEffect(() => {
    if (!guidedActive || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [guidedActive, secondsLeft]);

  useEffect(() => {
    if (!guidedActive || secondsLeft > 0) return;
    const steps = guidedSteps();
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      setSecondsLeft(Math.ceil(steps[stepIndex + 1]?.seconds || 0));
    } else {
      // Completed flow
      setGuidedActive(false);
      setCompleted(true);
      void onGuidedComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, guidedActive]);

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const onGuidedComplete = async () => {
    try {
      if (!user?.id || !resource?.id) return;
      setSaving(true);
      // Compute total time from steps
      const totalSeconds = guidedSteps().reduce((sum, s) => sum + Math.ceil(s.seconds || 0), 0);
      const minutes = Math.max(1, Math.round(totalSeconds / 60));
      // Record interaction as completed
      await wellnessService.recordResourceInteraction(user.id, resource.id, {
        type: 'completed',
        rating: null,
        progress: 100,
        timeSpent: minutes,
        notes: 'Guided session completed'
      });
      // Try award progress to a matching active goal by category
      try {
        const goalsRes = await wellnessService.getWellnessGoals(user.id, { activeOnly: true });
        const goals = goalsRes?.data || [];
  const match = findMatchingGoalByTaxonomy(goals, resource);
        if (match) {
          const current = Number(match.current_value || 0);
          await wellnessService.updateGoalProgress(match.id, user.id, current + minutes);
        }
      } catch (_) {}
    } finally {
      setSaving(false);
    }
  };

  // Removed: replaced by taxonomy util

  const submitRating = async () => {
    if (!user?.id || !resource?.id || !rating) return;
    try {
      setSaving(true);
      const interaction = await wellnessService.recordResourceInteraction(user.id, resource.id, {
        type: 'completed',
        rating,
        progress: 100
      });
      // Compute a basic satisfaction score: weighted by rating and resource duration
      // score = rating(1-5) * log(1 + minutes)
      const minutes = Math.max(1, Number(resource?.duration_minutes || 5));
      const satisfaction = Number((rating * Math.log(1 + minutes)).toFixed(2));
  // Record into analytics table as first-class log
  await analyticsService.recordSatisfaction({ userId: user.id, resourceId: resource.id, rating, minutes, satisfaction });
      setRated(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title={resource?.title || 'Resource'} />
      <div className="p-4 pb-24 max-w-3xl mx-auto">
        {loading ? (
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Loader2" size={24} color="var(--color-muted-foreground)" />
            </div>
            <p className="text-sm font-body text-muted-foreground">Loading…</p>
          </div>
        ) : !resource ? (
          <div className="text-center text-muted-foreground">Not found</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Sparkles" size={18} color="var(--color-primary)" />
                </div>
                <div>
                  <h1 className="text-lg font-heading font-semibold text-foreground">{resource.title}</h1>
                  <p className="text-xs font-caption text-muted-foreground">{resource.category} • {resource.duration_minutes ? `${resource.duration_minutes} min` : '—'}</p>
                </div>
              </div>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">{desc()}</p>
            </div>

            {guidedActive ? (
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-body text-foreground">{lang === 'ar' ? 'وضع موجه' : lang === 'fr' ? 'Mode guidé' : 'Guided mode'}</div>
                  <Button variant="ghost" size="sm" iconName="Square" iconPosition="left" iconSize={14} onClick={() => setGuidedActive(false)}>
                    {lang === 'ar' ? 'إيقاف' : lang === 'fr' ? 'Stop' : 'Stop'}
                  </Button>
                </div>
                {/* Stepper */}
                <div className="flex items-center gap-2">
                  {guidedSteps().map((st, i) => (
                    <div key={st.key} className={`h-2 flex-1 rounded-full ${i <= stepIndex ? 'bg-primary' : 'bg-muted'}`} />
                  ))}
                </div>
                {/* Current step */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-body text-foreground">{guidedSteps()[stepIndex]?.label}</div>
                  <div className="text-sm font-mono text-foreground">{fmtTime(secondsLeft)}</div>
                </div>
                <p className="text-sm font-body text-muted-foreground">{guidedSteps()[stepIndex]?.text}</p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => { if (stepIndex > 0) { setStepIndex(stepIndex - 1); } }} disabled={stepIndex === 0}>
                    {lang === 'ar' ? 'السابق' : lang === 'fr' ? 'Précédent' : 'Previous'}
                  </Button>
                  <Button variant="default" size="sm" onClick={() => {
                    const steps = guidedSteps();
                    if (stepIndex < steps.length - 1) { setStepIndex(stepIndex + 1); setSecondsLeft(Math.ceil(steps[stepIndex + 1]?.seconds || 0)); }
                  }} disabled={stepIndex >= guidedSteps().length - 1}>
                    {lang === 'ar' ? 'التالي' : lang === 'fr' ? 'Suivant' : 'Next'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/20">
                {completed ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Icon name="CheckCircle2" size={18} color="var(--color-success)" />
                      <span className="text-sm font-body text-foreground">
                        {lang === 'ar' ? 'تم إكمال الجلسة وتسجيلها' : lang === 'fr' ? 'Session terminée et enregistrée' : 'Session completed and recorded'}
                      </span>
                    </div>
                    <p className="text-xs font-caption text-muted-foreground">
                      {saving ? (lang === 'ar' ? 'جار الحفظ...' : lang === 'fr' ? 'Enregistrement...' : 'Saving...') : (lang === 'ar' ? 'تم تحديث تقدم الهدف إذا وُجد هدف مطابق.' : lang === 'fr' ? 'Progression de l\'objectif mise à jour si un objectif correspondant existe.' : 'Goal progress updated if a matching goal exists.')}
                    </p>
                    {/* Rating prompt */}
                    <div className="pt-2">
                      <div className="text-sm font-body text-foreground mb-2">
                        {lang === 'ar' ? 'قيّم جلستك' : lang === 'fr' ? 'Évaluez votre séance' : 'Rate your session'}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => { setRating(n); setRated(false); }}
                            className="p-1"
                            aria-label={`rate-${n}`}
                          >
                            <Icon name="Star" size={18} color={n <= rating ? 'var(--color-accent)' : 'var(--color-muted-foreground)'} />
                          </button>
                        ))}
                      </div>
                      <Button variant="default" size="sm" onClick={submitRating} disabled={!rating || saving || rated} iconName="Check" iconPosition="left" iconSize={14}>
                        {rated ? (lang === 'ar' ? 'شكرًا لك' : lang === 'fr' ? 'Merci' : 'Thanks') : (lang === 'ar' ? 'إرسال التقييم' : lang === 'fr' ? 'Envoyer l\'évaluation' : 'Submit rating')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-body text-foreground">{lang === 'ar' ? 'وضع موجه' : lang === 'fr' ? 'Mode guidé' : 'Guided mode'}</div>
                    <Button variant="default" size="sm" iconName="Play" iconPosition="left" iconSize={14} onClick={() => { setCompleted(false); setStepIndex(0); setGuidedActive(true); }}>
                      {lang === 'ar' ? 'ابدأ' : lang === 'fr' ? 'Démarrer' : 'Start'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default ResourceDetails;
