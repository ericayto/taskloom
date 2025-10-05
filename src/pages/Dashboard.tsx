import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'schedule', label: 'Schedule', icon: '🗓️' },
    { id: 'focus', label: 'Focus Mode', icon: '🎯' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  const stats = [
    { label: 'Tasks Due', value: '12', color: 'from-accent-purple to-accent-blue' },
    { label: 'Study Hours', value: '24', color: 'from-accent-blue to-accent-purple' },
    { label: 'Completed', value: '87%', color: 'from-accent-pink to-accent-purple' },
  ]

  const upcomingTasks = [
    { title: 'Mathematics Assignment', due: '2 hours', subject: 'Maths', priority: 'high' },
    { title: 'Biology Revision', due: 'Tomorrow', subject: 'Biology', priority: 'medium' },
    { title: 'English Essay Draft', due: '3 days', subject: 'English', priority: 'low' },
  ]

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <motion.aside
        className="w-64 bg-dark-900 border-r border-white/[0.06] p-6 flex flex-col"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/">
          <motion.h1
            className="text-2xl font-bold text-gradient mb-10 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            TaskLoom
          </motion.h1>
        </Link>

        <nav className="flex-1 space-y-1.5">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-white/[0.08] text-white border border-white/10'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <motion.div
          className="mt-auto pt-6 divider"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3 px-3 py-3 surface-glass-hover rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold text-sm">
              JS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">John Smith</p>
              <p className="text-white/40 text-xs">GCSE Student</p>
            </div>
          </div>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-black">
        {/* Header */}
        <motion.header
          className="surface-glass backdrop-blur-xl border-b border-white/[0.06] px-8 py-6 sticky top-0 z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="heading-3 text-white mb-1.5">
                Welcome back, John ✨
              </h2>
              <p className="text-white/50 text-sm">Let's make today productive</p>
            </div>
            <motion.button
              className="btn-primary text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + New Task
            </motion.button>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <motion.main
          className="p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="stat-card p-6 group"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                <div className="relative z-10">
                  <p className="text-white/50 text-sm font-medium mb-3">{stat.label}</p>
                  <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1.5 text-green-400 text-sm">
                    <span>↑</span>
                    <span>12% from last week</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Upcoming Tasks */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 card"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Upcoming Tasks</h3>
                <motion.button
                  className="text-accent-purple hover:text-accent-purple-light transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.03 }}
                >
                  View All
                </motion.button>
              </div>

              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 surface-glass-hover rounded-xl cursor-pointer group"
                    whileHover={{ x: 3 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">
                        {task.title}
                      </h4>
                      <p className="text-white/40 text-xs mt-0.5">{task.subject}</p>
                    </div>
                    <div className="text-white/50 text-xs whitespace-nowrap">
                      {task.due}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="w-full mt-6 py-3.5 border-2 border-dashed border-white/[0.08] rounded-xl text-white/40 hover:text-white/70 hover:border-white/20 transition-all text-sm font-medium"
                whileHover={{ scale: 1.01 }}
              >
                + Add New Task
              </motion.button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                <div className="space-y-2">
                  {['Start Focus Session', 'Review Analytics', 'Update Schedule'].map((action, index) => (
                    <motion.button
                      key={index}
                      className="w-full py-3 surface-glass-hover rounded-lg text-white text-sm font-medium transition-all"
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {action}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div
                className="surface-elevated rounded-2xl p-6 relative overflow-hidden border border-accent-purple/30"
                whileHover={{ scale: 1.01 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/[0.08] to-accent-blue/[0.08]" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-bold text-white mb-2">Focus Mode</h3>
                  <p className="text-white/50 text-sm mb-5">
                    Eliminate distractions and get in the zone
                  </p>
                  <motion.button
                    className="btn-primary-accent w-full text-sm py-2.5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Start Session</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Placeholder message */}
          <motion.div
            variants={itemVariants}
            className="mt-10 card text-center py-12"
          >
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="heading-4 text-white mb-3">
              This is a <span className="text-gradient">placeholder</span> dashboard
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto text-sm leading-relaxed">
              The full TaskLoom experience is coming soon with advanced task management,
              intelligent scheduling, focus modes, and detailed analytics to help you
              excel in your academic journey.
            </p>
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
}

export default Dashboard
