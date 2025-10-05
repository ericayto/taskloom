import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const { user } = useApp()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊', path: '/overview' },
    { id: 'tasks', label: 'Tasks', icon: '✓', path: '/tasks' },
    { id: 'planner', label: 'Planner', icon: '🗓️', path: '/planner' },
    { id: 'subjects', label: 'Subjects', icon: '📚', path: '/subjects' },
    { id: 'focus', label: 'Focus', icon: '🎯', path: '/focus' },
    { id: 'review', label: 'Review', icon: '✨', path: '/review' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="h-screen bg-black flex relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Sidebar */}
      <motion.aside
        className="h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col relative z-10"
        initial={{ x: -20, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isCollapsed ? '80px' : '256px'
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <Link to="/overview">
              <motion.h1
                className="text-2xl font-bold text-gradient cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                TaskLoom
              </motion.h1>
            </Link>
          )}
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isCollapsed ? '→' : '←'}
          </motion.button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link key={item.id} to={item.path}>
                <div
                  className={`flex items-center rounded-lg transition-all relative overflow-hidden cursor-pointer ${
                    active
                      ? 'text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  } ${isCollapsed ? 'justify-center py-3 px-3' : 'gap-3 px-4 py-3 w-full'}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {active && !isCollapsed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                  {active && isCollapsed && (
                    <div className="absolute inset-0 bg-white/10 rounded-lg" />
                  )}

                  <span className="text-xl relative z-10">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap relative z-10">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {!isCollapsed && (
          <motion.div
            className="mt-auto pt-6 border-t border-white/5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 glass rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-white/40 text-xs capitalize">
                  {user?.educationStage || 'Student'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {children}
      </div>
    </div>
  )
}

export default Layout
