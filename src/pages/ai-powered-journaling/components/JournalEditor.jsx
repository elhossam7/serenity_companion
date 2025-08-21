import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JournalEditor = ({ 
  content, 
  onContentChange, 
  language, 
  onMoodDetected, 
  isAiSuggesting,
  aiSuggestion 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral');
  const textareaRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  useEffect(() => {
    const words = content?.trim()?.split(/\s+/)?.filter(word => word?.length > 0);
    setWordCount(words?.length);

    // Auto-save functionality
    if (autoSaveTimeoutRef?.current) {
      clearTimeout(autoSaveTimeoutRef?.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('journal_draft', content);
    }, 1000);

    // Simple sentiment analysis simulation
    const detectMood = () => {
      const positiveWords = ['happy', 'joy', 'good', 'great', 'amazing', 'wonderful', 'heureux', 'joie', 'bien', 'formidable'];
      const negativeWords = ['sad', 'angry', 'bad', 'terrible', 'awful', 'depressed', 'triste', 'colère', 'mauvais', 'terrible'];
      
      const lowerContent = content?.toLowerCase();
      const positiveCount = positiveWords?.filter(word => lowerContent?.includes(word))?.length;
      const negativeCount = negativeWords?.filter(word => lowerContent?.includes(word))?.length;
      
      let detectedMood = 'neutral';
      if (positiveCount > negativeCount) {
        detectedMood = 'positive';
      } else if (negativeCount > positiveCount) {
        detectedMood = 'negative';
      }
      
      setCurrentMood(detectedMood);
      onMoodDetected(detectedMood);
    };

    if (content?.length > 50) {
      detectMood();
    }

    return () => {
      if (autoSaveTimeoutRef?.current) {
        clearTimeout(autoSaveTimeoutRef?.current);
      }
    };
  }, [content, onMoodDetected]);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleVoiceToggle = () => {
    setIsVoiceRecording(!isVoiceRecording);
    // Voice recording simulation
    if (!isVoiceRecording) {
      setTimeout(() => {
        setIsVoiceRecording(false);
      }, 3000);
    }
  };

  const insertAiSuggestion = () => {
    if (aiSuggestion && textareaRef?.current) {
      const cursorPosition = textareaRef?.current?.selectionStart;
      const newContent = content?.slice(0, cursorPosition) + aiSuggestion + content?.slice(cursorPosition);
      onContentChange(newContent);
      
      // Focus and set cursor position after insertion
      setTimeout(() => {
        textareaRef?.current?.focus();
        textareaRef?.current?.setSelectionRange(
          cursorPosition + aiSuggestion?.length,
          cursorPosition + aiSuggestion?.length
        );
      }, 0);
    }
  };

  const translations = {
    fr: {
      placeholder: "Commencez à écrire vos pensées ici...\n\nL'IA vous aidera avec des suggestions culturellement appropriées pendant que vous écrivez.",
      fullscreen: 'Plein écran',
      voice: 'Dictée vocale',
      recording: 'Enregistrement...',
      words: 'mots',
      autoSaved: 'Sauvegarde automatique',
      insertSuggestion: 'Insérer la suggestion'
    },
    ar: {
      placeholder: "ابدأ في كتابة أفكارك هنا...\n\nسيساعدك الذكاء الاصطناعي بالاقتراحات المناسبة ثقافياً أثناء الكتابة.",
      fullscreen: 'ملء الشاشة',
      voice: 'الإملاء الصوتي',
      recording: 'جاري التسجيل...',
      words: 'كلمة',
      autoSaved: 'حفظ تلقائي',
      insertSuggestion: 'إدراج الاقتراح'
    }
  };

  const t = translations?.[language];

  const getMoodBackgroundColor = () => {
    switch (currentMood) {
      case 'positive':
        return 'bg-success/5';
      case 'negative':
        return 'bg-warning/5';
      default:
        return 'bg-background';
    }
  };

  return (
    <div className={`
      relative flex flex-col h-full
      ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}
    `}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {wordCount} {t?.words}
          </div>
          <div className="flex items-center space-x-1 text-xs text-success">
            <Icon name="Check" size={12} />
            <span>{t?.autoSaved}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceToggle}
            iconName={isVoiceRecording ? "MicOff" : "Mic"}
            iconSize={16}
            className={isVoiceRecording ? 'text-error animate-pulse' : ''}
          >
            {isVoiceRecording ? t?.recording : t?.voice}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreenToggle}
            title={t?.fullscreen}
          >
            <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={16} />
          </Button>
        </div>
      </div>
      {/* Editor Content */}
      <div className={`
        flex-1 relative overflow-hidden
        cultural-pattern
        ${getMoodBackgroundColor()}
        transition-colors duration-500
      `}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e?.target?.value)}
          placeholder={t?.placeholder}
          className={`
            w-full h-full p-6 resize-none border-none outline-none bg-transparent
            text-foreground placeholder-muted-foreground
            font-body text-base leading-relaxed
            ${language === 'ar' ? 'text-right' : 'text-left'}
          `}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          style={{
            fontFamily: language === 'ar' ? 'Noto Sans Arabic, sans-serif' : 'Inter, sans-serif'
          }}
        />

        {/* AI Suggestion Overlay */}
        {aiSuggestion && (
          <div className="absolute bottom-4 right-4 max-w-xs">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xs text-primary font-medium mb-2 flex items-center">
                <Icon name="Sparkles" size={12} className="mr-1" />
                AI Suggestion
              </div>
              <p className="text-sm text-foreground mb-3 line-clamp-3">
                {aiSuggestion}
              </p>
              <Button
                variant="outline"
                size="xs"
                onClick={insertAiSuggestion}
                iconName="Plus"
                iconSize={12}
                className="w-full"
              >
                {t?.insertSuggestion}
              </Button>
            </div>
          </div>
        )}

        {/* Mood Indicator */}
        <div className="absolute top-4 right-4">
          <div className={`
            w-3 h-3 rounded-full transition-colors duration-300
            ${currentMood === 'positive' ? 'bg-success' : 
              currentMood === 'negative' ? 'bg-warning' : 'bg-muted'}
          `} />
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;