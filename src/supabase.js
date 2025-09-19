// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// OAuth sign in functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// Traditional email/password auth (backup option)
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Profile management
export const getUserProfile = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: 'No user' }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}

export const updateUserProfile = async (updates) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user logged in')

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  return { data, error }
}

// Enhanced Profile management with preferences
export const getUserPreferences = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: 'No user' }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { data, error }
}

export const saveUserPreferences = async (preferences) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user logged in')

  // Try to update existing preferences first
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()
    return { data, error }
  } else {
    // Insert new preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        ...preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  }
}

// Tutorial and progress tracking
export const getTutorialProgress = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: 'No user' }

  const { data, error } = await supabase
    .from('user_tutorial_progress')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { data, error }
}

export const saveTutorialProgress = async (progress) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user logged in')

  const { data: existing } = await supabase
    .from('user_tutorial_progress')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('user_tutorial_progress')
      .update({
        ...progress,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()
    return { data, error }
  } else {
    const { data, error } = await supabase
      .from('user_tutorial_progress')
      .insert({
        user_id: user.id,
        ...progress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  }
}

// Score management functions with enhanced features
export const saveBestScore = async (levelId, score, metadata = {}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // First try to get existing score
  const { data: existing } = await supabase
    .from('user_scores')
    .select('best_score, total_attempts, metadata')
    .eq('user_id', user.id)
    .eq('level_id', levelId)
    .single()

  const newMetadata = {
    ...existing?.metadata,
    ...metadata,
    last_played: new Date().toISOString(),
    device_info: {
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    }
  }

  if (existing) {
    // Update if this is a better score
    if (score < existing.best_score) {
      const { data, error } = await supabase
        .from('user_scores')
        .update({ 
          best_score: score, 
          total_attempts: existing.total_attempts + 1,
          metadata: newMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('level_id', levelId)
        .select()
        .single()
      return { data, error }
    } else {
      // Just update attempt count and metadata
      const { data, error } = await supabase
        .from('user_scores')
        .update({ 
          total_attempts: existing.total_attempts + 1,
          metadata: newMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('level_id', levelId)
        .select()
        .single()
      return { data, error }
    }
  } else {
    // Insert new score
    const { data, error } = await supabase
      .from('user_scores')
      .insert({
        user_id: user.id,
        user_email: user.email,
        level_id: levelId,
        best_score: score,
        total_attempts: 1,
        metadata: newMetadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  }
}

export const getBestScore = async (levelId) => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: null }

  const { data, error } = await supabase
    .from('user_scores')
    .select('best_score, total_attempts, metadata, created_at, updated_at')
    .eq('user_id', user.id)
    .eq('level_id', levelId)
    .single()

  return { data, error }
}

export const getAllUserScores = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('user_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('level_id')

  return { data, error }
}

// Enhanced leaderboard functions
export const getGlobalLeaderboard = async (levelId, limit = 10) => {
  const { data, error } = await supabase
    .from('user_scores')
    .select(`
      best_score,
      total_attempts,
      created_at,
      updated_at,
      user_profiles!inner(display_name, avatar_url, country)
    `)
    .eq('level_id', levelId)
    .order('best_score', { ascending: true })
    .limit(limit)

  return { data, error }
}

export const getFriendsLeaderboard = async (levelId, friendIds, limit = 10) => {
  if (!friendIds || friendIds.length === 0) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('user_scores')
    .select(`
      best_score,
      total_attempts,
      user_id,
      user_profiles!inner(display_name, avatar_url)
    `)
    .eq('level_id', levelId)
    .in('user_id', friendIds)
    .order('best_score', { ascending: true })
    .limit(limit)

  return { data, error }
}

// Weekly/Monthly leaderboards
export const getTimeBasedLeaderboard = async (levelId, timeframe = 'week', limit = 10) => {
  const now = new Date()
  let startDate

  switch (timeframe) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7))
      break
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1))
      break
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1))
      break
    default:
      startDate = new Date(now.setDate(now.getDate() - 7))
  }

  const { data, error } = await supabase
    .from('user_scores')
    .select(`
      best_score,
      total_attempts,
      updated_at,
      user_profiles!inner(display_name, avatar_url)
    `)
    .eq('level_id', levelId)
    .gte('updated_at', startDate.toISOString())
    .order('best_score', { ascending: true })
    .limit(limit)

  return { data, error }
}

