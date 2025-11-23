import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Heart, ShieldCheck, Sparkles, Target, Users } from 'lucide-react'

const pillars = [
  {
    title: 'Clarity first',
    desc: 'We design to lower cognitive load so you can spend energy on learning, not juggling tabs.',
    icon: Target,
    tone: 'from-[#f6c453]/30 via-[#f29b38]/20 to-transparent',
  },
  {
    title: 'Warm technology',
    desc: 'Every interaction should feel human: gentle gradients, friendly copy, and calm micro-interactions.',
    icon: Heart,
    tone: 'from-[#f8729e]/30 via-[#f6c453]/20 to-transparent',
  },
  {
    title: 'Trust and focus',
    desc: 'Your data stays yours. Navigation locks protect your sessions; privacy and safety guide our defaults.',
    icon: ShieldCheck,
    tone: 'from-[#72e7c2]/30 via-[#8ae6ff]/20 to-transparent',
  },
]

const milestones = [
  { year: '2023', title: 'Prototype', detail: 'Built a scrappy planner for friends pulling exam all-nighters.' },
  { year: '2024', title: 'Focus engine', detail: 'Added ambient timers and navigation locks to protect deep work.' },
  { year: '2025', title: 'TaskLoom 2.0', detail: 'Unified design language across web + app with the warm sunset palette.' },
]

const values = [
  'Respect the student’s time and attention',
  'Celebrate steady progress over hustle theatre',
  'Design with intention—every pixel earns its place',
  'Keep the product fast, reliable, and offline-friendly',
]

const About = () => {
  return (
    <div className="min-h-screen bg-[var(--sand-900)] text-white overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(246,196,83,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(248,114,158,0.12),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(114,231,194,0.12),transparent_35%)]" />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f6c453] via-[#f8729e] to-[#72e7c2] flex items-center justify-center text-black font-semibold shadow-lg shadow-black/30 group-hover:scale-105 transition-transform">
              <Check size={18} strokeWidth={3} />
            </div>
            <span className="font-semibold text-lg tracking-tight group-hover:text-white/80 transition-colors">
              TaskLoom
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/signin" className="text-sm text-white/70 hover:text-white transition-colors">Sign in</Link>
            <Link to="/signup">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black font-semibold px-4 py-2 shadow-lg shadow-black/25 hover:scale-[1.02] transition-transform">
                Get started
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="pt-28 pb-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                <Sparkles size={14} /> The story behind the calm
              </div>
              <h1 className="text-5xl md:text-6xl font-[var(--font-display)] font-semibold leading-tight">
                Built for students who plan, focus, and breathe.
              </h1>
              <p className="text-white/70 text-lg max-w-2xl">
                TaskLoom started as a desperate fix for chaotic weeks. It became a warm, cohesive workspace that respects your time and attention—on web, mobile, and every page in between.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/signup">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white text-black font-semibold px-6 py-3 shadow-lg shadow-black/25 hover:scale-[1.02] transition-transform">
                    Try TaskLoom
                    <ArrowRight size={14} />
                  </span>
                </Link>
                <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-white/80 hover:text-white hover:border-white/40 transition-colors">
                  Back to product
                </Link>
              </div>
            </div>
            <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-[#f8729e]/10" />
              <div className="relative space-y-4">
                {milestones.map((step, idx) => (
                  <div key={step.year} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black font-semibold flex items-center justify-center shadow-black/30 shadow-lg">
                      {step.year}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-white/50">Milestone {idx + 1}</p>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-white/60">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.tone} opacity-70`} />
                <div className="relative z-10 space-y-3">
                  <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <pillar.icon size={18} />
                  </div>
                  <h3 className="text-xl font-semibold">{pillar.title}</h3>
                  <p className="text-white/70">{pillar.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="pb-16 px-6">
          <div className="max-w-6xl mx-auto rounded-[28px] border border-white/10 bg-white/5 p-8 md:p-12 shadow-2xl shadow-black/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/40">Principles</p>
                <h3 className="text-3xl md:text-4xl font-[var(--font-display)] font-semibold mt-2">What keeps us honest</h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                <Users size={16} />
                Built with students, not just for them
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {values.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black flex items-center justify-center text-xs font-semibold shadow-black/30 shadow-md">
                    <Check size={14} />
                  </div>
                  <p className="text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 px-6">
          <div className="max-w-5xl mx-auto rounded-[32px] border border-white/10 bg-gradient-to-r from-[#f6c453]/10 via-[#f8729e]/10 to-[#72e7c2]/10 p-10 text-center shadow-2xl shadow-black/40">
            <p className="text-sm uppercase tracking-[0.25em] text-white/50">Join the rhythm</p>
            <h3 className="text-4xl md:text-5xl font-[var(--font-display)] font-semibold mt-4 mb-4">
              Build the calmest version of your academic life.
            </h3>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              We’re refining TaskLoom with the same warm language across every page. Join us and keep the momentum.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <span className="inline-flex items-center gap-2 rounded-full bg-white text-black font-semibold px-8 py-3 shadow-lg shadow-black/25 hover:scale-[1.02] transition-transform">
                  Create my account
                  <ArrowRight size={16} />
                </span>
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-3 text-white/80 hover:text-white hover:border-white/40 transition-colors">
                Explore the product
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
            <Link to="/signup" className="hover:text-white">Get started</Link>
          </div>
          <p>© 2025 TaskLoom. Study calmly.</p>
        </div>
      </footer>
    </div>
  )
}

export default About
