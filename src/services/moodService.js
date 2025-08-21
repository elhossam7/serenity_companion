import { supabase } from '../lib/supabase';

export const moodService = {
  // Create a new mood entry
  async createMoodEntry(moodData) {
    try {
      const { data, error } = await supabase?.from('mood_entries')?.insert({
          mood_level: moodData?.moodLevel,
          energy_level: moodData?.energyLevel,
          stress_level: moodData?.stressLevel,
          sleep_hours: moodData?.sleepHours,
          notes: moodData?.notes,
          activity_tags: moodData?.activityTags || [],
          location: moodData?.location,
          weather: moodData?.weather,
          entry_date: moodData?.entryDate || new Date()?.toISOString()?.split('T')?.[0]
        })?.select()?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to create mood entry' }
    }
  },

  // Get mood entries for a user
  async getMoodEntries(userId, options = {}) {
    try {
      let query = supabase?.from('mood_entries')?.select('*')?.eq('user_id', userId)

      // Add date filtering if provided
      if (options?.startDate) {
        query = query?.gte('entry_date', options?.startDate)
      }
      if (options?.endDate) {
        query = query?.lte('entry_date', options?.endDate)
      }

      // Add limit if provided
      if (options?.limit) {
        query = query?.limit(options?.limit)
      }

      // Default ordering
      query = query?.order('entry_date', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to fetch mood entries' }
    }
  },

  // Get mood statistics
  async getMoodStats(userId, daysBack = 30) {
    try {
      const startDate = new Date()
      startDate?.setDate(startDate?.getDate() - daysBack)

      const { data: entries, error } = await supabase?.from('mood_entries')?.select('mood_level, energy_level, stress_level, entry_date')?.eq('user_id', userId)?.gte('entry_date', startDate?.toISOString()?.split('T')?.[0])?.order('entry_date', { ascending: false })

      if (error) {
        throw error
      }

      // Calculate statistics
      const stats = {
        totalEntries: entries?.length || 0,
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        moodDistribution: {
          very_low: 0,
          low: 0,
          neutral: 0,
          good: 0,
          excellent: 0
        },
        longestStreak: 0,
        currentStreak: 0
      }

      if (entries?.length > 0) {
        // Calculate averages
        const moodValues = entries?.map(entry => {
          switch (entry?.mood_level) {
            case 'very_low': return 1
            case 'low': return 2
            case 'neutral': return 3
            case 'good': return 4
            case 'excellent': return 5
            default: return 3
          }
        })

        stats.averageMood = moodValues?.reduce((sum, val) => sum + val, 0) / moodValues?.length
        stats.averageEnergy = entries?.reduce((sum, entry) => sum + (entry?.energy_level || 0), 0) / entries?.length
        stats.averageStress = entries?.reduce((sum, entry) => sum + (entry?.stress_level || 0), 0) / entries?.length

        // Calculate mood distribution
        entries?.forEach(entry => {
          if (stats?.moodDistribution?.[entry?.mood_level] !== undefined) {
            stats.moodDistribution[entry.mood_level]++
          }
        })

        // Calculate streaks (simplified version)
        const sortedEntries = entries?.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
        let currentStreak = 0
        let longestStreak = 0
        let lastDate = null

        sortedEntries?.forEach(entry => {
          const entryDate = new Date(entry.entry_date)
          
          if (lastDate && (entryDate - lastDate) === 24 * 60 * 60 * 1000) {
            // Consecutive day
            currentStreak++
          } else if (lastDate && (entryDate - lastDate) > 24 * 60 * 60 * 1000) {
            // Gap in streak
            longestStreak = Math.max(longestStreak, currentStreak)
            currentStreak = 1
          } else if (!lastDate) {
            // First entry
            currentStreak = 1
          }

          lastDate = entryDate
        })

        stats.longestStreak = Math.max(longestStreak, currentStreak)
        stats.currentStreak = currentStreak
      }

      return { success: true, data: stats }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to calculate mood statistics' }
    }
  },

  // Get mood insights using database function
  async getMoodInsights(userId, daysBack = 30) {
    try {
      const { data, error } = await supabase?.rpc('get_mood_insights', {
          user_uuid: userId,
          days_back: daysBack
        })

      if (error) {
        throw error
      }

      return { success: true, data: data?.[0] || null }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to get mood insights' }
    }
  },

  // Update mood entry
  async updateMoodEntry(entryId, userId, updateData) {
    try {
      const { data, error } = await supabase?.from('mood_entries')?.update({
          ...updateData,
          updated_at: new Date()?.toISOString()
        })?.eq('id', entryId)?.eq('user_id', userId)?.select()?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to update mood entry' }
    }
  },

  // Delete mood entry
  async deleteMoodEntry(entryId, userId) {
    try {
      const { error } = await supabase?.from('mood_entries')?.delete()?.eq('id', entryId)?.eq('user_id', userId)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to delete mood entry' }
    }
  }
}