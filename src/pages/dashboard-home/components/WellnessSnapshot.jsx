import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { moodService } from '../../../services/moodService';
import { journalService } from '../../../services/journalService';
import { wellnessService } from '../../../services/wellnessService';

const WellnessSnapshot = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [moodData, setMoodData] = useState([]);
  const [journalStreak, setJournalStreak] = useState(0);
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  const [activeGoals, setActiveGoals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Always compute a local streak from localStorage first (works offline/anon)
    const computeLocalStreak = () => {
          try {
      const storageKey = `journal_entries:${user?.id || 'anon'}`;
            let raw = localStorage.getItem(storageKey);
            let list = raw ? JSON.parse(raw) : [];
            if ((!list || list.length === 0) && user?.id) {
              const legacyRaw = localStorage.getItem('journal_entries');
              const legacyList = legacyRaw ? JSON.parse(legacyRaw) : [];
              list = (legacyList || []).filter(e => e?.userId === user?.id);
              try { localStorage.setItem(storageKey, JSON.stringify(list)); } catch {}
            }
            const normalized = (list || []).map(e => ({
              created_at: e.createdAt || e.created_at || e.date || new Date().toISOString()
            }));
            return computeDailyStreak(normalized);
          } catch {
            return 0;
          }
        };

        if (mounted) setJournalStreak(computeLocalStreak());

        if (!user?.id) {
          return;
        }
        // Last 7 days mood trend
        const start = new Date();
        start.setDate(start.getDate() - 6);
        const startISO = start.toISOString().split('T')[0];
        const { data: moods } = await moodService.getMoodEntries(user.id, { startDate: startISO });

        const moodScale = { very_low: 2, low: 4, neutral: 6, good: 8, excellent: 9 };
        // Build a day-by-day series for the last 7 days
        const series = Array.from({ length: 7 }).map((_, idx) => {
          const d = new Date(start);
          d.setDate(start.getDate() + idx);
          const key = d.toISOString().split('T')[0];
          const entry = (moods || []).find(m => m.entry_date === key);
          const moodVal = entry ? (moodScale[entry.mood_level] || 5) : 0;
          const dayLabel = d.toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', { weekday: 'short' });
          const dateLabel = d.toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: '2-digit' });
          return { day: dayLabel, mood: moodVal, date: dateLabel };
        });
        if (!mounted) return;
        setMoodData(series);

        // Journal streak from recent entries
        const { data: journalEntries } = await journalService.getJournalEntries(user.id, { limit: 90 });
        const streak = computeDailyStreak(journalEntries || []);
        if (!mounted) return;
        // Prefer remote streak when available, otherwise keep/local fallback
        if (streak > 0) {
          setJournalStreak(streak);
        }

        // Active goals count
        const goalsRes = await wellnessService.getWellnessGoals(user.id, { activeOnly: true });
        if (!mounted) return;
        setActiveGoals((goalsRes?.data || []).length);

        // Daily affirmation based on recent mood
        const avgMood = series.filter(s => s.mood > 0).reduce((sum, s) => sum + s.mood, 0) / Math.max(1, series.filter(s => s.mood > 0).length);
        setDailyAffirmation(pickAffirmation(language, avgMood));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();

    // Live-update streak when a new journal entry is saved from the editor
  const handleSaved = (evt) => {
      try {
    if (evt?.detail?.userId && user?.id && evt.detail.userId !== user.id) return;
    const storageKey = `journal_entries:${user?.id || 'anon'}`;
    const raw = localStorage.getItem(storageKey);
    const list = raw ? JSON.parse(raw) : [];
        const normalized = (list || []).map(e => ({
          created_at: e.createdAt || e.created_at || e.date || new Date().toISOString()
        }));
        if (mounted) setJournalStreak(computeDailyStreak(normalized));
      } catch {}
    };
    window.addEventListener('journal:entry:saved', handleSaved);
    return () => {
      mounted = false;
      window.removeEventListener('journal:entry:saved', handleSaved);
    };
  }, [user?.id, i18n.language]);

  const computeDailyStreak = (entries) => {
    if (!entries || entries.length === 0) return 0;
    const days = new Set(entries.map(e => new Date(e.created_at).toISOString().split('T')[0]));
    let streak = 0;
    let d = new Date();
    for (;;) {
      const key = d.toISOString().split('T')[0];
      if (days.has(key)) { streak += 1; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const pickAffirmation = (lang, avgMood) => {
    const pool = {
      fr: avgMood && avgMood < 6 ? [
        "Vous traversez cela avec courage. Un pas à la fois suffit.",
        "Respirez profondément—chaque souffle vous recentre.",
        "Vos émotions sont valides. Vous méritez douceur et repos."
      ] : [
        "Chaque petit progrès compte, continuez.",
        "Votre paix intérieure est votre force.",
        "Vous pouvez cultiver la joie aujourd'hui, même en simplicité."
      ],
      ar: avgMood && avgMood < 6 ? [
        "أنت تتجاوز هذا بشجاعة. خطوة واحدة تكفي.",
        "تنفّس عميقًا—كل نفس يعيدك إلى التوازن.",
        "مشاعرك مُقدّرة. أنت تستحق اللطف والراحة."
      ] : [
        "كل تقدم بسيط يُحدث فرقًا—استمر.",
        "سلامك الداخلي هو قوتك.",
        "يمكنك زراعة الفرح اليوم حتى في البساطة."
      ]
    };
    const arr = pool[lang] || pool.fr;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const translations = {
    en: {
      wellnessSnapshot: 'Wellness Snapshot',
      moodTrend: 'Mood Trend (7d)',
      journalStreak: 'Journal Streak',
      days: 'days',
      dailyAffirmation: 'Daily Affirmation',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      low: 'Low',
      activeGoals: 'active goals',
      loading: 'Loading...'
    },
    fr: {
      wellnessSnapshot: 'Aperçu du Bien-être',
      moodTrend: 'Tendance Humeur (7j)',
      journalStreak: 'Série Journal',
      days: 'jours',
      dailyAffirmation: 'Affirmation du Jour',
      excellent: 'Excellent',
      good: 'Bien',
      average: 'Moyen',
      low: 'Faible',
      activeGoals: 'objectifs actifs',
      loading: 'Chargement...'
    },
    ar: {
      wellnessSnapshot: 'لمحة عن الصحة النفسية',
      moodTrend: 'اتجاه المزاج (7 أيام)',
      journalStreak: 'سلسلة المذكرات',
      days: 'أيام',
      dailyAffirmation: 'تأكيد اليوم',
      excellent: 'ممتاز',
      good: 'جيد',
      average: 'متوسط',
      low: 'منخفض',
      activeGoals: 'أهداف نشطة',
      loading: 'جار التحميل...'
    }
  };

  const t = translations?.[language];

  const getMoodColor = (mood) => {
    if (mood >= 8) return 'var(--color-success)';
    if (mood >= 6) return 'var(--color-secondary)';
    if (mood >= 4) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getCurrentMoodLevel = () => {
    const currentMood = moodData?.[moodData?.length - 1]?.mood || 0;
    if (currentMood >= 8) return t?.excellent;
    if (currentMood >= 6) return t?.good;
    if (currentMood >= 4) return t?.average;
    return t?.low;
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-foreground">
          {t?.wellnessSnapshot}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-caption text-muted-foreground">{activeGoals} {t?.activeGoals}</span>
          <div className="w-2 h-2 rounded-full bg-success" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mood Trend Chart */}
        <div className="md:col-span-2 bg-card rounded-xl p-4 border border-border gentle-hover">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-body font-medium text-foreground">
              {t?.moodTrend}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-xs font-caption text-muted-foreground">
                {getCurrentMoodLevel()}
              </span>
            </div>
          </div>
          
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                />
                <YAxis hide domain={[0, 10]} />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 4, fill: 'var(--color-primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Journal Streak */}
        <div className="bg-card rounded-xl p-4 border border-border gentle-hover">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Icon name="BookOpen" size={16} color="var(--color-secondary)" />
            </div>
            <div>
              <h3 className="text-sm font-body font-medium text-foreground">
                {t?.journalStreak}
              </h3>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-heading font-bold text-secondary mb-1">
              {journalStreak}
            </div>
            <div className="text-xs font-caption text-muted-foreground">
              {t?.days}
            </div>
          </div>
        </div>
      </div>
  {/* Daily Affirmation */}
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4 border border-border/50">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mt-1">
            <Icon name="Sparkles" size={16} color="var(--color-accent)" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-body font-medium text-foreground mb-2">
              {t?.dailyAffirmation}
            </h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              {loading ? t?.loading : dailyAffirmation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessSnapshot;