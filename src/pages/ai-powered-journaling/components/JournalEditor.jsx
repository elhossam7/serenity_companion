import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JournalEditor = ({ 
  content, 
  onContentChange, 
  language, 
  onMoodDetected, 
  isAiSuggesting,
  aiSuggestion,
  onDismissSuggestion
}, ref) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral');
  const textareaRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const moodDetectionTimeoutRef = useRef(null);
  const targetWords = 200;
  const progress = Math.min(100, Math.round((wordCount / targetWords) * 100));

  useEffect(() => {
    const words = content?.trim()?.split(/\s+/)?.filter(word => word?.length > 0);
    setWordCount(words?.length);

    // Auto-save functionality
    if (autoSaveTimeoutRef?.current) {
      clearTimeout(autoSaveTimeoutRef?.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('journal_draft', content);
    }, 1500); // Increased delay to reduce performance impact

    // Debounced mood detection
    if (moodDetectionTimeoutRef?.current) {
      clearTimeout(moodDetectionTimeoutRef?.current);
    }

    if (content?.length > 50) {
      moodDetectionTimeoutRef.current = setTimeout(() => {
        detectMood();
      }, 2000); // Detect mood 2 seconds after user stops typing
    }

    return () => {
      if (autoSaveTimeoutRef?.current) {
        clearTimeout(autoSaveTimeoutRef?.current);
      }
      if (moodDetectionTimeoutRef?.current) {
        clearTimeout(moodDetectionTimeoutRef?.current);
      }
    };
  }, [content, onMoodDetected]);

  // Memoize mood detection function
  const detectMood = useCallback(() => {
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
    
    // Only update if mood actually changed
    if (detectedMood !== currentMood) {
      setCurrentMood(detectedMood);
      onMoodDetected(detectedMood);
    }
  }, [content, currentMood, onMoodDetected]);

  // Formatting helpers (Markdown-like)
  const applyWrap = useCallback((prefix, suffix = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = content.slice(0, start);
    const selected = content.slice(start, end) || '';
    const after = content.slice(end);
    const newValue = `${before}${prefix}${selected}${suffix}${after}`;
    onContentChange(newValue);
    // Restore selection after update
    const cursor = start + prefix.length + selected.length + suffix.length;
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    }, 0);
  }, [content, onContentChange]);

  const applyLinePrefix = useCallback((prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = content.slice(0, start);
    const selected = content.slice(start, end) || '';
    const after = content.slice(end);
    const lines = selected.split(/\n/);
    const prefixed = lines.map(l => l ? `${prefix}${l}` : `${prefix}`).join('\n');
    const needsNewline = selected.length === 0;
    const insertion = needsNewline ? `${prefix}` : prefixed;
    const newValue = `${before}${insertion}${after}`;
    onContentChange(newValue);
    // Place cursor at end of inserted prefix
    const cursor = before.length + insertion.length;
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    }, 0);
  }, [content, onContentChange]);

  // Expose formatting API to parent via ref
  useImperativeHandle(ref, () => ({
    applyFormat: (action) => {
      switch (action) {
        case 'bold':
          return applyWrap('**');
        case 'italic':
          return applyWrap('_');
        case 'underline':
          // Markdown underline alternative
          return applyWrap('__');
        case 'list':
          return applyLinePrefix('- ');
        case 'quote':
          return applyLinePrefix('> ');
        default:
          return;
      }
    }
  }), [applyWrap, applyLinePrefix]);

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleVoiceToggle = useCallback(() => {
    setIsVoiceRecording(!isVoiceRecording);
    // Voice recording simulation
    if (!isVoiceRecording) {
      setTimeout(() => {
        setIsVoiceRecording(false);
      }, 3000);
    }
  }, [isVoiceRecording]);

  const insertAiSuggestion = useCallback(() => {
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
  }, [aiSuggestion, content, onContentChange]);

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

  const getMoodBackgroundColor = useCallback(() => {
    switch (currentMood) {
      case 'positive':
        return 'bg-success/5';
      case 'negative':
        return 'bg-warning/5';
      default:
        return 'bg-background';
    }
  }, [currentMood]);

  const moodLabel = useMemo(() => ({
    positive: { fr: 'Positif', ar: 'إيجابي' },
    negative: { fr: 'Négatif', ar: 'سلبي' },
    neutral: { fr: 'Neutre', ar: 'محايد' }
  })[currentMood] || { fr: 'Neutre', ar: 'محايد' }, [currentMood]);

  return (
    <div className={`
      relative flex flex-col h-full
      ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}
    `}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {wordCount} {t?.words}
          </div>
          <div className="flex items-center space-x-1 text-xs text-success">
            <Icon name="Check" size={12} />
            <span>{t?.autoSaved}</span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">{language === 'ar' ? moodLabel.ar : moodLabel.fr}</span>
            <span className={`w-2 h-2 rounded-full ${currentMood === 'positive' ? 'bg-success' : currentMood === 'negative' ? 'bg-warning' : 'bg-muted'}`}></span>
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
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div className="h-1 bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      {/* Editor Content */}
      <div className={`
        flex-1 relative overflow-hidden
        cultural-pattern
        ${getMoodBackgroundColor()}
        transition-colors duration-500
      `}>
        {/* Ambient gradient */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
        </div>
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
            scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
          `}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          style={{
            fontFamily: language === 'ar' ? 'Noto Sans Arabic, sans-serif' : 'Inter, sans-serif'
          }}
        />

        {/* AI Suggestion Overlay */}
        {aiSuggestion && (
          <div className="absolute bottom-4 right-4 max-w-sm">
            <div className="glass-panel border border-primary/20 rounded-xl p-4 shadow-soft-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-primary font-medium flex items-center">
                  <Icon name="Sparkles" size={12} className="mr-1" />
                  AI Suggestion
                </div>
                {isAiSuggesting && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">live</span>
                )}
              </div>
              <p className="text-sm text-foreground mb-3 line-clamp-4">
                {aiSuggestion}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={insertAiSuggestion}
                  iconName="Plus"
                  iconSize={12}
                  className="flex-1"
                >
                  {t?.insertSuggestion}
                </Button>
                <Button variant="outline" size="xs" onClick={onDismissSuggestion} iconName="X" iconSize={12}>
                  Hide
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mood Indicator */}
        <div className={`absolute top-4 right-4 ${isAiSuggesting ? 'animate-pulse' : ''}`}>
          <div className={`
            w-3 h-3 rounded-full transition-colors duration-300 ring-2 ring-white/50
            ${currentMood === 'positive' ? 'bg-success' : 
              currentMood === 'negative' ? 'bg-warning' : 'bg-muted'}
          `} />
        </div>
      </div>
    </div>
  );
};

export default forwardRef(JournalEditor);