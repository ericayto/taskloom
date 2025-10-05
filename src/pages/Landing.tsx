import React, { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'

const Landing = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const features = [
    {
      icon: '📊',
      title: 'Overview',
      subtitle: 'Your command center',
      description: 'See what\'s next at a glance. Track your streak, view today\'s schedule, and jump into focus mode—zero friction.',
      color: '#8b5cf6',
    },
    {
      icon: '🗓️',
      title: 'Planner',
      subtitle: 'Plan with intelligence',
      description: 'Drag tasks into your week or let AI suggest the perfect schedule based on your deadlines and patterns.',
      color: '#3b82f6',
    },
    {
      icon: '📚',
      title: 'Subjects',
      subtitle: 'Everything organized',
      description: 'Manage subjects, track exam countdowns, generate topic lists with AI, and keep resources at your fingertips.',
      color: '#10b981',
    },
    {
      icon: '🎯',
      title: 'Focus',
      subtitle: 'Deep work mode',
      description: 'Pomodoro timer with session tracking, quick notes, and instant resource access. Pure focus, no distractions.',
      color: '#f59e0b',
    },
    {
      icon: '✨',
      title: 'Review',
      subtitle: 'Learn and adapt',
      description: 'Weekly AI insights, progress tracking, and actionable suggestions to keep improving your study game.',
      color: '#ec4899',
    },
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Subtle background grid */}
      <div className="bg-grid" />

      {/* Nav */}
      <motion.nav
        className="relative z-50 flex justify-between items-center container-padding py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-xl font-bold tracking-tight">TaskLoom</div>
        <div className="flex gap-3">
          <Link to="/signin">
            <motion.button
              className="btn-ghost text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </Link>
          <Link to="/signup">
            <motion.button
              className="px-6 py-2.5 text-sm bg-white text-black rounded-xl hover:bg-white/90 transition-all font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 section-padding pt-28 md:pt-40">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="pill mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm text-white/60">For students • GCSE → A-Levels → University</span>
          </motion.div>

          <h1 className="heading-1 mb-6">
            <ShimmerText>Study smarter,</ShimmerText>
            <br />
            <span className="text-gradient-purple">
              not harder
            </span>
          </h1>

          <p className="body-large mb-12 max-w-2xl mx-auto">
            Your complete study workspace. Plan, focus, and track progress with AI-powered tools designed for students who care.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <motion.button
                className="btn-primary px-8 py-4 text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free
              </motion.button>
            </Link>
            <motion.a
              href="#features"
              className="btn-secondary px-8 py-4 text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              See Features
            </motion.a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 max-w-4xl mx-auto">
            {[
              { value: 'Unlimited', label: 'Study Sessions', color: '#8b5cf6', icon: '∞' },
              { value: 'AI-Powered', label: 'Smart Planning', color: '#3b82f6', icon: '✨' },
              { value: 'Cross-Platform', label: 'Web & Mobile', color: '#10b981', icon: '📱' },
              { value: 'Free', label: 'Forever', color: '#ec4899', icon: '🎉' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="stat-card p-6 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${stat.color}08, transparent)` }}
                />
                <div className="relative z-10">
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 section-padding">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-20">
            <h2 className="heading-2 mb-4">
              Five tools, <span className="text-white/50">one workspace</span>
            </h2>
            <p className="body-large">Everything you need to excel academically</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                index={index}
                isHovered={hoveredCard === index}
                onHover={() => setHoveredCard(index)}
                onLeave={() => setHoveredCard(null)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 section-padding bg-white/[0.015]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="heading-2 mb-4">
              Simple <span className="text-white/50">workflow</span>
            </h2>
            <p className="body-large">Four steps to success</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', icon: '📚', title: 'Add Subjects', desc: 'Set up subjects, exams, topics', color: '#8b5cf6' },
              { num: '02', icon: '🗓️', title: 'Plan Week', desc: 'Schedule with AI or manually', color: '#3b82f6' },
              { num: '03', icon: '🎯', title: 'Focus Deep', desc: 'Pomodoro sessions with tracking', color: '#10b981' },
              { num: '04', icon: '✨', title: 'Review', desc: 'Weekly insights and improvements', color: '#ec4899' },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="surface-glass hover:bg-white/[0.06] transition-all duration-300 rounded-2xl p-6 overflow-hidden">
                  {/* Colored top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: step.color }} />

                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at top, ${step.color}10, transparent 70%)` }}
                  />

                  <div className="relative z-10">
                    {/* Large number watermark */}
                    <div className="absolute -top-2 -right-2 text-8xl font-bold opacity-[0.03]">{step.num}</div>

                    {/* Icon */}
                    <motion.div
                      className="text-5xl mb-4 inline-block"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {step.icon}
                    </motion.div>

                    {/* Step number badge */}
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-3" style={{ backgroundColor: `${step.color}15`, color: step.color }}>
                      <span className="text-xs font-bold">{step.num}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
                    <p className="text-sm text-white/70">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="relative z-10 section-padding">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-6xl mb-8">✨</div>
          <h2 className="heading-2 mb-6">
            AI that <span className="text-gradient-purple">assists</span>, never bosses
          </h2>
          <p className="body-large mb-16 max-w-2xl mx-auto">
            Smart suggestions, auto-generated topics, and insightful summaries—all optional, all editable, always under your control.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🧠', title: 'Smart Planning', desc: 'AI suggests optimal schedules' },
              { icon: '📝', title: 'Topic Generation', desc: 'Auto-generate subject topics' },
              { icon: '📊', title: 'Weekly Insights', desc: 'Personalized summaries' },
            ].map((item, i) => {
              const [isHovered, setIsHovered] = React.useState(false)

              return (
                <motion.div
                  key={i}
                  className="surface-glass hover:bg-white/[0.06] transition-all duration-300 rounded-2xl p-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  <motion.div
                    className="text-4xl mb-4 inline-block"
                    animate={isHovered ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1.1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {item.icon}
                  </motion.div>
                  <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="heading-2 mb-4">
              Simple <span className="text-white/50">pricing</span>
            </h2>
            <p className="body-large">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              className="card p-8 rounded-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2 text-white">Free</h3>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-white/50 ml-2">forever</span>
                </div>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-white/70">Unlimited study sessions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-white/70">Basic planner & calendar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-white/70">Subject & topic management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-white/70">Focus mode with Pomodoro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-white/70">Weekly review insights</span>
                  </li>
                </ul>
                <Link to="/signup">
                  <motion.button
                    className="btn-secondary w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              className="relative p-8 rounded-3xl overflow-hidden surface-elevated border-2 border-accent-purple/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-accent-blue/10 to-transparent" />

              {/* Popular badge */}
              <div className="absolute top-6 right-6 px-4 py-1.5 bg-accent-purple rounded-full text-xs font-bold">
                POPULAR
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-white">$4.99</span>
                  <span className="text-white/50 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-purple mt-1">✓</span>
                    <span className="text-white/70">Everything in Free</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-purple mt-1">✓</span>
                    <span className="text-white/70"><strong className="text-white">AI-powered</strong> study planning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-purple mt-1">✓</span>
                    <span className="text-white/70"><strong className="text-white">AI-generated</strong> topic lists</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-purple mt-1">✓</span>
                    <span className="text-white/70"><strong className="text-white">Advanced analytics</strong> & insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-purple mt-1">✓</span>
                    <span className="text-white/70">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-purple mt-1">✓</span>
                    <span className="text-white/70">Custom themes & personalization</span>
                  </li>
                </ul>
                <Link to="/signup">
                  <motion.button
                    className="btn-primary-accent w-full relative z-10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Upgrade to Pro</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 section-padding py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-2 mb-6">
            Ready to start?
          </h2>
          <p className="body-large mb-12">
            Join students achieving more with less stress
          </p>
          <Link to="/signup">
            <motion.button
              className="btn-primary px-12 py-5 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free ✨
            </motion.button>
          </Link>
          <p className="text-sm text-white/40 mt-8">
            No credit card • Free forever • Your data stays private
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container-padding py-8 divider text-center text-white/40 text-sm">
        <p>© 2024 TaskLoom. Built for students who care.</p>
      </footer>
    </div>
  )
}

// Shimmer Text Component
const ShimmerText = ({ children }: { children: string }) => {
  return (
    <span className="inline-block relative">
      <span className="relative inline-block">
        {children.split('').map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0.5 }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    </span>
  )
}

// Feature Card Component
interface FeatureCardProps {
  icon: string
  title: string
  subtitle: string
  description: string
  color: string
  index: number
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}

const FeatureCard = ({
  icon,
  title,
  subtitle,
  description,
  color,
  index,
  isHovered,
  onHover,
  onLeave
}: FeatureCardProps) => {
  return (
    <motion.div
      className="relative group h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="surface-glass hover:bg-white/[0.06] transition-all duration-300 rounded-2xl p-6 h-full overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}12, transparent 40%)`,
          }}
        />

        <div className="relative z-10">
          <motion.div
            className="text-5xl mb-4 inline-block"
            animate={isHovered ? {
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1.1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>

          <h3 className="text-xl font-semibold mb-1 text-white">{title}</h3>
          <p className="text-sm mb-3" style={{ color }}>
            {subtitle}
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default Landing
