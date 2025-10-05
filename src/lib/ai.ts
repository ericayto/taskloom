import { Task, StudyBlock, Topic, WeeklyReview, FocusSession } from '../types'
import { startOfWeek, addDays, format } from 'date-fns'

// Mock AI functions - these would connect to real AI in production

export async function generateTopics(subjectName: string, examBoard?: string): Promise<string[]> {
  // Simulate AI delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock topic generation based on subject
  const topicSets: Record<string, string[]> = {
    maths: [
      'Algebra',
      'Geometry',
      'Trigonometry',
      'Calculus',
      'Statistics',
      'Probability',
      'Sequences & Series',
      'Functions',
    ],
    biology: [
      'Cell Biology',
      'Genetics',
      'Evolution',
      'Ecology',
      'Human Anatomy',
      'Plant Biology',
      'Microbiology',
      'Biochemistry',
    ],
    chemistry: [
      'Atomic Structure',
      'Chemical Bonding',
      'Organic Chemistry',
      'Inorganic Chemistry',
      'Physical Chemistry',
      'Thermodynamics',
      'Electrochemistry',
      'Kinetics',
    ],
    physics: [
      'Mechanics',
      'Electricity & Magnetism',
      'Waves & Optics',
      'Thermodynamics',
      'Modern Physics',
      'Nuclear Physics',
      'Quantum Mechanics',
      'Relativity',
    ],
    english: [
      'Literary Analysis',
      'Creative Writing',
      'Grammar & Syntax',
      'Poetry',
      'Shakespeare',
      'Modern Literature',
      'Essay Writing',
      'Critical Thinking',
    ],
    history: [
      'Ancient Civilizations',
      'Medieval Period',
      'Renaissance',
      'Industrial Revolution',
      'World Wars',
      'Cold War',
      'Modern History',
      'Social Movements',
    ],
  }

  const subjectKey = subjectName.toLowerCase()
  const topics = topicSets[subjectKey] || [
    'Introduction',
    'Core Concepts',
    'Advanced Topics',
    'Applications',
    'Review & Practice',
  ]

  return topics
}

export async function suggestWeeklyPlan(
  tasks: Task[],
  existingBlocks: StudyBlock[],
  availableHours: number = 20
): Promise<StudyBlock[]> {
  // Simulate AI delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  const suggestions: StudyBlock[] = []

  // Get tasks due this week, sorted by priority and due date
  const weekTasks = tasks
    .filter((t) => {
      if (!t.dueDate || t.status === 'completed') return false
      const dueDate = new Date(t.dueDate)
      return dueDate >= weekStart && dueDate <= addDays(weekStart, 7)
    })
    .sort((a, b) => {
      // Priority: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Then by due date
      return (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0)
    })

  // Create study blocks across the week
  const timeSlots = [
    { day: 1, time: '09:00', duration: 2 }, // Monday morning
    { day: 1, time: '14:00', duration: 2 }, // Monday afternoon
    { day: 2, time: '09:00', duration: 2 },
    { day: 2, time: '16:00', duration: 1.5 },
    { day: 3, time: '10:00', duration: 2 },
    { day: 3, time: '15:00', duration: 2 },
    { day: 4, time: '09:00', duration: 2 },
    { day: 4, time: '14:00', duration: 1.5 },
    { day: 5, time: '09:00', duration: 2 },
    { day: 5, time: '13:00', duration: 2 },
  ]

  let taskIndex = 0
  for (const slot of timeSlots) {
    if (taskIndex >= weekTasks.length) break

    const task = weekTasks[taskIndex]
    const blockDate = addDays(weekStart, slot.day - 1)
    const [hours, minutes] = slot.time.split(':').map(Number)
    const endHours = hours + Math.floor(slot.duration)
    const endMinutes = minutes + ((slot.duration % 1) * 60)

    suggestions.push({
      id: `block-${Date.now()}-${taskIndex}`,
      title: task.title,
      date: blockDate,
      startTime: slot.time,
      endTime: `${String(endHours).padStart(2, '0')}:${String(Math.floor(endMinutes)).padStart(2, '0')}`,
      subjectId: task.subjectId,
      taskIds: [task.id],
      completed: false,
      createdAt: new Date(),
    })

    taskIndex++
  }

  return suggestions
}

export async function generateWeeklySummary(
  sessions: FocusSession[],
  tasks: Task[],
  topics: Topic[]
): Promise<string> {
  // Simulate AI delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const totalTasks = tasks.length

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  // Find stale topics (not reviewed in 7+ days)
  const now = new Date()
  const staleTopics = topics.filter((topic) => {
    if (!topic.lastReviewed) return true
    const daysSince =
      (now.getTime() - new Date(topic.lastReviewed).getTime()) /
      (1000 * 60 * 60 * 24)
    return daysSince > 7
  })

  let summary = `Great work this week! You completed ${completedTasks} out of ${totalTasks} tasks and spent ${hours}h ${minutes}m in focused study. `

  if (sessions.length > 5) {
    summary += `Your consistency is impressive—${sessions.length} focus sessions shows real dedication. `
  } else if (sessions.length > 0) {
    summary += `You've built momentum with ${sessions.length} focus sessions. `
  }

  if (staleTopics.length > 0) {
    summary += `Consider reviewing ${staleTopics.slice(0, 3).map((t) => t.name).join(', ')} soon to keep them fresh. `
  }

  summary += `For next week, focus on maintaining your rhythm and tackling high-priority tasks early.`

  return summary
}

export function calculateStreak(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0

  // Sort sessions by date
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const session of sorted) {
    const sessionDate = new Date(session.startTime)
    sessionDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff === streak || (streak === 0 && daysDiff === 0)) {
      streak++
      currentDate = sessionDate
    } else {
      break
    }
  }

  return streak
}
