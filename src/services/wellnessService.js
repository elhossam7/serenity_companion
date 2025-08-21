import { supabase } from '../lib/supabase';

export const wellnessService = {
  // Goals Management
  async createWellnessGoal(goalData) {
    try {
      const { data, error } = await supabase?.from('wellness_goals')?.insert({
          title: goalData?.title,
          description: goalData?.description,
          category: goalData?.category,
          target_value: goalData?.targetValue,
          target_date: goalData?.targetDate,
          reward_message: goalData?.rewardMessage
        })?.select()?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to create wellness goal' }
    }
  },

  async getWellnessGoals(userId, options = {}) {
    try {
      let query = supabase?.from('wellness_goals')?.select('*')?.eq('user_id', userId)

      if (options?.activeOnly) {
        query = query?.eq('is_active', true)
      }
      if (options?.completedOnly) {
        query = query?.eq('is_completed', true)
      }
      if (options?.category) {
        query = query?.eq('category', options?.category)
      }

      query = query?.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to fetch wellness goals' }
    }
  },

  async updateGoalProgress(goalId, userId, newValue) {
    try {
      // First get the current goal to check if it should be completed
      const { data: currentGoal, error: fetchError } = await supabase?.from('wellness_goals')?.select('target_value, current_value')?.eq('id', goalId)?.eq('user_id', userId)?.single()

      if (fetchError) {
        throw fetchError
      }

      const updateData = {
        current_value: newValue,
        updated_at: new Date()?.toISOString()
      }

      // Mark as completed if target reached
      if (newValue >= currentGoal?.target_value) {
        updateData.is_completed = true
        updateData.completed_at = new Date()?.toISOString()
      }

      const { data, error } = await supabase?.from('wellness_goals')?.update(updateData)?.eq('id', goalId)?.eq('user_id', userId)?.select()?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to update goal progress' }
    }
  },

  // Resources Management
  async getWellnessResources(options = {}) {
    try {
      let query = supabase?.from('wellness_resources')?.select('*')

      if (options?.category) {
        query = query?.eq('category', options?.category)
      }
      if (options?.featuredOnly) {
        query = query?.eq('is_featured', true)
      }
      if (options?.difficultyLevel) {
        query = query?.eq('difficulty_level', options?.difficultyLevel)
      }
      if (options?.maxDuration) {
        query = query?.lte('duration_minutes', options?.maxDuration)
      }

      query = query?.order('is_featured', { ascending: false })?.order('rating', { ascending: false })

      if (options?.limit) {
        query = query?.limit(options?.limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to fetch wellness resources' }
    }
  },

  async getResourceById(resourceId) {
    try {
      const { data, error } = await supabase?.from('wellness_resources')?.select('*')?.eq('id', resourceId)?.single()

      if (error) {
        throw error
      }

      // Increment view count
      await supabase?.from('wellness_resources')?.update({ view_count: (data?.view_count || 0) + 1 })?.eq('id', resourceId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to fetch resource' }
    }
  },

  // Resource Interactions
  async recordResourceInteraction(userId, resourceId, interactionData) {
    try {
      const { data, error } = await supabase?.from('user_resource_interactions')?.upsert({
          user_id: userId,
          resource_id: resourceId,
          interaction_type: interactionData?.type,
          rating: interactionData?.rating,
          progress_percentage: interactionData?.progress || 0,
          time_spent_minutes: interactionData?.timeSpent,
          notes: interactionData?.notes
        })?.select()?.single()

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to record interaction' }
    }
  },

  async getUserResourceInteractions(userId, options = {}) {
    try {
      let query = supabase?.from('user_resource_interactions')?.select(`
          *,
          wellness_resources (
            title,
            category,
            duration_minutes,
            thumbnail_url
          )
        `)?.eq('user_id', userId)

      if (options?.resourceId) {
        query = query?.eq('resource_id', options?.resourceId)
      }
      if (options?.interactionType) {
        query = query?.eq('interaction_type', options?.interactionType)
      }

      query = query?.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to fetch user interactions' }
    }
  },

  // Wellness Statistics
  async getWellnessStats(userId) {
    try {
      // Get goals stats
      const { data: goals } = await supabase?.from('wellness_goals')?.select('is_completed, is_active, category, created_at')?.eq('user_id', userId)

      // Get resource interactions stats
      const { data: interactions } = await supabase?.from('user_resource_interactions')?.select('interaction_type, time_spent_minutes, created_at')?.eq('user_id', userId)

      const stats = {
        goals: {
          total: goals?.length || 0,
          completed: goals?.filter(g => g?.is_completed)?.length || 0,
          active: goals?.filter(g => g?.is_active && !g?.is_completed)?.length || 0,
          completionRate: 0,
          categoriesWorkedOn: {}
        },
        resources: {
          totalInteractions: interactions?.length || 0,
          completedResources: interactions?.filter(i => i?.interaction_type === 'completed')?.length || 0,
          totalTimeSpent: interactions?.reduce((sum, i) => sum + (i?.time_spent_minutes || 0), 0) || 0,
          averageSessionLength: 0,
          interactionTypes: {}
        },
        streaks: {
          currentGoalStreak: 0,
          currentResourceStreak: 0
        }
      }

      // Calculate goal stats
      if (goals?.length > 0) {
        stats.goals.completionRate = Math.round((stats?.goals?.completed / stats?.goals?.total) * 100)
        
        goals?.forEach(goal => {
          const category = goal?.category || 'other'
          stats.goals.categoriesWorkedOn[category] = (stats?.goals?.categoriesWorkedOn?.[category] || 0) + 1
        })
      }

      // Calculate resource stats
      if (interactions?.length > 0) {
        stats.resources.averageSessionLength = Math.round(
          stats?.resources?.totalTimeSpent / interactions?.length
        )
        
        interactions?.forEach(interaction => {
          const type = interaction?.interaction_type || 'other'
          stats.resources.interactionTypes[type] = (stats?.resources?.interactionTypes?.[type] || 0) + 1
        })
      }

      return { success: true, data: stats }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to get wellness statistics' }
    }
  }
}