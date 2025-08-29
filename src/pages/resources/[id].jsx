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
  const [paused, setPaused] = useState(false);
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

  // Enhanced guided steps generator with category-specific exercises
  const guidedSteps = () => {
    const total = resource?.duration_minutes || 5;
    const cat = (resource?.category || '').toLowerCase();
    
    if (cat === 'breathing' || cat === 'mindfulness') {
      return [
        { 
          key: 'prep', 
          label: lang === 'ar' ? 'التحضير' : lang === 'fr' ? 'Préparation' : 'Preparation', 
          seconds: 30, 
          icon: 'User',
          color: 'blue',
          text: lang === 'ar' ? 'اجلس في مكان مريح، أغلق عينيك، واستقر في وضعية مريحة.' : lang === 'fr' ? 'Asseyez-vous confortablement, fermez les yeux et trouvez une position stable.' : 'Sit comfortably, close your eyes, and settle into a stable position.',
          instruction: lang === 'ar' ? 'تنفس بشكل طبيعي' : lang === 'fr' ? 'Respirez naturellement' : 'Breathe naturally'
        },
        { 
          key: 'cycle1', 
          label: lang === 'ar' ? 'المرحلة ١' : lang === 'fr' ? 'Phase 1' : 'Phase 1', 
          seconds: Math.max(90, total * 60 * 0.4), 
          icon: 'Wind',
          color: 'green',
          text: lang === 'ar' ? 'تنفّس بنمط 4-7-8: شهيق لمدة 4، احبس النفس لمدة 7، زفير لمدة 8.' : lang === 'fr' ? 'Respiration 4-7-8: Inspirez sur 4, retenez sur 7, expirez sur 8.' : 'Breathing 4-7-8: Inhale for 4, hold for 7, exhale for 8.',
          instruction: lang === 'ar' ? 'اتبع الإيقاع المرئي' : lang === 'fr' ? 'Suivez le rythme visuel' : 'Follow the visual rhythm'
        },
        { 
          key: 'cycle2', 
          label: lang === 'ar' ? 'المرحلة ٢' : lang === 'fr' ? 'Phase 2' : 'Phase 2', 
          seconds: Math.max(60, total * 60 * 0.3), 
          icon: 'Heart',
          color: 'purple',
          text: lang === 'ar' ? 'ركز على نبضات قلبك والأحاسيس في جسمك.' : lang === 'fr' ? 'Concentrez-vous sur votre rythme cardiaque et les sensations corporelles.' : 'Focus on your heartbeat and body sensations.',
          instruction: lang === 'ar' ? 'راقب الأحاسيس' : lang === 'fr' ? 'Observez les sensations' : 'Observe sensations'
        },
        { 
          key: 'reflect', 
          label: lang === 'ar' ? 'التأمل النهائي' : lang === 'fr' ? 'Réflexion finale' : 'Final reflection', 
          seconds: 40, 
          icon: 'Eye',
          color: 'amber',
          text: lang === 'ar' ? 'اشعر بالهدوء في جسمك وعقلك. لاحظ أي تغيّر في مستوى التوتر.' : lang === 'fr' ? 'Ressentez le calme dans votre corps et votre esprit. Notez tout changement dans votre niveau de stress.' : 'Feel the calm in your body and mind. Notice any change in your stress level.',
          instruction: lang === 'ar' ? 'استمتع بلحظة السلام' : lang === 'fr' ? 'Savourez ce moment de paix' : 'Enjoy this moment of peace'
        },
      ];
    }
    
    if (cat === 'movement' || cat === 'exercise') {
      return [
        { 
          key: 'warmup', 
          label: lang === 'ar' ? 'الإحماء' : lang === 'fr' ? 'Échauffement' : 'Warm-up', 
          seconds: 60, 
          icon: 'Zap',
          color: 'orange',
          text: lang === 'ar' ? 'ابدأ بحركات لطيفة للرقبة والكتفين والمعصمين.' : lang === 'fr' ? 'Commencez par des mouvements doux du cou, des épaules et des poignets.' : 'Start with gentle neck, shoulder and wrist movements.',
          instruction: lang === 'ar' ? 'حركات دائرية لطيفة' : lang === 'fr' ? 'Mouvements circulaires doux' : 'Gentle circular movements'
        },
        { 
          key: 'main', 
          label: lang === 'ar' ? 'التمرين الأساسي' : lang === 'fr' ? 'Exercice principal' : 'Main exercise', 
          seconds: Math.max(120, total * 60 * 0.6), 
          icon: 'Activity',
          color: 'red',
          text: lang === 'ar' ? 'تمارين تمدد وحركات بطيئة للجسم كله. استمع لجسمك.' : lang === 'fr' ? 'Étirements et mouvements lents pour tout le corps. Écoutez votre corps.' : 'Full-body stretches and slow movements. Listen to your body.',
          instruction: lang === 'ar' ? 'تحرك بوعي وانتباه' : lang === 'fr' ? 'Bougez avec conscience' : 'Move mindfully'
        },
        { 
          key: 'cool', 
          label: lang === 'ar' ? 'التهدئة' : lang === 'fr' ? 'Récupération' : 'Cool-down', 
          seconds: 45, 
          icon: 'Leaf',
          color: 'green',
          text: lang === 'ar' ? 'تنفّس بعمق واسترخِ. اشرب الماء واشعر بالإنجاز.' : lang === 'fr' ? 'Respirez profondément et détendez-vous. Hydratez-vous et ressentez l\'accomplissement.' : 'Breathe deeply and relax. Hydrate and feel the accomplishment.',
          instruction: lang === 'ar' ? 'استرخِ واسترجع قوتك' : lang === 'fr' ? 'Détendez-vous et récupérez' : 'Relax and recover'
        },
      ];
    }
    
    // generic wellness, gratitude or meditation
    return [
      { 
        key: 'center', 
        label: lang === 'ar' ? 'التركيز' : lang === 'fr' ? 'Centrage' : 'Centering', 
        seconds: 45, 
        icon: 'Target',
        color: 'blue',
        text: lang === 'ar' ? 'ابدأ بإيجاد وضعية مريحة وركز على اللحظة الحالية.' : lang === 'fr' ? 'Commencez par trouver une position confortable et concentrez-vous sur le moment présent.' : 'Begin by finding a comfortable position and focus on the present moment.',
        instruction: lang === 'ar' ? 'كن حاضراً في اللحظة' : lang === 'fr' ? 'Soyez présent' : 'Be present'
      },
      { 
        key: 'practice', 
        label: lang === 'ar' ? 'الممارسة' : lang === 'fr' ? 'Pratique' : 'Practice', 
        seconds: Math.max(90, total * 60 * 0.6), 
        icon: 'Heart',
        color: 'pink',
        text: lang === 'ar' ? 'ركز على النشاط المختار واستمتع بالتجربة الكاملة.' : lang === 'fr' ? 'Concentrez-vous sur l\'activité choisie et profitez pleinement de l\'expérience.' : 'Focus on the chosen activity and fully enjoy the experience.',
        instruction: lang === 'ar' ? 'استمتع بالرحلة' : lang === 'fr' ? 'Profitez du voyage' : 'Enjoy the journey'
      },
      { 
        key: 'integration', 
        label: lang === 'ar' ? 'الدمج' : lang === 'fr' ? 'Intégration' : 'Integration', 
        seconds: 30, 
        icon: 'Sparkles',
        color: 'violet',
        text: lang === 'ar' ? 'خذ لحظة للتفكير في التجربة وكيف تشعر الآن.' : lang === 'fr' ? 'Prenez un moment pour réfléchir à l\'expérience et comment vous vous sentez maintenant.' : 'Take a moment to reflect on the experience and how you feel now.',
        instruction: lang === 'ar' ? 'اشعر بالامتنان' : lang === 'fr' ? 'Ressentez la gratitude' : 'Feel gratitude'
      },
    ];
  };

  useEffect(() => {
    if (!guidedActive) return;
    const steps = guidedSteps();
    setSecondsLeft(Math.ceil(steps[stepIndex]?.seconds || 0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guidedActive, stepIndex, resource]);

  useEffect(() => {
    if (!guidedActive || secondsLeft <= 0 || paused) return;
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [guidedActive, secondsLeft, paused]);

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

  const totalSecondsAll = () => guidedSteps().reduce((sum, st) => sum + Math.ceil(st.seconds || 0), 0);
  const elapsedSeconds = () => {
    const steps = guidedSteps();
    const prior = steps.slice(0, stepIndex).reduce((sum, st) => sum + Math.ceil(st.seconds || 0), 0);
    const current = Math.max(0, Math.ceil(steps[stepIndex]?.seconds || 0) - secondsLeft);
    return prior + current;
  };
  const progressPct = () => {
    const total = Math.max(1, totalSecondsAll());
    return Math.min(100, Math.round((elapsedSeconds() / total) * 100));
  };

  // Keyboard shortcuts for guided mode: Space (pause/resume), Left/Right (prev/next)
  useEffect(() => {
    if (!guidedActive) return;
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setPaused(p => !p); }
      if (e.code === 'ArrowRight') {
        const steps = guidedSteps();
        if (stepIndex < steps.length - 1) {
          setStepIndex(stepIndex + 1);
          setSecondsLeft(Math.ceil(steps[stepIndex + 1]?.seconds || 0));
        }
      }
      if (e.code === 'ArrowLeft') {
        if (stepIndex > 0) {
          setStepIndex(stepIndex - 1);
          const steps = guidedSteps();
          setSecondsLeft(Math.ceil(steps[stepIndex - 1]?.seconds || 0));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guidedActive, stepIndex]);

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
  <div className="p-4 pt-16 page-container max-w-3xl mx-auto min-h-[calc(100vh-4rem)]">
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
            <div className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Icon name="Sparkles" size={24} color="var(--color-primary)" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-heading font-bold text-foreground mb-2">{resource.title}</h1>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-caption px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary lowercase border border-primary/20">
                      {resource.category}
                    </span>
                    <span className="text-xs font-caption text-muted-foreground flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      {resource.duration_minutes ? `${resource.duration_minutes} min` : '—'}
                    </span>
                    {resource.difficulty_level && (
                      <span className="text-xs font-caption text-muted-foreground flex items-center gap-1">
                        <Icon name="BarChart3" size={12} />
                        {resource.difficulty_level}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(i => (
                        <Icon key={i} name="Star" size={12} color={i <= (resource.rating || 4) ? 'var(--color-accent)' : 'var(--color-muted-foreground)'} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {resource.view_count ? `${resource.view_count} ${lang === 'ar' ? 'مشاهدة' : lang === 'fr' ? 'vues' : 'views'}` : ''}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">{desc()}</p>
            </div>

            {guidedActive ? (
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-body text-foreground">{lang === 'ar' ? 'وضع موجه' : lang === 'fr' ? 'Mode guidé' : 'Guided mode'}</span>
                    <span className="text-[10px] font-caption px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide">{lang === 'ar' ? 'تجريبي' : lang === 'fr' ? 'Bêta' : 'Beta'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" iconName={paused ? 'Play' : 'Pause'} iconPosition="left" iconSize={14} onClick={() => setPaused(p => !p)}>
                      {paused ? (lang === 'ar' ? 'استئناف' : lang === 'fr' ? 'Reprendre' : 'Resume') : (lang === 'ar' ? 'إيقاف مؤقت' : lang === 'fr' ? 'Pause' : 'Pause')}
                    </Button>
                    <Button variant="outline" size="sm" iconName="Square" iconPosition="left" iconSize={14} onClick={() => { setGuidedActive(false); setPaused(false); }}>
                      {lang === 'ar' ? 'إيقاف' : lang === 'fr' ? 'Arrêter' : 'Stop'}
                    </Button>
                  </div>
                </div>
                {/* Stepper */}
                <div className="flex items-center gap-2">
                  {guidedSteps().map((st, i) => (
                    <div key={st.key} className={`h-2 flex-1 rounded-full ${i <= stepIndex ? 'bg-primary' : 'bg-muted'}`} />
                  ))}
                </div>
                {/* Overall progress */}
                <div className="space-y-2">
                  <div
                    className="h-2 w-full bg-muted rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progressPct()}
                  >
                    <div className="h-full bg-primary" style={{ width: `${progressPct()}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-caption">
                    <span>{lang === 'ar' ? 'التقدم' : lang === 'fr' ? 'Progression' : 'Progress'}</span>
                    <span>{progressPct()}%</span>
                  </div>
                </div>
                {/* Current step */}
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${guidedSteps()[stepIndex]?.color || 'primary'}/10`}>
                      <Icon name={guidedSteps()[stepIndex]?.icon || 'Circle'} size={20} color={`var(--color-${guidedSteps()[stepIndex]?.color || 'primary'})`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-body font-medium text-foreground">{guidedSteps()[stepIndex]?.label}</h3>
                        <div className="text-lg font-mono text-foreground font-semibold">{fmtTime(secondsLeft)}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{guidedSteps()[stepIndex]?.instruction}</div>
                    </div>
                  </div>
                  
                  {/* Enhanced breathing visual for breathing/mindfulness */}
                  {(['breathing','mindfulness'].includes((resource?.category || '').toLowerCase())) && (
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-ping" />
                        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 animate-pulse" />
                        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-primary/40 to-accent/40" />
                        <div className="absolute inset-6 rounded-full bg-background border border-primary/20 flex items-center justify-center">
                          <Icon name="Wind" size={16} color="var(--color-primary)" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Movement visual for exercises */}
                  {(['movement','exercise'].includes((resource?.category || '').toLowerCase())) && (
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-orange/20 to-red/20 animate-pulse" />
                        <div className="absolute inset-2 rounded-lg bg-gradient-to-br from-orange/30 to-red/30" />
                        <div className="absolute inset-4 rounded-lg bg-background border border-orange/20 flex items-center justify-center">
                          <Icon name="Activity" size={16} color="var(--color-orange)" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm font-body text-muted-foreground text-center leading-relaxed">{guidedSteps()[stepIndex]?.text}</p>
                </div>
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
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border border-border">
                {completed ? (
                  <div className="space-y-4">
                    {/* Completion celebration */}
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="w-16 h-16 bg-gradient-to-r from-success/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                          <Icon name="Trophy" size={32} color="var(--color-success)" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-bounce">
                          <Icon name="Sparkles" size={12} color="var(--color-background)" />
                        </div>
                      </div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                        {lang === 'ar' ? '🎉 أحسنت!' : lang === 'fr' ? '🎉 Félicitations !' : '🎉 Well done!'}
                      </h3>
                      <p className="text-sm font-body text-muted-foreground">
                        {lang === 'ar' ? 'تم إكمال الجلسة وتسجيلها بنجاح' : lang === 'fr' ? 'Session terminée et enregistrée avec succès' : 'Session completed and recorded successfully'}
                      </p>
                    </div>
                    
                    {/* Session stats */}
                    <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-lg font-mono font-semibold text-foreground">{Math.round(totalSecondsAll() / 60)}</div>
                          <div className="text-xs text-muted-foreground">{lang === 'ar' ? 'دقيقة' : lang === 'fr' ? 'min' : 'min'}</div>
                        </div>
                        <div>
                          <div className="text-lg font-mono font-semibold text-foreground">{guidedSteps().length}</div>
                          <div className="text-xs text-muted-foreground">{lang === 'ar' ? 'مراحل' : lang === 'fr' ? 'étapes' : 'steps'}</div>
                        </div>
                        <div>
                          <div className="text-lg font-mono font-semibold text-success">100%</div>
                          <div className="text-xs text-muted-foreground">{lang === 'ar' ? 'مكتمل' : lang === 'fr' ? 'terminé' : 'complete'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs font-caption text-muted-foreground text-center">
                      {saving ? (lang === 'ar' ? 'جار الحفظ...' : lang === 'fr' ? 'Enregistrement...' : 'Saving...') : (lang === 'ar' ? 'تم تحديث تقدم الهدف إذا وُجد هدف مطابق.' : lang === 'fr' ? 'Progression de l\'objectif mise à jour si un objectif correspondant existe.' : 'Goal progress updated if a matching goal exists.')}
                    </p>
                    
                    {/* Enhanced rating prompt */}
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                      <div className="text-center mb-3">
                        <Icon name="Heart" size={20} color="var(--color-accent)" className="mx-auto mb-2" />
                        <div className="text-sm font-body text-foreground">
                          {lang === 'ar' ? 'كيف كانت تجربتك؟' : lang === 'fr' ? 'Comment était votre expérience ?' : 'How was your experience?'}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => { setRating(n); setRated(false); }}
                            className="p-2 hover:scale-110 transition-transform"
                            aria-label={`rate-${n}`}
                          >
                            <Icon name="Star" size={20} color={n <= rating ? 'var(--color-accent)' : 'var(--color-muted-foreground)'} />
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button variant="default" size="sm" onClick={submitRating} disabled={!rating || saving || rated} iconName="Check" iconPosition="left" iconSize={14}>
                          {rated ? (lang === 'ar' ? 'شكرًا لك' : lang === 'fr' ? 'Merci' : 'Thanks') : (lang === 'ar' ? 'إرسال التقييم' : lang === 'fr' ? 'Envoyer' : 'Submit')}
                        </Button>
                        <Button variant="outline" size="sm" iconName="RotateCcw" iconPosition="left" iconSize={14} onClick={() => { setCompleted(false); setStepIndex(0); setSecondsLeft(Math.ceil(guidedSteps()[0]?.seconds || 0)); setGuidedActive(true); setPaused(false); }}>
                          {lang === 'ar' ? 'ابدأ من جديد' : lang === 'fr' ? 'Recommencer' : 'Start again'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-sm font-body text-foreground">{lang === 'ar' ? 'وضع موجه' : lang === 'fr' ? 'Mode guidé' : 'Guided mode'}</div>
                    <Button variant="default" size="sm" iconName="Play" iconPosition="left" iconSize={14} onClick={() => { setCompleted(false); setStepIndex(0); setGuidedActive(true); }}>
                      {lang === 'ar' ? 'جرّب الآن' : lang === 'fr' ? 'Essayer maintenant' : 'Try now'}
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
