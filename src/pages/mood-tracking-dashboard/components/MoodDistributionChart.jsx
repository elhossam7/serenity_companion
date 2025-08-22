import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const MoodDistributionChart = ({ moodStats = {} }) => {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      title: 'Répartition des Humeurs',
      subtitle: 'Derniers 30 jours',
      excellent: 'Excellent',
      good: 'Bien',
      neutral: 'Neutre',
      low: 'Bas',
      poor: 'Mauvais',
      days: 'jours'
    },
    ar: {
      title: 'توزيع المزاج',
      subtitle: 'آخر 30 يوماً',
      excellent: 'ممتاز',
      good: 'جيد',
      neutral: 'محايد',
      low: 'منخفض',
      poor: 'سيء',
      days: 'أيام'
    }
  };

  const t = translations?.[language];

  const moodData = [
    { name: t?.excellent, value: 8, color: 'var(--color-success)', emoji: '😊' },
    { name: t?.good, value: 12, color: 'var(--color-primary)', emoji: '🙂' },
    { name: t?.neutral, value: 6, color: 'var(--color-accent)', emoji: '😐' },
    { name: t?.low, value: 3, color: 'var(--color-warning)', emoji: '😔' },
    { name: t?.poor, value: 1, color: 'var(--color-error)', emoji: '😢' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-soft-lg">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{data?.payload?.emoji}</span>
            <span className="font-body font-medium text-foreground">
              {data?.payload?.name}
            </span>
          </div>
          <p className="font-caption text-sm text-muted-foreground">
            {data?.value} {t?.days} ({((data?.value / 30) * 100)?.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry?.color }}
            />
            <span className="text-xs font-caption text-muted-foreground">
              {entry?.payload?.emoji} {entry?.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border cultural-pattern">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            {t?.title}
          </h3>
          <p className="text-sm font-caption text-muted-foreground">
            {t?.subtitle}
          </p>
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="PieChart" size={20} color="var(--color-primary)" />
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={moodData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {moodData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry?.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-heading font-bold text-success mb-1">
            {((moodData?.slice(0, 2)?.reduce((sum, item) => sum + item?.value, 0) / 30) * 100)?.toFixed(0)}%
          </div>
          <div className="text-xs font-caption text-muted-foreground">
            Humeurs positives
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-heading font-bold text-primary mb-1">
            {moodData?.reduce((sum, item) => sum + item?.value, 0)}
          </div>
          <div className="text-xs font-caption text-muted-foreground">
            Total des entrées
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDistributionChart;