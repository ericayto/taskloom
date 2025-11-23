import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Flashcard, FlashcardDifficulty, FlashcardReview } from '../../types'
import { db } from '../../lib/dexie-db'
import { calculateSM2 } from '../../lib/sm2'

interface StudyModeProps {
  cards: Flashcard[]
  deckName?: string
  onComplete: () => void
  onExit: () => void
}

const StudyMode = ({ cards, deckName, onComplete, onExit }: StudyModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [reviewing, setReviewing] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((reviewedCount / cards.length) * 100).toFixed(0)

  const handleRate = async (difficulty: FlashcardDifficulty) => {
    if (reviewing) return
    setReviewing(true)

    try {
      // Calculate new SM-2 values
      const sm2Result = calculateSM2(
        currentCard.easeFactor,
        currentCard.interval,
        currentCard.repetitions,
        difficulty
      )

      // Update flashcard
      const updatedCard: Flashcard = {
        ...currentCard,
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        nextReviewDate: sm2Result.nextReviewDate,
        lastReviewedAt: new Date(),
      }
      await db.update('flashcards', updatedCard)

      // Record review
      const review: FlashcardReview = {
        id: crypto.randomUUID(),
        flashcardId: currentCard.id,
        deckId: currentCard.deckId,
        difficulty,
        previousEaseFactor: currentCard.easeFactor,
        newEaseFactor: sm2Result.easeFactor,
        previousInterval: currentCard.interval,
        newInterval: sm2Result.interval,
        reviewedAt: new Date(),
      }
      await db.add('flashcardReviews', review)

      // Move to next card or complete
      setReviewedCount(reviewedCount + 1)
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
      } else {
        onComplete()
      }
    } catch (error) {
      console.error('Failed to record review:', error)
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onExit}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.06] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Exit
            </motion.button>
            <div>
              {deckName && <div className="text-white/40 text-xs">{deckName}</div>}
              <div className="text-white/60">
                Card {reviewedCount + 1} of {cards.length}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white/40 text-sm">{progress}%</div>
            <div className="w-32 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-purple to-accent-blue"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Card and Buttons Container */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* Card */}
          <div className="w-full max-w-2xl mb-8">
            <div
              className="w-full h-96 cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="relative w-full h-full preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden card-front">
                  <div className="w-full h-full p-12 rounded-3xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                    <div className="text-white/40 text-sm mb-4 uppercase tracking-wider">
                      Question
                    </div>
                    <div className="text-white text-2xl font-medium leading-relaxed">
                      {currentCard.front}
                    </div>
                    <div className="mt-8 text-white/30 text-sm">Click to reveal answer</div>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden card-back">
                  <div className="w-full h-full p-12 rounded-3xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                    <div className="text-white/40 text-sm mb-4 uppercase tracking-wider">
                      Answer
                    </div>
                    <div className="text-white text-2xl font-medium leading-relaxed">
                      {currentCard.back}
                    </div>
                    <div className="mt-8 text-white/30 text-sm">Rate your recall below</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Rating Buttons - Fixed height container */}
          <div className="w-full max-w-4xl" style={{ minHeight: '180px' }}>
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  className="grid grid-cols-4 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
              <motion.button
                onClick={() => handleRate('again')}
                disabled={reviewing}
                className="p-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-white transition-all disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-2">😰</div>
                <div className="font-semibold mb-1">Again</div>
                <div className="text-xs text-white/60">&lt;1 day</div>
              </motion.button>

              <motion.button
                onClick={() => handleRate('hard')}
                disabled={reviewing}
                className="p-6 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-white transition-all disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-2">😕</div>
                <div className="font-semibold mb-1">Hard</div>
                <div className="text-xs text-white/60">
                  {currentCard.repetitions === 0 ? '1 day' : `${Math.round(currentCard.interval * 1.2)} days`}
                </div>
              </motion.button>

              <motion.button
                onClick={() => handleRate('good')}
                disabled={reviewing}
                className="p-6 rounded-2xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-white transition-all disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-2">😊</div>
                <div className="font-semibold mb-1">Good</div>
                <div className="text-xs text-white/60">
                  {currentCard.repetitions === 0 ? '1 day' : currentCard.repetitions === 1 ? '6 days' : `${Math.round(currentCard.interval * currentCard.easeFactor)} days`}
                </div>
              </motion.button>

              <motion.button
                onClick={() => handleRate('easy')}
                disabled={reviewing}
                className="p-6 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-white transition-all disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-2">😎</div>
                <div className="font-semibold mb-1">Easy</div>
                <div className="text-xs text-white/60">
                  {currentCard.repetitions === 0 ? '6 days' : `${Math.round(currentCard.interval * currentCard.easeFactor * 1.3)} days`}
                </div>
              </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .card-front {
          transform: rotateY(0deg);
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}

export default StudyMode
