import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const SignIn = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to overview for demo purposes
    navigate('/overview')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="bg-grid-center" />

      {/* Back button */}
      <motion.div
        className="absolute top-8 left-8"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <motion.button
            className="btn-ghost text-sm"
            whileHover={{ x: -5 }}
          >
            <span>←</span> Back
          </motion.button>
        </Link>
      </motion.div>

      {/* Sign in form */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="surface-elevated rounded-3xl p-10 backdrop-blur-2xl"
          variants={itemVariants}
        >
          <motion.div className="mb-10" variants={itemVariants}>
            <Link to="/">
              <motion.h1
                className="text-3xl font-bold text-gradient mb-3 cursor-pointer inline-block"
                whileHover={{ scale: 1.05 }}
              >
                TaskLoom
              </motion.h1>
            </Link>
            <h2 className="heading-4 text-white mb-2">Welcome back</h2>
            <p className="text-white/50">Sign in to continue your journey</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} variants={itemVariants}>
            <div className="space-y-6">
              <div className="input-group">
                <label className="label">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 text-white/60 cursor-pointer hover:text-white/80 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-accent-purple"
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-accent-purple hover:text-accent-purple-light transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <motion.button
                type="submit"
                className="btn-primary w-full mt-8 text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </motion.button>
            </div>
          </motion.form>

          <motion.div
            className="mt-8 pt-8 divider text-center"
            variants={itemVariants}
          >
            <p className="text-white/50">
              Don't have an account?{' '}
              <Link to="/signup">
                <span className="text-accent-purple hover:text-accent-purple-light transition-colors cursor-pointer font-medium">
                  Sign up
                </span>
              </Link>
            </p>
          </motion.div>

          {/* Social sign in */}
          <motion.div className="mt-8" variants={itemVariants}>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full divider"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-dark-800 text-white/50">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                className="btn-social"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </motion.button>
              <motion.button
                className="btn-social"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SignIn
