import { useEffect, useId, useRef, useState } from 'react'
import { Check, Flag, Undo2, X } from 'lucide-react'
import AdminButton from '../AdminButton.jsx'
import { customers } from '../../../data/customers.js'
import { getReviewSubmissions, setReviewStatus } from '../../../services/reviewService.js'
import './ReviewManagement.css'

const statusLabels = { pending: 'Pending', published: 'Published', rejected: 'Rejected' }
// Pending reviews come first because they are the ones waiting for a decision.
const statusOrder = { pending: 0, published: 1, rejected: 2 }
const filters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
]
const COMMENT_PREVIEW_LENGTH = 140
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const dateTimeFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })
const customersById = new Map(customers.map((customer) => [customer.id, customer]))

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// "YYYY-MM-DD" is read as a local date. new Date('2026-11-08') would be UTC midnight
// and show the previous day in time zones behind UTC.
function parseDate(value) {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

function formatDate(value) {
  const date = parseDate(value)
  return date ? dateFormat.format(date) : 'Date unavailable'
}

function formatDateTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : dateTimeFormat.format(date)
}

function reviewerName(review) {
  return String(review.name ?? '').trim() || (review.authorId ? 'Member' : 'Guest')
}

function productName(review) {
  return String(review.product ?? '').trim() || 'Unknown product'
}

function ratingText(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? `${rating}/5 stars` : 'Rating unavailable'
}

function statusLabel(status) {
  return statusLabels[status] ?? 'Status unavailable'
}

// Counts characters rather than UTF-16 units so an emoji is never cut in half.
function commentPreview(comment) {
  const text = String(comment ?? '').replace(/\s+/g, ' ').trim()
  const characters = Array.from(text)
  if (characters.length <= COMMENT_PREVIEW_LENGTH) return text || 'No comment provided.'
  return `${characters.slice(0, COMMENT_PREVIEW_LENGTH).join('').trimEnd()}…`
}

