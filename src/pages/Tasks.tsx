import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { useState, useMemo } from 'react'
import { Task } from '../types'
import { CustomSelect } from '../components/ui/custom-select'
import { DatePicker } from '../components/ui/date-picker'

const Tasks = () => {
  const { tasks, subjects, focusSessions, addTask, updateTask, deleteTask } = useApp()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [editMode, setEditMode] = useState(false)
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
    const newTask = await addTask({
      title: 'New Task',
      description: '',
      priority: 'medium',
      status: 'pending',
    })
    if (newTask) {
      setSelectedTask(newTask)
      setEditMode(true)
      setEditData({
        title: 'New Task',
        description: '',
        subjectId: '',
        dueDate: '',
        priority: 'medium',
      })
    }
  }

  const handleSaveTask = async () => {
    if (!selectedTask || !editData.title.trim()) return

    await updateTask(selectedTask.id, {
      title: editData.title,
      description: editData.description || undefined,
      subjectId: editData.subjectId || undefined,
      dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined,
      priority: editData.priority,
    })

    setEditMode(false)
    // Update selectedTask with new data
    const updatedTask = tasks.find(t => t.id === selectedTask.id)
    if (updatedTask) setSelectedTask(updatedTask)
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(selectedTask.id)
      setSelectedTask(null)
      setEditMode(false)
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'in-progress':
        return 'text-blue-400'
      default:
        return 'text-white/60'
    }
  }

  return (
    <Layout>
      <motion.header
        className="bg-dark-800/50 backdrop-blur-xl border-b border-white/5 px-8 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Tasks ✓</h2>
            <p className="text-white/60">Manage your tasks and assignments</p>
          </div>
          <motion.button
            onClick={handleAddTask}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add Task
          </motion.button>
        </div>
      </motion.header>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Side - Task List */}
        <div className="w-1/2 border-r border-white/10 overflow-auto p-8">
          {/* Filter Tabs */}
          <motion.div
            className="space-y-4 mb-6"
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === tab.value
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
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
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">No tasks yet</h3>
                <p className="text-white/50">Create your first task to get started</p>
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
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-12 ${getPriorityColor(displayPriority)} rounded-full transition-colors`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleComplete(task)
                            }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500'
                                : 'border-white/30'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {task.status === 'completed' && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </motion.button>
                          <h3
                            className={`text-base font-medium truncate ${
                              task.status === 'completed'
                                ? 'text-white/40 line-through'
                                : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50 ml-7">
                          {subject && <span>{subject.name}</span>}
                          {task.dueDate && <span>🗓️ {new Date(task.dueDate).toLocaleDateString()}</span>}
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
        <div className="w-1/2 overflow-auto p-8">
          {selectedTask ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Task Details</h3>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    onBlur={() => handleFieldBlur('title')}
                    disabled={selectedTask.status === 'completed'}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    onBlur={() => handleFieldBlur('description')}
                    disabled={selectedTask.status === 'completed'}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={4}
                    placeholder="Add notes about this task..."
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Subject</label>
                  {selectedTask.status === 'completed' ? (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50">
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
                <div>
                  <label className="block text-white/60 text-sm mb-2">Due Date</label>
                  <DatePicker
                    value={editData.dueDate}
                    onChange={(value) => {
                      setEditData({ ...editData, dueDate: value })
                      setTimeout(() => handleFieldBlur('dueDate'), 0)
                    }}
                    disabled={selectedTask.status === 'completed'}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Priority</label>
                  {selectedTask.status === 'completed' ? (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 capitalize">
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
                <div>
                  <label className="block text-white/60 text-sm mb-2">Total Focus Time</label>
                  <p className="text-white/80 text-2xl font-bold">{totalFocusTime} minutes</p>
                </div>

                {/* Delete Button */}
                <motion.button
                  onClick={handleDeleteTask}
                  className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Task
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-white/60">Select a task to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </Layout>
  )
}

export default Tasks
