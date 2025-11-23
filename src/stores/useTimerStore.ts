import { create } from 'zustand'

export type TimerState = 'idle' | 'work' | 'shortBreak' | 'longBreak'

interface TimerStoreState {
  timerState: TimerState
  timeLeft: number
  pomodorosCompleted: number
  sessionStartTime: Date | null
  isPaused: boolean
  selectedTask: string | null
  selectedSubject: string | null
  selectedTopics: string[]
  sessionNotes: string

  // Actions
  setTimerState: (state: TimerState) => void
  setTimeLeft: (time: number) => void
  decrementTimeLeft: () => void
  setPomodorosCompleted: (count: number) => void
  incrementPomodoros: () => void
  setSessionStartTime: (time: Date | null) => void
  setIsPaused: (paused: boolean) => void
  setSelectedTask: (taskId: string | null) => void
  setSelectedSubject: (subjectId: string | null) => void
  setSelectedTopics: (topicIds: string[]) => void
  setSessionNotes: (notes: string) => void
  resetTimer: () => void
}

export const useTimerStore = create<TimerStoreState>((set) => ({
  timerState: 'idle',
  timeLeft: 0,
  pomodorosCompleted: 0,
  sessionStartTime: null,
  isPaused: false,
  selectedTask: null,
  selectedSubject: null,
  selectedTopics: [],
  sessionNotes: '',

  setTimerState: (state) => set({ timerState: state }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  decrementTimeLeft: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
  setPomodorosCompleted: (count) => set({ pomodorosCompleted: count }),
  incrementPomodoros: () => set((state) => ({ pomodorosCompleted: state.pomodorosCompleted + 1 })),
  setSessionStartTime: (time) => set({ sessionStartTime: time }),
  setIsPaused: (paused) => set({ isPaused: paused }),
  setSelectedTask: (taskId) => set({ selectedTask: taskId }),
  setSelectedSubject: (subjectId) => set({ selectedSubject: subjectId }),
  setSelectedTopics: (topicIds) => set({ selectedTopics: topicIds }),
  setSessionNotes: (notes) => set({ sessionNotes: notes }),
  resetTimer: () =>
    set({
      timerState: 'idle',
      timeLeft: 0,
      pomodorosCompleted: 0,
      sessionStartTime: null,
      isPaused: false,
      selectedTask: null,
      selectedSubject: null,
      selectedTopics: [],
      sessionNotes: '',
    }),
}))
