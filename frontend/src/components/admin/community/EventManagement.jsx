import { useEffect, useRef, useState } from 'react'
import { Ban, CircleCheck, Pencil, Plus, RotateCcw } from 'lucide-react'
import AdminButton from '../AdminButton.jsx'
import AdminFormField from '../AdminFormField.jsx'
import {
  EVENT_CATEGORIES,
  TIME_TO_BE_ANNOUNCED,
  createEvent,
  formatEventTime,
  getEvents,
  parseEventDate,
  parseEventTime,
  setEventStatus,
  updateEvent,
} from '../../../services/eventService.js'
import './EventManagement.css'

const NEW_EVENT_BUTTON_ID = 'event-management-new'
const editButtonId = (eventId) => `event-management-edit-${eventId}`
const statusButtonId = (eventId) => `event-management-status-${eventId}`

const statusLabels = { active: 'Active', cancelled: 'Cancelled' }
const dateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
const textSort = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

function formatDate(value) {
  const date = parseEventDate(value)
  return date ? dateFormat.format(date) : 'Date unavailable'
}

function registrationSummary({ capacity, spotsRemaining }) {
  if (capacity == null || spotsRemaining == null) return 'No registration'
  const left = spotsRemaining === 0 ? 'Full' : `${spotsRemaining} ${spotsRemaining === 1 ? 'spot' : 'spots'} left`
  return `${capacity - spotsRemaining} / ${capacity} registered · ${left}`
}

// Events without a start time (still to be announced) go last within their day.
function startMinutes(event) {
  const start = parseEventTime(event.time)?.start
  return start ? Number(start.slice(0, 2)) * 60 + Number(start.slice(3)) : 24 * 60
}

function compareEvents(left, right) {
  return (left.date ?? '').localeCompare(right.date ?? '')
    || startMinutes(left) - startMinutes(right)
    || textSort.compare(left.title, right.title)
    || textSort.compare(String(left.id), String(right.id))
}

function isWholeNumber(value, minimum) {
  return /^\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value)) && Number(value) >= minimum
}

// Error keys follow the order of the fields on screen, so the first key is the first field to fix.
function validate(values) {
  const errors = {}
  if (!values.title.trim()) errors.title = 'Enter an event title.'
  if (!values.date) errors.date = 'Enter the event date.'
  else if (!parseEventDate(values.date)) errors.date = 'Enter a valid date.'
  if (values.endTime && !values.startTime) errors.startTime = 'Enter a start time, or clear the end time.'
  else if (values.endTime && values.endTime <= values.startTime) errors.endTime = 'End time must be after the start time.'
  if (!values.location.trim()) errors.location = 'Enter the event location.'
  if (!values.description.trim()) errors.description = 'Enter a description.'
  if (values.requiresRegistration) {
    const capacityValid = isWholeNumber(values.capacity, 1)
    if (!capacityValid) errors.capacity = 'Enter a whole number of 1 or more.'
    if (!isWholeNumber(values.registered, 0) || (capacityValid && Number(values.registered) > Number(values.capacity))) {
      errors.registered = capacityValid
        ? `Enter a whole number from 0 to ${Number(values.capacity)}.`
        : 'Enter a whole number of 0 or more.'
    }
  }
  return errors
}

function initialValues(event) {
  const time = parseEventTime(event?.time)
  const hasRegistration = event?.capacity != null && event?.spotsRemaining != null
  return {
    title: event?.title ?? '',
    category: event?.category ?? EVENT_CATEGORIES[0],
    status: event?.status === 'cancelled' ? 'cancelled' : 'active',
    date: event?.date ?? '',
    startTime: time?.start ?? '',
    endTime: time?.end ?? '',
    location: event?.location ?? '',
    description: event?.description ?? '',
    requiresRegistration: hasRegistration,
    capacity: hasRegistration ? String(event.capacity) : '',
    registered: hasRegistration ? String(event.capacity - event.spotsRemaining) : '0',
  }
}

