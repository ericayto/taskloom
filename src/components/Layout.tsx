import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { useState, useRef, useEffect } from 'react'
import { BarChart3, CheckSquare, Calendar, BookOpen, Focus, Sparkles, ChevronRight, ChevronLeft, Settings, Lock } from 'lucide-react'
import { useStudyStore } from '../stores/useStudyStore'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useApp()
  const { currentSessionStatus } = useStudyStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/overview' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'planner', label: 'Planner', icon: Calendar, path: '/planner' },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, path: '/subjects' },
    { id: 'focus', label: 'Focus', icon: Focus, path: '/focus' },
    { id: 'review', label: 'Review', icon: Sparkles, path: '/review' },
  ]

  const isActive = (path: string) => location.pathname === path
  const isFocusActive = currentSessionStatus === 'active'

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

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    if (isFocusActive && path !== '/focus') {
      e.preventDefault()
      // Optional: Show toast or shake animation?
    }
  }

  return (
    <div className="h-screen bg-[#050505] flex relative overflow-hidden selection:bg-accent-purple/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-blue/5 rounded-full blur-[120px] opacity-50" />
      </div>

      {/* Sidebar */}
      <motion.aside
        className={`h-screen bg-[#0A0A0A]/50 backdrop-blur-xl border-r border-white/[0.06] flex flex-col relative z-10 transition-colors duration-300 ${isFocusActive ? 'opacity-50 pointer-events-none grayscale' : ''}`}
        initial={{ x: -20, opacity: 0 }}
        animate={{
          x: 0,
          opacity: isFocusActive ? 0.5 : 1,
          width: isCollapsed ? '80px' : '260px'
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Lock Overlay for Focus Mode */}
        {isFocusActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 text-center pointer-events-auto cursor-not-allowed group">
            <div className="bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl transform transition-transform group-hover:scale-105">
              <Lock className="w-6 h-6 text-white/60 mx-auto mb-2" />
              <p className="text-white text-xs font-medium">Focus in progress</p>
              <p className="text-white/40 text-[10px] mt-1">End session to navigate</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 p-6 pb-0">
          {!isCollapsed && (
            <Link to="/overview" className="flex items-center gap-2" onClick={(e) => handleNavigation('/overview', e)}>
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-black font-bold text-[10px]">
                <CheckSquare size={14} strokeWidth={3} />
              </div>
              <motion.h1
                className="text-lg font-bold text-white tracking-tight"
                whileHover={{ opacity: 0.8 }}
              >
                TaskLoom
              </motion.h1>
            </Link>
          )}
          <motion.button
            onClick={() => !isFocusActive && setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-all duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isFocusActive}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </motion.button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto pt-4">
          {sidebarItems.map((item) => {
            const active = isActive(item.path)
            const IconComponent = item.icon
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavigation(item.path, e)}
                className={isFocusActive && !active ? 'pointer-events-none' : ''}
              >
                <motion.div
                  className={`flex items-center rounded-xl cursor-pointer transition-all duration-200 group ${active
                    ? 'bg-white text-black shadow-lg shadow-white/5'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    } ${isCollapsed ? 'justify-center py-4 px-2' : 'gap-4 px-6 py-4'}`}
                  title={isCollapsed ? item.label : undefined}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent
                    className={`${active ? 'text-black' : 'group-hover:text-white'} transition-colors`}
                    size={20}
                    strokeWidth={2}
                  />
                  {!isCollapsed && (
                    <span className={`text-base ${active ? 'font-semibold' : 'font-medium'} whitespace-nowrap`}>
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
            className="mt-auto p-4 border-t border-white/[0.06] relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            ref={menuRef}
          >
            <motion.div
              onClick={() => !isFocusActive && setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group ${isFocusActive ? 'pointer-events-none' : ''}`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-accent-purple transition-colors">
                  {user?.name || 'Student'}
                </p>
                <p className="text-white/40 text-xs capitalize">
                  {user?.educationStage || 'Student'}
                </p>
              </div>
              <Settings size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
            </motion.div>

            {/* Dropup Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="absolute bottom-full left-4 right-4 mb-2 bg-dark-900 border border-white/10 rounded-xl overflow-hidden shadow-lg z-50"
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
