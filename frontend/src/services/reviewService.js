import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { env } from '../config/env.js'
import { communityReviews } from '../data/communityReviews.js'
import { reviewSubmissions } from '../data/reviewSubmissions.js'

/**
 * @typedef {'pending' | 'published' | 'rejected' | 'deleted'} ReviewStatus
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
// Deleted reviews are retained in storage but hidden from public display.
// This allows member deletion without changing the original mock data.
export const REVIEW_STATUSES = ['pending', 'published', 'rejected', 'deleted']
export const REVIEW_MODERATION_STORAGE_KEY = 'instea.reviewModeration.v1'

export const REVIEW_EDITS_STORAGE_KEY = 'instea.reviewEdits.v1'

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

// Reads review edits saved in this browser.
// Edited content is stored separately from the original mock reviews and admin moderation history, so the original data is preserved.
// Returns an empty object if no valid saved edits exist.
function readSavedEdits() {
  try {
    const saved = localStorage.getItem(REVIEW_EDITS_STORAGE_KEY)
    if (!saved) return {}

    const parsed = JSON.parse(saved)
    if (parsed?.version !== 1 || !isRecord(parsed.reviews)) return {}

    return parsed.reviews
  } catch {
    return {}
  }
}

// Saves edited review content in this browser.
// Uses separate storage so the original mock reviews and existing admin moderation history are preserved.
function writeSavedEdits(edits) {
  try {
    localStorage.setItem(REVIEW_EDITS_STORAGE_KEY, JSON.stringify({
      version: 1,
      reviews: edits,
    }))
  } catch {
    throw new Error('The review changes could not be saved in this browser.')
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
      .map(([id, entry]) => [
        id,
        {
          status: entry.status,
          history: normalizeHistory(entry.history),

          // Restore saved reports when the page reloads.
          flagged: entry.flagged === true,
          flagReason: typeof entry.flagReason === 'string'
            ? entry.flagReason
            : '',
        },
      ]))
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

// Combines the original mock reviews with saved edits and moderation.
// Edited content replaces the displayed fields without modifying
// the original mock data or existing moderation history.
function listMockReviews() {
  const saved = readSavedModeration()
  const edits = readSavedEdits()

  return [...communityReviews, ...reviewSubmissions].map((source) => {
    const review = toReview(source)
    const moderation = saved.get(review.id)
    const edit = edits[review.id]

    // Use edited content when available, otherwise keep the original.
    const updatedReview = isRecord(edit)
      ? {
        ...review,
        product: typeof edit.product === 'string' ? edit.product : review.product,
        rating: Number.isInteger(edit.rating) && edit.rating >= 1 && edit.rating <= 5
          ? edit.rating
          : review.rating,
        comment: typeof edit.comment === 'string' ? edit.comment : review.comment,
      }
      : review

    // Preserve the admin moderation status and history.
    if (!moderation) return updatedReview

    return {
      ...updatedReview,
      status: moderation.status,
      history: [...updatedReview.history, ...moderation.history],

      // Restore saved report information for the existing admin flag styling.
      flagged: moderation.flagged || updatedReview.flagged,
      flagReason: moderation.flagReason || updatedReview.flagReason,
    }
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
    // Deleted reviews cannot be restored through admin moderation.
    if (review.status === 'deleted') {
      throw new Error('Deleted reviews cannot be moderated.')
    }
    if (review.status === status) return mockResponse(review)

    const saved = readSavedModeration()
    const entry = { status, at: new Date().toISOString(), by: MOCK_MODERATOR }
    // Preserve existing report information when Admin approves or rejects a review.
    saved.set(review.id, {
      status,
      history: [...(saved.get(review.id)?.history ?? []), entry],
      flagged: review.flagged,
      flagReason: review.flagReason,
    })
    // Persist the updated review status and moderation history.
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

/**
 * Saves changes to an existing review and sends it back for admin approval.
 * Mock mode stores edits separately from the original review data.
 *
 * @param {string} id review being edited
 * @param {{ product: string, rating: number, comment: string }} changes
 * @returns {Promise<ReviewSubmission>}
 */
export async function updateReview(id, changes) {
  const product = changes.product?.trim()
  const comment = changes.comment?.trim()
  const rating = changes.rating

  // Validate the edited review before saving.
  if (!product || !comment || !Number.isInteger(rating) ||
    rating < 1 || rating > 5) {
    throw new Error('Please enter a product, rating, and comment.')
  }

  if (USE_MOCK) {
    // Make sure the original review exists.
    const review = listMockReviews().find((item) => item.id === String(id))
    if (!review) throw new Error(`Review not found: ${id}`)

    // Save edited content without changing the original mock data.
    const edits = readSavedEdits()
    writeSavedEdits({
      ...edits,
      [review.id]: { product, rating, comment },
    })

    // Hide the review until an admin approves the changes.
    await setReviewStatus(review.id, 'pending')

    return mockResponse({
      ...review,
      product,
      rating,
      comment,
      status: 'pending',
    })
  }

  // Backend integration will be added when the API is available.
  throw new Error('Review editing is not available without the backend.')
}

/**
 * Soft-deletes a review by changing its status to deleted.
 * The original mock review remains saved, but is hidden
 * from the public Community page and moderation queue.
 *
 * @param {string} id review being deleted
 * @returns {Promise<ReviewSubmission>}
 */
export async function deleteReview(id) {
  if (USE_MOCK) {
    // Make sure the review exists and has not already been deleted.
    const review = listMockReviews().find((item) => item.id === String(id))

    if (!review || review.status === 'deleted') {
      throw new Error('Review not found or already deleted.')
    }

    // Preserve the review data and record its deleted status.
    return setReviewStatus(review.id, 'deleted')
  }

  // Backend integration will be added when the API is available.
  throw new Error('Review deletion is not available without the backend.')
}

/**
 * Flags an existing review for admin moderation.
 * The review keeps its current status, so published
 * reviews remain visible until an admin takes action.
 *
 * @param {string} id review being reported
 * @param {string} reason selected by the member
 * @returns {Promise<ReviewSubmission>}
 */
export async function reportReview(id, reason) {
  if (!reason?.trim()) {
    throw new Error('Please select a reason for reporting.')
  }

  if (USE_MOCK) {
    // Find the review in the existing mock data.
    const review = listMockReviews().find((item) => item.id === String(id))

    if (!review || review.status === 'deleted') {
      throw new Error('Review not found or already deleted.')
    }

    // Prevent duplicate reports on reviews that are already flagged.
    if (review.flagged) {
      throw new Error('This review has already been reported.')
    }

    // Save the report alongside the existing moderation data.
    const saved = readSavedModeration()
    const existing = saved.get(review.id)

    saved.set(review.id, {
      status: review.status,
      history: existing?.history ?? [],
      flagged: true,
      flagReason: reason.trim(),
    })

    writeSavedModeration(saved)

    // Return the review with its new report information.
    return mockResponse({
      ...review,
      flagged: true,
      flagReason: reason.trim(),
    })
  }

  // Backend integration will be added when the API is available.
  throw new Error('Review reporting is not available without the backend.')
}