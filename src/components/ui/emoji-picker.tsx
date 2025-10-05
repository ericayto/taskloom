import { useState } from 'react'
import { motion } from 'framer-motion'

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  className?: string
}

const EMOJIS = [
  '📚', '📖', '✏️', '📝', '🔬', '🧪', '🧬', '⚗️',
  '🔢', '➕', '➖', '✖️', '🌍', '🌎', '🌏', '🗺️',
  '🎨', '🎭', '🎪', '🎬', '💻', '⌨️', '🖥️', '📱',
  '🏃', '⚽', '🏀', '🎾', '🎵', '🎸', '🎹', '🎤',
  '🇬🇧', '🇫🇷', '🇪🇸', '🇩🇪', '🇮🇹', '🇯🇵', '🇨🇳', '🇰🇷',
  '🧮', '📐', '📏', '✂️', '🎓', '📜', '📋', '📊',
]

export const EmojiPicker = ({ value, onChange, className = '' }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 text-3xl"
      >
        {value || '➕'}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-50 top-full mt-2 left-0 bg-dark-800 border border-white/10 rounded-lg shadow-xl p-4 w-64"
          >
            <p className="text-white/60 text-xs mb-3">Select an emoji</p>
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onChange(emoji)
                    setIsOpen(false)
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
