import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const EntryHistory = ({ language, isVisible, onToggle, onEntrySelect }) => {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');
  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    // Load saved journal entries from localStorage
    try {
      const raw = localStorage.getItem('journal_entries');
      const list = raw ? JSON.parse(raw) : [];
      const normalized = (list || []).map(e => ({
        id: e.id,
        date: new Date(e.createdAt || e.date || Date.now()),
        title: e.title || (language === 'fr' ? 'Entrée' : 'مدخل'),
        preview: e.content?.slice(0, 200) || e.preview || '',
        mood: e.mood || 'neutral',
        wordCount: (e.content || e.preview || '').trim().split(/\s+/).filter(Boolean).length,
        tags: Array.isArray(e.tags) ? e.tags : []
      }));
      setEntries(normalized);
      setFilteredEntries(normalized);
    } catch (_) {
      setEntries([]);
      setFilteredEntries([]);
    }

    const onSaved = () => {
      try {
        const raw = localStorage.getItem('journal_entries');
        const list = raw ? JSON.parse(raw) : [];
        const normalized = (list || []).map(e => ({
          id: e.id,
          date: new Date(e.createdAt || e.date || Date.now()),
          title: e.title || (language === 'fr' ? 'Entrée' : 'مدخل'),
          preview: e.content?.slice(0, 200) || e.preview || '',
          mood: e.mood || 'neutral',
          wordCount: (e.content || e.preview || '').trim().split(/\s+/).filter(Boolean).length,
          tags: Array.isArray(e.tags) ? e.tags : []
        }));
        setEntries(normalized);
        setFilteredEntries(prev => {
          // If a filter/search is active, reapply it by triggering the other effect with updated entries
          return normalized;
        });
      } catch (_) {}
    };

    window.addEventListener('journal:entry:saved', onSaved);
    return () => window.removeEventListener('journal:entry:saved', onSaved);
  }, [language]);

  useEffect(() => {
    let filtered = entries;

    // Filter by search query
    if (searchQuery?.trim()) {
      filtered = filtered?.filter(entry =>
        entry?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        entry?.preview?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        entry?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
      );
    }

    // Filter by mood
    if (selectedMoodFilter !== 'all') {
      filtered = filtered?.filter(entry => entry?.mood === selectedMoodFilter);
    }

    setFilteredEntries(filtered);
  }, [entries, searchQuery, selectedMoodFilter]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-MA' : 'ar-MA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })?.format(date);
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'positive':
        return 'Smile';
      case 'negative':
        return 'Frown';
      default:
        return 'Meh';
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const translations = {
    fr: {
      history: 'Historique',
      search: 'Rechercher dans vos entrées...',
      allMoods: 'Toutes les humeurs',
      positive: 'Positif',
      negative: 'Négatif',
      neutral: 'Neutre',
      words: 'mots',
      noEntries: 'Aucune entrée trouvée',
      noEntriesDesc: 'Essayez de modifier vos critères de recherche.',
      loadEntry: 'Charger cette entrée'
    },
    ar: {
      history: 'السجل',
      search: 'البحث في مدخلاتك...',
      allMoods: 'جميع الحالات المزاجية',
      positive: 'إيجابي',
      negative: 'سلبي',
      neutral: 'محايد',
      words: 'كلمة',
      noEntries: 'لم يتم العثور على مدخلات',
      noEntriesDesc: 'حاول تعديل معايير البحث.',
      loadEntry: 'تحميل هذا المدخل'
    }
  };

  const t = translations?.[language];

  if (!isVisible) {
    return (
      <>
        {/* Hidden state: no panel, just return null; the open button is controlled at page level */}
        <span className="sr-only">History closed</span>
      </>
    );
  }

  return (
    <div className={`
      fixed inset-y-0 left-0 w-80 bg-card border-r border-border z-30
      md:relative md:w-full md:border-r md:z-auto
      transform transition-transform duration-300 ease-gentle
      ${isVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="History" size={20} color="var(--color-primary)" />
          <h3 className="font-heading font-semibold text-foreground">
            {t?.history}
          </h3>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <Icon name="X" size={16} />
        </Button>
      </div>
      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b border-border">
        <Input
          type="search"
          placeholder={t?.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          className="w-full"
        />
        
        <div className="flex space-x-2">
          {['all', 'positive', 'neutral', 'negative']?.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMoodFilter(mood)}
              className={`
                px-3 py-1 rounded-full text-xs font-caption transition-colors
                ${selectedMoodFilter === mood
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {mood === 'all' ? t?.allMoods : t?.[mood]}
            </button>
          ))}
        </div>
      </div>
      {/* Entries List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEntries?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Icon name="Search" size={32} color="var(--color-muted-foreground)" className="mb-3" />
            <p className="text-sm font-body text-muted-foreground text-center mb-1">
              {t?.noEntries}
            </p>
            <p className="text-xs font-caption text-muted-foreground text-center">
              {t?.noEntriesDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredEntries?.map((entry) => (
              <div
                key={entry?.id}
                className="p-4 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/50 last:border-b-0"
                onClick={() => onEntrySelect(entry)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-body font-medium text-foreground text-sm line-clamp-1">
                    {entry?.title}
                  </h4>
                  <Icon 
                    name={getMoodIcon(entry?.mood)} 
                    size={14} 
                    className={getMoodColor(entry?.mood)}
                  />
                </div>
                
                <p className="text-xs font-caption text-muted-foreground mb-2">
                  {formatDate(entry?.date)}
                </p>
                
                <p className="text-sm font-body text-muted-foreground line-clamp-2 mb-3">
                  {entry?.preview}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-caption text-muted-foreground">
                    {entry?.wordCount} {t?.words}
                  </span>
                  
                  <div className="flex flex-wrap gap-1">
                    {entry?.tags?.slice(0, 2)?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-caption rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryHistory;