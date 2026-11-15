import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { events as seedEvents } from '../../../data/events.js'
import { EVENTS_STORAGE_KEY, createEvent, getEvents } from '../../../services/eventService.js'
import EventManagement from './EventManagement.jsx'

// Skip the simulated network delay so the tests stay fast.
vi.mock('../../../services/apiClient.js', async (importOriginal) => ({
  ...(await importOriginal()),
  mockResponse: (data) => Promise.resolve(structuredClone(data)),
}))

// The real service runs against localStorage. These wrappers only let a test replace one response.
vi.mock('../../../services/eventService.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getEvents: vi.fn(actual.getEvents), createEvent: vi.fn(actual.createEvent) }
})

const teaTasting = 'Tea Tasting — Example Event'
const bookClub = 'Tea Book Club — Example Event'

function seedStore(events) {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify({ version: 1, events }))
}

function storedEvents() {
  return JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY)).events
}

async function loadSection() {
  render(<EventManagement />)
  await screen.findByRole('button', { name: `Edit ${teaTasting}` })
}

function row(title) {
  return within(screen.getByRole('heading', { level: 3, name: title }).closest('li'))
}

function form() {
  return within(screen.getByRole('form'))
}

function setByRole(role, name, value) {
  fireEvent.change(form().getByRole(role, { name }), { target: { value } })
}

function setByLabel(label, value) {
  fireEvent.change(form().getByLabelText(label), { target: { value } })
}

function fillRequired() {
  setByRole('textbox', 'Title', 'Cupping Night')
  setByLabel(/^Date\b/, '2026-12-20')
  setByRole('textbox', 'Location', 'SoHo Tea')
  setByRole('textbox', 'Description', 'Taste three teas side by side.')
}

function openNewEvent() {
  fireEvent.click(screen.getByRole('button', { name: 'New event' }))
}

function openEdit(title) {
  fireEvent.click(screen.getByRole('button', { name: `Edit ${title}` }))
}

beforeEach(() => {
  vi.restoreAllMocks()
  getEvents.mockReset()
  createEvent.mockReset()
  localStorage.clear()
})
afterEach(() => vi.restoreAllMocks())

