import { motion } from 'framer-motion'

interface ProgressRingProps {
  progress: number // 0-1
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  value?: string
  icon?: string
}

const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#8b5cf6',
  label,
  value,
  icon,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && <div className="text-2xl mb-1">{icon}</div>}
        {value && (
          <p className="text-white font-bold text-lg leading-none">{value}</p>
        )}
        {label && (
          <p className="text-white/60 text-xs mt-1 text-center">{label}</p>
        )}
        {!value && !label && !icon && (
          <p className="text-white font-bold text-xl">
            {Math.round(progress * 100)}%
          </p>
        )}
      </div>
    </div>
  )
}

export default ProgressRing
