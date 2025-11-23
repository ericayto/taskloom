import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { db } from '../../lib/dexie-db'
import { Deck, Flashcard } from '../../types'

interface BulkImportModalProps {
  deck: Deck
  onClose: () => void
  onImported: () => void
}

const BulkImportModal = ({ deck, onClose, onImported }: BulkImportModalProps) => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ front: string; back: string }[]>([])

  const parseText = () => {
    // Support multiple formats:
    // 1. Question | Answer (pipe separator)
    // 2. Question :: Answer (double colon)
    // 3. Question\nAnswer (double newline separation)

    const lines = text.trim().split('\n')
    const cards: { front: string; back: string }[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Try pipe separator
      if (line.includes('|')) {
        const [front, back] = line.split('|').map((s) => s.trim())
        if (front && back) {
          cards.push({ front, back })
          continue
        }
      }

      // Try double colon separator
      if (line.includes('::')) {
        const [front, back] = line.split('::').map((s) => s.trim())
        if (front && back) {
          cards.push({ front, back })
          continue
        }
      }

      // Try double newline separator (question on one line, answer on next)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim()
        if (nextLine && !nextLine.includes('|') && !nextLine.includes('::')) {
          cards.push({ front: line, back: nextLine })
          i++ // Skip the next line since we already processed it
          continue
        }
      }
    }

    setPreview(cards)
  }

  const handleImport = async () => {
    if (preview.length === 0) return

    setLoading(true)
    try {
      for (const card of preview) {
        const newCard: Flashcard = {
          id: crypto.randomUUID(),
          deckId: deck.id,
          front: card.front,
          back: card.back,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date(),
          suspended: false,
          createdAt: new Date(),
        }
        await db.add('flashcards', newCard)
      }

      onImported()
      onClose()
    } catch (error) {
      console.error('Failed to import flashcards:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-dark-900 rounded-2xl border border-white/10 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Bulk Import Flashcards</h2>
          <p className="text-white/60 text-sm mb-6">
            Importing to: <span className="text-white font-medium">{deck.name}</span>
          </p>

          <div className="space-y-6">
            {/* Instructions */}
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <h3 className="text-white font-medium mb-2">Supported Formats:</h3>
              <div className="text-white/60 text-sm space-y-1">
                <div>• Pipe separator: <code className="text-accent-purple">Question | Answer</code></div>
                <div>• Double colon: <code className="text-accent-purple">Question :: Answer</code></div>
                <div>• Double newline (one card per 2 lines)</div>
              </div>
            </div>

            {/* Input */}
            <div>
              <label className="block text-white/60 text-sm mb-2">
                Paste your flashcards here
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`What is photosynthesis? | The process by which plants make food
Capital of France :: Paris

What is H2O?
Water`}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors resize-none font-mono text-sm"
                rows={10}
              />
            </div>

            {/* Parse Button */}
            <motion.button
              onClick={parseText}
              disabled={!text.trim()}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: text.trim() ? 1.01 : 1 }}
              whileTap={{ scale: text.trim() ? 0.99 : 1 }}
            >
              Preview Cards ({preview.length})
            </motion.button>

            {/* Preview */}
            {preview.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">
                    Preview ({preview.length} card{preview.length === 1 ? '' : 's'})
                  </h3>
                  <button
                    onClick={() => setPreview([])}
                    className="text-white/40 hover:text-white/60 text-sm"
                  >
                    Clear
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-3">
                  {preview.map((card, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                    >
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleImport}
                disabled={loading || preview.length === 0}
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading || preview.length === 0 ? 1 : 1.01 }}
                whileTap={{ scale: loading || preview.length === 0 ? 1 : 0.99 }}
              >
                {loading ? 'Importing...' : `Import ${preview.length} Card${preview.length === 1 ? '' : 's'}`}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BulkImportModal
