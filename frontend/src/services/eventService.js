import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { events as seedEvents } from '../data/events.js'

/**
 * Event shape shared with the public Events and Event details pages.
 * Registration is optional: an event with no `capacity` has no registration.
 * Fields not listed here, such as `image` and `priceLabel`, are kept as they are.
 *
 * @typedef {Object} EventRecord
 * @property {number|string} id
 * @property {string} title
 * @property {string} category
 * @property {string} date 'YYYY-MM-DD', a local calendar date
 * @property {string} time display text, e.g. '6:30 PM – 8:00 PM' or 'Time to be announced'
 * @property {string} location
 * @property {string} description
 * @property {'active'|'cancelled'} status a missing status means 'active'
 * @property {number} [capacity] total spots, a whole number of 1 or more
 * @property {number} [spotsRemaining] spots left, from 0 to `capacity`; registered = capacity - spotsRemaining
 * @property {string} [image]
 * @property {string} [priceLabel]
 */

export const EVENTS_STORAGE_KEY = 'instea.events.v1'

// Keep in sync with the category filters in src/pages/Events.jsx.
export const EVENT_CATEGORIES = ['Drink tasting', 'Book club', 'Game night', 'Seasonal event']
export const EVENT_STATUSES = ['active', 'cancelled']
export const TIME_TO_BE_ANNOUNCED = 'Time to be announced'

// ---- Date and time helpers ----

/**
 * Parses 'YYYY-MM-DD' as a local date (not UTC, so it never shifts a day).
 *
 * @param {unknown} value
 * @returns {Date | null} null unless the value is a real calendar date
 */
