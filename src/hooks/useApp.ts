import { useUserStore } from '../stores/useUserStore'
import { useSubjectsStore } from '../stores/useSubjectsStore'
import { useTasksStore } from '../stores/useTasksStore'
import { useStudyStore } from '../stores/useStudyStore'
import { useSettingsStore } from '../stores/useSettingsStore'

/**
 * Compatibility layer that mimics the old useApp() hook
 * This hook aggregates all stores to provide the same API interface
 */
export function useApp() {
  // User store
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)
  const userLoading = useUserStore((state) => state.loading)

  // Subjects store
  const subjects = useSubjectsStore((state) => state.subjects)
  const exams = useSubjectsStore((state) => state.exams)
  const topics = useSubjectsStore((state) => state.topics)
  const resources = useSubjectsStore((state) => state.resources)
  const subjectsLoading = useSubjectsStore((state) => state.loading)

  const addSubject = useSubjectsStore((state) => state.addSubject)
  const updateSubject = useSubjectsStore((state) => state.updateSubject)
  const deleteSubject = useSubjectsStore((state) => state.deleteSubject)

  const addExam = useSubjectsStore((state) => state.addExam)
  const updateExam = useSubjectsStore((state) => state.updateExam)
  const deleteExam = useSubjectsStore((state) => state.deleteExam)

  const addTopic = useSubjectsStore((state) => state.addTopic)
  const addTopics = useSubjectsStore((state) => state.addTopics)
  const updateTopic = useSubjectsStore((state) => state.updateTopic)
  const deleteTopic = useSubjectsStore((state) => state.deleteTopic)

  const addResource = useSubjectsStore((state) => state.addResource)
  const updateResource = useSubjectsStore((state) => state.updateResource)
  const deleteResource = useSubjectsStore((state) => state.deleteResource)

  // Tasks store
  const tasks = useTasksStore((state) => state.tasks)
  const tasksLoading = useTasksStore((state) => state.loading)

  const addTask = useTasksStore((state) => state.addTask)
  const updateTask = useTasksStore((state) => state.updateTask)
  const deleteTask = useTasksStore((state) => state.deleteTask)

  // Study store
  const studyBlocks = useStudyStore((state) => state.studyBlocks)
  const focusSessions = useStudyStore((state) => state.focusSessions)
  const weeklyReviews = useStudyStore((state) => state.weeklyReviews)
  const stats = useStudyStore((state) => state.stats)
  const studyLoading = useStudyStore((state) => state.loading)

  const addStudyBlock = useStudyStore((state) => state.addStudyBlock)
  const addStudyBlocks = useStudyStore((state) => state.addStudyBlocks)
  const updateStudyBlock = useStudyStore((state) => state.updateStudyBlock)
  const deleteStudyBlock = useStudyStore((state) => state.deleteStudyBlock)

  const addFocusSession = useStudyStore((state) => state.addFocusSession)
  const updateFocusSession = useStudyStore((state) => state.updateFocusSession)

  const addWeeklyReview = useStudyStore((state) => state.addWeeklyReview)
  const getWeeklyReview = useStudyStore((state) => state.getWeeklyReview)

  // Settings store
  const settings = useSettingsStore((state) => state.settings)
  const settingsLoading = useSettingsStore((state) => state.loading)
  const updateSettings = useSettingsStore((state) => state.updateSettings)

  // Combined loading state
  const loading = userLoading || subjectsLoading || tasksLoading || studyLoading || settingsLoading

  // Refresh data - loads all stores
  const refreshData = async () => {
    await Promise.all([
      useUserStore.getState().loadUser(),
      useSubjectsStore.getState().loadData(),
      useTasksStore.getState().loadData(),
      useStudyStore.getState().loadData(),
      useSettingsStore.getState().loadSettings(),
    ])
  }

  return {
    // State
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

    // User methods
    setUser,

    // Subject methods
    addSubject,
    updateSubject,
    deleteSubject,

    // Exam methods
    addExam,
    updateExam,
    deleteExam,

    // Topic methods
    addTopic,
    addTopics,
    updateTopic,
    deleteTopic,

    // Resource methods
    addResource,
    updateResource,
    deleteResource,

    // Task methods
    addTask,
    updateTask,
    deleteTask,

    // Study block methods
    addStudyBlock,
    addStudyBlocks,
    updateStudyBlock,
    deleteStudyBlock,

    // Focus session methods
    addFocusSession,
    updateFocusSession,

    // Weekly review methods
    addWeeklyReview,
    getWeeklyReview,

    // Settings methods
    updateSettings,

    // Utility methods
    refreshData,
  }
}
