import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Flashcard } from '../../types'
import { db } from '../../lib/dexie-db'

interface CardRow {
  id: string
  front: string
  back: string
  isNew: boolean
}

interface InlineCardCreatorProps {
  deckId: string
  onCardsCreated: () => void
}

const InlineCardCreator = ({ deckId, onCardsCreated }: InlineCardCreatorProps) => {
  const [rows, setRows] = useState<CardRow[]>([
    { id: crypto.randomUUID(), front: '', back: '', isNew: false },
  ])
  const [saving, setSaving] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  const addRow = () => {
    setRows([
      ...rows.map(row => ({ ...row, isNew: false })),
      { id: crypto.randomUUID(), front: '', back: '', isNew: true }
    ])
  }

  const updateRow = (id: string, field: keyof CardRow, value: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const deleteRow = (id: string) => {
    if (rows.length === 1) return
    setRows(rows.filter((row) => row.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: 'front' | 'back') => {
    if (e.key === 'Tab' && !e.shiftKey && field === 'back') {
      e.preventDefault()
      if (index === rows.length - 1) {
        addRow()
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('[data-field="front"]')
          inputs[inputs.length - 1]?.focus()
        }, 0)
      }
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  const handleSave = async () => {
    const validRows = rows.filter((row) => row.front.trim() && row.back.trim())
    if (validRows.length === 0) return

    setSaving(true)
    try {
      for (const row of validRows) {
        const card: Flashcard = {
          id: crypto.randomUUID(),
          deckId,
          front: row.front.trim(),
          back: row.back.trim(),
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date(),
          suspended: false,
          createdAt: new Date(),
        }
        await db.add('flashcards', card)
      }

      setRows([{ id: crypto.randomUUID(), front: '', back: '', isNew: false }])
      onCardsCreated()
      firstInputRef.current?.focus()
    } catch (error) {
      console.error('Failed to save flashcards:', error)
    } finally {
      setSaving(false)
    }
  }

  const validRowCount = rows.filter((row) => row.front.trim() && row.back.trim()).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Add Flashcards</h3>
          <p className="text-white/40 text-sm">
            {validRowCount > 0 ? `${validRowCount} card${validRowCount === 1 ? '' : 's'} ready to save` : 'Fill in front and back to create cards'}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={addRow}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.06] transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Add Row
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={saving || validRowCount === 0}
            className="px-4 py-1.5 text-sm rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: saving || validRowCount === 0 ? 1 : 1.05 }}
            whileTap={{ scale: saving || validRowCount === 0 ? 1 : 0.95 }}
          >
            {saving ? 'Saving...' : `Save ${validRowCount > 0 ? `(${validRowCount})` : ''}`}
          </motion.button>
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-3 px-3 py-2 text-white/40 text-xs uppercase tracking-wider">
        <div className="col-span-6">Front</div>
        <div className="col-span-6">Back</div>
      </div>

      {/* Rows */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        <AnimatePresence>
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-12 gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
            >
              <input
                ref={index === 0 ? firstInputRef : undefined}
                data-field="front"
                type="text"
                value={row.front}
                onChange={(e) => updateRow(row.id, 'front', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index, 'front')}
                placeholder="Question or prompt..."
                className="col-span-6 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] focus:border-white/20 text-white placeholder-white/30 focus:outline-none transition-colors"
              />
              <div className="col-span-6 flex items-center gap-2">
                <input
                  data-field="back"
                  type="text"
                  value={row.back}
                  onChange={(e) => updateRow(row.id, 'back', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'back')}
                  placeholder="Answer..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] focus:border-white/20 text-white placeholder-white/30 focus:outline-none transition-colors"
                />
                {rows.length > 1 && (
                  <motion.button
                    onClick={() => deleteRow(row.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-white/30 text-xs text-center pt-2">
        Press Tab to move between fields • Cmd/Ctrl + Enter to save
      </div>
    </div>
  )
}

export default InlineCardCreator
