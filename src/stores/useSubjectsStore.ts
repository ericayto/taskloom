import { create } from 'zustand'
import { Subject, Exam, Topic, Resource } from '../types'
import { dexieDb } from '../lib/dexie-db'
import { generateId } from '../utils/helpers'

interface SubjectsState {
  subjects: Subject[]
  exams: Exam[]
  topics: Topic[]
  resources: Resource[]
  loading: boolean

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

  // Load data
  loadData: () => Promise<void>
}

export const useSubjectsStore = create<SubjectsState>((set, get) => ({
  subjects: [],
  exams: [],
  topics: [],
  resources: [],
  loading: true,

  // Subject methods
  addSubject: async (subject) => {
    const newSubject: Subject = {
      ...subject,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.subjects.add(newSubject)
    set((state) => ({ subjects: [...state.subjects, newSubject] }))
  },

  updateSubject: async (id, updates) => {
    const subject = get().subjects.find((s) => s.id === id)
    if (!subject) return

    const updated = { ...subject, ...updates }
    await dexieDb.subjects.put(updated)
    set((state) => ({
      subjects: state.subjects.map((s) => (s.id === id ? updated : s)),
    }))
  },

  deleteSubject: async (id) => {
    await dexieDb.subjects.delete(id)
    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
    }))
  },

  // Exam methods
  addExam: async (exam) => {
    const newExam: Exam = {
      ...exam,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.exams.add(newExam)
    set((state) => ({ exams: [...state.exams, newExam] }))
  },

  updateExam: async (id, updates) => {
    const exam = get().exams.find((e) => e.id === id)
    if (!exam) return

    const updated = { ...exam, ...updates }
    await dexieDb.exams.put(updated)
    set((state) => ({
      exams: state.exams.map((e) => (e.id === id ? updated : e)),
    }))
  },

  deleteExam: async (id) => {
    await dexieDb.exams.delete(id)
    set((state) => ({
      exams: state.exams.filter((e) => e.id !== id),
    }))
  },

  // Topic methods
  addTopic: async (topic) => {
    const newTopic: Topic = {
      ...topic,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.topics.add(newTopic)
    set((state) => ({ topics: [...state.topics, newTopic] }))
  },

  addTopics: async (topicsToAdd) => {
    const newTopics: Topic[] = topicsToAdd.map((topic) => ({
      ...topic,
      id: generateId(),
      createdAt: new Date(),
    }))

    await dexieDb.topics.bulkAdd(newTopics)
    set((state) => ({ topics: [...state.topics, ...newTopics] }))
  },

  updateTopic: async (id, updates) => {
    const topic = get().topics.find((t) => t.id === id)
    if (!topic) return

    const updated = { ...topic, ...updates }
    await dexieDb.topics.put(updated)
    set((state) => ({
      topics: state.topics.map((t) => (t.id === id ? updated : t)),
    }))
  },

  deleteTopic: async (id) => {
    await dexieDb.topics.delete(id)
    set((state) => ({
      topics: state.topics.filter((t) => t.id !== id),
    }))
  },

  // Resource methods
  addResource: async (resource) => {
    const newResource: Resource = {
      ...resource,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.resources.add(newResource)
    set((state) => ({ resources: [...state.resources, newResource] }))
  },

  updateResource: async (id, updates) => {
    const resource = get().resources.find((r) => r.id === id)
    if (!resource) return

    const updated = { ...resource, ...updates }
    await dexieDb.resources.put(updated)
    set((state) => ({
      resources: state.resources.map((r) => (r.id === id ? updated : r)),
    }))
  },

  deleteResource: async (id) => {
    await dexieDb.resources.delete(id)
    set((state) => ({
      resources: state.resources.filter((r) => r.id !== id),
    }))
  },

  // Load data
  loadData: async () => {
    try {
      const [subjects, exams, topics, resources] = await Promise.all([
        dexieDb.subjects.toArray(),
        dexieDb.exams.toArray(),
        dexieDb.topics.toArray(),
        dexieDb.resources.toArray(),
      ])

      set({
        subjects,
        exams,
        topics,
        resources,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to load subjects data:', error)
      set({ loading: false })
    }
  },
}))