function sortReviews(reviews) {
  return [...reviews].sort((a, b) =>
    (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
    || String(b.date ?? '').localeCompare(String(a.date ?? '')),
  )
}

function resultMessage(review, status) {
  const subject = `the review by ${reviewerName(review)} of ${productName(review)}`
  if (status === 'published') return `Approved ${subject}. It is now published.`
  if (status === 'rejected') return `Rejected ${subject}.`
  return `Moved ${subject} back to pending.`
}

function StatusBadge({ status }) {
  const variant = Object.hasOwn(statusLabels, status) ? status : 'unknown'
  return <span className={`review-management-badge review-management-badge--${variant}`}>{statusLabel(status)}</span>
}

function SubmittedDate({ value }) {
  return <time dateTime={parseDate(value) ? value : undefined}>{formatDate(value)}</time>
}

// Approve and Reject only appear when they would change something. In the detail
// view a review can also be moved back to pending.
function ModerationActions({ review, saving, detail = false, onModerate }) {
  // aria-disabled instead of disabled keeps keyboard focus on the button while saving.
  const busy = Boolean(saving) || undefined
  const context = detail ? '' : ` review by ${reviewerName(review)} of ${productName(review)}`
  return (
    <div className="review-management-actions">
      {review.status !== 'published' && (
        <AdminButton
          size="compact"
          className="review-management-action"
          aria-label={`Approve${context}`}
          aria-disabled={busy}
          onClick={() => onModerate(review, 'published')}
        >
          <Check size={16} aria-hidden="true" /> Approve
        </AdminButton>
      )}
      {review.status !== 'rejected' && (
        <AdminButton
          size="compact"
          variant="secondary"
          className="review-management-action"
          aria-label={`Reject${context}`}
          aria-disabled={busy}
          onClick={() => onModerate(review, 'rejected')}
        >
          <X size={16} aria-hidden="true" /> Reject
        </AdminButton>
      )}
      {detail && review.status !== 'pending' && (
        <AdminButton
          size="compact"
          variant="secondary"
          className="review-management-action"
          aria-disabled={busy}
          onClick={() => onModerate(review, 'pending')}
        >
          <Undo2 size={16} aria-hidden="true" /> Move back to pending
        </AdminButton>
      )}
    </div>
  )
}

function ReviewCard({ review, selected, detailsId, saving, openerRef, onView, onModerate }) {
  const name = reviewerName(review)
  const product = productName(review)
  return (
    <article
      className={`review-management-card${review.flagged ? ' review-management-card--flagged' : ''}${selected ? ' review-management-card--selected' : ''}`}
      aria-label={`Review by ${name} of ${product}`}
    >
      <div className="review-management-card-header">
        <h3 className="review-management-card-title">{name} · {product} · {ratingText(review.rating)}</h3>
        <StatusBadge status={review.status} />
      </div>
      <p className="review-management-meta">Submitted <SubmittedDate value={review.date} /></p>
      <p className="review-management-comment">{commentPreview(review.comment)}</p>
      {review.flagged && (
        /* Display a general warning because reports can have different reasons. */
        < p className="review-management-flag">
          <Flag size={14} aria-hidden="true" /> Flagged for review
        </p>
      )
      }
      <div className="review-management-card-actions">
        <ModerationActions review={review} saving={saving} onModerate={(item, status) => onModerate(item, status, 'list')} />
        <AdminButton
          size="compact"
          variant="secondary"
          className="review-management-action"
          ref={openerRef}
          aria-label={`View review by ${name} of ${product}`}
          aria-expanded={selected}
          aria-controls={selected ? detailsId : undefined}
          onClick={() => onView(review.id)}
        >
          View
        </AdminButton>
      </div>
    </article >
  )
}

function ReviewDetails({ id, review, saving, onClose, onModerate, ref }) {
  const name = reviewerName(review)
  const member = review.authorId ? customersById.get(review.authorId) : null
  const memberName = member ? [member.firstName, member.lastName].filter(Boolean).join(' ') : ''
  // Stored oldest first; show the latest action first.
  const history = [...(review.history ?? [])].reverse()
  const comment = String(review.comment ?? '').trim()
  return (
    <section ref={ref} tabIndex={-1} className="review-management-details" id={id} aria-labelledby={`${id}-heading`}>
      <header className="review-management-details-header">
        <div className="review-management-details-heading">
          <h3 className="review-management-details-title" id={`${id}-heading`}>Review by {name}</h3>
          {review.flagged && (
            <p className="review-management-flag"><Flag size={14} aria-hidden="true" /> Flagged as possible spam</p>
          )}
        </div>
        <AdminButton variant="secondary" size="compact" iconOnly aria-label="Close review details" onClick={onClose}>
          <X size={16} aria-hidden="true" />
        </AdminButton>
      </header>

      <dl className="review-management-summary">
        <div><dt>Customer</dt><dd>{name}</dd></div>
        <div><dt>Account type</dt><dd>{review.authorId ? 'Member' : 'Guest (no account)'}</dd></div>
        {review.authorId && member && (
          <>
            <div><dt>Member name</dt><dd>{memberName || 'Not provided'}</dd></div>
            <div><dt>Member email</dt><dd>{member.email || 'Not provided'}</dd></div>
          </>
        )}
        {review.authorId && !member && <div><dt>Member account</dt><dd>Account details unavailable</dd></div>}
        <div><dt>Product</dt><dd>{productName(review)}</dd></div>
        <div><dt>Rating</dt><dd>{ratingText(review.rating)}</dd></div>
        <div><dt>Submitted</dt><dd><SubmittedDate value={review.date} /></dd></div>
        <div><dt>Status</dt><dd><StatusBadge status={review.status} /></dd></div>
        {review.flagged && <div><dt>Flag reason</dt><dd>{review.flagReason || 'No reason recorded'}</dd></div>}
      </dl>

      <div className="review-management-section">
        <h4>Comment</h4>
        <p className="review-management-full-comment">{comment || 'No comment provided.'}</p>
      </div>

      <div className="review-management-section">
        <h4>Moderation history</h4>
        {history.length > 0 ? (
          <ol className="review-management-history">
            {history.map((entry, index) => (
              <li key={`${entry.at}-${index}`}>
                {statusLabel(entry.status)} by {entry.by || 'Staff Member'} · <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
              </li>
            ))}
          </ol>
        ) : <p className="review-management-muted">No moderation actions yet.</p>}
      </div>

      <div role="group" aria-label="Moderation actions">
        <ModerationActions review={review} saving={saving} detail onModerate={(item, status) => onModerate(item, status, 'detail')} />
      </div>
    </section>
  )
}

export default function ReviewManagement() {
  const baseId = useId()
  const headingId = `${baseId}-heading`
  const detailsId = `${baseId}-details`
  const filterName = `${baseId}-status`
  const [request, setRequest] = useState({ status: 'loading', reviews: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  // Review id -> status being saved. Used to ignore repeat clicks while a save is running.
  const [saving, setSaving] = useState({})
  const [announcement, setAnnouncement] = useState({ type: 'success', text: '' })
  const openers = useRef(new Map())
  const filterRef = useRef(null)
  const detailRef = useRef(null)
  const pendingFocus = useRef(null)

  useEffect(() => {
    let ignore = false
    getReviewSubmissions()
      .then((data) => {
        if (data !== null && !Array.isArray(data)) throw new Error('Invalid reviews response')
        if (!ignore) setRequest({ status: 'ready', reviews: data ?? [], error: '' })
      })
      .catch(() => {
        if (!ignore) setRequest({ status: 'error', reviews: [], error: 'We couldn’t load reviews. Please try again.' })
      })
    return () => { ignore = true }
  }, [attempt])

  // Moves focus once the list or detail has re-rendered. If the element that
  // would normally get focus is gone (for example a filtered-out review), the
  // selected filter option is the next stable place.
  useEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    pendingFocus.current = null
    const fallback = filterRef.current?.querySelector('input:checked')
    const element = (target.type === 'detail' ? detailRef.current : openers.current.get(target.id)) ?? fallback
    element?.focus()
  })

  // Keep all reviews available for the existing status tabs.
  // The All tab shows reviews needing attention and rejected reviews,
  // while Published and Rejected retain their original history views.
  const reviews = request.reviews
  // Show reviews needing moderation, but never show deleted reviews.
  const moderationQueue = reviews.filter(
    (review) =>
      review.status !== 'deleted' &&
      (
        review.status === 'pending' ||
        review.status === 'rejected' ||
        review.flagged === true
      )
  );

  // The All tab excludes published reviews unless they are reported.
  // The other tabs continue showing reviews by their original status.
  const visibleReviews = sortReviews(
    filter === 'all'
      ? moderationQueue
      : reviews.filter((review) => review.status === filter)
  )

  const selectedReview = reviews.find((review) => review.id === selectedId)
  const filterLabel = filters.find((item) => item.value === filter)?.label ?? 'All'

  function retry() {
    setSelectedId(null)
    setAnnouncement({ type: 'success', text: '' })
    setRequest({ status: 'loading', reviews: [], error: '' })
    setAttempt((previous) => previous + 1)
  }

  function toggleDetails(id) {
    if (selectedId === id) {
      setSelectedId(null)
      return
    }
    pendingFocus.current = { type: 'detail' }
    setSelectedId(id)
  }

  function closeDetails() {
    pendingFocus.current = { type: 'opener', id: selectedId }
    setSelectedId(null)
  }

  async function moderate(review, status, origin) {
    if (saving[review.id]) return
    setSaving((previous) => ({ ...previous, [review.id]: status }))
    try {
      const saved = await setReviewStatus(review.id, status)
      const updated = isRecord(saved) ? { ...review, ...saved, id: review.id } : { ...review, status }
      // The button that was pressed may disappear (Approve is hidden once published).
      pendingFocus.current = origin === 'detail' ? { type: 'detail' } : { type: 'opener', id: review.id }
      setRequest((previous) => ({
        ...previous,
        reviews: previous.reviews.map((item) => (item.id === review.id ? updated : item)),
      }))
      setAnnouncement({ type: 'success', text: resultMessage(review, status) })
    } catch {
      setAnnouncement({
        type: 'error',
        text: `We couldn’t update the review by ${reviewerName(review)} of ${productName(review)}. Please try again.`,
      })
    } finally {
      setSaving((previous) => {
        const next = { ...previous }
        delete next[review.id]
        return next
      })
    }
  }

  return (
    <section className="review-management" aria-labelledby={headingId}>
      <header className="review-management-header">
        <h2 className="review-management-title" id={headingId}>Review moderation</h2>
        <p className="review-management-note">
          Moderation is a prototype: changes are saved in this browser only and are not yet connected to the backend.
        </p>
      </header>

      <div
        className={`review-management-live${announcement.type === 'error' ? ' review-management-live--error' : ''}`}
        role="status"
      >
        {announcement.text}
      </div>

      <div className="review-management-body">
        {request.status === 'loading' && <p className="review-management-message" role="status">Loading reviews…</p>}
        {request.status === 'error' && (
          <div className="review-management-message">
            <p role="alert">{request.error}</p>
            <AdminButton variant="secondary" onClick={retry}>Try again</AdminButton>
          </div>
        )}
        {request.status === 'ready' && reviews.length === 0 && (
          <p className="review-management-message">No reviews have been submitted yet.</p>
        )}
        {request.status === 'ready' && reviews.length > 0 && (
          <>
            <fieldset className="review-management-filter" ref={filterRef}>
              <legend className="admin-visually-hidden">Filter reviews by status</legend>
              {filters.map(({ value, label }) => (
                <label className="review-management-filter-option" key={value}>
                  <input
                    type="radio"
                    name={filterName}
                    value={value}
                    checked={filter === value}
                    onChange={() => setFilter(value)}
                  />
                  <span className="review-management-filter-pill">
                    {label} <span className="review-management-filter-count">
                      {/* Count only reviews displayed in the All tab. */}
                      {value === 'all' ? moderationQueue.length : reviews.filter((review) => review.status === value).length}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            {visibleReviews.length > 0 ? (
              <ul className="review-management-list" aria-label={`${filterLabel} reviews`}>
                {visibleReviews.map((review) => (
                  <li key={review.id}>
                    <ReviewCard
                      review={review}
                      selected={selectedId === review.id}
                      detailsId={detailsId}
                      saving={saving[review.id]}
                      openerRef={(node) => {
                        if (node) openers.current.set(review.id, node)
                        else openers.current.delete(review.id)
                      }}
                      onView={toggleDetails}
                      onModerate={moderate}
                    />
                  </li>
                ))}
              </ul>
            ) : <p className="review-management-message">No {filterLabel.toLowerCase()} reviews.</p>}
          </>
        )}

        {selectedReview && (
          <ReviewDetails
            id={detailsId}
            ref={detailRef}
            review={selectedReview}
            saving={saving[selectedReview.id]}
            onClose={closeDetails}
            onModerate={moderate}
          />
        )}
      </div>
    </section>
  )
}
