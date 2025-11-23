import { create } from 'zustand'
import { StudyBlock, FocusSession, WeeklyReview, Stats } from '../types'
import { dexieDb } from '../lib/dexie-db'
import { generateId, getWeekStart } from '../utils/helpers'
import { calculateStreak } from '../lib/ai'
import { useSubjectsStore } from './useSubjectsStore'
import { calculateSessionXP, XP_AMOUNTS } from '../lib/gamification'
import { useGamificationStore } from './useGamificationStore'
import { triggerAchievementCheck } from '../lib/achievementChecker'

interface StudyState {
  studyBlocks: StudyBlock[]
  focusSessions: FocusSession[]
  weeklyReviews: WeeklyReview[]
  stats: Stats
  loading: boolean

  // Study block methods
  addStudyBlock: (block: Omit<StudyBlock, 'id' | 'createdAt'>) => Promise<void>
  addStudyBlocks: (blocks: Omit<StudyBlock, 'id' | 'createdAt'>[]) => Promise<void>
  updateStudyBlock: (id: string, updates: Partial<StudyBlock>) => Promise<void>
  deleteStudyBlock: (id: string) => Promise<void>

  // Focus session methods
  addFocusSession: (session: Omit<FocusSession, 'id' | 'createdAt'>) => Promise<void>
  updateFocusSession: (id: string, updates: Partial<FocusSession>) => Promise<void>
  deleteFocusSession: (id: string) => Promise<void>

  // Session Status (Global)
  currentSessionStatus: 'idle' | 'active' | 'ended'
  setSessionStatus: (status: 'idle' | 'active' | 'ended') => void

  // Weekly review methods
  addWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => Promise<void>
  getWeeklyReview: (weekStart: Date) => WeeklyReview | undefined

  // Stats
  calculateStats: () => void

  // Load data
  loadData: () => Promise<void>
}

export const useStudyStore = create<StudyState>((set, get) => ({
  studyBlocks: [],
  focusSessions: [],
  weeklyReviews: [],
  stats: {
    currentStreak: 0,
    weeklyMinutes: 0,
    totalSessions: 0,
  },
  loading: true,

  // Study block methods
  addStudyBlock: async (block) => {
    const newBlock: StudyBlock = {
      ...block,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.studyBlocks.add(newBlock)
    set((state) => ({ studyBlocks: [...state.studyBlocks, newBlock] }))
  },

  addStudyBlocks: async (blocksToAdd) => {
    const newBlocks: StudyBlock[] = blocksToAdd.map((block) => ({
      ...block,
      id: generateId(),
      createdAt: new Date(),
    }))

    await dexieDb.studyBlocks.bulkAdd(newBlocks)
    set((state) => ({ studyBlocks: [...state.studyBlocks, ...newBlocks] }))
  },

  updateStudyBlock: async (id, updates) => {
    const block = get().studyBlocks.find((b) => b.id === id)
    if (!block) return

    const updated = { ...block, ...updates }
    await dexieDb.studyBlocks.put(updated)
    set((state) => ({
      studyBlocks: state.studyBlocks.map((b) => (b.id === id ? updated : b)),
    }))
  },

  deleteStudyBlock: async (id) => {
    await dexieDb.studyBlocks.delete(id)
    set((state) => ({
      studyBlocks: state.studyBlocks.filter((b) => b.id !== id),
    }))
  },

  // Focus session methods
  addFocusSession: async (session) => {
    const newSession: FocusSession = {
      ...session,
      id: generateId(),
      createdAt: new Date(),
      topicIds: session.topicIds || [],
      pomodoroCount: session.pomodoroCount || 0,
      completed: session.completed ?? false,
      energyLevel: session.energyLevel,
    }
    await dexieDb.focusSessions.add(newSession)
    set((state) => {
      const focusSessions = [...state.focusSessions, newSession]
      return { focusSessions }
    })

    // Update topic last reviewed dates
    if (session.topicIds.length > 0) {
      const now = new Date()
      const { updateTopic } = useSubjectsStore.getState()
      await Promise.all(
        session.topicIds.map((topicId) =>
          updateTopic(topicId, { lastReviewed: now })
        )
      )
    }

    // Award XP if session is completed
    if (session.completed) {
      const xp = calculateSessionXP(session.durationMinutes)
      const gamificationStore = useGamificationStore.getState()
      await gamificationStore.awardXP(
        'study-session',
        xp,
        `Study session: ${session.durationMinutes} minutes`
      )
      // Update daily goal
      await gamificationStore.createOrUpdateTodayGoal(session.durationMinutes, 0)

      // Award streak bonus if applicable
      get().calculateStats()
      const { stats } = get()
      if (stats.currentStreak > 0) {
        await gamificationStore.awardXP(
          'streak-bonus',
          XP_AMOUNTS.STREAK_DAILY_BONUS,
          `Day ${stats.currentStreak} streak bonus`
        )
      }

      // Check for new achievements
      triggerAchievementCheck()
    }

    // Recalculate stats after adding session
    get().calculateStats()
  },

  updateFocusSession: async (id, updates) => {
    const session = get().focusSessions.find((s) => s.id === id)
    if (!session) return

    const updated = { ...session, ...updates }
    await dexieDb.focusSessions.put(updated)
    set((state) => ({
      focusSessions: state.focusSessions.map((s) => (s.id === id ? updated : s)),
    }))
  },

  deleteFocusSession: async (id) => {
    await dexieDb.focusSessions.delete(id)
    set((state) => ({
      focusSessions: state.focusSessions.filter((s) => s.id !== id),
    }))
    get().calculateStats()
  },

  currentSessionStatus: 'idle',
  setSessionStatus: (status) => set({ currentSessionStatus: status }),

  // Weekly review methods
  addWeeklyReview: async (review) => {
    const newReview: WeeklyReview = {
      ...review,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.weeklyReviews.add(newReview)
    set((state) => ({ weeklyReviews: [...state.weeklyReviews, newReview] }))
  },

  getWeeklyReview: (weekStart: Date) => {
    return get().weeklyReviews.find((r) => {
      const reviewStart = new Date(r.weekStart)
      reviewStart.setHours(0, 0, 0, 0)
      const targetStart = new Date(weekStart)
      targetStart.setHours(0, 0, 0, 0)
      return reviewStart.getTime() === targetStart.getTime()
    })
  },

  // Stats calculation
  calculateStats: () => {
    const { focusSessions } = get()
    const weekStart = getWeekStart()
    const weekSessions = focusSessions.filter((s) => {
      const sessionDate = new Date(s.startTime)
      return sessionDate >= weekStart
    })

    const weeklyMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const currentStreak = calculateStreak(focusSessions)

    set({
      stats: {
        currentStreak,
        weeklyMinutes,
        totalSessions: focusSessions.length,
      },
    })
  },

  // Load data
  loadData: async () => {
    try {
      const [studyBlocks, focusSessions, weeklyReviews] = await Promise.all([
        dexieDb.studyBlocks.toArray(),
        dexieDb.focusSessions.toArray(),
        dexieDb.weeklyReviews.toArray(),
      ])

      set({
        studyBlocks,
        focusSessions,
        weeklyReviews,
        loading: false,
      })

      // Calculate stats after loading data
      get().calculateStats()
    } catch (error) {
      console.error('Failed to load study data:', error)
      set({ loading: false })
    }
  },
}))
