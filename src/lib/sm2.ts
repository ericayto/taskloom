import { FlashcardDifficulty } from '../types'

export interface SM2Result {
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
}

/**
 * SuperMemo 2 (SM-2) Algorithm Implementation
 *
 * The SM-2 algorithm calculates the optimal interval for reviewing flashcards
 * based on the user's self-assessed difficulty rating.
 *
 * Quality ratings:
 * - again (0): Complete blackout, wrong response
 * - hard (3): Correct response recalled with serious difficulty
 * - good (4): Correct response after some hesitation
 * - easy (5): Perfect response
 *
 * @param currentEaseFactor - Current ease factor (default: 2.5)
 * @param currentInterval - Current interval in days (default: 0)
 * @param currentRepetitions - Current number of successful repetitions (default: 0)
 * @param difficulty - User's self-assessment rating
 * @returns Updated card parameters for spaced repetition
 */
export function calculateSM2(
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number,
  difficulty: FlashcardDifficulty
): SM2Result {
  // Map difficulty to quality (0-5 scale)
  const qualityMap: Record<FlashcardDifficulty, number> = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5,
  }

  const quality = qualityMap[difficulty]

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  // Ease factor should never be less than 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  let newRepetitions = currentRepetitions
  let newInterval = currentInterval

  // If quality < 3, reset repetitions and interval
  if (quality < 3) {
    newRepetitions = 0
    newInterval = 0
  } else {
    newRepetitions += 1

    // Calculate new interval based on repetitions
    if (newRepetitions === 1) {
      newInterval = 1 // 1 day
    } else if (newRepetitions === 2) {
      newInterval = 6 // 6 days
    } else {
      // For subsequent repetitions: I(n) = I(n-1) * EF
      newInterval = Math.round(currentInterval * newEaseFactor)
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)
  nextReviewDate.setHours(0, 0, 0, 0) // Reset to start of day

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  }
}

/**
 * Get the number of days until the next review
 */
export function getDaysUntilReview(nextReviewDate: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const reviewDate = new Date(nextReviewDate)
  reviewDate.setHours(0, 0, 0, 0)

  const diffTime = reviewDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if a flashcard is due for review
 */
export function isCardDue(nextReviewDate: Date): boolean {
  return getDaysUntilReview(nextReviewDate) <= 0
}
