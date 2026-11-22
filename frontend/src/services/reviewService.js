import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { env } from '../config/env.js'
import { communityReviews } from '../data/communityReviews.js'
import { reviewSubmissions } from '../data/reviewSubmissions.js'

/**
 * @typedef {'pending' | 'published' | 'rejected'} ReviewStatus
 */

/**
 * One moderation action. `at` is an ISO 8601 timestamp.
 *
 * @typedef {Object} ReviewModerationEntry
 * @property {ReviewStatus} status the status the review was moved to
 * @property {string} at
 * @property {string} by
 */

/**
 * @typedef {Object} ReviewSubmission
 * @property {string} id
 * @property {string | null} authorId customer id of a member, null for a guest
 * @property {string} name name shown with the review, e.g. "Alex R." or "Guest"
 * @property {string} product
 * @property {number} rating 1 to 5
 * @property {string} comment untrusted customer text; display as plain text only
 * @property {string} date submission date, "YYYY-MM-DD"
 * @property {ReviewStatus} status
 * @property {boolean} flagged
 * @property {string} flagReason empty when the review is not flagged
 * @property {ReviewModerationEntry[]} history oldest first
 */

// Review moderation for the admin Community page. While USE_MOCK is true the list is the
// published reviews plus the submissions in src/data/, and status changes are saved to
// localStorage in this browser only. Backend team: the API paths below are placeholders,
// so tell us the real ones.

export const REVIEW_STATUSES = ['pending', 'published', 'rejected']
export const REVIEW_MODERATION_STORAGE_KEY = 'instea.reviewModeration.v1'

// There is no staff login behind the mock, so every action is attributed to this name.
const MOCK_MODERATOR = 'Staff Member'

function isStatus(value) {
  return REVIEW_STATUSES.includes(value)
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

// Keeps only well-formed moderation entries, so edited browser data cannot break the UI.
function normalizeHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .filter((entry) => isRecord(entry) && isStatus(entry.status) && isTimestamp(entry.at))
    .map((entry) => ({
      status: entry.status,
      at: entry.at,
      by: typeof entry.by === 'string' && entry.by ? entry.by : MOCK_MODERATOR,
    }))
}

// Gives every review the same shape, whichever list it came from.
function toReview(source) {
  if (!isRecord(source)) throw new Error('Invalid review')
  return {
    id: String(source.id),
    authorId: source.authorId ? String(source.authorId) : null,
    name: typeof source.name === 'string' ? source.name : '',
    product: typeof source.product === 'string' ? source.product : '',
    rating: source.rating,
    comment: typeof source.comment === 'string' ? source.comment : '',
    date: source.date,
    status: isStatus(source.status) ? source.status : 'pending',
    flagged: source.flagged === true,
    flagReason: typeof source.flagReason === 'string' ? source.flagReason : '',
    history: normalizeHistory(source.history),
  }
}

// Saved moderation per review id: { status, history }, where history holds only the
// actions taken in this browser. Anything that is not valid, such as bad JSON, another
// version, or an unknown status, is ignored and the mock data is used instead.
function readSavedModeration() {
  try {
    const saved = localStorage.getItem(REVIEW_MODERATION_STORAGE_KEY)
    if (!saved) return new Map()
    const parsed = JSON.parse(saved)
    if (parsed?.version !== 1 || !isRecord(parsed.reviews)) return new Map()
    return new Map(Object.entries(parsed.reviews)
      .filter(([, entry]) => isRecord(entry) && isStatus(entry.status))
      .map(([id, entry]) => [id, { status: entry.status, history: normalizeHistory(entry.history) }]))
  } catch {
    return new Map()
  }
}

function writeSavedModeration(saved) {
  try {
    localStorage.setItem(REVIEW_MODERATION_STORAGE_KEY, JSON.stringify({
      version: 1,
      reviews: Object.fromEntries(saved),
    }))
  } catch {
    throw new Error('The review status could not be saved in this browser.')
  }
}

function listMockReviews() {
  const saved = readSavedModeration()
  return [...communityReviews, ...reviewSubmissions].map((source) => {
    const review = toReview(source)
    const moderation = saved.get(review.id)
    if (!moderation) return review
    return { ...review, status: moderation.status, history: [...review.history, ...moderation.history] }
  })
}

/**
 * All reviews and feedback submissions, whatever their status.
 *
 * @returns {Promise<ReviewSubmission[]>}
 */
export async function getReviewSubmissions() {
  if (USE_MOCK) return mockResponse(listMockReviews())
  const reviews = await apiGet('/reviews')
  if (!Array.isArray(reviews)) throw new Error('Invalid reviews response')
  return reviews.map(toReview)
}

/**
 * Moves a review to a new status and returns the updated review. Rejects when the
 * status is not valid, the review does not exist, or (while mocked) the browser
 * cannot store the change.
 *
 * @param {string} id
 * @param {ReviewStatus} status
 * @returns {Promise<ReviewSubmission>}
 */
export async function setReviewStatus(id, status) {
  if (!isStatus(status)) throw new Error(`Invalid review status: ${status}`)

  if (USE_MOCK) {
    const review = listMockReviews().find((item) => item.id === String(id))
    if (!review) throw new Error(`Review not found: ${id}`)
    if (review.status === status) return mockResponse(review)

    const saved = readSavedModeration()
    const entry = { status, at: new Date().toISOString(), by: MOCK_MODERATOR }
    saved.set(review.id, { status, history: [...(saved.get(review.id)?.history ?? []), entry] })
    writeSavedModeration(saved)
    return mockResponse({ ...review, status, history: [...review.history, entry] })
  }

  const response = await fetch(`${env.apiBaseUrl}/reviews/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    throw new Error(`PATCH /reviews/${id}/status failed with status ${response.status}`)
  }
  return toReview(await response.json())
}

/**
 * Returns only published reviews for the public Community page.
 * Reuses the same review data and moderation status as the Admin Dashboard.
 *
 * @returns {Promise<ReviewSubmission[]>}
 */
export async function getPublishedReviews() {
  const reviews = await getReviewSubmissions()

  return reviews.filter((review) => review.status === 'published')
}
