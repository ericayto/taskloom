import { motion } from 'framer-motion'
import { useApp } from '../hooks/useApp'
import Layout from '../components/Layout'
import { useState } from 'react'
import { addDays, format, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, RefreshCw, Wand2 } from 'lucide-react'

const Planner = () => {
  const { studyBlocks } = useApp()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    return startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  const hours = Array.from({ length: 18 }, (_, i) => i + 6) // 6 AM to 11 PM

  const getSubjectColor = (subjectId?: string) => {
    if (!subjectId) return 'bg-blue-500'
    // Map subject colors to tailwind classes or hex values
    // For now returning a default blue, but this should be dynamic
    return 'bg-blue-600'
  }

  return (
    <Layout>
      {/* Header */}
      <motion.header
        className="px-8 py-8 flex items-center justify-between flex-wrap gap-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 mb-3">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2]" />
              Weekly anchors
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Planner</h2>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-white min-w-[140px] text-center">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </span>
            <button 
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 text-sm font-medium transition-colors">
            <RefreshCw size={14} />
            Smart Reschedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform shadow-lg shadow-black/25">
            <Wand2 size={14} />
            Auto-Plan Week
          </button>
        </div>
      </motion.header>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden flex flex-col px-8 pb-8">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-white/10">
            <div className="p-4 border-r border-white/10 flex items-center justify-center bg-white/5">
              <span className="text-xs font-medium text-white/40">TIME</span>
            </div>
            {weekDays.map((day) => {
              const isToday = new Date().toDateString() === day.toDateString()
              return (
                <div 
                  key={day.toString()} 
                  className={`p-4 border-r border-white/10 last:border-r-0 text-center ${isToday ? 'bg-gradient-to-b from-[#f6c453]/10 via-[#f8729e]/10 to-transparent' : ''}`}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-white' : 'text-white/40'}`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-xl font-bold ${isToday ? 'text-white' : 'text-white'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="grid grid-cols-8 relative min-h-[1000px]">
              {/* Time Column */}
              <div className="border-r border-white/10 bg-white/5">
                {hours.map((hour) => (
                  <div key={hour} className="h-20 border-b border-white/5 relative">
                    <span className="absolute top-[-6px] right-4 text-xs text-white/20 font-mono">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Days Columns */}
              {weekDays.map((day) => (
                <div key={day.toString()} className="border-r border-white/10 last:border-r-0 relative">
                  {/* Grid Lines */}
                  {hours.map((hour) => (
                    <div key={hour} className="h-20 border-b border-white/5" />
                  ))}

                  {/* Blocks */}
                  {studyBlocks
                    .filter(block => {
                      const blockDate = new Date(block.date)
                      return blockDate.toDateString() === day.toDateString()
                    })
                    .map(block => {
                      const startHour = parseInt(block.startTime.split(':')[0])
                      const startMin = parseInt(block.startTime.split(':')[1])
                      const endHour = parseInt(block.endTime.split(':')[0])
                      const endMin = parseInt(block.endTime.split(':')[1])
                      
                      const startOffset = (startHour - 6) * 80 + (startMin / 60) * 80
                      const duration = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60 * 80

                      return (
                        <motion.div
                          key={block.id}
                          className="absolute left-1 right-1 rounded-md p-2 text-xs overflow-hidden cursor-pointer hover:brightness-110 transition-all border border-white/10"
                          style={{
                            top: `${startOffset}px`,
                            height: `${duration}px`,
                            backgroundColor: '#1e293b', // Default slate-800
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02, zIndex: 10 }}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSubjectColor(block.subjectId)}`} />
                          <div className="pl-2">
                            <div className="font-medium text-white truncate">{block.title}</div>
                            <div className="text-white/50 truncate">
                              {block.startTime} - {block.endTime}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Planner
