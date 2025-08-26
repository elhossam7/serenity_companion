import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { aiService } from '../../../services/aiService';
import Skeleton from '../../../components/ui/Skeleton';

const SuggestionSkeleton = () => (
  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
    <div className="flex items-center space-x-2">
      <Skeleton className="w-4 h-4 rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-8 w-full rounded-md mt-2" />
  </div>
);

const AiAssistant = ({ 
  language, 
  currentMood, 
  isVisible, 
  onToggle, 
  onSuggestionGenerated,
  journalContent 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [error, setError] = useState(null);
  const debounceTimeoutRef = useRef(null);
  const lastGenerationRef = useRef({ content: '', mood: '', language: '' });

  const groupedSuggestions = useMemo(() => {
    if (!suggestions || suggestions.length === 0) {
      return {};
    }
    return suggestions.reduce((acc, suggestion) => {
      const type = suggestion.type || 'general';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(suggestion);
      return acc;
    }, {});
  }, [suggestions]);

  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Check if we should generate suggestions
    const shouldGenerate = journalContent?.length > 100;
    const hasChanged = 
      journalContent !== lastGenerationRef.current.content ||
      currentMood !== lastGenerationRef.current.mood ||
      language !== lastGenerationRef.current.language;

    if (shouldGenerate && hasChanged) {
      // Debounce the generation to avoid too many calls
      debounceTimeoutRef.current = setTimeout(() => {
        generateSuggestions();
      }, 1500); // Wait 1.5 seconds after user stops typing
    } else if (!shouldGenerate) {
      // Clear suggestions if content is too short
      setSuggestions([]);
      setError(null);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [journalContent, currentMood, language]);

  const generateSuggestions = useCallback(async (force = false) => {
    // Prevent duplicate calls
    if (isGenerating && !force) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await aiService.generateSuggestions({
        language,
        mood: currentMood,
        content: journalContent,
        force: force
      });
      
      // Update last generation reference
      lastGenerationRef.current = {
        content: journalContent,
        mood: currentMood,
        language: language
      };
      
      // The new service always returns success: true with fallback when needed
      if (result.success && result.data?.length > 0) {
        setSuggestions(result.data);
        
        // Only log in development mode and less verbosely
        if (import.meta.env.DEV && result.meta?.provider) {
          console.log('AI suggestions loaded:', result.meta.provider);
        }
      } else {
        // This shouldn't happen with the new service, but just in case
        const fallbackSuggestions = aiService.getFallbackSuggestions(language, currentMood);
        setSuggestions(fallbackSuggestions);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Use fallback suggestions on any error
      const fallbackSuggestions = aiService.getFallbackSuggestions(language, currentMood);
      setSuggestions(fallbackSuggestions);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  }, [language, currentMood, journalContent, isGenerating]);

  const retryGenerateSuggestions = () => {
    generateSuggestions(true);
  };

  const culturalPrompts = aiService.getCulturalPrompts(language);

  const suggestionTypeMeta = useMemo(() => ({
    reflection: { label: { fr: 'Réflexion', ar: 'تأمل' }, color: 'border-secondary', icon: 'BookOpen' },
    continuation: { label: { fr: 'Continuation', ar: 'متابعة' }, color: 'border-primary', icon: 'PenTool' },
    exploration: { label: { fr: 'Exploration', ar: 'استكشاف' }, color: 'border-accent', icon: 'Compass' },
    support: { label: { fr: 'Soutien', ar: 'دعم' }, color: 'border-success', icon: 'Shield' },
    coping: { label: { fr: 'Adaptation', ar: 'تكيف' }, color: 'border-warning', icon: 'Coffee' },
    general: { label: { fr: 'Général', ar: 'عام' }, color: 'border-muted', icon: 'Sparkles' },
  }), []);

  const translations = {
    fr: {
      aiAssistant: 'Assistant IA',
      suggestions: 'Suggestions',
      prompts: 'Invites culturelles',
      generating: 'Génération...',
      noSuggestions: 'Continuez à écrire pour recevoir des suggestions personnalisées.',
      useSuggestion: 'Utiliser',
      tryPrompt: 'Essayer cette invite',
      error: 'Erreur lors de la génération des suggestions',
      retry: 'Réessayer'
    },
    ar: {
      aiAssistant: 'المساعد الذكي',
      suggestions: 'الاقتراحات',
      prompts: 'المحفزات الثقافية',
      generating: 'جاري التوليد...',
      noSuggestions: 'استمر في الكتابة لتلقي اقتراحات شخصية.',
      useSuggestion: 'استخدام',
      tryPrompt: 'جرب هذا المحفز',
      error: 'خطأ في توليد الاقتراحات',
      retry: 'إعادة المحاولة'
    }
  };

  const t = translations?.[language];

  if (!isVisible) {
    return (
      <Button
        variant="primary"
        size="icon"
        onClick={onToggle}
        className="fixed bottom-20 right-4 z-40 lg:hidden shadow-soft-lg"
      >
        <Icon name="Sparkles" size={20} />
      </Button>
    );
  }

  return (
    <div className={`
      fixed inset-y-0 right-0 w-80 bg-card border-l border-border z-30
      lg:fixed lg:top-16 lg:bottom-0 lg:right-0 lg:w-96
      transform transition-transform duration-300 ease-gentle
      ${isVisible ? 'translate-x-0' : 'translate-x-full'}
    `} style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card/80 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-2">
          <Icon name="Sparkles" size={20} color="var(--color-primary)" />
          <h3 className="font-heading font-semibold text-foreground">
            {t?.aiAssistant}
          </h3>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="lg:hidden"
        >
          <Icon name="X" size={16} />
        </Button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`
            flex-1 px-4 py-3 text-sm font-body transition-colors
            ${activeTab === 'suggestions' ?'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {t?.suggestions}
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`
            flex-1 px-4 py-3 text-sm font-body transition-colors
            ${activeTab === 'prompts' ?'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {t?.prompts}
        </button>
        {activeTab === 'suggestions' && (
          <button
            onClick={retryGenerateSuggestions}
            className="px-3 py-3 text-muted-foreground hover:text-primary transition-colors"
            title={t?.refresh || 'Actualiser'}
          >
            <Icon name="RefreshCw" size={16} />
          </button>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'suggestions' && (
          <>
            {isGenerating && suggestions.length === 0 ? (
              <div className="space-y-4">
                <SuggestionSkeleton />
                <SuggestionSkeleton />
                <SuggestionSkeleton />
              </div>
            ) : !isGenerating && suggestions?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="PenTool" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body mb-4">
                  {t?.noSuggestions}
                </p>
                {error && (
                  <div className="mb-4">
                    <p className="text-xs text-red-500 mb-2">{t?.error}</p>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={retryGenerateSuggestions}
                      iconName="RefreshCw"
                      iconSize={12}
                    >
                      {t?.retry}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              Object.entries(groupedSuggestions).map(([type, suggestionsList]) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Icon name={suggestionTypeMeta[type]?.icon || 'Sparkles'} size={14} className="text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {suggestionTypeMeta[type]?.label?.[language] || type}
                    </h4>
                  </div>
                  {suggestionsList.map((suggestion, index) => (
                    <div key={`${suggestion?.type}-${suggestion?.id || index}`} className={`bg-muted/30 rounded-lg p-4 space-y-3 animate-fade-in border-l-4 ${suggestionTypeMeta[type]?.color || 'border-muted'}`}>
                      <p className="text-sm font-body text-foreground leading-relaxed">
                        {suggestion?.content}
                      </p>
                      
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onSuggestionGenerated(suggestion?.content)}
                        iconName="Plus"
                        iconSize={12}
                        className="w-full"
                      >
                        {t?.useSuggestion}
                      </Button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'prompts' && (
          <>
            {culturalPrompts?.map((prompt, index) => (
              <div key={`prompt-${prompt?.id || index}`} className="bg-secondary/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon name={prompt?.icon} size={16} color="var(--color-secondary)" />
                  <span className="text-sm font-body font-medium text-foreground">
                    {prompt?.title}
                  </span>
                </div>
                
                <p className="text-sm font-body text-muted-foreground leading-relaxed">
                  {prompt?.content}
                </p>
                
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => onSuggestionGenerated(prompt?.content)}
                  iconName="ArrowRight"
                  iconSize={12}
                  className="w-full"
                >
                  {t?.tryPrompt}
                </Button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;