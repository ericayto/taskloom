import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'
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
  Stats,
} from '../types'
import { generateId, getWeekStart } from '../utils/helpers'
import { calculateStreak } from '../lib/ai'

interface AppContextType {
  // State
  user: User | null
  subjects: Subject[]
  exams: Exam[]
  topics: Topic[]
  resources: Resource[]
  tasks: Task[]
  studyBlocks: StudyBlock[]
  focusSessions: FocusSession[]
  weeklyReviews: WeeklyReview[]
  settings: AppSettings | null
  stats: Stats
  loading: boolean

  // User methods
  setUser: (user: User) => Promise<void>

  // Subject methods
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Promise<void>
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>
  deleteSubject: (id: string) => Promise<void>

  // Exam methods
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => Promise<void>
  updateExam: (id: string, updates: Partial<Exam>) => Promise<void>
  deleteExam: (id: string) => Promise<void>

  // Topic methods
  addTopic: (topic: Omit<Topic, 'id' | 'createdAt'>) => Promise<void>
  addTopics: (topics: Omit<Topic, 'id' | 'createdAt'>[]) => Promise<void>
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>
  deleteTopic: (id: string) => Promise<void>

  // Resource methods
  addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => Promise<void>
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>
  deleteResource: (id: string) => Promise<void>

  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  // Study block methods
  addStudyBlock: (block: Omit<StudyBlock, 'id' | 'createdAt'>) => Promise<void>
  addStudyBlocks: (blocks: Omit<StudyBlock, 'id' | 'createdAt'>[]) => Promise<void>
  updateStudyBlock: (id: string, updates: Partial<StudyBlock>) => Promise<void>
  deleteStudyBlock: (id: string) => Promise<void>

  // Focus session methods
  addFocusSession: (session: Omit<FocusSession, 'id' | 'createdAt'>) => Promise<void>
  updateFocusSession: (id: string, updates: Partial<FocusSession>) => Promise<void>

  // Weekly review methods
  addWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => Promise<void>
  getWeeklyReview: (weekStart: Date) => WeeklyReview | undefined

  // Settings methods
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>

  // Utility methods
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([])
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([])
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [stats, setStats] = useState<Stats>({
    currentStreak: 0,
    weeklyMinutes: 0,
    totalSessions: 0,
  })
  const [loading, setLoading] = useState(true)

