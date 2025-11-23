import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useUserStore } from './stores/useUserStore'
import { useSubjectsStore } from './stores/useSubjectsStore'
import { useTasksStore } from './stores/useTasksStore'
import { useStudyStore } from './stores/useStudyStore'
import { useSettingsStore } from './stores/useSettingsStore'

import { useGamificationStore } from './stores/useGamificationStore'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Overview from './pages/Overview'
import Tasks from './pages/Tasks'
import Planner from './pages/Planner'
import Subjects from './pages/Subjects'
import Focus from './pages/Focus'

import About from './pages/About'
import ToastContainer from './components/ToastContainer'

function StoreInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize all stores on app mount
    const initStores = async () => {
      await Promise.all([
        useUserStore.getState().loadUser(),
        useSubjectsStore.getState().loadData(),
        useTasksStore.getState().loadData(),
        useStudyStore.getState().loadData(),
        useSettingsStore.getState().loadSettings(),

        useGamificationStore.getState().loadXPEvents(),
        useGamificationStore.getState().loadUnlockedAchievements(),
        useGamificationStore.getState().loadTodayGoal(),
      ])
    }

    initStores().catch((error) => {
      console.error('Failed to initialize stores:', error)
    })
  }, [])

  return <>{children}</>
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/focus" element={<Focus />} />

        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <StoreInitializer>
      <Router>
        <AnimatedRoutes />
        <ToastContainer />
      </Router>
    </StoreInitializer>
  )
}

export default App
