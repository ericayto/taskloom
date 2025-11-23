import { motion } from 'framer-motion'
import { xpProgressToNextLevel } from '../../lib/gamification'

interface XPBarProps {
  totalXP: number
  showDetails?: boolean
  className?: string
}

const XPBar = ({ totalXP, showDetails = true, className = '' }: XPBarProps) => {
  const { currentLevel, currentLevelXP, nextLevelXP, progress } =
    xpProgressToNextLevel(totalXP)

  const xpIntoLevel = totalXP - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <span className="text-lg font-bold text-white">{currentLevel}</span>
            </div>
            <div>
              <p className="text-white/60 text-xs">Level {currentLevel}</p>
              <p className="text-white font-medium">
                {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Next Level</p>
            <p className="text-white font-medium">{currentLevel + 1}</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </motion.div>
      </div>

      {!showDetails && (
        <p className="text-xs text-white/60 text-center">
          Level {currentLevel} • {Math.round(progress * 100)}% to Level {currentLevel + 1}
        </p>
      )}
    </div>
  )
}

export default XPBar
