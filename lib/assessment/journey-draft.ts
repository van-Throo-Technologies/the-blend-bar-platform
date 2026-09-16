import { sanitizeAnswers, type JourneyAnswers } from './journey'

/**
 * On-device progress for the Hair Need Journey (browser only).
 *
 * Stores only the participant's own in-progress answers and position — never
 * results, scoring or interpretation. Keyed per signed-in user so progress is
 * not shared between accounts in the same browser. A Hair Need result is only
 * ever created server-side by POST /api/assessment from a complete answer set.
 *
 * Server-side drafts need the proposed `assessment_drafts` table
 * (supabase/proposed/20260915_assessment_drafts.sql) and are not yet wired in.
 */

const STORAGE_PREFIX = 'blend-bar:hair-need-journey:v1'
const MAX_DRAFT_AGE_MS = 30 * 24 * 60 * 60 * 1000

export type JourneyDraft = { answers: JourneyAnswers; stepId: string; updatedAt: number }

const storageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`

export function loadJourneyDraft(userId: string): JourneyDraft | null {
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const { answers, stepId, updatedAt } = parsed as Record<string, unknown>
    if (typeof updatedAt !== 'number' || Date.now() - updatedAt > MAX_DRAFT_AGE_MS) {
      clearJourneyDraft(userId)
      return null
    }
    return { answers: sanitizeAnswers(answers), stepId: typeof stepId === 'string' ? stepId : 'intro', updatedAt }
  } catch {
    return null
  }
}

export function saveJourneyDraft(userId: string, draft: Omit<JourneyDraft, 'updatedAt'>) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify({ ...draft, updatedAt: Date.now() }))
  } catch {
    // Storage can be unavailable (private browsing, quota). The journey still works in memory.
  }
}

export function clearJourneyDraft(userId: string) {
  try {
    window.localStorage.removeItem(storageKey(userId))
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
