import { fireEvent, render, screen } from '@testing-library/react'
import CheckInCalendar from './CheckInCalendar.jsx'

describe('CheckInCalendar', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('associates each date with its status and uses the legend symbols on marked days', () => {
    vi.setSystemTime(new Date(2026, 10, 15, 12))
    render(<CheckInCalendar />)

    const checkedIn = screen.getByText('Tuesday, November 3, 2026: Checked in').closest('time')
    const missed = screen.getByText('Saturday, November 7, 2026: Missed week').closest('time')
    const unmarked = screen.getByText('Sunday, November 1, 2026: No check-in recorded').closest('time')
    const checkInSymbol = screen.getByText('Check-in', { exact: true }).parentElement.querySelector('svg')
    const missedSymbol = screen.getByText('Missed week', { exact: true }).parentElement.querySelector('svg')

    expect(checkedIn).toHaveAttribute('datetime', '2026-11-03')
    expect(missed).toHaveAttribute('datetime', '2026-11-07')
    expect(unmarked).toHaveAttribute('datetime', '2026-11-01')
    expect(checkedIn.querySelector('svg')).toHaveAttribute('class', checkInSymbol.getAttribute('class'))
    expect(missed.querySelector('svg')).toHaveAttribute('class', missedSymbol.getAttribute('class'))
    expect(checkInSymbol.getAttribute('class')).not.toBe(missedSymbol.getAttribute('class'))
    expect(unmarked.querySelector('svg')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('updates the full date and status when the month changes', () => {
    vi.setSystemTime(new Date(2026, 10, 15, 12))
    render(<CheckInCalendar />)

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))

    expect(screen.queryByText('Tuesday, November 3, 2026: Checked in')).not.toBeInTheDocument()
    expect(screen.getByText('Thursday, December 3, 2026: No check-in recorded')).toBeInTheDocument()
  })
})
