/**
 * CURRENT EDITION — the single source of truth for the Belgium Edition.
 *
 * Server-safe: plain facts only, no secrets. `key` is the data key used by entitlements,
 * assessments and Blend Briefs. It deliberately keeps the existing value so historical
 * rows, Stripe metadata and granted entitlements stay valid without a data migration.
 *
 * Pricing and capacity are recorded here for reference only; nothing enforces them yet.
 */
export const CURRENT_EDITION = {
  key: 'conditioner-edition-v1',
  publicName: 'The Blend Bar — Belgium Edition',
  edition: 'Conditioner Edition',
  date: '2026-11-01',
  dateLabel: '1 November 2026',
  startTime: '13:00',
  endTime: '17:00',
  timeZone: 'Europe/Brussels',
  venue: 'Lucy’s Hub: Kafè & Serre',
  address: { street: 'Paleisstraat 41', postalCode: '2018', city: 'Antwerpen', country: 'BE' },
  capacity: 40,
  minimumAge: 15,
} as const

export type EditionKey = typeof CURRENT_EDITION.key
