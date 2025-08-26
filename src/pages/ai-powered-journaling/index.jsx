import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import EmergencyOverlay from '../../components/ui/EmergencyOverlay';
import JournalEditor from './components/JournalEditor';
import AiAssistant from './components/AiAssistant';
import EntryHistory from './components/EntryHistory';
import JournalToolbar from './components/JournalToolbar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AiPoweredJournaling = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState('fr');
  const [journalContent, setJournalContent] = useState('');
  const [currentMood, setCurrentMood] = useState('neutral');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showEntryHistory, setShowEntryHistory] = useState(false);
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);

    // Load draft content
    const draftContent = localStorage.getItem('journal_draft');
    if (draftContent) {
      setJournalContent(draftContent);
    }

    // Set up document direction
    document.documentElement?.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
  }, [navigate, user]);

  useEffect(() => {
    // Update language when it changes globally
    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem('language') || 'fr';
      setLanguage(newLanguage);
      document.documentElement?.setAttribute('dir', newLanguage === 'ar' ? 'rtl' : 'ltr');
    };

    // Handle responsive AI assistant visibility
    const handleResize = () => {
    const isDesktop = window.innerWidth >= 1024;
    setShowAiAssistant(isDesktop);
    setShowEntryHistory(isDesktop);
    };

  // Set initial state based on current viewport
  handleResize();

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleContentChange = useCallback((content) => {
    setJournalContent(content);
  }, []);

  const handleMoodDetected = useCallback((mood) => {
    setCurrentMood(mood);
    
    // Trigger emergency overlay for severe negative sentiment
    if (mood === 'very_negative' || (mood === 'negative' && journalContent?.length > 500)) {
      const negativeKeywords = ['suicide', 'harm', 'hopeless', 'worthless', 'end it all'];
      const hasEmergencyKeywords = negativeKeywords?.some(keyword => 
        journalContent?.toLowerCase()?.includes(keyword)
      );
      
      if (hasEmergencyKeywords) {
        setShowEmergencyOverlay(true);
      }
    }
  }, [journalContent]);

  const handleSuggestionClick = useCallback((suggestionText) => {
    editorRef.current?.insertText?.(suggestionText);
  }, []);

  const handleEntrySelect = useCallback((entry) => {
    setJournalContent(entry?.content || entry?.preview);
    setCurrentMood(entry?.mood);
    setShowEntryHistory(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    
    // Simulate save operation
    setTimeout(() => {
      const entry = {
        id: Date.now(),
        content: journalContent,
        mood: currentMood,
        isPrivate: isPrivate,
        createdAt: new Date()?.toISOString(),
        language: language
      };
      
      // Save to localStorage (in real app, this would be API call)
      const existingEntries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
      existingEntries?.unshift(entry);
      localStorage.setItem('journal_entries', JSON.stringify(existingEntries));
      
      // Clear draft
      localStorage.removeItem('journal_draft');
      
      setIsSaving(false);
      
      // Show success feedback
      // In real app, you might show a toast notification
    }, 1500);
  }, [journalContent, currentMood, isPrivate, language]);

  const handleExport = useCallback((format) => {
    const exportData = {
      content: journalContent,
      mood: currentMood,
      date: new Date()?.toISOString(),
      language: language
    };

    switch (format) {
      case 'pdf':
        // In real app, generate PDF
        console.log('Exporting as PDF:', exportData);
        break;
      case 'txt':
        // Download as text file
        const blob = new Blob([journalContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-entry-${new Date()?.toISOString()?.split('T')?.[0]}.txt`;
        a?.click();
        URL.revokeObjectURL(url);
        break;
      case 'email':
        // Open email client
        const subject = encodeURIComponent('Journal Entry');
        const body = encodeURIComponent(journalContent);
        window.open(`mailto:?subject=${subject}&body=${body}`);
        break;
    }
  }, [journalContent, currentMood, language]);

  const handleMoodTag = useCallback((moodId) => {
    // Reuse toolbar for formatting actions
    if (typeof moodId === 'string' && moodId.startsWith('__format_')) {
      const action = moodId.replace('__format_', '').replace('__', '');
      editorRef.current?.applyFormat?.(action);
      return;
    }
    setCurrentMood(moodId);
  }, []);

  const handlePrivacyChange = useCallback((isPrivateValue) => {
    setIsPrivate(isPrivateValue);
  }, []);

  const translations = useMemo(() => ({
    fr: {
      title: 'Journal Assisté par IA',
      subtitle: 'Écrivez vos pensées avec un soutien culturellement sensible',
      newEntry: 'Nouvelle entrée',
      history: 'Historique',
      aiAssistant: 'Assistant IA'
    },
    ar: {
      title: 'المذكرات بمساعدة الذكاء الاصطناعي',
      subtitle: 'اكتب أفكارك مع الدعم الحساس ثقافياً',
      newEntry: 'مدخل جديد',
      history: 'السجل',
      aiAssistant: 'المساعد الذكي'
    }
  }), []);

  const t = translations?.[language];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-16 md:pb-0">
  <div className="h-[calc(100vh-4rem)] flex max-w-7xl mx-auto w-full px-2 lg:px-4 transition-all duration-300 ease-gentle">
          {/* Entry History Sidebar - Desktop */}
          <div className="hidden lg:block w-80">
            <EntryHistory
              language={language}
              isVisible={showEntryHistory}
              onToggle={() => setShowEntryHistory(!showEntryHistory)}
              onEntrySelect={handleEntrySelect}
            />
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ease-gentle ${showAiAssistant ? 'lg:pr-96' : ''}`}>
            {/* Page Header - Mobile */}
            <div className="lg:hidden p-4 bg-card border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-heading font-semibold text-foreground">
                  {t?.title}
                </h1>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEntryHistory(!showEntryHistory)}
                    title={t?.history}
                  >
                    <Icon name="History" size={20} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAiAssistant(!showAiAssistant)}
                    title={t?.aiAssistant}
                  >
                    <Icon name="Sparkles" size={20} />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground font-body">
                {t?.subtitle}
              </p>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex">
              <div className="flex-1 px-1 sm:px-2 lg:px-4">
                <JournalEditor
                  ref={editorRef}
                  content={journalContent}
                  onContentChange={handleContentChange}
                  language={language}
                  onMoodDetected={handleMoodDetected}
                />
              </div>
            </div>

            {/* Toolbar */}
            <JournalToolbar
              language={language}
              onSave={handleSave}
              onExport={handleExport}
              onMoodTag={handleMoodTag}
              onPrivacyChange={handlePrivacyChange}
              currentMood={currentMood}
              isPrivate={isPrivate}
              isSaving={isSaving}
            />
          </div>
        </div>

        {/* AI Assistant - Single instance for both desktop and mobile */}
        <AiAssistant
          language={language}
          currentMood={currentMood}
          isVisible={showAiAssistant}
          onToggle={() => setShowAiAssistant(!showAiAssistant)}
          onSuggestionGenerated={handleSuggestionClick}
          journalContent={journalContent}
        />

        {/* Entry History - Mobile overlay */}
        <div className="lg:hidden">
          <EntryHistory
            language={language}
            isVisible={showEntryHistory}
            onToggle={() => setShowEntryHistory(!showEntryHistory)}
            onEntrySelect={handleEntrySelect}
          />
          {!showEntryHistory && (
            <Button
              variant="primary"
              size="icon"
              onClick={() => setShowEntryHistory(true)}
              className="fixed bottom-20 left-4 z-40 shadow-soft-lg"
              title={t?.history}
            >
              <Icon name="History" size={20} />
            </Button>
          )}
        </div>
      </main>
      <BottomNavigation />
      {/* Desktop floating button to reopen history when hidden */}
      {!showEntryHistory && (
        <div className="hidden lg:block">
          <Button
            variant="primary"
            size="icon"
            onClick={() => setShowEntryHistory(true)}
            className="fixed bottom-24 left-6 z-40 shadow-soft-lg"
            title={t?.history}
          >
            <Icon name="History" size={20} />
          </Button>
        </div>
      )}
      <EmergencyOverlay
        isVisible={showEmergencyOverlay}
        onClose={() => setShowEmergencyOverlay(false)}
        triggerReason="crisis_detected"
      />
    </div>
  );
};

export default AiPoweredJournaling;