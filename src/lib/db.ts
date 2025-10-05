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
} from '../types'

const DB_NAME = 'TaskLoomDB'
const DB_VERSION = 1

class Database {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('subjects')) {
          const subjectStore = db.createObjectStore('subjects', { keyPath: 'id' })
          subjectStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
        if (!db.objectStoreNames.contains('exams')) {
          const examStore = db.createObjectStore('exams', { keyPath: 'id' })
          examStore.createIndex('subjectId', 'subjectId', { unique: false })
          examStore.createIndex('date', 'date', { unique: false })
        }
        if (!db.objectStoreNames.contains('topics')) {
          const topicStore = db.createObjectStore('topics', { keyPath: 'id' })
          topicStore.createIndex('subjectId', 'subjectId', { unique: false })
        }
        if (!db.objectStoreNames.contains('resources')) {
          const resourceStore = db.createObjectStore('resources', { keyPath: 'id' })
          resourceStore.createIndex('subjectId', 'subjectId', { unique: false })
        }
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
          taskStore.createIndex('dueDate', 'dueDate', { unique: false })
          taskStore.createIndex('status', 'status', { unique: false })
        }
        if (!db.objectStoreNames.contains('studyBlocks')) {
          const blockStore = db.createObjectStore('studyBlocks', { keyPath: 'id' })
          blockStore.createIndex('date', 'date', { unique: false })
        }
        if (!db.objectStoreNames.contains('focusSessions')) {
          const sessionStore = db.createObjectStore('focusSessions', { keyPath: 'id' })
          sessionStore.createIndex('startTime', 'startTime', { unique: false })
          sessionStore.createIndex('subjectId', 'subjectId', { unique: false })
        }
        if (!db.objectStoreNames.contains('weeklyReviews')) {
          const reviewStore = db.createObjectStore('weeklyReviews', { keyPath: 'id' })
          reviewStore.createIndex('weekStart', 'weekStart', { unique: false })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }
      }
    })
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized')
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // Generic CRUD operations
  async add<T>(storeName: string, item: T): Promise<void> {
    const store = this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.add(item)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const store = this.getStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = this.getStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async update<T>(storeName: string, item: T): Promise<void> {
    const store = this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(item)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const store = this.getStore(storeName)
    const index = store.index(indexName)
    return new Promise((resolve, reject) => {
      const request = index.getAll(value)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Specific methods
  async getUser(): Promise<User | undefined> {
    const users = await this.getAll<User>('users')
    return users[0]
  }

  async saveUser(user: User): Promise<void> {
    const existing = await this.getUser()
    if (existing) {
      await this.update('users', user)
    } else {
      await this.add('users', user)
    }
  }

  async getSubjects(): Promise<Subject[]> {
    return this.getAll<Subject>('subjects')
  }

  async getExamsBySubject(subjectId: string): Promise<Exam[]> {
    return this.getByIndex<Exam>('exams', 'subjectId', subjectId)
  }

  async getTopicsBySubject(subjectId: string): Promise<Topic[]> {
    return this.getByIndex<Topic>('topics', 'subjectId', subjectId)
  }

  async getResourcesBySubject(subjectId: string): Promise<Resource[]> {
    return this.getByIndex<Resource>('resources', 'subjectId', subjectId)
  }

  async getTasksDueSoon(days: number = 7): Promise<Task[]> {
    const allTasks = await this.getAll<Task>('tasks')
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + days)

    return allTasks.filter((task) => {
      if (!task.dueDate || task.status === 'completed') return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= now && dueDate <= future
    })
  }

  async getTasksForToday(): Promise<Task[]> {
    const allTasks = await this.getAll<Task>('tasks')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return allTasks.filter((task) => {
      if (!task.dueDate || task.status === 'completed') return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate < tomorrow
    })
  }

  async getStudyBlocksForDate(date: Date): Promise<StudyBlock[]> {
    const allBlocks = await this.getAll<StudyBlock>('studyBlocks')
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    return allBlocks.filter((block) => {
      const blockDate = new Date(block.date)
      blockDate.setHours(0, 0, 0, 0)
      return blockDate.getTime() === targetDate.getTime()
    })
  }

  async getStudyBlocksForWeek(weekStart: Date): Promise<StudyBlock[]> {
    const allBlocks = await this.getAll<StudyBlock>('studyBlocks')
    const start = new Date(weekStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    return allBlocks.filter((block) => {
      const blockDate = new Date(block.date)
      blockDate.setHours(0, 0, 0, 0)
      return blockDate >= start && blockDate < end
    })
  }

  async getFocusSessionsForWeek(weekStart: Date): Promise<FocusSession[]> {
    const allSessions = await this.getAll<FocusSession>('focusSessions')
    const start = new Date(weekStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    return allSessions.filter((session) => {
      const sessionDate = new Date(session.startTime)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate >= start && sessionDate < end
    })
  }

  async getSettings(): Promise<AppSettings> {
    const settings = await this.get<AppSettings>('settings', 'default')
    if (settings) return settings

    // Default settings
    const defaultSettings: AppSettings = {
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      pomodorosUntilLongBreak: 4,
      whiteNoiseEnabled: false,
      whiteNoiseType: 'none',
    }

    await this.add('settings', { id: 'default', ...defaultSettings })
    return defaultSettings
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings()
    await this.update('settings', { id: 'default', ...current, ...settings })
  }
}

export const db = new Database()