describe('event list', () => {
  it('lists events with date, time, location, status, and registration information', async () => {
    await loadSection()
    expect(screen.getByRole('heading', { level: 2, name: 'Events' })).toBeInTheDocument()
    const tasting = row(teaTasting)
    expect(tasting.getByText('Drink tasting')).toBeInTheDocument()
    expect(tasting.getByText('Sun, Dec 6, 2026')).toBeInTheDocument()
    expect(tasting.getByText('6:30 PM – 8:00 PM')).toBeInTheDocument()
    expect(tasting.getByText('SoHo Tea')).toBeInTheDocument()
    expect(tasting.getByText('Active')).toBeInTheDocument()
    expect(tasting.getByText('16 / 20 registered · 4 spots left')).toBeInTheDocument()

    const club = row(bookClub)
    expect(club.getByText('Book club')).toBeInTheDocument()
    expect(club.getByText('Time to be announced')).toBeInTheDocument()
    expect(club.getByText('Location to be announced')).toBeInTheDocument()
    expect(club.getByText('Active')).toBeInTheDocument()
    expect(club.getByText('No registration')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(seedEvents.length)
  })

  it('shows cancelled, full, and single-spot events with text, and keeps registration on cancelled events', async () => {
    const base = { category: 'Game night', date: '2026-12-12', time: '7:00 PM', location: 'Back room', description: 'Games.' }
    seedStore([
      { ...base, id: 1, title: 'Cancelled Night', status: 'cancelled', capacity: 8, spotsRemaining: 3 },
      { ...base, id: 2, title: 'Sold Out Night', capacity: 10, spotsRemaining: 0 },
      { ...base, id: 3, title: 'Almost Full Night', status: 'active', capacity: 5, spotsRemaining: 1 },
    ])
    render(<EventManagement />)
    await screen.findByRole('button', { name: 'Edit Sold Out Night' })
    expect(row('Cancelled Night').getByText('Cancelled')).toBeInTheDocument()
    expect(row('Cancelled Night').getByText('5 / 8 registered · 3 spots left')).toBeInTheDocument()
    expect(row('Sold Out Night').getByText('10 / 10 registered · Full')).toBeInTheDocument()
    expect(row('Sold Out Night').getByText('Active')).toBeInTheDocument()
    expect(row('Almost Full Night').getByText('4 / 5 registered · 1 spot left')).toBeInTheDocument()
  })

  it('sorts by date, then start time, with events that have no start time last', async () => {
    const base = { category: 'Book club', location: 'Window table', description: 'Reading.' }
    seedStore([
      { ...base, id: 1, title: 'Late Dec, time unknown', date: '2026-12-20', time: 'Time to be announced' },
      { ...base, id: 2, title: 'Late Dec, morning', date: '2026-12-20', time: '9:00 AM – 10:00 AM' },
      { ...base, id: 3, title: 'Early Dec', date: '2026-12-02', time: '5:00 PM – 6:00 PM' },
      { ...base, id: 4, title: 'Late Dec, afternoon', date: '2026-12-20', time: '1:00 PM' },
      { ...base, id: 5, title: 'Next year', date: '2027-01-03', time: '8:00 AM' },
    ])
    render(<EventManagement />)
    await screen.findByRole('button', { name: 'Edit Early Dec' })
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Early Dec',
      'Late Dec, morning',
      'Late Dec, afternoon',
      'Late Dec, time unknown',
      'Next year',
    ])
  })

  it('gives every action a name that includes the event title', async () => {
    await loadSection()
    for (const { title } of seedEvents) {
      expect(screen.getByRole('button', { name: `Edit ${title}` })).toBeEnabled()
      expect(screen.getByRole('button', { name: `Cancel event ${title}` })).toBeEnabled()
    }
  })

  it('shows a loading state and disables New event until events load', () => {
    getEvents.mockReturnValueOnce(new Promise(() => {}))
    render(<EventManagement />)
    expect(screen.getByText('Loading events…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New event' })).toBeDisabled()
  })

  it('shows an empty state and lets the first event be added', async () => {
    seedStore([])
    render(<EventManagement />)
    expect(await screen.findByText('No events yet. Select “New event” to add the first one.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New event' })).toBeEnabled()
    openNewEvent()
    fillRequired()
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(await screen.findByRole('button', { name: 'Edit Cupping Night' })).toBeInTheDocument()
    expect(screen.queryByText(/No events yet/)).not.toBeInTheDocument()
  })

  it('shows an error with a retry when events cannot be loaded', async () => {
    getEvents.mockRejectedValueOnce(new Error('Network error'))
    render(<EventManagement />)
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load events. Please try again.')
    expect(screen.getByRole('button', { name: 'New event' })).toBeDisabled()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('button', { name: `Edit ${teaTasting}` })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('treats an event without a status as active', async () => {
    getEvents.mockResolvedValueOnce([
      { id: 1, title: 'Plain Event', category: 'Book club', date: '2026-12-01', time: '', location: 'Window table', description: 'Reading.' },
    ])
    render(<EventManagement />)
    await screen.findByRole('button', { name: 'Edit Plain Event' })
    expect(row('Plain Event').getByText('Active')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel event Plain Event' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Edit Plain Event' }))
    expect(form().getByRole('combobox', { name: 'Status' })).toHaveValue('active')
  })

  it('treats a malformed response as an error', async () => {
    getEvents.mockResolvedValueOnce({ unexpected: true })
    render(<EventManagement />)
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load events.')
  })
})

