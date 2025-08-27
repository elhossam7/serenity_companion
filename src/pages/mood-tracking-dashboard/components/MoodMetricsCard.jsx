import React, { useState, useEffect, memo } from 'react';
import Icon from '../../../components/AppIcon';

const MoodMetricsCard = ({ title, value, subtitle, icon, color, trend }) => {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      improvement: 'amélioration',
      decline: 'baisse',
      stable: 'stable'
    },
    ar: {
      improvement: 'تحسن',
      decline: 'انخفاض',
      stable: 'مستقر'
    }
  };

  const t = translations?.[language];

  const getTrendText = () => {
    if (trend > 0) return t?.improvement;
    if (trend < 0) return t?.decline;
    return t?.stable;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-success';
    if (trend < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border gentle-hover cultural-pattern">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon name={icon} size={20} color="white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            <Icon 
              name={trend > 0 ? 'TrendingUp' : trend < 0 ? 'TrendingDown' : 'Minus'} 
              size={16} 
            />
            <span className="text-xs font-caption">
              {Math.abs(trend)}% {getTrendText()}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-heading font-bold text-foreground">
          {value}
        </h3>
        <p className="text-sm font-body text-muted-foreground">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs font-caption text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default memo(MoodMetricsCard);