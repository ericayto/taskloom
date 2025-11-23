import { create } from 'zustand'
import { Deck, Flashcard, FlashcardReview } from '../types'
import { dexieDb } from '../lib/dexie-db'
import { generateId } from '../utils/helpers'
import { calculateFlashcardXP } from '../lib/gamification'
import { useGamificationStore } from './useGamificationStore'
import { triggerAchievementCheck } from '../lib/achievementChecker'

interface FlashcardState {
  decks: Deck[]
  flashcards: Flashcard[]
  flashcardReviews: FlashcardReview[]
  loading: boolean

  // Deck methods
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt'>) => Promise<void>
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>
  deleteDeck: (id: string) => Promise<void>

  // Flashcard methods
  addFlashcard: (flashcard: Omit<Flashcard, 'id' | 'createdAt'>) => Promise<void>
  addFlashcards: (flashcards: Omit<Flashcard, 'id' | 'createdAt'>[]) => Promise<void>
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => Promise<void>
  deleteFlashcard: (id: string) => Promise<void>

  // Review methods
  addFlashcardReview: (review: Omit<FlashcardReview, 'id'>) => Promise<void>

  // Load data
  loadData: () => Promise<void>
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  decks: [],
  flashcards: [],
  flashcardReviews: [],
  loading: true,

  // Deck methods
  addDeck: async (deck) => {
    const newDeck: Deck = {
      ...deck,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.decks.add(newDeck)
    set((state) => ({ decks: [...state.decks, newDeck] }))
  },

  updateDeck: async (id, updates) => {
    const deck = get().decks.find((d) => d.id === id)
    if (!deck) return

    const updated = { ...deck, ...updates }
    await dexieDb.decks.put(updated)
    set((state) => ({
      decks: state.decks.map((d) => (d.id === id ? updated : d)),
    }))
  },

  deleteDeck: async (id) => {
    await dexieDb.decks.delete(id)
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
    }))
  },

  // Flashcard methods
  addFlashcard: async (flashcard) => {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: generateId(),
      createdAt: new Date(),
    }
    await dexieDb.flashcards.add(newFlashcard)
    set((state) => ({ flashcards: [...state.flashcards, newFlashcard] }))
  },

  addFlashcards: async (flashcardsToAdd) => {
    const newFlashcards: Flashcard[] = flashcardsToAdd.map((flashcard) => ({
      ...flashcard,
      id: generateId(),
      createdAt: new Date(),
    }))

    await dexieDb.flashcards.bulkAdd(newFlashcards)
    set((state) => ({ flashcards: [...state.flashcards, ...newFlashcards] }))
  },

  updateFlashcard: async (id, updates) => {
    const flashcard = get().flashcards.find((f) => f.id === id)
    if (!flashcard) return

    const updated = { ...flashcard, ...updates }
    await dexieDb.flashcards.put(updated)
    set((state) => ({
      flashcards: state.flashcards.map((f) => (f.id === id ? updated : f)),
    }))
  },

  deleteFlashcard: async (id) => {
    await dexieDb.flashcards.delete(id)
    set((state) => ({
      flashcards: state.flashcards.filter((f) => f.id !== id),
    }))
  },

  // Review methods
  addFlashcardReview: async (review) => {
    const newReview: FlashcardReview = {
      ...review,
      id: generateId(),
    }
    await dexieDb.flashcardReviews.add(newReview)
    set((state) => ({
      flashcardReviews: [...state.flashcardReviews, newReview],
    }))

    // Award XP for reviewing flashcard
    const xp = calculateFlashcardXP(1)
    const gamificationStore = useGamificationStore.getState()
    await gamificationStore.awardXP(
      'flashcard-reviewed',
      xp,
      'Reviewed flashcard'
    )
    // Update daily goal
    await gamificationStore.createOrUpdateTodayGoal(0, 0, 1)
    // Check for new achievements
    triggerAchievementCheck()
  },

  // Load data
  loadData: async () => {
    try {
      const [decks, flashcards, flashcardReviews] = await Promise.all([
        dexieDb.decks.toArray(),
        dexieDb.flashcards.toArray(),
        dexieDb.flashcardReviews.toArray(),
      ])

      set({
        decks,
        flashcards,
        flashcardReviews,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to load flashcard data:', error)
      set({ loading: false })
    }
  },
}))
