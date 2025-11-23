import { create } from 'zustand'
import { User } from '../types'
import { dexieDb } from '../lib/dexie-db'

interface UserState {
  user: User | null
  loading: boolean
  setUser: (user: User) => Promise<void>
  loadUser: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,

  setUser: async (user: User) => {
    await dexieDb.users.put(user)
    set({ user })
  },

  loadUser: async () => {
    try {
      const users = await dexieDb.users.toArray()
      set({ user: users[0] || null, loading: false })
    } catch (error) {
      console.error('Failed to load user:', error)
      set({ loading: false })
    }
  },
}))
