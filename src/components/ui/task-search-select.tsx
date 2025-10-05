import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskSearchSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

export const TaskSearchSelect = ({ value, onChange, options, placeholder = 'Search tasks...', className = '' }: TaskSearchSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchQuery('')
  }

  return (
    <>
      <div ref={containerRef} className={className}>
        <div
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-white/20"
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none text-white placeholder-white/40"
            />
          ) : (
            <span className={selectedOption ? 'text-white' : 'text-white/40'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
          {selectedOption && !isOpen && (
            <button
              onClick={handleClear}
              className="ml-2 text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

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
                top: position.top + 8,
                left: position.left,
                width: position.width,
                zIndex: 99999
              }}
              className="bg-[#000000] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
            >
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                    value === option.value ? 'bg-white/10 text-white' : 'text-white/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
