import { supabase } from '../lib/supabase';

export const aiService = {
  // Generate AI suggestions for journaling
  async generateSuggestions(options = {}) {
    const { language = 'fr', mood = 'neutral', content = '', provider = 'auto' } = options;
    
    // Check if we're in development mode or if Supabase is properly configured
    const isDev = import.meta.env.DEV;
    const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // In development or when Supabase isn't configured, use enhanced fallback
    if (isDev || !hasSupabaseConfig) {
      console.log('Using enhanced fallback suggestions (development mode or missing Supabase config)');
      const fallbackSuggestions = this.getEnhancedFallbackSuggestions(language, mood, content);
      
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { 
        success: true, 
        data: fallbackSuggestions,
        meta: { provider: 'enhanced-fallback', dev: true }
      };
    }

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-suggest', {
        body: {
          language,
          mood,
          content,
          provider
        }
      });

      if (error) {
        console.error('AI suggestions error:', error);
        // Fallback to enhanced suggestions on error
        const fallbackSuggestions = this.getEnhancedFallbackSuggestions(language, mood, content);
        return { 
          success: true, // Still return success with fallback
          data: fallbackSuggestions,
          meta: { provider: 'fallback-on-error', error: error.message }
        };
      }

      return { 
        success: true, 
        data: data.suggestions || [],
        meta: data.meta || {}
      };
    } catch (error) {
      console.error('AI service error:', error);
      // Fallback to enhanced suggestions on error
      const fallbackSuggestions = this.getEnhancedFallbackSuggestions(language, mood, content);
      return { 
        success: true, // Still return success with fallback
        data: fallbackSuggestions,
        meta: { provider: 'fallback-on-catch', error: error.message }
      };
    }
  },

  // Get enhanced fallback suggestions with content-aware logic
  getEnhancedFallbackSuggestions(language = 'fr', mood = 'neutral', content = '') {
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    const hasEmotionalWords = this.detectEmotionalContent(content, language);
    
    let suggestions = [];
    
    // Content-aware suggestions
    if (wordCount < 50) {
      suggestions = this.getStarterSuggestions(language, mood);
    } else if (hasEmotionalWords.positive) {
      suggestions = this.getPositiveContinuationSuggestions(language);
    } else if (hasEmotionalWords.negative) {
      suggestions = this.getSupportiveSuggestions(language);
    } else {
      suggestions = this.getMoodBasedSuggestions(language, mood);
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  },

  // Detect emotional content in the text
  detectEmotionalContent(content, language) {
    const lowerContent = content.toLowerCase();
    
    const emotionalKeywords = {
      fr: {
        positive: ['heureux', 'joie', 'content', 'satisfait', 'bien', 'sourire', 'rire', 'amour', 'paix', 'calme', 'reconnaissant'],
        negative: ['triste', 'déprimé', 'anxieux', 'stress', 'peur', 'colère', 'frustré', 'mal', 'difficile', 'problème']
      },
      ar: {
        positive: ['سعيد', 'فرح', 'راض', 'جيد', 'ابتسامة', 'ضحك', 'حب', 'سلام', 'هدوء', 'ممتن'],
        negative: ['حزين', 'مكتئب', 'قلق', 'توتر', 'خوف', 'غضب', 'محبط', 'سيء', 'صعب', 'مشكلة']
      }
    };
    
    const keywords = emotionalKeywords[language] || emotionalKeywords.fr;
    
    return {
      positive: keywords.positive.some(word => lowerContent.includes(word)),
      negative: keywords.negative.some(word => lowerContent.includes(word))
    };
  },

  // Get starter suggestions for short content
  getStarterSuggestions(language, mood) {
    const suggestions = {
      fr: [
        {
          id: crypto.randomUUID(),
          type: 'continuation',
          content: "Décrivez ce qui vous a marqué aujourd'hui, même le plus petit détail.",
          icon: 'PenTool'
        },
        {
          id: crypto.randomUUID(),
          type: 'reflection',
          content: "Comment vous sentez-vous en ce moment ? Prenez le temps d'explorer cette émotion.",
          icon: 'Heart'
        },
        {
          id: crypto.randomUUID(),
          type: 'exploration',
          content: "Qu'est-ce qui vous préoccupe ou vous inspire aujourd'hui ?",
          icon: 'Compass'
        }
      ],
      ar: [
        {
          id: crypto.randomUUID(),
          type: 'continuation',
          content: "صف ما أثر فيك اليوم، حتى لو كان أصغر التفاصيل.",
          icon: 'PenTool'
        },
        {
          id: crypto.randomUUID(),
          type: 'reflection',
          content: "كيف تشعر في هذه اللحظة؟ خذ وقتك لاستكشاف هذه المشاعر.",
          icon: 'Heart'
        },
        {
          id: crypto.randomUUID(),
          type: 'exploration',
          content: "ما الذي يقلقك أو يلهمك اليوم؟",
          icon: 'Compass'
        }
      ]
    };
    
    return suggestions[language] || suggestions.fr;
  },

  // Get positive continuation suggestions
  getPositiveContinuationSuggestions(language) {
    const suggestions = {
      fr: [
        {
          id: crypto.randomUUID(),
          type: 'continuation',
          content: "Cette joie que vous ressentez, comment pourriez-vous la partager ou la prolonger ?",
          icon: 'Lightbulb'
        },
        {
          id: crypto.randomUUID(),
          type: 'reflection',
          content: "Quels sont les éléments qui ont contribué à ce sentiment positif ?",
          icon: 'Heart'
        },
        {
          id: crypto.randomUUID(),
          type: 'exploration',
          content: "Comment pouvez-vous cultiver davantage de ces moments dans votre quotidien ?",
          icon: 'Sparkles'
        }
      ],
      ar: [
        {
          id: crypto.randomUUID(),
          type: 'continuation',
          content: "هذه السعادة التي تشعر بها، كيف يمكنك مشاركتها أو إطالة أمدها؟",
          icon: 'Lightbulb'
        },
        {
          id: crypto.randomUUID(),
          type: 'reflection',
          content: "ما هي العناصر التي ساهمت في هذا الشعور الإيجابي؟",
          icon: 'Heart'
        },
        {
          id: crypto.randomUUID(),
          type: 'exploration',
          content: "كيف يمكنك زراعة المزيد من هذه اللحظات في حياتك اليومية؟",
          icon: 'Sparkles'
        }
      ]
    };
    
    return suggestions[language] || suggestions.fr;
  },

  // Get supportive suggestions for negative content
  getSupportiveSuggestions(language) {
    const suggestions = {
      fr: [
        {
          id: crypto.randomUUID(),
          type: 'support',
          content: "Il est normal de ressentir ces émotions. Que pourriez-vous faire pour vous réconforter maintenant ?",
          icon: 'Shield'
        },
        {
          id: crypto.randomUUID(),
          type: 'coping',
          content: "Respirez profondément. Quelles sont vos ressources intérieures dans ce moment difficile ?",
          icon: 'Coffee'
        },
        {
          id: crypto.randomUUID(),
          type: 'reflection',
          content: "Ces sentiments sont temporaires. Qu'est-ce qui vous a aidé à surmonter des défis similaires ?",
          icon: 'Compass'
        }
      ],
      ar: [
        {
          id: crypto.randomUUID(),
          type: 'support',
          content: "من الطبيعي أن تشعر بهذه المشاعر. ما الذي يمكنك فعله لتهدئة نفسك الآن؟",
          icon: 'Shield'
        },
        {
          id: crypto.randomUUID(),
          type: 'coping',
          content: "تنفس بعمق. ما هي مواردك الداخلية في هذه اللحظة الصعبة؟",
          icon: 'Coffee'
        },
        {
          id: crypto.randomUUID(),
          type: 'reflection',
          content: "هذه المشاعر مؤقتة. ما الذي ساعدك على تجاوز تحديات مماثلة؟",
          icon: 'Compass'
        }
      ]
    };
    
    return suggestions[language] || suggestions.fr;
  },

  // Get mood-based suggestions
  getMoodBasedSuggestions(language, mood) {
    // Use the original fallback suggestions as a base
    return this.getFallbackSuggestions(language, mood);
  },
    const suggestionsByMoodAndLanguage = {
      fr: {
        positive: [
          {
            id: crypto.randomUUID(),
            type: 'continuation',
            content: "Cette énergie positive que vous ressentez pourrait être explorée davantage. Qu'est-ce qui contribue le plus à ce sentiment de bien-être aujourd'hui ?",
            icon: 'Lightbulb'
          },
          {
            id: crypto.randomUUID(),
            type: 'reflection',
            content: "Prenez un moment pour reconnaître cette joie. Comment pourriez-vous cultiver davantage de ces moments dans votre quotidien ?",
            icon: 'Heart'
          }
        ],
        negative: [
          {
            id: crypto.randomUUID(),
            type: 'support',
            content: "Il est courageux de partager ces sentiments difficiles. Rappelez-vous que ces émotions sont temporaires et font partie de l'expérience humaine.",
            icon: 'Shield'
          },
          {
            id: crypto.randomUUID(),
            type: 'coping',
            content: "Quand vous vous sentez ainsi, quelles sont les petites choses qui vous apportent du réconfort ? Même un thé à la menthe peut être un acte de soin personnel.",
            icon: 'Coffee'
          }
        ],
        neutral: [
          {
            id: crypto.randomUUID(),
            type: 'exploration',
            content: "Explorez ce que vous ressentez en ce moment. Parfois, les moments calmes nous offrent l'espace pour une réflexion profonde.",
            icon: 'Compass'
          },
          {
            id: crypto.randomUUID(),
            type: 'continuation',
            content: "Complétez cette phrase: aujourd'hui, j'ai appris que...",
            icon: 'PenTool'
          }
        ]
      },
      ar: {
        positive: [
          {
            id: crypto.randomUUID(),
            type: 'continuation',
            content: "هذه الطاقة الإيجابية التي تشعر بها يمكن استكشافها أكثر. ما الذي يساهم أكثر في هذا الشعور بالراحة اليوم؟",
            icon: 'Lightbulb'
          },
          {
            id: crypto.randomUUID(),
            type: 'reflection',
            content: "خذ لحظة لتقدير هذه السعادة. كيف يمكنك زراعة المزيد من هذه اللحظات في حياتك اليومية؟",
            icon: 'Heart'
          }
        ],
        negative: [
          {
            id: crypto.randomUUID(),
            type: 'support',
            content: "من الشجاع أن تشارك هذه المشاعر الصعبة. تذكر أن هذه العواطف مؤقتة وجزء من التجربة الإنسانية.",
            icon: 'Shield'
          },
          {
            id: crypto.randomUUID(),
            type: 'coping',
            content: "عندما تشعر بهذا، ما هي الأشياء الصغيرة التي تجلب لك الراحة؟ حتى كوب من الأتاي يمكن أن يكون عملاً من أعمال الرعاية الذاتية.",
            icon: 'Coffee'
          }
        ],
        neutral: [
          {
            id: crypto.randomUUID(),
            type: 'exploration',
            content: "استكشف ما تشعر به في هذه اللحظة. أحياناً تمنحنا اللحظات الهادئة مساحة للتأمل العميق.",
            icon: 'Compass'
          },
          {
            id: crypto.randomUUID(),
            type: 'continuation',
            content: "أكمل: اليوم تعلمت أن...",
            icon: 'PenTool'
          }
        ]
      }
    };

    return suggestionsByMoodAndLanguage?.[language]?.[mood] || suggestionsByMoodAndLanguage?.[language]?.neutral || [];
  },

  // Get cultural prompts
  getCulturalPrompts(language = 'fr') {
    const culturalPrompts = {
      fr: [
        {
          id: crypto.randomUUID(),
          title: "Réflexion spirituelle",
          content: "Comment votre foi influence-t-elle votre perspective sur cette situation ?",
          icon: 'Star'
        },
        {
          id: crypto.randomUUID(),
          title: "Connexion familiale",
          content: "Que diraient vos proches de cette expérience ? Comment leur sagesse pourrait-elle vous guider ?",
          icon: 'Users'
        },
        {
          id: crypto.randomUUID(),
          title: "Tradition marocaine",
          content: "Y a-t-il un proverbe ou une tradition marocaine qui résonne avec ce que vous vivez ?",
          icon: 'Book'
        }
      ],
      ar: [
        {
          id: crypto.randomUUID(),
          title: "التأمل الروحي",
          content: "كيف يؤثر إيمانك على نظرتك لهذا الموقف؟",
          icon: 'Star'
        },
        {
          id: crypto.randomUUID(),
          title: "الروابط العائلية",
          content: "ماذا سيقول أحباؤك عن هذه التجربة؟ كيف يمكن لحكمتهم أن ترشدك؟",
          icon: 'Users'
        },
        {
          id: crypto.randomUUID(),
          title: "التراث المغربي",
          content: "هل هناك مثل أو تقليد مغربي يتردد صداه مع ما تعيشه؟",
          icon: 'Book'
        }
      ]
    };

    return culturalPrompts?.[language] || culturalPrompts.fr;
  }
};
