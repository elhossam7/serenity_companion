import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JournalToolbar = ({ 
  language, 
  onSave, 
  onExport, 
  onMoodTag, 
  onPrivacyChange,
  currentMood,
  isPrivate,
  isSaving 
}) => {
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const moodOptions = [
    { id: 'very_positive', icon: 'Laugh', color: 'text-green-500', label: { fr: 'Très joyeux', ar: 'سعيد جداً' } },
    { id: 'positive', icon: 'Smile', color: 'text-success', label: { fr: 'Joyeux', ar: 'سعيد' } },
    { id: 'neutral', icon: 'Meh', color: 'text-muted-foreground', label: { fr: 'Neutre', ar: 'محايد' } },
    { id: 'negative', icon: 'Frown', color: 'text-warning', label: { fr: 'Triste', ar: 'حزين' } },
    { id: 'very_negative', icon: 'Angry', color: 'text-red-500', label: { fr: 'Très triste', ar: 'حزين جداً' } }
  ];

  const exportOptions = [
    { id: 'pdf', icon: 'FileText', label: { fr: 'PDF', ar: 'PDF' } },
    { id: 'txt', icon: 'File', label: { fr: 'Texte', ar: 'نص' } },
    { id: 'email', icon: 'Mail', label: { fr: 'Email', ar: 'بريد إلكتروني' } }
  ];

  const handleMoodSelect = (moodId) => {
    onMoodTag(moodId);
    setShowMoodPicker(false);
  };

  const handleExport = (format) => {
    onExport(format);
    setShowExportOptions(false);
  };

  const translations = {
    fr: {
      save: 'Sauvegarder',
      saving: 'Sauvegarde...',
      export: 'Exporter',
      mood: 'Humeur',
      privacy: 'Privé',
      public: 'Public',
      bold: 'Gras',
      italic: 'Italique',
      underline: 'Souligné',
      list: 'Liste',
      quote: 'Citation'
    },
    ar: {
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      export: 'تصدير',
      mood: 'المزاج',
      privacy: 'خاص',
      public: 'عام',
      bold: 'عريض',
      italic: 'مائل',
      underline: 'تحته خط',
      list: 'قائمة',
      quote: 'اقتباس'
    }
  };

  const t = translations?.[language];

  return (
    <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-t border-border">
      {/* Left side - Formatting tools */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          title={t?.bold}
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onMoodTag?.('__format_bold__')}
        >
          <Icon name="Bold" size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          title={t?.italic}
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onMoodTag?.('__format_italic__')}
        >
          <Icon name="Italic" size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          title={t?.underline}
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onMoodTag?.('__format_underline__')}
        >
          <Icon name="Underline" size={16} />
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <Button
          variant="ghost"
          size="icon"
          title={t?.list}
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onMoodTag?.('__format_list__')}
        >
          <Icon name="List" size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          title={t?.quote}
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onMoodTag?.('__format_quote__')}
        >
          <Icon name="Quote" size={16} />
        </Button>
      </div>
      {/* Right side - Actions */}
      <div className="flex items-center space-x-3">
        {/* Mood Picker */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMoodPicker(!showMoodPicker)}
            iconName={moodOptions?.find(m => m?.id === currentMood)?.icon || 'Smile'}
            iconPosition="left"
            iconSize={16}
            className="text-muted-foreground hover:text-foreground"
          >
            {t?.mood}
          </Button>
          
          {showMoodPicker && (
            <div className="absolute bottom-full right-0 mb-2 bg-popover border border-border rounded-lg shadow-soft-lg p-2 z-50">
              <div className="grid grid-cols-5 gap-1">
                {moodOptions?.map((mood) => (
                  <button
                    key={mood?.id}
                    onClick={() => handleMoodSelect(mood?.id)}
                    className={`
                      p-2 rounded-lg hover:bg-muted transition-colors
                      ${currentMood === mood?.id ? 'bg-primary/10 ring-1 ring-primary' : ''}
                    `}
                    title={mood?.label?.[language]}
                  >
                    <Icon name={mood?.icon} size={16} className={mood?.color} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Privacy Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPrivacyChange(!isPrivate)}
          iconName={isPrivate ? 'Lock' : 'Unlock'}
          iconPosition="left"
          iconSize={16}
          className={`
            ${isPrivate 
              ? 'text-primary hover:text-primary/80' :'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {isPrivate ? t?.privacy : t?.public}
        </Button>

        {/* Export */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExportOptions(!showExportOptions)}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
            className="text-muted-foreground hover:text-foreground"
          >
            {t?.export}
          </Button>
          
          {showExportOptions && (
            <div className="absolute bottom-full right-0 mb-2 bg-popover border border-border rounded-lg shadow-soft-lg p-2 z-50 min-w-32">
              {exportOptions?.map((option) => (
                <button
                  key={option?.id}
                  onClick={() => handleExport(option?.id)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-body text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name={option?.icon} size={14} />
                  <span>{option?.label?.[language]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          loading={isSaving}
          iconName="Save"
          iconPosition="left"
          iconSize={16}
          disabled={isSaving}
        >
          {isSaving ? t?.saving : t?.save}
        </Button>
      </div>
    </div>
  );
};

export default JournalToolbar;