import { Achievement, AchievementId, Priority } from '../types'

// Achievement Definitions
export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  'first-session': {
    id: 'first-session',
    name: 'Getting Started',
    description: 'Complete your first focus session',
    badge: '🎯',
    category: 'session',
  },
  'streak-5': {
    id: 'streak-5',
    name: '5 Day Streak',
    description: 'Study for 5 consecutive days',
    badge: '🔥',
    category: 'streak',
  },
  'streak-10': {
    id: 'streak-10',
    name: '10 Day Streak',
    description: 'Study for 10 consecutive days',
    badge: '💪',
    category: 'streak',
  },
  'streak-30': {
    id: 'streak-30',
    name: '30 Day Streak',
    description: 'Study for 30 consecutive days',
    badge: '⭐',
    category: 'streak',
  },
  'weekly-10h': {
    id: 'weekly-10h',
    name: 'Productive Week',
    description: 'Study for 10 hours in a single week',
    badge: '📚',
    category: 'time',
  },
  'weekly-20h': {
    id: 'weekly-20h',
    name: 'Ultra Productive',
    description: 'Study for 20 hours in a single week',
    badge: '🚀',
    category: 'time',
  },
  'total-50h': {
    id: 'total-50h',
    name: '50 Hour Milestone',
    description: 'Accumulate 50 hours of total study time',
    badge: '🏆',
    category: 'time',
  },
  'total-100h': {
    id: 'total-100h',
    name: '100 Hour Champion',
    description: 'Accumulate 100 hours of total study time',
    badge: '👑',
    category: 'time',
  },
  'early-bird': {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a study session before 8am',
    badge: '🌅',
    category: 'session',
  },
  'night-owl': {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a study session after 10pm',
    badge: '🦉',
    category: 'session',
  },
  'task-master': {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 50 tasks',
    badge: '✅',
    category: 'task',
  },
  'flashcard-pro': {
    id: 'flashcard-pro',
    name: 'Flashcard Pro',
    description: 'Review 500 flashcards',
    badge: '🎴',
    category: 'flashcard',
  },
}

// XP Award Amounts
export const XP_AMOUNTS = {
  TASK_LOW_PRIORITY: 10,
  TASK_MEDIUM_PRIORITY: 25,
  TASK_HIGH_PRIORITY: 50,
  STUDY_MINUTE: 5,
  FLASHCARD_REVIEW: 5,
  STREAK_DAILY_BONUS: 25,
}

// Calculate XP for completing a task
export function calculateTaskXP(priority: Priority): number {
  switch (priority) {
    case 'low':
      return XP_AMOUNTS.TASK_LOW_PRIORITY
    case 'medium':
      return XP_AMOUNTS.TASK_MEDIUM_PRIORITY
    case 'high':
      return XP_AMOUNTS.TASK_HIGH_PRIORITY
    default:
      return XP_AMOUNTS.TASK_MEDIUM_PRIORITY
  }
}

// Calculate XP for a study session
export function calculateSessionXP(durationMinutes: number): number {
  return durationMinutes * XP_AMOUNTS.STUDY_MINUTE
}

// Calculate XP for reviewing flashcards
export function calculateFlashcardXP(cardsReviewed: number): number {
  return cardsReviewed * XP_AMOUNTS.FLASHCARD_REVIEW
}

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100))
}

// Calculate XP needed for next level
export function xpForLevel(level: number): number {
  return level * level * 100
}

// Calculate XP progress to next level
export function xpProgressToNextLevel(totalXP: number): {
  currentLevel: number
  currentLevelXP: number
  nextLevelXP: number
  progress: number // 0-1
} {
  const currentLevel = calculateLevel(totalXP)
  const currentLevelXP = xpForLevel(currentLevel)
  const nextLevelXP = xpForLevel(currentLevel + 1)
  const progress = (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)

  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progress,
  }
}

// Achievement Check Functions
export interface AchievementCheckContext {
  totalSessions: number
  currentStreak: number
  weeklyMinutes: number
  totalMinutes: number
  totalTasksCompleted: number
  totalFlashcardsReviewed: number
  hasEarlyBirdSession: boolean
  hasNightOwlSession: boolean
}

export function checkAchievementUnlock(
  achievementId: AchievementId,
  context: AchievementCheckContext
): boolean {
  switch (achievementId) {
    case 'first-session':
      return context.totalSessions >= 1
    case 'streak-5':
      return context.currentStreak >= 5
    case 'streak-10':
      return context.currentStreak >= 10
    case 'streak-30':
      return context.currentStreak >= 30
    case 'weekly-10h':
      return context.weeklyMinutes >= 600
    case 'weekly-20h':
      return context.weeklyMinutes >= 1200
    case 'total-50h':
      return context.totalMinutes >= 3000
    case 'total-100h':
      return context.totalMinutes >= 6000
    case 'early-bird':
      return context.hasEarlyBirdSession
    case 'night-owl':
      return context.hasNightOwlSession
    case 'task-master':
      return context.totalTasksCompleted >= 50
    case 'flashcard-pro':
      return context.totalFlashcardsReviewed >= 500
    default:
      return false
  }
}

// Check if a session is an early bird session (before 8am)
export function isEarlyBirdSession(startTime: Date): boolean {
  const hour = startTime.getHours()
  return hour < 8
}

// Check if a session is a night owl session (after 10pm)
export function isNightOwlSession(startTime: Date): boolean {
  const hour = startTime.getHours()
  return hour >= 22
}
