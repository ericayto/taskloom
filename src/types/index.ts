export type EducationStage = 'gcse' | 'alevels' | 'university' | 'other'

export type Priority = 'low' | 'medium' | 'high'

export type TaskStatus = 'pending' | 'in-progress' | 'completed'

export interface User {
  id: string
  name: string
  email: string
  educationStage: EducationStage
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
  type: 'link' | 'file' | 'note'
  url?: string
  content?: string
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
