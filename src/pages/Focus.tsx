import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../hooks/useApp'
import Layout from '../components/Layout'
import { useState, useEffect, useRef } from 'react'

import { DotLoader } from '../components/ui/dot-loader'
import { CustomSelect } from '../components/ui/custom-select'


import { TaskSearchSelect } from '../components/ui/task-search-select'
import { Clock, Coffee, Minus, BarChart2, Play, Plus, Square, AlertTriangle, Save, RotateCcw, X, Zap, Edit2, Trash2 } from 'lucide-react'
import { useStudyStore } from '../stores/useStudyStore'
import { format } from 'date-fns'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
type EnergyLevel = 'low' | 'medium' | 'high'

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
    settings,
    addFocusSession,
  } = useApp()

  const { focusSessions, updateFocusSession, deleteFocusSession, stats, currentSessionStatus, setSessionStatus } = useStudyStore()

  // State
  // Use global session status instead of local state
  const sessionState = currentSessionStatus

  const [timerMode, setTimerMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [editTimeValue, setEditTimeValue] = useState('25')
  const [showStats, setShowStats] = useState(false)

  // Session Data
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [actualDuration, setActualDuration] = useState(0) // in seconds
  const [sessionNotes, setSessionNotes] = useState('')
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>(undefined)

  // Stats Edit State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNoteContent, setEditNoteContent] = useState('')

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Settings
  const focusDuration = (settings?.pomodoroDuration || 25) * 60
  const shortBreakDuration = (settings?.shortBreakDuration || 5) * 60
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress')


  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
        if (sessionState === 'active' && timerMode === 'focus') {
          setActualDuration((prev) => prev + 1)
        }
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      if (sessionState === 'active') {
        handleSessionEnd()
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, timeLeft, sessionState, timerMode])

  // Reset to idle on mount if not active (cleanup from previous navigation)
  useEffect(() => {
    // Optional: if we want to persist active session across navigation, we shouldn't reset.
    // But since we don't persist timer state in store yet, maybe reset if 'active' but no timer running?
    // For now, let's assume if we navigate away and back, we might lose timer state unless we move timeLeft to store.
    // Given the request is just about sidebar locking, let's keep it simple.
    // If we want to persist, we'd need to move timeLeft to store.
    // For now, if we reload, it resets.
    return () => {
      // Cleanup?
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleStart = () => {
    setSessionStatus('active')
    setTimerMode('focus')
    setSessionStartTime(new Date())
    setIsActive(true)
    // If starting fresh, reset duration
    if (sessionState === 'idle') {
      setActualDuration(0)
      // timeLeft is already set by edit or default
    }
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleResume = () => {
    setIsActive(true)
  }

  const handleAddTime = () => {
    setTimeLeft((prev) => prev + (5 * 60))
  }

  const handleRemoveTime = () => {
    setTimeLeft((prev) => Math.max(0, prev - (5 * 60)))
  }

  const handleSessionEnd = () => {
    setIsActive(false)
    setSessionStatus('ended')
  }

  const handleDiscard = () => {
    resetToIdle()
  }

  const handleSave = async () => {
    if (!sessionStartTime) return

    await addFocusSession({
      taskId: selectedTask || undefined,
      subjectId: selectedSubject || undefined,
      topicIds: [], // Could add topic selection if needed
      startTime: sessionStartTime,
      endTime: new Date(),
      durationMinutes: Math.round(actualDuration / 60),
      notes: sessionNotes || undefined,
      energyLevel: energyLevel,
      pomodoroCount: 1, // Treating this session as 1 block
      completed: true,
    })

    if (selectedTask) {
      // Optional: Ask user if task is complete? For now, leave as is or update progress
    }

    resetToIdle()
  }

  const handleContinueSameTask = async () => {
    await handleSave()
    // Don't reset selected task/subject
    // Just reset timer and state
    setSessionStatus('idle')
    setTimeLeft(focusDuration)
    setActualDuration(0)
    setSessionNotes('')
    setSessionStartTime(null)
    // Auto start? Maybe let user click start again
  }

  const handleTakeBreak = async () => {
    await handleSave()
    setSessionStatus('idle') // Or a specific 'break' state?
    // For now, let's just reset to idle but maybe set timer to break duration
    setTimerMode('shortBreak')
    setTimeLeft(shortBreakDuration)
    setActualDuration(0)
    setSessionNotes('')
    setSessionStartTime(null)
  }

  const resetToIdle = () => {
    setSessionStatus('idle')
    setTimerMode('focus')
    setTimeLeft(focusDuration)
    setActualDuration(0)
    setSessionStartTime(null)
    setSelectedTask(null)
    setSelectedSubject(null)
    setSessionNotes('')
    setEnergyLevel(undefined)
    setIsActive(false)
  }

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const minutes = parseInt(editTimeValue)
    if (!isNaN(minutes) && minutes > 0) {
      setTimeLeft(minutes * 60)
    }
    setIsEditingTime(false)
  }

  const isSessionShort = actualDuration < 5 * 60 // 5 minutes

  // Stats Helpers
  const sortedSessions = [...focusSessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const handleUpdateNote = async (id: string) => {
    await updateFocusSession(id, { notes: editNoteContent })
    setEditingNoteId(null)
    setEditNoteContent('')
  }

  return (
    <Layout>
      <motion.header
        className="px-8 py-8 flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 mb-3">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2]" />
            Navigation locks on during sessions
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Focus studio</h2>
          <p className="text-white/60">Deep work with ambient cues and timers</p>
        </div>
        <button
          onClick={() => setShowStats(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black rounded-full text-sm font-semibold shadow-lg shadow-black/25 hover:scale-[1.02] transition-transform"
        >
          <BarChart2 size={16} />
          Focus stats
        </button>
      </motion.header>

      <div className="flex-1 overflow-hidden p-8">
        <div className="max-w-6xl mx-auto h-full grid lg:grid-cols-2 gap-8 items-center">

          {/* LEFT COLUMN - TIMER */}
          <div className="flex flex-col items-center justify-center p-12 glass rounded-3xl relative overflow-hidden h-full max-h-[600px]">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(246,196,83,0.12),transparent_60%)] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center flex flex-col items-center justify-center h-full w-full">
              {isEditingTime && sessionState === 'idle' ? (
                <form onSubmit={handleTimeSubmit} className="mb-8 relative">
                  <div className="flex items-center gap-2 justify-center">
                    {/* Styled input to hide spinners and match text style */}
                    <style>
                      {`
                        input[type=number]::-webkit-inner-spin-button, 
                        input[type=number]::-webkit-outer-spin-button { 
                          -webkit-appearance: none; 
                          margin: 0; 
                        }
                        input[type=number] {
                          -moz-appearance: textfield;
                        }
                      `}
                    </style>
                    <input
                      type="number"
                      value={editTimeValue}
                      onChange={(e) => setEditTimeValue(e.target.value)}
                      className="text-[120px] font-bold text-white bg-transparent border-none w-[300px] text-center focus:outline-none leading-none tracking-tighter font-mono p-0 m-0"
                      autoFocus
                    />
                  </div>
                  <p className="text-white/40 text-sm mt-4 absolute -bottom-8 left-0 right-0">Press Enter to set minutes</p>
                </form>
              ) : (
                <div
                  className={`text-[120px] font-bold text-white leading-none tracking-tighter font-mono cursor-pointer transition-opacity hover:opacity-80 ${sessionState !== 'idle' ? 'pointer-events-none' : ''}`}
                  onClick={() => {
                    if (sessionState === 'idle') {
                      setEditTimeValue(String(Math.floor(timeLeft / 60)))
                      setIsEditingTime(true)
                    }
                  }}
                >
                  {formatTime(timeLeft)}
                </div>
              )}

              <div className="mt-12 flex flex-col items-center gap-6 w-full h-32 justify-end">
                {/* Progress Bar & Animation - Only show when active */}
                {sessionState === 'active' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex flex-col items-center gap-6"
                  >
                    <div className="h-1.5 w-64 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-1000 ease-linear"
                        style={{ width: `${100 - (timeLeft / (timerMode === 'focus' ? focusDuration : shortBreakDuration) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-white/40 text-sm uppercase tracking-widest">
                      {timerMode === 'focus' ? (
                        <>
                          <Clock size={14} />
                          <span>Focus Time</span>
                        </>
                      ) : (
                        <>
                          <Coffee size={14} />
                          <span>Break Time</span>
                        </>
                      )}
                    </div>

                    {/* Animation - Centered */}
                    <div className="h-16 flex items-center justify-center">
                      <DotLoader
                        frames={pongGame}
                        duration={200}
                        isPlaying={isActive}
                        dotClassName="bg-white/20 [&.active]:bg-white size-2" // Changed to white
                        className="gap-1"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - CONTEXT & CONTROLS */}
          <div className="h-full flex flex-col justify-center">

            {/* IDLE STATE */}
            {sessionState === 'idle' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to focus?</h3>
                  <p className="text-white/50">Select a task or subject to track your progress.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Task (Optional)</label>
                    <TaskSearchSelect
                      value={selectedTask || ''}
                      onChange={(value) => setSelectedTask(value || null)}
                      options={pendingTasks.map(task => ({ value: task.id, label: task.title }))}
                      placeholder="What are you working on?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Subject (Optional)</label>
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

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Energy Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setEnergyLevel(level)}
                          className={`py-2 rounded-lg text-sm font-medium capitalize transition-all border ${energyLevel === level
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black transition-transform hover:scale-[1.01] flex items-center justify-center gap-3 shadow-lg shadow-black/25 group"
                >
                  <Play size={20} className="fill-black" />
                  Start Session
                </button>
              </div>
            )}

            {/* ACTIVE STATE */}
            {sessionState === 'active' && (
              <div className="space-y-8">
                {(selectedTask || selectedSubject) && (
                  <div className="glass p-6 rounded-2xl">
                    <p className="text-white/40 text-sm mb-1">Currently focusing on</p>
                    <h3 className="text-xl font-bold text-white">
                      {selectedTask
                        ? pendingTasks.find(t => t.id === selectedTask)?.title
                        : selectedSubject
                          ? subjects.find(s => s.id === selectedSubject)?.name
                          : ''}
                    </h3>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Quick Notes</label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Jot down thoughts..."
                    className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/20 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={isActive ? handlePause : handleResume}
                    className={`py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isActive
                      ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                      : 'bg-white text-black hover:bg-white/90'
                      }`}
                  >
                    {isActive ? <span className="flex items-center gap-2">⏸ Pause</span> : <span className="flex items-center gap-2"><Play size={18} className="fill-current" /> Resume</span>}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRemoveTime}
                      className="py-4 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
                      title="Remove 5m"
                    >
                      <Minus size={18} />
                    </button>
                    <button
                      onClick={handleAddTime}
                      className="py-4 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
                      title="Add 5m"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSessionEnd}
                  className="w-full py-4 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Square size={18} className="fill-current" />
                  End Session
                </button>
              </div>
            )}

            {/* ENDED STATE */}
            {sessionState === 'ended' && (
              <div className="space-y-6">
                {isSessionShort ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                      <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Session too short</h3>
                    <p className="text-white/60 text-sm mb-6">
                      Sessions under 5 minutes cannot be saved.
                    </p>
                    <button
                      onClick={handleDiscard}
                      className="w-full py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all"
                    >
                      Discard Session
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
                      <p className="text-white/50">
                        You focused for <span className="text-white font-medium">{Math.round(actualDuration / 60)} minutes</span>.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Session Notes</label>
                      <textarea
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        placeholder="What did you accomplish?"
                        className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={handleSave}
                        className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Save Session
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleContinueSameTask}
                          className="py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <RotateCcw size={16} />
                          Continue
                        </button>
                        <button
                          onClick={handleTakeBreak}
                          className="py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <Coffee size={16} />
                          Take Break
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Focus Stats Modal */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowStats(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart2 className="text-accent-purple" />
                  Focus Stats
                </h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="glass p-4 rounded-2xl">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Focus Time</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(stats.weeklyMinutes / 60)}h {stats.weeklyMinutes % 60}m
                    </p>
                  </div>
                  <div className="glass p-4 rounded-2xl">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Sessions</p>
                    <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                  </div>
                  <div className="glass p-4 rounded-2xl">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Current Streak</p>
                    <p className="text-2xl font-bold text-white">{stats.currentStreak} days</p>
                  </div>
                </div>

                {/* History List */}
                <h4 className="text-lg font-bold text-white mb-4">History</h4>
                <div className="space-y-3">
                  {sortedSessions.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No focus sessions yet.</p>
                  ) : (
                    sortedSessions.map((session) => (
                      <div key={session.id} className="glass p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-white font-medium">
                                {format(new Date(session.startTime), 'MMM d, yyyy • h:mm a')}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
                                {session.durationMinutes}m
                              </span>
                              {session.energyLevel && (
                                <span className={`px-2 py-0.5 rounded-full text-xs capitalize flex items-center gap-1 ${session.energyLevel === 'high' ? 'bg-green-500/10 text-green-400' :
                                  session.energyLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-red-500/10 text-red-400'
                                  }`}>
                                  <Zap size={10} />
                                  {session.energyLevel} Energy
                                </span>
                              )}
                            </div>

                            <p className="text-white/80 text-sm mb-2">
                              {session.taskId
                                ? tasks.find(t => t.id === session.taskId)?.title
                                : session.subjectId
                                  ? subjects.find(s => s.id === session.subjectId)?.name
                                  : 'Untracked Session'}
                            </p>

                            {editingNoteId === session.id ? (
                              <div className="mt-2">
                                <textarea
                                  value={editNoteContent}
                                  onChange={(e) => setEditNoteContent(e.target.value)}
                                  className="w-full p-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:border-accent-purple/50 focus:outline-none"
                                  rows={2}
                                  autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleUpdateNote(session.id)}
                                    className="px-3 py-1 bg-white text-black text-xs rounded-md font-medium"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingNoteId(null)}
                                    className="px-3 py-1 bg-white/10 text-white text-xs rounded-md"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              session.notes && (
                                <p className="text-white/40 text-sm italic">
                                  "{session.notes}"
                                </p>
                              )
                            )}
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingNoteId(session.id)
                                setEditNoteContent(session.notes || '')
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                              title="Edit Notes"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteFocusSession(session.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                              title="Delete Session"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}

export default Focus
