import { supabase } from '../lib/supabase';

export const aiService = {
  // Add a suggestion cache to track what we've shown
  _suggestionCache: new Map(),
  _loggedFallback: false, // Track if we've already logged the fallback message
  
  // Generate AI suggestions for journaling
  async generateSuggestions(options = {}) {
    const { language = 'fr', mood = 'neutral', content = '', provider = 'auto', force = false, history = [] } = options;
    
    // Check if we're in development mode or if Supabase is properly configured
    const isDev = import.meta.env.DEV;
    const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // In development or when Supabase isn't configured, use enhanced fallback
    if (isDev || !hasSupabaseConfig) {
      // Only log once per session or when there's a significant change
      if (!this._loggedFallback) {
        console.log('Using enhanced fallback suggestions (development mode or missing Supabase config)');
        this._loggedFallback = true;
      }
      
      const fallbackSuggestions = this.getVariedSuggestions(language, mood, content, force);
      
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 300)); // Reduced delay
      
      return { 
        success: true, 
        data: fallbackSuggestions,
        meta: { provider: 'enhanced-fallback', dev: true, varied: true }
      };
    }

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-suggest', {
        body: {
          language,
          mood,
          content,
          provider,
          history: Array.isArray(history) ? history.slice(-10) : []
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

  // Get varied suggestions that change each time
  getVariedSuggestions(language = 'fr', mood = 'neutral', content = '', force = false) {
    const cacheKey = `${language}-${mood}-${Math.floor(content.length / 50)}`;
    
    // If force refresh or no cache, generate new suggestions
    if (force || !this._suggestionCache.has(cacheKey)) {
      const allSuggestionTypes = [
        () => this.getEnhancedFallbackSuggestions(language, mood, content),
        () => this.getCreativePrompts(language),
        () => this.getMindfulnessPrompts(language),
        () => this.getReflectionPrompts(language),
        () => this.getGratitudePrompts(language)
      ];
      
      // Rotate through different types of suggestions
      const typeIndex = Math.floor(Math.random() * allSuggestionTypes.length);
      const suggestions = allSuggestionTypes[typeIndex]();
      
      // Cache the suggestions
      this._suggestionCache.set(cacheKey, suggestions);
      
      return suggestions;
    }
    
    return this._suggestionCache.get(cacheKey);
  },

  // Creative writing prompts
  getCreativePrompts(language = 'fr') {
    const prompts = {
      fr: [
        {
          id: `creative-${Date.now()}-1`,
          type: 'creative',
          content: "Si vous pouviez écrire une lettre à votre moi d'il y a un an, que lui diriez-vous ?",
          icon: 'Edit'
        },
        {
          id: `creative-${Date.now()}-2`,
          type: 'creative',
          content: "Décrivez votre journée idéale dans les moindres détails, du réveil au coucher.",
          icon: 'Sun'
        },
        {
          id: `creative-${Date.now()}-3`,
          type: 'creative',
          content: "Quelles sont les trois choses qui vous rendent unique ? Explorez chacune d'elles.",
          icon: 'Star'
        }
      ],
      ar: [
        {
          id: `creative-${Date.now()}-1`,
          type: 'creative',
          content: "لو كان بإمكانك كتابة رسالة لنفسك قبل عام، ماذا ستقول لها؟",
          icon: 'Edit'
        },
        {
          id: `creative-${Date.now()}-2`,
          type: 'creative',
          content: "صف يومك المثالي بأدق التفاصيل، من الاستيقاظ حتى النوم.",
          icon: 'Sun'
        },
        {
          id: `creative-${Date.now()}-3`,
          type: 'creative',
          content: "ما هي الأشياء الثلاثة التي تجعلك فريداً؟ استكشف كل واحدة منها.",
          icon: 'Star'
        }
      ]
    };
    
    return prompts[language] || prompts.fr;
  },

  // Mindfulness prompts
  getMindfulnessPrompts(language = 'fr') {
    const prompts = {
      fr: [
        {
          id: `mindful-${Date.now()}-1`,
          type: 'mindfulness',
          content: "Prenez cinq respirations profondes. Que ressentez-vous dans votre corps maintenant ?",
          icon: 'Wind'
        },
        {
          id: `mindful-${Date.now()}-2`,
          type: 'mindfulness',
          content: "Observez vos émotions actuelles sans les juger. Que remarquez-vous ?",
          icon: 'Eye'
        },
        {
          id: `mindful-${Date.now()}-3`,
          type: 'mindfulness',
          content: "Quel son entendez-vous en ce moment ? Comment cela affecte-t-il votre état d'esprit ?",
          icon: 'Volume2'
        }
      ],
      ar: [
        {
          id: `mindful-${Date.now()}-1`,
          type: 'mindfulness',
          content: "خذ خمسة أنفاس عميقة. ماذا تشعر في جسدك الآن؟",
          icon: 'Wind'
        },
        {
          id: `mindful-${Date.now()}-2`,
          type: 'mindfulness',
          content: "راقب مشاعرك الحالية دون إصدار أحكام. ماذا تلاحظ؟",
          icon: 'Eye'
        },
        {
          id: `mindful-${Date.now()}-3`,
          type: 'mindfulness',
          content: "ما الصوت الذي تسمعه الآن؟ كيف يؤثر ذلك على حالتك النفسية؟",
          icon: 'Volume2'
        }
      ]
    };
    
    return prompts[language] || prompts.fr;
  },

  // Reflection prompts
  getReflectionPrompts(language = 'fr') {
    const prompts = {
      fr: [
        {
          id: `reflection-${Date.now()}-1`,
          type: 'reflection',
          content: "Qu'avez-vous appris sur vous-même cette semaine ?",
          icon: 'BookOpen'
        },
        {
          id: `reflection-${Date.now()}-2`,
          type: 'reflection',
          content: "Quel défi récent vous a fait grandir ? Comment avez-vous évolué ?",
          icon: 'TrendingUp'
        },
        {
          id: `reflection-${Date.now()}-3`,
          type: 'reflection',
          content: "Si vous deviez donner un conseil à quelqu'un qui vit la même situation que vous, que diriez-vous ?",
          icon: 'MessageCircle'
        }
      ],
      ar: [
        {
          id: `reflection-${Date.now()}-1`,
          type: 'reflection',
          content: "ماذا تعلمت عن نفسك هذا الأسبوع؟",
          icon: 'BookOpen'
        },
        {
          id: `reflection-${Date.now()}-2`,
          type: 'reflection',
          content: "أي تحدٍ حديث جعلك تنمو؟ كيف تطورت؟",
          icon: 'TrendingUp'
        },
        {
          id: `reflection-${Date.now()}-3`,
          type: 'reflection',
          content: "لو كان عليك إعطاء نصيحة لشخص يعيش نفس موقفك، ماذا ستقول؟",
          icon: 'MessageCircle'
        }
      ]
    };
    
    return prompts[language] || prompts.fr;
  },

  // Gratitude prompts
  getGratitudePrompts(language = 'fr') {
    const prompts = {
      fr: [
        {
          id: `gratitude-${Date.now()}-1`,
          type: 'gratitude',
          content: "Nommez trois personnes qui ont eu un impact positif sur votre vie et expliquez pourquoi.",
          icon: 'Heart'
        },
        {
          id: `gratitude-${Date.now()}-2`,
          type: 'gratitude',
          content: "Quel petit moment de bonheur avez-vous vécu aujourd'hui ?",
          icon: 'Smile'
        },
        {
          id: `gratitude-${Date.now()}-3`,
          type: 'gratitude',
          content: "Pour quelle compétence ou qualité personnelle êtes-vous le plus reconnaissant(e) ?",
          icon: 'Award'
        }
      ],
      ar: [
        {
          id: `gratitude-${Date.now()}-1`,
          type: 'gratitude',
          content: "اذكر ثلاثة أشخاص كان لهم تأثير إيجابي على حياتك واشرح السبب.",
          icon: 'Heart'
        },
        {
          id: `gratitude-${Date.now()}-2`,
          type: 'gratitude',
          content: "ما اللحظة الصغيرة من السعادة التي عشتها اليوم؟",
          icon: 'Smile'
        },
        {
          id: `gratitude-${Date.now()}-3`,
          type: 'gratitude',
          content: "ما المهارة أو الصفة الشخصية التي تشعر بالامتنان لها أكثر؟",
          icon: 'Award'
        }
      ]
    };
    
    return prompts[language] || prompts.fr;
  },

  // Get enhanced fallback suggestions with content-aware logic
  getEnhancedFallbackSuggestions(language = 'fr', mood = 'neutral', content = '') {
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    const hasEmotionalWords = this.detectEmotionalContent(content, language);
    
    // Create a cache key to track what we've shown for this session
    const cacheKey = `${language}-${mood}-${Math.floor(wordCount / 50)}`;
    
    let allSuggestions = [];
    
    // Gather all possible suggestions
    allSuggestions.push(...this.getStarterSuggestions(language, mood));
    allSuggestions.push(...this.getMoodBasedSuggestions(language, mood));
    
    if (hasEmotionalWords.positive) {
      allSuggestions.push(...this.getPositiveContinuationSuggestions(language));
    }
    if (hasEmotionalWords.negative) {
      allSuggestions.push(...this.getSupportiveSuggestions(language));
    }
    
    // Add more variety with different suggestion types
    if (wordCount > 100) {
      allSuggestions.push(...this.getReflectionSuggestions(language, content));
    }
    
    // Add creative and mindfulness suggestions for more variety
    allSuggestions.push(...this.getCreativePrompts(language));
    allSuggestions.push(...this.getMindfulnessPrompts(language));
    
    // Get the last shown index for rotation
    const lastShownIndex = this._suggestionCache.get(cacheKey) || 0;
    const nextIndex = (lastShownIndex + 3) % allSuggestions.length;
    
    // Update cache for next time
    this._suggestionCache.set(cacheKey, nextIndex);
    
    // Select 3 different suggestions starting from nextIndex
    const selectedSuggestions = [];
    for (let i = 0; i < 3; i++) {
      const index = (nextIndex + i) % allSuggestions.length;
      const suggestion = { ...allSuggestions[index] };
      suggestion.id = this.generateUniqueId();
      selectedSuggestions.push(suggestion);
    }
    
    return selectedSuggestions;
  },

  // Add variety through shuffling
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Generate unique IDs for suggestions
  generateUniqueId() {
    return `suggestion_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  },

  // Get creative prompts for variety
  getCreativePrompts(language) {
    const prompts = {
      fr: [
        {
          type: 'exploration',
          content: "Si vous pouviez donner un conseil à votre moi d'il y a un an, que diriez-vous ?",
          icon: 'Sparkles'
        },
        {
          type: 'exploration',
          content: "Décrivez votre journée idéale dans 10 ans.",
          icon: 'Star'
        },
        {
          type: 'continuation',
          content: "Quelle tradition de votre famille vous tient le plus à cœur ?",
          icon: 'Users'
        },
        {
          type: 'reflection',
          content: "Complétez : 'Je me sens le plus épanoui(e) quand...'",
          icon: 'Heart'
        }
      ],
      ar: [
        {
          type: 'exploration',
          content: "لو كان بإمكانك إعطاء نصيحة لنفسك قبل عام، ماذا ستقول؟",
          icon: 'Sparkles'
        },
        {
          type: 'exploration',
          content: "صف يومك المثالي بعد 10 سنوات.",
          icon: 'Star'
        },
        {
          type: 'continuation',
          content: "أي تقليد في عائلتك يعني لك الكثير؟",
          icon: 'Users'
        },
        {
          type: 'reflection',
          content: "أكمل: 'أشعر بأقصى درجات الرضا عندما...'",
          icon: 'Heart'
        }
      ]
    };
    return prompts[language] || prompts.fr;
  },

  // Get mindfulness prompts
  getMindfulnessPrompts(language) {
    const prompts = {
      fr: [
        {
          type: 'coping',
          content: "Prenez trois respirations profondes. Que ressentez-vous maintenant dans votre corps ?",
          icon: 'Coffee'
        },
        {
          type: 'support',
          content: "Quelle petite gentillesse pourriez-vous vous offrir aujourd'hui ?",
          icon: 'Shield'
        },
        {
          type: 'exploration',
          content: "Notez trois choses pour lesquelles vous êtes reconnaissant en ce moment.",
          icon: 'Lightbulb'
        },
        {
          type: 'reflection',
          content: "Comment votre spiritualité vous aide-t-elle dans les moments difficiles ?",
          icon: 'Star'
        }
      ],
      ar: [
        {
          type: 'coping',
          content: "خذ ثلاثة أنفاس عميقة. ما الذي تشعر به الآن في جسدك؟",
          icon: 'Coffee'
        },
        {
          type: 'support',
          content: "أي لطف صغير يمكنك أن تقدمه لنفسك اليوم؟",
          icon: 'Shield'
        },
        {
          type: 'exploration',
          content: "اذكر ثلاثة أشياء تشعر بالامتنان لها الآن.",
          icon: 'Lightbulb'
        },
        {
          type: 'reflection',
          content: "كيف تساعدك روحانيتك في الأوقات الصعبة؟",
          icon: 'Star'
        }
      ]
    };
    return prompts[language] || prompts.fr;
  },

  // Get reflection suggestions based on content
  getReflectionSuggestions(language, content) {
    const suggestions = {
      fr: [
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "En relisant ce que vous avez écrit, qu'est-ce qui vous surprend le plus ?",
          icon: 'Eye'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "Si vous deviez donner un conseil à quelqu'un dans votre situation, que diriez-vous ?",
          icon: 'MessageCircle'
        },
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "Dans un mois, comment aimeriez-vous vous sentir par rapport à cette situation ?",
          icon: 'Calendar'
        }
      ],
      ar: [
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "عند قراءة ما كتبته مرة أخرى، ما الذي يفاجئك أكثر؟",
          icon: 'Eye'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "لو كنت ستعطي نصيحة لشخص في موقفك، ماذا ستقول؟",
          icon: 'MessageCircle'
        },
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "خلال شهر، كيف تود أن تشعر حيال هذا الموقف؟",
          icon: 'Calendar'
        }
      ]
    };
    
    return suggestions[language] || suggestions.fr;
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
    const allSuggestions = {
      fr: [
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "Décrivez ce qui vous a marqué aujourd'hui, même le plus petit détail.",
          icon: 'PenTool'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "Comment vous sentez-vous en ce moment ? Prenez le temps d'explorer cette émotion.",
          icon: 'Heart'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "Qu'est-ce qui vous préoccupe ou vous inspire aujourd'hui ?",
          icon: 'Compass'
        },
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "Racontez-moi quelque chose qui vous a fait sourire récemment.",
          icon: 'Smile'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "Si vous deviez décrire votre journée en trois mots, lesquels choisiriez-vous ?",
          icon: 'BookOpen'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "Quel est le défi le plus important que vous affrontez en ce moment ?",
          icon: 'Target'
        }
      ],
      ar: [
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "صف ما أثر فيك اليوم، حتى لو كان أصغر التفاصيل.",
          icon: 'PenTool'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "كيف تشعر في هذه اللحظة؟ خذ وقتك لاستكشاف هذه المشاعر.",
          icon: 'Heart'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "ما الذي يقلقك أو يلهمك اليوم؟",
          icon: 'Compass'
        },
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "حدثني عن شيء جعلك تبتسم مؤخراً.",
          icon: 'Smile'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "لو كنت ستصف يومك بثلاث كلمات، فما هي؟",
          icon: 'BookOpen'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "ما هو أهم تحدٍ تواجهه في الوقت الحالي؟",
          icon: 'Target'
        }
      ]
    };
    
    const suggestions = allSuggestions[language] || allSuggestions.fr;
    return this.shuffleArray(suggestions);
  },

  // Get positive continuation suggestions
  getPositiveContinuationSuggestions(language) {
    const allSuggestions = {
      fr: [
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "Cette joie que vous ressentez, comment pourriez-vous la partager ou la prolonger ?",
          icon: 'Lightbulb'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "Quels sont les éléments qui ont contribué à ce sentiment positif ?",
          icon: 'Heart'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "Comment pouvez-vous cultiver davantage de ces moments dans votre quotidien ?",
          icon: 'Sparkles'
        },
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "Décrivez ce moment de bonheur plus en détail. Qu'est-ce qui le rend si spécial ?",
          icon: 'Star'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "À qui aimeriez-vous partager cette bonne nouvelle ou ce sentiment positif ?",
          icon: 'Users'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "Comment cette expérience positive peut-elle vous aider dans les défis à venir ?",
          icon: 'TrendingUp'
        }
      ],
      ar: [
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "هذه السعادة التي تشعر بها، كيف يمكنك مشاركتها أو إطالة أمدها؟",
          icon: 'Lightbulb'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "ما هي العناصر التي ساهمت في هذا الشعور الإيجابي؟",
          icon: 'Heart'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "كيف يمكنك زراعة المزيد من هذه اللحظات في حياتك اليومية؟",
          icon: 'Sparkles'
        },
        {
          id: this.generateUniqueId(),
          type: 'continuation',
          content: "صف لحظة السعادة هذه بتفاصيل أكثر. ما الذي يجعلها مميزة جداً؟",
          icon: 'Star'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "مع من تود مشاركة هذا الخبر السار أو هذا الشعور الإيجابي؟",
          icon: 'Users'
        },
        {
          id: this.generateUniqueId(),
          type: 'exploration',
          content: "كيف يمكن لهذه التجربة الإيجابية أن تساعدك في التحديات القادمة؟",
          icon: 'TrendingUp'
        }
      ]
    };
    
    const suggestions = allSuggestions[language] || allSuggestions.fr;
    return this.shuffleArray(suggestions);
  },

  // Get supportive suggestions for negative content
  getSupportiveSuggestions(language) {
    const allSuggestions = {
      fr: [
        {
          id: this.generateUniqueId(),
          type: 'support',
          content: "Il est normal de ressentir ces émotions. Que pourriez-vous faire pour vous réconforter maintenant ?",
          icon: 'Shield'
        },
        {
          id: this.generateUniqueId(),
          type: 'coping',
          content: "Respirez profondément. Quelles sont vos ressources intérieures dans ce moment difficile ?",
          icon: 'Coffee'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "Ces sentiments sont temporaires. Qu'est-ce qui vous a aidé à surmonter des défis similaires ?",
          icon: 'Compass'
        },
        {
          id: this.generateUniqueId(),
          type: 'support',
          content: "Vous êtes plus fort(e) que vous ne le pensez. Quelle petite action pourrait vous aider aujourd'hui ?",
          icon: 'Heart'
        },
        {
          id: this.generateUniqueId(),
          type: 'coping',
          content: "Quand vous vous sentez ainsi, vers qui ou quoi vous tournez-vous habituellement ?",
          icon: 'Users'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "Si un ami vivait la même chose, que lui diriez-vous avec bienveillance ?",
          icon: 'MessageCircle'
        }
      ],
      ar: [
        {
          id: this.generateUniqueId(),
          type: 'support',
          content: "من الطبيعي أن تشعر بهذه المشاعر. ما الذي يمكنك فعله لتهدئة نفسك الآن؟",
          icon: 'Shield'
        },
        {
          id: this.generateUniqueId(),
          type: 'coping',
          content: "تنفس بعمق. ما هي مواردك الداخلية في هذه اللحظة الصعبة؟",
          icon: 'Coffee'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "هذه المشاعر مؤقتة. ما الذي ساعدك على تجاوز تحديات مماثلة؟",
          icon: 'Compass'
        },
        {
          id: this.generateUniqueId(),
          type: 'support',
          content: "أنت أقوى مما تعتقد. ما هو العمل الصغير الذي يمكن أن يساعدك اليوم؟",
          icon: 'Heart'
        },
        {
          id: this.generateUniqueId(),
          type: 'coping',
          content: "عندما تشعر بهذا، إلى من أو إلى ماذا تلجأ عادة؟",
          icon: 'Users'
        },
        {
          id: this.generateUniqueId(),
          type: 'reflection',
          content: "لو كان صديق يعيش نفس الشيء، ماذا ستقول له بلطف؟",
          icon: 'MessageCircle'
        }
      ]
    };
    
    const suggestions = allSuggestions[language] || allSuggestions.fr;
    return this.shuffleArray(suggestions);
  },

  // Get mood-based suggestions
  getMoodBasedSuggestions(language, mood) {
    // Use the original fallback suggestions as a base
    return this.getFallbackSuggestions(language, mood);
  },

  // Get fallback suggestions when AI service is unavailable
  getFallbackSuggestions(language = 'fr', mood = 'neutral') {
    const suggestionsByMoodAndLanguage = {
      fr: {
        positive: [
          {
            id: this.generateUniqueId(),
            type: 'continuation',
            content: "Cette énergie positive que vous ressentez pourrait être explorée davantage. Qu'est-ce qui contribue le plus à ce sentiment de bien-être aujourd'hui ?",
            icon: 'Lightbulb'
          },
          {
            id: this.generateUniqueId(),
            type: 'reflection',
            content: "Prenez un moment pour reconnaître cette joie. Comment pourriez-vous cultiver davantage de ces moments dans votre quotidien ?",
            icon: 'Heart'
          },
          {
            id: this.generateUniqueId(),
            type: 'exploration',
            content: "Quelle leçon importante cette expérience positive vous enseigne-t-elle ?",
            icon: 'BookOpen'
          }
        ],
        negative: [
          {
            id: this.generateUniqueId(),
            type: 'support',
            content: "Il est courageux de partager ces sentiments difficiles. Rappelez-vous que ces émotions sont temporaires et font partie de l'expérience humaine.",
            icon: 'Shield'
          },
          {
            id: this.generateUniqueId(),
            type: 'coping',
            content: "Quand vous vous sentez ainsi, quelles sont les petites choses qui vous apportent du réconfort ? Même un thé à la menthe peut être un acte de soin personnel.",
            icon: 'Coffee'
          },
          {
            id: this.generateUniqueId(),
            type: 'reflection',
            content: "Imaginez-vous dans un mois. Comment cette période difficile pourrait-elle vous avoir rendu plus fort(e) ?",
            icon: 'TrendingUp'
          }
        ],
        neutral: [
          {
            id: this.generateUniqueId(),
            type: 'exploration',
            content: "Explorez ce que vous ressentez en ce moment. Parfois, les moments calmes nous offrent l'espace pour une réflexion profonde.",
            icon: 'Compass'
          },
          {
            id: this.generateUniqueId(),
            type: 'continuation',
            content: "Complétez cette phrase: aujourd'hui, j'ai appris que...",
            icon: 'PenTool'
          },
          {
            id: this.generateUniqueId(),
            type: 'reflection',
            content: "Si vous deviez écrire une lettre à votre futur vous, que lui diriez-vous ?",
            icon: 'Mail'
          }
        ]
      },
      ar: {
        positive: [
          {
            id: this.generateUniqueId(),
            type: 'continuation',
            content: "هذه الطاقة الإيجابية التي تشعر بها يمكن استكشافها أكثر. ما الذي يساهم أكثر في هذا الشعور بالراحة اليوم؟",
            icon: 'Lightbulb'
          },
          {
            id: this.generateUniqueId(),
            type: 'reflection',
            content: "خذ لحظة لتقدير هذه السعادة. كيف يمكنك زراعة المزيد من هذه اللحظات في حياتك اليومية؟",
            icon: 'Heart'
          },
          {
            id: this.generateUniqueId(),
            type: 'exploration',
            content: "ما هو الدرس المهم الذي تعلمه لك هذه التجربة الإيجابية؟",
            icon: 'BookOpen'
          }
        ],
        negative: [
          {
            id: this.generateUniqueId(),
            type: 'support',
            content: "من الشجاع أن تشارك هذه المشاعر الصعبة. تذكر أن هذه العواطف مؤقتة وجزء من التجربة الإنسانية.",
            icon: 'Shield'
          },
          {
            id: this.generateUniqueId(),
            type: 'coping',
            content: "عندما تشعر بهذا، ما هي الأشياء الصغيرة التي تجلب لك الراحة؟ حتى كوب من الأتاي يمكن أن يكون عملاً من أعمال الرعاية الذاتية.",
            icon: 'Coffee'
          },
          {
            id: this.generateUniqueId(),
            type: 'reflection',
            content: "تخيل نفسك خلال شهر. كيف يمكن لهذه الفترة الصعبة أن تجعلك أقوى؟",
            icon: 'TrendingUp'
          }
        ],
        neutral: [
          {
            id: this.generateUniqueId(),
            type: 'exploration',
            content: "استكشف ما تشعر به في هذه اللحظة. أحياناً تمنحنا اللحظات الهادئة مساحة للتأمل العميق.",
            icon: 'Compass'
          },
          {
            id: this.generateUniqueId(),
            type: 'continuation',
            content: "أكمل: اليوم تعلمت أن...",
            icon: 'PenTool'
          },
          {
            id: this.generateUniqueId(),
            type: 'reflection',
            content: "لو كنت ستكتب رسالة لنفسك في المستقبل، ماذا ستقول؟",
            icon: 'Mail'
          }
        ]
      }
    };

    const suggestions = suggestionsByMoodAndLanguage?.[language]?.[mood] || suggestionsByMoodAndLanguage?.[language]?.neutral || [];
    return this.shuffleArray(suggestions);
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
  ,
  async *generateSuggestionsStream(options = {}) {
    const { language = 'fr', mood = 'neutral', content = '', provider = 'auto', history = [] } = options;
    const isDev = import.meta.env.DEV;
    const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (isDev || !hasSupabaseConfig) {
      const fallback = this.getEnhancedFallbackSuggestions(language, mood, content);
      const text = (fallback?.[0]?.content) || '';
      if (text) { yield text; }
      return;
    }
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ language, mood, content, provider, stream: true, history: Array.isArray(history) ? history.slice(-10) : [] })
      });
      if (!resp.ok) {
        const fallback = this.getEnhancedFallbackSuggestions(language, mood, content);
        const text = (fallback?.[0]?.content) || '';
        if (text) { yield text; }
        return;
      }
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith('data: ')) {
            const json = line.slice(6).trim();
            try {
              const evt = JSON.parse(json);
              if (evt?.content) { yield evt.content; }
            } catch (_) {}
          }
        }
        buf = lines[lines.length - 1];
      }
    } catch (_) {
      // ignore
    }
  }
};
