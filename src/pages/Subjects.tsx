import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../hooks/useApp'
import Layout from '../components/Layout'
import { useState, useMemo, useEffect } from 'react'
import { getSubjectColor } from '../utils/helpers'
import { generateTopics } from '../lib/ai'
import { EmojiPicker } from '../components/ui/emoji-picker'
import { CustomSelect } from '../components/ui/custom-select'
import { DatePicker } from '../components/ui/date-picker'
import { TimePicker } from '../components/ui/time-picker'
import { SubjectCard } from '../components/ui/subject-card'
import { Exam, Resource, TopicConfidence } from '../types'

const Subjects = () => {
  const {
    subjects,
    exams,
    topics,
    resources,
    addSubject,
    updateSubject,
    deleteSubject,
    addExam,
    deleteExam,
    addTopic,
    addTopics,
    updateTopic,
    deleteTopic,
    addResource,
    deleteResource,
  } = useApp()

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'exams' | 'topics' | 'resources'>('exams')
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showAddExam, setShowAddExam] = useState(false)
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [showAddResource, setShowAddResource] = useState(false)
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false)
  const [topicGroupFilter, setTopicGroupFilter] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(new Set())
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [showDeleteTopicsConfirm, setShowDeleteTopicsConfirm] = useState(false)
  const [showEditSubject, setShowEditSubject] = useState(false)
  const [editingSubject, setEditingSubject] = useState<{
    id: string
    name: string
    emoji: string
    examBoard: string
    decoration: 'shimmer' | 'emoji-drift'
    decorationEmoji: string
    gradientHue: number
  } | null>(null)

  const colorPresets = [
    { name: 'Teal', hue: 180 },
    { name: 'Blue', hue: 220 },
    { name: 'Purple', hue: 280 },
    { name: 'Pink', hue: 320 },
    { name: 'Red', hue: 0 },
    { name: 'Orange', hue: 30 },
    { name: 'Yellow', hue: 50 },
    { name: 'Green', hue: 140 },
  ]

  const [newSubject, setNewSubject] = useState({
    name: '',
    examBoard: '',
    emoji: '',
    gradientHue: 180
  })
  const [newExam, setNewExam] = useState({ name: '', date: '', time: '' })
  const [newTopic, setNewTopic] = useState({ name: '', group: '', parentTopicId: '' })
  const [newResource, setNewResource] = useState<{ name: string; type: 'link' | 'file' | 'note' | 'folder'; url: string; parentFolderId: string }>({ name: '', type: 'link', url: '', parentFolderId: '' })
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [resourceSortBy, setResourceSortBy] = useState<'name' | 'type' | 'date'>('name')
  const [topicSearchQuery, setTopicSearchQuery] = useState('')

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId)
  const subjectExams = useMemo(
    () => exams.filter((e) => e.subjectId === selectedSubjectId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [exams, selectedSubjectId]
  )

  const upcomingExams = useMemo(
    () => subjectExams.filter((e) => {
      const examDateTime = new Date(e.date)
      if (e.time) {
        const [hours, minutes] = e.time.split(':')
        examDateTime.setHours(parseInt(hours), parseInt(minutes))
      }
      return examDateTime.getTime() >= currentTime.getTime()
    }),
    [subjectExams, currentTime]
  )

  const completedExams = useMemo(
    () => subjectExams.filter((e) => {
      const examDateTime = new Date(e.date)
      if (e.time) {
        const [hours, minutes] = e.time.split(':')
        examDateTime.setHours(parseInt(hours), parseInt(minutes))
      }
      return examDateTime.getTime() < currentTime.getTime()
    }),
    [subjectExams, currentTime]
  )
  const subjectTopics = useMemo(
    () => topics.filter((t) => t.subjectId === selectedSubjectId && !t.parentTopicId).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [topics, selectedSubjectId]
  )

  const getChildTopics = (parentId: string) => {
    return topics
      .filter((t) => t.parentTopicId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }
  const subjectResources = useMemo(
    () => resources.filter((r) => r.subjectId === selectedSubjectId),
    [resources, selectedSubjectId]
  )

  const currentFolderResources = useMemo(() => {
    let filtered = subjectResources.filter((r) =>
      (currentFolderId ? r.parentFolderId === currentFolderId : !r.parentFolderId)
    )

    // Sort resources
    return filtered.sort((a, b) => {
      switch (resourceSortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          // Folders first, then by type
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return a.type.localeCompare(b.type)
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })
  }, [subjectResources, currentFolderId, resourceSortBy])

  const currentFolder = currentFolderId
    ? resources.find(r => r.id === currentFolderId)
    : null

  const folderPath = useMemo(() => {
    const path: Resource[] = []
    let folderId = currentFolderId
    while (folderId) {
      const folder = resources.find(r => r.id === folderId)
      if (folder) {
        path.unshift(folder)
        folderId = folder.parentFolderId || null
      } else {
        break
      }
    }
    return path
  }, [currentFolderId, resources])

  const topicGroups = useMemo(() => {
    const groups = new Set(subjectTopics.map(t => t.group).filter(Boolean) as string[])
    return ['all', ...Array.from(groups)]
  }, [subjectTopics])

  const filteredTopics = useMemo(() => {
    let topics = topicGroupFilter === 'all' ? subjectTopics : subjectTopics.filter(t => t.group === topicGroupFilter)

    // Apply search filter - includes parent topics and subtopics
    if (topicSearchQuery.trim()) {
      const query = topicSearchQuery.toLowerCase()
      // Get all topics (including subtopics) that match
      const allMatchingTopics = subjectTopics.filter(t =>
        t.name.toLowerCase().includes(query) ||
        (t.group && t.group.toLowerCase().includes(query))
      )

      // For search results, we want to show all matching topics (both parents and children)
      topics = allMatchingTopics
    }

    return topics
  }, [subjectTopics, topicGroupFilter, topicSearchQuery])

  // Calculate topic progress stats
  const topicStats = useMemo(() => {
    const total = subjectTopics.length
    const mastered = subjectTopics.filter(t => t.confidence === 'mastered').length
    const confident = subjectTopics.filter(t => t.confidence === 'confident').length
    const moderate = subjectTopics.filter(t => t.confidence === 'moderate').length
    const struggling = subjectTopics.filter(t => t.confidence === 'struggling').length
    const notStarted = subjectTopics.filter(t => !t.confidence || t.confidence === 'not-started').length

    return { total, mastered, confident, moderate, struggling, notStarted }
  }, [subjectTopics])

  // Live countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const getCountdown = (exam: Exam) => {
    const examDateTime = new Date(exam.date)

    if (exam.time) {
      const [hours, minutes] = exam.time.split(':')
      examDateTime.setHours(parseInt(hours), parseInt(minutes))
    }

    const diff = examDateTime.getTime() - currentTime.getTime()
    if (diff < 0) return 'Past'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const secs = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) return `${days}d ${hours}h ${mins}m`
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`
    return `${mins}m ${secs}s`
  }

  const getConfidenceColor = (confidence?: TopicConfidence) => {
    switch (confidence) {
      case 'mastered': return '#10b981' // green
      case 'confident': return '#3b82f6' // blue
      case 'moderate': return '#f59e0b' // amber
      case 'struggling': return '#ef4444' // red
      case 'not-started': return '#6b7280' // gray
      default: return '#6b7280'
    }
  }

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    await addSubject({
      name: newSubject.name,
      color: getSubjectColor(subjects.length),
      emoji: newSubject.emoji || undefined,
      examBoard: newSubject.examBoard || undefined,
      decoration: 'shimmer',
      gradientHue: newSubject.gradientHue,
    })
    setNewSubject({ name: '', examBoard: '', emoji: '', gradientHue: 180 })
    setShowAddSubject(false)
  }

  const handleDeleteSubject = (subject: { id: string; name: string }) => {
    setDeleteConfirm({ type: 'subject', id: subject.id, name: subject.name })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    switch (deleteConfirm.type) {
      case 'subject':
        await deleteSubject(deleteConfirm.id)
        if (selectedSubjectId === deleteConfirm.id) setSelectedSubjectId(null)
        break
      case 'exam':
        await deleteExam(deleteConfirm.id)
        break
      case 'topic':
        await deleteTopic(deleteConfirm.id)
        break
      case 'resource':
        await deleteResource(deleteConfirm.id)
        break
    }

    setDeleteConfirm(null)
  }

  const confirmDeleteTopics = async () => {
    for (const topicId of selectedTopics) {
      await deleteTopic(topicId)
    }
    setSelectedTopics(new Set())
    setShowDeleteTopicsConfirm(false)
  }

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId) return
    await addExam({
      subjectId: selectedSubjectId,
      name: newExam.name,
      date: new Date(newExam.date),
      time: newExam.time || undefined,
    })
    setNewExam({ name: '', date: '', time: '' })
    setShowAddExam(false)
  }

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId || !newTopic.name.trim()) return

    const parentTopics = topics.filter(t =>
      t.subjectId === selectedSubjectId &&
      (!newTopic.parentTopicId || t.parentTopicId === newTopic.parentTopicId)
    )

    await addTopic({
      subjectId: selectedSubjectId,
      name: newTopic.name,
      group: newTopic.group || undefined,
      parentTopicId: newTopic.parentTopicId || undefined,
      order: parentTopics.length,
    })
    setNewTopic({ name: '', group: '', parentTopicId: '' })
    setShowAddTopic(false)
  }

  const handleGenerateTopics = async () => {
    if (!selectedSubject) return
    setIsGeneratingTopics(true)
    try {
      const generatedTopics = await generateTopics(selectedSubject.name)
      const topicsToAdd = generatedTopics.map((name, index) => ({
        subjectId: selectedSubject.id,
        name,
        order: subjectTopics.length + index,
      }))
      await addTopics(topicsToAdd)
    } catch (error) {
      console.error('Failed to generate topics:', error)
    } finally {
      setIsGeneratingTopics(false)
    }
  }

  const toggleTopicCollapse = (topicId: string) => {
    setCollapsedTopics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(topicId)) {
        newSet.delete(topicId)
      } else {
        newSet.add(topicId)
      }
      return newSet
    })
  }

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId) return
    await addResource({
      subjectId: selectedSubjectId,
      name: newResource.name,
      type: newResource.type,
      url: newResource.url || undefined,
      parentFolderId: newResource.parentFolderId || undefined,
    })
    setNewResource({ name: '', type: 'link', url: '', parentFolderId: '' })
    setShowAddResource(false)
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'folder': return '📁'
      case 'link': return '🔗'
      case 'file': return '📄'
      case 'note': return '📝'
      default: return '📄'
    }
  }

  const handleEditSubject = (subject: typeof subjects[0]) => {
    setEditingSubject({
      id: subject.id,
      name: subject.name,
      emoji: subject.emoji || '',
      examBoard: subject.examBoard || '',
      decoration: subject.decoration || 'shimmer',
      decorationEmoji: subject.decorationEmoji || '🧮',
      gradientHue: subject.gradientHue || 180
    })
    setShowEditSubject(true)
  }

  const handleSaveEditSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubject) return

    await updateSubject(editingSubject.id, {
      name: editingSubject.name,
      emoji: editingSubject.emoji || undefined,
      examBoard: editingSubject.examBoard || undefined,
      decoration: editingSubject.decoration,
      decorationEmoji: editingSubject.decorationEmoji || undefined,
      gradientHue: editingSubject.gradientHue
    })

    setEditingSubject(null)
    setShowEditSubject(false)
  }

  if (selectedSubject) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <motion.header
            className="bg-dark-800/50 backdrop-blur-xl border-b border-white/5 px-8 py-6 z-20 flex-shrink-0"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedSubjectId(null)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                >
                  ←
                </button>
                <div className="flex items-center gap-3">
                  {selectedSubject.emoji && <span className="text-4xl">{selectedSubject.emoji}</span>}
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedSubject.name}</h2>
                    {selectedSubject.examBoard && (
                      <p className="text-white/60 text-sm">{selectedSubject.examBoard}</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteSubject({ id: selectedSubject.id, name: selectedSubject.name })}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white text-sm transition-colors"
              >
                Delete Subject
              </button>
            </div>
          </motion.header>

          {/* Tab Navigation */}
          <div className="border-b border-white/10 px-8 flex-shrink-0">
            <div className="flex gap-6">
              {[
                { id: 'exams', label: 'Exams', icon: '📝' },
                { id: 'topics', label: 'Topics', icon: '📚' },
                { id: 'resources', label: 'Resources', icon: '🔗' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-white text-white'
                      : 'border-transparent text-white/60 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col overflow-hidden w-full">
            {/* Exams Tab */}
            {activeTab === 'exams' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Exams</h3>
                  <button
                    onClick={() => setShowAddExam(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    + Add
                  </button>
                </div>

                {/* Upcoming Exams */}
                {upcomingExams.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Upcoming</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingExams.map((exam) => (
                        <motion.div
                          key={exam.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-lg"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white font-medium">{exam.name}</h4>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'exam', id: exam.id, name: exam.name })}
                              className="text-white/40 hover:text-red-400 transition-colors text-sm"
                            >
                              🗑
                            </button>
                          </div>
                          <p className="text-white/60 text-sm">
                            {new Date(exam.date).toLocaleDateString()}
                            {exam.time && ` at ${exam.time}`}
                          </p>
                          <p className="text-white/80 text-sm mt-1">
                            ⏱ {getCountdown(exam)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Exams */}
                {completedExams.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white/60">Completed</h4>
                      <button
                        onClick={async () => {
                          for (const exam of completedExams) {
                            await deleteExam(exam.id)
                          }
                        }}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-xs transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedExams.map((exam) => (
                        <motion.div
                          key={exam.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-lg opacity-60"
                          whileHover={{ scale: 1.02, opacity: 0.8 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white font-medium">{exam.name}</h4>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'exam', id: exam.id, name: exam.name })}
                              className="text-white/40 hover:text-red-400 transition-colors text-sm"
                            >
                              🗑
                            </button>
                          </div>
                          <p className="text-white/60 text-sm">
                            {new Date(exam.date).toLocaleDateString()}
                            {exam.time && ` at ${exam.time}`}
                          </p>
                          <p className="text-green-400 text-sm mt-1">
                            ✓ Completed
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {subjectExams.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-8">No exams yet</p>
                )}
              </motion.div>
            )}

            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <motion.div
                className="flex flex-col h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Header - Fixed */}
                <div className="flex-shrink-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">Topics</h3>
                      {selectedTopics.size > 0 && (
                        <button
                          onClick={() => setShowDeleteTopicsConfirm(true)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                        >
                          🗑 Delete {selectedTopics.size}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateTopics}
                        disabled={isGeneratingTopics}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors disabled:opacity-50"
                      >
                        {isGeneratingTopics ? 'Generating...' : '✨ AI Generate'}
                      </button>
                      <button
                        onClick={() => setShowAddTopic(true)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={topicSearchQuery}
                      onChange={(e) => setTopicSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredTopics.length === 1) {
                          const topicElement = document.getElementById(`topic-${filteredTopics[0].id}`)
                          topicElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          topicElement?.classList.add('ring-2', 'ring-white')
                          setTimeout(() => {
                            topicElement?.classList.remove('ring-2', 'ring-white')
                          }, 2000)
                        }
                      }}
                      placeholder="Search topics..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    {topicSearchQuery && filteredTopics.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-dark-900 border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                        {filteredTopics.slice(0, 10).map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => {
                              const topicElement = document.getElementById(`topic-${topic.id}`)
                              topicElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              topicElement?.classList.add('ring-2', 'ring-white')
                              setTimeout(() => {
                                topicElement?.classList.remove('ring-2', 'ring-white')
                              }, 2000)
                              setTopicSearchQuery('')
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                          >
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getConfidenceColor(topic.confidence) }}
                            />
                            <span className="text-white text-sm">{topic.name}</span>
                            {topic.group && (
                              <span className="ml-auto text-xs text-white/40">{topic.group}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress Legend & Stats */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-white/60 text-xs font-medium">Confidence:</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-xs text-white/60">Not Started ({topicStats.notStarted})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-white/60">Struggling ({topicStats.struggling})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-white/60">Moderate ({topicStats.moderate})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-white/60">Confident ({topicStats.confident})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-white/60">Mastered ({topicStats.mastered})</span>
                      </div>
                    </div>
                  </div>

                  {topicGroups.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {topicGroups.map(group => (
                        <button
                          key={group}
                          onClick={() => setTopicGroupFilter(group)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            topicGroupFilter === group
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {group === 'all' ? 'All' : group}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Topics List - Scrollable */}
                <div className="flex-1 border border-white/[0.06] rounded-lg p-3 overflow-y-auto overflow-x-visible">
                  <div className="space-y-1.5">
                  {filteredTopics.map((topic) => {
                    const childTopics = getChildTopics(topic.id)
                    const isCollapsed = collapsedTopics.has(topic.id)
                    const hasChildren = childTopics.length > 0

                    return (
                      <div key={topic.id}>
                        <div id={`topic-${topic.id}`} className="group flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-all duration-200">
                          {/* Checkbox for multi-select */}
                          <input
                            type="checkbox"
                            checked={selectedTopics.has(topic.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedTopics)
                              if (e.target.checked) {
                                newSelected.add(topic.id)
                              } else {
                                newSelected.delete(topic.id)
                              }
                              setSelectedTopics(newSelected)
                            }}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-2 focus:ring-accent-purple/50 flex-shrink-0 cursor-pointer"
                          />

                          {/* Expand/Collapse for children */}
                          {hasChildren ? (
                            <button
                              onClick={() => toggleTopicCollapse(topic.id)}
                              className="text-white/40 hover:text-white transition-colors text-sm flex-shrink-0 w-4 text-center"
                            >
                              {isCollapsed ? '▶' : '▼'}
                            </button>
                          ) : (
                            <div className="w-4 flex-shrink-0"></div>
                          )}

                          {/* Topic name - flexible width */}
                          <h4 className="text-white text-sm font-medium flex-1 truncate min-w-0">{topic.name}</h4>

                          {/* Group badge */}
                          {topic.group && (
                            <span className="px-2 py-0.5 bg-white/10 text-white/50 text-xs rounded flex-shrink-0">
                              {topic.group}
                            </span>
                          )}

                          {/* Confidence selector - compact dropdown */}
                          <div className="flex-shrink-0 relative group/conf">
                            <button
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-xs"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getConfidenceColor(topic.confidence) }}
                              />
                              <span className="text-white/80">
                                {(topic.confidence || 'not-started').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </span>
                            </button>
                            {/* Dropdown menu - opens to the left */}
                            <div className="absolute right-full top-0 mr-2 bg-dark-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/conf:opacity-100 group-hover/conf:visible transition-all min-w-[160px] py-1 z-50">
                              {[
                                { value: 'not-started', label: 'Not Started', color: '#6b7280' },
                                { value: 'struggling', label: 'Struggling', color: '#ef4444' },
                                { value: 'moderate', label: 'Moderate', color: '#f59e0b' },
                                { value: 'confident', label: 'Confident', color: '#3b82f6' },
                                { value: 'mastered', label: 'Mastered', color: '#10b981' }
                              ].map((conf) => (
                                <button
                                  key={conf.value}
                                  onClick={() => updateTopic(topic.id, { confidence: conf.value as TopicConfidence })}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left text-xs first:rounded-t-lg last:rounded-b-lg"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: conf.color }}
                                  />
                                  <span className="text-white/80">{conf.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Add Subtopic Button - Prominent */}
                          <button
                            onClick={() => {
                              setNewTopic({ name: '', group: topic.group || '', parentTopicId: topic.id })
                              setShowAddTopic(true)
                            }}
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all hover:scale-110 text-white text-lg font-bold"
                            title="Add subtopic"
                          >
                            +
                          </button>
                        </div>

                        {/* Nested/Child Topics */}
                        {hasChildren && !isCollapsed && (
                          <div className="ml-6 mt-1.5 space-y-1 border-l-2 border-white/[0.06] pl-3">
                            {childTopics.map((childTopic) => (
                              <div
                                key={childTopic.id}
                                id={`topic-${childTopic.id}`}
                                className="group flex items-center gap-3 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-lg transition-all duration-200"
                              >
                                {/* Checkbox for multi-select */}
                                <input
                                  type="checkbox"
                                  checked={selectedTopics.has(childTopic.id)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedTopics)
                                    if (e.target.checked) {
                                      newSelected.add(childTopic.id)
                                    } else {
                                      newSelected.delete(childTopic.id)
                                    }
                                    setSelectedTopics(newSelected)
                                  }}
                                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-2 focus:ring-accent-purple/50 flex-shrink-0 cursor-pointer"
                                />

                                {/* Spacer for alignment */}
                                <div className="w-4 flex-shrink-0"></div>

                                {/* Subtopic name */}
                                <h5 className="text-white/90 text-sm flex-1 truncate min-w-0">{childTopic.name}</h5>

                                {/* Confidence selector - compact dropdown */}
                                <div className="flex-shrink-0 relative group/conf">
                                  <button
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-xs"
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: getConfidenceColor(childTopic.confidence) }}
                                    />
                                    <span className="text-white/80">
                                      {(childTopic.confidence || 'not-started').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </span>
                                  </button>
                                  {/* Dropdown menu - opens to the left */}
                                  <div className="absolute right-full top-0 mr-2 bg-dark-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/conf:opacity-100 group-hover/conf:visible transition-all min-w-[160px] py-1 z-50">
                                    {[
                                      { value: 'not-started', label: 'Not Started', color: '#6b7280' },
                                      { value: 'struggling', label: 'Struggling', color: '#ef4444' },
                                      { value: 'moderate', label: 'Moderate', color: '#f59e0b' },
                                      { value: 'confident', label: 'Confident', color: '#3b82f6' },
                                      { value: 'mastered', label: 'Mastered', color: '#10b981' }
                                    ].map((conf) => (
                                      <button
                                        key={conf.value}
                                        onClick={() => updateTopic(childTopic.id, { confidence: conf.value as TopicConfidence })}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left text-xs first:rounded-t-lg last:rounded-b-lg"
                                      >
                                        <div
                                          className="w-3 h-3 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: conf.color }}
                                        />
                                        <span className="text-white/80">{conf.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Spacer for alignment with parent topics */}
                                <div className="w-7 flex-shrink-0"></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {filteredTopics.length === 0 && (
                    <p className="text-white/40 text-sm text-center py-8">No topics yet</p>
                  )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Resources</h3>
                  <div className="flex gap-2">
                    <CustomSelect
                      value={resourceSortBy}
                      onChange={(value) => setResourceSortBy(value as 'name' | 'type' | 'date')}
                      options={[
                        { value: 'name', label: 'Sort: Name' },
                        { value: 'type', label: 'Sort: Type' },
                        { value: 'date', label: 'Sort: Date' }
                      ]}
                      className="text-xs"
                    />
                    <button
                      onClick={() => {
                        setNewResource({ name: '', type: 'folder', url: '', parentFolderId: currentFolderId || '' })
                        setShowAddResource(true)
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                    >
                      📁 Folder
                    </button>
                    <button
                      onClick={() => {
                        setNewResource({ name: '', type: 'link', url: '', parentFolderId: currentFolderId || '' })
                        setShowAddResource(true)
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Breadcrumb navigation */}
                {(currentFolderId || folderPath.length > 0) && (
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                    <button
                      onClick={() => setCurrentFolderId(null)}
                      className="hover:text-white transition-colors"
                    >
                      📚 Resources
                    </button>
                    {folderPath.map((folder) => (
                      <span key={folder.id} className="flex items-center gap-2">
                        <span>/</span>
                        <button
                          onClick={() => setCurrentFolderId(folder.id)}
                          className="hover:text-white transition-colors"
                        >
                          {folder.name}
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentFolderResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      className={`p-4 border border-white/10 rounded-lg ${
                        resource.type === 'folder'
                          ? 'bg-white/10 cursor-pointer hover:bg-white/15'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        if (resource.type === 'folder') {
                          setCurrentFolderId(resource.id)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{getResourceIcon(resource.type)}</span>
                            <h4 className="text-white font-medium">{resource.name}</h4>
                          </div>
                          {resource.type !== 'folder' && (
                            <p className="text-white/60 text-xs capitalize ml-7">{resource.type}</p>
                          )}
                          {resource.url && resource.type !== 'folder' && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs truncate block mt-1 ml-7"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {resource.url}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm({ type: 'resource', id: resource.id, name: resource.name })
                          }}
                          className="text-white/40 hover:text-red-400 transition-colors text-sm"
                        >
                          🗑
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {currentFolderResources.length === 0 && (
                    <p className="text-white/40 text-sm text-center py-8 col-span-full">
                      {currentFolderId ? 'This folder is empty' : 'No resources yet'}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence mode="wait">
          {deleteConfirm && (
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirm(null)}
              >
                <motion.div
                  className="bg-dark-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-2">Confirm Delete</h3>
                  <p className="text-white/60 mb-4">
                    Are you sure you want to delete <span className="text-white font-medium">{deleteConfirm.name}</span>?
                    {deleteConfirm.type === 'subject' && (
                      <span className="block mt-2 text-red-400">This will also delete all exams, topics, and resources for this subject.</span>
                    )}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={confirmDelete}
                      className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white font-medium transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* Delete Topics Confirmation Modal */}
        <AnimatePresence>
          {showDeleteTopicsConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteTopicsConfirm(false)}
            >
              <motion.div
                className="bg-dark-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-2">Confirm Delete</h3>
                <p className="text-white/60 mb-4">
                  Are you sure you want to delete <span className="text-white font-medium">{selectedTopics.size}</span> selected topic{selectedTopics.size > 1 ? 's' : ''}?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDeleteTopics}
                    className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white font-medium transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteTopicsConfirm(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Exam Modal */}
        <AnimatePresence mode="wait">
          {showAddExam && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExam(false)}
            >
              <motion.form
                onSubmit={handleAddExam}
                className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Add Exam</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Exam Name</label>
                    <input
                      type="text"
                      value={newExam.name}
                      onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="Paper 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Date</label>
                    <DatePicker
                      value={newExam.date}
                      onChange={(value) => setNewExam({ ...newExam, date: value })}
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Time (Optional)</label>
                    <TimePicker
                      value={newExam.time}
                      onChange={(value) => setNewExam({ ...newExam, time: value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                  >
                    Add Exam
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExam(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Topic Modal */}
        <AnimatePresence mode="wait">
          {showAddTopic && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTopic(false)}
            >
              <motion.form
                onSubmit={handleAddTopic}
                className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {newTopic.parentTopicId ? 'Add Subtopic' : 'Add Topic'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Topic Name</label>
                    <input
                      type="text"
                      value={newTopic.name}
                      onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="Quadratic Equations"
                      required
                    />
                  </div>
                  {!newTopic.parentTopicId && (
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Group (Optional)</label>
                      <input
                        type="text"
                        value={newTopic.group}
                        onChange={(e) => setNewTopic({ ...newTopic, group: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        placeholder="Algebra"
                      />
                    </div>
                  )}
                  {newTopic.parentTopicId && (
                    <p className="text-white/60 text-sm">
                      Adding as subtopic to: <span className="text-white font-medium">
                        {topics.find(t => t.id === newTopic.parentTopicId)?.name}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                  >
                    Add Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTopic(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Resource Modal */}
        <AnimatePresence mode="wait">
          {showAddResource && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddResource(false)}
            >
              <motion.form
                onSubmit={handleAddResource}
                className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {newResource.type === 'folder' ? 'New Folder' : 'Add Resource'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      {newResource.type === 'folder' ? 'Folder Name' : 'Resource Name'}
                    </label>
                    <input
                      type="text"
                      value={newResource.name}
                      onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder={newResource.type === 'folder' ? 'Past Papers' : 'Textbook Chapter 5'}
                      required
                    />
                  </div>
                  {newResource.type !== 'folder' && (
                    <>
                      <div>
                        <label className="block text-white/60 text-sm mb-2">Type</label>
                        <CustomSelect
                          value={newResource.type}
                          onChange={(value) => setNewResource({ ...newResource, type: value as any })}
                          options={[
                            { value: 'link', label: 'Link' },
                            { value: 'file', label: 'File' },
                            { value: 'note', label: 'Note' }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 text-sm mb-2">URL (Optional)</label>
                        <input
                          type="url"
                          value={newResource.url}
                          onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  )}
                  {currentFolder && (
                    <p className="text-white/60 text-sm">
                      Location: <span className="text-white font-medium">{currentFolder.name}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                  >
                    {newResource.type === 'folder' ? 'Create Folder' : 'Add Resource'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddResource(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    )
  }

  // Main Subjects Grid View
  return (
    <Layout>
      <motion.header
        className="px-8 py-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 mb-3">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2]" />
              Organized study hubs
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">Subjects</h2>
            <p className="text-white/60">Manage subjects, resources, and exam anchors</p>
          </div>
          <button
            onClick={() => setShowAddSubject(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#f6c453] via-[#f8729e] to-[#72e7c2] text-black rounded-full font-semibold shadow-lg shadow-black/25 hover:scale-[1.02] transition-transform"
          >
            + Add Subject
          </button>
        </div>
      </motion.header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SubjectCard
                  name={subject.name}
                  emoji={subject.emoji}
                  color={subject.color}
                  decoration={subject.decoration}
                  decorationEmoji={subject.decorationEmoji}
                  gradientHue={subject.gradientHue}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  onEdit={() => handleEditSubject(subject)}
                >
                  {subject.examBoard && (
                    <p className="text-white/60 text-sm">{subject.examBoard}</p>
                  )}
                  <div className="flex gap-4 mt-4 text-sm text-white/60">
                    <span>{exams.filter(e => e.subjectId === subject.id).length} exams</span>
                    <span>{topics.filter(t => t.subjectId === subject.id).length} topics</span>
                  </div>
                </SubjectCard>
              </motion.div>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">No subjects yet</h3>
                <p className="text-white/60 mb-6">Add your first subject to get started</p>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                >
                  + Add Subject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence mode="wait">
        {showAddSubject && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddSubject(false)}
          >
            <motion.form
              onSubmit={handleAddSubject}
              className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Add Subject</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Mathematics"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Exam Board (Optional)</label>
                  <input
                    type="text"
                    value={newSubject.examBoard}
                    onChange={(e) => setNewSubject({ ...newSubject, examBoard: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="AQA, Edexcel, etc."
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Emoji</label>
                  <EmojiPicker
                    value={newSubject.emoji}
                    onChange={(emoji) => setNewSubject({ ...newSubject, emoji })}
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Gradient Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setNewSubject({ ...newSubject, gradientHue: preset.hue })}
                        className={`h-12 rounded-lg border-2 transition-all ${
                          newSubject.gradientHue === preset.hue
                            ? 'border-white scale-105'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                        style={{
                          background: `linear-gradient(-45deg,
                            hsl(${preset.hue}, 40%, 22%),
                            hsl(${preset.hue + 40}, 42%, 18%),
                            hsl(${preset.hue + 80}, 40%, 22%),
                            hsl(${preset.hue + 120}, 42%, 18%))`
                        }}
                      >
                        <span className="sr-only">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                >
                  Add Subject
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Subject Modal */}
      <AnimatePresence mode="wait">
        {showEditSubject && editingSubject && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowEditSubject(false)
              setEditingSubject(null)
            }}
          >
            <motion.form
              onSubmit={handleSaveEditSubject}
              className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Edit Subject</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Exam Board</label>
                  <input
                    type="text"
                    value={editingSubject.examBoard}
                    onChange={(e) => setEditingSubject({ ...editingSubject, examBoard: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="AQA, Edexcel, etc."
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Emoji</label>
                  <EmojiPicker
                    value={editingSubject.emoji}
                    onChange={(emoji) => setEditingSubject({ ...editingSubject, emoji })}
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Gradient Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setEditingSubject({ ...editingSubject, gradientHue: preset.hue })}
                        className={`h-12 rounded-lg border-2 transition-all ${
                          editingSubject.gradientHue === preset.hue
                            ? 'border-white scale-105'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                        style={{
                          background: `linear-gradient(-45deg,
                            hsl(${preset.hue}, 40%, 22%),
                            hsl(${preset.hue + 40}, 42%, 18%),
                            hsl(${preset.hue + 80}, 40%, 22%),
                            hsl(${preset.hue + 120}, 42%, 18%))`
                        }}
                      >
                        <span className="sr-only">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditSubject(false)
                    setEditingSubject(null)
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}

export default Subjects
