import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { useState, useMemo, useEffect } from 'react'
import { getSubjectColor } from '../utils/helpers'
import { generateTopics } from '../lib/ai'
import { EmojiPicker } from '../components/ui/emoji-picker'
import { CustomSelect } from '../components/ui/custom-select'
import { DatePicker } from '../components/ui/date-picker'
import { TimePicker } from '../components/ui/time-picker'
import { SubjectCard } from '../components/ui/subject-card'
import { Topic, Exam, Resource, TopicConfidence } from '../types'

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
    updateExam,
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
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [topicGroupFilter, setTopicGroupFilter] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(new Set())
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
  const [newResource, setNewResource] = useState({ name: '', type: 'link' as const, url: '' })

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId)
  const subjectExams = useMemo(
    () => exams.filter((e) => e.subjectId === selectedSubjectId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [exams, selectedSubjectId]
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

  const topicGroups = useMemo(() => {
    const groups = new Set(subjectTopics.map(t => t.group).filter(Boolean) as string[])
    return ['all', ...Array.from(groups)]
  }, [subjectTopics])

  const filteredTopics = useMemo(() => {
    if (topicGroupFilter === 'all') return subjectTopics
    return subjectTopics.filter(t => t.group === topicGroupFilter)
  }, [subjectTopics, topicGroupFilter])

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
      const generatedTopics = await generateTopics(selectedSubject.name, selectedSubject.examBoard)
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

  const handleMarkReviewed = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId)
    if (!topic) return

    if (topic.lastReviewed) {
      // Unmark if already reviewed
      await updateTopic(topicId, { lastReviewed: undefined })
    } else {
      // Mark as reviewed
      await updateTopic(topicId, { lastReviewed: new Date() })
    }
  }

  const handleMoveTopic = async (topicId: string, direction: 'up' | 'down') => {
    const topic = topics.find(t => t.id === topicId)
    if (!topic) return

    const siblingTopics = topics
      .filter(t => t.subjectId === topic.subjectId && t.parentTopicId === topic.parentTopicId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    const currentIndex = siblingTopics.findIndex(t => t.id === topicId)
    if (currentIndex === -1) return
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === siblingTopics.length - 1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const topic1 = siblingTopics[currentIndex]
    const topic2 = siblingTopics[newIndex]

    await updateTopic(topic1.id, { order: topic2.order || 0 })
    await updateTopic(topic2.id, { order: topic1.order || 0 })
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
    })
    setNewResource({ name: '', type: 'link', url: '' })
    setShowAddResource(false)
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
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <motion.header
            className="bg-dark-800/50 backdrop-blur-xl border-b border-white/5 px-8 py-6 sticky top-0 z-20"
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
          <div className="border-b border-white/10 px-8">
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

          <div className="p-8 max-w-7xl mx-auto">
            {/* Exams Tab */}
            {activeTab === 'exams' && (
              <motion.div
                className="space-y-4"
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjectExams.map((exam) => (
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
                  {subjectExams.length === 0 && (
                    <p className="text-white/40 text-sm text-center py-8 col-span-full">No exams yet</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Topics</h3>
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

                <div className="space-y-2">
                  {filteredTopics.map((topic, index) => {
                    const childTopics = getChildTopics(topic.id)
                    const isCollapsed = collapsedTopics.has(topic.id)
                    const hasChildren = childTopics.length > 0

                    return (
                      <div key={topic.id}>
                        <motion.div
                          className="p-4 bg-white/5 border border-white/10 rounded-lg relative overflow-hidden"
                          layout
                        >
                          {/* Confidence color bar */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ backgroundColor: getConfidenceColor(topic.confidence) }}
                          />

                          <div className="flex items-start justify-between gap-3 ml-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {hasChildren && (
                                  <button
                                    onClick={() => toggleTopicCollapse(topic.id)}
                                    className="text-white/60 hover:text-white transition-colors"
                                  >
                                    {isCollapsed ? '▶' : '▼'}
                                  </button>
                                )}
                                <h4 className="text-white font-medium">{topic.name}</h4>
                                {topic.group && (
                                  <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded">
                                    {topic.group}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <CustomSelect
                                  value={topic.confidence || 'not-started'}
                                  onChange={(value) => updateTopic(topic.id, { confidence: value as TopicConfidence })}
                                  options={[
                                    { value: 'not-started', label: 'Not Started' },
                                    { value: 'struggling', label: 'Struggling' },
                                    { value: 'moderate', label: 'Moderate' },
                                    { value: 'confident', label: 'Confident' },
                                    { value: 'mastered', label: 'Mastered' }
                                  ]}
                                  className="text-xs"
                                />
                              </div>

                              {topic.lastReviewed && (
                                <p className="text-white/40 text-xs">
                                  Last reviewed: {new Date(topic.lastReviewed).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setNewTopic({ name: '', group: topic.group || '', parentTopicId: topic.id })
                                  setShowAddTopic(true)
                                }}
                                className="p-1 text-white/40 hover:text-white transition-colors text-xs"
                                title="Add subtopic"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleMoveTopic(topic.id, 'up')}
                                disabled={index === 0}
                                className="p-1 text-white/40 hover:text-white disabled:opacity-30 transition-colors"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMoveTopic(topic.id, 'down')}
                                disabled={index === filteredTopics.length - 1}
                                className="p-1 text-white/40 hover:text-white disabled:opacity-30 transition-colors"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => handleMarkReviewed(topic.id)}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  topic.lastReviewed
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                              >
                                {topic.lastReviewed ? '✓' : 'Review'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'topic', id: topic.id, name: topic.name })}
                                className="text-white/40 hover:text-red-400 transition-colors text-sm"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        </motion.div>

                        {/* Nested/Child Topics */}
                        {hasChildren && !isCollapsed && (
                          <div className="ml-8 mt-2 space-y-2 border-l-2 border-white/10 pl-4">
                            {childTopics.map((childTopic, childIndex) => (
                              <motion.div
                                key={childTopic.id}
                                className="p-3 bg-white/5 border border-white/10 rounded-lg relative overflow-hidden"
                                layout
                              >
                                <div
                                  className="absolute left-0 top-0 bottom-0 w-1"
                                  style={{ backgroundColor: getConfidenceColor(childTopic.confidence) }}
                                />

                                <div className="flex items-start justify-between gap-3 ml-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h5 className="text-white font-medium text-sm">{childTopic.name}</h5>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                      <CustomSelect
                                        value={childTopic.confidence || 'not-started'}
                                        onChange={(value) => updateTopic(childTopic.id, { confidence: value as TopicConfidence })}
                                        options={[
                                          { value: 'not-started', label: 'Not Started' },
                                          { value: 'struggling', label: 'Struggling' },
                                          { value: 'moderate', label: 'Moderate' },
                                          { value: 'confident', label: 'Confident' },
                                          { value: 'mastered', label: 'Mastered' }
                                        ]}
                                        className="text-xs"
                                      />
                                    </div>

                                    {childTopic.lastReviewed && (
                                      <p className="text-white/40 text-xs">
                                        Last reviewed: {new Date(childTopic.lastReviewed).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleMoveTopic(childTopic.id, 'up')}
                                      disabled={childIndex === 0}
                                      className="p-1 text-white/40 hover:text-white disabled:opacity-30 transition-colors text-xs"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => handleMoveTopic(childTopic.id, 'down')}
                                      disabled={childIndex === childTopics.length - 1}
                                      className="p-1 text-white/40 hover:text-white disabled:opacity-30 transition-colors text-xs"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      onClick={() => handleMarkReviewed(childTopic.id)}
                                      className={`px-2 py-1 rounded text-xs transition-colors ${
                                        childTopic.lastReviewed
                                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                          : 'bg-white/10 hover:bg-white/20 text-white'
                                      }`}
                                    >
                                      {childTopic.lastReviewed ? '✓' : 'Review'}
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm({ type: 'topic', id: childTopic.id, name: childTopic.name })}
                                      className="text-white/40 hover:text-red-400 transition-colors text-xs"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
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
                  <button
                    onClick={() => setShowAddResource(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    + Add
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjectResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{resource.name}</h4>
                          <p className="text-white/60 text-xs">{resource.type}</p>
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs truncate block mt-1"
                            >
                              {resource.url}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'resource', id: resource.id, name: resource.name })}
                          className="text-white/40 hover:text-red-400 transition-colors text-sm"
                        >
                          🗑
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {subjectResources.length === 0 && (
                    <p className="text-white/40 text-sm text-center py-8 col-span-full">No resources yet</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
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
        </div>

        {/* Add Exam Modal */}
        <AnimatePresence>
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
        <AnimatePresence>
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
        <AnimatePresence>
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
                <h3 className="text-xl font-bold text-white mb-4">Add Resource</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Resource Name</label>
                    <input
                      type="text"
                      value={newResource.name}
                      onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="Textbook Chapter 5"
                      required
                    />
                  </div>
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
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                  >
                    Add Resource
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
        className="bg-dark-800/50 backdrop-blur-xl border-b border-white/5 px-8 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Subjects 📚</h2>
            <p className="text-white/60">Manage your subjects and study materials</p>
          </div>
          <button
            onClick={() => setShowAddSubject(true)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
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
      <AnimatePresence>
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
      <AnimatePresence>
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
