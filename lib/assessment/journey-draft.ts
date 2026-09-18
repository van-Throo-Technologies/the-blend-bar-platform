import { sanitizeAnswers, type JourneyAnswers } from './journey'

/**
 * On-device progress for the Hair Need Journey (browser only).
 *
 * Stores only the participant's own in-progress answers and position — never
 * results, scoring or interpretation. Keyed per signed-in user so progress is
 * not shared between accounts in the same browser. A Hair Need result is only
 * ever created server-side by POST /api/assessment from a complete answer set.
 *
 * Anonymous progress (owner `null`) is kept under its own key for the public Journey.
 * It never leaves the device, and it expires sooner because a shared device may hold it.
 *
 * Server-side drafts need the proposed `assessment_drafts` table
 * (supabase/proposed/20260915_assessment_drafts.sql) and are not yet wired in.
 */

const STORAGE_PREFIX = 'blend-bar:hair-need-journey:v1'
const DAY_MS = 24 * 60 * 60 * 1000
const MAX_DRAFT_AGE_MS = 30 * DAY_MS
const MAX_ANONYMOUS_DRAFT_AGE_MS = 7 * DAY_MS

/** A signed-in user's id, or `null` for someone who has not signed in. */
export type DraftOwner = string | null

export type JourneyDraft = { answers: JourneyAnswers; stepId: string; updatedAt: number }

const storageKey = (owner: DraftOwner) => `${STORAGE_PREFIX}:${owner ?? 'anonymous'}`
const maxAge = (owner: DraftOwner) => (owner === null ? MAX_ANONYMOUS_DRAFT_AGE_MS : MAX_DRAFT_AGE_MS)

export function loadJourneyDraft(userId: DraftOwner): JourneyDraft | null {
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const { answers, stepId, updatedAt } = parsed as Record<string, unknown>
    if (typeof updatedAt !== 'number' || Date.now() - updatedAt > maxAge(userId)) {
      clearJourneyDraft(userId)
      return null
    }
    return { answers: sanitizeAnswers(answers), stepId: typeof stepId === 'string' ? stepId : 'intro', updatedAt }
  } catch {
    return null
  }
}

export function saveJourneyDraft(userId: DraftOwner, draft: Omit<JourneyDraft, 'updatedAt'>) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify({ ...draft, updatedAt: Date.now() }))
  } catch {
    // Storage can be unavailable (private browsing, quota). The journey still works in memory.
  }
}

export function clearJourneyDraft(userId: DraftOwner) {
  try {
    window.localStorage.removeItem(storageKey(userId))
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
