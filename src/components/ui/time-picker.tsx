import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TimePickerProps {
  value: string // HH:mm format
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
}

export const TimePicker = ({ value, onChange, onBlur, disabled = false, className = '' }: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const [hours, setHours] = useState('12')
  const [minutes, setMinutes] = useState('00')
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      const hour = parseInt(h)
      setHours(hour > 12 ? String(hour - 12).padStart(2, '0') : String(hour || 12).padStart(2, '0'))
      setMinutes(m)
      setPeriod(hour >= 12 ? 'PM' : 'AM')
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        onBlur?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur])

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        })
      }
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const handleTimeSelect = () => {
    let hour = parseInt(hours)
    if (period === 'PM' && hour !== 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0
    const timeString = `${String(hour).padStart(2, '0')}:${minutes}`
    onChange(timeString)
    setIsOpen(false)
    onBlur?.()
  }

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return 'Select time'
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const displayHour = hour > 12 ? hour - 12 : hour || 12
    const displayPeriod = hour >= 12 ? 'PM' : 'AM'
    return `${displayHour}:${m} ${displayPeriod}`
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-left flex items-center justify-between hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className={value ? 'text-white' : 'text-white/40'}>
          {formatDisplayTime(value)}
        </span>
        <span className="text-white/60">🕐</span>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                width: 200,
                zIndex: 99999
              }}
              className="bg-[#000000] border border-white/10 rounded-lg shadow-2xl p-3"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={hours}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (val >= 1 && val <= 12) setHours(String(val).padStart(2, '0'))
                  }}
                  className="w-14 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <span className="text-white">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (val >= 0 && val <= 59) setMinutes(String(val).padStart(2, '0'))
                  }}
                  className="w-14 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setPeriod('AM')}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      period === 'AM' ? 'bg-white text-black' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('PM')}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      period === 'PM' ? 'bg-white text-black' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTimeSelect}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                Set Time
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    setIsOpen(false)
                    onBlur?.()
                  }}
                  className="w-full mt-2 py-1 text-white/60 hover:text-white text-xs hover:bg-white/5 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
