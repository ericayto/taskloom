import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { useState, useEffect, useRef } from 'react'
import { formatDuration } from '../utils/helpers'
import { DotLoader } from '../components/ui/dot-loader'
import { CustomSelect } from '../components/ui/custom-select'
import { TaskSearchSelect } from '../components/ui/task-search-select'

type TimerState = 'idle' | 'work' | 'shortBreak' | 'longBreak'

// Pong animation frames for the dot loader
const pongGame = [
    [14, 7, 0, 8, 6, 13, 20],
    [14, 7, 13, 20, 16, 27, 21],
    [14, 20, 27, 21, 34, 24, 28],
    [27, 21, 34, 28, 41, 32, 35],
    [34, 28, 41, 35, 48, 40, 42],
    [34, 28, 41, 35, 48, 42, 46],
    [34, 28, 41, 35, 48, 42, 38],
    [34, 28, 41, 35, 48, 30, 21],
    [34, 28, 41, 48, 21, 22, 14],
    [34, 28, 41, 21, 14, 16, 27],
    [34, 28, 21, 14, 10, 20, 27],
    [28, 21, 14, 4, 13, 20, 27],
    [28, 21, 14, 12, 6, 13, 20],
    [28, 21, 14, 6, 13, 20, 11],
    [28, 21, 14, 6, 13, 20, 10],
    [14, 6, 13, 20, 9, 7, 21],
]