  // Initialize database and load data
  useEffect(() => {
    async function init() {
      try {
        await db.init()
        await refreshData()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Calculate stats when sessions change
  useEffect(() => {
    const weekStart = getWeekStart()
    const weekSessions = focusSessions.filter((s) => {
      const sessionDate = new Date(s.startTime)
      return sessionDate >= weekStart
    })

    const weeklyMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const currentStreak = calculateStreak(focusSessions)

    setStats({
      currentStreak,
      weeklyMinutes,
      totalSessions: focusSessions.length,
    })
  }, [focusSessions])

  const refreshData = useCallback(async () => {
    const [
      userData,
      subjectsData,
      examsData,
      topicsData,
      resourcesData,
      tasksData,
      blocksData,
      sessionsData,
      reviewsData,
      settingsData,
    ] = await Promise.all([
      db.getUser(),
      db.getAll<Subject>('subjects'),
      db.getAll<Exam>('exams'),
      db.getAll<Topic>('topics'),
      db.getAll<Resource>('resources'),
      db.getAll<Task>('tasks'),
      db.getAll<StudyBlock>('studyBlocks'),
      db.getAll<FocusSession>('focusSessions'),
      db.getAll<WeeklyReview>('weeklyReviews'),
      db.getSettings(),
    ])

    setUserState(userData || null)
    setSubjects(subjectsData)
    setExams(examsData)
    setTopics(topicsData)
    setResources(resourcesData)
    setTasks(tasksData)
    setStudyBlocks(blocksData)
    setFocusSessions(sessionsData)
    setWeeklyReviews(reviewsData)
    setSettings(settingsData)
  }, [])

  // User methods
  const setUser = useCallback(async (user: User) => {
    await db.saveUser(user)
    setUserState(user)
  }, [])

  // Subject methods
  const addSubject = useCallback(async (subject: Omit<Subject, 'id' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...subject,
      id: generateId(),
      createdAt: new Date(),
    }
    await db.add('subjects', newSubject)
    setSubjects((prev) => [...prev, newSubject])
  }, [])

  const updateSubject = useCallback(async (id: string, updates: Partial<Subject>) => {
    const subject = subjects.find((s) => s.id === id)
    if (!subject) return

    const updated = { ...subject, ...updates }
    await db.update('subjects', updated)
    setSubjects((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }, [subjects])

  const deleteSubject = useCallback(async (id: string) => {
    await db.delete('subjects', id)
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // Exam methods
  const addExam = useCallback(async (exam: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...exam,
      id: generateId(),
      createdAt: new Date(),
    }
    await db.add('exams', newExam)
    setExams((prev) => [...prev, newExam])
  }, [])

  const updateExam = useCallback(async (id: string, updates: Partial<Exam>) => {
    const exam = exams.find((e) => e.id === id)
    if (!exam) return

    const updated = { ...exam, ...updates }
    await db.update('exams', updated)
    setExams((prev) => prev.map((e) => (e.id === id ? updated : e)))
  }, [exams])

  const deleteExam = useCallback(async (id: string) => {
    await db.delete('exams', id)
    setExams((prev) => prev.filter((e) => e.id !== id))
  }, [])

  // Topic methods
  const addTopic = useCallback(async (topic: Omit<Topic, 'id' | 'createdAt'>) => {
    const newTopic: Topic = {
      ...topic,
      id: generateId(),
      createdAt: new Date(),
    }
    await db.add('topics', newTopic)
    setTopics((prev) => [...prev, newTopic])
  }, [])

  const addTopics = useCallback(async (topicsToAdd: Omit<Topic, 'id' | 'createdAt'>[]) => {
    const newTopics: Topic[] = topicsToAdd.map((topic) => ({
      ...topic,
      id: generateId(),
      createdAt: new Date(),
    }))

    await Promise.all(newTopics.map((topic) => db.add('topics', topic)))
    setTopics((prev) => [...prev, ...newTopics])
  }, [])

  const updateTopic = useCallback(async (id: string, updates: Partial<Topic>) => {
    const topic = topics.find((t) => t.id === id)
    if (!topic) return

    const updated = { ...topic, ...updates }
    await db.update('topics', updated)
    setTopics((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }, [topics])

  const deleteTopic = useCallback(async (id: string) => {
    await db.delete('topics', id)
    setTopics((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Resource methods
  const addResource = useCallback(async (resource: Omit<Resource, 'id' | 'createdAt'>) => {
    const newResource: Resource = {
      ...resource,
      id: generateId(),
      createdAt: new Date(),
    }
    await db.add('resources', newResource)
    setResources((prev) => [...prev, newResource])
  }, [])

  const updateResource = useCallback(async (id: string, updates: Partial<Resource>) => {
    const resource = resources.find((r) => r.id === id)
    if (!resource) return

    const updated = { ...resource, ...updates }
    await db.update('resources', updated)
    setResources((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }, [resources])

  const deleteResource = useCallback(async (id: string) => {
    await db.delete('resources', id)
    setResources((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // Task methods
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date(),
    }
    await db.add('tasks', newTask)
    setTasks((prev) => [...prev, newTask])
  }, [])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const updated = { ...task, ...updates }
    await db.update('tasks', updated)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }, [tasks])

  const deleteTask = useCallback(async (id: string) => {
    await db.delete('tasks', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Study block methods
  const addStudyBlock = useCallback(async (block: Omit<StudyBlock, 'id' | 'createdAt'>) => {
    const newBlock: StudyBlock = {
      ...block,
      id: generateId(),
      createdAt: new Date(),
    }
    await db.add('studyBlocks', newBlock)
    setStudyBlocks((prev) => [...prev, newBlock])
  }, [])

  const addStudyBlocks = useCallback(async (blocksToAdd: Omit<StudyBlock, 'id' | 'createdAt'>[]) => {
    const newBlocks: StudyBlock[] = blocksToAdd.map((block) => ({
      ...block,
      id: generateId(),
      createdAt: new Date(),
    }))

    await Promise.all(newBlocks.map((block) => db.add('studyBlocks', block)))
    setStudyBlocks((prev) => [...prev, ...newBlocks])
  }, [])

  const updateStudyBlock = useCallback(async (id: string, updates: Partial<StudyBlock>) => {
    const block = studyBlocks.find((b) => b.id === id)
    if (!block) return

    const updated = { ...block, ...updates }
    await db.update('studyBlocks', updated)
    setStudyBlocks((prev) => prev.map((b) => (b.id === id ? updated : b)))
  }, [studyBlocks])

  const deleteStudyBlock = useCallback(async (id: string) => {
    await db.delete('studyBlocks', id)
    setStudyBlocks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  // Focus session methods
  const addFocusSession = useCallback(async (session: Omit<FocusSession, 'id' | 'createdAt'>) => {
    const newSession: FocusSession = {
      ...session,
      id: generateId(),
      createdAt: new Date(),
    }
    await db.add('focusSessions', newSession)
    setFocusSessions((prev) => [...prev, newSession])

    // Update topic last reviewed dates
    if (session.topicIds.length > 0) {
      const now = new Date()
      await Promise.all(
        session.topicIds.map((topicId) =>
          updateTopic(topicId, { lastReviewed: now })
        )
      )
    }
  }, [])

  const updateFocusSession = useCallback(async (id: string, updates: Partial<FocusSession>) => {
    const session = focusSessions.find((s) => s.id === id)
    if (!session) return

    const updated = { ...session, ...updates }
    await db.update('focusSessions', updated)
    setFocusSessions((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }, [focusSessions])

  // Weekly review methods
  const addWeeklyReview = useCallback(async (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => {
    const newReview: WeeklyReview = {
      ...review,
      id: generateId(),
      createdAt: new Date(),
    }
    await db.add('weeklyReviews', newReview)
    setWeeklyReviews((prev) => [...prev, newReview])
  }, [])

  const getWeeklyReview = useCallback((weekStart: Date) => {
    return weeklyReviews.find((r) => {
      const reviewStart = new Date(r.weekStart)
      reviewStart.setHours(0, 0, 0, 0)
      const targetStart = new Date(weekStart)
      targetStart.setHours(0, 0, 0, 0)
      return reviewStart.getTime() === targetStart.getTime()
    })
  }, [weeklyReviews])

  // Settings methods
  const updateSettingsMethod = useCallback(async (newSettings: Partial<AppSettings>) => {
    await db.updateSettings(newSettings)
    setSettings((prev) => (prev ? { ...prev, ...newSettings } : null))
  }, [])

  const value: AppContextType = {
    user,
    subjects,
    exams,
    topics,
    resources,
    tasks,
    studyBlocks,
    focusSessions,
    weeklyReviews,
    settings,
    stats,
    loading,
    setUser,
    addSubject,
    updateSubject,
    deleteSubject,
    addExam,
    updateExam,
    deleteExam,
    addTopic,
    addTopics,
    updateTopic,
    deleteTopic,
    addResource,
    updateResource,
    deleteResource,
    addTask,
    updateTask,
    deleteTask,
    addStudyBlock,
    addStudyBlocks,
    updateStudyBlock,
    deleteStudyBlock,
    addFocusSession,
    updateFocusSession,
    addWeeklyReview,
    getWeeklyReview,
    updateSettings: updateSettingsMethod,
    refreshData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
