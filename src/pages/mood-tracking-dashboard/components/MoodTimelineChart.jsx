import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Button from '../../../components/ui/Button';

const MoodTimelineChart = ({ moodData = [] }) => {
  const [language, setLanguage] = useState('fr');
  const [timeRange, setTimeRange] = useState('week');

  const transformData = () => {
    // Map entries to recharts format
    return (moodData || []).slice().reverse().map(e => ({
      date: e.entry_date,
      mood:
        e.mood_level === 'very_low' ? 1 :
        e.mood_level === 'low' ? 2 :
        e.mood_level === 'neutral' ? 3 :
        e.mood_level === 'good' ? 4 : 5
    }));
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      title: 'Évolution de l\'Humeur',
      week: 'Semaine',
      month: 'Mois',
      year: 'Année',
      mood: 'Humeur',
      date: 'Date',
      excellent: 'Excellent',
      good: 'Bien',
      neutral: 'Neutre',
      low: 'Bas',
      poor: 'Mauvais'
    },
    ar: {
      title: 'تطور المزاج',
      week: 'أسبوع',
      month: 'شهر',
      year: 'سنة',
      mood: 'المزاج',
      date: 'التاريخ',
      excellent: 'ممتاز',
      good: 'جيد',
      neutral: 'محايد',
      low: 'منخفض',
      poor: 'سيء'
    }
  };

  const t = translations?.[language];

  // Mock mood data for different time ranges
  const moodData = {
    week: [
      { date: '15/08', mood: 4, label: 'Lun' },
      { date: '16/08', mood: 3, label: 'Mar' },
      { date: '17/08', mood: 5, label: 'Mer' },
      { date: '18/08', mood: 4, label: 'Jeu' },
      { date: '19/08', mood: 3, label: 'Ven' },
      { date: '20/08', mood: 4, label: 'Sam' },
      { date: '21/08', mood: 5, label: 'Dim' }
    ],
    month: [
      { date: 'S1', mood: 3.5, label: 'Semaine 1' },
      { date: 'S2', mood: 4.2, label: 'Semaine 2' },
      { date: 'S3', mood: 3.8, label: 'Semaine 3' },
      { date: 'S4', mood: 4.5, label: 'Semaine 4' }
    ],
    year: [
      { date: 'Jan', mood: 3.2, label: 'Janvier' },
      { date: 'Fév', mood: 3.8, label: 'Février' },
      { date: 'Mar', mood: 4.1, label: 'Mars' },
      { date: 'Avr', mood: 3.9, label: 'Avril' },
      { date: 'Mai', mood: 4.3, label: 'Mai' },
      { date: 'Jun', mood: 4.0, label: 'Juin' },
      { date: 'Jul', mood: 4.2, label: 'Juillet' },
      { date: 'Aoû', mood: 4.1, label: 'Août' }
    ]
  };

  const getMoodLabel = (value) => {
    if (value >= 4.5) return t?.excellent;
    if (value >= 3.5) return t?.good;
    if (value >= 2.5) return t?.neutral;
    if (value >= 1.5) return t?.low;
    return t?.poor;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-soft-lg">
          <p className="font-body font-medium text-foreground mb-1">
            {label}
          </p>
          <p className="font-caption text-sm text-primary">
            {t?.mood}: {getMoodLabel(data?.value)} ({data?.value}/5)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border cultural-pattern">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          {t?.title}
        </h3>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('week')}
            className="text-xs"
          >
            {t?.week}
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('month')}
            className="text-xs"
          >
            {t?.month}
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('year')}
            className="text-xs"
          >
            {t?.year}
          </Button>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={moodData?.[timeRange]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              domain={[1, 5]}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: 'var(--color-primary)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MoodTimelineChart;