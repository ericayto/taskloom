import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { CustomSelect } from '../components/ui/custom-select'

const SignUp = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    educationStage: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to overview for demo purposes
    navigate('/overview')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleEducationStageChange = (value: string) => {
    setFormData({
      ...formData,
      educationStage: value,
    })
  }

  const educationStages = [
    { value: 'gcse', label: 'GCSE' },
    { value: 'alevels', label: 'A-Levels' },
    { value: 'university', label: 'University' },
    { value: 'other', label: 'Other' },
  ]

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

      {/* Sign up form */}
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
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/40">Start your journey to academic excellence</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all"
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Education Stage</label>
              <div className="relative">
                <select
                  name="educationStage"
                  value={formData.educationStage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-[#0A0A0A] text-white/40">Select your stage</option>
                  {educationStages.map((stage) => (
                    <option key={stage.value} value={stage.value} className="bg-[#0A0A0A] text-white">
                      {stage.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all"
                placeholder="••••••••"
                required
              />
              <p className="text-[10px] text-white/30">
                At least 8 characters with a mix of letters and numbers
              </p>
            </div>

            <label className="flex items-start gap-3 text-sm text-white/60 cursor-pointer hover:text-white/80 transition-colors pt-2">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 accent-white"
                required
              />
              <span className="text-xs">
                I agree to the{' '}
                <a href="#" className="text-white hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-white hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all mt-6 shadow-lg shadow-white/5"
            >
              Create Account
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/[0.08] text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link to="/signin" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp
