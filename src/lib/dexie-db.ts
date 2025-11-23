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
  Deck,
  Flashcard,
  FlashcardReview,
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
  decks!: Table<Deck, string>
  flashcards!: Table<Flashcard, string>
  flashcardReviews!: Table<FlashcardReview, string>
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
      decks: 'id, parentDeckId, subjectId, topicId',
      flashcards: 'id, deckId, nextReviewDate, suspended',
      flashcardReviews: 'id, flashcardId, deckId, reviewedAt',
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
      decks: 'id, parentDeckId, subjectId, topicId',
      flashcards: 'id, deckId, nextReviewDate, suspended',
      flashcardReviews: 'id, flashcardId, deckId, reviewedAt',
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

  // Decks
  async getDecks(): Promise<Deck[]> {
    return dexieDb.decks.toArray()
  },

  async getDecksByParent(parentDeckId: string): Promise<Deck[]> {
    return dexieDb.decks.where('parentDeckId').equals(parentDeckId).toArray()
  },

  async getTopLevelDecks(): Promise<Deck[]> {
    const allDecks = await dexieDb.decks.toArray()
    return allDecks.filter((deck) => !deck.parentDeckId)
  },

  // Flashcards
  async getFlashcards(): Promise<Flashcard[]> {
    return dexieDb.flashcards.toArray()
  },

  async getFlashcardsByDeck(deckId: string, includeSubdecks = false): Promise<Flashcard[]> {
    if (!includeSubdecks) {
      return dexieDb.flashcards.where('deckId').equals(deckId).toArray()
    }

    // Get all subdecks recursively
    const deckIds = await this.getAllDeckIds(deckId)
    const allCards = await dexieDb.flashcards.toArray()
    return allCards.filter((card) => deckIds.includes(card.deckId))
  },

  async getAllDeckIds(deckId: string): Promise<string[]> {
    const ids = [deckId]
    const subdecks = await this.getDecksByParent(deckId)

    for (const subdeck of subdecks) {
      const subIds = await this.getAllDeckIds(subdeck.id)
      ids.push(...subIds)
    }

    return ids
  },

  async getFlashcardsDueForReview(deckId?: string): Promise<Flashcard[]> {
    const allCards = deckId
      ? await this.getFlashcardsByDeck(deckId, true)
      : await dexieDb.flashcards.toArray()

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return allCards.filter((card) => {
      if (card.suspended) return false
      const reviewDate = new Date(card.nextReviewDate)
      reviewDate.setHours(0, 0, 0, 0)
      return reviewDate <= now
    })
  },

  async getFlashcardReviews(flashcardId: string): Promise<FlashcardReview[]> {
    return dexieDb.flashcardReviews
      .where('flashcardId')
      .equals(flashcardId)
      .toArray()
  },

  async getFlashcardReviewsForToday(): Promise<FlashcardReview[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const allReviews = await dexieDb.flashcardReviews.toArray()
    return allReviews.filter((review) => {
      const reviewDate = new Date(review.reviewedAt)
      return reviewDate >= today && reviewDate < tomorrow
    })
  },

  async resetDeckProgress(deckId: string): Promise<void> {
    const cards = await this.getFlashcardsByDeck(deckId, true)
    const now = new Date()

    await dexieDb.transaction('rw', dexieDb.flashcards, async () => {
      for (const card of cards) {
        const resetCard: Flashcard = {
          ...card,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: now,
          lastReviewedAt: undefined,
        }
        await dexieDb.flashcards.put(resetCard)
      }
    })
  },

  async suspendCard(cardId: string, suspended: boolean): Promise<void> {
    const card = await dexieDb.flashcards.get(cardId)
    if (card) {
      await dexieDb.flashcards.put({ ...card, suspended })
    }
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
