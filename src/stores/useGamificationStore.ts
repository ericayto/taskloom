import { create } from 'zustand'
import { UnlockedAchievement, DailyGoal, XPEvent, AchievementId } from '../types'
import { dexieDb } from '../lib/dexie-db'
import { generateId } from '../utils/helpers'
import { calculateLevel } from '../lib/gamification'

interface GamificationState {
  xpEvents: XPEvent[]
  unlockedAchievements: UnlockedAchievement[]
  dailyGoals: DailyGoal[]
  loading: boolean

  // XP Methods
  awardXP: (
    type: XPEvent['type'],
    amount: number,
    description: string
  ) => Promise<void>
  loadXPEvents: () => Promise<void>

  // Achievement Methods
  unlockAchievement: (achievementId: AchievementId) => Promise<void>
  loadUnlockedAchievements: () => Promise<void>
  isAchievementUnlocked: (achievementId: AchievementId) => boolean

  // Daily Goals Methods
  loadTodayGoal: () => Promise<void>
  updateTodayGoal: (updates: Partial<DailyGoal>) => Promise<void>
  createOrUpdateTodayGoal: (
    studyMinutes: number,
    tasksCompleted: number,
  ) => Promise<void>
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  xpEvents: [],
  unlockedAchievements: [],
  dailyGoals: [],
  loading: true,

  awardXP: async (type, amount, description) => {
    try {
      const xpEvent: XPEvent = {
        id: generateId(),
        type,
        amount,
        description,
        createdAt: new Date(),
      }

      await dexieDb.xpEvents.add(xpEvent)

      // Update user's total XP
      const user = await dexieDb.users.toArray()
      if (user[0]) {
        const newTotalXP = user[0].totalXP + amount
        const newLevel = calculateLevel(newTotalXP)
        await dexieDb.users.update(user[0].id, {
          totalXP: newTotalXP,
          level: newLevel,
        })
      }

      set((state) => ({
        xpEvents: [...state.xpEvents, xpEvent],
      }))
    } catch (error) {
      console.error('Failed to award XP:', error)
    }
  },

  loadXPEvents: async () => {
    try {
      const events = await dexieDb.xpEvents.toArray()
      set({ xpEvents: events, loading: false })
    } catch (error) {
      console.error('Failed to load XP events:', error)
      set({ loading: false })
    }
  },

  unlockAchievement: async (achievementId) => {
    try {
      // Check if already unlocked
      const existing = await dexieDb.unlockedAchievements
        .where('achievementId')
        .equals(achievementId)
        .first()

      if (existing) {
        return // Already unlocked
      }

      const unlockedAchievement: UnlockedAchievement = {
        id: generateId(),
        achievementId,
        unlockedAt: new Date(),
      }

      await dexieDb.unlockedAchievements.add(unlockedAchievement)

      set((state) => ({
        unlockedAchievements: [...state.unlockedAchievements, unlockedAchievement],
      }))
    } catch (error) {
      console.error('Failed to unlock achievement:', error)
    }
  },

  loadUnlockedAchievements: async () => {
    try {
      const achievements = await dexieDb.unlockedAchievements.toArray()
      set({ unlockedAchievements: achievements })
    } catch (error) {
      console.error('Failed to load unlocked achievements:', error)
    }
  },

  isAchievementUnlocked: (achievementId) => {
    const { unlockedAchievements } = get()
    return unlockedAchievements.some((a) => a.achievementId === achievementId)
  },

  loadTodayGoal: async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayGoal = await dexieDb.dailyGoals
        .where('date')
        .equals(today)
        .first()

      if (todayGoal) {
        set({ dailyGoals: [todayGoal] })
      } else {
        // Create default goal for today
        const newGoal: DailyGoal = {
          id: generateId(),
          date: today,
          studyMinutesGoal: 120, // 2 hours default
          studyMinutesActual: 0,
          tasksCompletedGoal: 3,
          tasksCompletedActual: 0,
          completed: false,
          createdAt: new Date(),
        }

        await dexieDb.dailyGoals.add(newGoal)
        set({ dailyGoals: [newGoal] })
      }
    } catch (error) {
      console.error('Failed to load today goal:', error)
    }
  },

  updateTodayGoal: async (updates) => {
    try {
      const { dailyGoals } = get()
      const todayGoal = dailyGoals[0]

      if (!todayGoal) {
        await get().loadTodayGoal()
        return
      }

      const updatedGoal = { ...todayGoal, ...updates }

      // Check if goal is completed
      const isCompleted =
        updatedGoal.studyMinutesActual >= updatedGoal.studyMinutesGoal &&
        updatedGoal.tasksCompletedActual >= updatedGoal.tasksCompletedGoal

      updatedGoal.completed = isCompleted

      await dexieDb.dailyGoals.update(todayGoal.id, updatedGoal)
      set({ dailyGoals: [updatedGoal] })
    } catch (error) {
      console.error('Failed to update today goal:', error)
    }
  },

  createOrUpdateTodayGoal: async (
    studyMinutes,
    tasksCompleted,
  ) => {
    try {
      const { dailyGoals } = get()
      const todayGoal = dailyGoals[0]

      if (!todayGoal) {
        await get().loadTodayGoal()
        return
      }

      await get().updateTodayGoal({
        studyMinutesActual: (todayGoal.studyMinutesActual || 0) + studyMinutes,
        tasksCompletedActual:
          (todayGoal.tasksCompletedActual || 0) + tasksCompleted,
      })
    } catch (error) {
      console.error('Failed to create or update today goal:', error)
    }
  },
}))
