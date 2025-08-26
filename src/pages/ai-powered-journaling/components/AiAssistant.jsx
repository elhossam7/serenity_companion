import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

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

  useEffect(() => {
    if (journalContent?.length > 100) {
      generateSuggestions();
    }
  }, [journalContent, currentMood, language]);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simulate AI suggestion generation
    setTimeout(() => {
      const mockSuggestions = getMockSuggestions();
      setSuggestions(mockSuggestions);
      setIsGenerating(false);
      
      if (mockSuggestions?.length > 0) {
        onSuggestionGenerated(mockSuggestions?.[0]?.content);
      }
    }, 1500);
  };

  const getMockSuggestions = () => {
    const suggestionsByMoodAndLanguage = {
      fr: {
        positive: [
          {
            id: 1,
            type: 'continuation',
            content: "Cette énergie positive que vous ressentez pourrait être explorée davantage. Qu\'est-ce qui contribue le plus à ce sentiment de bien-être aujourd\'hui ?",
            icon: 'Lightbulb'
          },
          {
            id: 2,
            type: 'reflection',
            content: "Prenez un moment pour reconnaître cette joie. Comment pourriez-vous cultiver davantage de ces moments dans votre quotidien ?",
            icon: 'Heart'
          }
        ],
        negative: [
          {
            id: 3,
            type: 'support',
            content: "Il est courageux de partager ces sentiments difficiles. Rappelez-vous que ces émotions sont temporaires et font partie de l'expérience humaine.",
            icon: 'Shield'
          },
          {
            id: 4,
            type: 'coping',
            content: "Quand vous vous sentez ainsi, quelles sont les petites choses qui vous apportent du réconfort ? Même un thé à la menthe peut être un acte de soin personnel.",
            icon: 'Coffee'
          }
        ],
        neutral: [
          {
            id: 5,
            type: 'exploration',
            content: "Explorez ce que vous ressentez en ce moment. Parfois, les moments calmes nous offrent l'espace pour une réflexion profonde.",
            icon: 'Compass'
          }
        ]
      },
      ar: {
        positive: [
          {
            id: 1,
            type: 'continuation',
            content: "هذه الطاقة الإيجابية التي تشعر بها يمكن استكشافها أكثر. ما الذي يساهم أكثر في هذا الشعور بالراحة اليوم؟",
            icon: 'Lightbulb'
          },
          {
            id: 2,
            type: 'reflection',
            content: "خذ لحظة لتقدير هذه السعادة. كيف يمكنك زراعة المزيد من هذه اللحظات في حياتك اليومية؟",
            icon: 'Heart'
          }
        ],
        negative: [
          {
            id: 3,
            type: 'support',
            content: "من الشجاع أن تشارك هذه المشاعر الصعبة. تذكر أن هذه العواطف مؤقتة وجزء من التجربة الإنسانية.",
            icon: 'Shield'
          },
          {
            id: 4,
            type: 'coping',
            content: "عندما تشعر بهذا، ما هي الأشياء الصغيرة التي تجلب لك الراحة؟ حتى كوب من الأتاي يمكن أن يكون عملاً من أعمال الرعاية الذاتية.",
            icon: 'Coffee'
          }
        ],
        neutral: [
          {
            id: 5,
            type: 'exploration',
            content: "استكشف ما تشعر به في هذه اللحظة. أحياناً تمنحنا اللحظات الهادئة مساحة للتأمل العميق.",
            icon: 'Compass'
          }
        ]
      }
    };

    return suggestionsByMoodAndLanguage?.[language]?.[currentMood] || suggestionsByMoodAndLanguage?.[language]?.neutral;
  };

  const culturalPrompts = {
    fr: [
      {
        id: 1,
        title: "Réflexion spirituelle",
        content: "Comment votre foi influence-t-elle votre perspective sur cette situation ?",
        icon: 'Star'
      },
      {
        id: 2,
        title: "Connexion familiale",
        content: "Que diraient vos proches de cette expérience ? Comment leur sagesse pourrait-elle vous guider ?",
        icon: 'Users'
      },
      {
        id: 3,
        title: "Tradition marocaine",
        content: "Y a-t-il un proverbe ou une tradition marocaine qui résonne avec ce que vous vivez ?",
        icon: 'Book'
      }
    ],
    ar: [
      {
        id: 1,
        title: "التأمل الروحي",
        content: "كيف يؤثر إيمانك على نظرتك لهذا الموقف؟",
        icon: 'Star'
      },
      {
        id: 2,
        title: "الروابط العائلية",
        content: "ماذا سيقول أحباؤك عن هذه التجربة؟ كيف يمكن لحكمتهم أن ترشدك؟",
        icon: 'Users'
      },
      {
        id: 3,
        title: "التراث المغربي",
        content: "هل هناك مثل أو تقليد مغربي يتردد صداه مع ما تعيشه؟",
        icon: 'Book'
      }
    ]
  };

  const translations = {
    fr: {
      aiAssistant: 'Assistant IA',
      suggestions: 'Suggestions',
      prompts: 'Invites culturelles',
      generating: 'Génération...',
      noSuggestions: 'Continuez à écrire pour recevoir des suggestions personnalisées.',
      useSuggestion: 'Utiliser',
      tryPrompt: 'Essayer cette invite'
    },
    ar: {
      aiAssistant: 'المساعد الذكي',
      suggestions: 'الاقتراحات',
      prompts: 'المحفزات الثقافية',
      generating: 'جاري التوليد...',
      noSuggestions: 'استمر في الكتابة لتلقي اقتراحات شخصية.',
      useSuggestion: 'استخدام',
      tryPrompt: 'جرب هذا المحفز'
    }
  };

  const t = translations?.[language];

  if (!isVisible) {
    return (
      <Button
        variant="primary"
        size="icon"
        onClick={onToggle}
        className="fixed bottom-20 right-4 z-40 md:hidden shadow-soft-lg"
      >
        <Icon name="Sparkles" size={20} />
      </Button>
    );
  }

  return (
    <div className={`
      fixed inset-y-0 right-0 w-80 bg-card border-l border-border z-30
      md:relative md:w-full md:border-l md:z-auto
      transform transition-transform duration-300 ease-gentle
      ${isVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
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
          className="md:hidden"
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
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'suggestions' && (
          <>
            {isGenerating && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2 text-primary">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  <span className="text-sm font-body">{t?.generating}</span>
                </div>
              </div>
            )}

            {!isGenerating && suggestions?.length === 0 && (
              <div className="text-center py-8">
                <Icon name="PenTool" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">
                  {t?.noSuggestions}
                </p>
              </div>
            )}

            {suggestions?.map((suggestion) => (
              <div key={suggestion?.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon name={suggestion?.icon} size={16} color="var(--color-primary)" />
                  <span className="text-xs font-caption text-primary uppercase tracking-wide">
                    {suggestion?.type}
                  </span>
                </div>
                
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {suggestion?.content}
                </p>
                
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onSuggestionGenerated(suggestion?.content)}
                  iconName="ArrowRight"
                  iconSize={12}
                  className="w-full"
                >
                  {t?.useSuggestion}
                </Button>
              </div>
            ))}
          </>
        )}

        {activeTab === 'prompts' && (
          <>
            {culturalPrompts?.[language]?.map((prompt) => (
              <div key={prompt?.id} className="bg-secondary/10 rounded-lg p-4 space-y-3">
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