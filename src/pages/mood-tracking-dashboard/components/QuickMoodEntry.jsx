import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { moodService } from '../../../services/moodService';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickMoodEntry = ({ onMoodLogged }) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [activityTags, setActivityTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const moodOptions = [
    { value: 'very_low', label: 'Très faible', emoji: '😞', color: 'text-red-500' },
    { value: 'low', label: 'Faible', emoji: '😔', color: 'text-orange-500' },
    { value: 'neutral', label: 'Neutre', emoji: '😐', color: 'text-yellow-500' },
    { value: 'good', label: 'Bien', emoji: '😊', color: 'text-green-500' },
    { value: 'excellent', label: 'Excellent', emoji: '😄', color: 'text-emerald-500' }
  ];

  const commonTags = [
    'travail', 'famille', 'amis', 'sport', 'nature', 'lecture', 
    'musique', 'méditation', 'cuisine', 'repos', 'voyage', 'créativité'
  ];

  const toggleTag = (tag) => {
    setActivityTags(prev => 
      prev?.includes(tag) 
        ? prev?.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!selectedMood) {
      setError('Veuillez sélectionner une humeur');
      return;
    }

    if (!user?.id) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const moodData = {
        userId: user?.id,
        moodLevel: selectedMood,
        energyLevel,
        stressLevel,
        notes: notes?.trim() || null,
        activityTags,
        entryDate: new Date()?.toISOString()?.split('T')?.[0]
      };

      const result = await moodService?.createMoodEntry(moodData);
      
      if (!result?.success) {
        setError(result?.error);
        return;
      }

      setSuccess(true);
      
      // Reset form
      setSelectedMood('');
      setEnergyLevel(3);
      setStressLevel(3);
      setNotes('');
      setActivityTags([]);

      // Notify parent component
      onMoodLogged?.(result?.data);

      // Auto close after success
      setTimeout(() => {
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError('Erreur lors de l\'enregistrement de l\'humeur');
      console.error('Mood entry error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <Icon name="CheckCircle" size={48} color="var(--color-success)" className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Humeur enregistrée !</h3>
        <p className="text-muted-foreground">
          Merci de partager votre état d'esprit aujourd'hui.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center space-x-2">
          <Icon name="AlertCircle" size={16} color="var(--color-error)" />
          <span className="text-error text-sm">{error}</span>
        </div>
      )}
      {/* Mood Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Comment vous sentez-vous maintenant ?
        </label>
        <div className="grid grid-cols-5 gap-2">
          {moodOptions?.map((mood) => (
            <button
              key={mood?.value}
              type="button"
              onClick={() => setSelectedMood(mood?.value)}
              className={`p-3 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                selectedMood === mood?.value
                  ? 'border-primary bg-primary/10' :'border-border bg-background hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-1">{mood?.emoji}</div>
              <div className={`text-xs font-medium ${mood?.color}`}>
                {mood?.label}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Energy Level */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Niveau d'énergie ({energyLevel}/5)
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={energyLevel}
          onChange={(e) => setEnergyLevel(parseInt(e?.target?.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Faible</span>
          <span>Élevé</span>
        </div>
      </div>
      {/* Stress Level */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Niveau de stress ({stressLevel}/5)
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={stressLevel}
          onChange={(e) => setStressLevel(parseInt(e?.target?.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Détendu</span>
          <span>Stressé</span>
        </div>
      </div>
      {/* Activity Tags */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Activités/Contexte (optionnel)
        </label>
        <div className="flex flex-wrap gap-2">
          {commonTags?.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activityTags?.includes(tag)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Notes (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e?.target?.value)}
          placeholder="Qu'est-ce qui influence votre humeur aujourd'hui ?"
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {notes?.length}/500
        </div>
      </div>
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="default"
        disabled={!selectedMood || loading}
        className="w-full"
        iconName={loading ? "Loader2" : "Save"}
        iconPosition="left"
        iconSize={16}
      >
        {loading ? 'Enregistrement...' : 'Enregistrer mon humeur'}
      </Button>
    </form>
  );
};

export default QuickMoodEntry;