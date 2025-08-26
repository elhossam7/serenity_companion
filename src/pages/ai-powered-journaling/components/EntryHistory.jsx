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
    // Load mock journal entries
    const mockEntries = [
      {
        id: 1,
        date: new Date('2025-01-20'),
        title: language === 'fr' ? 'Réflexions du matin' : 'تأملات الصباح',
        preview: language === 'fr' ?'Aujourd\'hui, je me sens reconnaissant pour les petites choses de la vie. Le thé à la menthe de ce matin avait un goût particulièrement délicieux...' :'اليوم، أشعر بالامتنان للأشياء الصغيرة في الحياة. كان طعم الأتاي هذا الصباح لذيذاً بشكل خاص...',
        mood: 'positive',
        wordCount: 245,
        tags: ['gratitude', 'morning', 'tea']
      },
      {
        id: 2,
        date: new Date('2025-01-19'),
        title: language === 'fr' ? 'Défis au travail' : 'تحديات العمل',
        preview: language === 'fr' ?'La journée a été difficile au bureau. Je me sens dépassé par les nouvelles responsabilités, mais je sais que c\'est temporaire...' :'كان اليوم صعباً في المكتب. أشعر بالإرهاق من المسؤوليات الجديدة، لكنني أعلم أن هذا مؤقت...',
        mood: 'negative',
        wordCount: 189,
        tags: ['work', 'stress', 'challenges']
      },
      {
        id: 3,
        date: new Date('2025-01-18'),
        title: language === 'fr' ? 'Temps en famille' : 'وقت العائلة',
        preview: language === 'fr' ?'Nous avons passé l\'après-midi ensemble, toute la famille réunie autour d\'un tajine. Ces moments sont précieux...' :'قضينا بعد الظهر معاً، كل العائلة مجتمعة حول الطاجين. هذه اللحظات ثمينة...',
        mood: 'positive',
        wordCount: 312,
        tags: ['family', 'food', 'togetherness']
      },
      {
        id: 4,
        date: new Date('2025-01-17'),
        title: language === 'fr' ? 'Méditation du soir' : 'تأمل المساء',
        preview: language === 'fr' ?'J\'ai pris du temps pour méditer ce soir. La paix intérieure que je ressens maintenant est apaisante...' :'أخذت وقتاً للتأمل هذا المساء. السلام الداخلي الذي أشعر به الآن مهدئ...',
        mood: 'neutral',
        wordCount: 156,
        tags: ['meditation', 'peace', 'evening']
      },
      {
        id: 5,
        date: new Date('2025-01-16'),
        title: language === 'fr' ? 'Promenade dans la médina' : 'نزهة في المدينة القديمة',
        preview: language === 'fr' ?'Les ruelles de la médina m\'ont rappelé mon enfance. Chaque coin raconte une histoire...' :'أزقة المدينة القديمة ذكرتني بطفولتي. كل زاوية تحكي قصة...',
        mood: 'positive',
        wordCount: 278,
        tags: ['medina', 'memories', 'childhood']
      }
    ];

    setEntries(mockEntries);
    setFilteredEntries(mockEntries);
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
    return null;
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
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="md:hidden"
        >
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