import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Deck, Flashcard } from '../../types'
import { db } from '../../lib/dexie-db'
import { getDaysUntilReview } from '../../lib/sm2'
import InlineCardCreator from './InlineCardCreator'
import StudyMode from './StudyMode'
import BulkImportModal from './BulkImportModal'

interface DeckViewProps {
  deck: Deck
  onBack: () => void
}

const DeckView = ({ deck, onBack }: DeckViewProps) => {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [showCreator, setShowCreator] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showStudy, setShowStudy] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadCards()
  }, [deck.id])

  const loadCards = async () => {
    try {
      const deckCards = await db.getFlashcardsByDeck(deck.id, false)
      setCards(deckCards)
    } catch (error) {
      console.error('Failed to load cards:', error)
    }
  }

  const dueCards = cards.filter((card) => {
    return getDaysUntilReview(card.nextReviewDate) <= 0
  })

  const startEdit = (card: Flashcard) => {
    setEditingCard(card.id)
    setEditFront(card.front)
    setEditBack(card.back)
  }

  const saveEdit = async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId)
    if (!card) return

    try {
      await db.update('flashcards', {
        ...card,
        front: editFront.trim(),
        back: editBack.trim(),
      })
      setEditingCard(null)
      loadCards()
    } catch (error) {
      console.error('Failed to save card:', error)
    }
  }

  const deleteCard = async () => {
    if (!cardToDelete) return

    try {
      await db.delete('flashcards', cardToDelete)
      setShowDeleteConfirm(false)
      setCardToDelete(null)
      loadCards()
    } catch (error) {
      console.error('Failed to delete card:', error)
    }
  }

  const resetProgress = async () => {
    if (!confirm('Reset all progress for this deck? This cannot be undone.')) return

    try {
      await db.resetDeckProgress(deck.id)
      loadCards()
    } catch (error) {
      console.error('Failed to reset progress:', error)
    }
  }

  if (showStudy && dueCards.length > 0) {
    return (
      <StudyMode
        cards={dueCards}
        deckName={deck.name}
        onComplete={() => {
          loadCards()
          setShowStudy(false)
        }}
        onExit={() => setShowStudy(false)}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.06] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Back
            </motion.button>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{deck.name}</h2>
              {deck.description && (
                <p className="text-white/60 text-sm">{deck.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {dueCards.length > 0 && (
              <motion.button
                onClick={() => setShowStudy(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Study ({dueCards.length})
              </motion.button>
            )}
            <motion.button
              onClick={() => setShowBulkImport(true)}
              className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white hover:text-white border border-white/[0.06] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Import
            </motion.button>
            <motion.button
              onClick={() => setShowCreator(!showCreator)}
              className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.06] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showCreator ? 'Close' : '+ Add Cards'}
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="text-white/40 text-xs mb-1">Total</div>
            <div className="text-white text-2xl font-semibold">{cards.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="text-white/40 text-xs mb-1">Due</div>
            <div className="text-white text-2xl font-semibold">{dueCards.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="text-white/40 text-xs mb-1">New</div>
            <div className="text-white text-2xl font-semibold">
              {cards.filter((c) => c.repetitions === 0).length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="text-white/40 text-xs mb-1">Mature</div>
            <div className="text-white text-2xl font-semibold">
              {cards.filter((c) => c.repetitions >= 3).length}
            </div>
          </div>
        </div>

        {/* Card Creator & Cards List */}
        <AnimatePresence mode="wait">
          {showCreator ? (
            <motion.div
              key="creator"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06]"
            >
              <InlineCardCreator
                deckId={deck.id}
                onCardsCreated={() => {
                  loadCards()
                  setShowCreator(false)
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="cards-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">
                Cards ({cards.length})
              </h3>
              {cards.length > 0 && (
                <motion.button
                  onClick={resetProgress}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset Progress
                </motion.button>
              )}
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                No cards in this deck yet. Click "+ Add Cards" to get started.
              </div>
            ) : (
            <div className="space-y-2">
              {cards.map((card) => {
                const isEditing = editingCard === card.id
                const daysUntil = getDaysUntilReview(card.nextReviewDate)
                const isDue = daysUntil <= 0

                return (
                  <div
                    key={card.id}
                    className="p-4 rounded-xl border transition-all bg-white/[0.04] border-white/[0.06] hover:border-white/[0.1]"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editFront}
                          onChange={(e) => setEditFront(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] focus:border-white/20 text-white focus:outline-none"
                          placeholder="Front"
                        />
                        <input
                          type="text"
                          value={editBack}
                          onChange={(e) => setEditBack(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] focus:border-white/20 text-white focus:outline-none"
                          placeholder="Back"
                        />
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => saveEdit(card.id)}
                            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Save
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingCard(null)}
                            className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.06] transition-colors text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-white/40 text-xs mb-1">Front</div>
                              <div className="text-white text-sm">{card.front}</div>
                            </div>
                            <div>
                              <div className="text-white/40 text-xs mb-1">Back</div>
                              <div className="text-white/60 text-sm">{card.back}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <div className="text-white/40">
                              Reviews: <span className="text-white">{card.repetitions}</span>
                            </div>
                            <div className="text-white/40">
                              Ease: <span className="text-white">{card.easeFactor.toFixed(1)}</span>
                            </div>
                            <div
                              className={`px-2 py-0.5 rounded ${
                                isDue
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-green-500/10 text-green-400'
                              }`}
                            >
                              {isDue ? 'Due now' : `${daysUntil}d`}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <motion.button
                            onClick={() => startEdit(card)}
                            className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/80 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ✏️
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setCardToDelete(card.id)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            🗑️
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showBulkImport && (
        <BulkImportModal
          deck={deck}
          onClose={() => setShowBulkImport(false)}
          onImported={() => {
            loadCards()
            setShowBulkImport(false)
          }}
        />
      )}

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
              <h3 className="text-xl font-bold text-white mb-2">Delete Flashcard</h3>
              <p className="text-white/60 mb-6">
                Are you sure you want to delete this flashcard? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={deleteCard}
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
    </div>
  )
}

export default DeckView
