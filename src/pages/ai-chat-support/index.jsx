import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import EmergencyOverlay from '../../components/ui/EmergencyOverlay';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import { aiService } from '../../services/aiService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const LOCAL_KEY = 'ai_chat_history_v1';

function useLocalMessages(userId) {
  const key = `${LOCAL_KEY}:${userId || 'anon'}`;
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (_) {}
  }, [key, messages]);

  return [messages, setMessages];
}

const ChatBubble = ({ role, content, time }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
    {role === 'assistant' && (
      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center shrink-0 mr-3 mt-1">
        <Icon name="Bot" size={16} color="var(--color-secondary)" />
      </div>
    )}
    <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-soft ${
      role === 'user' 
        ? 'bg-primary text-white rounded-br-none' 
        : 'bg-card text-foreground border border-border rounded-bl-none'
    }`}>
      <div className="whitespace-pre-wrap break-words font-body text-sm">{content}</div>
      {time && (
        <div className={`text-xs mt-1 opacity-75 ${
          role === 'user' ? 'text-white' : 'text-muted-foreground'
        }`}>
          {time}
        </div>
      )}
    </div>
    {role === 'user' && (
      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 ml-3 mt-1">
        <Icon name="User" size={16} color="var(--color-primary)" />
      </div>
    )}
  </div>
);

const Index = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [partialAi, setPartialAi] = useState('');
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationStage, setConversationStage] = useState('greeting'); // greeting, exploring, supporting, closing
  const [messages, setMessages] = useLocalMessages(user?.id);
  const endRef = useRef(null);

  // Resolve current language with a safe default for test environments where i18n may not be initialized
  const currentLang = (i18n && i18n.language) ? i18n.language : 'en';

  const labels = useMemo(() => ({
    fr: {
      title: 'Support par IA',
      subtitle: 'Discutez avec un assistant bienveillant. Ce n\'est pas un conseil médical.',
      placeholder: 'Écrire un message…',
      send: 'Envoyer',
      typing: 'Assistant écrit…',
      empty: 'Démarrez la conversation en écrivant votre premier message.',
      disclaimer: 'Si vous êtes en danger, contactez les services d\'urgence (141 au Maroc).',
      newChat: 'Nouvelle discussion',
      quickActions: 'Actions rapides',
      feelingAnxious: 'Je me sens anxieux',
      needToTalk: 'J\'ai besoin de parler',
      feelingSad: 'Je me sens triste',
      needCoping: 'Besoin de techniques de gestion',
      helpfulTips: 'Conseils utiles',
      breathingExercise: 'Exercice de respiration',
      grounding: 'Technique d\'ancrage',
      positiveAffirmation: 'Affirmation positive'
    },
    ar: {
      title: 'دعم بالذكاء الاصطناعي',
      subtitle: 'تحدث مع مساعد داعم. هذا ليس نصيحة طبية.',
      placeholder: 'اكتب رسالة…',
      send: 'إرسال',
      typing: 'المساعد يكتب…',
      empty: 'ابدأ المحادثة بكتابة رسالتك الأولى.',
      disclaimer: 'إذا كنت في خطر، اتصل بخدمات الطوارئ (141 في المغرب).',
      newChat: 'محادثة جديدة',
      quickActions: 'إجراءات سريعة',
      feelingAnxious: 'أشعر بالقلق',
      needToTalk: 'أحتاج للحديث',
      feelingSad: 'أشعر بالحزن',
      needCoping: 'أحتاج تقنيات المواجهة',
      helpfulTips: 'نصائح مفيدة',
      breathingExercise: 'تمرين التنفس',
      grounding: 'تقنية التأريض',
      positiveAffirmation: 'تأكيد إيجابي'
    },
    en: {
      title: 'AI Chat Support',
      subtitle: 'Chat with a supportive assistant. This is not medical advice.',
      placeholder: 'Type a message…',
      send: 'Send',
      typing: 'Assistant is typing…',
      empty: 'Start the conversation by typing your first message.',
      disclaimer: 'If you are in danger, contact emergency services (141 in Morocco).',
      newChat: 'New chat',
      quickActions: 'Quick Actions',
      feelingAnxious: 'I feel anxious',
      needToTalk: 'I need to talk',
      feelingSad: 'I feel sad',
      needCoping: 'Need coping techniques',
      helpfulTips: 'Helpful Tips',
      breathingExercise: 'Breathing exercise',
      grounding: 'Grounding technique',
      positiveAffirmation: 'Positive affirmation'
    }
  })[currentLang] || ({
    // Sensible defaults to keep UI usable if i18n isn't ready
    title: 'AI Chat Support',
    subtitle: 'Chat with a supportive assistant. This is not medical advice.',
    placeholder: 'Type a message…',
    send: 'Send',
    typing: 'Assistant is typing…',
    empty: 'Start the conversation by typing your first message.',
    disclaimer: 'If you are in danger, contact emergency services (141 in Morocco).',
    newChat: 'New chat',
    quickActions: 'Quick Actions',
    feelingAnxious: 'I feel anxious',
    needToTalk: 'I need to talk',
    feelingSad: 'I feel sad',
    needCoping: 'Need coping techniques',
    helpfulTips: 'Helpful Tips',
    breathingExercise: 'Breathing exercise',
    grounding: 'Grounding technique',
    positiveAffirmation: 'Positive affirmation'
  }), [currentLang]);

  useEffect(() => {
    // In test environments (jsdom), scrollIntoView may not be implemented
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isLoading, partialAi]);

  // Auto-hide suggestions after first user message
  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages.length]);

  // Update conversation stage based on message content and count
  useEffect(() => {
    if (messages.length === 0) {
      setConversationStage('greeting');
    } else if (messages.length <= 4) {
      setConversationStage('exploring');
    } else if (messages.length <= 10) {
      setConversationStage('supporting');
    } else {
      setConversationStage('closing');
    }
  }, [messages.length]);

  const logAiUsage = async (tokens = 0) => {
    try {
      if (!user?.id) return;
      await supabase.from('ai_usage_logs').insert({ user_id: user.id, tokens_used: tokens });
    } catch (_) {
      // ignore in dev/mock env
    }
  };

  // Optional DB persistence for messages (scaffolded for future use)
  const persistMessagesToDb = async (msgs) => {
    try {
      if (!user?.id) return;
      // Upsert only the last appended message to reduce bandwidth
      const last = msgs[msgs.length - 1];
      if (last) {
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          role: last.role,
          content: last.content
        });
      }
    } catch (_) {}
  };

  const logCrisis = async (snippet, level = 4) => {
    try {
      if (!user?.id) return;
      await supabase.from('crisis_support_records').insert({
        user_id: user.id,
        crisis_level: level,
        description: `Detected via AI chat (level ${level}): ${snippet?.slice(0, 120)}`,
        support_provided: 'Emergency overlay shown',
        professional_help_recommended: level >= 3
      });
    } catch (_) {
      // ignore
    }
  };

  // Enhanced crisis detection with graduated levels
  const detectCrisisLevel = (text = '') => {
    const t = text.toLowerCase();
    
    // Level 4: Immediate danger
    const immediateDanger = [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'suicidaire', 'me tuer', 'mettre fin à ma vie', 'veux mourir',
      'انتحار', 'أقتل نفسي', 'أنهي حياتي', 'أريد أن أموت'
    ];
    
    // Level 3: Self-harm intentions
    const selfHarm = [
      'self harm', 'cut myself', 'hurt myself',
      'me faire du mal', 'me couper', 'me blesser',
      'إيذاء نفسي', 'أجرح نفسي', 'أؤذي نفسي'
    ];
    
    // Level 2: Severe distress
    const severeDistress = [
      'hopeless', 'worthless', 'no point', 'give up',
      'sans espoir', 'inutile', 'abandonner',
      'فقدت الأمل', 'لا قيمة لي', 'أستسلم'
    ];
    
    if (immediateDanger.some(k => t.includes(k))) return 4;
    if (selfHarm.some(k => t.includes(k))) return 3;
    if (severeDistress.some(k => t.includes(k))) return 2;
    return 0;
  };

  // Detect mood from user text for contextual responses
  const detectMoodFromText = (text = '') => {
    const t = text.toLowerCase();
    
    const positive = ['happy', 'good', 'great', 'better', 'heureux', 'bien', 'mieux', 'سعيد', 'جيد', 'أفضل'];
    const negative = ['sad', 'angry', 'frustrated', 'tired', 'triste', 'fâché', 'fatigué', 'حزين', 'غاضب', 'متعب'];
    const anxious = ['anxious', 'worried', 'stressed', 'anxieux', 'inquiet', 'stressé', 'قلق', 'متوتر'];
    
    if (positive.some(k => t.includes(k))) return 'positive';
    if (anxious.some(k => t.includes(k))) return 'anxious';
    if (negative.some(k => t.includes(k))) return 'negative';
    return 'neutral';
  };

  // Build contextual prompts for better AI responses
  const buildContextualPrompt = (userText, stage, language) => {
    const contexts = {
      fr: {
        greeting: `L'utilisateur commence une conversation de soutien. Soyez chaleureux et accueillant. Message: "${userText}"`,
        exploring: `L'utilisateur explore ses sentiments. Posez des questions ouvertes et montrez de l'empathie. Message: "${userText}"`,
        supporting: `Conversation en cours. Offrez du soutien pratique et des techniques de gestion. Message: "${userText}"`,
        closing: `Conversation avancée. Résumez les insights et encouragez. Message: "${userText}"`
      },
      ar: {
        greeting: `المستخدم يبدأ محادثة للدعم. كن دافئًا ومرحبًا. الرسالة: "${userText}"`,
        exploring: `المستخدم يستكشف مشاعره. اطرح أسئلة مفتوحة وأظهر التعاطف. الرسالة: "${userText}"`,
        supporting: `المحادثة مستمرة. قدم الدعم العملي وتقنيات المواجهة. الرسالة: "${userText}"`,
        closing: `محادثة متقدمة. لخص الأفكار وشجع. الرسالة: "${userText}"`
      },
      en: {
        greeting: `User is starting a support conversation. Be warm and welcoming. Message: "${userText}"`,
        exploring: `User is exploring their feelings. Ask open questions and show empathy. Message: "${userText}"`,
        supporting: `Ongoing conversation. Offer practical support and coping techniques. Message: "${userText}"`,
        closing: `Advanced conversation. Summarize insights and encourage. Message: "${userText}"`
      }
    };
    
    return contexts[language]?.[stage] || userText;
  };

  // Error response based on language
  const getErrorResponse = (language) => {
    const responses = {
      fr: "Je suis désolé, j'ai rencontré une difficulté technique. Pouvez-vous reformuler votre message ?",
      ar: "أعتذر، واجهت صعوبة تقنية. هل يمكنك إعادة صياغة رسالتك؟",
      en: "I'm sorry, I encountered a technical difficulty. Could you rephrase your message?"
    };
    return responses[language] || responses.en;
  };

  const sendMessage = async (messageText = null) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const newUserMsg = { 
      id: crypto.randomUUID?.() || String(Date.now()), 
      role: 'user', 
      content: text, 
      time: new Date().toLocaleTimeString() 
    };
    setMessages(prev => [...prev, newUserMsg]);
    persistMessagesToDb([...(messages || []), newUserMsg]);
    
    // Only clear input if it came from the input field
    if (!messageText) {
      setInput('');
    }

    // Enhanced crisis detection with levels
    const crisisLevel = detectCrisisLevel(text);
    if (crisisLevel > 0) {
      setShowEmergency(true);
      logCrisis(text, crisisLevel);
    }

    setIsLoading(true);
    try {
      const lastTurns = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      
      // Add conversation context for better AI responses
      const contextualPrompt = buildContextualPrompt(text, conversationStage, i18n.language);
      
      setPartialAi('');

      if (typeof aiService.generateSuggestionsStream === 'function') {
        let acc = '';
        try {
          for await (const chunk of aiService.generateSuggestionsStream({ 
            language: i18n.language, 
            content: contextualPrompt, 
            history: lastTurns,
            mood: detectMoodFromText(text)
          })) {
            acc += chunk;
            setPartialAi(prev => prev + chunk);
          }
        } catch (_) {
          acc = '';
        }
        if (acc) {
          const aiMsg = { 
            id: crypto.randomUUID?.() || `ai-${Date.now()}`, 
            role: 'assistant', 
            content: acc, 
            time: new Date().toLocaleTimeString() 
          };
          setMessages(prev => [...prev, aiMsg]);
          persistMessagesToDb([...(messages || []), newUserMsg, aiMsg]);
          logAiUsage(50);
          setPartialAi('');
          return;
        }
      }

      // Non-stream fallback path
      const { data } = await aiService.generateSuggestions({ 
        language: i18n.language, 
        content: contextualPrompt, 
        force: true, 
        history: lastTurns,
        mood: detectMoodFromText(text)
      });
      const first = Array.isArray(data) && data[0] ? data[0] : { content: labels?.typing };
      const aiText = typeof first === 'string' ? first : first.content || labels?.typing;
      const aiMsg = { 
        id: crypto.randomUUID?.() || `ai-${Date.now()}`, 
        role: 'assistant', 
        content: aiText, 
        time: new Date().toLocaleTimeString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      persistMessagesToDb([...(messages || []), newUserMsg, aiMsg]);
      logAiUsage(50);
      setPartialAi('');
    } catch (e) {
      const aiMsg = { 
        id: crypto.randomUUID?.() || `ai-${Date.now()}`, 
        role: 'assistant', 
        content: getErrorResponse(i18n.language), 
        time: new Date().toLocaleTimeString() 
      };
      setMessages(prev => [...prev, aiMsg]);
      setPartialAi('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    const actions = {
      fr: {
        feelingAnxious: "Je me sens anxieux en ce moment et j'aimerais parler de ce que je ressens.",
        needToTalk: "J'ai besoin de parler à quelqu'un. Je traverse une période difficile.",
        feelingSad: "Je me sens triste aujourd'hui et je ne sais pas trop pourquoi.",
        needCoping: "Pouvez-vous me donner des techniques pour mieux gérer mes émotions ?",
        breathingExercise: "Pouvez-vous me guider dans un exercice de respiration ?",
        grounding: "J'ai besoin d'une technique d'ancrage pour me calmer.",
        positiveAffirmation: "Pouvez-vous partager une affirmation positive avec moi ?"
      },
      ar: {
        feelingAnxious: "أشعر بالقلق في الوقت الحالي وأود التحدث عما أشعر به.",
        needToTalk: "أحتاج للتحدث مع شخص ما. أمر بفترة صعبة.",
        feelingSad: "أشعر بالحزن اليوم ولا أعرف السبب تماماً.",
        needCoping: "هل يمكنك إعطائي تقنيات للتعامل مع مشاعري بشكل أفضل؟",
        breathingExercise: "هل يمكنك إرشادي في تمرين للتنفس؟",
        grounding: "أحتاج تقنية تأريض لأهدأ.",
        positiveAffirmation: "هل يمكنك مشاركة تأكيد إيجابي معي؟"
      },
      en: {
        feelingAnxious: "I'm feeling anxious right now and would like to talk about what I'm experiencing.",
        needToTalk: "I need to talk to someone. I'm going through a difficult time.",
        feelingSad: "I'm feeling sad today and I'm not sure why.",
        needCoping: "Can you give me some techniques to better manage my emotions?",
        breathingExercise: "Can you guide me through a breathing exercise?",
        grounding: "I need a grounding technique to calm down.",
        positiveAffirmation: "Can you share a positive affirmation with me?"
      }
    };
    
    const message = actions[i18n.language]?.[action] || actions.en[action];
    if (message) {
      sendMessage(message);
    }
  };

  // Quick suggestion components
  const QuickActionCard = ({ action, icon, text, variant = 'primary' }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleQuickAction(action)}
      className={`flex items-center gap-2 text-left justify-start h-auto py-2 px-3 ${
        variant === 'secondary' ? 'border-secondary/20 text-secondary' : ''
      }`}
    >
      <Icon name={icon} size={16} />
      <span className="text-xs">{text}</span>
    </Button>
  );

  const WelcomeMessage = () => (
    <div className="text-center py-8 px-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="MessageCircle" size={24} color="var(--color-primary)" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
        {labels.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {labels.subtitle}
      </p>
      
      {showSuggestions && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">{labels.quickActions}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <QuickActionCard 
                action="feelingAnxious" 
                icon="Zap" 
                text={labels.feelingAnxious} 
              />
              <QuickActionCard 
                action="needToTalk" 
                icon="MessageSquare" 
                text={labels.needToTalk} 
              />
              <QuickActionCard 
                action="feelingSad" 
                icon="Frown" 
                text={labels.feelingSad} 
              />
              <QuickActionCard 
                action="needCoping" 
                icon="Shield" 
                text={labels.needCoping} 
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">{labels.helpfulTips}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <QuickActionCard 
                action="breathingExercise" 
                icon="Wind" 
                text={labels.breathingExercise}
                variant="secondary"
              />
              <QuickActionCard 
                action="grounding" 
                icon="Anchor" 
                text={labels.grounding}
                variant="secondary"
              />
              <QuickActionCard 
                action="positiveAffirmation" 
                icon="Heart" 
                text={labels.positiveAffirmation}
                variant="secondary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-16 md:pb-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-soft-xl overflow-hidden">
          <div className="p-5 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
            <h1 className="text-2xl font-heading font-semibold text-foreground">{labels.title}</h1>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-sm font-body text-muted-foreground">{labels.subtitle}</p>
              <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem(`${LOCAL_KEY}:${user?.id || 'anon'}`); setMessages([]); }}>
                <Icon name="RotateCcw" size={14} className="mr-1" /> {labels.newChat}
              </Button>
            </div>
          </div>

          <div className="p-5 h-[55vh] overflow-y-auto">
            {messages.length === 0 && !isLoading ? (
              <WelcomeMessage />
            ) : (
              <div>
                {messages.map(m => (
                  <ChatBubble key={m.id} role={m.role} content={m.content} time={m.time} />
                ))}
                {(isLoading || partialAi) && (
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Icon name="Bot" size={16} color="var(--color-secondary)" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-2 max-w-[80%]">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        <span>{partialAi || labels.typing}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="chat-input" className="sr-only">{labels.placeholder || 'Type a message…'}</label>
                <textarea
                  id="chat-input"
                  name="chat_message"
                  aria-label={labels.placeholder || 'Type a message…'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={labels.placeholder || 'Type a message…'}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  disabled={isLoading}
                />
                {messages.length > 0 && conversationStage === 'supporting' && (
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleQuickAction('breathingExercise')}
                      className="text-xs"
                    >
                      <Icon name="Wind" size={12} className="mr-1" />
                      {labels.breathingExercise}
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleQuickAction('grounding')}
                      className="text-xs"
                    >
                      <Icon name="Anchor" size={12} className="mr-1" />
                      {labels.grounding}
                    </Button>
                  </div>
                )}
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                iconName="Send"
                iconPosition="left"
                className="shrink-0"
              >
                {labels.send}
              </Button>
            </div>
            <p className="text-xs font-caption text-muted-foreground mt-2">{labels.disclaimer}</p>
          </div>
        </div>
      </div>
      </main>
      <BottomNavigation />

      <EmergencyOverlay isVisible={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
};

export default Index;