const Focus = () => {
  const {
    tasks,
    subjects,
    topics,
    resources,
    settings,
    addFocusSession,
    updateTask,
  } = useApp()

  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timeLeft, setTimeLeft] = useState(0)
  const [pomodorosCompleted, setpomodorosCompleted] = useState(0)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [sessionNotes, setSessionNotes] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [showResources, setShowResources] = useState(false)
  const [totalSessionMinutes, setTotalSessionMinutes] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const pomodoroDuration = settings?.pomodoroDuration || 25
  const shortBreakDuration = settings?.shortBreakDuration || 5
  const longBreakDuration = settings?.longBreakDuration || 15
  const pomodorosUntilLongBreak = settings?.pomodorosUntilLongBreak || 4

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress')
  const selectedTaskData = tasks.find((t) => t.id === selectedTask)
  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject)
  const subjectTopics = topics.filter((t) => t.subjectId === selectedSubject)
  const subjectResources = resources.filter((r) => r.subjectId === selectedSubject)

  useEffect(() => {
    if (timerState !== 'idle' && timeLeft > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerState, timeLeft, isPaused])

  const handleTimerComplete = () => {
    if (timerState === 'work') {
      const newCount = pomodorosCompleted + 1
      setpomodorosCompleted(newCount)

      // Auto-start break
      if (newCount % pomodorosUntilLongBreak === 0) {
        setTimerState('longBreak')
        setTimeLeft(longBreakDuration * 60)
      } else {
        setTimerState('shortBreak')
        setTimeLeft(shortBreakDuration * 60)
      }
    } else {
      // Break completed, ready for next pomodoro
      setTimerState('idle')
      setTimeLeft(0)
    }
  }

  const startFocusSession = () => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date())
    }
    setTimerState('work')
    setTimeLeft(pomodoroDuration * 60)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    setIsPaused(true)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const resumeTimer = () => {
    setIsPaused(false)
  }

  const resetSession = () => {
    setTimerState('idle')
    setTimeLeft(0)
    setpomodorosCompleted(0)
    setSessionStartTime(null)
    setTotalSessionMinutes(0)
    setSelectedTask(null)
    setSelectedSubject(null)
    setSelectedTopics([])
    setSessionNotes('')
    setIsPaused(false)
  }

  const completeSession = async () => {
    if (!sessionStartTime) return

    const duration = pomodorosCompleted * pomodoroDuration

    await addFocusSession({
      taskId: selectedTask || undefined,
      subjectId: selectedSubject || undefined,
      topicIds: selectedTopics,
      startTime: sessionStartTime,
      endTime: new Date(),
      durationMinutes: duration,
      notes: sessionNotes || undefined,
      pomodoroCount: pomodorosCompleted,
      completed: true,
    })

    // Mark task as completed if selected
    if (selectedTask) {
      await updateTask(selectedTask, { status: 'completed', completedAt: new Date() })
    }

    resetSession()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const getTimerColor = () => {
    switch (timerState) {
      case 'work':
        return 'from-accent-purple to-accent-blue'
      case 'shortBreak':
        return 'from-green-400 to-emerald-500'
      case 'longBreak':
        return 'from-blue-400 to-cyan-500'
      default:
        return 'from-white/10 to-white/5'
    }
  }

  const progress = timerState !== 'idle'
    ? ((timeLeft / ((timerState === 'work' ? pomodoroDuration : timerState === 'shortBreak' ? shortBreakDuration : longBreakDuration) * 60)) * 100)
    : 0

  return (
    <Layout>
      <motion.header
        className="bg-dark-800/50 backdrop-blur-xl border-b border-white/5 px-8 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-3xl font-bold text-white mb-1">Focus Mode 🎯</h2>
        <p className="text-white/60">Pomodoro-style deep work sessions</p>
      </motion.header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer Display */}
            <motion.div
              className="glass rounded-3xl p-12 backdrop-blur-2xl text-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="mb-6">
                <p className="text-white/60 text-sm uppercase tracking-wider mb-2">
                  {timerState === 'work' ? 'Focus Time' :
                   timerState === 'shortBreak' ? 'Short Break' :
                   timerState === 'longBreak' ? 'Long Break' :
                   'Ready to Start'}
                </p>
                <motion.div
                  className="text-8xl font-bold text-white mb-8"
                  animate={{ scale: timerState !== 'idle' ? [1, 1.02, 1] : 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {timerState !== 'idle' ? formatTime(timeLeft) : formatTime(pomodoroDuration * 60)}
                </motion.div>

                {/* DotLoader Animation */}
                <div className="flex flex-col items-center gap-6">
                  <DotLoader
                    frames={pongGame}
                    duration={200}
                    isPlaying={timerState !== 'idle' && !isPaused}
                    dotClassName="bg-white/15 [&.active]:bg-white size-1.5"
                    className="gap-0.5"
                  />

                  {/* Clean White Line Progress */}
                  <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${100 - progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <p className="text-white/60 text-sm mt-2">×{pomodorosCompleted} Pomodoros</p>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex gap-4 justify-center">
                {timerState === 'idle' || isPaused ? (
                  <motion.button
                    onClick={isPaused ? resumeTimer : startFocusSession}
                    className="btn-primary px-8 py-4 text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPaused ? '▶ Resume' : pomodorosCompleted > 0 ? 'Continue Session' : 'Start Focus'}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={pauseTimer}
                      className="btn-secondary px-8 py-4 text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ⏸ Pause
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setTimeLeft(0)
                        handleTimerComplete()
                      }}
                      className="btn-secondary px-8 py-4 text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ⏭ Skip
                    </motion.button>
                  </>
                )}
              </div>

              {pomodorosCompleted > 0 && (
                <div className="mt-6 flex gap-4 justify-center">
                  <motion.button
                    onClick={completeSession}
                    className="btn-success px-6 py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✓ Complete Session
                  </motion.button>
                  <motion.button
                    onClick={resetSession}
                    className="btn-danger px-6 py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✕ Reset
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Notes Section */}
            <motion.div
              className="glass rounded-2xl p-6 backdrop-blur-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Session Notes</h3>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Jot down thoughts, insights, or questions..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none"
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Selection */}
            <motion.div
              className="glass rounded-2xl p-6 backdrop-blur-2xl"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Focus On</h3>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-white/60 text-sm mb-2">Task (Optional)</p>
                  <TaskSearchSelect
                    value={selectedTask || ''}
                    onChange={(value) => setSelectedTask(value || null)}
                    options={pendingTasks.map(task => ({ value: task.id, label: task.title }))}
                    placeholder="Search for a task"
                  />
                </div>

                <div>
                  <p className="text-white/60 text-sm mb-2">Subject (Optional)</p>
                  <CustomSelect
                    value={selectedSubject || ''}
                    onChange={(value) => setSelectedSubject(value || null)}
                    options={[
                      { value: '', label: 'No subject' },
                      ...subjects.map(subject => ({ value: subject.id, label: subject.name }))
                    ]}
                    placeholder="Select subject"
                  />
                </div>
              </div>

              {selectedSubject && subjectTopics.length > 0 && (
                <div>
                  <p className="text-white/60 text-sm mb-2">Topics Covered</p>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {subjectTopics.map((topic) => (
                      <label
                        key={topic.id}
                        className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTopics([...selectedTopics, topic.id])
                            } else {
                              setSelectedTopics(selectedTopics.filter((id) => id !== topic.id))
                            }
                          }}
                          className="accent-accent-purple"
                        />
                        <span className="text-white text-sm">{topic.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Resources */}
            {selectedSubject && subjectResources.length > 0 && (
              <motion.div
                className="glass rounded-2xl p-6 backdrop-blur-2xl"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Resources</h3>
                  <motion.button
                    onClick={() => setShowResources(!showResources)}
                    className="text-accent-purple hover:text-accent-blue text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    {showResources ? 'Hide' : 'Show'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showResources && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2"
                    >
                      {subjectResources.map((resource) => (
                        <motion.a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center gap-2">
                            <span>
                              {resource.type === 'link' ? '🔗' :
                               resource.type === 'file' ? '📄' : '📝'}
                            </span>
                            <p className="text-white text-sm">{resource.name}</p>
                          </div>
                        </motion.a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Stats */}
            <motion.div
              className="glass rounded-2xl p-6 backdrop-blur-2xl"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm">Pomodoros</span>
                  <span className="text-white font-medium">{pomodorosCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm">Total Time</span>
                  <span className="text-white font-medium">
                    {formatDuration(pomodorosCompleted * pomodoroDuration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm">Topics</span>
                  <span className="text-white font-medium">{selectedTopics.length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Focus
