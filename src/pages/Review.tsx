import { motion } from 'framer-motion'
import Layout from '../components/Layout'

const Review = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <Layout>
      {/* Header */}
      <motion.header
        className="bg-dark-800/50 backdrop-blur-xl border-b border-white/5 px-8 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Weekly Review</h2>
            <p className="text-white/60">Track your weekly progress and insights</p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="flex-1 overflow-auto p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="glass rounded-2xl p-16 backdrop-blur-2xl text-center"
          >
            <div className="text-8xl mb-6">🚧</div>
            <h3 className="text-3xl font-bold text-white mb-4">Coming Soon</h3>
            <p className="text-white/60 text-lg">
              We're building an amazing weekly review feature with AI-powered insights and personalized recommendations.
            </p>
          </motion.div>
        </div>
      </motion.main>
    </Layout>
  )
}

export default Review
