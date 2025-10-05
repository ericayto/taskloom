import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { getDaysUntil, formatTime, formatDuration } from '../utils/helpers'
import { useMemo } from 'react'
import { ButtonColorful } from '../components/ui/button-colorful'

const Overview = () => {
  const { tasks, studyBlocks, subjects, stats, loading } = useApp()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
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
        className="bg-dark-800/50 backdrop-blur-xl border-b border-white/5 px-8 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            What should I do today? ✨
          </h2>
          <p className="text-white/60">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="flex-1 overflow-auto p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            variants={itemVariants}
            className="glass rounded-2xl p-6 backdrop-blur-2xl border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔥</span>
              <p className="text-white/60 text-sm font-medium">Current Streak</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {stats.currentStreak} <span className="text-xl text-white/60">days</span>
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="glass rounded-2xl p-6 backdrop-blur-2xl border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⏱️</span>
              <p className="text-white/60 text-sm font-medium">This Week</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {formatDuration(stats.weeklyMinutes)}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="glass rounded-2xl p-6 backdrop-blur-2xl border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✓</span>
              <p className="text-white/60 text-sm font-medium">Tasks Today</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {todayTasks.length}
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 glass rounded-2xl p-6 backdrop-blur-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Today's Schedule</h3>
              <Link to="/planner">
                <motion.button
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium relative group"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="relative z-10">View Planner</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity"></span>
                </motion.button>
              </Link>
            </div>

            {todayBlocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗓️</div>
                <p className="text-white/60 mb-4">No study blocks scheduled for today</p>
                <Link to="/planner">
                  <button className="px-6 py-3 bg-white hover:bg-white/90 text-black font-medium rounded-lg transition-all hover:scale-105 active:scale-95">
                    Plan Your Day
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todayBlocks.map((block, index) => (
                  <motion.div
                    key={block.id}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div
                      className={`w-1 h-12 rounded-full bg-gradient-to-b ${getSubjectColor(block.subjectId)}`}
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{block.title}</h4>
                      {block.subjectId && (
                        <p className="text-white/40 text-sm">{getSubjectName(block.subjectId)}</p>
                      )}
                    </div>
                    <div className="text-white/60 text-sm">
                      {block.startTime} - {block.endTime}
                    </div>
                    {block.completed && (
                      <div className="text-green-400 text-sm font-medium">✓ Done</div>
                    )}
                  </motion.div>
                ))}

                <Link to="/focus">
                  <motion.button
                    className="w-full mt-6 py-4 bg-gradient-to-r from-accent-purple to-accent-blue rounded-xl text-white font-medium text-lg"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🎯 Start Focus Session
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Due Soon */}
          <motion.div variants={itemVariants} className="glass rounded-2xl p-6 backdrop-blur-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Due Soon</h3>

            {dueSoonTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-white/60 text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueSoonTasks.map((task, index) => {
                  const daysUntil = task.dueDate ? getDaysUntil(task.dueDate) : 0
                  const isUrgent = daysUntil <= 2

                  return (
                    <motion.div
                      key={task.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isUrgent
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 ${
                            task.priority === 'high'
                              ? 'bg-red-400'
                              : task.priority === 'medium'
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {task.title}
                          </p>
                          {task.subjectId && (
                            <p className="text-white/40 text-xs">
                              {getSubjectName(task.subjectId)}
                            </p>
                          )}
                          <p
                            className={`text-xs mt-1 ${
                              isUrgent ? 'text-red-400' : 'text-white/60'
                            }`}
                          >
                            {daysUntil === 0
                              ? 'Today'
                              : daysUntil === 1
                              ? 'Tomorrow'
                              : `in ${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            <Link to="/tasks">
              <motion.button
                className="w-full mt-4 py-2 border-2 border-dashed border-white/10 rounded-lg text-white/40 hover:text-white hover:border-white/30 transition-all text-sm"
                whileHover={{ scale: 1.01 }}
              >
                + Add New Task
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-4 mt-8">
          <Link to="/planner">
            <motion.div
              className="glass rounded-xl p-4 backdrop-blur-2xl cursor-pointer group border border-white/10 hover:border-white/20"
              initial={{ y: 0, scale: 1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="text-3xl mb-2">📝</div>
              <h4 className="text-white font-medium">
                Plan Week
              </h4>
              <p className="text-white/40 text-sm">Organize your schedule</p>
            </motion.div>
          </Link>

          <Link to="/subjects">
            <motion.div
              className="glass rounded-xl p-4 backdrop-blur-2xl cursor-pointer group border border-white/10 hover:border-white/20"
              initial={{ y: 0, scale: 1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="text-3xl mb-2">📚</div>
              <h4 className="text-white font-medium">
                Manage Subjects
              </h4>
              <p className="text-white/40 text-sm">Topics, exams, resources</p>
            </motion.div>
          </Link>

          <Link to="/focus">
            <motion.div
              className="glass rounded-xl p-4 backdrop-blur-2xl cursor-pointer group border border-white/10 hover:border-white/20"
              initial={{ y: 0, scale: 1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="text-white font-medium">
                Focus Session
              </h4>
              <p className="text-white/40 text-sm">Deep work mode</p>
            </motion.div>
          </Link>

          <Link to="/review">
            <motion.div
              className="glass rounded-xl p-4 backdrop-blur-2xl cursor-pointer group border border-white/10 hover:border-white/20"
              initial={{ y: 0, scale: 1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="text-3xl mb-2">📈</div>
              <h4 className="text-white font-medium">
                Weekly Review
              </h4>
              <p className="text-white/40 text-sm">Track your progress</p>
            </motion.div>
          </Link>
        </motion.div>
      </motion.main>
    </Layout>
  )
}

export default Overview
