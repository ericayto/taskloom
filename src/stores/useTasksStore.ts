import { create } from 'zustand'
import { Task } from '../types'
import { dexieDb } from '../lib/dexie-db'
import { generateId } from '../utils/helpers'
import { calculateTaskXP } from '../lib/gamification'
import { useGamificationStore } from './useGamificationStore'
import { triggerAchievementCheck } from '../lib/achievementChecker'

interface TasksState {
  tasks: Task[]
  loading: boolean

  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  // Load data
  loadData: () => Promise<void>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: true,

  addTask: async (task) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.tasks.add(newTask)
    set((state) => ({ tasks: [...state.tasks, newTask] }))
  },

  updateTask: async (id, updates) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return

    const updated = { ...task, ...updates }
    await dexieDb.tasks.put(updated)
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }))

    // Award XP if task was just completed
    if (
      task.status !== 'completed' &&
      updated.status === 'completed'
    ) {
      const xp = calculateTaskXP(updated.priority)
      const gamificationStore = useGamificationStore.getState()
      await gamificationStore.awardXP(
        'task-completed',
        xp,
        `Completed: ${updated.title}`
      )
      // Update daily goal
      await gamificationStore.createOrUpdateTodayGoal(0, 1, 0)
      // Check for new achievements
      triggerAchievementCheck()
    }
  },

  deleteTask: async (id) => {
    await dexieDb.tasks.delete(id)
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
  },

  loadData: async () => {
    try {
      const tasks = await dexieDb.tasks.toArray()
      set({ tasks, loading: false })
    } catch (error) {
      console.error('Failed to load tasks:', error)
      set({ loading: false })
    }
  },
}))
