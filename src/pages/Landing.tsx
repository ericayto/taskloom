import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Check, Star, Target, BarChart3, Sparkles, Brain, Coffee, Moon,
  ArrowRight, Layout, Users, Shield, Focus
} from 'lucide-react'
import { cn } from '../lib/utils'
import { DotLoader } from '../components/ui/dot-loader'

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("Landing page mounted")
  }, [])

  const [activeFeature, setActiveFeature] = useState(0)
  const [persona, setPersona] = useState<'planner' | 'focus' | 'night'>('planner')

  // Pong animation frames for the dot loader
  const pongGame = [
    [14, 7, 0, 8, 6, 13, 20],
    [14, 7, 13, 20, 16, 27, 21],
    [14, 20, 27, 21, 34, 24, 28],
    [27, 21, 34, 28, 41, 32, 35],
    [34, 28, 41, 35, 48, 40, 42],
    [34, 28, 41, 35, 48, 42, 46],
    [34, 28, 41, 35, 48, 42, 38],
    [34, 28, 41, 35, 48, 30, 21],
    [34, 28, 41, 48, 21, 22, 14],
    [34, 28, 41, 21, 14, 16, 27],
    [34, 28, 21, 14, 10, 20, 27],
    [28, 21, 14, 4, 13, 20, 27],
    [28, 21, 14, 12, 6, 13, 20],
    [28, 21, 14, 6, 13, 20, 11],
    [28, 21, 14, 6, 13, 20, 10],
    [14, 6, 13, 20, 9, 7, 21],
  ]

  const features = [
    {
      title: "Organize",
      icon: Layout,
      description: "Bring order to chaos. Manage subjects, tasks, and deadlines in one beautiful workspace.",
      color: "from-blue-500 to-cyan-500",
      visual: (
        <div className="w-full h-full p-6 flex flex-col gap-4">
          {[
            { title: 'Physics', progress: 75, color: 'bg-blue-500', grade: 'A' },
            { title: 'Mathematics', progress: 45, color: 'bg-purple-500', grade: 'B+' },
            { title: 'History', progress: 90, color: 'bg-orange-500', grade: 'A-' },
          ].map((subject, i) => (
            <motion.div
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-lg ${subject.color} bg-opacity-20 flex items-center justify-center text-xs font-bold ${subject.color.replace('bg-', 'text-')}`}>
                {subject.title.substring(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-white/80">{subject.title}</span>
                  <span className="text-xs text-white/40">{subject.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                    className={`h-full ${subject.color}`}
                  />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold text-white/60 group-hover:border-white/30 group-hover:text-white transition-colors">
                {subject.grade}
              </div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: "Focus",
      icon: Focus,
      description: "Enter the flow state. Customizable timers and ambient modes to keep you locked in.",
      color: "from-purple-500 to-pink-500",
      visual: (
        <div className="w-full h-full flex items-center justify-center flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />

          {/* Timer Display */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold font-mono tracking-tighter text-white"
            >
              25:00
            </motion.div>

            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest">
              <Target size={12} />
              <span>Focus Time</span>
            </div>

            {/* DotLoader Animation */}
            <div className="h-16 flex items-center justify-center">
              <DotLoader
                frames={pongGame}
                duration={200}
                isPlaying={true}
                dotClassName="bg-white/20 [&.active]:bg-white size-1.5"
                className="gap-1"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Track",
      icon: BarChart3,
      description: "Visualize your progress. Gamified stats and insights to keep you motivated.",
      color: "from-amber-500 to-orange-500",
      visual: (
        <div className="w-full h-full p-8 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/40">
              <span>Level 5</span>
              <span>2,450 / 3,000 XP</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '82%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-32">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const height = [40, 70, 50, 90, 60, 80, 45][i]
              return (
                <div key={i} className="flex flex-col items-center gap-2 w-full group">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                    className="w-full bg-white/5 rounded-t-md relative overflow-hidden group-hover:bg-white/10 transition-colors"
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500/50 group-hover:h-full group-hover:bg-orange-500/20 transition-all duration-300" />
                  </motion.div>
                  <span className="text-[10px] text-white/30 font-medium">{day}</span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  ]

  const personas = {
    planner: {
      title: "The Architect",
      desc: "You love structure. TaskLoom gives you the blueprint to build your academic success, one block at a time.",
      icon: Brain,
      gradient: "from-blue-500 to-indigo-500"
    },
    focus: {
      title: "The Deep Diver",
      desc: "Distractions are your enemy. TaskLoom creates a sanctuary for your mind to explore complex topics without interruption.",
      icon: Coffee,
      gradient: "from-emerald-500 to-teal-500"
    },
    night: {
      title: "The Night Owl",
      desc: "Inspiration strikes at 2 AM. TaskLoom's dark mode and fluid workflow keep up with your late-night bursts of genius.",
      icon: Moon,
      gradient: "from-violet-500 to-purple-500"
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#000000] text-white overflow-x-hidden selection:bg-accent-purple/30 font-sans">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, #000 100%)' }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5 bg-black/50 supports-[backdrop-filter]:bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-white to-white/80 rounded-xl flex items-center justify-center text-black shadow-lg shadow-white/10 group-hover:scale-105 transition-transform duration-300">
              <Check size={24} strokeWidth={3} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">TaskLoom</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/signin" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/signup">
              <button className="group relative px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                <span className="relative flex items-center gap-2">
                  Get Started <ArrowRight size={16} />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple"></span>
              </span>
              <span className="text-sm font-medium text-white/80">Reimagined for 2025</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]"
            >
              Chaos, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple via-accent-pink to-accent-blue animate-gradient-x">Tamed.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-white/60 max-w-xl mb-12 leading-relaxed"
            >
              The all-in-one workspace that weaves together your tasks, subjects, and focus into one seamless, intelligent workflow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link to="/signup">
                <button className="h-14 px-8 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  Start for free
                </button>
              </Link>
              <Link to="/about">
                <button
                  className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <Sparkles size={18} className="text-accent-purple" />
                  See how it works
                </button>
              </Link>
            </motion.div>
          </div>

          {/* 3D Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -20, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: -10, rotateX: 5 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="relative hidden lg:block perspective-1000"
          >
            <div className="relative z-10 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-2 shadow-2xl shadow-purple-500/20 transform transition-transform hover:rotate-0 duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem] pointer-events-none" />
              <div className="bg-black rounded-[1.5rem] overflow-hidden border border-white/5 aspect-[4/3] relative">
                {/* Mock UI Header */}
                <div className="h-12 border-b border-white/10 flex items-center px-6 gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="h-6 w-32 bg-white/5 rounded-md ml-4" />
                </div>
                {/* Mock UI Body */}
                <div className="p-6 grid grid-cols-12 gap-6 h-full">
                  <div className="col-span-3 space-y-4">
                    <div className="h-8 w-full bg-white/5 rounded-lg" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-6 w-full bg-white/5 rounded-md opacity-50" />)}
                    </div>
                  </div>
                  <div className="col-span-9 space-y-6">
                    <div className="flex gap-4">
                      <div className="h-32 flex-1 bg-gradient-to-br from-purple-500/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-4">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/20 mb-4" />
                        <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                        <div className="h-8 w-16 bg-white/20 rounded" />
                      </div>
                      <div className="h-32 flex-1 bg-white/5 border border-white/10 rounded-2xl" />
                      <div className="h-32 flex-1 bg-white/5 border border-white/10 rounded-2xl" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 w-full bg-white/5 border border-white/5 rounded-xl flex items-center px-4 gap-4">
                          <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                          <div className="h-4 w-48 bg-white/10 rounded" />
                          <div className="ml-auto h-6 w-16 bg-white/5 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-12 top-20 bg-[#111] border border-white/10 p-4 rounded-2xl shadow-xl z-20 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                  <Check size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">Physics Essay</div>
                  <div className="text-xs text-white/50">Completed just now</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-8 bottom-20 bg-[#111] border border-white/10 p-4 rounded-2xl shadow-xl z-20 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Target size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">Focus Mode</div>
                  <div className="text-xs text-white/50">25m session started</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Feature Showcase */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">One app, <span className="text-white/40">infinite possibilities.</span></h2>
            <div className="flex flex-wrap justify-center gap-4">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={cn(
                    "px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border",
                    activeFeature === index
                      ? "bg-white text-black border-white scale-105"
                      : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = feature.icon
                      return <Icon size={16} />
                    })()}
                    {feature.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 backdrop-blur-sm">
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center mb-6 shadow-lg shadow-white/5`}>
                    {(() => {
                      const ActiveIcon = features[activeFeature].icon
                      return <ActiveIcon className="text-white" size={24} />
                    })()}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{features[activeFeature].title}</h3>
                  <p className="text-xl text-white/60 leading-relaxed">
                    {features[activeFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  User favorite
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/10" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-black bg-white/5 flex items-center justify-center text-[10px] font-bold">+2k</div>
                </div>
              </div>
            </div>

            <div className="aspect-square md:aspect-[4/3] bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  {features[activeFeature].visual}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Style Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-12">Designed for <span className="italic font-serif text-accent-purple">you.</span></h2>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {(Object.keys(personas) as Array<keyof typeof personas>).map((p) => (
              <button
                key={p}
                onClick={() => setPersona(p)}
                className={cn(
                  "p-6 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group",
                  persona === p
                    ? "bg-white/10 border-white/20 ring-1 ring-white/20"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                  personas[p].gradient,
                  persona === p ? "opacity-10" : "group-hover:opacity-5"
                )} />
                <div className="relative z-10">
                  <div className="mb-4 text-white/80">
                    {p === 'planner' && <Brain size={24} />}
                    {p === 'focus' && <Coffee size={24} />}
                    {p === 'night' && <Moon size={24} />}
                  </div>
                  <div className="font-bold text-lg mb-1">{personas[p].title}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="min-h-[180px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={persona}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden w-full"
              >
                <div className={cn(
                  "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
                  personas[persona].gradient
                )} />
                <motion.p
                  className="text-2xl md:text-3xl font-medium leading-relaxed text-white/90"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.015 } },
                    hidden: {}
                  }}
                >
                  {personas[persona].desc.split("").map((char, index) => (
                    <motion.span
                      key={index}
                      variants={{
                        hidden: { opacity: 0, y: 5 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Ready to <br />level up?</h2>
          <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto">
            Join thousands of students who have already transformed their academic journey with TaskLoom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 px-12 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                Get Started Now
              </button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/30">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-black font-bold text-xs">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="font-bold text-white/80">TaskLoom</span>
          </div>
          <div className="text-sm text-white/40">
            © 2025 TaskLoom. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Users size={20} /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Shield size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