export function parseEventDate(value) {
  const match = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null
  if (!match) return null
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  // new Date rolls 2026-02-30 over to March, so check that nothing moved.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

// The `time` text is written by hand, not with Intl, because Intl's AM/PM spacing differs
// between environments and this text has to match the public events data exactly.
function to12Hour(value) {
  const [hour, minute] = value.split(':').map(Number)
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`
}

function to24Hour(hour, minute, meridiem) {
  const hours = Number(hour)
  if (hours < 1 || hours > 12 || Number(minute) > 59) return null
  return `${String((hours % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0)).padStart(2, '0')}:${minute}`
}

/**
 * Builds the `time` display text from 24-hour 'HH:MM' values, as time inputs give them.
 *
 * @param {string} start empty when the time is not set
 * @param {string} [end]
 * @returns {string} e.g. '6:30 PM – 8:00 PM', '6:30 PM', or 'Time to be announced'
 */
export function formatEventTime(start, end = '') {
  if (!start) return TIME_TO_BE_ANNOUNCED
  return end ? `${to12Hour(start)} – ${to12Hour(end)}` : to12Hour(start)
}

/**
 * Reads a `time` display text back into 24-hour 'HH:MM' values.
 *
 * @param {unknown} time
 * @returns {{ start: string, end: string } | null} null for 'Time to be announced' or free text
 */
export function parseEventTime(time) {
  const match = typeof time === 'string'
    ? /^(\d{1,2}):(\d{2})\s*(AM|PM)(?:\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM))?$/i.exec(time.trim())
    : null
  if (!match) return null
  const start = to24Hour(match[1], match[2], match[3])
  const end = match[4] === undefined ? '' : to24Hour(match[4], match[5], match[6])
  return start === null || end === null ? null : { start, end }
}

// ---- Validation and storage ----

function isText(value) {
  return typeof value === 'string' && value.trim() !== ''
}

// Ids may arrive as route params (strings), so they are compared as text.
function sameId(left, right) {
  return String(left) === String(right)
}

// Returns a cleaned copy of the event, or null if it is not a valid event. Unknown fields are kept.
function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const validId = (typeof raw.id === 'number' && Number.isFinite(raw.id)) || isText(raw.id)
  const status = raw.status ?? 'active'
  if (!validId || !EVENT_STATUSES.includes(status) || !parseEventDate(raw.date)) return null
  if (![raw.title, raw.category, raw.location, raw.description].every(isText)) return null

  const event = {
    ...raw,
    title: raw.title.trim(),
    category: raw.category.trim(),
    time: isText(raw.time) ? raw.time.trim() : TIME_TO_BE_ANNOUNCED,
    location: raw.location.trim(),
    description: raw.description.trim(),
    status,
  }
  if (raw.capacity == null) {
    delete event.capacity
    delete event.spotsRemaining
    return event
  }
  const capacityValid = Number.isInteger(raw.capacity) && raw.capacity >= 1
  const spotsValid = Number.isInteger(raw.spotsRemaining) && raw.spotsRemaining >= 0 && raw.spotsRemaining <= raw.capacity
  return capacityValid && spotsValid ? event : null
}

// Seeded events share one bundled placeholder image. Its URL is a build-time asset path that
// can change with each build, so it is not written to storage and is restored when read.
const defaultImage = seedEvents.find((event) => event.image)?.image

function hydrate(raw) {
  const event = normalizeEvent(raw)
  if (event && !event.image && defaultImage) event.image = defaultImage
  return event
}

function dehydrate(event) {
  if (event.image !== defaultImage) return event
  const stored = { ...event }
  delete stored.image
  return stored
}

function readSeedEvents() {
  return seedEvents.map(hydrate).filter(Boolean)
}

// Corrupt or unexpected stored data falls back to the seed events rather than a partial list.
function readEvents() {
  try {
    const saved = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (!saved) return readSeedEvents()
    const parsed = JSON.parse(saved)
    if (parsed?.version !== 1 || !Array.isArray(parsed.events)) throw new Error('Invalid saved events')
    const stored = parsed.events.map(hydrate)
    if (stored.includes(null) || new Set(stored.map((event) => String(event.id))).size !== stored.length) {
      throw new Error('Invalid saved events')
    }
    return stored
  } catch {
    return readSeedEvents()
  }
}

function writeEvents(list) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify({ version: 1, events: list.map(dehydrate) }))
  } catch {
    throw new Error('Events could not be saved in this browser.')
  }
}

// One more than the highest numeric id. The public Event details page looks events up by number.
function nextId(list) {
  return list.reduce((highest, event) => (
    Number.isFinite(Number(event.id)) ? Math.max(highest, Number(event.id)) : highest
  ), 0) + 1
}

// The mock reads and writes storage in one synchronous step, so overlapping calls cannot
// overwrite each other. The simulated delay is added afterwards by mockResponse.
function saveNewEvent(input) {
  const list = readEvents()
  const event = hydrate({ ...input, id: nextId(list) })
  if (!event) throw new Error('This event is not valid.')
  writeEvents([...list, event])
  return event
}

function saveEventChanges(id, changes) {
  const list = readEvents()
  const current = list.find((event) => sameId(event.id, id))
  if (!current) throw new Error(`Event ${id} was not found.`)
  // An undefined value means "unchanged". Use null to clear capacity and spotsRemaining.
  const defined = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined))
  const event = hydrate({ ...current, ...defined, id: current.id })
  if (!event) throw new Error('This event is not valid.')
  writeEvents(list.map((item) => (item === current ? event : item)))
  return event
}

// ---- Service ----

// Admin changes are kept in this browser's localStorage while USE_MOCK is true.
// Backend team: the API paths below are placeholders, so tell us the real ones.

/**
 * @returns {Promise<EventRecord[]>} in stored order; callers sort as they need
 */
export async function getEvents() {
  if (USE_MOCK) return mockResponse(readEvents())
  return (await apiGet('/events')) ?? []
}

/**
 * Adds an event. The id is assigned by the service. Pass `capacity` and `spotsRemaining`
 * together to take registrations, or leave them out.
 *
 * @param {Omit<EventRecord, 'id'>} event
 * @returns {Promise<EventRecord>} rejects if the event is not valid or cannot be saved
 */
export async function createEvent(event) {
  if (USE_MOCK) return mockResponse(saveNewEvent(event))
  // TODO: POST /events once apiClient has a write helper (apiPost).
  throw new Error('Creating events needs the backend API, which is not connected yet.')
}

/**
 * Changes some fields of an event and keeps the rest, including fields this UI does not edit.
 * Pass `capacity: null` and `spotsRemaining: null` to remove registration.
 *
 * @param {number|string} id
 * @param {Partial<Omit<EventRecord, 'id'>>} changes
 * @returns {Promise<EventRecord>} rejects if the event is missing, the result is not valid, or it cannot be saved
 */
export async function updateEvent(id, changes) {
  if (USE_MOCK) return mockResponse(saveEventChanges(id, changes))
  // TODO: PATCH /events/{id} once apiClient has a write helper (apiPatch).
  throw new Error('Updating events needs the backend API, which is not connected yet.')
}

/**
 * Cancels or restores an event. The event is kept either way.
 *
 * @param {number|string} id
 * @param {'active'|'cancelled'} status
 * @returns {Promise<EventRecord>}
 */
export async function setEventStatus(id, status) {
  if (!EVENT_STATUSES.includes(status)) throw new Error(`Unknown event status: ${status}`)
  if (USE_MOCK) return mockResponse(saveEventChanges(id, { status }))
  // TODO: PATCH /events/{id}/status once apiClient has a write helper (apiPatch).
  throw new Error('Changing event status needs the backend API, which is not connected yet.')
}
