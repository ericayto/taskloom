import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../hooks/useApp'
import Layout from '../components/Layout'
import { useState, useMemo } from 'react'
import { Task } from '../types'
import { CustomSelect } from '../components/ui/custom-select'
import { DatePicker } from '../components/ui/date-picker'
import { CheckSquare, Calendar } from 'lucide-react'

const Tasks = () => {
  const { tasks, subjects, focusSessions, addTask, updateTask, deleteTask } = useApp()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  })

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = task.status === filter
    const subjectMatch = subjectFilter === 'all' || task.subjectId === subjectFilter
    return statusMatch && subjectMatch
  })

  const totalFocusTime = useMemo(() => {
    if (!selectedTask) return 0
    return focusSessions
      .filter(session => session.taskId === selectedTask.id && session.completed)
      .reduce((total, session) => total + session.durationMinutes, 0)
  }, [selectedTask, focusSessions])

  const handleAddTask = async () => {
    await addTask({
      title: 'New Task',
      description: '',
      priority: 'medium',
      status: 'pending',
    })
    // Wait a tick for state to update, then select the last task
    setTimeout(() => {
      const latestTask = tasks[tasks.length - 1]
      if (latestTask) {
        setSelectedTask(latestTask)
        setEditData({
          title: latestTask.title,
          description: latestTask.description || '',
          subjectId: latestTask.subjectId || '',
          dueDate: latestTask.dueDate ? new Date(latestTask.dueDate).toISOString().split('T')[0] : '',
          priority: latestTask.priority,
        })
      }
    }, 100)
  }

  const handleDeleteTask = () => {
    if (!selectedTask) return
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTask = async () => {
    if (!selectedTask) return
    await deleteTask(selectedTask.id)
    setSelectedTask(null)
    setShowDeleteConfirm(false)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setEditData({
      title: task.title,
      description: task.description || '',
      subjectId: task.subjectId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
    })
  }

  const handleFieldBlur = async (field: keyof typeof editData) => {
    if (!selectedTask) return

    const updates: Partial<Task> = {}

    if (field === 'title' && editData.title.trim()) {
      updates.title = editData.title
    } else if (field === 'description') {
      updates.description = editData.description || undefined
    } else if (field === 'subjectId') {
      updates.subjectId = editData.subjectId || undefined
    } else if (field === 'dueDate') {
      updates.dueDate = editData.dueDate ? new Date(editData.dueDate) : undefined
    } else if (field === 'priority') {
      updates.priority = editData.priority
    }

    if (Object.keys(updates).length > 0) {
      await updateTask(selectedTask.id, updates)
      // Force update selectedTask with new data
      setTimeout(() => {
        const updatedTask = tasks.find(t => t.id === selectedTask.id)
        if (updatedTask) setSelectedTask(updatedTask)
      }, 100)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    await updateTask(task.id, {
      status: task.status === 'completed' ? 'pending' : 'completed',
      completedAt: task.status === 'completed' ? undefined : new Date(),
    })
    if (selectedTask?.id === task.id) {
      const updatedTask = { ...task, status: task.status === 'completed' ? 'pending' as const : 'completed' as const }
      setSelectedTask(updatedTask)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-white/40'
    }
  }

  return (
    <Layout>
      <motion.header
        className="px-8 py-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 mb-3">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2]" />
              Anchors and assignments
            </div>
            <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">Tasks</h2>
            <p className="text-white/50 text-lg">Plan, prioritize, and finish without losing flow.</p>
          </div>
          <motion.button
            onClick={handleAddTask}
            className="px-6 py-3 bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black rounded-full font-semibold hover:scale-[1.02] transition-transform shadow-lg shadow-black/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add Task
          </motion.button>
        </div>
      </motion.header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row px-8 pb-8 gap-6">
        {/* Left Side - Task List */}
        <div className="w-full lg:w-1/2 card border-white/[0.08] overflow-hidden flex flex-col p-0">
          {/* Filter Tabs */}
          <motion.div
            className="p-6 border-b border-white/[0.08] space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex gap-2">
              {[
                { value: 'pending', label: 'To Do' },
                { value: 'completed', label: 'Completed' },
              ].map((tab) => (
                <motion.button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === tab.value
                      ? 'bg-white text-black'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Subject Filter */}
            <CustomSelect
              value={subjectFilter}
              onChange={setSubjectFilter}
              options={[
                { value: 'all', label: 'All Subjects' },
                ...subjects.map(s => ({ value: s.id, label: s.name }))
              ]}
              placeholder="Filter by subject"
            />
          </motion.div>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-2xl">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">No tasks yet</h3>
                <p className="text-white/40">Create your first task to get started</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const subject = subjects.find((s) => s.id === task.subjectId)
                const isSelected = selectedTask?.id === task.id
                const displayPriority = isSelected ? editData.priority : task.priority

                return (
                  <motion.div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                      isSelected
                        ? 'bg-white/[0.08] border-white/[0.1]'
                        : 'bg-transparent border-transparent hover:bg-white/[0.04]'
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-1.5 h-1.5 mt-2 rounded-full ${getPriorityColor(displayPriority)} shadow-[0_0_8px_currentColor] opacity-80`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleComplete(task)
                            }}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500 text-black'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {task.status === 'completed' && (
                              <CheckSquare size={12} strokeWidth={3} />
                            )}
                          </motion.button>
                          <h3
                            className={`text-base font-medium truncate transition-colors ${
                              task.status === 'completed'
                                ? 'text-white/40 line-through'
                                : 'text-white group-hover:text-white/90'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40 ml-8">
                          {subject && (
                            <span className="bg-white/[0.05] px-2 py-0.5 rounded text-white/60">
                              {subject.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side - Task Details */}
        <div className="w-1/2 card border-white/[0.08] overflow-hidden flex flex-col p-0">
          {selectedTask ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Task Details</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handleDeleteTask}
                    className="p-2 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <span className="sr-only">Delete</span>
                    🗑️
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    onBlur={() => handleFieldBlur('title')}
                    disabled={selectedTask.status === 'completed'}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all text-lg font-medium"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    onBlur={() => handleFieldBlur('description')}
                    disabled={selectedTask.status === 'completed'}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all resize-none min-h-[120px]"
                    placeholder="Add notes about this task..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Subject</label>
                    {selectedTask.status === 'completed' ? (
                      <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/50">
                        {subjects.find(s => s.id === editData.subjectId)?.name || 'No subject'}
                      </div>
                    ) : (
                      <CustomSelect
                        value={editData.subjectId}
                        onChange={(value) => {
                          setEditData({ ...editData, subjectId: value })
                          setTimeout(() => handleFieldBlur('subjectId'), 0)
                        }}
                        options={[
                          { value: '', label: 'No subject' },
                          ...subjects.map(s => ({ value: s.id, label: s.name }))
                        ]}
                        placeholder="Select subject"
                      />
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Due Date</label>
                    <DatePicker
                      value={editData.dueDate}
                      onChange={(value) => {
                        setEditData({ ...editData, dueDate: value })
                        setTimeout(() => handleFieldBlur('dueDate'), 0)
                      }}
                      disabled={selectedTask.status === 'completed'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Priority</label>
                    {selectedTask.status === 'completed' ? (
                      <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/50 capitalize">
                        {editData.priority}
                      </div>
                    ) : (
                      <CustomSelect
                        value={editData.priority}
                        onChange={(value) => {
                          setEditData({ ...editData, priority: value as any })
                          setTimeout(() => handleFieldBlur('priority'), 0)
                        }}
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'high', label: 'High' }
                        ]}
                        placeholder="Select priority"
                      />
                    )}
                  </div>

                  {/* Focus Time */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Total Focus Time</label>
                    <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center gap-2">
                      <span className="text-xl">⏱️</span>
                      <span className="text-white font-bold">{totalFocusTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full flex-col">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-4xl">👈</div>
              <p className="text-white/40 text-lg">Select a task to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                <span className="text-xl">🗑️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Task?</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-medium">"{selectedTask?.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTask}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Layout>
  )
}

export default Tasks
