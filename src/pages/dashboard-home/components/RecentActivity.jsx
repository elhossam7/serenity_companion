import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { journalService } from '../../../services/journalService';
import { moodService } from '../../../services/moodService';
import { supabase } from '../../../lib/supabase';

const RecentActivity = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!user?.id) return;
        // Fetch in parallel
        const [journalsRes, moodsRes, chatsRes] = await Promise.all([
          journalService.getJournalEntries(user.id, { limit: 5 }),
          moodService.getMoodEntries(user.id, { limit: 5 }),
          // Chat messages directly via supabase (fallback-safe in mock client)
          supabase
            ?.from('chat_messages')
            ?.select('id, role, content, created_at')
            ?.eq('user_id', user.id)
            ?.order('created_at', { ascending: false })
            ?.limit(10)
        ]);

        const journalActs = (journalsRes?.data || []).map(j => ({
          id: `journal-${j.id}`,
          type: 'journal',
          title: language === 'ar' ? 'مذكرة' : 'Journal',
          preview: (j.content || '').slice(0, 140),
          timestamp: new Date(j.created_at),
          mood: moodToScore(j.mood_after || j.mood_before),
          icon: 'BookOpen',
          color: 'primary'
        }));

        const moodActs = (moodsRes?.data || []).map(m => ({
          id: `mood-${m.id}`,
          type: 'mood',
          title: language === 'ar' ? 'تسجيل المزاج' : 'Enregistrement humeur',
          preview: formatMoodPreview(m, language),
          timestamp: new Date(m.entry_date),
          mood: moodLevelToScore(m.mood_level),
          icon: 'Smile',
          color: 'secondary'
        }));

        const { data: chatRows } = chatsRes || {};
        // Collapse chat messages into a single recent session item (latest message)
        const chatActs = (chatRows || []).slice(0, 1).map(c => ({
          id: `chat-${c.id}`,
          type: 'chat',
          title: language === 'ar' ? 'جلسة دعم' : 'Session de support',
          preview: (c.content || '').slice(0, 140),
          timestamp: new Date(c.created_at),
          mood: undefined,
          icon: 'MessageCircle',
          color: 'accent'
        }));

        const merged = [...journalActs, ...moodActs, ...chatActs]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);
        if (!mounted) return;
        setActivities(merged);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.id, i18n.language]);

  const translations = {
    en: {
      recentActivity: 'Recent Activity',
      viewAll: 'View all',
      hoursAgo: '{hours}h ago',
      dayAgo: '1 day ago',
      daysAgo: '{days} days ago',
      justNow: 'Just now',
      noActivity: 'No recent activity',
      startJourney: 'Start your wellness journey'
    },
    fr: {
      recentActivity: 'Activité Récente',
      viewAll: 'Voir tout',
      hoursAgo: 'il y a {hours}h',
      dayAgo: 'il y a 1 jour',
      daysAgo: 'il y a {days} jours',
      justNow: 'À l\'instant',
      noActivity: 'Aucune activité récente',
      startJourney: 'Commencez votre parcours de bien-être'
    },
    ar: {
      recentActivity: 'النشاط الأخير',
      viewAll: 'عرض الكل',
      hoursAgo: 'منذ {hours} ساعات',
      dayAgo: 'منذ يوم واحد',
      daysAgo: 'منذ {days} أيام',
      justNow: 'الآن',
      noActivity: 'لا يوجد نشاط حديث',
      startJourney: 'ابدأ رحلة الصحة النفسية'
    }
  };

  const t = translations?.[language];

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return t?.justNow;
    if (hours < 24) return t?.hoursAgo?.replace('{hours}', hours);
    if (days === 1) return t?.dayAgo;
    return t?.daysAgo?.replace('{days}', days);
  };

  const moodToScore = (mood) => {
    if (!mood) return undefined;
    return moodLevelToScore(mood);
  };

  const moodLevelToScore = (level) => {
    switch ((level || '').toString().toLowerCase()) {
      case 'very_low':
      case '1': return 2;
      case 'low':
      case '2': return 4;
      case 'neutral':
      case '3': return 6;
      case 'good':
      case '4': return 8;
      case 'excellent':
      case '5': return 9;
      default: return 6;
    }
  };

  const formatMoodPreview = (m, lang) => {
    const moodWord = (lvl) => {
      const map = {
        fr: { very_low: 'très bas', low: 'bas', neutral: 'neutre', good: 'bon', excellent: 'excellent' },
        ar: { very_low: 'منخفض جداً', low: 'منخفض', neutral: 'محايد', good: 'جيد', excellent: 'ممتاز' }
      };
      const tmap = map[lang] || map.fr;
      return tmap[lvl] || '—';
    };
    const stress = m?.stress_level != null ? ` | ${lang === 'ar' ? 'الضغط' : 'stress'}: ${m.stress_level}` : '';
    return `${lang === 'ar' ? 'المزاج' : 'humeur'}: ${moodWord(m?.mood_level)}${stress}`;
  };

  const getMoodColor = (mood) => {
    if (mood >= 8) return 'text-success';
    if (mood >= 6) return 'text-secondary';
    if (mood >= 4) return 'text-warning';
    return 'text-error';
  };

  const getMoodEmoji = (mood) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😔';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-foreground">
          {t?.recentActivity}
        </h2>
        <button className="text-sm font-body text-primary hover:text-primary/80 transition-colors">
          {t?.viewAll}
        </button>
      </div>
      {loading ? (
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Loader2" size={24} color="var(--color-muted-foreground)" />
          </div>
          <p className="text-sm font-body text-muted-foreground">{language === 'ar' ? 'جار التحميل...' : 'Chargement...'}</p>
        </div>
      ) : activities?.length === 0 ? (
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Activity" size={24} color="var(--color-muted-foreground)" />
          </div>
          <p className="text-sm font-body text-muted-foreground mb-2">
            {t?.noActivity}
          </p>
          <p className="text-xs font-caption text-muted-foreground">
            {t?.startJourney}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities?.map((activity) => (
            <div
              key={activity?.id}
              className="bg-card rounded-xl p-4 border border-border gentle-hover cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 bg-${activity?.color}/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon 
                    name={activity?.icon} 
                    size={16} 
                    color={`var(--color-${activity?.color})`} 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-body font-medium text-foreground truncate">
                      {activity?.title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {activity?.mood && (
                        <span className="text-sm">
                          {getMoodEmoji(activity?.mood)}
                        </span>
                      )}
                      <span className="text-xs font-caption text-muted-foreground">
                        {formatTimestamp(activity?.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm font-body text-muted-foreground line-clamp-2 leading-relaxed">
                    {activity?.preview}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;