function EventForm({ event, saving, onSave, onCancel }) {
  const formRef = useRef(null)
  const errorRef = useRef(null)
  const [values, setValues] = useState(() => initialValues(event))
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  // Free text such as "All day" cannot be shown in the time inputs, so it is kept unless a start time is entered.
  const customTime = event && !parseEventTime(event.time) && event.time !== TIME_TO_BE_ANNOUNCED ? event.time : ''

  useEffect(() => { formRef.current?.querySelector('input')?.focus() }, [])
  useEffect(() => { if (saveError) errorRef.current?.focus() }, [saveError])

  function change(field) {
    return (changeEvent) => setValues((previous) => ({ ...previous, [field]: changeEvent.target.value }))
  }

  async function submit(submitEvent) {
    submitEvent.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    const [firstInvalid] = Object.keys(nextErrors)
    if (firstInvalid) {
      formRef.current?.elements.namedItem(firstInvalid)?.focus()
      return
    }
    const capacity = Number(values.capacity)
    setSaveError('')
    try {
      await onSave({
        title: values.title.trim(),
        category: values.category,
        date: values.date,
        time: (values.startTime || !customTime) ? formatEventTime(values.startTime, values.endTime) : customTime,
        location: values.location.trim(),
        description: values.description.trim(),
        status: values.status,
        capacity: values.requiresRegistration ? capacity : null,
        spotsRemaining: values.requiresRegistration ? capacity - Number(values.registered) : null,
      })
      // The parent closes the form once the event is saved.
    } catch {
      setSaveError('We couldn’t save this event. Please try again.')
    }
  }

  return (
    <form ref={formRef} className="event-management-form" aria-labelledby="event-management-form-heading" onSubmit={submit} noValidate>
      <h3 id="event-management-form-heading">{event ? 'Edit event' : 'New event'}</h3>
      <fieldset className="event-management-fieldset" disabled={saving}>
        <AdminFormField label="Title" name="title" value={values.title} onChange={change('title')} required error={errors.title} />
        <div className="event-management-form-row event-management-form-row--two">
          <AdminFormField as="select" label="Category" name="category" value={values.category} onChange={change('category')}>
            {!EVENT_CATEGORIES.includes(values.category) && <option value={values.category}>{values.category}</option>}
            {EVENT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </AdminFormField>
          <AdminFormField as="select" label="Status" name="status" value={values.status} onChange={change('status')}>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </AdminFormField>
        </div>
        <div className="event-management-form-row event-management-form-row--three">
          <AdminFormField label="Date" name="date" type="date" value={values.date} onChange={change('date')} required error={errors.date} />
          <AdminFormField
            label="Start time"
            name="startTime"
            type="time"
            value={values.startTime}
            onChange={change('startTime')}
            error={errors.startTime}
            aria-describedby="event-management-time-hint"
          />
          <AdminFormField label="End time" name="endTime" type="time" value={values.endTime} onChange={change('endTime')} error={errors.endTime} />
        </div>
        <p className="event-management-hint" id="event-management-time-hint">
          {customTime
            ? `Current time: “${customTime}”. Enter a start time to replace it.`
            : `Times are optional. If left blank, the event shows “${TIME_TO_BE_ANNOUNCED}”.`}
        </p>
        <AdminFormField label="Location" name="location" value={values.location} onChange={change('location')} required error={errors.location} />
        <AdminFormField as="textarea" label="Description" name="description" value={values.description} onChange={change('description')} required error={errors.description} />
        <fieldset className="event-management-registration">
          <legend>Registration</legend>
          <AdminFormField
            type="checkbox"
            label="Requires registration"
            name="requiresRegistration"
            checked={values.requiresRegistration}
            onChange={(changeEvent) => setValues((previous) => ({ ...previous, requiresRegistration: changeEvent.target.checked }))}
          />
          {values.requiresRegistration && (
            <div className="event-management-form-row event-management-form-row--two">
              <AdminFormField label="Capacity" name="capacity" type="number" min="1" step="1" value={values.capacity} onChange={change('capacity')} required error={errors.capacity} hint="Total spots available." />
              <AdminFormField label="Registered count" name="registered" type="number" min="0" step="1" value={values.registered} onChange={change('registered')} required error={errors.registered} hint="People registered so far." />
            </div>
          )}
        </fieldset>
        {saveError && <p ref={errorRef} className="event-management-form-error" role="alert" tabIndex={-1}>{saveError}</p>}
        <div className="event-management-form-actions">
          <AdminButton variant="secondary" onClick={onCancel}>Discard changes</AdminButton>
          <AdminButton type="submit" loading={saving}>{event ? 'Save changes' : 'Create event'}</AdminButton>
        </div>
      </fieldset>
    </form>
  )
}

function CancelConfirmation({ event, updating, onKeep, onConfirm }) {
  const keepRef = useRef(null)
  const headingId = `event-management-confirm-${event.id}`
  useEffect(() => { keepRef.current?.focus() }, [])
  return (
    <div className="event-management-confirm" role="group" aria-labelledby={headingId}>
      <p id={headingId}>Cancel “{event.title}”? It will be marked as cancelled. You can restore it later.</p>
      <div className="event-management-item-actions">
        <AdminButton ref={keepRef} variant="secondary" size="compact" disabled={updating} onClick={onKeep}>Keep event</AdminButton>
        <AdminButton variant="danger" size="compact" loading={updating} loadingLabel="Cancelling…" onClick={onConfirm}>Confirm cancellation</AdminButton>
      </div>
    </div>
  )
}

function EventItem({ event, editing, saving, confirming, updating, onEdit, onRequestCancel, onKeep, onConfirmCancel, onRestore }) {
  // A missing status means the event is active.
  const status = event.status === 'cancelled' ? 'cancelled' : 'active'
  const cancelled = status === 'cancelled'
  return (
    <li className={`event-management-item${cancelled ? ' event-management-item--cancelled' : ''}`}>
      <div className="event-management-item-header">
        <div className="event-management-item-title">
          <h3>{event.title}</h3>
          <p>{event.category}</p>
        </div>
        <span className={`event-management-status event-management-status--${status}`}>
          {cancelled ? <Ban size={14} aria-hidden="true" /> : <CircleCheck size={14} aria-hidden="true" />}
          {statusLabels[status]}
        </span>
      </div>
      <dl className="event-management-details">
        <div><dt>Date</dt><dd>{formatDate(event.date)}</dd></div>
        <div><dt>Time</dt><dd>{event.time}</dd></div>
        <div><dt>Location</dt><dd>{event.location}</dd></div>
        <div><dt>Registration</dt><dd>{registrationSummary(event)}</dd></div>
      </dl>
      <div className="event-management-item-actions">
        <AdminButton id={editButtonId(event.id)} variant="secondary" size="compact" aria-label={`Edit ${event.title}`} disabled={saving} onClick={onEdit}>
          <Pencil size={14} aria-hidden="true" /> Edit
        </AdminButton>
        {cancelled ? (
          <AdminButton
            id={statusButtonId(event.id)}
            variant="secondary"
            size="compact"
            aria-label={`Restore event ${event.title}`}
            loading={updating}
            loadingLabel="Restoring…"
            disabled={editing}
            onClick={onRestore}
          >
            <RotateCcw size={14} aria-hidden="true" /> Restore event
          </AdminButton>
        ) : (
          <AdminButton
            id={statusButtonId(event.id)}
            variant="secondary"
            size="compact"
            aria-label={`Cancel event ${event.title}`}
            aria-expanded={confirming}
            disabled={editing || updating}
            onClick={onRequestCancel}
          >
            <Ban size={14} aria-hidden="true" /> Cancel event
          </AdminButton>
        )}
      </div>
      {confirming && <CancelConfirmation event={event} updating={updating} onKeep={onKeep} onConfirm={onConfirmCancel} />}
    </li>
  )
}

export default function EventManagement() {
  const [request, setRequest] = useState({ status: 'loading', events: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  const [editor, setEditor] = useState(null)
  const [pendingCancelId, setPendingCancelId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const focusTargetId = useRef(null)

  useEffect(() => {
    let ignore = false
    getEvents()
      .then((data) => {
        if (data !== null && !Array.isArray(data)) throw new Error('Invalid events response')
        if (!ignore) setRequest({ status: 'ready', events: data ?? [], error: '' })
      })
      .catch(() => {
        if (!ignore) setRequest({ status: 'error', events: [], error: 'We couldn’t load events. Please try again.' })
      })
    return () => { ignore = true }
  }, [attempt])

  // Moves focus once the next render has put the target on screen.
  useEffect(() => {
    if (!focusTargetId.current) return
    document.getElementById(focusTargetId.current)?.focus()
    focusTargetId.current = null
  })

  function openEditor(event, returnFocusId) {
    setNotice('')
    setActionError('')
    setPendingCancelId(null)
    setEditor({ event, returnFocusId })
  }

  function closeEditor() {
    focusTargetId.current = editor.returnFocusId
    setEditor(null)
  }

  // Rejects when saving fails, so the form can show its error. The form stays open and unchanged.
  async function saveEvent(fields) {
    const existing = editor.event
    setSaving(true)
    try {
      const saved = existing ? await updateEvent(existing.id, fields) : await createEvent(fields)
      setRequest((previous) => ({
        ...previous,
        events: existing
          ? previous.events.map((item) => (item.id === saved.id ? saved : item))
          : [...previous.events, saved],
      }))
      setNotice(`${saved.title} ${existing ? 'updated' : 'added'}.`)
      closeEditor()
    } finally {
      setSaving(false)
    }
  }

  function dismissCancellation(event) {
    focusTargetId.current = statusButtonId(event.id)
    setPendingCancelId(null)
  }

  async function changeStatus(event, status) {
    setNotice('')
    setActionError('')
    setUpdatingId(event.id)
    try {
      const saved = await setEventStatus(event.id, status)
      setRequest((previous) => ({
        ...previous,
        events: previous.events.map((item) => (item.id === saved.id ? saved : item)),
      }))
      setNotice(`${saved.title} is now ${statusLabels[status].toLowerCase()}.`)
    } catch {
      setActionError(`We couldn’t ${status === 'cancelled' ? 'cancel' : 'restore'} ${event.title}. Please try again.`)
    }
    focusTargetId.current = statusButtonId(event.id)
    setPendingCancelId(null)
    setUpdatingId(null)
  }

  function retry() {
    setRequest({ status: 'loading', events: [], error: '' })
    setAttempt((previous) => previous + 1)
  }

  const ready = request.status === 'ready'
  const sortedEvents = [...request.events].sort(compareEvents)

  return (
    <section className="event-management" aria-labelledby="event-management-heading">
      <div className="event-management-card">
        <header className="event-management-header">
          <div>
            <h2 id="event-management-heading">Events</h2>
            <p className="event-management-note">Changes are saved in this browser only. They do not update the customer Events page yet.</p>
          </div>
          <AdminButton id={NEW_EVENT_BUTTON_ID} disabled={!ready || saving} onClick={() => openEditor(null, NEW_EVENT_BUTTON_ID)}>
            <Plus size={18} aria-hidden="true" /> New event
          </AdminButton>
        </header>

        <p className="event-management-notice" role="status">{notice}</p>
        {actionError && <p className="event-management-error" role="alert">{actionError}</p>}

        {editor && <EventForm key={editor.event?.id ?? 'new'} event={editor.event} saving={saving} onSave={saveEvent} onCancel={closeEditor} />}

        {request.status === 'loading' && <p className="event-management-message" role="status">Loading events…</p>}
        {request.status === 'error' && (
          <div className="event-management-message">
            <p role="alert">{request.error}</p>
            <AdminButton variant="secondary" onClick={retry}>Try again</AdminButton>
          </div>
        )}
        {ready && sortedEvents.length === 0 && (
          <p className="event-management-message" role="status">No events yet. Select “New event” to add the first one.</p>
        )}
        {ready && sortedEvents.length > 0 && (
          <ul className="event-management-list" aria-labelledby="event-management-heading">
            {sortedEvents.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                editing={editor?.event?.id === event.id}
                saving={saving}
                confirming={pendingCancelId === event.id}
                updating={updatingId === event.id}
                onEdit={() => openEditor(event, editButtonId(event.id))}
                onRequestCancel={() => { setNotice(''); setActionError(''); setPendingCancelId(event.id) }}
                onKeep={() => dismissCancellation(event)}
                onConfirmCancel={() => changeStatus(event, 'cancelled')}
                onRestore={() => changeStatus(event, 'active')}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
