import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import Layout from '../components/Layout'
import { getDaysUntil, formatDuration } from '../utils/helpers'
import { useMemo, useEffect, useRef } from 'react'
import { useStudyStore } from '../stores/useStudyStore'

const Overview = () => {
  const { tasks, studyBlocks, subjects, stats, loading, user } = useApp()
  const { currentSessionStatus } = useStudyStore()
  const timelineRef = useRef<HTMLDivElement>(null)
  const currentTimeRef = useRef<HTMLDivElement>(null)

  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.name || 'there'

    if (hour >= 0 && hour < 5) {
      return `Hello night owl 🦉`
    } else if (hour >= 5 && hour < 12) {
      return `Good morning, ${name} ☀️`
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${name} 👋`
    } else if (hour >= 17 && hour < 21) {
      return `Good evening, ${name} 🌆`
    } else {
      return `Burning the midnight oil? 🌙`
    }
  }

  // Get today's study blocks
  const todayBlocks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return studyBlocks
      .filter((block) => {
        const blockDate = new Date(block.date)
        blockDate.setHours(0, 0, 0, 0)
        return blockDate.getTime() === today.getTime()
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [studyBlocks])

  // Get today's tasks
  const todayTasks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter((task) => {
      if (!task.dueDate || task.status === 'completed') return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate < tomorrow
    })
  }, [tasks])

  // Get tasks due soon (next 7 days, excluding today)
  const dueSoonTasks = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const weekAhead = new Date(today)
    weekAhead.setDate(weekAhead.getDate() + 7)

    return tasks
      .filter((task) => {
        if (!task.dueDate || task.status === 'completed') return false
        const dueDate = new Date(task.dueDate)
        return dueDate > today && dueDate <= weekAhead
      })
      .sort((a, b) => {
        if (!a.dueDate || !b.dueDate) return 0
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
      .slice(0, 5)
  }, [tasks])

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return null
    return subjects.find((s) => s.id === subjectId)?.name
  }

  const getSubjectColor = (subjectId?: string) => {
    if (!subjectId) return 'from-white/10 to-white/5'
    const subject = subjects.find((s) => s.id === subjectId)
    return subject?.color || 'from-white/10 to-white/5'
  }

  // Scroll to current time on mount
  useEffect(() => {
    if (currentTimeRef.current && timelineRef.current) {
      const container = timelineRef.current
      const currentTimeElement = currentTimeRef.current
      const containerHeight = container.clientHeight
      const elementTop = currentTimeElement.offsetTop

      // Center the current time in the view
      container.scrollTop = elementTop - containerHeight / 2 + 24
    }
  }, [todayBlocks])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <motion.div
            className="text-white/60"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading...
          </motion.div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <motion.header
        className="px-8 py-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 mb-3">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2]" />
              Your day in one view
            </div>
            <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">
              {getGreeting()}
            </h2>
            <p className="text-white/50 text-lg">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 shadow-lg shadow-black/30">
            Navigation locks are {currentSessionStatus === 'active' ? 'on' : 'off'} • Focus studio ready
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col px-8 pb-8">
        {/* Stats Row */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-8 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <span className="text-xl">🔥</span>
              </div>
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider">Current Streak</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {stats.currentStreak} <span className="text-lg text-white/40 font-normal">days</span>
            </p>
          </div>

          <div className="card group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <span className="text-xl">⏱️</span>
              </div>
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider">This Week</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {formatDuration(stats.weeklyMinutes)}
            </p>
          </div>

          <div className="card group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <span className="text-xl">📝</span>
              </div>
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider">Tasks Today</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {todayTasks.length}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Today's Schedule */}
          <div className="lg:col-span-2 card flex flex-col overflow-hidden border-white/[0.08]">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h3 className="text-xl font-bold text-white">Today's Schedule</h3>
              <Link to="/planner">
                <motion.button
                  className="text-white/40 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
                  whileHover={{ x: 2 }}
                >
                  View Planner →
                </motion.button>
              </Link>
            </div>

            {todayBlocks.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-2xl">🗓️</div>
                <p className="text-white/40 mb-6">No study blocks scheduled for today</p>
                <Link to="/planner">
                  <button className="px-6 py-2 bg-white text-black font-medium rounded-full text-sm hover:bg-white/90 transition-all">
                    Plan Your Day
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Timeline View with scroll */}
                <div
                  ref={timelineRef}
                  className="relative overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2"
                >
                  {/* Time markers on left, blocks on right */}
                  <div className="space-y-0">
                    {(() => {
                      // Generate time slots from 6 AM to 11 PM
                      const hours = Array.from({ length: 18 }, (_, i) => i + 6)
                      const currentHour = new Date().getHours()

                      return hours.map((hour) => {
                        const timeStr = `${hour.toString().padStart(2, '0')}:00`
                        const nextTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`
                        const isCurrentHour = hour === currentHour

                        // Find blocks in this hour
                        const blocksInHour = todayBlocks.filter(block => {
                          const blockStart = block.startTime
                          return blockStart >= timeStr && blockStart < nextTimeStr
                        })

                        return (
                          <div
                            key={hour}
                            ref={isCurrentHour ? currentTimeRef : null}
                            className="flex items-start relative group"
                          >
                            {/* Time label */}
                            <div className="w-16 flex-shrink-0 pl-2 pr-4 py-3">
                              <span className={`text-xs font-medium ${isCurrentHour ? 'text-accent-purple' : 'text-white/20 group-hover:text-white/40 transition-colors'}`}>
                                {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
                              </span>
                            </div>

                            {/* Vertical line */}
                            <div className={`w-px flex-shrink-0 self-stretch ${isCurrentHour ? 'bg-accent-purple' : 'bg-white/[0.04]'}`} />

                            {/* Blocks container */}
                            <div className="flex-1 py-1.5 pl-4 min-h-[48px]">
                              {blocksInHour.map((block) => (
                                <motion.div
                                  key={block.id}
                                  className="mb-1.5 last:mb-0 flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all group cursor-pointer"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <div
                                    className={`w-1 h-8 rounded-full bg-gradient-to-b ${getSubjectColor(block.subjectId)} flex-shrink-0`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-white text-sm font-medium truncate">{block.title}</h4>
                                      {block.completed && (
                                        <span className="text-green-400 text-xs bg-green-400/10 px-1.5 py-0.5 rounded">Done</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                                      {block.subjectId && (
                                        <span className="text-white/60">{getSubjectName(block.subjectId)}</span>
                                      )}
                                      <span className="w-1 h-1 rounded-full bg-white/20" />
                                      <span>{block.startTime} - {block.endTime}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Due Soon */}
          <div className="card flex flex-col overflow-hidden border-white/[0.08]">
            <h3 className="text-xl font-bold text-white mb-6 flex-shrink-0">Due Soon</h3>

            {dueSoonTasks.length === 0 ? (
              <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-3">
                  <span className="text-xl">🎉</span>
                </div>
                <p className="text-white/60 text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {dueSoonTasks.map((task, index) => {
                  const daysUntil = task.dueDate ? getDaysUntil(task.dueDate) : 0
                  const isUrgent = daysUntil <= 2

                  return (
                    <motion.div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isUrgent
                          ? 'bg-red-500/[0.05] border-red-500/20 hover:bg-red-500/[0.08]'
                          : 'bg-white/[0.03] border-white/[0.04] hover:bg-white/[0.06]'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            task.priority === 'high'
                              ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]'
                              : task.priority === 'medium'
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {task.subjectId && (
                              <span className="text-white/40 text-xs bg-white/[0.05] px-1.5 py-0.5 rounded">
                                {getSubjectName(task.subjectId)}
                              </span>
                            )}
                            <span
                              className={`text-xs ${
                                isUrgent ? 'text-red-400 font-medium' : 'text-white/40'
                              }`}
                            >
                              {daysUntil === 0
                                ? 'Today'
                                : daysUntil === 1
                                ? 'Tomorrow'
                                : `in ${daysUntil} days`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            <Link to="/tasks">
              <motion.button
                className="w-full mt-4 py-2.5 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all text-sm font-medium"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                + Add New Task
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid md:grid-cols-4 gap-4 mt-6 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Link to="/planner">
            <motion.div
              className="card-interactive p-4 group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                <span className="text-xl">📝</span>
              </div>
              <h4 className="text-white font-medium mb-1">
                Plan Week
              </h4>
              <p className="text-white/40 text-xs">Organize your schedule</p>
            </motion.div>
          </Link>

          <Link to="/subjects">
            <motion.div
              className="card-interactive p-4 group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-3 group-hover:scale-110 transition-transform">
                <span className="text-xl">📚</span>
              </div>
              <h4 className="text-white font-medium mb-1">
                Manage Subjects
              </h4>
              <p className="text-white/40 text-xs">Topics, exams, resources</p>
            </motion.div>
          </Link>

          <Link to="/focus">
            <motion.div
              className="card-interactive p-4 group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 mb-3 group-hover:scale-110 transition-transform">
                <span className="text-xl">🎯</span>
              </div>
              <h4 className="text-white font-medium mb-1">
                Focus Session
              </h4>
              <p className="text-white/40 text-xs">Deep work mode</p>
            </motion.div>
          </Link>

          <Link to="/review">
            <motion.div
              className="card-interactive p-4 group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-3 group-hover:scale-110 transition-transform">
                <span className="text-xl">📈</span>
              </div>
              <h4 className="text-white font-medium mb-1">
                Weekly Review
              </h4>
              <p className="text-white/40 text-xs">Track your progress</p>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </Layout>
  )

}

export default Overview
