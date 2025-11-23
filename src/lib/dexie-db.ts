import Dexie, { Table } from 'dexie'
import {
  User,
  Subject,
  Exam,
  Topic,
  Resource,
  Task,
  StudyBlock,
  FocusSession,
  WeeklyReview,
  AppSettings,
  UnlockedAchievement,
  DailyGoal,
  XPEvent,
} from '../types'

export class TaskLoomDatabase extends Dexie {
  users!: Table<User, string>
  subjects!: Table<Subject, string>
  exams!: Table<Exam, string>
  topics!: Table<Topic, string>
  resources!: Table<Resource, string>
  tasks!: Table<Task, string>
  studyBlocks!: Table<StudyBlock, string>
  focusSessions!: Table<FocusSession, string>
  weeklyReviews!: Table<WeeklyReview, string>
  settings!: Table<AppSettings & { id: string }, string>
  xpEvents!: Table<XPEvent, string>
  unlockedAchievements!: Table<UnlockedAchievement, string>
  dailyGoals!: Table<DailyGoal, string>

  constructor() {
    super('TaskLoomDB')

    // Version 3: Previous schema
    this.version(3).stores({
      users: 'id',
      subjects: 'id, createdAt',
      exams: 'id, subjectId, date',
      topics: 'id, subjectId',
      resources: 'id, subjectId',
      tasks: 'id, dueDate, status',
      studyBlocks: 'id, date',
      focusSessions: 'id, startTime, subjectId',
      weeklyReviews: 'id, weekStart',
      settings: 'id',
    })

    // Version 4: Add gamification tables
    this.version(4).stores({
      users: 'id',
      subjects: 'id, createdAt',
      exams: 'id, subjectId, date',
      topics: 'id, subjectId',
      resources: 'id, subjectId',
      tasks: 'id, dueDate, status',
      studyBlocks: 'id, date',
      focusSessions: 'id, startTime, subjectId',
      weeklyReviews: 'id, weekStart',
      settings: 'id',
      xpEvents: 'id, createdAt, type',
      unlockedAchievements: 'id, achievementId, unlockedAt',
      dailyGoals: 'id, date',
    }).upgrade(async (trans) => {
      // Upgrade existing users to have totalXP and level fields
      await trans.table('users').toCollection().modify((user: any) => {
        if (user.totalXP === undefined) {
          user.totalXP = 0
        }
        if (user.level === undefined) {
          user.level = 0
        }
      })
    })

    // Version 5: Remove legacy flashcard tables
    this.version(5).stores({
      users: 'id',
      subjects: 'id, createdAt',
      exams: 'id, subjectId, date',
      topics: 'id, subjectId',
      resources: 'id, subjectId',
      tasks: 'id, dueDate, status',
      studyBlocks: 'id, date',
      focusSessions: 'id, startTime, subjectId',
      weeklyReviews: 'id, weekStart',
      settings: 'id',
      xpEvents: 'id, createdAt, type',
      unlockedAchievements: 'id, achievementId, unlockedAt',
      dailyGoals: 'id, date',
      decks: null as any,
      flashcards: null as any,
      flashcardReviews: null as any,
    })
  }
}

// Create a singleton instance
export const dexieDb = new TaskLoomDatabase()

// Helper functions that match the old API
export const db = {
  // User methods
  async getUser(): Promise<User | undefined> {
    const users = await dexieDb.users.toArray()
    return users[0]
  },

  async saveUser(user: User): Promise<void> {
    await dexieDb.users.put(user)
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return dexieDb.subjects.toArray()
  },

  // Exams
  async getExamsBySubject(subjectId: string): Promise<Exam[]> {
    return dexieDb.exams.where('subjectId').equals(subjectId).toArray()
  },

  // Topics
  async getTopicsBySubject(subjectId: string): Promise<Topic[]> {
    return dexieDb.topics.where('subjectId').equals(subjectId).toArray()
  },

  // Resources
  async getResourcesBySubject(subjectId: string): Promise<Resource[]> {
    return dexieDb.resources.where('subjectId').equals(subjectId).toArray()
  },

  // Tasks
  async getTasksDueSoon(days: number = 7): Promise<Task[]> {
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + days)

    const allTasks = await dexieDb.tasks.toArray()
    return allTasks.filter((task) => {
      if (!task.dueDate || task.status === 'completed') return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= now && dueDate <= future
    })
  },

  async getTasksForToday(): Promise<Task[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const allTasks = await dexieDb.tasks.toArray()
    return allTasks.filter((task) => {
      if (!task.dueDate || task.status === 'completed') return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate < tomorrow
    })
  },

  // Study Blocks
  async getStudyBlocksForDate(date: Date): Promise<StudyBlock[]> {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    const allBlocks = await dexieDb.studyBlocks.toArray()
    return allBlocks.filter((block) => {
      const blockDate = new Date(block.date)
      blockDate.setHours(0, 0, 0, 0)
      return blockDate.getTime() === targetDate.getTime()
    })
  },

  async getStudyBlocksForWeek(weekStart: Date): Promise<StudyBlock[]> {
    const start = new Date(weekStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    const allBlocks = await dexieDb.studyBlocks.toArray()
    return allBlocks.filter((block) => {
      const blockDate = new Date(block.date)
      blockDate.setHours(0, 0, 0, 0)
      return blockDate >= start && blockDate < end
    })
  },

  // Focus Sessions
  async getFocusSessionsForWeek(weekStart: Date): Promise<FocusSession[]> {
    const start = new Date(weekStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    const allSessions = await dexieDb.focusSessions.toArray()
    return allSessions.filter((session) => {
      const sessionDate = new Date(session.startTime)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate >= start && sessionDate < end
    })
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const settings = await dexieDb.settings.get('default')
    if (settings) {
      const { id, ...appSettings } = settings
      return appSettings
    }

    // Default settings
    const defaultSettings: AppSettings = {
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      pomodorosUntilLongBreak: 4,
      whiteNoiseEnabled: false,
      whiteNoiseType: 'none',
    }

    await dexieDb.settings.put({ id: 'default', ...defaultSettings })
    return defaultSettings
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings()
    await dexieDb.settings.put({ id: 'default', ...current, ...settings })
  },

  // Generic CRUD operations (for compatibility)
  async add<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    const table = (dexieDb as any)[storeName] as Table<T, string>
    await table.put(item)
  },

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const table = (dexieDb as any)[storeName] as Table<T, string>
    return table.get(id)
  },

  async getAll<T>(storeName: string): Promise<T[]> {
    const table = (dexieDb as any)[storeName] as Table<T, string>
    return table.toArray()
  },

  async update<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    const table = (dexieDb as any)[storeName] as Table<T, string>
    await table.put(item)
  },

  async delete(storeName: string, id: string): Promise<void> {
    const table = (dexieDb as any)[storeName] as Table<any, string>
    await table.delete(id)
  },
}
