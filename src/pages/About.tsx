import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Target, Brain, Sparkles, Users, Shield, Heart } from 'lucide-react'
import { cn } from '../lib/utils'

const About = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#000000] text-white overflow-x-hidden selection:bg-accent-purple/30 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, #000 100%)' }} />
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
            </div>

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5 bg-black/50 supports-[backdrop-filter]:bg-black/20">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-white to-white/80 rounded-xl flex items-center justify-center text-black shadow-lg shadow-white/10 group-hover:scale-105 transition-transform duration-300">
                            <Check size={24} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">TaskLoom</span>
                    </Link>

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
            <section className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
                <motion.div
                    style={{ opacity, scale }}
                    className="text-center max-w-4xl mx-auto relative z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
                    >
                        <Sparkles size={14} className="text-accent-purple" />
                        <span className="text-sm font-medium text-white/80">Our Story</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]"
                    >
                        We believe in <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple via-accent-pink to-accent-blue animate-gradient-x">flow, not force.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
                    >
                        TaskLoom wasn't built to just manage tasks. It was built to manage your mind, helping you find clarity in the chaos of academic life.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
                >
                    <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
                </motion.div>
            </section>

            {/* The Problem */}
            <section className="py-32 px-6 relative">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="space-y-8"
                    >
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold">
                            The modern student is <span className="text-white/40">overwhelmed.</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-xl text-white/60 leading-relaxed">
                            Between assignments, exams, extracurriculars, and social life, your brain is constantly switching contexts. This fragmentation kills focus and breeds anxiety.
                        </motion.p>
                        <motion.p variants={fadeInUp} className="text-xl text-white/60 leading-relaxed">
                            Traditional tools are just digital lists. They don't understand *how* you work, *when* you're most productive, or *what* you need to focus on right now.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative aspect-square"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-[100px]" />
                        <div className="relative z-10 grid grid-cols-2 gap-4 p-8 border border-white/10 rounded-3xl bg-black/40 backdrop-blur-sm">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5 animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* The Solution */}
            <section className="py-32 px-6 relative bg-white/[0.02] border-y border-white/5">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative aspect-square md:order-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-[100px]" />
                        <div className="relative z-10 h-full border border-white/10 rounded-3xl bg-black/40 backdrop-blur-sm overflow-hidden flex items-center justify-center">
                            <div className="w-64 h-64 rounded-full border border-white/10 flex items-center justify-center relative">
                                <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
                                <div className="absolute inset-4 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                                <div className="w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <Target size={48} className="text-white relative z-10" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="space-y-8 md:order-1"
                    >
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold">
                            Enter <span className="text-accent-purple">TaskLoom.</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-xl text-white/60 leading-relaxed">
                            We reimagined the student workspace from the ground up. TaskLoom isn't just a planner; it's an operating system for your academic life.
                        </motion.p>
                        <motion.ul variants={fadeInUp} className="space-y-4">
                            {[
                                "Context-aware task management",
                                "Built-in focus tools based on Pomodoro",
                                "Gamified progress tracking",
                                "Beautiful, distraction-free interface"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-lg text-white/80">
                                    <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </motion.ul>
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-32 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Core Values</h2>
                        <p className="text-xl text-white/50 max-w-2xl mx-auto">The principles that guide every pixel we push.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Brain,
                                title: "Cognitive Clarity",
                                desc: "We design to reduce cognitive load, not add to it. Every feature must earn its place."
                            },
                            {
                                icon: Heart,
                                title: "Student First",
                                desc: "We build for the late nights, the exam stress, and the 'aha' moments. We've been there."
                            },
                            {
                                icon: Shield,
                                title: "Privacy & Trust",
                                desc: "Your academic data is yours. We don't sell it, share it, or spy on it."
                            }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <value.icon size={24} className="text-white/80" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                                <p className="text-white/60 leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, transparent 70%)' }} />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Join the movement.</h2>
                    <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto">
                        Experience the future of student productivity today.
                    </p>

                    <Link to="/signup">
                        <button className="h-14 px-12 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                            Get Started Now
                        </button>
                    </Link>
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

export default About
