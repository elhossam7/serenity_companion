import { supabase } from '../lib/supabase';
import { offlineCache } from '../utils/offlineCache';

export const journalService = {
  // Create a new journal entry
  async createJournalEntry(journalData) {
    try {
      const { data, error } = await supabase?.from('journal_entries')?.insert({
          title: journalData?.title,
          content: journalData?.content,
          entry_type: journalData?.entryType || 'free_writing',
          privacy_level: journalData?.privacyLevel || 'private',
          mood_before: journalData?.moodBefore,
          mood_after: journalData?.moodAfter,
          tags: journalData?.tags || [],
          word_count: journalData?.content ? journalData?.content?.split(' ')?.length : 0
        })?.select()?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to create journal entry' }
    }
  },

  // Get journal entries for a user
  async getJournalEntries(userId, options = {}) {
    try {
      let query = supabase?.from('journal_entries')?.select('*')?.eq('user_id', userId)

      // Add filtering options
      if (options?.entryType) {
        query = query?.eq('entry_type', options?.entryType)
      }
      if (options?.startDate) {
        query = query?.gte('created_at', options?.startDate)
      }
      if (options?.endDate) {
        query = query?.lte('created_at', options?.endDate)
      }
      if (options?.tags && options?.tags?.length > 0) {
        query = query?.contains('tags', options?.tags)
      }
      if (options?.onlyFavorites) {
        query = query?.eq('is_favorite', true)
      }

      // Add limit if provided
      if (options?.limit) {
        query = query?.limit(options?.limit)
      }

      // Default ordering
      query = query?.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }
      // Cache last successful read for offline usage
      offlineCache.set(userId, 'journal_entries', data || [])
      return { success: true, data: data || [] }
    } catch (error) {
      // Fallback to offline cache if available
      const cached = offlineCache.get(userId, 'journal_entries')
      if (cached) {
        return { success: true, data: cached, offline: true }
      }
      return { success: false, error: error?.message || 'Failed to fetch journal entries' }
    }
  },

  // Get a single journal entry
  async getJournalEntry(entryId, userId) {
    try {
      const { data, error } = await supabase?.from('journal_entries')?.select('*')?.eq('id', entryId)?.eq('user_id', userId)?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      // Try offline cache fallback
      const cached = offlineCache.get(userId, 'journal_entries')
      if (cached) {
        const found = cached.find(e => e?.id === entryId)
        if (found) return { success: true, data: found, offline: true }
      }
      return { success: false, error: error?.message || 'Failed to fetch journal entry' }
    }
  },

  // Update journal entry
  async updateJournalEntry(entryId, userId, updateData) {
    try {
      const updatedData = {
        ...updateData,
        updated_at: new Date()?.toISOString()
      }

      // Recalculate word count if content is updated
      if (updateData?.content) {
        updatedData.word_count = updateData?.content?.split(' ')?.length
      }

      const { data, error } = await supabase?.from('journal_entries')?.update(updatedData)?.eq('id', entryId)?.eq('user_id', userId)?.select()?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to update journal entry' }
    }
  },

  // Toggle favorite status
  async toggleFavorite(entryId, userId) {
    try {
      // First get current favorite status
      const { data: currentEntry, error: fetchError } = await supabase?.from('journal_entries')?.select('is_favorite')?.eq('id', entryId)?.eq('user_id', userId)?.single()

      if (fetchError) {
        throw fetchError
      }

      // Toggle the favorite status
      const { data, error } = await supabase?.from('journal_entries')?.update({ 
          is_favorite: !currentEntry?.is_favorite,
          updated_at: new Date()?.toISOString()
        })?.eq('id', entryId)?.eq('user_id', userId)?.select()?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to toggle favorite' }
    }
  },

  // Delete journal entry
  async deleteJournalEntry(entryId, userId) {
    try {
      const { error } = await supabase?.from('journal_entries')?.delete()?.eq('id', entryId)?.eq('user_id', userId)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to delete journal entry' }
    }
  },

  // Search journal entries
  async searchJournalEntries(userId, searchTerm, options = {}) {
    try {
      let query = supabase?.from('journal_entries')?.select('*')?.eq('user_id', userId)

      // Add search filters
      if (searchTerm) {
        query = query?.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      }

      // Add additional filters
      if (options?.entryType) {
        query = query?.eq('entry_type', options?.entryType)
      }
      if (options?.tags && options?.tags?.length > 0) {
        query = query?.contains('tags', options?.tags)
      }

      // Add limit if provided
      if (options?.limit) {
        query = query?.limit(options?.limit)
      }

      query = query?.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to search journal entries' }
    }
  },

  // Get journal statistics
  async getJournalStats(userId) {
    try {
      const { data, error } = await supabase?.from('journal_entries')?.select('entry_type, word_count, created_at, tags')?.eq('user_id', userId)

      if (error) {
        throw error
      }

      const stats = {
        totalEntries: data?.length || 0,
        totalWords: 0,
        averageWordsPerEntry: 0,
        entriesThisMonth: 0,
        entriesThisWeek: 0,
        entryTypeDistribution: {
          free_writing: 0,
          gratitude: 0,
          reflection: 0,
          goal_setting: 0
        },
        popularTags: {}
      }

      if (data?.length > 0) {
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        data?.forEach(entry => {
          const entryDate = new Date(entry.created_at)
          
          // Count words
          stats.totalWords += entry?.word_count || 0
          
          // Count entries by time period
          if (entryDate >= oneWeekAgo) {
            stats.entriesThisWeek++
          }
          if (entryDate >= oneMonthAgo) {
            stats.entriesThisMonth++
          }
          
          // Count by entry type
          if (stats?.entryTypeDistribution?.[entry?.entry_type] !== undefined) {
            stats.entryTypeDistribution[entry.entry_type]++
          }
          
          // Count popular tags
          entry?.tags?.forEach(tag => {
            stats.popularTags[tag] = (stats?.popularTags?.[tag] || 0) + 1
          })
        })

        stats.averageWordsPerEntry = Math.round(stats?.totalWords / data?.length)
      }

      return { success: true, data: stats }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to get journal statistics' }
    }
  }
}