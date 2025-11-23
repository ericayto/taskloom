export type EducationStage = 'gcse' | 'alevels' | 'university' | 'other'

export type Priority = 'low' | 'medium' | 'high'

export type TaskStatus = 'pending' | 'in-progress' | 'completed'

export interface User {
  id: string
  name: string
  email: string
  educationStage: EducationStage
  totalXP: number
  level: number
  createdAt: Date
}

export interface Subject {
  id: string
  name: string
  color: string
  emoji?: string
  examBoard?: string
  decoration?: 'shimmer' | 'emoji-drift'
  decorationEmoji?: string
  gradientHue?: number // 0-360 for hue rotation
  createdAt: Date
}

export interface Exam {
  id: string
  subjectId: string
  name: string
  date: Date
  time?: string // HH:mm format
  createdAt: Date
}

export type TopicConfidence = 'not-started' | 'struggling' | 'moderate' | 'confident' | 'mastered'

export interface Topic {
  id: string
  subjectId: string
  name: string
  group?: string
  parentTopicId?: string // For nested topics
  order?: number
  lastReviewed?: Date
  confidence?: TopicConfidence
  createdAt: Date
}

export interface Resource {
  id: string
  subjectId: string
  name: string
  type: 'link' | 'file' | 'note' | 'folder'
  url?: string
  content?: string
  parentFolderId?: string
  createdAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  subjectId?: string
  priority: Priority
  status: TaskStatus
  dueDate?: Date
  estimatedMinutes?: number
  completedAt?: Date
  createdAt: Date
}

export interface StudyBlock {
  id: string
  title: string
  date: Date
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  subjectId?: string
  taskIds: string[]
  completed: boolean
  createdAt: Date
}

export interface FocusSession {
  id: string
  taskId?: string
  subjectId?: string
  topicIds: string[]
  startTime: Date
  endTime?: Date
  durationMinutes: number
  notes?: string
  energyLevel?: 'low' | 'medium' | 'high'
  pomodoroCount: number
  completed: boolean
  createdAt: Date
}

export interface WeeklyReview {
  id: string
  weekStart: Date
  weekEnd: Date
  totalMinutes: number
  sessionsCompleted: number
  deadlinesMet: number
  deadlinesMissed: number
  wentWell: string
  needsAttention: string
  topPriority: string
  aiSummary: string
  createdAt: Date
}

export interface AppSettings {
  pomodoroDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  pomodorosUntilLongBreak: number
  whiteNoiseEnabled: boolean
  whiteNoiseType: 'rain' | 'cafe' | 'nature' | 'none'
}

export interface DaySchedule {
  date: Date
  blocks: StudyBlock[]
  tasks: Task[]
}

export interface Stats {
  currentStreak: number
  weeklyMinutes: number
  totalSessions: number
}

export type FlashcardDifficulty = 'again' | 'hard' | 'good' | 'easy'

export interface Deck {
  id: string
  name: string
  description?: string
  color?: string
  parentDeckId?: string // For subdecks
  subjectId?: string
  topicId?: string
  order?: number
  createdAt: Date
}

export interface Flashcard {
  id: string
  deckId: string
  front: string
  back: string
  easeFactor: number // SM-2 ease factor (default: 2.5)
  interval: number // Days until next review (default: 0)
  repetitions: number // Number of successful repetitions (default: 0)
  nextReviewDate: Date
  lastReviewedAt?: Date
  suspended: boolean // Cards can be temporarily suspended
  createdAt: Date
}

export interface FlashcardReview {
  id: string
  flashcardId: string
  deckId: string
  difficulty: FlashcardDifficulty
  previousEaseFactor: number
  newEaseFactor: number
  previousInterval: number
  newInterval: number
  reviewedAt: Date
}

export interface DeckStats {
  deckId: string
  totalCards: number
  newCards: number
  learningCards: number
  matureCards: number
  dueToday: number
  totalReviews: number
  averageEaseFactor: number
}

// Gamification Types
export type AchievementId =
  | 'first-session'
  | 'streak-5'
  | 'streak-10'
  | 'streak-30'
  | 'weekly-10h'
  | 'weekly-20h'
  | 'total-50h'
  | 'total-100h'
  | 'early-bird'
  | 'night-owl'
  | 'task-master'
  | 'flashcard-pro'

export interface Achievement {
  id: AchievementId
  name: string
  description: string
  badge: string // emoji
  category: 'session' | 'streak' | 'time' | 'task' | 'flashcard'
}

export interface UnlockedAchievement {
  id: string
  achievementId: AchievementId
  unlockedAt: Date
}

export interface DailyGoal {
  id: string
  date: Date // normalized to start of day
  studyMinutesGoal: number
  studyMinutesActual: number
  tasksCompletedGoal: number
  tasksCompletedActual: number
  flashcardsReviewedGoal: number
  flashcardsReviewedActual: number
  completed: boolean
  createdAt: Date
}

export interface XPEvent {
  id: string
  type: 'task-completed' | 'study-session' | 'flashcard-reviewed' | 'streak-bonus'
  amount: number
  description: string
  createdAt: Date
}
