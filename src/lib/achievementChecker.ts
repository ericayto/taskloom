import { useGamificationStore } from '../stores/useGamificationStore'
import { useStudyStore } from '../stores/useStudyStore'
import { useTasksStore } from '../stores/useTasksStore'
import { useFlashcardStore } from '../stores/useFlashcardStore'
import { useToastStore } from '../stores/useToastStore'
import {
  ACHIEVEMENTS,
  checkAchievementUnlock,
  isEarlyBirdSession,
  isNightOwlSession,
  type AchievementCheckContext,
} from './gamification'
import { AchievementId } from '../types'
import { startOfWeek } from 'date-fns'

/**
 * Checks all achievements and unlocks any that are newly achieved
 */
export async function checkAndUnlockAchievements(): Promise<void> {
  const gamificationStore = useGamificationStore.getState()
  const toastStore = useToastStore.getState()

  // Build context for achievement checks
  const context = await buildAchievementContext()

  // Check each achievement
  for (const achievementId of Object.keys(ACHIEVEMENTS) as AchievementId[]) {
    // Skip if already unlocked
    if (gamificationStore.isAchievementUnlocked(achievementId)) {
      continue
    }

    // Check if achievement should be unlocked
    if (checkAchievementUnlock(achievementId, context)) {
      await gamificationStore.unlockAchievement(achievementId)

      // Show toast notification
      const achievement = ACHIEVEMENTS[achievementId]
      toastStore.addToast({
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `${achievement.name}: ${achievement.description}`,
        badge: achievement.badge,
        duration: 5000,
      })
    }
  }
}

/**
 * Builds the context object needed for achievement checks
 */
async function buildAchievementContext(): Promise<AchievementCheckContext> {
  const studyStore = useStudyStore.getState()
  const tasksStore = useTasksStore.getState()
  const flashcardStore = useFlashcardStore.getState()

  // Get all focus sessions
  const allSessions = studyStore.focusSessions

  // Calculate total minutes
  const totalMinutes = allSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  )

  // Calculate weekly minutes
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekSessions = allSessions.filter((s) => {
    const sessionDate = new Date(s.startTime)
    return sessionDate >= weekStart
  })
  const weeklyMinutes = weekSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  )

  // Check for early bird and night owl sessions
  const hasEarlyBirdSession = allSessions.some((s) =>
    isEarlyBirdSession(new Date(s.startTime))
  )
  const hasNightOwlSession = allSessions.some((s) =>
    isNightOwlSession(new Date(s.startTime))
  )

  // Count completed tasks
  const totalTasksCompleted = tasksStore.tasks.filter(
    (t) => t.status === 'completed'
  ).length

  // Count flashcard reviews
  const totalFlashcardsReviewed = flashcardStore.flashcardReviews.length

  return {
    totalSessions: allSessions.length,
    currentStreak: studyStore.stats.currentStreak,
    weeklyMinutes,
    totalMinutes,
    totalTasksCompleted,
    totalFlashcardsReviewed,
    hasEarlyBirdSession,
    hasNightOwlSession,
  }
}

/**
 * Hook to automatically check achievements after certain actions
 * Call this after completing tasks, sessions, or flashcard reviews
 */
export function triggerAchievementCheck(): void {
  // Use setTimeout to avoid blocking the UI
  setTimeout(() => {
    checkAndUnlockAchievements().catch((error) => {
      console.error('Failed to check achievements:', error)
    })
  }, 100)
}
