import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  Clock3,
  Flame,
  Focus,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Waves,
  Zap,
} from 'lucide-react'
import { DotLoader } from '../components/ui/dot-loader'

type FeatureId = 'planner' | 'focus' | 'progress'

const heroSchedule = [
  {
    title: 'Essay outline',
    subject: 'History',
    time: '09:00',
    duration: '50m',
    accent: 'from-[#f6c453] to-[#f29b38]',
  },
  {
    title: 'Problem set',
    subject: 'Calculus',
    time: '12:30',
    duration: '40m',
    accent: 'from-[#f29b38] to-[#f8729e]',
  },
  {
    title: 'Lab review',
    subject: 'Biology',
    time: '16:00',
    duration: '30m',
    accent: 'from-[#f8729e] to-[#72e7c2]',
  },
]

const featureTabs: Array<{
  id: FeatureId
  title: string
  accent: string
  description: string
  icon: typeof LayoutDashboard
  highlights: string[]
}> = [
  {
    id: 'planner',
    title: 'Rhythmic planner',
    accent: 'from-[#f6c453] via-[#f29b38] to-[#f8729e]',
    description: 'Block tasks into calm weekly waves with buffers and priorities that make sense.',
    icon: LayoutDashboard,
    highlights: [
      'Auto-spaces deadlines before they snowball',
      'Drag blocks to rebalance heavy days instantly',
      'Subject colors keep your week readable at a glance',
    ],
  },
  {
    id: 'focus',
    title: 'Focus studio',
    accent: 'from-[#f8729e] via-[#72e7c2] to-[#8ae6ff]',
    description: 'Ambient timers, gentle micro-motions, and status locks keep you in the flow.',
    icon: Focus,
    highlights: [
      'Pomodoro & deep work modes with intentional breaks',
      'Session locks mute distractions across the workspace',
      'Ambient pulses and loaders so you feel time passing',
    ],
  },
  {
    id: 'progress',
    title: 'Progress you can feel',
    accent: 'from-[#72e7c2] via-[#f6c453] to-[#f29b38]',
    description: 'See streaks, minutes, and wins stack into a story you trust.',
    icon: BookOpenCheck,
    highlights: [
      'Daily goals tied to focus minutes and completed tasks',
      'Level-up moments delivered as soft, celebratory toasts',
      'Momentum view shows when you thrive—mornings or nights',
    ],
  },
]

const flowSteps = [
  {
    title: 'Plan your week',
    description: 'Pin anchors, then let TaskLoom pace the rest with built-in buffers.',
    icon: Clock3,
    tone: 'text-[#f6c453] bg-[#f6c453]/10 border-[#f6c453]/30',
  },
  {
    title: 'Protect focus',
    description: 'Start a session, lock navigation, and settle into ambient clarity.',
    icon: Timer,
    tone: 'text-[#f8729e] bg-[#f8729e]/10 border-[#f8729e]/30',
  },
  {
    title: 'Reflect with intent',
    description: 'See streaks, steady minutes, and the small wins that keep you moving.',
    icon: Sparkles,
    tone: 'text-[#72e7c2] bg-[#72e7c2]/10 border-[#72e7c2]/30',
  },
]

