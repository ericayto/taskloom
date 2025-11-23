import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Check } from 'lucide-react'

const SignIn = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to overview for demo purposes
    navigate('/overview')
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 relative overflow-hidden selection:bg-accent-purple/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-blue/5 rounded-full blur-[120px] opacity-50" />
      </div>

      {/* Back button */}
      <motion.div
        className="absolute top-8 left-8"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <button className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2">
            <span>←</span> Back
          </button>
        </Link>
      </motion.div>

      {/* Sign in form */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black font-bold mx-auto mb-6">
              <Check size={24} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-white/40">Sign in to continue to TaskLoom</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-white/40 hover:text-white transition-colors">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all mt-6 shadow-lg shadow-white/5"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/[0.08] text-center">
            <p className="text-white/40 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignIn
