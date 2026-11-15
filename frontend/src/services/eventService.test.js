import { events as seedEvents } from '../data/events.js'
import {
  EVENTS_STORAGE_KEY,
  createEvent,
  formatEventTime,
  getEvents,
  parseEventDate,
  parseEventTime,
  setEventStatus,
  updateEvent,
} from './eventService.js'

// Skip the simulated network delay so the tests stay fast. Copies are still returned.
vi.mock('./apiClient.js', async (importOriginal) => ({
  ...(await importOriginal()),
  mockResponse: (data) => Promise.resolve(structuredClone(data)),
}))

const newEvent = {
  title: 'Cupping Night',
  category: 'Drink tasting',
  date: '2026-12-20',
  time: '7:00 PM – 8:30 PM',
  location: 'SoHo Tea',
  description: 'Taste three teas side by side.',
  status: 'active',
}

function stored() {
  return JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY))
}

function store(value) {
  localStorage.setItem(EVENTS_STORAGE_KEY, typeof value === 'string' ? value : JSON.stringify(value))
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})
afterEach(() => vi.restoreAllMocks())

describe('event service seeding', () => {
  it('returns the seed events when nothing is stored, with a missing status treated as active', async () => {
    const events = await getEvents()
    expect(events).toHaveLength(seedEvents.length)
    expect(events.map((event) => event.id)).toEqual(seedEvents.map((event) => event.id))
    expect(events.every((event) => event.status === 'active')).toBe(true)
    expect(events[0]).toMatchObject({
      title: 'Tea Tasting — Example Event',
      category: 'Drink tasting',
      date: '2026-12-06',
      time: '6:30 PM – 8:00 PM',
      location: 'SoHo Tea',
      capacity: 20,
      spotsRemaining: 4,
      priceLabel: 'Free for members',
      image: seedEvents[0].image,
    })
    expect(events[1]).not.toHaveProperty('capacity')
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
  })

  it('returns copies so callers cannot change the stored or seed data', async () => {
    const [first] = await getEvents()
    first.title = 'Changed by a caller'
    expect((await getEvents())[0].title).toBe('Tea Tasting — Example Event')
    expect(seedEvents[0].title).toBe('Tea Tasting — Example Event')
  })
})

describe('event service persistence', () => {
  it('creates an event with the next numeric id and keeps it across reads', async () => {
    const created = await createEvent({ ...newEvent, id: 'ignored', capacity: 12, spotsRemaining: 9 })
    expect(created).toMatchObject({ ...newEvent, id: seedEvents.length + 1, capacity: 12, spotsRemaining: 9 })
    const events = await getEvents()
    expect(events).toHaveLength(seedEvents.length + 1)
    expect(events.at(-1)).toEqual(created)
    expect(stored()).toMatchObject({ version: 1, events: expect.any(Array) })
    expect(stored().events.at(-1)).toMatchObject({ id: created.id, title: 'Cupping Night' })
  })

  it('trims text and leaves registration out of events without capacity', async () => {
    const created = await createEvent({
      ...newEvent,
      title: '  Cupping Night  ',
      capacity: null,
      spotsRemaining: null,
    })
    expect(created.title).toBe('Cupping Night')
    expect(created).not.toHaveProperty('capacity')
    expect(created).not.toHaveProperty('spotsRemaining')
    expect(stored().events.at(-1)).not.toHaveProperty('capacity')
  })

  it('defaults a missing time to "Time to be announced" and a new event to the shared image', async () => {
    const withoutTime = { ...newEvent }
    delete withoutTime.time
    const created = await createEvent(withoutTime)
    expect(created.time).toBe('Time to be announced')
    expect(created.image).toBe(seedEvents[0].image)
  })

  it('does not write the build-specific placeholder image URL to storage', async () => {
    await createEvent(newEvent)
    expect(stored().events.every((event) => !('image' in event))).toBe(true)
    expect((await getEvents()).every((event) => event.image === seedEvents[0].image)).toBe(true)
  })

  it('stores a custom image', async () => {
    await createEvent({ ...newEvent, image: '/custom.jpg' })
    expect(stored().events.at(-1).image).toBe('/custom.jpg')
    expect((await getEvents()).at(-1).image).toBe('/custom.jpg')
  })

  it('updates only the given fields and keeps unknown fields such as image and priceLabel', async () => {
    store({ version: 1, events: [{ ...seedEvents[0], status: 'active', image: '/tea.jpg', ribbon: 'Staff pick' }] })
    const updated = await updateEvent(1, { title: 'Tea Tasting, Second Round', location: 'Back room' })
    expect(updated).toMatchObject({
      id: 1,
      title: 'Tea Tasting, Second Round',
      location: 'Back room',
      date: '2026-12-06',
      capacity: 20,
      spotsRemaining: 4,
      priceLabel: 'Free for members',
      image: '/tea.jpg',
      ribbon: 'Staff pick',
    })
    expect(stored().events).toHaveLength(1)
    expect(stored().events[0]).toMatchObject({ title: 'Tea Tasting, Second Round', ribbon: 'Staff pick', image: '/tea.jpg' })
  })

  it('accepts an id given as text, as a route param would be', async () => {
    const updated = await updateEvent('2', { location: 'Window table' })
    expect(updated).toMatchObject({ id: 2, location: 'Window table' })
  })

  it('removes registration when capacity and spotsRemaining are null, and ignores undefined values', async () => {
    const updated = await updateEvent(1, { capacity: null, spotsRemaining: null, title: undefined, status: undefined })
    expect(updated).not.toHaveProperty('capacity')
    expect(updated).not.toHaveProperty('spotsRemaining')
    expect(updated.title).toBe('Tea Tasting — Example Event')
    expect(updated.status).toBe('active')
    expect(updated.priceLabel).toBe('Free for members')
  })

  it('adds registration to an event that had none', async () => {
    const updated = await updateEvent(2, { capacity: 10, spotsRemaining: 10 })
    expect(updated).toMatchObject({ capacity: 10, spotsRemaining: 10 })
  })

  it('never changes the id through an update', async () => {
    expect((await updateEvent(1, { id: 99, title: 'New title' })).id).toBe(1)
  })

  it('cancels and restores an event while keeping the record', async () => {
    const cancelled = await setEventStatus(1, 'cancelled')
    expect(cancelled).toMatchObject({ id: 1, status: 'cancelled', title: 'Tea Tasting — Example Event' })
    const afterCancel = await getEvents()
    expect(afterCancel).toHaveLength(seedEvents.length)
    expect(afterCancel.find((event) => event.id === 1).status).toBe('cancelled')
    expect(afterCancel.filter((event) => event.status === 'active')).toHaveLength(seedEvents.length - 1)
    expect(stored().events.find((event) => event.id === 1).status).toBe('cancelled')

    const restored = await setEventStatus(1, 'active')
    expect(restored.status).toBe('active')
    expect((await getEvents()).find((event) => event.id === 1).status).toBe('active')
  })

  it('numbers new events after the highest existing id, never reusing one', async () => {
    store({ version: 1, events: [{ ...newEvent, id: 7 }, { ...newEvent, id: 'legacy-a' }] })
    expect((await createEvent(newEvent)).id).toBe(8)
    expect((await createEvent(newEvent)).id).toBe(9)
  })

  it('keeps overlapping updates from overwriting each other', async () => {
    await Promise.all([setEventStatus(1, 'cancelled'), updateEvent(2, { title: 'Book Club, Renamed' })])
    const events = await getEvents()
    expect(events.find((event) => event.id === 1).status).toBe('cancelled')
    expect(events.find((event) => event.id === 2).title).toBe('Book Club, Renamed')
  })
})

describe('event service validation', () => {
  it.each([
    ['a blank title', { title: '  ' }],
    ['a blank location', { location: '' }],
    ['a blank description', { description: '' }],
    ['a missing category', { category: undefined }],
    ['a missing date', { date: '' }],
    ['a date that is not real', { date: '2026-02-30' }],
    ['a date in the wrong format', { date: '12/20/2026' }],
    ['an unknown status', { status: 'postponed' }],
    ['a capacity of zero', { capacity: 0, spotsRemaining: 0 }],
    ['a fractional capacity', { capacity: 2.5, spotsRemaining: 1 }],
    ['negative spots remaining', { capacity: 10, spotsRemaining: -1 }],
    ['more spots remaining than capacity', { capacity: 10, spotsRemaining: 11 }],
    ['a capacity without spots remaining', { capacity: 10 }],
  ])('rejects %s without saving', async (_label, fields) => {
    await expect(createEvent({ ...newEvent, ...fields })).rejects.toThrow('not valid')
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
    expect(await getEvents()).toHaveLength(seedEvents.length)
  })

  it('rejects an update that would make the event invalid and leaves it unchanged', async () => {
    await expect(updateEvent(1, { capacity: 3 })).rejects.toThrow('not valid')
    await expect(updateEvent(1, { date: 'soon' })).rejects.toThrow('not valid')
    expect((await getEvents())[0]).toMatchObject({ capacity: 20, spotsRemaining: 4, date: '2026-12-06' })
  })

  it('rejects an unknown id and an unknown status', async () => {
    await expect(updateEvent(999, { title: 'Nope' })).rejects.toThrow('not found')
    await expect(setEventStatus(999, 'cancelled')).rejects.toThrow('not found')
    await expect(setEventStatus(1, 'postponed')).rejects.toThrow('Unknown event status')
    await expect(setEventStatus(1, undefined)).rejects.toThrow('Unknown event status')
    expect((await getEvents())[0].status).toBe('active')
  })
})

describe('event service stored data', () => {
  const valid = { ...newEvent, id: 1 }

  it.each([
    ['broken JSON', '{bad json'],
    ['a stored array', []],
    ['an unknown version', { version: 2, events: [valid] }],
    ['events that are not a list', { version: 1, events: { 1: valid } }],
    ['an event with an invalid date', { version: 1, events: [{ ...valid, date: 'tomorrow' }] }],
    ['an event with an unknown status', { version: 1, events: [{ ...valid, status: 'paused' }] }],
    ['an event without a title', { version: 1, events: [{ ...valid, title: '' }] }],
    ['an event that is not an object', { version: 1, events: [valid, 'oops'] }],
    ['an event with impossible registration', { version: 1, events: [{ ...valid, capacity: 5, spotsRemaining: 6 }] }],
    ['duplicate ids', { version: 1, events: [valid, { ...valid, title: 'Copy' }, { ...valid, id: '1' }] }],
  ])('falls back to the seed events for %s', async (_label, value) => {
    store(value)
    const events = await getEvents()
    expect(events.map((event) => event.id)).toEqual(seedEvents.map((event) => event.id))
    expect(events[0].title).toBe('Tea Tasting — Example Event')
  })

  it('replaces corrupt data with a clean list on the next save', async () => {
    store('{bad json')
    await setEventStatus(1, 'cancelled')
    expect(stored().events).toHaveLength(seedEvents.length)
    expect((await getEvents())[0].status).toBe('cancelled')
  })

  it('treats a missing stored status as active and accepts an empty stored list', async () => {
    store({ version: 1, events: [valid] })
    expect((await getEvents())[0].status).toBe('active')
    store({ version: 1, events: [] })
    expect(await getEvents()).toEqual([])
  })

  it('falls back to the seed events when storage cannot be read', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    expect(await getEvents()).toHaveLength(seedEvents.length)
  })

  it('rejects when storage cannot be written, and nothing is saved', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    await expect(createEvent(newEvent)).rejects.toThrow('could not be saved')
    await expect(setEventStatus(1, 'cancelled')).rejects.toThrow('could not be saved')
    vi.restoreAllMocks()
    expect(await getEvents()).toHaveLength(seedEvents.length)
    expect((await getEvents())[0].status).toBe('active')
  })
})

describe('event date and time helpers', () => {
  it('parses dates as local calendar dates and rejects values that are not real dates', () => {
    const date = parseEventDate('2026-12-06')
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 11, 6])
    expect(date.getHours()).toBe(0)
    for (const value of ['2026-02-30', '2026-13-01', '2026-1-1', '', null, undefined, 20261206, '0050-01-01']) {
      expect(parseEventDate(value)).toBeNull()
    }
    expect(parseEventDate('2028-02-29')).not.toBeNull()
  })

  it.each([
    ['18:30', '20:00', '6:30 PM – 8:00 PM'],
    ['09:05', '11:00', '9:05 AM – 11:00 AM'],
    ['00:00', '12:00', '12:00 AM – 12:00 PM'],
    ['11:30', '13:15', '11:30 AM – 1:15 PM'],
    ['18:30', '', '6:30 PM'],
    ['18:30', undefined, '6:30 PM'],
    ['', '', 'Time to be announced'],
  ])('formats %s to %s as "%s"', (start, end, expected) => {
    expect(formatEventTime(start, end)).toBe(expected)
  })

  it('reads the formatted text back into 24-hour values', () => {
    expect(parseEventTime('6:30 PM – 8:00 PM')).toEqual({ start: '18:30', end: '20:00' })
    expect(parseEventTime('12:00 AM – 12:30 PM')).toEqual({ start: '00:00', end: '12:30' })
    expect(parseEventTime('6:30 PM')).toEqual({ start: '18:30', end: '' })
    expect(parseEventTime('6:30 PM - 8:00 PM')).toEqual({ start: '18:30', end: '20:00' })
    expect(parseEventTime(formatEventTime('09:05', '17:45'))).toEqual({ start: '09:05', end: '17:45' })
  })

  it.each(['Time to be announced', 'All day', '', '13:00 PM', '6:60 PM', '0:30 AM', null, undefined])(
    'does not read "%s" as a time',
    (value) => {
      expect(parseEventTime(value)).toBeNull()
    },
  )
})
