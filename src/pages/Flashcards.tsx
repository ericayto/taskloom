import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { db } from '../lib/dexie-db'
import { Deck, Subject } from '../types'
import DeckView from '../components/flashcards/DeckView'
import { CustomSelect } from '../components/ui/custom-select'

const DECK_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

const Flashcards = () => {
  const [decks, setDecks] = useState<Deck[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [showCreateDeck, setShowCreateDeck] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null)
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckDescription, setNewDeckDescription] = useState('')
  const [newDeckColor, setNewDeckColor] = useState(DECK_COLORS[0])
  const [newDeckSubject, setNewDeckSubject] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [allDecks, subs] = await Promise.all([
        db.getTopLevelDecks(),
        db.getSubjects(),
      ])
      setDecks(allDecks)
      setSubjects(subs)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const createDeck = async () => {
    if (!newDeckName.trim()) return

    try {
      const deck: Deck = {
        id: crypto.randomUUID(),
        name: newDeckName.trim(),
        description: newDeckDescription.trim() || undefined,
        color: newDeckColor,
        subjectId: newDeckSubject || undefined,
        createdAt: new Date(),
      }
      await db.add('decks', deck)
      setNewDeckName('')
      setNewDeckDescription('')
      setNewDeckColor(DECK_COLORS[0])
      setNewDeckSubject('')
      setShowCreateDeck(false)
      loadData()
    } catch (error) {
      console.error('Failed to create deck:', error)
    }
  }

  const confirmDeleteDeck = async () => {
    if (!deckToDelete) return

    try {
      // Delete all cards in the deck
      const cards = await db.getFlashcardsByDeck(deckToDelete.id, true)
      for (const card of cards) {
        await db.delete('flashcards', card.id)
      }
      // Delete the deck
      await db.delete('decks', deckToDelete.id)
      setShowDeleteConfirm(false)
      setDeckToDelete(null)
      loadData()
    } catch (error) {
      console.error('Failed to delete deck:', error)
    }
  }

  const getDeckStats = async (deckId: string) => {
    const cards = await db.getFlashcardsByDeck(deckId, false)
    const dueCards = await db.getFlashcardsDueForReview(deckId)
    return {
      total: cards.length,
      due: dueCards.length,
      new: cards.filter((c) => c.repetitions === 0).length,
    }
  }

  const [deckStats, setDeckStats] = useState<Record<string, { total: number; due: number; new: number }>>({})

  useEffect(() => {
    const loadStats = async () => {
      const stats: Record<string, { total: number; due: number; new: number }> = {}
      for (const deck of decks) {
        stats[deck.id] = await getDeckStats(deck.id)
      }
      setDeckStats(stats)
    }
    if (decks.length > 0) {
      loadStats()
    }
  }, [decks])

  if (selectedDeck) {
    return (
      <Layout>
        <DeckView deck={selectedDeck} onBack={() => setSelectedDeck(null)} />
      </Layout>
    )
  }

  const totalDue = Object.values(deckStats).reduce((sum, s) => sum + s.due, 0)
  const totalCards = Object.values(deckStats).reduce((sum, s) => sum + s.total, 0)

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Flashcards</h1>
              <p className="text-white/60">Organize your learning with decks</p>
            </div>
            <motion.button
              onClick={() => setShowCreateDeck(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Create Deck
            </motion.button>
          </motion.div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="text-white/60 text-sm mb-2">Decks</div>
              <div className="text-4xl font-bold text-white">{decks.length}</div>
            </motion.div>

            <motion.div
              className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="text-white/60 text-sm mb-2">Total Cards</div>
              <div className="text-4xl font-bold text-white">{totalCards}</div>
            </motion.div>

            <motion.div
              className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="text-white/60 text-sm mb-2">Due Today</div>
              <div className="text-4xl font-bold text-white">{totalDue}</div>
            </motion.div>

            <motion.div
              className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="text-white/60 text-sm mb-2">By Subject</div>
              <div className="text-4xl font-bold text-white">{subjects.length}</div>
            </motion.div>
          </div>

          {/* Decks Grid */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Your Decks</h2>
            {decks.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <h3 className="text-xl font-semibold text-white mb-2">No decks yet</h3>
                <p className="text-white/60 mb-6">Create your first deck to start learning</p>
                <motion.button
                  onClick={() => setShowCreateDeck(true)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Deck
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck, index) => {
                  const stats = deckStats[deck.id] || { total: 0, due: 0, new: 0 }
                  const subject = subjects.find((s) => s.id === deck.subjectId)

                  return (
                    <motion.div
                      key={deck.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="group"
                    >
                      <motion.div
                        onClick={() => setSelectedDeck(deck)}
                        className="p-6 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border-2 transition-all cursor-pointer relative"
                        style={{ borderColor: deck.color || '#3b82f6' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="w-2 h-12 rounded-full"
                            style={{ backgroundColor: deck.color || '#3b82f6' }}
                          />
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeckToDelete(deck)
                              setShowDeleteConfirm(true)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            🗑️
                          </motion.button>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-1">{deck.name}</h3>
                        {deck.description && (
                          <p className="text-white/40 text-sm mb-3 line-clamp-2">
                            {deck.description}
                          </p>
                        )}
                        {subject && (
                          <div className="text-white/40 text-xs mb-3">
                            {subject.emoji} {subject.name}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06]">
                          <div>
                            <div className="text-white/40 text-xs">Cards</div>
                            <div className="text-white font-semibold">{stats.total}</div>
                          </div>
                          <div>
                            <div className="text-white/40 text-xs">Due</div>
                            <div className="text-white font-semibold">{stats.due}</div>
                          </div>
                          <div>
                            <div className="text-white/40 text-xs">New</div>
                            <div className="text-white font-semibold">{stats.new}</div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
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
                Are you sure you want to delete <span className="text-white font-medium">{deckToDelete?.name}</span> and all its cards? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteDeck}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white font-medium transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Deck Modal */}
      <AnimatePresence>
        {showCreateDeck && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateDeck(false)}
          >
            <motion.div
              className="bg-dark-900 rounded-2xl border border-white/10 p-6 w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Deck</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Deck Name</label>
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDeckName.trim()) {
                        createDeck()
                      }
                    }}
                    placeholder="e.g., Biology - Cell Structure"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Description (Optional)</label>
                  <textarea
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                    placeholder="What is this deck about?"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Color</label>
                  <div className="grid grid-cols-8 gap-2">
                    {DECK_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewDeckColor(color)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          newDeckColor === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Subject (Optional)</label>
                  <CustomSelect
                    value={newDeckSubject}
                    onChange={(value) => setNewDeckSubject(value)}
                    options={[
                      { value: '', label: 'No subject' },
                      ...subjects.map((subject) => ({
                        value: subject.id,
                        label: `${subject.emoji} ${subject.name}`
                      }))
                    ]}
                    placeholder="Select a subject..."
                    className="rounded-xl"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={() => setShowCreateDeck(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 transition-all"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={createDeck}
                    disabled={!newDeckName.trim()}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: newDeckName.trim() ? 1.01 : 1 }}
                    whileTap={{ scale: newDeckName.trim() ? 0.99 : 1 }}
                  >
                    Create Deck
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}

export default Flashcards
