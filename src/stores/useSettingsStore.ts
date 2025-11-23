import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings } from '../types'
import { dexieDb } from '../lib/dexie-db'

interface SettingsState {
  settings: AppSettings | null
  loading: boolean

  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      loading: true,

      updateSettings: async (newSettings) => {
        const current = get().settings
        if (!current) return

        const updated = { ...current, ...newSettings }
        await dexieDb.settings.put({ id: 'default', ...updated })
        set({ settings: updated })
      },

      loadSettings: async () => {
        try {
          const settingsData = await dexieDb.settings.get('default')
          if (settingsData) {
            const { id, ...settings } = settingsData
            set({ settings, loading: false })
          } else {
            // Create default settings
            const defaultSettings: AppSettings = {
              pomodoroDuration: 25,
              shortBreakDuration: 5,
              longBreakDuration: 15,
              pomodorosUntilLongBreak: 4,
              whiteNoiseEnabled: false,
              whiteNoiseType: 'none',
            }
            await dexieDb.settings.put({ id: 'default', ...defaultSettings })
            set({ settings: defaultSettings, loading: false })
          }
        } catch (error) {
          console.error('Failed to load settings:', error)
          set({ loading: false })
        }
      },
    }),
    {
      name: 'taskloom-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)
