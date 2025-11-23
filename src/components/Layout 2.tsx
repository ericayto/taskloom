import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { useState, useRef, useEffect } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useApp()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊', path: '/overview' },
    { id: 'tasks', label: 'Tasks', icon: '📝', path: '/tasks' },
    { id: 'planner', label: 'Planner', icon: '🗓️', path: '/planner' },
    { id: 'subjects', label: 'Subjects', icon: '📚', path: '/subjects' },
    { id: 'focus', label: 'Focus', icon: '🎯', path: '/focus' },
    { id: 'flashcards', label: 'Flashcards', icon: '🎴', path: '/flashcards' },
    { id: 'review', label: 'Review', icon: '✨', path: '/review' },
    { id: 'stats', label: 'Stats', icon: '🏆', path: '/stats' },
  ]

  const isActive = (path: string) => location.pathname === path

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleSignOut = () => {
    // Clear user data and navigate to welcome screen
    localStorage.clear()
    navigate('/')
    window.location.reload()
  }

  return (
    <div className="h-screen bg-black flex relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Sidebar */}
      <motion.aside
        className="h-screen bg-black/40 backdrop-blur-2xl border-r border-white/[0.06] p-5 flex flex-col relative z-10"
        initial={{ x: -20, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isCollapsed ? '80px' : '240px'
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between mb-10">
          {!isCollapsed && (
            <Link to="/overview">
              <motion.h1
                className="text-xl font-bold text-white tracking-tight cursor-pointer"
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                TaskLoom
              </motion.h1>
            </Link>
          )}
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? '→' : '←'}
          </motion.button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link key={item.id} to={item.path}>
                <motion.div
                  className={`flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  } ${isCollapsed ? 'justify-center py-3.5 px-3' : 'gap-3.5 px-4 py-3'}`}
                  title={isCollapsed ? item.label : undefined}
                  whileHover={{ x: active ? 0 : 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`text-xl ${active ? 'scale-110' : ''} transition-transform duration-200`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'} whitespace-nowrap`}>
                      {item.label}
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {!isCollapsed && (
          <motion.div
            className="mt-auto pt-5 border-t border-white/[0.06] relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            ref={menuRef}
          >
            <motion.div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple/80 to-accent-blue/80 flex items-center justify-center text-white text-sm font-semibold">
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
            </motion.div>

            {/* Dropup Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="absolute bottom-full left-0 right-0 mb-2 bg-dark-900 border border-white/10 rounded-xl overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      // Account settings functionality will be added later
                    }}
                    className="w-full px-4 py-3 text-left text-white/60 hover:text-white hover:bg-white/[0.04] transition-all text-sm"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm border-t border-white/10"
                  >
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