const trustSignals = [
  { label: 'Students onboarded', value: '4,200+' },
  { label: 'Average streak', value: '9.4 days' },
  { label: 'Tasks finished on time', value: '93%' },
]

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('planner')

  const renderFeatureVisual = () => {
    switch (activeFeature) {
      case 'planner':
        return (
          <div className="relative h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-[#f8729e]/15" />
            <div className="relative flex flex-col gap-4">
              {heroSchedule.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 flex items-center justify-center text-sm font-semibold">
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold">{item.title}</p>
                      <span className="text-xs text-white/50">{item.duration}</span>
                    </div>
                    <p className="text-sm text-white/50">{item.subject}</p>
                    <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full w-[68%] rounded-full bg-gradient-to-r ${item.accent}`} />
                    </div>
                  </div>
                  <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
                    On track
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      case 'focus':
        return (
          <div className="relative h-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f0d0b] via-[#121111] to-[#0b0b0c] p-6 overflow-hidden shadow-2xl shadow-black/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(246,196,83,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(248,114,158,0.14),transparent_40%)]" />
            <div className="relative flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">Focus Session</p>
                <div className="text-5xl font-semibold font-[var(--font-display)] text-white">24:12</div>
                <p className="text-white/50 text-sm">Deep work • Navigation locked</p>
              </div>
              <DotLoader
                frames={[
                  [2, 5, 10, 13, 18, 22],
                  [5, 8, 12, 15, 20, 24],
                  [8, 12, 16, 20, 24, 28],
                  [5, 8, 12, 15, 20, 24],
                ]}
                duration={260}
                isPlaying
                dotClassName="bg-white/20 [&.active]:bg-white size-2"
                className="gap-2"
              />
              <div className="w-full grid grid-cols-3 gap-3">
                {['Ambient cafe', 'No notifications', 'Auto break in 6m'].map((chip) => (
                  <div
                    key={chip}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-white/70"
                  >
                    {chip}
                  </div>
                ))}
              </div>
              <div className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#f8729e]/20 text-[#f8729e] flex items-center justify-center">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Energy steady</p>
                    <p className="text-xs text-white/50">Ride the wave • don’t sprint</p>
                  </div>
                </div>
                <span className="text-xs text-white/60">+50 XP</span>
              </div>
            </div>
          </div>
        )
      case 'progress':
        return (
          <div className="relative h-full rounded-3xl border border-white/10 bg-white/5 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#72e7c2]/10 via-transparent to-[#f6c453]/10" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/40">Streak</p>
                  <p className="text-4xl font-semibold text-white">12 days</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 flex items-center gap-2">
                  <Sparkles size={16} />
                  Momentum is compounding
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Weekly minutes', value: '486', tone: 'from-[#f6c453] to-[#f29b38]' },
                  { label: 'Tasks done', value: '7', tone: 'from-[#f29b38] to-[#f8729e]' },
                  { label: 'Wins logged', value: '4', tone: 'from-[#72e7c2] to-[#8ae6ff]' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/40">{stat.label}</p>
                    <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
                    <div className={`mt-3 h-1.5 w-full rounded-full bg-gradient-to-r ${stat.tone}`} />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Early bird bonus', detail: 'Session started at 07:20', icon: Flame },
                  { title: 'Task master', detail: '3 of 3 anchors finished', icon: Target },
                  { title: 'Weekly review ready', detail: 'Reflect on what worked today', icon: ShieldCheck },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f6c453]">
                      <item.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-white/50">{item.detail}</p>
                    </div>
                    <Check size={16} className="text-[#72e7c2]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[var(--sand-900)] text-white overflow-hidden relative">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(246,196,83,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(248,114,158,0.08),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(114,231,194,0.08),transparent_35%)]" />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f6c453] via-[#f8729e] to-[#72e7c2] flex items-center justify-center text-black font-semibold shadow-lg shadow-black/30 group-hover:scale-105 transition-transform">
              <Check size={20} strokeWidth={3} />
            </div>
            <span className="font-semibold text-lg tracking-tight group-hover:text-white/80 transition-colors">
              TaskLoom
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm text-white/70">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#flow" className="hover:text-white transition-colors">How it works</a>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/signin" className="text-sm text-white/70 hover:text-white transition-colors">Sign in</Link>
            <Link to="/signup">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.35)] hover:scale-[1.02] transition-transform">
                Start free
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-lg shadow-black/30">
                <Sparkles size={14} />
                Built for students who plan and do
              </div>
              <h1 className="text-5xl md:text-6xl font-[var(--font-display)] font-semibold leading-[1.05] tracking-tight">
                Plan with clarity.
                <br />
                <span className="text-gradient">Study with calm.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-2xl">
                TaskLoom weaves your tasks, subjects, and focus sessions into one warm, dependable workflow. No more chaos—just a rhythm that fits how you actually learn.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/signup">
                  <span className="inline-flex items-center gap-3 rounded-2xl px-6 py-3 bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black font-semibold shadow-lg shadow-black/25 hover:scale-[1.02] transition-transform">
                    Start planning free
                    <ArrowRight size={16} />
                  </span>
                </Link>
                <a href="#product" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-white/80 hover:text-white hover:border-white/30 transition-colors">
                  See the product
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                {trustSignals.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur">
                    <p className="text-white font-semibold">{item.value}</p>
                    <p className="text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-white/40">Today</p>
                    <p className="text-xl font-semibold">Steady, not rushed</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 flex items-center gap-2">
                    <Waves size={14} />
                    Balanced
                  </div>
                </div>
                <div className="space-y-3">
                  {heroSchedule.map((item) => (
                    <motion.div
                      key={item.title}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 flex items-center justify-center text-sm font-semibold">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold">{item.title}</p>
                          <span className="text-xs text-white/50">{item.duration}</span>
                        </div>
                        <p className="text-sm text-white/50">{item.subject}</p>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div className={`h-full w-[64%] rounded-full bg-gradient-to-r ${item.accent}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-white/50">Focus session</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-white">25:00</p>
                      <span className="text-xs text-white/50">Pomodoro</span>
                    </div>
                    <DotLoader
                      frames={[
                        [1, 4, 8, 12, 16, 20],
                        [4, 7, 11, 15, 19, 23],
                        [7, 11, 15, 19, 23, 27],
                        [4, 7, 11, 15, 19, 23],
                      ]}
                      duration={250}
                      isPlaying
                      dotClassName="bg-white/15 [&.active]:bg-white size-1.5"
                      className="gap-1 mt-2"
                    />
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                      <Timer size={14} />
                      Auto-break scheduled
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-wide text-white/50">Wins today</p>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-[#f6c453]/20 text-[#f6c453] flex items-center justify-center">
                        <Flame size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Streak secured</p>
                        <p className="text-xs text-white/50">12 days and counting</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-[#72e7c2]/20 text-[#72e7c2] flex items-center justify-center">
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Anchors done</p>
                        <p className="text-xs text-white/50">3/3 priority tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product */}
        <section id="product" className="pb-20 px-6">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.25em] text-white/40">Product</p>
                <h2 className="text-4xl md:text-5xl font-[var(--font-display)] font-semibold leading-tight">
                  Everything you need to plan, focus, and finish—beautifully aligned.
                </h2>
                <p className="text-white/65 max-w-2xl">
                  Every interaction—from buttons to session locks—shares one visual language so the whole experience feels cohesive, warm, and intentional.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {featureTabs.map((feature) => {
                  const Icon = feature.icon
                  const isActive = activeFeature === feature.id
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                        isActive
                          ? 'border-white/30 bg-white/10 text-white shadow-lg shadow-black/20'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      {feature.title}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-stretch">
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {featureTabs.map((feature) => {
                    if (feature.id !== activeFeature) return null
                    return (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center text-black shadow-lg shadow-black/20`}>
                            <feature.icon size={18} />
                          </div>
                          <h3 className="text-2xl font-semibold">{feature.title}</h3>
                        </div>
                        <p className="text-white/70 leading-relaxed">{feature.description}</p>
                        <div className="space-y-3">
                          {feature.highlights.map((item) => (
                            <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#72e7c2]">
                                <Check size={14} />
                              </div>
                              <p className="text-white/80">{item}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              <div className="min-h-[460px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    className="h-full"
                  >
                    {renderFeatureVisual()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="pb-20 px-6">
          <div className="max-w-7xl mx-auto rounded-[32px] border border-white/10 bg-white/5 p-8 md:p-12 shadow-2xl shadow-black/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/40">Flow</p>
                <h3 className="text-3xl md:text-4xl font-[var(--font-display)] font-semibold mt-2">A simple arc every day</h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                <ShieldCheck size={16} />
                Navigation locks during focus to protect your flow
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {flowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent" />
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${step.tone}`}>
                    <step.icon size={14} />
                    Step {index + 1}
                  </div>
                  <h4 className="text-xl font-semibold mt-3 mb-2">{step.title}</h4>
                  <p className="text-white/65 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 px-6">
          <div className="max-w-5xl mx-auto rounded-[32px] border border-white/10 bg-gradient-to-r from-[#f6c453]/10 via-[#f8729e]/10 to-[#72e7c2]/10 p-10 text-center shadow-2xl shadow-black/40">
            <p className="text-sm uppercase tracking-[0.25em] text-white/50">Join the rhythm</p>
            <h3 className="text-4xl md:text-5xl font-[var(--font-display)] font-semibold mt-4 mb-4">
              Welcome your future self with calmer days.
            </h3>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Start with the core workflow: plan anchors, protect focus, celebrate wins. Everything else stays out of your way.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <span className="inline-flex items-center gap-2 rounded-full bg-white text-black font-semibold px-8 py-3 shadow-lg shadow-black/25 hover:scale-[1.02] transition-transform">
                  Create my plan
                  <ArrowRight size={16} />
                </span>
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-3 text-white/80 hover:text-white hover:border-white/40 transition-colors">
                See how TaskLoom thinks
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/40 backdrop-blur py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f6c453] via-[#f8729e] to-[#72e7c2] flex items-center justify-center text-black font-semibold shadow-lg shadow-black/30">
              <Check size={18} strokeWidth={3} />
            </div>
            TaskLoom
          </div>
          <div className="flex items-center gap-6">
            <Link to="/signin" className="hover:text-white">Sign in</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/signup" className="hover:text-white">Get started</Link>
          </div>
          <p>© 2025 TaskLoom. Study calmly.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