describe('creating events', () => {
  it('opens the form with focus on the title and creates an event that is listed and saved', async () => {
    await loadSection()
    const opener = screen.getByRole('button', { name: 'New event' })
    fireEvent.click(opener)
    expect(screen.getByRole('form', { name: 'New event' })).toBeInTheDocument()
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveFocus()
    expect(form().getByRole('combobox', { name: 'Status' })).toHaveValue('active')
    expect(form().getByRole('checkbox', { name: 'Requires registration' })).not.toBeChecked()
    expect(form().queryByRole('spinbutton')).not.toBeInTheDocument()

    fillRequired()
    setByRole('combobox', 'Category', 'Book club')
    setByLabel('Start time', '19:00')
    setByLabel('End time', '20:30')
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))

    expect(await screen.findByText('Cupping Night added.')).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    await waitFor(() => expect(opener).toHaveFocus())

    const created = row('Cupping Night')
    expect(created.getByText('Book club')).toBeInTheDocument()
    expect(created.getByText('Sun, Dec 20, 2026')).toBeInTheDocument()
    expect(created.getByText('7:00 PM – 8:30 PM')).toBeInTheDocument()
    expect(created.getByText('Active')).toBeInTheDocument()
    expect(created.getByText('No registration')).toBeInTheDocument()

    expect(storedEvents().at(-1)).toEqual({
      id: seedEvents.length + 1,
      title: 'Cupping Night',
      category: 'Book club',
      date: '2026-12-20',
      time: '7:00 PM – 8:30 PM',
      location: 'SoHo Tea',
      description: 'Taste three teas side by side.',
      status: 'active',
    })
  })

  it('saves registration details, and the status chosen in the form', async () => {
    await loadSection()
    openNewEvent()
    fillRequired()
    setByRole('combobox', 'Status', 'cancelled')
    fireEvent.click(form().getByRole('checkbox', { name: 'Requires registration' }))
    setByRole('spinbutton', 'Capacity', '12')
    setByRole('spinbutton', 'Registered count', '3')
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    await screen.findByText('Cupping Night added.')
    const created = row('Cupping Night')
    expect(created.getByText('Cancelled')).toBeInTheDocument()
    expect(created.getByText('3 / 12 registered · 9 spots left')).toBeInTheDocument()
    expect(storedEvents().at(-1)).toMatchObject({ status: 'cancelled', capacity: 12, spotsRemaining: 9 })
  })

  it('saves "Time to be announced" and a start-only time when the end time is blank', async () => {
    await loadSection()
    openNewEvent()
    fillRequired()
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    await screen.findByText('Cupping Night added.')
    expect(row('Cupping Night').getByText('Time to be announced')).toBeInTheDocument()

    openNewEvent()
    fillRequired()
    setByRole('textbox', 'Title', 'Late Tasting')
    setByLabel('Start time', '21:15')
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    await screen.findByText('Late Tasting added.')
    expect(row('Late Tasting').getByText('9:15 PM')).toBeInTheDocument()
  })

  it('discards a draft without saving and returns focus to the button that opened it', async () => {
    await loadSection()
    const opener = screen.getByRole('button', { name: 'New event' })
    fireEvent.click(opener)
    setByRole('textbox', 'Title', 'Never saved')
    fireEvent.click(form().getByRole('button', { name: 'Discard changes' }))
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(screen.queryByText('Never saved')).not.toBeInTheDocument()
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
    fireEvent.click(opener)
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveValue('')
  })

  it('keeps the form and its values, and shows an error, when saving fails', async () => {
    await loadSection()
    openNewEvent()
    fillRequired()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('We couldn’t save this event. Please try again.')
    await waitFor(() => expect(alert).toHaveFocus())
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveValue('Cupping Night')
    expect(form().getByRole('button', { name: 'Create event' })).toBeEnabled()
    expect(screen.queryByRole('heading', { level: 3, name: 'Cupping Night' })).not.toBeInTheDocument()

    setItem.mockRestore()
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(await screen.findByText('Cupping Night added.')).toBeInTheDocument()
    expect(storedEvents().at(-1).title).toBe('Cupping Night')
  })

  it('blocks other edits and double submits while a save is in progress', async () => {
    let finishSave
    createEvent.mockReturnValueOnce(new Promise((resolve) => { finishSave = resolve }))
    await loadSection()
    openNewEvent()
    fillRequired()
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    const saving = await screen.findByRole('button', { name: 'Saving…' })
    expect(saving).toBeDisabled()
    expect(form().getByRole('textbox', { name: 'Title' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'New event' })).toBeDisabled()
    expect(screen.getByRole('button', { name: `Edit ${teaTasting}` })).toBeDisabled()
    finishSave({ id: 99, title: 'Cupping Night', category: 'Drink tasting', date: '2026-12-20', time: 'Time to be announced', location: 'SoHo Tea', description: 'x', status: 'active' })
    expect(await screen.findByText('Cupping Night added.')).toBeInTheDocument()
    expect(createEvent).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'New event' })).toBeEnabled()
  })
})

