import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { generateId, getWeekStart, calculateBlockDuration } from '../utils/helpers'
import { suggestWeeklyPlan } from '../lib/ai'
import { StudyBlock } from '../types'
import { ButtonColorful } from '../components/ui/button-colorful'
import { CustomSelect } from '../components/ui/custom-select'

const Planner = () => {
  const { tasks, studyBlocks, subjects, addStudyBlock, addStudyBlocks, updateStudyBlock, deleteStudyBlock, addTask } = useApp()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskSubject, setNewTaskSubject] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [showAddBlock, setShowAddBlock] = useState<{day: number; date: Date} | null>(null)
  const [showViewMore, setShowViewMore] = useState<{day: number; date: Date; blocks: typeof studyBlocks} | null>(null)
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<typeof studyBlocks[0] | null>(null)
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set())
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [newBlockData, setNewBlockData] = useState({
    title: '',
    startTime: '09:00',
    endTime: '11:00',
    subjectId: '',
  })
  const [editBlockData, setEditBlockData] = useState({
    title: '',
    startTime: '09:00',
    endTime: '11:00',
    subjectId: '',
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const getBlocksForDay = (day: Date) => {
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)

    return studyBlocks
      .filter((block) => {
        const blockDate = new Date(block.date)
        blockDate.setHours(0, 0, 0, 0)
        return blockDate.getTime() === dayStart.getTime()
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const handleSuggestPlan = async () => {
    setIsGenerating(true)
    try {
      const suggestions = await suggestWeeklyPlan(tasks, studyBlocks)
      if (suggestions.length > 0) {
        await addStudyBlocks(suggestions)
      }
    } catch (error) {
      console.error('Failed to generate plan:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    await addTask({
      title: newTaskTitle,
      description: '',
      subjectId: newTaskSubject || undefined,
      priority: 'medium',
      status: 'pending',
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
    })

    setNewTaskTitle('')
    setNewTaskSubject('')
    setNewTaskDueDate('')
    setShowAddTask(false)
  }

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBlockData.title.trim() || !showAddBlock) return

    await addStudyBlock({
      title: newBlockData.title,
      date: showAddBlock.date,
      startTime: newBlockData.startTime,
      endTime: newBlockData.endTime,
      subjectId: newBlockData.subjectId || undefined,
      taskIds: [],
      completed: false,
    })

    setNewBlockData({ title: '', startTime: '09:00', endTime: '11:00', subjectId: '' })
    setShowAddBlock(null)
  }

  const handleEditBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editBlockData.title.trim() || !editingBlock) return

    await updateStudyBlock(editingBlock, {
      title: editBlockData.title,
      startTime: editBlockData.startTime,
      endTime: editBlockData.endTime,
      subjectId: editBlockData.subjectId || undefined,
    })

    setEditBlockData({ title: '', startTime: '09:00', endTime: '11:00', subjectId: '' })
    setEditingBlock(null)
  }

  const startEditBlock = (block: typeof studyBlocks[0]) => {
    setEditingBlock(block.id)
    setEditBlockData({
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      subjectId: block.subjectId || '',
    })
    setSelectedBlock(null)
  }

  const handleDeleteBlock = (blockId: string) => {
    deleteStudyBlock(blockId)
    setSelectedBlock(null)
  }

  const toggleBlockSelection = (blockId: string) => {
    const newSelection = new Set(selectedBlocks)
    if (newSelection.has(blockId)) {
      newSelection.delete(blockId)
    } else {
      newSelection.add(blockId)
    }
    setSelectedBlocks(newSelection)
  }

  const handleMultiDelete = async () => {
    for (const blockId of selectedBlocks) {
      await deleteStudyBlock(blockId)
    }
    setSelectedBlocks(new Set())
    setIsMultiSelectMode(false)
  }

  const handleCancelMultiSelect = () => {
    setSelectedBlocks(new Set())
    setIsMultiSelectMode(false)
  }

  const getSubjectColor = (subjectId?: string) => {
    if (!subjectId) return '#6b7280'
    const subject = subjects.find((s) => s.id === subjectId)
    return subject?.color || '#6b7280'
  }

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
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Weekly Planner 🗓️</h2>
            <p className="text-white/60">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-3">
            <ButtonColorful
              onClick={handleSuggestPlan}
              disabled={isGenerating}
              label={isGenerating ? '✨ Generating...' : '✨ Suggest Plan'}
            />
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
        {/* Today's Schedule */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Today's Schedule</h3>
            {!isMultiSelectMode ? (
              <motion.button
                onClick={() => setIsMultiSelectMode(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white/80 text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select Multiple
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  onClick={handleMultiDelete}
                  disabled={selectedBlocks.size === 0}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white text-sm transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete ({selectedBlocks.size})
                </motion.button>
                <motion.button
                  onClick={handleCancelMultiSelect}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white/80 text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            )}
          </div>
          <div className="glass rounded-xl p-6 backdrop-blur-2xl border border-white/10">
            {(() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const todayBlocks = studyBlocks
                .filter((block) => {
                  const blockDate = new Date(block.date)
                  blockDate.setHours(0, 0, 0, 0)
                  return blockDate.getTime() === today.getTime()
                })
                .sort((a, b) => a.startTime.localeCompare(b.startTime))

              if (todayBlocks.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🗓️</div>
                    <p className="text-white/60">No blocks scheduled for today</p>
                  </div>
                )
              }

              return (
                <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {todayBlocks.map((block, index) => {
                      const isSelected = selectedBlocks.has(block.id)
                      return (
                        <motion.div
                          key={block.id}
                          onClick={() => isMultiSelectMode && toggleBlockSelection(block.id)}
                          className={`flex items-center gap-4 p-4 rounded-lg border group relative overflow-hidden transition-all min-h-[80px] ${
                            isMultiSelectMode ? 'cursor-pointer' : ''
                          } ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500/50'
                              : 'bg-white/5 border-white/10'
                          }`}
                          initial={false}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, height: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          layout
                        >
                        {/* Gradient blur effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                        {/* Selection indicator */}
                        {isMultiSelectMode && (
                          <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded border-2 flex items-center justify-center z-10 transition-all ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white/10 border-white/30'
                          }`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                        )}

                        {/* Edit button */}
                        {!isMultiSelectMode && (
                          <button
                            onClick={() => setSelectedBlock(block)}
                            className="absolute top-2 right-2 z-10 text-white/40 hover:text-white transition-colors text-base leading-none p-1"
                          >
                            ⋯
                          </button>
                        )}

                        <div className={`flex-1 relative z-10 pr-8 ${isMultiSelectMode ? 'ml-8' : ''}`}>
                          <h4 className="text-white font-medium">{block.title}</h4>
                          {block.subjectId && (
                            <p className="text-white/40 text-sm">
                              {subjects.find(s => s.id === block.subjectId)?.name}
                            </p>
                          )}
                        </div>
                        <div className="text-white/60 text-sm relative z-10">
                          {block.startTime} - {block.endTime}
                        </div>
                        <div className="text-white/40 text-sm relative z-10">
                          {calculateBlockDuration(block.startTime, block.endTime)}m
                        </div>
                        {block.completed && (
                          <div className="text-green-400 text-sm font-medium relative z-10">✓ Done</div>
                        )}
                      </motion.div>
                      )
                    })}
                  </div>
                </AnimatePresence>
              )
            })()}
          </div>
        </motion.div>

        {/* Week Navigation */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            className="px-4 py-2 glass rounded-lg text-white border border-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Previous 7 Days
          </motion.button>
          <motion.button
            onClick={() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              setCurrentWeekStart(today)
            }}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Today
          </motion.button>
          <motion.button
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="px-4 py-2 glass rounded-lg text-white border border-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next 7 Days →
          </motion.button>
        </motion.div>

        {/* Weekly Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const blocks = getBlocksForDay(day)
            const isToday = new Date().toDateString() === day.toDateString()
            const maxVisible = 3
            const visibleBlocks = blocks.slice(0, maxVisible)
            const hiddenCount = blocks.length - maxVisible

            return (
              <div
                key={day.toISOString()}
                className={`glass rounded-xl p-4 backdrop-blur-2xl border ${
                  isToday ? 'border-white/30' : 'border-white/10'
                }`}
              >
                <div className="text-center mb-4">
                  <p className="text-white/60 text-xs font-medium uppercase">
                    {format(day, 'EEE')}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {format(day, 'd')}
                  </p>
                </div>

                <div className="space-y-2 h-[350px] flex flex-col">
                  <AnimatePresence mode="wait">
                    <div className="space-y-2 flex-1">
                      {visibleBlocks.map((block) => (
                        <motion.div
                          key={block.id}
                          className="p-3 rounded-lg border group relative overflow-hidden"
                          style={{
                            backgroundColor: `${getSubjectColor(block.subjectId)}20`,
                            borderColor: `${getSubjectColor(block.subjectId)}40`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Edit button */}
                        <button
                          onClick={() => setSelectedBlock(block)}
                          className="absolute top-1 right-1 z-10 text-white/40 hover:text-white transition-colors text-sm"
                        >
                          ⋯
                        </button>

                        <p className="text-white text-sm font-medium mb-1 relative z-10 pr-6">
                          {block.title}
                        </p>
                        <p className="text-white/60 text-xs relative z-10">
                          {block.startTime} - {block.endTime}
                        </p>
                        <p className="text-white/40 text-xs mt-1 relative z-10">
                          {calculateBlockDuration(block.startTime, block.endTime)}m
                        </p>
                      </motion.div>
                    ))}
                    </div>
                  </AnimatePresence>

                  {hiddenCount > 0 && (
                    <motion.button
                      onClick={() => setShowViewMore({ day: index, date: day, blocks })}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all text-xs font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      + {hiddenCount} more
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => setShowAddBlock({ day: index, date: day })}
                    className="w-full py-2 border-2 border-dashed border-white/10 rounded-lg text-white/40 hover:text-white hover:border-white/30 transition-all text-xs mt-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    + Add Block
                  </motion.button>
                </div>
              </div>
            )
          })}
        </motion.div>
      </motion.main>

      {/* Add Task Modal */}
      {showAddTask && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAddTask(false)}
        >
          <motion.form
            onSubmit={handleAddTask}
            className="glass rounded-2xl p-8 max-w-md w-full backdrop-blur-2xl border border-white/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Add New Task</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  placeholder="e.g., Math homework"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Subject (Optional)</label>
                <CustomSelect
                  value={newTaskSubject}
                  onChange={(value) => setNewTaskSubject(value)}
                  options={[
                    { value: '', label: 'No subject' },
                    ...subjects.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  placeholder="Select subject"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Due Date (Optional)</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  type="submit"
                  className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Task
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}

      {/* Add Block Modal */}
      {showAddBlock && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAddBlock(null)}
        >
          <motion.form
            onSubmit={handleAddBlock}
            className="glass rounded-2xl p-8 max-w-md w-full backdrop-blur-2xl border border-white/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-2">Add Study Block</h3>
            <p className="text-white/60 text-sm mb-6">
              {showAddBlock.date && format(showAddBlock.date, 'EEEE, MMMM d')}
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Block Title</label>
                <input
                  type="text"
                  value={newBlockData.title}
                  onChange={(e) => setNewBlockData({ ...newBlockData, title: e.target.value })}
                  placeholder="e.g., Study Math"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2 text-sm font-medium">Start Time</label>
                  <input
                    type="time"
                    value={newBlockData.startTime}
                    onChange={(e) => setNewBlockData({ ...newBlockData, startTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2 text-sm font-medium">End Time</label>
                  <input
                    type="time"
                    value={newBlockData.endTime}
                    onChange={(e) => setNewBlockData({ ...newBlockData, endTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Subject (Optional)</label>
                <CustomSelect
                  value={newBlockData.subjectId}
                  onChange={(value) => setNewBlockData({ ...newBlockData, subjectId: value })}
                  options={[
                    { value: '', label: 'No subject' },
                    ...subjects.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  placeholder="Select subject"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  type="submit"
                  className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Block
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setShowAddBlock(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}

      {/* Edit Block Modal */}
      {editingBlock && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setEditingBlock(null)}
        >
          <motion.form
            onSubmit={handleEditBlock}
            className="glass rounded-2xl p-8 max-w-md w-full backdrop-blur-2xl border border-white/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Edit Study Block</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Block Title</label>
                <input
                  type="text"
                  value={editBlockData.title}
                  onChange={(e) => setEditBlockData({ ...editBlockData, title: e.target.value })}
                  placeholder="e.g., Study Math"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2 text-sm font-medium">Start Time</label>
                  <input
                    type="time"
                    value={editBlockData.startTime}
                    onChange={(e) => setEditBlockData({ ...editBlockData, startTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2 text-sm font-medium">End Time</label>
                  <input
                    type="time"
                    value={editBlockData.endTime}
                    onChange={(e) => setEditBlockData({ ...editBlockData, endTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Subject (Optional)</label>
                <CustomSelect
                  value={editBlockData.subjectId}
                  onChange={(value) => setEditBlockData({ ...editBlockData, subjectId: value })}
                  options={[
                    { value: '', label: 'No subject' },
                    ...subjects.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  placeholder="Select subject"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  type="submit"
                  className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setEditingBlock(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}

      {/* View More Modal */}
      {showViewMore && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowViewMore(null)}
        >
          <motion.div
            className="glass rounded-2xl p-8 max-w-2xl w-full backdrop-blur-2xl border border-white/10 max-h-[80vh] overflow-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-2">All Blocks</h3>
            <p className="text-white/60 text-sm mb-6">
              {showViewMore.date && format(showViewMore.date, 'EEEE, MMMM d')}
            </p>

            <div className="space-y-3">
              {showViewMore.blocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 group relative overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                  {/* Edit button */}
                  <button
                    onClick={() => {
                      setShowViewMore(null)
                      setSelectedBlock(block)
                    }}
                    className="absolute top-2 right-2 z-10 text-white/40 hover:text-white transition-colors text-lg"
                  >
                    ⋯
                  </button>

                  <div className="flex-1 relative z-10 pr-8">
                    <h4 className="text-white font-medium">{block.title}</h4>
                    {block.subjectId && (
                      <p className="text-white/40 text-sm">
                        {subjects.find(s => s.id === block.subjectId)?.name}
                      </p>
                    )}
                  </div>
                  <div className="text-white/60 text-sm relative z-10">
                    {block.startTime} - {block.endTime}
                  </div>
                  <div className="text-white/40 text-sm relative z-10">
                    {calculateBlockDuration(block.startTime, block.endTime)}m
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={() => setShowViewMore(null)}
              className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Block Details Modal */}
      {selectedBlock && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedBlock(null)}
        >
          <motion.form
            onSubmit={(e) => {
              e.preventDefault()
              handleEditBlock(e)
            }}
            className="glass rounded-2xl p-8 max-w-md w-full backdrop-blur-2xl border border-white/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Block Details</h3>

            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-white/60 text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={editingBlock === selectedBlock.id ? editBlockData.title : selectedBlock.title}
                  onChange={(e) => {
                    if (editingBlock !== selectedBlock.id) {
                      setEditingBlock(selectedBlock.id)
                      setEditBlockData({
                        title: selectedBlock.title,
                        startTime: selectedBlock.startTime,
                        endTime: selectedBlock.endTime,
                        subjectId: selectedBlock.subjectId || '',
                      })
                    }
                    setEditBlockData({ ...editBlockData, title: e.target.value })
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Date</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                  {format(new Date(selectedBlock.date), 'EEEE, MMMM d')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Start Time</label>
                  <input
                    type="time"
                    value={editingBlock === selectedBlock.id ? editBlockData.startTime : selectedBlock.startTime}
                    onChange={(e) => {
                      if (editingBlock !== selectedBlock.id) {
                        setEditingBlock(selectedBlock.id)
                        setEditBlockData({
                          title: selectedBlock.title,
                          startTime: selectedBlock.startTime,
                          endTime: selectedBlock.endTime,
                          subjectId: selectedBlock.subjectId || '',
                        })
                      }
                      setEditBlockData({ ...editBlockData, startTime: e.target.value })
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">End Time</label>
                  <input
                    type="time"
                    value={editingBlock === selectedBlock.id ? editBlockData.endTime : selectedBlock.endTime}
                    onChange={(e) => {
                      if (editingBlock !== selectedBlock.id) {
                        setEditingBlock(selectedBlock.id)
                        setEditBlockData({
                          title: selectedBlock.title,
                          startTime: selectedBlock.startTime,
                          endTime: selectedBlock.endTime,
                          subjectId: selectedBlock.subjectId || '',
                        })
                      }
                      setEditBlockData({ ...editBlockData, endTime: e.target.value })
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Subject</label>
                <CustomSelect
                  value={editingBlock === selectedBlock.id ? editBlockData.subjectId : (selectedBlock.subjectId || '')}
                  onChange={(value) => {
                    if (editingBlock !== selectedBlock.id) {
                      setEditingBlock(selectedBlock.id)
                      setEditBlockData({
                        title: selectedBlock.title,
                        startTime: selectedBlock.startTime,
                        endTime: selectedBlock.endTime,
                        subjectId: selectedBlock.subjectId || '',
                      })
                    }
                    setEditBlockData({ ...editBlockData, subjectId: value })
                  }}
                  options={[
                    { value: '', label: 'No subject' },
                    ...subjects.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  placeholder="Select subject"
                />
              </div>
            </div>

            <div className="flex gap-3">
              {editingBlock === selectedBlock.id && (
                <motion.button
                  type="submit"
                  className="flex-1 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
              )}
              <motion.button
                type="button"
                onClick={() => handleDeleteBlock(selectedBlock.id)}
                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Delete
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  setSelectedBlock(null)
                  setEditingBlock(null)
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </Layout>
  )
}

export default Planner
