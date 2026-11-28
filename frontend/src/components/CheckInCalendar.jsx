/*makes the calendar from react not hardcoded*/
import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './CheckInCalendar.css'
import { mockCheckIns, mockMissedDates } from '../data/checkIns.js'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })
const dayStatuses = {
  'checked-in': { icon: Check, label: 'Checked in', legend: 'Check-in' },
  missed: { icon: X, label: 'Missed week', legend: 'Missed week' },
}

export default function CheckInCalendar() {
  const checkInDates = new Set(mockCheckIns.map((checkIn) => checkIn.date))
  const missedDates = new Set(mockMissedDates)

  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const monthTitle = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  const changeMonth = (amount) => {
    setCurrentMonth((previousMonth) => {
      return new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth() + amount,
        1
      )
    })
  }

  return (
    <section className="checkin-calendar">
      <div className="checkin-calendar-header">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>

        <h2>{monthTitle}</h2>

        <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>


      <div className="checkin-weekdays">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="checkin-calendar-grid">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="checkin-day" aria-hidden="true" />
          }

          const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const status = checkInDates.has(date) ? 'checked-in' : missedDates.has(date) ? 'missed' : ''
          const statusLabel = dayStatuses[status]?.label ?? 'No check-in recorded'
          const StatusIcon = dayStatuses[status]?.icon

          return (
            <time key={day} dateTime={date} className={`checkin-day ${status}`}>
              <span className="checkin-day__label">
                {`${dateFormatter.format(new Date(year, month, day))}: ${statusLabel}`}
              </span>
              <span className="checkin-day__visual" aria-hidden="true">
                {day}
                {StatusIcon && <StatusIcon className="checkin-status-icon" />}
              </span>
            </time>
          )
        })}
      </div>
      <div className="checkin-legend">
        {Object.entries(dayStatuses).map(([status, { icon: StatusIcon, legend }]) => (
          <div key={status} className="checkin-legend-item">
            <span className={`checkin-legend-symbol ${status}`} aria-hidden="true">
              <StatusIcon className="checkin-status-icon" />
            </span>
            <span>{legend}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