describe('validation', () => {
  it('requires a title, date, location, and description and moves focus to the first problem', async () => {
    await loadSection()
    openNewEvent()
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(form().getByText('Enter an event title.')).toBeInTheDocument()
    expect(form().getByText('Enter the event date.')).toBeInTheDocument()
    expect(form().getByText('Enter the event location.')).toBeInTheDocument()
    expect(form().getByText('Enter a description.')).toBeInTheDocument()
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveAttribute('aria-invalid', 'true')
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveAccessibleDescription('Enter an event title.')
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveFocus()
    expect(form().getByLabelText(/^Date\b/)).toHaveAttribute('aria-invalid', 'true')
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()

    setByRole('textbox', 'Title', '   ')
    setByRole('textbox', 'Location', '   ')
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(form().getByText('Enter an event title.')).toBeInTheDocument()
    expect(form().getByText('Enter the event location.')).toBeInTheDocument()
  })

  it('does not save an event until every problem is fixed', async () => {
    await loadSection()
    openNewEvent()
    setByRole('textbox', 'Title', 'Cupping Night')
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(form().queryByText('Enter an event title.')).not.toBeInTheDocument()
    expect(form().getByLabelText(/^Date\b/)).toHaveFocus()
    expect(screen.queryByRole('heading', { level: 3, name: 'Cupping Night' })).not.toBeInTheDocument()
    fillRequired()
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(await screen.findByText('Cupping Night added.')).toBeInTheDocument()
  })

  it.each([
    ['an end time equal to the start time', '18:00', '18:00', 'End time', 'End time must be after the start time.'],
    ['an end time before the start time', '18:00', '17:59', 'End time', 'End time must be after the start time.'],
    ['an end time without a start time', '', '17:00', 'Start time', 'Enter a start time, or clear the end time.'],
  ])('rejects %s', async (_label, start, end, invalidField, message) => {
    await loadSection()
    openNewEvent()
    fillRequired()
    setByLabel('Start time', start)
    setByLabel('End time', end)
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(form().getByText(message)).toBeInTheDocument()
    expect(form().getByLabelText(invalidField)).toHaveAttribute('aria-invalid', 'true')
    expect(form().getByLabelText(invalidField)).toHaveFocus()
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
  })

  it('accepts an end time one minute after the start time', async () => {
    await loadSection()
    openNewEvent()
    fillRequired()
    setByLabel('Start time', '18:00')
    setByLabel('End time', '18:01')
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    await screen.findByText('Cupping Night added.')
    expect(row('Cupping Night').getByText('6:00 PM – 6:01 PM')).toBeInTheDocument()
  })

  it.each(['', '0', '-3', '2.5', 'abc'])('rejects a capacity of "%s"', async (capacity) => {
    await loadSection()
    openNewEvent()
    fillRequired()
    fireEvent.click(form().getByRole('checkbox', { name: 'Requires registration' }))
    setByRole('spinbutton', 'Capacity', capacity)
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(form().getByText('Enter a whole number of 1 or more.')).toBeInTheDocument()
    expect(form().getByRole('spinbutton', { name: 'Capacity' })).toHaveAttribute('aria-invalid', 'true')
    expect(form().getByRole('spinbutton', { name: 'Capacity' })).toHaveFocus()
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
  })

  it.each(['', '-1', '11', '1.5'])('rejects a registered count of "%s" for a capacity of 10', async (registered) => {
    await loadSection()
    openNewEvent()
    fillRequired()
    fireEvent.click(form().getByRole('checkbox', { name: 'Requires registration' }))
    setByRole('spinbutton', 'Capacity', '10')
    setByRole('spinbutton', 'Registered count', registered)
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    expect(form().getByText('Enter a whole number from 0 to 10.')).toBeInTheDocument()
    expect(form().getByRole('spinbutton', { name: 'Registered count' })).toHaveAttribute('aria-invalid', 'true')
    expect(form().queryByText('Enter a whole number of 1 or more.')).not.toBeInTheDocument()
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
  })

  it.each([
    ['0', '0 / 10 registered · 10 spots left'],
    ['10', '10 / 10 registered · Full'],
  ])('accepts a registered count of %s for a capacity of 10', async (registered, summary) => {
    await loadSection()
    openNewEvent()
    fillRequired()
    fireEvent.click(form().getByRole('checkbox', { name: 'Requires registration' }))
    setByRole('spinbutton', 'Capacity', '10')
    setByRole('spinbutton', 'Registered count', registered)
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    await screen.findByText('Cupping Night added.')
    expect(row('Cupping Night').getByText(summary)).toBeInTheDocument()
  })

  it('does not check registration fields when registration is switched off', async () => {
    await loadSection()
    openNewEvent()
    fillRequired()
    fireEvent.click(form().getByRole('checkbox', { name: 'Requires registration' }))
    setByRole('spinbutton', 'Capacity', '-4')
    fireEvent.click(form().getByRole('checkbox', { name: 'Requires registration' }))
    fireEvent.click(form().getByRole('button', { name: 'Create event' }))
    await screen.findByText('Cupping Night added.')
    expect(row('Cupping Night').getByText('No registration')).toBeInTheDocument()
    expect(storedEvents().at(-1)).not.toHaveProperty('capacity')
  })
})

