import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface DatePickerProps {
  value: string // YYYY-MM-DD format
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
}

export const DatePicker = ({ value, onChange, onBlur, disabled = false, className = '' }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value + 'T00:00:00') : null

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

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value + 'T00:00:00'))
    }
  }, [value])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const date = new Date(year, month, day)
    const dateString = date.toISOString().split('T')[0]
    onChange(dateString)
    setIsOpen(false)
    onBlur?.()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select date'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() &&
           currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear()
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return day === selectedDate.getDate() &&
           currentMonth.getMonth() === selectedDate.getMonth() &&
           currentMonth.getFullYear() === selectedDate.getFullYear()
  }

  const days = getDaysInMonth(currentMonth)

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
          {formatDisplayDate(value)}
        </span>
        <span className="text-white/60">🗓️</span>
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
                width: 240,
                zIndex: 99999
              }}
              className="bg-[#000000] border border-white/10 rounded-lg shadow-2xl p-2"
            >
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors text-xs"
                >
                  ←
                </button>
                <span className="text-white font-medium text-xs">
                  {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors text-xs"
                >
                  →
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-white/40 text-[10px] py-0.5">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day, index) => (
                  <div key={index}>
                    {day === null ? (
                      <div className="aspect-square" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={`aspect-square w-full rounded text-[10px] transition-colors ${
                          isSelected(day)
                            ? 'bg-white text-black font-bold'
                            : isToday(day)
                            ? 'bg-white/20 text-white font-medium'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Clear Button */}
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    setIsOpen(false)
                    onBlur?.()
                  }}
                  className="w-full mt-1.5 py-1 text-white/60 hover:text-white text-[10px] hover:bg-white/5 rounded transition-colors"
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
