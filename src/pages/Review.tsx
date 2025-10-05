import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { useState, useMemo } from 'react'
import { getWeekStart, formatDuration } from '../utils/helpers'
import { addDays, format } from 'date-fns'
import { generateWeeklySummary, suggestWeeklyPlan } from '../lib/ai'
import { ButtonColorful } from '../components/ui/button-colorful'

const Review = () => {
  const {
    tasks,
    focusSessions,
    topics,
    weeklyReviews,
    addWeeklyReview,
    getWeeklyReview,
    addStudyBlocks,
  } = useApp()

  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart())
  const [isGenerating, setIsGenerating] = useState(false)
  const [reviewData, setReviewData] = useState({
    wentWell: '',
    needsAttention: '',
    topPriority: '',
  })

  const weekEnd = addDays(currentWeekStart, 6)
  const existingReview = getWeeklyReview(currentWeekStart)

  // Calculate weekly stats
  const weekStats = useMemo(() => {
    const weekSessions = focusSessions.filter((s) => {
      const sessionDate = new Date(s.startTime)
      return sessionDate >= currentWeekStart && sessionDate <= weekEnd
    })

    const weekTasks = tasks.filter((t) => {
      if (!t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      return dueDate >= currentWeekStart && dueDate <= weekEnd
    })

    const totalMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const sessionsCompleted = weekSessions.length
    const deadlinesMet = weekTasks.filter((t) => t.status === 'completed').length
    const deadlinesMissed = weekTasks.filter(
      (t) => t.status !== 'completed' && new Date(t.dueDate!) < new Date()
    ).length

    // Find stale topics
    const now = new Date()
    const staleTopics = topics.filter((topic) => {
      if (!topic.lastReviewed) return true
      const daysSince =
        (now.getTime() - new Date(topic.lastReviewed).getTime()) / (1000 * 60 * 60 * 24)
      return daysSince > 7
    })

    return {
      totalMinutes,
      sessionsCompleted,
      deadlinesMet,
      deadlinesMissed,
      staleTopics: staleTopics.slice(0, 5),
    }
  }, [currentWeekStart, weekEnd, focusSessions, tasks, topics])

  const handleGenerateReview = async () => {
    setIsGenerating(true)
    try {
      const weekSessions = focusSessions.filter((s) => {
        const sessionDate = new Date(s.startTime)
        return sessionDate >= currentWeekStart && sessionDate <= weekEnd
      })

      const weekTasks = tasks.filter((t) => {
        if (!t.dueDate) return false
        const dueDate = new Date(t.dueDate)
        return dueDate >= currentWeekStart && dueDate <= weekEnd
      })

      const summary = await generateWeeklySummary(weekSessions, weekTasks, topics)

      await addWeeklyReview({
        weekStart: currentWeekStart,
        weekEnd,
        totalMinutes: weekStats.totalMinutes,
        sessionsCompleted: weekStats.sessionsCompleted,
        deadlinesMet: weekStats.deadlinesMet,
        deadlinesMissed: weekStats.deadlinesMissed,
        wentWell: reviewData.wentWell || 'Maintained consistency',
        needsAttention: reviewData.needsAttention || 'Review stale topics',
        topPriority: reviewData.topPriority || 'Keep momentum',
        aiSummary: summary,
        createdAt: new Date(),
      })

      setReviewData({ wentWell: '', needsAttention: '', topPriority: '' })
    } catch (error) {
      console.error('Failed to generate review:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplyToPlanner = async () => {
    if (!existingReview) return

    setIsGenerating(true)
    try {
      const nextWeekStart = addDays(currentWeekStart, 7)
      const suggestions = await suggestWeeklyPlan(tasks, [])

      // Adjust suggestions to start from next week
      const adjustedSuggestions = suggestions.map((block) => ({
        ...block,
        date: addDays(nextWeekStart, new Date(block.date).getDay()),
      }))

      await addStudyBlocks(adjustedSuggestions)
    } catch (error) {
      console.error('Failed to apply suggestions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <Layout>
      {/* Header */}
      <motion.header
        className="bg-dark-800/50 backdrop-blur-xl border-b border-white/5 px-8 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Weekly Review ✨</h2>
            <p className="text-white/60">
              {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
              className="px-4 py-2 glass rounded-lg text-white"
              whileHover={{ scale: 1.05 }}
            >
              ← Previous
            </motion.button>
            <motion.button
              onClick={() => setCurrentWeekStart(getWeekStart())}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              This Week
            </motion.button>
            <motion.button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              className="px-4 py-2 glass rounded-lg text-white"
              whileHover={{ scale: 1.05 }}
            >
              Next →
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="flex-1 overflow-auto p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6 backdrop-blur-2xl">
              <div className="text-3xl mb-2">⏱️</div>
              <p className="text-white/60 text-sm mb-1">Total Time</p>
              <p className="text-2xl font-bold text-white">
                {formatDuration(weekStats.totalMinutes)}
              </p>
            </div>

            <div className="glass rounded-xl p-6 backdrop-blur-2xl">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-white/60 text-sm mb-1">Sessions</p>
              <p className="text-2xl font-bold text-white">{weekStats.sessionsCompleted}</p>
            </div>

            <div className="glass rounded-xl p-6 backdrop-blur-2xl">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-white/60 text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{weekStats.deadlinesMet}</p>
            </div>

            <div className="glass rounded-xl p-6 backdrop-blur-2xl">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-white/60 text-sm mb-1">Missed</p>
              <p className="text-2xl font-bold text-red-400">{weekStats.deadlinesMissed}</p>
            </div>
          </motion.div>

          {/* Stale Topics */}
          {weekStats.staleTopics.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="glass rounded-2xl p-6 backdrop-blur-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Topics Need Attention 📌</h3>
              <div className="flex flex-wrap gap-2">
                {weekStats.staleTopics.map((topic) => {
                  const daysSince = topic.lastReviewed
                    ? Math.floor(
                        (Date.now() - new Date(topic.lastReviewed).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : '∞'

                  return (
                    <div
                      key={topic.id}
                      className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                    >
                      <p className="text-white text-sm font-medium">{topic.name}</p>
                      <p className="text-yellow-400 text-xs">
                        {typeof daysSince === 'number' ? `${daysSince}d ago` : 'Never'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Review Form or Display */}
          {existingReview ? (
            <motion.div variants={itemVariants} className="space-y-6">
              {/* AI Summary */}
              <div className="glass rounded-2xl p-8 backdrop-blur-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">✨</span>
                  <h3 className="text-2xl font-bold text-white">AI Summary</h3>
                </div>
                <p className="text-white/80 leading-relaxed text-lg">{existingReview.aiSummary}</p>
              </div>

              {/* Reflections */}
              <div className="glass rounded-2xl p-6 backdrop-blur-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Your Reflections</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-green-400 font-medium mb-2">What went well ✓</p>
                    <p className="text-white/80">{existingReview.wentWell}</p>
                  </div>
                  <div>
                    <p className="text-yellow-400 font-medium mb-2">Needs attention ⚠️</p>
                    <p className="text-white/80">{existingReview.needsAttention}</p>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-2">Top priority 🎯</p>
                    <p className="text-white/80">{existingReview.topPriority}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleApplyToPlanner}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-white hover:bg-white/90 text-black font-medium rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Applying...' : '🗓️ Apply to Next Week'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="glass rounded-2xl p-8 backdrop-blur-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Complete Your Review</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">
                    What went well this week? ✓
                  </label>
                  <textarea
                    value={reviewData.wentWell}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, wentWell: e.target.value })
                    }
                    placeholder="Achievements, good habits, wins..."
                    className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">
                    What needs attention? ⚠️
                  </label>
                  <textarea
                    value={reviewData.needsAttention}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, needsAttention: e.target.value })
                    }
                    placeholder="Challenges, areas for improvement..."
                    className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">
                    Top priority for next week? 🎯
                  </label>
                  <textarea
                    value={reviewData.topPriority}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, topPriority: e.target.value })
                    }
                    placeholder="Main focus, key goals..."
                    className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateReview}
                  disabled={isGenerating}
                  className="w-full py-4 text-lg bg-white hover:bg-white/90 text-black font-medium rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '✨ Generating Review...' : '✨ Generate AI Summary'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.main>
    </Layout>
  )
}

export default Review
