// Shared utilities for AI Chat Support

export const CRISIS_KEYWORDS = [
  // Immediate danger (Level 4)
  'suicide', 'kill myself', 'end my life', 'want to die',
  'suicidaire', 'me tuer', 'mettre fin à ma vie', 'veux mourir',
  'انتحار', 'أقتل نفسي', 'أنهي حياتي', 'أريد أن أموت',
  
  // Self-harm (Level 3)
  'self harm', 'cut myself', 'hurt myself',
  'me faire du mal', 'me couper', 'me blesser',
  'إيذاء نفسي', 'أجرح نفسي', 'أؤذي نفسي',
  
  // Severe distress (Level 2)
  'hopeless', 'worthless', 'no point', 'give up',
  'sans espoir', 'inutile', 'abandonner',
  'فقدت الأمل', 'لا قيمة لي', 'أستسلم'
];

export function detectCrisis(text = '') {
  const t = (text || '').toLowerCase();
  return CRISIS_KEYWORDS.some(k => t.includes(k.toLowerCase()));
}

// Enhanced mood detection from text
export function detectMoodFromMessage(text = '') {
  const t = text.toLowerCase();
  
  const moodKeywords = {
    positive: {
      fr: ['heureux', 'content', 'bien', 'mieux', 'joie', 'sourire', 'optimiste'],
      ar: ['سعيد', 'راض', 'جيد', 'أفضل', 'فرح', 'ابتسامة', 'متفائل'],
      en: ['happy', 'good', 'great', 'better', 'joy', 'smile', 'optimistic']
    },
    negative: {
      fr: ['triste', 'mal', 'déprimé', 'difficile', 'problème', 'colère'],
      ar: ['حزين', 'سيء', 'مكتئب', 'صعب', 'مشكلة', 'غضب'],
      en: ['sad', 'bad', 'depressed', 'difficult', 'problem', 'angry']
    },
    anxious: {
      fr: ['anxieux', 'inquiet', 'stressé', 'peur', 'panique', 'nerveux'],
      ar: ['قلق', 'متوتر', 'خائف', 'هلع', 'عصبي'],
      en: ['anxious', 'worried', 'stressed', 'fear', 'panic', 'nervous']
    }
  };
  
  for (const [mood, languages] of Object.entries(moodKeywords)) {
    for (const words of Object.values(languages)) {
      if (words.some(word => t.includes(word))) {
        return mood;
      }
    }
  }
  
  return 'neutral';
}

// Conversation context helpers
export function getConversationInsights(messages = []) {
  const userMessages = messages.filter(m => m.role === 'user');
  const totalMessages = messages.length;
  const userMessageCount = userMessages.length;
  
  // Detect patterns
  const hasEmotionalContent = userMessages.some(m => 
    detectMoodFromMessage(m.content) !== 'neutral'
  );
  
  const hasCrisisContent = userMessages.some(m => detectCrisis(m.content));
  
  const averageMessageLength = userMessages.length > 0 
    ? userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length 
    : 0;
  
  return {
    totalMessages,
    userMessageCount,
    hasEmotionalContent,
    hasCrisisContent,
    averageMessageLength,
    conversationDepth: totalMessages > 10 ? 'deep' : totalMessages > 4 ? 'moderate' : 'light'
  };
}

// A tiny reducer-like state manager to simplify testing state transitions
export const initialChatState = {
  messages: [],
  isLoading: false,
  showEmergency: false,
  conversationStage: 'greeting',
  showSuggestions: true
};

export function chatReducer(state, action) {
  switch (action?.type) {
    case 'addUserMessage':
      return { 
        ...state, 
        messages: [...state.messages, { ...action.payload, role: 'user' }],
        showSuggestions: false
      };
    case 'addAiMessage':
      return { ...state, messages: [...state.messages, { ...action.payload, role: 'assistant' }] };
    case 'setLoading':
      return { ...state, isLoading: !!action.payload };
    case 'toggleEmergency':
      return { ...state, showEmergency: !!action.payload };
    case 'setConversationStage':
      return { ...state, conversationStage: action.payload };
    case 'toggleSuggestions':
      return { ...state, showSuggestions: !state.showSuggestions };
    case 'reset':
      return { ...initialChatState };
    default:
      return state;
  }
}