// User statistics and achievements
export const getUserStats = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: 'No user' }

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { data, error }
}

export const updateUserStats = async (stats) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user logged in')

  const { data: existing } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('user_stats')
      .update({
        ...existing,
        ...stats,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()
    return { data, error }
  } else {
    const { data, error } = await supabase
      .from('user_stats')
      .insert({
        user_id: user.id,
        ...stats,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  }
}

// Achievement system
export const getUserAchievements = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: 'No user' }

  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements!inner(*)
    `)
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })

  return { data, error }
}

export const unlockAchievement = async (achievementId, metadata = {}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user logged in')

  // Check if achievement already unlocked
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId)
    .single()

  if (existing) {
    return { data: existing, error: 'Achievement already unlocked' }
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: user.id,
      achievement_id: achievementId,
      metadata,
      unlocked_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Game session tracking
export const startGameSession = async (sessionData = {}) => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: 'No user' }

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      user_id: user.id,
      session_start: new Date().toISOString(),
      session_data: {
        ...sessionData,
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`
      }
    })
    .select()
    .single()

  return { data, error }
}

export const endGameSession = async (sessionId, sessionSummary = {}) => {
  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      session_end: new Date().toISOString(),
      session_summary: sessionSummary
    })
    .eq('id', sessionId)
    .select()
    .single()

  return { data, error }
}

// Accessibility preferences cloud sync
export const saveAccessibilityPreferences = async (preferences) => {
  return await saveUserPreferences({
    accessibility: preferences
  })
}

export const getAccessibilityPreferences = async () => {
  const { data, error } = await getUserPreferences()
  return {
    data: data?.accessibility || null,
    error
  }
}

// Settings management
export const saveGameSettings = async (settings) => {
  return await saveUserPreferences({
    game_settings: settings
  })
}

export const getGameSettings = async () => {
  const { data, error } = await getUserPreferences()
  return {
    data: data?.game_settings || null,
    error
  }
}

// Real-time subscriptions for multiplayer features
export const subscribeToLeaderboardUpdates = (levelId, callback) => {
  return supabase
    .channel(`leaderboard-${levelId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_scores',
        filter: `level_id=eq.${levelId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToUserUpdates = (userId, callback) => {
  return supabase
    .channel(`user-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Feedback and rating system
export const submitFeedback = async (feedbackData) => {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: user?.id || null,
      user_email: user?.email || null,
      ...feedbackData,
      submitted_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

export const rateLevelDifficulty = async (levelId, rating, comment = '') => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user logged in')

  const { data, error } = await supabase
    .from('level_ratings')
    .upsert({
      user_id: user.id,
      level_id: levelId,
      difficulty_rating: rating,
      comment,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Enhanced error handling and retry logic
const withRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}

// Export enhanced functions with retry logic
export const saveBestScoreWithRetry = (levelId, score, metadata) => 
  withRetry(() => saveBestScore(levelId, score, metadata))

export const getGlobalLeaderboardWithRetry = (levelId, limit) => 
  withRetry(() => getGlobalLeaderboard(levelId, limit))

// Batch operations for performance
export const batchUpdateScores = async (scores) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user logged in')

  const updates = scores.map(({ levelId, score, metadata }) => ({
    user_id: user.id,
    level_id: levelId,
    best_score: score,
    metadata: {
      ...metadata,
      batch_updated: true,
      updated_at: new Date().toISOString()
    }
  }))

  const { data, error } = await supabase
    .from('user_scores')
    .upsert(updates)
    .select()

  return { data, error }
}