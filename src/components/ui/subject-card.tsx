import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface DriftingEmojiProps {
  emoji: string
  delay: number
}

const DriftingEmoji = ({ emoji, delay }: DriftingEmojiProps) => {
  const [position] = useState({
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10
  })

  return (
    <motion.div
      className="absolute text-2xl opacity-20 pointer-events-none"
      initial={{ x: `${position.x}%`, y: `${position.y}%` }}
      animate={{
        x: [`${position.x}%`, `${position.x + (Math.random() - 0.5) * 40}%`, `${position.x}%`],
        y: [`${position.y}%`, `${position.y + (Math.random() - 0.5) * 40}%`, `${position.y}%`],
        rotate: [0, 360]
      }}
      transition={{
        duration: 20 + Math.random() * 10,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
    >
      {emoji}
    </motion.div>
  )
}

interface SubjectCardProps {
  name: string
  emoji?: string
  color: string
  decoration?: 'shimmer' | 'emoji-drift'
  decorationEmoji?: string
  gradientHue?: number
  onClick?: () => void
  onEdit?: () => void
  children?: ReactNode
}

export const SubjectCard = ({
  name,
  emoji,
  color,
  decoration,
  decorationEmoji,
  gradientHue = 0,
  onClick,
  onEdit,
  children
}: SubjectCardProps) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-white/10 cursor-pointer group"
      style={{ backgroundColor: `${color}15` }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Dynamic Gradient Effect */}
      {decoration === 'shimmer' && (
        <>
          {/* Animated gradient - always animating but only visible on hover */}
          <motion.div
            className="absolute inset-0 opacity-100 group-hover:opacity-100"
            animate={{
              background: [
                `linear-gradient(-45deg,
                  hsl(${gradientHue || 180}, 40%, 22%),
                  hsl(${(gradientHue || 180) + 40}, 42%, 18%),
                  hsl(${(gradientHue || 180) + 80}, 40%, 22%),
                  hsl(${(gradientHue || 180) + 120}, 42%, 18%)
                )`,
                `linear-gradient(-45deg,
                  hsl(${(gradientHue || 180) + 40}, 42%, 18%),
                  hsl(${(gradientHue || 180) + 80}, 40%, 22%),
                  hsl(${(gradientHue || 180) + 120}, 42%, 18%),
                  hsl(${gradientHue || 180}, 40%, 22%)
                )`,
                `linear-gradient(-45deg,
                  hsl(${(gradientHue || 180) + 80}, 40%, 22%),
                  hsl(${(gradientHue || 180) + 120}, 42%, 18%),
                  hsl(${gradientHue || 180}, 40%, 22%),
                  hsl(${(gradientHue || 180) + 40}, 42%, 18%)
                )`,
                `linear-gradient(-45deg,
                  hsl(${gradientHue || 180}, 40%, 22%),
                  hsl(${(gradientHue || 180) + 40}, 42%, 18%),
                  hsl(${(gradientHue || 180) + 80}, 40%, 22%),
                  hsl(${(gradientHue || 180) + 120}, 42%, 18%)
                )`
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10 group-hover:opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </>
      )}

      {/* Drifting Emojis */}
      {decoration === 'emoji-drift' && decorationEmoji && (
        <>
          {[...Array(5)].map((_, i) => (
            <DriftingEmoji key={i} emoji={decorationEmoji} delay={i * 2} />
          ))}
        </>
      )}

      {/* Card Content */}
      <div className="relative z-10 p-6" onClick={onClick}>
        <div className="flex items-center gap-3 mb-4">
          {emoji && <span className="text-4xl">{emoji}</span>}
          <h3 className="text-2xl font-bold text-white">{name}</h3>
        </div>
        {children}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="mt-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors"
          >
            ✏️ Edit
          </button>
        )}
      </div>

    </motion.div>
  )
}
