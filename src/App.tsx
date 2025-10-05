import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Overview from './pages/Overview'
import Tasks from './pages/Tasks'
import Planner from './pages/Planner'
import Subjects from './pages/Subjects'
import Focus from './pages/Focus'
import Review from './pages/Review'

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
        <Route path="/review" element={<Review />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AppProvider>
  )
}

export default App
