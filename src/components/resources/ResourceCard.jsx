import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import AppImage from '../AppImage';

// Lightweight, reusable card for wellness resources (exercise/meditation)
// Props: { title, category, duration, description, icon, color, culturalNote, onClick, ctaLabel, imageUrl }
const ResourceCard = ({
  title,
  category,
  duration,
  description,
  icon = 'Sparkles',
  color = 'primary',
  culturalNote,
  onClick,
  ctaLabel = 'Try now',
  imageUrl,
}) => {
  return (
    <div className="bg-card rounded-xl p-4 border border-border hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {imageUrl ? (
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border">
            <AppImage src={imageUrl} alt="resource" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`w-12 h-12 bg-${color}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon name={icon} size={20} color={`var(--color-${color})`} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-body font-medium text-foreground mb-1 line-clamp-2">{title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-caption text-${color} lowercase`}>{category}</span>
            <span className="text-xs font-caption text-muted-foreground">• {duration}</span>
          </div>

          {description && (
            <p className="text-sm font-body text-muted-foreground mb-3 leading-relaxed line-clamp-3">{description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Star" size={12} color="var(--color-accent)" />
              {culturalNote && (
                <span className="text-xs font-caption text-muted-foreground">{culturalNote}</span>
              )}
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={onClick}
              iconName="Play"
              iconPosition="left"
              iconSize={14}
              className="text-xs"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