describe('editing events', () => {
  it('prefills every field, including times read back from the display text and registration', async () => {
    await loadSection()
    openEdit(teaTasting)
    expect(screen.getByRole('form', { name: 'Edit event' })).toBeInTheDocument()
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveFocus()
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveValue(teaTasting)
    expect(form().getByRole('combobox', { name: 'Category' })).toHaveValue('Drink tasting')
    expect(form().getByRole('combobox', { name: 'Status' })).toHaveValue('active')
    expect(form().getByLabelText(/^Date\b/)).toHaveValue('2026-12-06')
    expect(form().getByLabelText('Start time')).toHaveValue('18:30')
    expect(form().getByLabelText('End time')).toHaveValue('20:00')
    expect(form().getByRole('textbox', { name: 'Location' })).toHaveValue('SoHo Tea')
    expect(form().getByRole('textbox', { name: 'Description' })).toHaveValue(seedEvents[0].description)
    expect(form().getByRole('checkbox', { name: 'Requires registration' })).toBeChecked()
    expect(form().getByRole('spinbutton', { name: 'Capacity' })).toHaveValue(20)
    expect(form().getByRole('spinbutton', { name: 'Registered count' })).toHaveValue(16)
    expect(form().getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('prefills an event without times or registration', async () => {
    await loadSection()
    openEdit(bookClub)
    expect(form().getByLabelText('Start time')).toHaveValue('')
    expect(form().getByLabelText('End time')).toHaveValue('')
    expect(form().getByRole('checkbox', { name: 'Requires registration' })).not.toBeChecked()
    expect(form().queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('saves changes, keeps unknown fields, and returns focus to the Edit button', async () => {
    seedStore([
      { ...seedEvents[0], image: '/tea.jpg', ribbon: 'Staff pick' },
      { ...seedEvents[1], image: '/book.jpg' },
    ])
    await loadSection()
    const opener = screen.getByRole('button', { name: `Edit ${teaTasting}` })
    fireEvent.click(opener)
    setByRole('textbox', 'Title', 'Tea Tasting, Second Round')
    setByRole('textbox', 'Location', 'Back room')
    setByLabel('End time', '21:00')
    setByRole('spinbutton', 'Registered count', '20')
    fireEvent.click(form().getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Tea Tasting, Second Round updated.')).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Tea Tasting, Second Round' })).toHaveFocus())
    expect(screen.queryByText(teaTasting)).not.toBeInTheDocument()
    const updated = row('Tea Tasting, Second Round')
    expect(updated.getByText('Back room')).toBeInTheDocument()
    expect(updated.getByText('6:30 PM – 9:00 PM')).toBeInTheDocument()
    expect(updated.getByText('20 / 20 registered · Full')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    expect(storedEvents()[0]).toMatchObject({
      id: 1,
      title: 'Tea Tasting, Second Round',
      location: 'Back room',
      time: '6:30 PM – 9:00 PM',
      capacity: 20,
      spotsRemaining: 0,
      priceLabel: 'Free for members',
      image: '/tea.jpg',
      ribbon: 'Staff pick',
    })
    expect(storedEvents()[1]).toMatchObject({ id: 2, title: bookClub, image: '/book.jpg' })
    const [first] = await getEvents()
    expect(first).toMatchObject({ priceLabel: 'Free for members', image: '/tea.jpg', ribbon: 'Staff pick' })
  })

  it('keeps the bundled placeholder image and public fields when saving seeded events', async () => {
    await loadSection()
    openEdit(teaTasting)
    setByRole('textbox', 'Location', 'Corner table')
    fireEvent.click(form().getByRole('button', { name: 'Save changes' }))
    await screen.findByText(`${teaTasting} updated.`)
    const [first] = await getEvents()
    expect(first).toMatchObject({ location: 'Corner table', image: seedEvents[0].image, priceLabel: 'Free for members', capacity: 20, spotsRemaining: 4 })
  })

  it('removes registration when it is switched off, and restores the typed values if switched back on', async () => {
    await loadSection()
    openEdit(teaTasting)
    const toggle = form().getByRole('checkbox', { name: 'Requires registration' })
    fireEvent.click(toggle)
    expect(form().queryByRole('spinbutton')).not.toBeInTheDocument()
    fireEvent.click(toggle)
    expect(form().getByRole('spinbutton', { name: 'Capacity' })).toHaveValue(20)
    fireEvent.click(toggle)
    fireEvent.click(form().getByRole('button', { name: 'Save changes' }))
    await screen.findByText(`${teaTasting} updated.`)
    expect(row(teaTasting).getByText('No registration')).toBeInTheDocument()
    expect(storedEvents()[0]).not.toHaveProperty('capacity')
    expect(storedEvents()[0]).not.toHaveProperty('spotsRemaining')
    expect(storedEvents()[0].priceLabel).toBe('Free for members')
  })

  it('adds registration to an event that had none', async () => {
    await loadSection()
    openEdit(bookClub)
    fireEvent.click(form().getByRole('checkbox', { name: 'Requires registration' }))
    setByRole('spinbutton', 'Capacity', '15')
    fireEvent.click(form().getByRole('button', { name: 'Save changes' }))
    await screen.findByText(`${bookClub} updated.`)
    expect(row(bookClub).getByText('0 / 15 registered · 15 spots left')).toBeInTheDocument()
  })

  it('can mark an event cancelled or active from the form status', async () => {
    await loadSection()
    openEdit(teaTasting)
    setByRole('combobox', 'Status', 'cancelled')
    fireEvent.click(form().getByRole('button', { name: 'Save changes' }))
    await screen.findByText(`${teaTasting} updated.`)
    expect(row(teaTasting).getByText('Cancelled')).toBeInTheDocument()
    openEdit(teaTasting)
    expect(form().getByRole('combobox', { name: 'Status' })).toHaveValue('cancelled')
  })

  it('keeps a time that the time inputs cannot show, until a start time is entered', async () => {
    seedStore([{ ...seedEvents[1], time: 'All day' }])
    render(<EventManagement />)
    await screen.findByRole('button', { name: `Edit ${bookClub}` })
    openEdit(bookClub)
    expect(form().getByLabelText('Start time')).toHaveValue('')
    expect(form().getByLabelText('Start time')).toHaveAccessibleDescription(/Current time: “All day”/)
    fireEvent.click(form().getByRole('button', { name: 'Save changes' }))
    await screen.findByText(`${bookClub} updated.`)
    expect(row(bookClub).getByText('All day')).toBeInTheDocument()

    openEdit(bookClub)
    setByLabel('Start time', '10:00')
    fireEvent.click(form().getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(row(bookClub).getByText('10:00 AM')).toBeInTheDocument())
  })

  it('validates edits the same way as new events', async () => {
    await loadSection()
    openEdit(teaTasting)
    setByRole('textbox', 'Title', '')
    setByRole('spinbutton', 'Registered count', '21')
    fireEvent.click(form().getByRole('button', { name: 'Save changes' }))
    expect(form().getByText('Enter an event title.')).toBeInTheDocument()
    expect(form().getByText('Enter a whole number from 0 to 20.')).toBeInTheDocument()
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
    expect(row(teaTasting).getByText('16 / 20 registered · 4 spots left')).toBeInTheDocument()
  })

  it('discards edits and returns focus to the Edit button', async () => {
    await loadSection()
    const opener = screen.getByRole('button', { name: `Edit ${teaTasting}` })
    fireEvent.click(opener)
    setByRole('textbox', 'Title', 'Unsaved name')
    fireEvent.click(form().getByRole('button', { name: 'Discard changes' }))
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(screen.getByRole('heading', { level: 3, name: teaTasting })).toBeInTheDocument()
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
  })

  it('moves the form to the event that was chosen last, and returns focus to that Edit button', async () => {
    await loadSection()
    openEdit(teaTasting)
    setByRole('textbox', 'Title', 'Unsaved name')
    const second = screen.getByRole('button', { name: `Edit ${bookClub}` })
    fireEvent.click(second)
    expect(screen.getAllByRole('form')).toHaveLength(1)
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveValue(bookClub)
    fireEvent.click(form().getByRole('button', { name: 'Discard changes' }))
    expect(second).toHaveFocus()
  })
})

describe('cancelling and restoring events', () => {
  it('asks for confirmation inline, without browser dialogs, and keeps the event if dismissed', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    await loadSection()
    const trigger = screen.getByRole('button', { name: `Cancel event ${teaTasting}` })
    fireEvent.click(trigger)
    const confirmation = screen.getByRole('group', { name: `Cancel “${teaTasting}”? It will be marked as cancelled. You can restore it later.` })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(within(confirmation).getByRole('button', { name: 'Keep event' })).toHaveFocus()
    expect(row(teaTasting).getByText('Active')).toBeInTheDocument()

    fireEvent.click(within(confirmation).getByRole('button', { name: 'Keep event' }))
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(row(teaTasting).getByText('Active')).toBeInTheDocument()
    expect(localStorage.getItem(EVENTS_STORAGE_KEY)).toBeNull()
    expect(confirm).not.toHaveBeenCalled()
    expect(alert).not.toHaveBeenCalled()
  })

  it('cancels after confirmation, announces it, keeps the record, and then restores it', async () => {
    await loadSection()
    fireEvent.click(screen.getByRole('button', { name: `Cancel event ${teaTasting}` }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }))

    expect(await screen.findByText(`${teaTasting} is now cancelled.`)).toBeInTheDocument()
    expect(screen.getAllByRole('status').some((status) => status.textContent === `${teaTasting} is now cancelled.`)).toBe(true)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(row(teaTasting).getByText('Cancelled')).toBeInTheDocument()
    expect(row(teaTasting).queryByText('Active')).not.toBeInTheDocument()
    expect(row(teaTasting).getByText('16 / 20 registered · 4 spots left')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(seedEvents.length)
    expect(storedEvents()).toHaveLength(seedEvents.length)
    expect(storedEvents()[0]).toMatchObject({ id: 1, status: 'cancelled', title: teaTasting })
    expect(screen.queryByRole('button', { name: `Cancel event ${teaTasting}` })).not.toBeInTheDocument()
    const restore = screen.getByRole('button', { name: `Restore event ${teaTasting}` })
    await waitFor(() => expect(restore).toHaveFocus())

    fireEvent.click(restore)
    expect(await screen.findByText(`${teaTasting} is now active.`)).toBeInTheDocument()
    expect(row(teaTasting).getByText('Active')).toBeInTheDocument()
    expect(storedEvents()[0].status).toBe('active')
    const cancel = screen.getByRole('button', { name: `Cancel event ${teaTasting}` })
    await waitFor(() => expect(cancel).toHaveFocus())
  })

  it('restores an event that was already cancelled in storage, without asking', async () => {
    seedStore([{ ...seedEvents[1], status: 'cancelled' }])
    render(<EventManagement />)
    fireEvent.click(await screen.findByRole('button', { name: `Restore event ${bookClub}` }))
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(await screen.findByText(`${bookClub} is now active.`)).toBeInTheDocument()
    expect(storedEvents()[0].status).toBe('active')
  })

  it('shows an error and leaves the status unchanged when cancelling fails', async () => {
    await loadSection()
    fireEvent.click(screen.getByRole('button', { name: `Cancel event ${teaTasting}` }))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(`We couldn’t cancel ${teaTasting}. Please try again.`)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(row(teaTasting).getByText('Active')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: `Cancel event ${teaTasting}` })).toHaveFocus())
  })

  it('shows an error and leaves the status unchanged when restoring fails', async () => {
    seedStore([{ ...seedEvents[1], status: 'cancelled' }])
    render(<EventManagement />)
    const restore = await screen.findByRole('button', { name: `Restore event ${bookClub}` })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    fireEvent.click(restore)
    expect(await screen.findByRole('alert')).toHaveTextContent(`We couldn’t restore ${bookClub}. Please try again.`)
    expect(row(bookClub).getByText('Cancelled')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: `Restore event ${bookClub}` })).toBeEnabled())
  })

  it('closes an open confirmation when the form is opened, and locks the status action of the event being edited', async () => {
    await loadSection()
    fireEvent.click(screen.getByRole('button', { name: `Cancel event ${teaTasting}` }))
    expect(screen.getByRole('group', { name: /^Cancel “/ })).toBeInTheDocument()
    openEdit(bookClub)
    // The form's own fieldsets are also groups, so look for the confirmation by name.
    expect(screen.queryByRole('group', { name: /^Cancel “/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Cancel event ${bookClub}` })).toBeDisabled()
    expect(screen.getByRole('button', { name: `Cancel event ${teaTasting}` })).toBeEnabled()
  })

  it('keeps unsaved form values separate from a status change on another event', async () => {
    await loadSection()
    openEdit(teaTasting)
    setByRole('textbox', 'Title', 'Draft title')
    fireEvent.click(screen.getByRole('button', { name: `Cancel event ${bookClub}` }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }))
    expect(await screen.findByText(`${bookClub} is now cancelled.`)).toBeInTheDocument()
    expect(form().getByRole('textbox', { name: 'Title' })).toHaveValue('Draft title')
    expect(storedEvents().find((event) => event.id === 1).status).toBe('active')
  })
})
