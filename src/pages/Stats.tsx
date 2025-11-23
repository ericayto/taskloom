import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../hooks/useApp'
import Layout from '../components/Layout'
import { useMemo, useState } from 'react'
import { formatDuration } from '../utils/helpers'
import { Users, TrendingUp, Trophy, Clock, Target, Zap } from 'lucide-react'

// Mock friends data - will be replaced with real API later
const MOCK_FRIENDS = [
  { id: '1', name: 'Sarah Chen', weeklyMinutes: 840, streak: 12, level: 8, avatar: 'SC', isCurrentUser: false },
  { id: '2', name: 'Marcus Johnson', weeklyMinutes: 720, streak: 8, level: 7, avatar: 'MJ', isCurrentUser: false },
  { id: '3', name: 'Emma Wilson', weeklyMinutes: 650, streak: 15, level: 9, avatar: 'EW', isCurrentUser: false },
  { id: '4', name: 'Alex Park', weeklyMinutes: 580, streak: 5, level: 6, avatar: 'AP', isCurrentUser: false },
  { id: '5', name: 'Olivia Brown', weeklyMinutes: 520, streak: 10, level: 7, avatar: 'OB', isCurrentUser: false },
]

const Stats = () => {
  const { user, stats, tasks, loading } = useApp()
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'streak' | 'level'>('weekly')
  const [showAddFriend, setShowAddFriend] = useState(false)

  // Calculate task completion stats
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const totalTasks = tasks.length

  // Create leaderboard with user + friends
  const leaderboard = useMemo(() => {
    const currentUser = {
      id: user?.id || 'current',
      name: user?.name || 'You',
      weeklyMinutes: stats.weeklyMinutes,
      streak: stats.currentStreak,
      level: user?.level || 1,
      avatar: user?.name?.substring(0, 2).toUpperCase() || 'YO',
      isCurrentUser: true,
    }

    const allUsers = [currentUser, ...MOCK_FRIENDS]

    // Sort based on selected tab
    switch (selectedTab) {
      case 'weekly':
        return allUsers.sort((a, b) => b.weeklyMinutes - a.weeklyMinutes)
      case 'streak':
        return allUsers.sort((a, b) => b.streak - a.streak)
      case 'level':
        return allUsers.sort((a, b) => b.level - a.level)
      default:
        return allUsers
    }
  }, [user, stats, selectedTab])

  const userRank = leaderboard.findIndex((u) => u.isCurrentUser) + 1

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
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Profile & Stats</h2>
            <p className="text-white/60">Track your progress and compete with friends</p>
          </div>
          <motion.button
            onClick={() => setShowAddFriend(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users size={18} />
            Add Friend
          </motion.button>
        </div>
      </motion.header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Card */}
          <motion.div
            className="glass rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.substring(0, 2).toUpperCase() || 'YO'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {user?.name || 'Student'}
                </h3>
                <p className="text-white/60">Level {user?.level || 1}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm mb-1">Current Rank</p>
                <div className="flex items-center gap-2">
                  <Trophy className="text-yellow-500" size={24} />
                  <span className="text-3xl font-bold text-white">#{userRank}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-blue-400" size={18} />
                  <p className="text-white/60 text-sm">Weekly Study</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(stats.weeklyMinutes)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-orange-400" size={18} />
                  <p className="text-white/60 text-sm">Current Streak</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.currentStreak} days
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-green-400" size={18} />
                  <p className="text-white/60 text-sm">Tasks Done</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-purple-400" size={18} />
                  <p className="text-white/60 text-sm">Total Sessions</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalSessions}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Friends Leaderboard */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Leaderboard</h3>
              <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setSelectedTab('weekly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedTab === 'weekly'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Weekly Time
                </button>
                <button
                  onClick={() => setSelectedTab('streak')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedTab === 'streak'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Streak
                </button>
                <button
                  onClick={() => setSelectedTab('level')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedTab === 'level'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Level
                </button>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-3">
              {leaderboard.map((friend, index) => {
                const isCurrentUser = friend.isCurrentUser
                const isTop3 = index < 3

                return (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-12 text-center">
                      {isTop3 ? (
                        <div className={`text-2xl ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      ) : (
                        <span className="text-white/60 font-semibold">#{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-2 border-blue-500/30'
                    }`}>
                      {friend.avatar}
                    </div>

                    {/* Name & Level */}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        {friend.name}
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full">
                            You
                          </span>
                        )}
                      </h4>
                      <p className="text-white/60 text-sm">Level {friend.level}</p>
                    </div>

                    {/* Stats based on selected tab */}
                    <div className="text-right">
                      {selectedTab === 'weekly' && (
                        <>
                          <p className="text-white font-bold text-lg">
                            {formatDuration(friend.weeklyMinutes)}
                          </p>
                          <p className="text-white/60 text-xs">this week</p>
                        </>
                      )}
                      {selectedTab === 'streak' && (
                        <>
                          <p className="text-white font-bold text-lg flex items-center justify-end gap-1">
                            <Zap size={16} className="text-orange-400" />
                            {friend.streak}
                          </p>
                          <p className="text-white/60 text-xs">day streak</p>
                        </>
                      )}
                      {selectedTab === 'level' && (
                        <>
                          <p className="text-white font-bold text-lg">
                            Level {friend.level}
                          </p>
                          <p className="text-white/60 text-xs">current level</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Add Friend CTA */}
            <motion.button
              onClick={() => setShowAddFriend(true)}
              className="w-full mt-4 py-3 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              + Invite More Friends
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Add Friend Modal */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddFriend(false)}
          >
            <motion.div
              className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Add Friend</h3>
              <p className="text-white/60 mb-6">
                Enter your friend's username or email to send them an invite.
              </p>

              <input
                type="text"
                placeholder="Username or email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Mock functionality - show success message
                    alert('Friend request sent! (This is mock functionality)')
                    setShowAddFriend(false)
                  }}
                  className="flex-1 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-white font-medium transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}

export default Stats
