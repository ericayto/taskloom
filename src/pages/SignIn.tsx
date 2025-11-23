import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight, Check, Lock } from 'lucide-react'

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
    <div className="min-h-screen bg-[var(--sand-900)] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(246,196,83,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(248,114,158,0.12),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(114,231,194,0.12),transparent_35%)]" />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      <motion.div
        className="absolute top-8 left-8 text-sm text-white/70 hover:text-white transition-colors"
        initial={{ x: -12, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur hover:border-white/30">
          ← Back home
        </Link>
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hidden lg:block space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            <Lock size={14} /> Your flow, protected
          </div>
          <h1 className="text-4xl font-[var(--font-display)] font-semibold leading-tight">
            Welcome back. <br /> Pick up your rhythm.
          </h1>
          <p className="text-white/70 max-w-xl">
            Sign in to keep your anchors, focus sessions, and streaks in sync. Everything matches the new TaskLoom look—calm, warm, and intentional.
          </p>
          <div className="flex gap-3 flex-wrap">
            {['Navigation locks during focus', 'Gradient language across the app', 'Daily goals tied to tasks + time'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black flex items-center justify-center text-xs font-semibold shadow-black/30 shadow-md">
                  <Check size={14} />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md ml-auto">
          <div className="bg-black/60 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#f6c453] via-[#f8729e] to-[#72e7c2] rounded-2xl flex items-center justify-center text-black font-semibold shadow-black/30 shadow-lg">
                <Check size={18} strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">TaskLoom</p>
                <h2 className="text-xl font-semibold text-white">Sign in</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-[0.16em]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-[0.16em]">Password</label>
                  <a href="#" className="text-xs text-white/60 hover:text-white transition-colors">Forgot?</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black font-semibold shadow-lg shadow-black/25 hover:scale-[1.01] transition-transform"
              >
                Sign in
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-white/60">
              New here?{' '}
              <Link to="/signup" className="text-white font-semibold inline-flex items-center gap-1 hover:underline">
                Create an account <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignIn
