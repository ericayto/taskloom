import { motion } from 'framer-motion'
import { Achievement } from '../../types'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
  unlockedAt?: Date
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

const AchievementBadge = ({
  achievement,
  unlocked,
  unlockedAt,
  size = 'md',
  showTooltip = true,
}: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  }

  const getBorderColor = () => {
    if (!unlocked) return 'border-white/20'

    switch (achievement.category) {
      case 'session':
        return 'border-blue-500/50'
      case 'streak':
        return 'border-orange-500/50'
      case 'time':
        return 'border-purple-500/50'
      case 'task':
        return 'border-green-500/50'
      case 'flashcard':
        return 'border-pink-500/50'
      default:
        return 'border-white/30'
    }
  }

  const getGlowColor = () => {
    if (!unlocked) return ''

    switch (achievement.category) {
      case 'session':
        return 'shadow-blue-500/30'
      case 'streak':
        return 'shadow-orange-500/30'
      case 'time':
        return 'shadow-purple-500/30'
      case 'task':
        return 'shadow-green-500/30'
      case 'flashcard':
        return 'shadow-pink-500/30'
      default:
        return ''
    }
  }

  return (
    <div className="group relative">
      <motion.div
        className={`
          ${sizeClasses[size]} rounded-xl border-2
          flex items-center justify-center
          ${getBorderColor()}
          ${unlocked ? `bg-white/10 ${getGlowColor()} shadow-lg` : 'bg-white/5'}
          ${unlocked ? 'cursor-pointer' : 'opacity-40 cursor-default'}
        `}
        whileHover={unlocked ? { scale: 1.1 } : undefined}
        whileTap={unlocked ? { scale: 0.95 } : undefined}
      >
        <span className={unlocked ? '' : 'grayscale opacity-50'}>
          {achievement.badge}
        </span>
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-dark-900 border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-xl min-w-[200px]">
            <h4 className="text-white font-bold text-sm mb-1">
              {achievement.name}
            </h4>
            <p className="text-white/60 text-xs mb-2">
              {achievement.description}
            </p>
            {unlocked && unlockedAt && (
              <p className="text-white/40 text-xs">
                Unlocked {new Date(unlockedAt).toLocaleDateString()}
              </p>
            )}
            {!unlocked && (
              <p className="text-white/40 text-xs italic">Locked</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AchievementBadge
